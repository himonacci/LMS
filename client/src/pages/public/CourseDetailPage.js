import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaPlay, FaClock, FaUsers, FaCheck, FaBookmark } from 'react-icons/fa';

const CourseDetailPage = () => {
  const { id } = useParams();

  // Mock course data - in real app, this would come from API
  const course = {
    id: 1,
    title: 'Complete React Development',
    instructor: 'John Doe',
    category: 'Web Development',
    level: 'Intermediate',
    price: 199,
    originalPrice: 299,
    rating: 4.8,
    students: 1234,
    duration: '12 hours',
    lessons: 45,
    image: 'https://via.placeholder.com/800x400',
    description: 'Master React from basics to advanced concepts with real-world projects. This comprehensive course covers everything you need to know to become a proficient React developer.',
    longDescription: `
      This comprehensive React course is designed to take you from beginner to advanced level. 
      You'll learn modern React concepts including hooks, context, and state management. 
      The course includes hands-on projects that you can add to your portfolio.
    `,
    whatYouWillLearn: [
      'Build modern React applications from scratch',
      'Master React Hooks and functional components',
      'Implement state management with Context API',
      'Create responsive and interactive user interfaces',
      'Deploy React applications to production',
      'Best practices for React development'
    ],
    curriculum: [
      {
        title: 'Getting Started with React',
        lessons: 8,
        duration: '2 hours'
      },
      {
        title: 'Components and JSX',
        lessons: 10,
        duration: '2.5 hours'
      },
      {
        title: 'State and Props',
        lessons: 12,
        duration: '3 hours'
      },
      {
        title: 'React Hooks',
        lessons: 15,
        duration: '4.5 hours'
      }
    ],
    requirements: [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with ES6+ features',
      'A computer with internet connection',
      'Code editor (VS Code recommended)'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container-custom py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge badge-primary">{course.category}</span>
                  <span className="badge badge-secondary">{course.level}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {course.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-medium">{course.rating}</span>
                    <span>({course.students} students)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-gray-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaPlay className="text-gray-400" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Created by <span className="font-medium text-primary-600">{course.instructor}</span>
                </div>
              </div>

              {/* Course Image */}
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-6">
                <div className="card-body">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-primary-600">
                        ${course.price}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${course.originalPrice}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      33% off - Limited time offer!
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <Link
                      to="/login"
                      className="w-full btn btn-primary btn-lg"
                    >
                      Enroll Now
                    </Link>
                    <button className="w-full btn btn-secondary">
                      <FaBookmark className="mr-2" />
                      Add to Wishlist
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>Mobile and desktop access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  What you'll learn
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Course content
                </h2>
                <div className="space-y-4">
                  {course.curriculum.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            {section.lessons} lessons • {section.duration}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm">
                          Detailed lessons covering {section.title.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Description
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {course.longDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Instructor
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {course.instructor.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {course.instructor}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Senior React Developer
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    John is a senior React developer with over 8 years of experience 
                    building web applications. He has worked with companies like Google 
                    and Facebook and is passionate about teaching.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
