const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const LiveSession = require('../models/LiveSession');
const Announcement = require('../models/Announcement');
const Contact = require('../models/Contact');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await LiveSession.deleteMany({});
    await Announcement.deleteMany({});
    await Contact.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Create users
const createUsers = async () => {
  try {
    // Hash passwords before creating users
    const saltRounds = 12;
    const hashedAdminPassword = await bcrypt.hash('Admin123!', saltRounds);
    const hashedInstructorPassword = await bcrypt.hash('Instructor123!', saltRounds);
    const hashedStudentPassword = await bcrypt.hash('Student123!', saltRounds);

    const users = [
      // Admin users
      {
        name: 'Admin User',
        email: 'admin@lms.com',
        password: hashedAdminPassword,
        role: 'admin',
        bio: 'System Administrator with extensive experience in educational technology.',
        phone: '+1234567890',
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.admin@lms.com',
        password: hashedAdminPassword,
        role: 'admin',
        bio: 'Senior Administrator specializing in curriculum development.',
        phone: '+1234567891',
        isActive: true
      },

      // Instructor users
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@lms.com',
        password: hashedInstructorPassword,
        role: 'instructor',
        bio: 'Full-stack developer with 10+ years of experience. Specializes in React, Node.js, and modern web technologies.',
        phone: '+1234567892',
        isActive: true
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@lms.com',
        password: hashedInstructorPassword,
        role: 'instructor',
        bio: 'UX/UI Designer and design thinking expert. Passionate about creating user-centered digital experiences.',
        phone: '+1234567893',
        isActive: true
      },
      {
        name: 'David Thompson',
        email: 'david.thompson@lms.com',
        password: hashedInstructorPassword,
        role: 'instructor',
        bio: 'Business strategist and entrepreneur with MBA from Harvard. Expert in digital marketing and business development.',
        phone: '+1234567894',
        isActive: true
      },
      {
        name: 'Dr. Lisa Wang',
        email: 'lisa.wang@lms.com',
        password: hashedInstructorPassword,
        role: 'instructor',
        bio: 'Data scientist with PhD in Machine Learning. Specializes in Python, R, and advanced analytics.',
        phone: '+1234567895',
        isActive: true
      },

      // Student users
      {
        name: 'John Smith',
        email: 'john.smith@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Computer science student passionate about web development.',
        phone: '+1234567896',
        isActive: true
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Graphic design enthusiast looking to transition into UX design.',
        phone: '+1234567897',
        isActive: true
      },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Marketing professional seeking to enhance digital marketing skills.',
        phone: '+1234567898',
        isActive: true
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Data analyst interested in machine learning and AI.',
        phone: '+1234567899',
        isActive: true
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Software engineer looking to expand full-stack development skills.',
        phone: '+1234567800',
        isActive: true
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer.lee@student.com',
        password: hashedStudentPassword,
        role: 'student',
        bio: 'Recent graduate exploring career opportunities in tech.',
        phone: '+1234567801',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error creating users:', error);
    return [];
  }
};

