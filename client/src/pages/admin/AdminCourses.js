import React from 'react';
import { FaBook, FaPlus } from 'react-icons/fa';

const AdminCourses = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Manage all courses in the system</p>
        </div>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" />
          Add Course
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Course Management Interface
            </h3>
            <p className="text-gray-600">
              This would contain course listings, approval workflows, and content management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
