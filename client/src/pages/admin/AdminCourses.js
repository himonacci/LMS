import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaBook, FaEdit, FaTrash, FaPlus, FaEye, FaToggleOn } from 'react-icons/fa';
import { coursesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CourseFormDialog from '../../components/admin/CourseFormDialog';
import { Alert, Snackbar } from '@mui/material';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.delete(courseId);
        setSnackbar({
          open: true,
          message: 'Course deleted successfully',
          severity: 'success'
        });
        await fetchCourses();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || 'Error deleting course',
          severity: 'error'
        });
      }
    }
  };

  const toggleStatus = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await coursesAPI.update(courseId, { status: newStatus });
      setSnackbar({
        open: true,
        message: `Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        severity: 'success'
      });
      await fetchCourses();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error updating course status',
        severity: 'error'
      });
    }
  };

  const columns = [
    {
      field: 'thumbnail',
      headerName: 'Thumbnail',
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value || 'https://via.placeholder.com/50'}
          alt="course thumbnail"
          className="w-12 h-12 rounded object-cover"
        />
      ),
    },
    { field: 'title', headerName: 'Title', flex: 1 },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100,
      renderCell: (params) => `$${params.value.toLocaleString()}`,
    },
    { field: 'duration', headerName: 'Duration', width: 120 },
    {
      field: 'level',
      headerName: 'Level',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'beginner' ? 'bg-green-100 text-green-800' :
          params.value === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'published' ? 'bg-green-100 text-green-800' :
          params.value === 'draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<FaEdit className="text-blue-600" />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<FaToggleOn className={
            params.row.status === 'published' ? 'text-red-600' : 'text-green-600'
          } />}
          label="Toggle Status"
          onClick={() => toggleStatus(params.row.id, params.row.status)}
        />,
        <GridActionsCellItem
          icon={<FaTrash className="text-red-600" />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Manage all courses in the system</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedCourse(null);
            setOpenDialog(true);
          }}
        >
          <FaPlus className="mr-2" />
          Add Course
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={courses}
              columns={columns}
              pageSize={pageSize}
              page={page}
              rowsPerPageOptions={[5, 10, 20, 50]}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              disableSelectionOnClick
              disableColumnFilter
              disableColumnMenu
            />
          </div>
        </div>
      </div>

      <CourseFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedCourse(null);
        }}
        onSubmit={async (formData) => {
          try {
            if (selectedCourse) {
              await coursesAPI.update(selectedCourse.id, formData);
              setSnackbar({
                open: true,
                message: 'Course updated successfully',
                severity: 'success'
              });
            } else {
              await coursesAPI.create(formData);
              setSnackbar({
                open: true,
                message: 'Course created successfully',
                severity: 'success'
              });
            }
            await fetchCourses();
            setOpenDialog(false);
            setSelectedCourse(null);
          } catch (err) {
            setSnackbar({
              open: true,
              message: err.message || 'An error occurred',
              severity: 'error'
            });
          }
        }}
        course={selectedCourse}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminCourses;
