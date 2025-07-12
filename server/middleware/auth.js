const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Check if user is admin
const adminOnly = authorize('admin');

// Check if user is instructor or admin
const instructorOrAdmin = authorize('instructor', 'admin');

// Check if user is student, instructor, or admin (authenticated users)
const authenticatedOnly = authorize('student', 'instructor', 'admin');

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Check if user owns resource or is admin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource?.[resourceUserField] || req.params.userId;
    
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  };
};

// Check if user is enrolled in course
const checkEnrollment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Admin and instructors can access all courses
    if (req.user.role === 'admin' || req.user.role === 'instructor') {
      return next();
    }

    // Check if student is enrolled
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      status: { $in: ['approved', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Access denied. You are not enrolled in this course.' });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({ message: 'Server error during enrollment check' });
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would typically use Redis or similar for production
  // For now, we'll just add a simple delay
  setTimeout(next, 100);
};

// Validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`User ${req.user._id} (${req.user.email}) performed action: ${action}`);
      // In production, you might want to store this in a database
    }
    next();
  };
};

module.exports = {
  auth,
  authorize,
  adminOnly,
  instructorOrAdmin,
  authenticatedOnly,
  optionalAuth,
  ownerOrAdmin,
  checkEnrollment,
  sensitiveOperationLimit,
  validateRequest,
  logActivity
};
