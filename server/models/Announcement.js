const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'course', 'system', 'urgent'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'admins', 'course-specific'],
    default: 'all'
  },
  targetCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isSticky: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
announcementSchema.index({ type: 1, isPublished: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, isPublished: 1, createdAt: -1 });
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ targetCourse: 1, isPublished: 1, createdAt: -1 });

// Auto-publish scheduled announcements
announcementSchema.pre('save', function(next) {
  if (this.scheduledFor && this.scheduledFor <= new Date() && !this.isPublished) {
    this.isPublished = true;
    this.publishedAt = new Date();
  }
  next();
});

// Publish announcement
announcementSchema.methods.publish = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Unpublish announcement
announcementSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.publishedAt = null;
  return this.save();
};

// Add comment
announcementSchema.methods.addComment = function(userId, content) {
  if (!this.allowComments) {
    throw new Error('Comments are not allowed on this announcement');
  }
  
  this.comments.push({
    user: userId,
    content,
    createdAt: new Date()
  });
  
  return this.save();
};

// Mark as viewed by user
announcementSchema.methods.markAsViewed = function(userId) {
  const existingView = this.viewedBy.find(
    view => view.user.toString() === userId.toString()
  );
  
  if (!existingView) {
    this.viewedBy.push({
      user: userId,
      viewedAt: new Date()
    });
    this.viewCount += 1;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Check if announcement is visible to user
announcementSchema.methods.isVisibleToUser = async function(user) {
  if (!this.isPublished) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  
  // Check target audience
  switch (this.targetAudience) {
    case 'all':
      return true;
    case 'students':
      return user.role === 'student';
    case 'instructors':
      return user.role === 'instructor';
    case 'admins':
      return user.role === 'admin';
    case 'course-specific':
      if (!this.targetCourse) return false;
      
      // Check if user is enrolled in the target course
      const Enrollment = mongoose.model('Enrollment');
      const enrollment = await Enrollment.findOne({
        user: user._id,
        course: this.targetCourse,
        status: { $in: ['approved', 'completed'] }
      });
      
      return !!enrollment;
    default:
      return false;
  }
};

// Get announcement statistics
announcementSchema.methods.getStatistics = function() {
  return {
    viewCount: this.viewCount,
    commentCount: this.comments.length,
    uniqueViewers: this.viewedBy.length,
    isPublished: this.isPublished,
    publishedAt: this.publishedAt,
    priority: this.priority,
    type: this.type
  };
};

module.exports = mongoose.model('Announcement', announcementSchema);
