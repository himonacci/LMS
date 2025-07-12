const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [100, 'Session title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Session description is required'],
    maxlength: [500, 'Session description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes (3 hours)']
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: [1, 'Must allow at least 1 participant'],
    max: [500, 'Cannot exceed 500 participants']
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingPassword: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    isPresent: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['participant', 'moderator'],
      default: 'participant'
    }
  }],
  features: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false // As per requirement: non-recordable
    },
    allowParticipantVideo: {
      type: Boolean,
      default: false
    },
    allowParticipantAudio: {
      type: Boolean,
      default: false
    },
    requireApprovalToJoin: {
      type: Boolean,
      default: false
    }
  },
  chatMessages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  sessionNotes: {
    type: String,
    default: ''
  },
  materials: [{
    title: String,
    description: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    daysOfWeek: [Number] // 0-6, Sunday to Saturday
  },
  parentSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveSession'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
liveSessionSchema.index({ course: 1, scheduledAt: 1 });
liveSessionSchema.index({ instructor: 1, scheduledAt: 1 });
liveSessionSchema.index({ status: 1, scheduledAt: 1 });

// Generate unique room ID
liveSessionSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `session_${this._id}_${Date.now()}`;
  }
  next();
});

// Start session
liveSessionSchema.methods.startSession = function() {
  this.status = 'live';
  this.actualStartTime = new Date();
  return this.save();
};

// End session
liveSessionSchema.methods.endSession = function() {
  this.status = 'ended';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  
  this.attendanceCount = this.participants.length;
  return this.save();
};

// Add participant
liveSessionSchema.methods.addParticipant = function(userId, role = 'participant') {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      isPresent: true
    });
  } else {
    existingParticipant.isPresent = true;
    existingParticipant.leftAt = undefined;
  }
  
  return this.save();
};

// Remove participant
liveSessionSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.isPresent = false;
    participant.leftAt = new Date();
  }
  
  return this.save();
};

// Add chat message
liveSessionSchema.methods.addChatMessage = function(userId, message, isSystemMessage = false) {
  this.chatMessages.push({
    user: userId,
    message,
    isSystemMessage,
    timestamp: new Date()
  });
  
  // Keep only last 100 messages
  if (this.chatMessages.length > 100) {
    this.chatMessages = this.chatMessages.slice(-100);
  }
  
  return this.save();
};

// Check if user can join
liveSessionSchema.methods.canUserJoin = async function(userId) {
  // Check if session is live or scheduled
  if (this.status !== 'live' && this.status !== 'scheduled') {
    return { canJoin: false, reason: 'Session is not available' };
  }
  
  // Check if user is enrolled in the course
  const Enrollment = mongoose.model('Enrollment');
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: this.course,
    status: 'approved'
  });
  
  if (!enrollment) {
    return { canJoin: false, reason: 'User is not enrolled in this course' };
  }
  
  // Check participant limit
  const currentParticipants = this.participants.filter(p => p.isPresent).length;
  if (currentParticipants >= this.maxParticipants) {
    return { canJoin: false, reason: 'Session is full' };
  }
  
  return { canJoin: true };
};

// Get session statistics
liveSessionSchema.methods.getStatistics = function() {
  const totalParticipants = this.participants.length;
  const currentParticipants = this.participants.filter(p => p.isPresent).length;
  const totalMessages = this.chatMessages.filter(m => !m.isSystemMessage).length;
  
  return {
    totalParticipants,
    currentParticipants,
    totalMessages,
    actualDuration: this.actualDuration,
    status: this.status
  };
};

module.exports = mongoose.model('LiveSession', liveSessionSchema);
