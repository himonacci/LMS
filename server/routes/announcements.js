const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get announcements for user
// @access  Public (filtered by visibility)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      courseId,
      sticky = false
    } = req.query;

    // Build base query for published announcements
    const query = { 
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (courseId) query.targetCourse = courseId;
    if (sticky === 'true') query.isSticky = true;

    // Get announcements
    let announcements = await Announcement.find(query)
      .populate('author', 'name profilePicture')
      .populate('targetCourse', 'title')
      .sort({ isSticky: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by visibility if user is authenticated
    if (req.user) {
      const visibleAnnouncements = [];
      for (const announcement of announcements) {
        const isVisible = await announcement.isVisibleToUser(req.user);
        if (isVisible) {
          visibleAnnouncements.push(announcement);
          // Mark as viewed
          await announcement.markAsViewed(req.user._id);
        }
      }
      announcements = visibleAnnouncements;
    } else {
      // For non-authenticated users, only show 'all' target audience
      announcements = announcements.filter(announcement => 
        announcement.targetAudience === 'all'
      );
    }

    const total = announcements.length;

    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/announcements/admin
// @desc    Get all announcements for admin
// @access  Private (Admin)
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      targetAudience,
      isPublished,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const announcements = await Announcement.find(query)
      .populate('author', 'name profilePicture')
      .populate('targetCourse', 'title')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get admin announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Public (with visibility check)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name profilePicture bio')
      .populate('targetCourse', 'title description')
      .populate('comments.user', 'name profilePicture');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if announcement is published and not expired
    if (!announcement.isPublished || !announcement.isActive) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(404).json({ message: 'Announcement not found' });
      }
    }

    if (announcement.expiresAt && announcement.expiresAt < new Date()) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(404).json({ message: 'Announcement has expired' });
      }
    }

    // Check visibility for authenticated users
    if (req.user) {
      const isVisible = await announcement.isVisibleToUser(req.user);
      if (!isVisible && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Mark as viewed
      await announcement.markAsViewed(req.user._id);
    } else {
      // For non-authenticated users, only show 'all' target audience
      if (announcement.targetAudience !== 'all') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ announcement });

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement (Admin only)
// @access  Private (Admin)
router.post('/', [
  auth,
  adminOnly,
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('type')
    .isIn(['general', 'course', 'system', 'urgent'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('targetAudience')
    .isIn(['all', 'students', 'instructors', 'admins', 'course-specific'])
    .withMessage('Invalid target audience'),
  body('targetCourse')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date')
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
      content,
      type,
      priority,
      targetAudience,
      targetCourse,
      scheduledFor,
      expiresAt,
      tags,
      isSticky,
      allowComments
    } = req.body;

    // Validate course-specific announcements
    if (targetAudience === 'course-specific') {
      if (!targetCourse) {
        return res.status(400).json({ message: 'Target course is required for course-specific announcements' });
      }

      const course = await Course.findById(targetCourse);
      if (!course) {
        return res.status(404).json({ message: 'Target course not found' });
      }
    }

    const announcement = new Announcement({
      title,
      content,
      type,
      priority: priority || 'medium',
      author: req.user._id,
      targetAudience,
      targetCourse: targetAudience === 'course-specific' ? targetCourse : null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      tags: tags || [],
      isSticky: isSticky || false,
      allowComments: allowComments !== false
    });

    // Auto-publish if no scheduled date
    if (!scheduledFor) {
      announcement.isPublished = true;
      announcement.publishedAt = new Date();
    }

    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'name profilePicture')
      .populate('targetCourse', 'title');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: populatedAnnouncement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error during announcement creation' });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  auth,
  adminOnly,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'course', 'system', 'urgent'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'students', 'instructors', 'admins', 'course-specific'])
    .withMessage('Invalid target audience')
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

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const updateFields = [
      'title', 'content', 'type', 'priority', 'targetAudience', 
      'targetCourse', 'scheduledFor', 'expiresAt', 'tags', 
      'isSticky', 'allowComments', 'isActive'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'scheduledFor' || field === 'expiresAt') {
          announcement[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          announcement[field] = req.body[field];
        }
      }
    });

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'name profilePicture')
      .populate('targetCourse', 'title');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error during announcement update' });
  }
});

// @route   PUT /api/announcements/:id/publish
// @desc    Publish announcement (Admin only)
// @access  Private (Admin)
router.put('/:id/publish', auth, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.isPublished) {
      return res.status(400).json({ message: 'Announcement is already published' });
    }

    await announcement.publish();

    res.json({
      message: 'Announcement published successfully',
      announcement: {
        id: announcement._id,
        isPublished: announcement.isPublished,
        publishedAt: announcement.publishedAt
      }
    });

  } catch (error) {
    console.error('Publish announcement error:', error);
    res.status(500).json({ message: 'Server error during announcement publishing' });
  }
});

// @route   PUT /api/announcements/:id/unpublish
// @desc    Unpublish announcement (Admin only)
// @access  Private (Admin)
router.put('/:id/unpublish', auth, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (!announcement.isPublished) {
      return res.status(400).json({ message: 'Announcement is not published' });
    }

    await announcement.unpublish();

    res.json({
      message: 'Announcement unpublished successfully',
      announcement: {
        id: announcement._id,
        isPublished: announcement.isPublished,
        publishedAt: announcement.publishedAt
      }
    });

  } catch (error) {
    console.error('Unpublish announcement error:', error);
    res.status(500).json({ message: 'Server error during announcement unpublishing' });
  }
});

// @route   POST /api/announcements/:id/comments
// @desc    Add comment to announcement
// @access  Private
router.post('/:id/comments', [
  auth,
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const { content } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (!announcement.allowComments) {
      return res.status(400).json({ message: 'Comments are not allowed on this announcement' });
    }

    // Check if user can view this announcement
    const isVisible = await announcement.isVisibleToUser(req.user);
    if (!isVisible) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await announcement.addComment(req.user._id, content);

    const updatedAnnouncement = await Announcement.findById(req.params.id)
      .populate('comments.user', 'name profilePicture');

    res.json({
      message: 'Comment added successfully',
      comments: updatedAnnouncement.comments
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment addition' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Soft delete - deactivate instead of removing
    announcement.isActive = false;
    await announcement.save();

    res.json({ message: 'Announcement deleted successfully' });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error during announcement deletion' });
  }
});

// @route   GET /api/announcements/stats/overview
// @desc    Get announcement statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const publishedAnnouncements = await Announcement.countDocuments({ isPublished: true });
    const draftAnnouncements = await Announcement.countDocuments({ isPublished: false });
    const stickyAnnouncements = await Announcement.countDocuments({ isSticky: true });

    const announcementsByType = await Announcement.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const announcementsByPriority = await Announcement.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentAnnouncements = await Announcement.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type priority isPublished createdAt author');

    const topViewedAnnouncements = await Announcement.find({ isPublished: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title viewCount uniqueViewers')
      .populate('author', 'name');

    res.json({
      totalAnnouncements,
      publishedAnnouncements,
      draftAnnouncements,
      stickyAnnouncements,
      announcementsByType,
      announcementsByPriority,
      recentAnnouncements,
      topViewedAnnouncements
    });

  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
