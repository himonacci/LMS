import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <FaSpinner className={`animate-spin text-primary-600 mb-2 ${sizeClasses[size]}`} />
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
