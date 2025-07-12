const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, adminOnly, instructorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/enrollments
// @desc    Get all enrollments (Admin only)
// @access  Private (Admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      courseId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (userId) query.user = userId;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enrollments = await Enrollment.find(query)
      .populate('user', 'name email profilePicture')
      .populate('course', 'title thumbnail price instructor category')
      .populate('course.instructor', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    res.json({
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/pending
// @desc    Get pending enrollments (Admin only)
// @access  Private (Admin)
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const enrollments = await Enrollment.find({ status: 'pending' })
      .populate('user', 'name email profilePicture phone')
      .populate('course', 'title thumbnail price instructor category')
      .populate('course.instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments({ status: 'pending' });

    res.json({
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get pending enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/enrollments
// @desc    Create enrollment request
// @access  Private (Students)
router.post('/', [
  auth,
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId, notes } = req.body;

    // Check if course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found or inactive' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        message: 'You are already enrolled in this course',
        enrollment: {
          status: existingEnrollment.status,
          enrolledAt: existingEnrollment.enrolledAt
        }
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: courseId,
      notes: notes || ''
    });

    await enrollment.save();

    // Notify admin about new enrollment request
    const admins = await User.find({ role: 'admin', isActive: true });
    const notificationPromises = admins.map(admin => 
      admin.addNotification(
        'New Enrollment Request',
        `${req.user.name} has requested enrollment in ${course.title}`,
        'info'
      )
    );
    await Promise.all(notificationPromises);

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title thumbnail price instructor')
      .populate('course.instructor', 'name');

    res.status(201).json({
      message: 'Enrollment request submitted successfully. Please wait for admin approval.',
      enrollment: populatedEnrollment
    });

  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment creation' });
  }
});

// @route   PUT /api/enrollments/:id/approve
// @desc    Approve enrollment (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({ message: 'Enrollment is not pending' });
    }

    enrollment.status = 'approved';
    enrollment.approvedAt = new Date();
    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(enrollment.course._id, {
      $inc: { enrollmentCount: 1 }
    });

    // Notify user about approval
    await enrollment.user.addNotification(
      'Enrollment Approved',
      `Your enrollment in ${enrollment.course.title} has been approved. You can now access the course content.`,
      'success'
    );

    res.json({
      message: 'Enrollment approved successfully',
      enrollment
    });

  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment approval' });
  }
});

// @route   PUT /api/enrollments/:id/reject
// @desc    Reject enrollment (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', [
  auth,
  adminOnly,
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const { reason } = req.body;

    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({ message: 'Enrollment is not pending' });
    }

    enrollment.status = 'rejected';
    enrollment.notes = reason || enrollment.notes;
    await enrollment.save();

    // Notify user about rejection
    const message = reason 
      ? `Your enrollment in ${enrollment.course.title} has been rejected. Reason: ${reason}`
      : `Your enrollment in ${enrollment.course.title} has been rejected.`;

    await enrollment.user.addNotification(
      'Enrollment Rejected',
      message,
      'warning'
    );

    res.json({
      message: 'Enrollment rejected successfully',
      enrollment
    });

  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment rejection' });
  }
});

// @route   GET /api/enrollments/my
// @desc    Get current user's enrollments
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title thumbnail price instructor category rating duration')
      .populate('course.instructor', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    // Add progress information
    const enrollmentsWithProgress = enrollments.map(enrollment => {
      const enrollmentObj = enrollment.toObject();
      enrollmentObj.progressPercentage = enrollment.progress;
      enrollmentObj.timeSpentHours = Math.round(enrollment.totalTimeSpent / 60 * 10) / 10;
      return enrollmentObj;
    });

    res.json({
      enrollments: enrollmentsWithProgress,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/:id
// @desc    Get enrollment by ID
// @access  Private (Admin, Instructor, or Owner)
router.get('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('course', 'title description instructor modules')
      .populate('course.instructor', 'name email profilePicture');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check access permissions
    const isOwner = enrollment.user._id.toString() === req.user._id.toString();
    const isInstructor = req.user.role === 'instructor' && 
                        enrollment.course.instructor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ enrollment });

  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/enrollments/:id/complete-lesson
// @desc    Mark lesson as completed
// @access  Private (Enrolled students only)
router.post('/:id/complete-lesson', [
  auth,
  body('moduleId')
    .isMongoId()
    .withMessage('Valid module ID is required'),
  body('lessonId')
    .isMongoId()
    .withMessage('Valid lesson ID is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
], async (req, res) => {
  try {
    const { moduleId, lessonId, timeSpent = 0 } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns this enrollment
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if enrollment is approved
    if (enrollment.status !== 'approved') {
      return res.status(400).json({ message: 'Enrollment must be approved to complete lessons' });
    }

    await enrollment.completeLesson(moduleId, lessonId, timeSpent);

    res.json({
      message: 'Lesson marked as completed',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ message: 'Server error during lesson completion' });
  }
});

// @route   POST /api/enrollments/:id/submit-quiz
// @desc    Submit quiz answers
// @access  Private (Enrolled students only)
router.post('/:id/submit-quiz', [
  auth,
  body('moduleId')
    .isMongoId()
    .withMessage('Valid module ID is required'),
  body('lessonId')
    .isMongoId()
    .withMessage('Valid lesson ID is required'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('timeSpent')
    .isInt({ min: 1 })
    .withMessage('Time spent is required')
], async (req, res) => {
  try {
    const { moduleId, lessonId, answers, timeSpent } = req.body;

    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if user owns this enrollment
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if enrollment is approved
    if (enrollment.status !== 'approved') {
      return res.status(400).json({ message: 'Enrollment must be approved to submit quizzes' });
    }

    // Find the quiz in the course
    const module = enrollment.course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lesson = module.lessons.id(lessonId);
    if (!lesson || lesson.type !== 'quiz') {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = lesson.quiz.questions[index];
      const isCorrect = question && question.correctAnswer === answer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect
      };
    });

    const totalQuestions = lesson.quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= lesson.quiz.passingScore;

    const quizResult = {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers: processedAnswers,
      passed
    };

    await enrollment.addQuizResult(moduleId, lessonId, quizResult);

    // If quiz passed, mark lesson as completed
    if (passed) {
      await enrollment.completeLesson(moduleId, lessonId, timeSpent);
    }

    res.json({
      message: passed ? 'Quiz passed successfully!' : 'Quiz completed. You can retake it to improve your score.',
      result: {
        score,
        totalQuestions,
        correctAnswers,
        passed,
        passingScore: lesson.quiz.passingScore
      },
      progress: enrollment.progress
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error during quiz submission' });
  }
});

// @route   GET /api/enrollments/stats/overview
// @desc    Get enrollment statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });
    const approvedEnrollments = await Enrollment.countDocuments({ status: 'approved' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const rejectedEnrollments = await Enrollment.countDocuments({ status: 'rejected' });

    const enrollmentsByStatus = await Enrollment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentEnrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const topCourses = await Enrollment.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      {
        $group: {
          _id: '$course',
          enrollmentCount: { $sum: 1 }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          title: '$course.title',
          enrollmentCount: 1
        }
      }
    ]);

    res.json({
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      completedEnrollments,
      rejectedEnrollments,
      enrollmentsByStatus,
      recentEnrollments,
      topCourses
    });

  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
