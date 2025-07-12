import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center btn btn-primary"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
          <div className="text-sm text-gray-500">
            or
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center btn btn-secondary"
          >
            <FaSearch className="mr-2" />
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
