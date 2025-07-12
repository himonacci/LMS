const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  }],
  quizResults: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number, // in minutes
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    passed: {
      type: Boolean,
      required: true
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignmentSubmissions: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submissionText: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    grade: {
      score: {
        type: Number,
        min: 0
      },
      feedback: {
        type: String,
        default: ''
      },
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted'
    }
  }],
  certificateGenerated: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String,
    default: ''
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to ensure one enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Update progress when lessons are completed
enrollmentSchema.methods.updateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  
  if (!course) return;
  
  const totalLessons = course.modules.reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
  
  const completedLessons = this.completedLessons.length;
  this.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  // Check if course is completed
  if (this.progress === 100 && this.status === 'approved') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Mark lesson as completed
enrollmentSchema.methods.completeLesson = function(moduleId, lessonId, timeSpent = 0) {
  // Check if lesson is already completed
  const existingCompletion = this.completedLessons.find(
    completion => completion.moduleId.toString() === moduleId.toString() && 
                 completion.lessonId.toString() === lessonId.toString()
  );
  
  if (!existingCompletion) {
    this.completedLessons.push({
      moduleId,
      lessonId,
      timeSpent,
      completedAt: new Date()
    });
    
    this.totalTimeSpent += timeSpent;
    this.lastAccessedAt = new Date();
  }
  
  return this.updateProgress();
};

// Add quiz result
enrollmentSchema.methods.addQuizResult = function(moduleId, lessonId, quizData) {
  this.quizResults.push({
    moduleId,
    lessonId,
    ...quizData,
    attemptedAt: new Date()
  });
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Submit assignment
enrollmentSchema.methods.submitAssignment = function(moduleId, lessonId, submissionData) {
  this.assignmentSubmissions.push({
    moduleId,
    lessonId,
    ...submissionData,
    submittedAt: new Date()
  });
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Generate certificate
enrollmentSchema.methods.generateCertificate = async function() {
  if (this.status === 'completed' && !this.certificateGenerated) {
    // Certificate generation logic would go here
    // For now, we'll just mark it as generated
    this.certificateGenerated = true;
    this.certificateUrl = `/certificates/${this.user}_${this.course}_${Date.now()}.pdf`;
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
