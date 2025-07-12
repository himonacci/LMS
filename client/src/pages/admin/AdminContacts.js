import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const AdminContacts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600">Manage contact form submissions</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contact Messages
            </h3>
            <p className="text-gray-600">
              View and respond to contact form submissions from users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
