import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaClock, FaCheckCircle, FaBook } from 'react-icons/fa';

const MyCoursesPage = () => {
  // Mock data - in real app, this would come from API
  const enrolledCourses = [
    {
      id: 1,
      title: 'Complete React Development',
      instructor: 'John Doe',
      progress: 65,
      totalLessons: 45,
      completedLessons: 29,
      lastAccessed: '2 days ago',
      thumbnail: 'https://via.placeholder.com/300x200',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'UX/UI Design Masterclass',
      instructor: 'Jane Smith',
      progress: 100,
      totalLessons: 32,
      completedLessons: 32,
      lastAccessed: '1 week ago',
      thumbnail: 'https://via.placeholder.com/300x200',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Data Science with Python',
      instructor: 'Mike Johnson',
      progress: 25,
      totalLessons: 58,
      completedLessons: 14,
      lastAccessed: '3 days ago',
      thumbnail: 'https://via.placeholder.com/300x200',
      status: 'in-progress'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'in-progress':
        return <span className="badge badge-primary">In Progress</span>;
      default:
        return <span className="badge badge-secondary">Not Started</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600">
            Continue your learning journey with your enrolled courses
          </p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          Browse More Courses
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBook className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(course => course.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(course => course.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map(course => (
          <div key={course.id} className="card-hover">
            <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                {getStatusBadge(course.status)}
                <span className="text-sm text-gray-500">
                  Last accessed {course.lastAccessed}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                by {course.instructor}
              </p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {course.completedLessons} of {course.totalLessons} lessons
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {course.status === 'completed' ? (
                  <Link
                    to={`/dashboard/course/${course.id}/certificate`}
                    className="btn btn-success btn-sm"
                  >
                    View Certificate
                  </Link>
                ) : (
                  <Link
                    to={`/dashboard/course/${course.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <FaPlay className="mr-2" />
                    Continue Learning
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBook className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses enrolled yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your learning journey by enrolling in your first course.
          </p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
