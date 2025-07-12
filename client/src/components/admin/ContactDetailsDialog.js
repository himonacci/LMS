import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { FaUser, FaClock, FaEnvelope, FaPhone, FaTag, FaPaperclip } from 'react-icons/fa';

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const TYPE_OPTIONS = [
  'general',
  'course-inquiry',
  'technical-support',
  'enrollment-request',
  'complaint',
  'suggestion'
];

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContactDetailsDialog = ({ open, onClose, contact, onUpdate, onAddResponse }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [response, setResponse] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [status, setStatus] = useState(contact?.status || 'new');
  const [priority, setPriority] = useState(contact?.priority || 'medium');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmitResponse = () => {
    if (response.trim()) {
      onAddResponse({
        message: response,
        isInternal: isInternalNote
      });
      setResponse('');
      setIsInternalNote(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onUpdate({ status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
    onUpdate({ priority: newPriority });
  };

  if (!contact) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <Typography variant="h6">Contact Details</Typography>
          <div className="flex space-x-2">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                {PRIORITY_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="contact tabs">
          <Tab label="Details" />
          <Tab label="Responses" />
          {contact.type === 'enrollment-request' && <Tab label="Enrollment Details" />}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-400" />
                <div>
                  <Typography variant="caption" color="textSecondary">Name</Typography>
                  <Typography>{contact.name}</Typography>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-gray-400" />
                <div>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  <Typography>{contact.email}</Typography>
                </div>
              </div>
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-400" />
                  <div>
                    <Typography variant="caption" color="textSecondary">Phone</Typography>
                    <Typography>{contact.phone}</Typography>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <FaTag className="text-gray-400" />
                <div>
                  <Typography variant="caption" color="textSecondary">Type</Typography>
                  <Typography>{contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}</Typography>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <Typography variant="subtitle2" gutterBottom>Subject</Typography>
              <Typography>{contact.subject}</Typography>
            </div>

            <div>
              <Typography variant="subtitle2" gutterBottom>Message</Typography>
              <Typography style={{ whiteSpace: 'pre-wrap' }}>{contact.message}</Typography>
            </div>

            {contact.courseOfInterest && (
              <div>
                <Typography variant="subtitle2" gutterBottom>Course of Interest</Typography>
                <Typography>{contact.courseOfInterest.title}</Typography>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <div className="space-y-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {contact.responses.map((response, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    response.isInternal ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Typography variant="subtitle2">
                      {response.isInternal ? 'Internal Note' : 'Response'} by{' '}
                      {response.respondedBy.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(response.respondedAt).toLocaleString()}
                    </Typography>
                  </div>
                  <Typography style={{ whiteSpace: 'pre-wrap' }}>
                    {response.message}
                  </Typography>
                  {response.attachments?.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <FaPaperclip className="text-gray-400" />
                        <Typography variant="caption">Attachments:</Typography>
                      </div>
                      <div className="mt-1 space-y-1">
                        {response.attachments.map((attachment, idx) => (
                          <div key={idx} className="text-sm text-blue-600">
                            <a href={attachment.path} target="_blank" rel="noopener noreferrer">
                              {attachment.originalName}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Divider />

            <div className="space-y-2">
              <TextField
                multiline
                rows={3}
                fullWidth
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                variant="outlined"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <span>Internal Note</span>
                </label>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </TabPanel>

        {contact.type === 'enrollment-request' && (
          <TabPanel value={activeTab} index={2}>
            <div className="space-y-4">
              {contact.enrollmentDetails && (
                <>
                  {contact.enrollmentDetails.preferredStartDate && (
                    <div>
                      <Typography variant="subtitle2" gutterBottom>
                        Preferred Start Date
                      </Typography>
                      <Typography>
                        {new Date(contact.enrollmentDetails.preferredStartDate).toLocaleDateString()}
                      </Typography>
                    </div>
                  )}
                  {contact.enrollmentDetails.budget && (
                    <div>
                      <Typography variant="subtitle2" gutterBottom>
                        Budget
                      </Typography>
                      <Typography>
                        ${contact.enrollmentDetails.budget.toLocaleString()}
                      </Typography>
                    </div>
                  )}
                  {contact.enrollmentDetails.paymentMethod && (
                    <div>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Method
                      </Typography>
                      <Typography>
                        {contact.enrollmentDetails.paymentMethod.charAt(0).toUpperCase() +
                          contact.enrollmentDetails.paymentMethod.slice(1).replace('-', ' ')}
                      </Typography>
                    </div>
                  )}
                  {contact.enrollmentDetails.additionalRequirements && (
                    <div>
                      <Typography variant="subtitle2" gutterBottom>
                        Additional Requirements
                      </Typography>
                      <Typography style={{ whiteSpace: 'pre-wrap' }}>
                        {contact.enrollmentDetails.additionalRequirements}
                      </Typography>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabPanel>
        )}
      </DialogContent>

      <DialogActions className="p-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailsDialog;
