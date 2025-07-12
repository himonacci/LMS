import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  LinearProgress,
} from '@mui/material';
import { FaGraduationCap, FaBook, FaClipboardList, FaClock, FaCertificate } from 'react-icons/fa';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enrollment-tabpanel-${index}`}
      aria-labelledby={`enrollment-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnrollmentDetailsDialog = ({ open, onClose, enrollment, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!enrollment) return null;

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(enrollment.id, newStatus);
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
          <Typography variant="h6">Enrollment Details</Typography>
          <div className="flex space-x-2">
            {enrollment.status === 'pending' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange('approved')}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleStatusChange('rejected')}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="subtitle2" color="textSecondary">Student</Typography>
              <Typography>{enrollment.user.name}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Course</Typography>
              <Typography>{enrollment.course.title}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Enrolled On</Typography>
              <Typography>{new Date(enrollment.enrolledAt).toLocaleDateString()}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <div className={`px-2 py-1 rounded text-sm inline-block ${getStatusColor(enrollment.status)}`}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Progress
            </Typography>
            <div className="flex items-center space-x-2">
              <LinearProgress
                variant="determinate"
                value={enrollment.progress}
                sx={{ 
                  width: '100%',
                  height: 8,
                  borderRadius: 4
                }}
              />
              <Typography variant="body2">{enrollment.progress}%</Typography>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onChange={handleTabChange} aria-label="enrollment tabs">
          <Tab label="Course Progress" />
          <Tab label="Quiz Results" />
          <Tab label="Assignments" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <div className="space-y-4">
            <Typography variant="subtitle1" gutterBottom>
              Completed Lessons
            </Typography>
            {enrollment.completedLessons.map((lesson, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <div>
                    <Typography variant="subtitle2">Module: {lesson.moduleId}</Typography>
                    <Typography variant="body2">Lesson: {lesson.lessonId}</Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="caption" color="textSecondary">
                      Completed on: {new Date(lesson.completedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Time spent: {lesson.timeSpent} minutes
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <div className="space-y-4">
            {enrollment.quizResults.map((quiz, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Typography variant="subtitle2">
                      Quiz Result - Module {quiz.moduleId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lesson {quiz.lessonId}
                    </Typography>
                  </div>
                  <div className={`px-3 py-1 rounded ${quiz.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {quiz.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <Typography variant="caption" color="textSecondary">Score</Typography>
                    <Typography>{quiz.score}%</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="textSecondary">Correct Answers</Typography>
                    <Typography>{quiz.correctAnswers}/{quiz.totalQuestions}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="textSecondary">Time Spent</Typography>
                    <Typography>{quiz.timeSpent} minutes</Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <div className="space-y-4">
            {enrollment.assignmentSubmissions.map((submission, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Typography variant="subtitle2">
                      Assignment - Module {submission.moduleId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Lesson {submission.lessonId}
                    </Typography>
                  </div>
                  <div className={`px-3 py-1 rounded ${
                    submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                    submission.status === 'returned' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </div>
                </div>

                {submission.submissionText && (
                  <div className="mb-3">
                    <Typography variant="subtitle2" gutterBottom>Submission</Typography>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {submission.submissionText}
                    </Typography>
                  </div>
                )}

                {submission.files?.length > 0 && (
                  <div className="mb-3">
                    <Typography variant="subtitle2" gutterBottom>Files</Typography>
                    <div className="space-y-1">
                      {submission.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="text-sm">
                          <a
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {file.originalName}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.grade && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>Grade</Typography>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography variant="caption" color="textSecondary">Score</Typography>
                        <Typography>{submission.grade.score}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="textSecondary">Graded By</Typography>
                        <Typography>{submission.grade.gradedBy?.name || 'N/A'}</Typography>
                      </div>
                    </div>
                    {submission.grade.feedback && (
                      <div className="mt-2">
                        <Typography variant="caption" color="textSecondary">Feedback</Typography>
                        <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                          {submission.grade.feedback}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabPanel>
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

export default EnrollmentDetailsDialog;