// Create courses
const createCourses = async (users) => {
  try {
    const instructors = users.filter(user => user.role === 'instructor');
    
    const courses = [
      {
        title: 'Complete React Development Bootcamp',
        description: 'Master React from basics to advanced concepts. Build real-world projects including e-commerce sites, social media apps, and more. Learn React Hooks, Context API, Redux, and modern development practices.',
        shortDescription: 'Comprehensive React course covering hooks, state management, and real-world projects.',
        instructor: instructors[0]._id, // Dr. Michael Chen
        category: 'Web Development',
        level: 'Intermediate',
        price: 199.99,
        originalPrice: 299.99,
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        requirements: [
          'Basic knowledge of HTML, CSS, and JavaScript',
          'Familiarity with ES6+ features',
          'Computer with internet connection'
        ],
        whatYouWillLearn: [
          'Build modern React applications from scratch',
          'Master React Hooks and functional components',
          'Implement state management with Redux',
          'Create responsive and interactive user interfaces',
          'Deploy React applications to production'
        ],
        targetAudience: [
          'Web developers looking to learn React',
          'Frontend developers wanting to advance their skills',
          'Students interested in modern web development'
        ],
        language: 'English',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        modules: [
          {
            title: 'React Fundamentals',
            description: 'Learn the core concepts of React including components, JSX, and props.',
            order: 1,
            lessons: [
              {
                title: 'Introduction to React',
                description: 'Understanding what React is and why it\'s popular',
                type: 'video',
                content: 'https://example.com/react-intro-video',
                duration: 45,
                order: 1,
                isRequired: true
              },
              {
                title: 'Setting up Development Environment',
                description: 'Installing Node.js, npm, and creating your first React app',
                type: 'video',
                content: 'https://example.com/setup-video',
                duration: 30,
                order: 2,
                isRequired: true
              },
              {
                title: 'React Fundamentals Quiz',
                description: 'Test your understanding of React basics',
                type: 'quiz',
                content: 'quiz-content',
                duration: 15,
                order: 3,
                isRequired: true,
                quiz: {
                  questions: [
                    {
                      question: 'What is React?',
                      options: ['A JavaScript library', 'A programming language', 'A database', 'An operating system'],
                      correctAnswer: 0,
                      points: 1
                    },
                    {
                      question: 'What does JSX stand for?',
                      options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
                      correctAnswer: 0,
                      points: 1
                    }
                  ],
                  passingScore: 70,
                  timeLimit: 15
                }
              }
            ]
          },
          {
            title: 'Advanced React Concepts',
            description: 'Dive deeper into React with hooks, context, and performance optimization.',
            order: 2,
            lessons: [
              {
                title: 'React Hooks Deep Dive',
                description: 'Master useState, useEffect, and custom hooks',
                type: 'video',
                content: 'https://example.com/hooks-video',
                duration: 60,
                order: 1,
                isRequired: true
              },
              {
                title: 'Context API and State Management',
                description: 'Learn to manage global state with Context API',
                type: 'video',
                content: 'https://example.com/context-video',
                duration: 45,
                order: 2,
                isRequired: true
              },
              {
                title: 'Build a Todo App Assignment',
                description: 'Create a fully functional todo application using React hooks',
                type: 'assignment',
                content: 'Build a todo app with add, edit, delete, and filter functionality',
                duration: 120,
                order: 3,
                isRequired: true,
                assignment: {
                  instructions: 'Create a todo application with the following features: add new todos, mark as complete, edit existing todos, delete todos, and filter by status.',
                  maxFileSize: 10485760,
                  allowedFileTypes: ['.zip', '.rar'],
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  maxScore: 100
                }
              }
            ]
          }
        ]
      },
      {
        title: 'UX/UI Design Masterclass',
        description: 'Learn user experience and user interface design from industry experts. Master design thinking, prototyping, user research, and create stunning digital experiences that users love.',
        shortDescription: 'Complete UX/UI design course covering research, prototyping, and modern design tools.',
        instructor: instructors[1]._id, // Emily Rodriguez
        category: 'Design',
        level: 'Beginner',
        price: 149.99,
        originalPrice: 199.99,
        tags: ['UX Design', 'UI Design', 'Figma', 'Design Thinking'],
        requirements: [
          'No prior design experience required',
          'Computer with internet connection',
          'Willingness to learn and practice'
        ],
        whatYouWillLearn: [
          'Understand UX/UI design principles',
          'Conduct user research and create personas',
          'Design wireframes and prototypes',
          'Master Figma and other design tools',
          'Create a professional design portfolio'
        ],
        targetAudience: [
          'Beginners interested in design',
          'Developers wanting to learn design',
          'Career changers moving into UX/UI'
        ],
        language: 'English',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        modules: [
          {
            title: 'Design Fundamentals',
            description: 'Learn the basic principles of good design.',
            order: 1,
            lessons: [
              {
                title: 'Introduction to UX/UI Design',
                description: 'Understanding the difference between UX and UI',
                type: 'video',
                content: 'https://example.com/ux-ui-intro',
                duration: 40,
                order: 1,
                isRequired: true
              },
              {
                title: 'Design Principles and Elements',
                description: 'Color theory, typography, and layout principles',
                type: 'video',
                content: 'https://example.com/design-principles',
                duration: 50,
                order: 2,
                isRequired: true
              }
            ]
          }
        ]
      },
      {
        title: 'Digital Marketing Strategy',
        description: 'Master digital marketing from strategy to execution. Learn SEO, social media marketing, content marketing, email marketing, and analytics to grow any business online.',
        shortDescription: 'Comprehensive digital marketing course covering SEO, social media, and analytics.',
        instructor: instructors[2]._id, // David Thompson
        category: 'Marketing',
        level: 'Intermediate',
        price: 179.99,
        originalPrice: 249.99,
        tags: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
        requirements: [
          'Basic understanding of business concepts',
          'Access to social media platforms',
          'Computer with internet connection'
        ],
        whatYouWillLearn: [
          'Develop comprehensive marketing strategies',
          'Master SEO and content marketing',
          'Create effective social media campaigns',
          'Analyze marketing performance with data',
          'Build and execute marketing funnels'
        ],
        targetAudience: [
          'Business owners and entrepreneurs',
          'Marketing professionals',
          'Students interested in digital marketing'
        ],
        language: 'English',
        isActive: true,
        isFeatured: false,
        publishedAt: new Date(),
        modules: [
          {
            title: 'Marketing Strategy Foundations',
            description: 'Build a solid foundation in digital marketing strategy.',
            order: 1,
            lessons: [
              {
                title: 'Digital Marketing Overview',
                description: 'Understanding the digital marketing landscape',
                type: 'video',
                content: 'https://example.com/marketing-overview',
                duration: 35,
                order: 1,
                isRequired: true
              }
            ]
          }
        ]
      },
      {
        title: 'Data Science with Python',
        description: 'Complete data science course using Python. Learn data analysis, visualization, machine learning, and statistical modeling. Work with real datasets and build predictive models.',
        shortDescription: 'Learn data science and machine learning using Python and popular libraries.',
        instructor: instructors[3]._id, // Dr. Lisa Wang
        category: 'Data Science',
        level: 'Advanced',
        price: 249.99,
        originalPrice: 349.99,
        tags: ['Python', 'Data Science', 'Machine Learning', 'Statistics'],
        requirements: [
          'Basic programming knowledge',
          'Understanding of mathematics and statistics',
          'Python installed on computer'
        ],
        whatYouWillLearn: [
          'Master Python for data analysis',
          'Create stunning data visualizations',
          'Build machine learning models',
          'Work with real-world datasets',
          'Deploy ML models to production'
        ],
        targetAudience: [
          'Data analysts and scientists',
          'Software developers interested in ML',
          'Students studying data science'
        ],
        language: 'English',
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        modules: [
          {
            title: 'Python for Data Science',
            description: 'Learn Python libraries essential for data science.',
            order: 1,
            lessons: [
              {
                title: 'Introduction to Data Science',
                description: 'What is data science and its applications',
                type: 'video',
                content: 'https://example.com/data-science-intro',
                duration: 45,
                order: 1,
                isRequired: true
              }
            ]
          }
        ]
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile applications using React Native. Learn to create iOS and Android apps with a single codebase, integrate APIs, and publish to app stores.',
        shortDescription: 'Create mobile apps for iOS and Android using React Native.',
        instructor: instructors[0]._id, // Dr. Michael Chen
        category: 'Mobile Development',
        level: 'Intermediate',
        price: 189.99,
        originalPrice: 259.99,
        tags: ['React Native', 'Mobile Development', 'iOS', 'Android'],
        requirements: [
          'Knowledge of React and JavaScript',
          'Basic understanding of mobile development',
          'Development environment setup'
        ],
        whatYouWillLearn: [
          'Build native mobile apps with React Native',
          'Navigate between screens and manage state',
          'Integrate with device features and APIs',
          'Style and animate mobile interfaces',
          'Deploy apps to iOS and Android stores'
        ],
        targetAudience: [
          'React developers wanting to build mobile apps',
          'Mobile developers learning cross-platform development',
          'Entrepreneurs building mobile products'
        ],
        language: 'English',
        isActive: true,
        isFeatured: false,
        publishedAt: new Date(),
        modules: [
          {
            title: 'React Native Fundamentals',
            description: 'Get started with React Native development.',
            order: 1,
            lessons: [
              {
                title: 'Setting up React Native',
                description: 'Install and configure React Native development environment',
                type: 'video',
                content: 'https://example.com/rn-setup',
                duration: 40,
                order: 1,
                isRequired: true
              }
            ]
          }
        ]
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    
    // Update ratings for some courses
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];
      const students = users.filter(user => user.role === 'student');
      
      // Add some reviews
      const numReviews = Math.floor(Math.random() * 5) + 3; // 3-7 reviews
      for (let j = 0; j < numReviews; j++) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const comments = [
          'Excellent course! Learned a lot.',
          'Great instructor and well-structured content.',
          'Highly recommended for beginners.',
          'Perfect balance of theory and practice.',
          'Amazing course, exceeded my expectations!'
        ];
        
        course.reviews.push({
          user: randomStudent._id,
          rating,
          comment: comments[Math.floor(Math.random() * comments.length)],
          createdAt: new Date()
        });
      }
      
      await course.updateRating();
    }

    console.log(`${createdCourses.length} courses created`);
    return createdCourses;
  } catch (error) {
    console.error('Error creating courses:', error);
    return [];
  }
};

