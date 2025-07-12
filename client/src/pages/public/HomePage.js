import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaUsers, FaCertificate, FaStar } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-heading font-bold leading-tight">
                Learn Without
                <span className="block text-yellow-300">Limits</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join thousands of students learning from expert instructors. 
                Access high-quality courses, earn certificates, and advance your career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                  Browse Courses
                </Link>
                <Link to="/register" className="btn btn-lg btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                  Get Started Free
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-blue-200 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-blue-200 text-sm">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-blue-200 text-sm">Instructors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <FaPlay className="text-6xl text-white/80" />
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold">
                New Courses Weekly!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <FaUsers className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry professionals with years of real-world experience
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaPlay className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Interactive Learning</h3>
              <p className="text-gray-600">
                Engage with hands-on projects, quizzes, and live sessions
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <FaCertificate className="text-2xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Certificates</h3>
              <p className="text-gray-600">
                Earn recognized certificates upon successful course completion
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <FaStar className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quality Content</h3>
              <p className="text-gray-600">
                Access premium, up-to-date content curated by experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most loved courses by students worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="card-hover">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl"></div>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">Web Development</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="text-sm" />
                    <span className="text-sm text-gray-600">4.8 (120)</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Complete React Development
                </h3>
                <p className="text-gray-600 mb-4">
                  Master React from basics to advanced concepts with real-world projects
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">$199</span>
                  <Link to="/courses/1" className="btn btn-primary btn-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="card-hover">
              <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded-t-xl"></div>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-success">Design</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="text-sm" />
                    <span className="text-sm text-gray-600">4.9 (89)</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  UX/UI Design Masterclass
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn user experience and interface design from industry experts
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">$149</span>
                  <Link to="/courses/2" className="btn btn-primary btn-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="card-hover">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 rounded-t-xl"></div>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-warning">Data Science</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="text-sm" />
                    <span className="text-sm text-gray-600">4.7 (156)</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Data Science with Python
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete data science course with machine learning and analytics
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">$249</span>
                  <Link to="/courses/3" className="btn btn-primary btn-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/courses" className="btn btn-primary btn-lg">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already advancing their careers with our courses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
              Start Learning Today
            </Link>
            <Link to="/contact" className="btn btn-lg btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
