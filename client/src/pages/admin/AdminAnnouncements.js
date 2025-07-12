import React from 'react';
import { FaBullhorn, FaPlus } from 'react-icons/fa';

const AdminAnnouncements = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage system-wide announcements</p>
        </div>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" />
          New Announcement
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaBullhorn className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Announcement Management
            </h3>
            <p className="text-gray-600">
              Create and manage announcements for students and instructors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
