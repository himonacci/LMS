import React from 'react';
import { FaUser, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Management Interface
            </h3>
            <p className="text-gray-600">
              This would contain a table with user data, search, filters, and management actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