// Create enrollments
const createEnrollments = async (users, courses) => {
  try {
    const students = users.filter(user => user.role === 'student');
    const enrollments = [];

    // Create various enrollment statuses
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const numEnrollments = Math.floor(Math.random() * 3) + 1; // 1-3 enrollments per student
      
      for (let j = 0; j < numEnrollments && j < courses.length; j++) {
        const course = courses[j];
        const statuses = ['pending', 'approved', 'completed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const enrollment = {
          user: student._id,
          course: course._id,
          status,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          progress: status === 'completed' ? 100 : Math.floor(Math.random() * 80),
          totalTimeSpent: Math.floor(Math.random() * 300) + 60 // 60-360 minutes
        };

        if (status === 'approved' || status === 'completed') {
          enrollment.approvedAt = new Date(enrollment.enrolledAt.getTime() + 24 * 60 * 60 * 1000); // Approved 1 day after enrollment
        }

        if (status === 'completed') {
          enrollment.completedAt = new Date(enrollment.approvedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // Completed 7 days after approval
          enrollment.certificateGenerated = true;
          enrollment.certificateUrl = `/certificates/${student._id}_${course._id}_${Date.now()}.pdf`;
        }

        enrollments.push(enrollment);
      }
    }

    const createdEnrollments = await Enrollment.insertMany(enrollments);
    
    // Update course enrollment counts
    for (const course of courses) {
      const enrollmentCount = createdEnrollments.filter(
        enrollment => enrollment.course.toString() === course._id.toString() && 
        (enrollment.status === 'approved' || enrollment.status === 'completed')
      ).length;
      
      await Course.findByIdAndUpdate(course._id, { enrollmentCount });
    }

    console.log(`${createdEnrollments.length} enrollments created`);
    return createdEnrollments;
  } catch (error) {
    console.error('Error creating enrollments:', error);
    return [];
  }
};

