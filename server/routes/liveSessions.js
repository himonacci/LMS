const express = require('express');
const { body, validationResult } = require('express-validator');
const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, adminOnly, instructorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/live-sessions
// @desc    Get all live sessions
// @access  Private (Admin/Instructor)
router.get('/', auth, instructorOrAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      courseId,
      instructorId,
      upcoming = false
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (instructorId) query.instructor = instructorId;
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    // If instructor, only show their sessions
    if (req.user.role === 'instructor') {
      query.instructor = req.user._id;
    }

    const sessions = await LiveSession.find(query)
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name profilePicture')
      .sort({ scheduledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LiveSession.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get live sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/live-sessions/my
// @desc    Get user's live sessions (enrolled courses)
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { upcoming = false, page = 1, limit = 10 } = req.query;

    // Get user's enrolled courses
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({
      user: req.user._id,
      status: 'approved'
    }).select('course');

    const courseIds = enrollments.map(enrollment => enrollment.course);

    // Build query for sessions
    const query = {
      course: { $in: courseIds },
      isActive: true
    };

    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    const sessions = await LiveSession.find(query)
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name profilePicture')
      .sort({ scheduledAt: upcoming === 'true' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LiveSession.countDocuments(query);

    // Add user participation status
    const sessionsWithStatus = sessions.map(session => {
      const sessionObj = session.toObject();
      const participation = session.participants.find(
        p => p.user.toString() === req.user._id.toString()
      );
      sessionObj.userParticipation = participation || null;
      return sessionObj;
    });

    res.json({
      sessions: sessionsWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get my live sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/live-sessions/:id
// @desc    Get live session by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id)
      .populate('course', 'title description thumbnail')
      .populate('instructor', 'name profilePicture bio')
      .populate('participants.user', 'name profilePicture');

    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Check if user can access this session
    const canJoin = await session.canUserJoin(req.user._id);
    
    const sessionObj = session.toObject();
    sessionObj.canJoin = canJoin.canJoin;
    sessionObj.joinReason = canJoin.reason;

    // Add user participation status
    const participation = session.participants.find(
      p => p.user._id.toString() === req.user._id.toString()
    );
    sessionObj.userParticipation = participation || null;

    res.json({ session: sessionObj });

  } catch (error) {
    console.error('Get live session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/live-sessions
// @desc    Create new live session (Admin only)
// @access  Private (Admin)
router.post('/', [
  auth,
  adminOnly,
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('course')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('instructor')
    .isMongoId()
    .withMessage('Valid instructor ID is required'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
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

    const {
      title,
      description,
      course,
      instructor,
      scheduledAt,
      duration,
      maxParticipants,
      features
    } = req.body;

    // Verify course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify instructor exists and has instructor role
    const instructorDoc = await User.findById(instructor);
    if (!instructorDoc || instructorDoc.role !== 'instructor') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    // Check if scheduled time is in the future
    if (new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    const session = new LiveSession({
      title,
      description,
      course,
      instructor,
      scheduledAt: new Date(scheduledAt),
      duration,
      maxParticipants: maxParticipants || 100,
      features: features || {}
    });

    await session.save();

    const populatedSession = await LiveSession.findById(session._id)
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name profilePicture');

    res.status(201).json({
      message: 'Live session created successfully',
      session: populatedSession
    });

  } catch (error) {
    console.error('Create live session error:', error);
    res.status(500).json({ message: 'Server error during session creation' });
  }
});

// @route   PUT /api/live-sessions/:id
// @desc    Update live session (Admin or Instructor)
// @access  Private
router.put('/:id', [
  auth,
  instructorOrAdmin,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
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

    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Check if user is admin or the session instructor
    if (req.user.role !== 'admin' && session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow updates to live or ended sessions
    if (session.status === 'live' || session.status === 'ended') {
      return res.status(400).json({ message: 'Cannot update live or ended sessions' });
    }

    const updateFields = [
      'title', 'description', 'scheduledAt', 'duration', 
      'maxParticipants', 'features', 'sessionNotes'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'scheduledAt') {
          session[field] = new Date(req.body[field]);
        } else {
          session[field] = req.body[field];
        }
      }
    });

    // Only admin can change instructor and active status
    if (req.user.role === 'admin') {
      if (req.body.instructor) session.instructor = req.body.instructor;
      if (req.body.isActive !== undefined) session.isActive = req.body.isActive;
    }

    await session.save();

    const updatedSession = await LiveSession.findById(session._id)
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name profilePicture');

    res.json({
      message: 'Live session updated successfully',
      session: updatedSession
    });

  } catch (error) {
    console.error('Update live session error:', error);
    res.status(500).json({ message: 'Server error during session update' });
  }
});

// @route   POST /api/live-sessions/:id/start
// @desc    Start live session (Instructor or Admin)
// @access  Private
router.post('/:id/start', auth, instructorOrAdmin, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Check if user is admin or the session instructor
    if (req.user.role !== 'admin' && session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Session is not scheduled' });
    }

    await session.startSession();

    res.json({
      message: 'Live session started successfully',
      session: {
        id: session._id,
        status: session.status,
        roomId: session.roomId,
        actualStartTime: session.actualStartTime
      }
    });

  } catch (error) {
    console.error('Start live session error:', error);
    res.status(500).json({ message: 'Server error during session start' });
  }
});

// @route   POST /api/live-sessions/:id/end
// @desc    End live session (Instructor or Admin)
// @access  Private
router.post('/:id/end', auth, instructorOrAdmin, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Check if user is admin or the session instructor
    if (req.user.role !== 'admin' && session.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (session.status !== 'live') {
      return res.status(400).json({ message: 'Session is not live' });
    }

    await session.endSession();

    res.json({
      message: 'Live session ended successfully',
      session: {
        id: session._id,
        status: session.status,
        actualEndTime: session.actualEndTime,
        actualDuration: session.actualDuration,
        attendanceCount: session.attendanceCount
      }
    });

  } catch (error) {
    console.error('End live session error:', error);
    res.status(500).json({ message: 'Server error during session end' });
  }
});

// @route   POST /api/live-sessions/:id/join
// @desc    Join live session
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Check if user can join
    const canJoin = await session.canUserJoin(req.user._id);
    if (!canJoin.canJoin) {
      return res.status(403).json({ message: canJoin.reason });
    }

    // Add user as participant
    await session.addParticipant(req.user._id);

    res.json({
      message: 'Joined session successfully',
      roomId: session.roomId,
      sessionInfo: {
        title: session.title,
        instructor: session.instructor,
        features: session.features
      }
    });

  } catch (error) {
    console.error('Join live session error:', error);
    res.status(500).json({ message: 'Server error during session join' });
  }
});

