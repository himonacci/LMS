const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'course-inquiry', 'technical-support', 'enrollment-request', 'complaint', 'suggestion'])
    .withMessage('Invalid contact type'),
  body('courseOfInterest')
    .optional()
    .isMongoId()
    .withMessage('Invalid course ID')
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
      name,
      email,
      phone,
      subject,
      message,
      type = 'general',
      courseOfInterest,
      enrollmentDetails
    } = req.body;

    // Verify course exists if provided
    if (courseOfInterest) {
      const course = await Course.findById(courseOfInterest);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      type,
      courseOfInterest,
      enrollmentDetails,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || ''
    });

    await contact.save();

    // Notify admins about new contact
    const admins = await User.find({ role: 'admin', isActive: true });
    const notificationPromises = admins.map(admin => 
      admin.addNotification(
        'New Contact Message',
        `New ${type} message from ${name}: ${subject}`,
        contact.priority === 'high' || contact.priority === 'urgent' ? 'warning' : 'info'
      )
    );
    await Promise.all(notificationPromises);

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      contactId: contact._id
    });

  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Server error during message submission' });
  }
});

// @route   POST /api/contact/enrollment-request
// @desc    Submit course enrollment request
// @access  Public
router.post('/enrollment-request', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('message')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('preferredStartDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number')
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
      name,
      email,
      phone,
      courseId,
      message,
      preferredStartDate,
      budget,
      paymentMethod,
      additionalRequirements
    } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found or inactive' });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject: `Enrollment Request for ${course.title}`,
      message,
      type: 'enrollment-request',
      courseOfInterest: courseId,
      enrollmentDetails: {
        preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
        budget,
        paymentMethod: paymentMethod || 'other',
        additionalRequirements: additionalRequirements || ''
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || ''
    });

    await contact.save();

    // Notify admins about enrollment request
    const admins = await User.find({ role: 'admin', isActive: true });
    const notificationPromises = admins.map(admin => 
      admin.addNotification(
        'New Enrollment Request',
        `${name} has requested enrollment in ${course.title}`,
        'info'
      )
    );
    await Promise.all(notificationPromises);

    res.status(201).json({
      message: 'Your enrollment request has been submitted successfully. Our team will contact you soon to discuss payment and enrollment details.',
      contactId: contact._id,
      course: {
        title: course.title,
        price: course.price
      }
    });

  } catch (error) {
    console.error('Submit enrollment request error:', error);
    res.status(500).json({ message: 'Server error during enrollment request submission' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private (Admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(query)
      .populate('courseOfInterest', 'title price')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact/:id
// @desc    Get contact by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('courseOfInterest', 'title price instructor')
      .populate('courseOfInterest.instructor', 'name email')
      .populate('assignedTo', 'name email profilePicture')
      .populate('responses.respondedBy', 'name email profilePicture');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Mark as read by current admin
    await contact.markAsRead(req.user._id);

    res.json({ contact });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/assign
// @desc    Assign contact to admin (Admin only)
// @access  Private (Admin)
router.put('/:id/assign', [
  auth,
  adminOnly,
  body('assignedTo')
    .isMongoId()
    .withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Verify assigned user is admin
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.role !== 'admin') {
      return res.status(400).json({ message: 'Can only assign to admin users' });
    }

    await contact.assignTo(assignedTo);

    const updatedContact = await Contact.findById(contact._id)
      .populate('assignedTo', 'name email');

    res.json({
      message: 'Contact assigned successfully',
      contact: updatedContact
    });

  } catch (error) {
    console.error('Assign contact error:', error);
    res.status(500).json({ message: 'Server error during contact assignment' });
  }
});

// @route   POST /api/contact/:id/respond
// @desc    Add response to contact (Admin only)
// @access  Private (Admin)
router.post('/:id/respond', [
  auth,
  adminOnly,
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response message is required and cannot exceed 1000 characters'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
], async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await contact.addResponse(req.user._id, message, isInternal);

    const updatedContact = await Contact.findById(contact._id)
      .populate('responses.respondedBy', 'name email profilePicture');

    res.json({
      message: 'Response added successfully',
      responses: updatedContact.responses
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error during response addition' });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  adminOnly,
  body('status')
    .isIn(['new', 'in-progress', 'resolved', 'closed'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (status === 'resolved') {
      await contact.resolve();
    } else if (status === 'closed') {
      await contact.close();
    } else if (status === 'in-progress' && contact.status === 'closed') {
      await contact.reopen();
    } else {
      contact.status = status;
      await contact.save();
    }

    res.json({
      message: `Contact status updated to ${status}`,
      contact: {
        id: contact._id,
        status: contact.status,
        resolvedAt: contact.resolvedAt,
        closedAt: contact.closedAt
      }
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error during status update' });
  }
});

// @route   GET /api/contact/stats/overview
// @desc    Get contact statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
    const closedContacts = await Contact.countDocuments({ status: 'closed' });

    const contactsByType = await Contact.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const contactsByPriority = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentContacts = await Contact.find()
      .populate('courseOfInterest', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email subject type status createdAt courseOfInterest');

    const enrollmentRequests = await Contact.countDocuments({ type: 'enrollment-request' });
    const technicalSupport = await Contact.countDocuments({ type: 'technical-support' });

    res.json({
      totalContacts,
      newContacts,
      inProgressContacts,
      resolvedContacts,
      closedContacts,
      contactsByType,
      contactsByPriority,
      recentContacts,
      enrollmentRequests,
      technicalSupport
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
