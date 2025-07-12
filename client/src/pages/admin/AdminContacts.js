import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaEye, FaCheck, FaArchive, FaTimes } from 'react-icons/fa';
import { contactAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ContactDetailsDialog from '../../components/admin/ContactDetailsDialog';
import { Alert, Snackbar } from '@mui/material';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setContacts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setOpenDialog(true);
  };

  const handleUpdateContact = async (contactId, updateData) => {
    try {
      await contactAPI.update(contactId, updateData);
      await fetchContacts();
      setSnackbar({
        open: true,
        message: 'Contact updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error updating contact',
        severity: 'error'
      });
    }
  };

  const handleAddResponse = async (contactId, responseData) => {
    try {
      await contactAPI.addResponse(contactId, responseData);
      await fetchContacts();
      setSnackbar({
        open: true,
        message: 'Response added successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error adding response',
        severity: 'error'
      });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1.5,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'technical-support' ? 'bg-red-100 text-red-800' :
          params.value === 'course-inquiry' ? 'bg-blue-100 text-blue-800' :
          params.value === 'enrollment-request' ? 'bg-purple-100 text-purple-800' :
          params.value === 'complaint' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {params.value.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'new' ? 'bg-green-100 text-green-800' :
          params.value === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          params.value === 'resolved' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {params.value.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
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
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<FaEye className="text-blue-600" />}
          label="View"
          onClick={() => handleViewContact(params.row)}
        />,
      ],
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
        <p className="text-gray-600">View and manage contact form submissions</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={contacts}
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
                  field: 'createdAt',
                  sort: 'desc',
                },
              ]}
            />
          </div>
        </div>
      </div>

      <ContactDetailsDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onUpdate={(updateData) => {
          if (selectedContact) {
            handleUpdateContact(selectedContact.id, updateData);
          }
        }}
        onAddResponse={(responseData) => {
          if (selectedContact) {
            handleAddResponse(selectedContact.id, responseData);
          }
        }}
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

export default AdminContacts;
