import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaEye, FaCheck, FaTimes, FaGraduationCap } from 'react-icons/fa';
import { enrollmentsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EnrollmentDetailsDialog from '../../components/admin/EnrollmentDetailsDialog';
import { Alert, Snackbar } from '@mui/material';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentsAPI.getAll();
      setEnrollments(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await enrollmentsAPI.approve(enrollmentId);
      } else if (newStatus === 'rejected') {
        await enrollmentsAPI.reject(enrollmentId);
      }
      await fetchEnrollments();
      setSnackbar({
        open: true,
        message: `Enrollment ${newStatus} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error updating enrollment status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      field: 'user',
      headerName: 'Student',
      flex: 1,
      valueGetter: (params) => params.row.user.name,
    },
    {
      field: 'course',
      headerName: 'Course',
      flex: 1,
      valueGetter: (params) => params.row.course.title,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${getStatusColor(params.value)}`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 130,
      renderCell: (params) => (
        <div className="w-full flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${params.value}%` }}
            />
          </div>
          <span className="text-sm">{params.value}%</span>
        </div>
      ),
    },
    {
      field: 'enrolledAt',
      headerName: 'Enrolled On',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<FaEye className="text-blue-600" />}
          label="View"
          onClick={() => handleViewEnrollment(params.row)}
        />,
        ...(params.row.status === 'pending' ? [
          <GridActionsCellItem
            icon={<FaCheck className="text-green-600" />}
            label="Approve"
            onClick={() => handleUpdateStatus(params.row.id, 'approved')}
          />,
          <GridActionsCellItem
            icon={<FaTimes className="text-red-600" />}
            label="Reject"
            onClick={() => handleUpdateStatus(params.row.id, 'rejected')}
          />,
        ] : []),
      ],
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Enrollments</h1>
        <p className="text-gray-600">Manage student enrollments and track progress</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={enrollments}
              columns={columns}
              pageSize={pageSize}
              page={page}
              rowsPerPageOptions={[5, 10, 20, 50]}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              disableSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              sortModel={[
                {
                  field: 'enrolledAt',
                  sort: 'desc',
                },
              ]}
            />
          </div>
        </div>
      </div>

      <EnrollmentDetailsDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedEnrollment(null);
        }}
        enrollment={selectedEnrollment}
        onUpdateStatus={handleUpdateStatus}
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

export default AdminEnrollments;
