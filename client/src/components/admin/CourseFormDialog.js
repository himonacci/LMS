import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const COURSE_STATUS = ['draft', 'published', 'archived'];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const CourseFormDialog = ({ open, onClose, onSubmit, course }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level: 'beginner',
    status: 'draft',
    thumbnail: '',
    category: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        duration: course.duration || '',
        level: course.level || 'beginner',
        status: course.status || 'draft',
        thumbnail: course.thumbnail || '',
        category: course.category || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        duration: '',
        level: 'beginner',
        status: 'draft',
        thumbnail: '',
        category: '',
      });
    }
    setErrors({});
  }, [course]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        price: Number(formData.price),
      });
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
          {course ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 py-4">
            <TextField
              name="title"
              label="Course Title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={4}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
              />

              <TextField
                name="duration"
                label="Duration (e.g., '8 weeks')"
                value={formData.duration}
                onChange={handleChange}
                error={!!errors.duration}
                helperText={errors.duration}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label="Difficulty Level"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {COURSE_STATUS.map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleChange}
              error={!!errors.category}
              helperText={errors.category}
              fullWidth
            />

            <TextField
              name="thumbnail"
              label="Thumbnail URL"
              value={formData.thumbnail}
              onChange={handleChange}
              fullWidth
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
            {course ? 'Update' : 'Create'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CourseFormDialog;