// Create live sessions
const createLiveSessions = async (users, courses) => {
  try {
    const instructors = users.filter(user => user.role === 'instructor');
    const sessions = [];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const instructor = instructors.find(inst => inst._id.toString() === course.instructor.toString());
      
      // Create 2-3 sessions per course
      const numSessions = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < numSessions; j++) {
        const scheduledAt = new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000); // Weekly sessions
        const statuses = ['scheduled', 'ended'];
        const status = j === 0 ? 'scheduled' : statuses[Math.floor(Math.random() * statuses.length)];
        
        const session = {
          title: `${course.title} - Live Session ${j + 1}`,
          description: `Interactive live session covering key concepts from ${course.title}. Q&A and hands-on exercises included.`,
          course: course._id,
          instructor: instructor._id,
          scheduledAt,
          duration: 90 + Math.floor(Math.random() * 60), // 90-150 minutes
          maxParticipants: 50 + Math.floor(Math.random() * 50), // 50-100 participants
          status,
          features: {
            allowChat: true,
            allowScreenShare: true,
            allowRecording: false,
            allowParticipantVideo: false,
            allowParticipantAudio: true,
            requireApprovalToJoin: false
          },
          isActive: true
        };

        if (status === 'ended') {
          session.actualStartTime = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
          session.actualEndTime = new Date(session.actualStartTime.getTime() + session.duration * 60 * 1000);
          session.actualDuration = session.duration;
          session.attendanceCount = Math.floor(Math.random() * 30) + 10; // 10-40 attendees
        }

        sessions.push(session);
      }
    }

    const createdSessions = await LiveSession.insertMany(sessions);
    console.log(`${createdSessions.length} live sessions created`);
    return createdSessions;
  } catch (error) {
    console.error('Error creating live sessions:', error);
    return [];
  }
};

