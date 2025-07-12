import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const TARGET_AUDIENCES = ['all', 'students', 'instructors'];
const PRIORITIES = ['low', 'medium', 'high'];

const AnnouncementFormDialog = ({ open, onClose, onSubmit, announcement }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'medium',
    validUntil: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        targetAudience: announcement.targetAudience || 'all',
        priority: announcement.priority || 'medium',
        validUntil: announcement.validUntil ? 
          new Date(announcement.validUntil).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        targetAudience: 'all',
        priority: 'medium',
        validUntil: '',
      });
    }
    setErrors({});
  }, [announcement]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    } else if (new Date(formData.validUntil) < new Date()) {
      newErrors.validUntil = 'Valid until date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {announcement ? 'Edit Announcement' : 'Create Announcement'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 py-4">
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
            />

            <TextField
              name="content"
              label="Content"
              value={formData.content}
              onChange={handleChange}
              error={!!errors.content}
              helperText={errors.content}
              multiline
              rows={4}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  label="Target Audience"
                >
                  {TARGET_AUDIENCES.map(audience => (
                    <MenuItem key={audience} value={audience}>
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  {PRIORITIES.map(priority => (
                    <MenuItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              name="validUntil"
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={handleChange}
              error={!!errors.validUntil}
              helperText={errors.validUntil}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {announcement ? 'Update' : 'Create'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnnouncementFormDialog;
