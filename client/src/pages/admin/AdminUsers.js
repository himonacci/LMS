import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaUser, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserFormDialog from '../../components/admin/UserFormDialog';
import { Alert, Snackbar } from '@mui/material';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        await fetchUsers();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || 'Error deleting user',
          severity: 'error'
        });
      }
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await usersAPI.update(userId, { status: newStatus });
      setSnackbar({
        open: true,
        message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
      await fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error updating user status',
        severity: 'error'
      });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'admin' ? 'bg-purple-100 text-purple-800' :
          params.value === 'instructor' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded text-sm ${
          params.value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
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
          icon={params.row.status === 'active' ? 
            <FaTimes className="text-red-600" /> : 
            <FaCheck className="text-green-600" />}
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedUser(null);
            setOpenDialog(true);
          }}
        >
          <FaPlus className="mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={users}
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

      <UserFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedUser(null);
        }}
        onSubmit={async (formData) => {
          try {
            if (selectedUser) {
              await usersAPI.update(selectedUser.id, formData);
              setSnackbar({
                open: true,
                message: 'User updated successfully',
                severity: 'success'
              });
            } else {
              await usersAPI.create(formData);
              setSnackbar({
                open: true,
                message: 'User created successfully',
                severity: 'success'
              });
            }
            await fetchUsers();
            setOpenDialog(false);
            setSelectedUser(null);
          } catch (err) {
            setSnackbar({
              open: true,
              message: err.message || 'An error occurred',
              severity: 'error'
            });
          }
        }}
        user={selectedUser}
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

export default AdminUsers;
