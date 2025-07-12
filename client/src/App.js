import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import CoursesPage from './pages/public/CoursesPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ContactPage from './pages/public/ContactPage';

// Protected Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseViewPage from './pages/student/CourseViewPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminContacts from './pages/admin/AdminContacts';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import InstructorSessions from './pages/instructor/InstructorSessions';

// Utility Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                
                {/* Student Routes */}
                <Route path="my-courses" element={<MyCoursesPage />} />
                <Route path="course/:id" element={<CourseViewPage />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="admin/courses" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCourses />
                  </ProtectedRoute>
                } />
                <Route path="admin/enrollments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminEnrollments />
                  </ProtectedRoute>
                } />
                <Route path="admin/announcements" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnnouncements />
                  </ProtectedRoute>
                } />
                <Route path="admin/contacts" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminContacts />
                  </ProtectedRoute>
                } />
                
                {/* Instructor Routes */}
                <Route path="instructor" element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="instructor/courses" element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorCourses />
                  </ProtectedRoute>
                } />
                <Route path="instructor/sessions" element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorSessions />
                  </ProtectedRoute>
                } />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