// @route   POST /api/live-sessions/:id/leave
// @desc    Leave live session
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    await session.removeParticipant(req.user._id);

    res.json({ message: 'Left session successfully' });

  } catch (error) {
    console.error('Leave live session error:', error);
    res.status(500).json({ message: 'Server error during session leave' });
  }
});

// @route   DELETE /api/live-sessions/:id
// @desc    Delete live session (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Don't allow deletion of live sessions
    if (session.status === 'live') {
      return res.status(400).json({ message: 'Cannot delete live session' });
    }

    // Soft delete - deactivate instead of removing
    session.isActive = false;
    session.status = 'cancelled';
    await session.save();

    res.json({ message: 'Live session cancelled successfully' });

  } catch (error) {
    console.error('Delete live session error:', error);
    res.status(500).json({ message: 'Server error during session deletion' });
  }
});

// @route   GET /api/live-sessions/stats/overview
// @desc    Get live session statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalSessions = await LiveSession.countDocuments();
    const scheduledSessions = await LiveSession.countDocuments({ status: 'scheduled' });
    const liveSessions = await LiveSession.countDocuments({ status: 'live' });
    const endedSessions = await LiveSession.countDocuments({ status: 'ended' });

    const sessionsByStatus = await LiveSession.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const upcomingSessions = await LiveSession.find({
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    })
      .populate('course', 'title')
      .populate('instructor', 'name')
      .sort({ scheduledAt: 1 })
      .limit(5);

    const sessionsByInstructor = await LiveSession.aggregate([
      {
        $group: {
          _id: '$instructor',
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { sessionCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      { $unwind: '$instructor' },
      {
        $project: {
          name: '$instructor.name',
          sessionCount: 1
        }
      }
    ]);

    res.json({
      totalSessions,
      scheduledSessions,
      liveSessions,
      endedSessions,
      sessionsByStatus,
      upcomingSessions,
      sessionsByInstructor
    });

  } catch (error) {
    console.error('Get live session stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
