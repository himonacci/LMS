const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'course-inquiry', 'technical-support', 'enrollment-request', 'complaint', 'suggestion'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseOfInterest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  enrollmentDetails: {
    preferredStartDate: Date,
    budget: {
      type: Number,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['credit-card', 'bank-transfer', 'paypal', 'other'],
      default: 'other'
    },
    additionalRequirements: String
  },
  responses: [{
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String
    }],
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'email', 'phone', 'other'],
    default: 'website'
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ type: 1, status: 1, createdAt: -1 });
contactSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

// Auto-set priority based on type
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.type) {
      case 'technical-support':
        this.priority = 'high';
        break;
      case 'complaint':
        this.priority = 'high';
        break;
      case 'enrollment-request':
        this.priority = 'medium';
        break;
      case 'course-inquiry':
        this.priority = 'medium';
        break;
      default:
        this.priority = 'low';
    }
  }
  next();
});

// Mark as read
contactSchema.methods.markAsRead = function(userId) {
  if (!this.isRead) {
    this.isRead = true;
  }
  
  const existingRead = this.readBy.find(
    read => read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Assign to user
contactSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.status = 'in-progress';
  return this.save();
};

// Add response
contactSchema.methods.addResponse = function(userId, message, isInternal = false, attachments = []) {
  this.responses.push({
    respondedBy: userId,
    message,
    isInternal,
    attachments,
    respondedAt: new Date()
  });
  
  if (!isInternal && this.status === 'new') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

// Resolve contact
contactSchema.methods.resolve = function() {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

// Close contact
contactSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Reopen contact
contactSchema.methods.reopen = function() {
  this.status = 'in-progress';
  this.resolvedAt = null;
  this.closedAt = null;
  return this.save();
};

// Set follow-up
contactSchema.methods.setFollowUp = function(date) {
  this.followUpRequired = true;
  this.followUpDate = date;
  return this.save();
};

// Add satisfaction rating
contactSchema.methods.addSatisfactionRating = function(rating, feedback = '') {
  this.satisfaction = {
    rating,
    feedback,
    ratedAt: new Date()
  };
  return this.save();
};

// Get contact statistics
contactSchema.methods.getStatistics = function() {
  return {
    responseCount: this.responses.filter(r => !r.isInternal).length,
    internalNoteCount: this.responses.filter(r => r.isInternal).length,
    totalResponses: this.responses.length,
    isRead: this.isRead,
    readByCount: this.readBy.length,
    status: this.status,
    priority: this.priority,
    type: this.type,
    daysSinceCreated: Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)),
    hasFollowUp: this.followUpRequired,
    hasSatisfactionRating: !!this.satisfaction.rating
  };
};

// Check if follow-up is due
contactSchema.methods.isFollowUpDue = function() {
  return this.followUpRequired && 
         this.followUpDate && 
         this.followUpDate <= new Date() &&
         this.status !== 'closed';
};

module.exports = mongoose.model('Contact', contactSchema);
