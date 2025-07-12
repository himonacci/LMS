import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaUsers, 
  FaChartBar, 
  FaBullhorn, 
  FaEnvelope, 
  FaVideo, 
  FaCog,
  FaGraduationCap,
  FaUserGraduate
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const DashboardSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = {
    student: [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
      { path: '/dashboard/my-courses', icon: FaBook, label: 'My Courses' },
      { path: '/dashboard/live-sessions', icon: FaVideo, label: 'Live Sessions' },
      { path: '/dashboard/certificates', icon: FaGraduationCap, label: 'Certificates' },
    ],
    instructor: [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
      { path: '/dashboard/instructor', icon: FaChartBar, label: 'Overview' },
      { path: '/dashboard/instructor/courses', icon: FaBook, label: 'My Courses' },
      { path: '/dashboard/instructor/sessions', icon: FaVideo, label: 'Live Sessions' },
      { path: '/dashboard/instructor/students', icon: FaUserGraduate, label: 'Students' },
    ],
    admin: [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
      { path: '/dashboard/admin', icon: FaChartBar, label: 'Admin Panel' },
      { path: '/dashboard/admin/users', icon: FaUsers, label: 'Users' },
      { path: '/dashboard/admin/courses', icon: FaBook, label: 'Courses' },
      { path: '/dashboard/admin/enrollments', icon: FaUserGraduate, label: 'Enrollments' },
      { path: '/dashboard/admin/announcements', icon: FaBullhorn, label: 'Announcements' },
      { path: '/dashboard/admin/contacts', icon: FaEnvelope, label: 'Contact Messages' },
    ]
  };

  const currentMenuItems = menuItems[user?.role] || menuItems.student;

  return (
    <div className="w-64 bg-white shadow-soft border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="text-xl font-heading font-bold text-gray-900">
            LearnHub
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${
                    active ? 'nav-link-active' : 'nav-link-inactive'
                  } w-full justify-start`}
                >
                  <Icon className="mr-3 text-lg" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/dashboard/settings"
          className={`${
            isActive('/dashboard/settings') ? 'nav-link-active' : 'nav-link-inactive'
          } w-full justify-start`}
        >
          <FaCog className="mr-3 text-lg" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;
