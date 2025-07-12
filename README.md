# Learning Management System (LMS)

A comprehensive Learning Management System built with React, Node.js, Express, and MongoDB. This platform supports multiple user roles (Admin, Instructor, Student) with features like course management, enrollment workflows, live sessions, and more.

## 🚀 Features

### For Students
- Browse and search courses with filters
- Enroll in courses (requires admin approval)
- Track learning progress
- Access course materials and videos
- View certificates upon completion
- Contact support

### For Instructors
- Create and manage courses
- Schedule live sessions
- Track student progress
- Manage course content
- View earnings and analytics

### For Admins
- User management (students, instructors)
- Course approval and management
- Enrollment approval workflows
- System announcements
- Contact message management
- Analytics and reporting

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

## 📁 Project Structure

```
lms-webapp/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── database/          # Database utilities
│   ├── .env              # Environment variables
│   ├── server.js         # Server entry point
│   └── package.json      # Backend dependencies
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── public/           # Static files
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB (local or cloud instance) - [Download here](https://www.mongodb.com/try/download/community)
- npm (comes with Node.js) or yarn

### Installation

1. **Install Node.js and MongoDB**
   - Download and install Node.js from https://nodejs.org/
   - Download and install MongoDB from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud) at https://www.mongodb.com/atlas

2. **Clone or navigate to the project**
   ```bash
   cd lms-webapp
   ```

3. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install

   # Return to root directory
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lms_db
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Make sure MongoDB is running, then seed the database:
   ```bash
   cd server
   node database/seedData.js
   ```

5. **Start the application**
   
   **Option 1: Start both servers simultaneously (from root)**
   ```bash
   npm run dev
   ```
   
   **Option 2: Start servers separately**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm start
   
   # Terminal 2 - Start frontend server
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 Demo Accounts

The system comes with pre-seeded demo accounts:

### Admin Account
- **Email:** admin@lms.com
- **Password:** Admin123!

### Instructor Account
- **Email:** michael.chen@lms.com
- **Password:** Instructor123!

### Student Account
- **Email:** john.smith@student.com
- **Password:** Student123!

## 🎨 Design System

The application uses a modern design system with:
- **Primary Colors:** Blue gradient (#004D96 to #0066CC)
- **Typography:** Inter font family
- **Components:** Consistent button styles, cards, forms
- **Responsive:** Mobile-first design approach
- **Icons:** React Icons library

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes for different user types
- Session management with automatic logout

## 🗄 Database Schema

### User Model
- Personal information
- Role-based permissions
- Authentication credentials
- Profile settings

### Course Model
- Course details and metadata
- Modular content structure
- Pricing and enrollment info
- Progress tracking

### Enrollment Model
- Student-course relationships
- Progress tracking
- Completion status
- Admin approval workflow

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@learnhub.com

## 🔄 Future Enhancements

- Video streaming integration
- Payment gateway integration
- Mobile app development
- Advanced analytics dashboard
- AI-powered course recommendations
- Multi-language support
- Offline course access
- Integration with external tools (Zoom, Google Meet)

---

**Built with ❤️ for modern online education**
