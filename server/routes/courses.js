const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { auth, adminOnly, instructorOrAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      search,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'price') {
      sort.price = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'popularity') {
      sort.enrollmentCount = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name profilePicture bio')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-modules'); // Exclude detailed modules for list view

    const total = await Course.countDocuments(query);

    // Add user-specific data if authenticated
    const coursesWithUserData = await Promise.all(courses.map(async (course) => {
      const courseObj = course.toObject();
      
      if (req.user) {
        // Check if user is enrolled
        const enrollment = await Enrollment.findOne({
          user: req.user._id,
          course: course._id
        });
        
        courseObj.userEnrollment = enrollment ? {
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt
        } : null;

        // Check if course is in wishlist
        courseObj.isInWishlist = req.user.wishlist.includes(course._id);
      }

      return courseObj;
    }));

    res.json({
      courses: coursesWithUserData,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isActive: true });
    
    // Get course count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Course.countDocuments({ category, isActive: true });
        return { name: category, count };
      })
    );

    res.json({ categories: categoriesWithCount });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/featured
// @desc    Get featured courses
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const courses = await Course.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('instructor', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('-modules');

    res.json({ courses });

  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name profilePicture bio email')
      .populate('reviews.user', 'name profilePicture');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseObj = course.toObject();

    if (req.user) {
      // Check if user is enrolled
      const enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: course._id
      });
      
      courseObj.userEnrollment = enrollment ? {
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedLessons: enrollment.completedLessons
      } : null;

      // Check if course is in wishlist
      courseObj.isInWishlist = req.user.wishlist.includes(course._id);

      // If user is enrolled and approved, include full course content
      if (enrollment && enrollment.status === 'approved') {
        // Course content is already included
      } else if (req.user.role === 'admin' || 
                 (req.user.role === 'instructor' && course.instructor._id.toString() === req.user._id.toString())) {
        // Admin and course instructor can see full content
      } else {
        // Hide detailed lesson content for non-enrolled users
        courseObj.modules = courseObj.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            duration: lesson.duration,
            order: lesson.order,
            isRequired: lesson.isRequired
            // Hide actual content, quiz questions, etc.
          }))
        }));
      }
    } else {
      // Hide detailed content for non-authenticated users
      courseObj.modules = courseObj.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          duration: lesson.duration,
          order: lesson.order
        }))
      }));
    }

    res.json({ course: courseObj });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create new course (Admin only)
// @access  Private (Admin)
router.post('/', [
  auth,
  adminOnly,
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('shortDescription')
    .isLength({ min: 10, max: 200 })
    .withMessage('Short description must be between 10 and 200 characters'),
  body('instructor')
    .isMongoId()
    .withMessage('Valid instructor ID is required'),
  body('category')
    .isIn(['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Mobile Development', 'Web Development', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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
      shortDescription,
      instructor,
      category,
      level,
      price,
      originalPrice,
      tags,
      requirements,
      whatYouWillLearn,
      targetAudience,
      language
    } = req.body;

    // Verify instructor exists and has instructor role
    const instructorUser = await User.findById(instructor);
    if (!instructorUser || instructorUser.role !== 'instructor') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    const course = new Course({
      title,
      description,
      shortDescription,
      instructor,
      category,
      level: level || 'Beginner',
      price,
      originalPrice: originalPrice || price,
      tags: tags || [],
      requirements: requirements || [],
      whatYouWillLearn: whatYouWillLearn || [],
      targetAudience: targetAudience || [],
      language: language || 'English'
    });

    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email profilePicture');

    res.status(201).json({
      message: 'Course created successfully',
      course: populatedCourse
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error during course creation' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course (Admin or Instructor)
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
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateFields = [
      'title', 'description', 'shortDescription', 'category', 'level',
      'price', 'originalPrice', 'tags', 'requirements', 'whatYouWillLearn',
      'targetAudience', 'language', 'thumbnail'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Only admin can change instructor and active status
    if (req.user.role === 'admin') {
      if (req.body.instructor) course.instructor = req.body.instructor;
      if (req.body.isActive !== undefined) course.isActive = req.body.isActive;
      if (req.body.isFeatured !== undefined) course.isFeatured = req.body.isFeatured;
    }

    course.lastUpdated = new Date();
    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email profilePicture');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error during course update' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id });
    if (enrollmentCount > 0) {
      // Soft delete - deactivate instead of removing
      course.isActive = false;
      await course.save();
      return res.json({ message: 'Course deactivated successfully (has existing enrollments)' });
    }

    // Hard delete if no enrollments
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error during course deletion' });
  }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add course review
// @access  Private (Enrolled students only)
router.post('/:id/reviews', [
  auth,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
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

    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.id,
      status: { $in: ['approved', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to leave a review' });
    }

    // Check if user has already reviewed this course
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment || '';
      existingReview.createdAt = new Date();
    } else {
      // Add new review
      course.reviews.push({
        user: req.user._id,
        rating,
        comment: comment || '',
        createdAt: new Date()
      });
    }

    await course.updateRating();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('reviews.user', 'name profilePicture');

    res.json({
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      reviews: updatedCourse.reviews,
      rating: updatedCourse.rating
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error during review submission' });
  }
});

// @route   GET /api/courses/stats/overview
// @desc    Get course statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: true });
    const featuredCourses = await Course.countDocuments({ isFeatured: true });

    const coursesByCategory = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const topRatedCourses = await Course.find({ isActive: true })
      .sort({ 'rating.average': -1 })
      .limit(5)
      .select('title rating enrollmentCount')
      .populate('instructor', 'name');

    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title instructor createdAt isActive')
      .populate('instructor', 'name');

    res.json({
      totalCourses,
      activeCourses,
      featuredCourses,
      coursesByCategory,
      topRatedCourses,
      recentCourses
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
