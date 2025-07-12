import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';

const AdminEnrollments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
        <p className="text-gray-600">Manage course enrollments and approvals</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaUserGraduate className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enrollment Management Interface
            </h3>
            <p className="text-gray-600">
              This would contain enrollment requests, approval workflows, and student progress tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;
