import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaFilter, FaSearch } from 'react-icons/fa';
import { coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await coursesAPI.getPublic({
          search: searchTerm,
          category: selectedCategory,
          level: selectedLevel
        });
        setCourses(response.data.courses || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        // Fallback to mock data
        setCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel]);

  // Mock data as fallback
  const mockCourses = [
    {
      id: 1,
      title: 'Complete React Development',
      instructor: 'John Doe',
      category: 'Web Development',
      level: 'Intermediate',
      price: 199,
      rating: 4.8,
      students: 1234,
      image: 'https://via.placeholder.com/300x200',
      description: 'Master React from basics to advanced concepts with real-world projects'
    },
    {
      id: 2,
      title: 'UX/UI Design Masterclass',
      instructor: 'Jane Smith',
      category: 'Design',
      level: 'Beginner',
      price: 149,
      rating: 4.9,
      students: 856,
      image: 'https://via.placeholder.com/300x200',
      description: 'Learn user experience and interface design from industry experts'
    },
    {
      id: 3,
      title: 'Data Science with Python',
      instructor: 'Mike Johnson',
      category: 'Data Science',
      level: 'Advanced',
      price: 249,
      rating: 4.7,
      students: 2341,
      image: 'https://via.placeholder.com/300x200',
      description: 'Complete data science course with machine learning and analytics'
    },
    {
      id: 4,
      title: 'Digital Marketing Strategy',
      instructor: 'Sarah Wilson',
      category: 'Marketing',
      level: 'Intermediate',
      price: 179,
      rating: 4.6,
      students: 987,
      image: 'https://via.placeholder.com/300x200',
      description: 'Learn modern digital marketing strategies and tools'
    },
    {
      id: 5,
      title: 'Mobile App Development',
      instructor: 'David Brown',
      category: 'Mobile Development',
      level: 'Intermediate',
      price: 229,
      rating: 4.8,
      students: 1567,
      image: 'https://via.placeholder.com/300x200',
      description: 'Build native mobile apps for iOS and Android'
    },
    {
      id: 6,
      title: 'Business Analytics',
      instructor: 'Lisa Davis',
      category: 'Business',
      level: 'Beginner',
      price: 159,
      rating: 4.5,
      students: 743,
      image: 'https://via.placeholder.com/300x200',
      description: 'Learn to analyze business data and make informed decisions'
    }
  ];

  const categories = ['Web Development', 'Design', 'Data Science', 'Marketing', 'Mobile Development', 'Business'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-custom section-padding">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover thousands of courses taught by expert instructors. Learn new skills and advance your career.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="aspect-video bg-gray-300 rounded-t-xl"></div>
                  <div className="card-body">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
              <div key={course.id} className="card-hover">
                <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary">{course.category}</span>
                    <span className="badge badge-secondary">{course.level}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {course.description}
                  </p>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    by {course.instructor}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500 text-sm" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.students.toLocaleString()} students
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">
                      ${course.price}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all courses.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
