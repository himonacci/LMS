import React from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaCheck, FaLock } from 'react-icons/fa';

const CourseViewPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Viewer</h1>
        <p className="text-gray-600">Continue learning with interactive lessons</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-body">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                <FaPlay className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Lesson 1: Introduction to React
              </h2>
              <p className="text-gray-600">
                Video player and lesson content would be displayed here.
              </p>
            </div>
          </div>
        </div>

        {/* Course Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Content
              </h3>
              <div className="space-y-2">
                <div className="flex items-center p-2 bg-primary-50 rounded-lg">
                  <FaCheck className="text-primary-600 mr-2" />
                  <span className="text-sm">Lesson 1: Introduction</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <FaPlay className="text-gray-400 mr-2" />
                  <span className="text-sm">Lesson 2: Components</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <FaLock className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Lesson 3: State</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