// Create announcements
const createAnnouncements = async (users) => {
  try {
    const admins = users.filter(user => user.role === 'admin');
    
    const announcements = [
      {
        title: 'Welcome to Our Learning Management System!',
        content: 'We are excited to have you join our learning community. Explore our wide range of courses, connect with expert instructors, and start your learning journey today. Don\'t forget to check out our featured courses and upcoming live sessions.',
        type: 'general',
        priority: 'high',
        author: admins[0]._id,
        targetAudience: 'all',
        isPublished: true,
        publishedAt: new Date(),
        isSticky: true,
        allowComments: true,
        tags: ['welcome', 'announcement']
      },
      {
        title: 'New Course Alert: Data Science with Python',
        content: 'We\'re thrilled to announce the launch of our comprehensive Data Science with Python course. Led by Dr. Lisa Wang, this advanced course covers everything from data analysis to machine learning. Early bird discount available for the first 50 students!',
        type: 'course',
        priority: 'medium',
        author: admins[0]._id,
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isSticky: false,
        allowComments: true,
        tags: ['new course', 'data science', 'python']
      },
      {
        title: 'System Maintenance Scheduled',
        content: 'We will be performing scheduled maintenance on our platform this Sunday from 2:00 AM to 4:00 AM EST. During this time, the platform may be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.',
        type: 'system',
        priority: 'urgent',
        author: admins[1]._id,
        targetAudience: 'all',
        isPublished: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isSticky: true,
        allowComments: false,
        tags: ['maintenance', 'system'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Instructor Spotlight: Dr. Michael Chen',
        content: 'This month we\'re featuring Dr. Michael Chen, our expert React instructor. With over 10 years of full-stack development experience, Dr. Chen has helped thousands of students master modern web development. Check out his popular React Development Bootcamp!',
        type: 'general',
        priority: 'low',
        author: admins[0]._id,
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isSticky: false,
        allowComments: true,
        tags: ['instructor spotlight', 'react', 'web development']
      },
      {
        title: 'Live Session: UX Design Best Practices',
        content: 'Join Emily Rodriguez for an exclusive live session on UX Design Best Practices this Friday at 3:00 PM EST. Learn about user research, wireframing, and prototyping techniques. This session is free for all enrolled students in the UX/UI Design Masterclass.',
        type: 'course',
        priority: 'medium',
        author: admins[1]._id,
        targetAudience: 'students',
        isPublished: true,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isSticky: false,
        allowComments: true,
        tags: ['live session', 'ux design', 'webinar']
      }
    ];

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`${createdAnnouncements.length} announcements created`);
    return createdAnnouncements;
  } catch (error) {
    console.error('Error creating announcements:', error);
    return [];
  }
};

