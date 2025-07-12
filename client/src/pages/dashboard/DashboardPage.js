import React from 'react';
import { FaBook, FaUsers, FaChartLine, FaClock } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your learning journey today.
          </p>
        </div>
      </div>

      {getDashboardContent()}
    </div>
  );
};

const StudentDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaBook className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FaChartLine className="text-green-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
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
            <p className="text-sm font-medium text-gray-600">Hours Learned</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaUsers className="text-purple-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Certificates</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InstructorDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaBook className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">My Courses</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FaUsers className="text-green-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <FaChartLine className="text-yellow-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900">4.8</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaClock className="text-purple-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$2,450</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaUsers className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">1,234</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FaBook className="text-green-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">89</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <FaChartLine className="text-yellow-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Enrollments</p>
            <p className="text-2xl font-bold text-gray-900">3,456</p>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaClock className="text-purple-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$45,678</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardPage;
