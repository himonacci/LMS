import React from 'react';
import { FaVideo, FaPlus } from 'react-icons/fa';

const InstructorSessions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600">Manage your live teaching sessions</p>
        </div>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" />
          Schedule Session
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Live Session Management
            </h3>
            <p className="text-gray-600">
              Schedule and manage live teaching sessions with your students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSessions;
