const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Module description is required']
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [{
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'quiz', 'assignment', 'text'],
      required: true
    },
    content: {
      type: String, // URL for video/pdf, content for text, questions for quiz
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    order: {
      type: Number,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    quiz: {
      questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        points: {
          type: Number,
          default: 1
        }
      }],
      passingScore: {
        type: Number,
        default: 70
      },
      timeLimit: {
        type: Number, // in minutes
        default: 30
      }
    },
    assignment: {
      instructions: String,
      maxFileSize: {
        type: Number,
        default: 10485760 // 10MB
      },
      allowedFileTypes: [String],
      dueDate: Date,
      maxScore: {
        type: Number,
        default: 100
      }
    }
  }]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Mobile Development', 'Web Development', 'Other']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  images: [String],
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  duration: {
    type: Number, // total duration in minutes
    default: 0
  },
  modules: [moduleSchema],
  requirements: [String],
  whatYouWillLearn: [String],
  targetAudience: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total duration when modules are updated
courseSchema.pre('save', function(next) {
  if (this.isModified('modules')) {
    this.duration = this.modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + (lesson.duration || 0);
      }, 0);
    }, 0);
  }
  next();
});

// Update rating when reviews change
courseSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Get course progress for a specific user
courseSchema.methods.getProgressForUser = async function(userId) {
  const Enrollment = mongoose.model('Enrollment');
  const enrollment = await Enrollment.findOne({ 
    user: userId, 
    course: this._id 
  });
  
  if (!enrollment) return 0;
  
  const totalLessons = this.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = enrollment.completedLessons.length;
  
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

module.exports = mongoose.model('Course', courseSchema);