// Create contact messages
const createContacts = async (courses) => {
  try {
    const contacts = [
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1234567802',
        subject: 'Question about React Course Prerequisites',
        message: 'Hi, I\'m interested in the React Development Bootcamp but I\'m not sure if I have the right prerequisites. I know basic HTML and CSS but my JavaScript knowledge is limited. Would this course be suitable for me?',
        type: 'course-inquiry',
        courseOfInterest: courses[0]._id,
        status: 'new',
        priority: 'medium'
      },
      {
        name: 'Mark Johnson',
        email: 'mark.johnson@email.com',
        phone: '+1234567803',
        subject: 'Enrollment Request - UX/UI Design Course',
        message: 'I would like to enroll in the UX/UI Design Masterclass. I\'m a complete beginner but very motivated to learn. Could you please provide information about the enrollment process and payment options?',
        type: 'enrollment-request',
        courseOfInterest: courses[1]._id,
        enrollmentDetails: {
          preferredStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          budget: 150,
          paymentMethod: 'credit-card',
          additionalRequirements: 'Would prefer weekend sessions if available'
        },
        status: 'in-progress',
        priority: 'medium'
      },
      {
        name: 'Lisa Chen',
        email: 'lisa.chen@email.com',
        subject: 'Technical Issue with Video Playback',
        message: 'I\'m experiencing issues with video playback in the React course. The videos keep buffering and sometimes don\'t load at all. I\'ve tried different browsers but the problem persists. Can you help?',
        type: 'technical-support',
        status: 'resolved',
        priority: 'high'
      },
      {
        name: 'David Rodriguez',
        email: 'david.rodriguez@email.com',
        phone: '+1234567804',
        subject: 'Corporate Training Inquiry',
        message: 'We\'re a tech startup looking to provide React training for our development team of 15 people. Do you offer corporate packages or group discounts? We\'d also be interested in customized content if possible.',
        type: 'general',
        status: 'new',
        priority: 'high'
      },
      {
        name: 'Amanda Foster',
        email: 'amanda.foster@email.com',
        subject: 'Certificate Not Generated',
        message: 'I completed the UX/UI Design course last week but haven\'t received my certificate yet. The system shows 100% completion. Could you please check and generate my certificate?',
        type: 'technical-support',
        status: 'resolved',
        priority: 'medium'
      },
      {
        name: 'Michael Thompson',
        email: 'michael.thompson@email.com',
        phone: '+1234567805',
        subject: 'Suggestion for New Course',
        message: 'I\'d love to see a course on Node.js and backend development. Many students are asking for this after completing the React course. Would be great to have a full-stack learning path.',
        type: 'suggestion',
        status: 'new',
        priority: 'low'
      }
    ];

    const createdContacts = await Contact.insertMany(contacts);
    console.log(`${createdContacts.length} contact messages created`);
    return createdContacts;
  } catch (error) {
    console.error('Error creating contacts:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    console.log('📝 Creating users...');
    const users = await createUsers();
    
    console.log('📚 Creating courses...');
    const courses = await createCourses(users);
    
    console.log('🎓 Creating enrollments...');
    const enrollments = await createEnrollments(users, courses);
    
    console.log('🎥 Creating live sessions...');
    const liveSessions = await createLiveSessions(users, courses);
    
    console.log('📢 Creating announcements...');
    const announcements = await createAnnouncements(users);
    
    console.log('📞 Creating contact messages...');
    const contacts = await createContacts(courses);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`🎓 Enrollments: ${enrollments.length}`);
    console.log(`🎥 Live Sessions: ${liveSessions.length}`);
    console.log(`📢 Announcements: ${announcements.length}`);
    console.log(`📞 Contact Messages: ${contacts.length}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@lms.com / Admin123!');
    console.log('Instructor: michael.chen@lms.com / Instructor123!');
    console.log('Student: john.smith@student.com / Student123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createUsers,
  createCourses,
  createEnrollments,
  createLiveSessions,
  createAnnouncements,
  createContacts
};
