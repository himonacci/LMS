import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaEdit, FaTrash, FaPlus, FaFlag } from 'react-icons/fa';
import { announcementsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AnnouncementFormDialog from '../../components/admin/AnnouncementFormDialog';
import { Alert, Snackbar } from '@mui/material';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenDialog(true);
  };

  const handleDelete = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsAPI.delete(announcementId);
        setSnackbar({
          open: true,
          message: 'Announcement deleted successfully',
          severity: 'success'
        });
        await fetchAnnouncements();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || 'Error deleting announcement',
          severity: 'error'
        });
      }
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'content',
      headerName: 'Content',
      flex: 2,
      renderCell: (params) => (
        <div className="truncate max-w-md" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'targetAudience',
      headerName: 'Audience',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'all' ? 'bg-purple-100 text-purple-800' :
          params.value === 'students' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'high' ? 'bg-red-100 text-red-800' :
          params.value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'validUntil',
      headerName: 'Valid Until',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<FaEdit className="text-blue-600" />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage system-wide announcements</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedAnnouncement(null);
            setOpenDialog(true);
          }}
        >
          <FaPlus className="mr-2" />
          Add Announcement
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={announcements}
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

      <AnnouncementFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedAnnouncement(null);
        }}
        onSubmit={async (formData) => {
          try {
            if (selectedAnnouncement) {
              await announcementsAPI.update(selectedAnnouncement.id, formData);
              setSnackbar({
                open: true,
                message: 'Announcement updated successfully',
                severity: 'success'
              });
            } else {
              await announcementsAPI.create(formData);
              setSnackbar({
                open: true,
                message: 'Announcement created successfully',
                severity: 'success'
              });
            }
            await fetchAnnouncements();
            setOpenDialog(false);
            setSelectedAnnouncement(null);
          } catch (err) {
            setSnackbar({
              open: true,
              message: err.message || 'An error occurred',
              severity: 'error'
            });
          }
        }}
        announcement={selectedAnnouncement}
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

export default AdminAnnouncements;
