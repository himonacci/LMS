import React from 'react';
import { FaUsers, FaBook, FaChartLine, FaDollarSign, FaUserGraduate, FaBullhorn } from 'react-icons/fa';

const AdminDashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalUsers: 1234,
    totalCourses: 89,
    totalEnrollments: 3456,
    totalRevenue: 45678,
    pendingEnrollments: 23,
    activeInstructors: 15
  };

  const recentActivities = [
    {
      id: 1,
      type: 'enrollment',
      message: 'New enrollment in "React Development"',
      user: 'John Smith',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'course',
      message: 'New course "Python Basics" submitted for review',
      user: 'Jane Doe',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'user',
      message: 'New instructor registration',
      user: 'Mike Johnson',
      time: '1 hour ago'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment received for "UX Design Course"',
      user: 'Sarah Wilson',
      time: '2 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of your learning management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaUserGraduate className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingEnrollments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FaBullhorn className="text-indigo-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Instructors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInstructors}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary justify-start">
                <FaUsers className="mr-2" />
                Manage Users
              </button>
              <button className="w-full btn btn-secondary justify-start">
                <FaBook className="mr-2" />
                Review Courses
              </button>
              <button className="w-full btn btn-secondary justify-start">
                <FaUserGraduate className="mr-2" />
                Approve Enrollments
              </button>
              <button className="w-full btn btn-secondary justify-start">
                <FaBullhorn className="mr-2" />
                Send Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Enrollment Trends
            </h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaChartLine className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart would go here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Overview
            </h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaDollarSign className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Revenue chart would go here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
