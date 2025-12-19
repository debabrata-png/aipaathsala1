// components/AssignmentRoom.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Stack
} from '@mui/material';
import { Add } from '@mui/icons-material';
import FileUpload from '.././FileUpload';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const AssignmentRoom = ({ course, socket, roomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openSubmission, setOpenSubmission] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    assignment: '',
    description: '',
    duedate: '',
    methodology: '',
    learning: '',
    doclink: ''
  });
  const [submissionForm, setSubmissionForm] = useState({
    description: '',
    doclink: ''
  });

  const ru = global1.userRole?.toUpperCase();
  const permissions = {
    isFaculty: ru === 'FACULTY',
    isStudent: ru === 'STUDENT',
    canCreateAssignments: ru === 'FACULTY',
    canViewAssignments: ru === 'FACULTY' || ru === 'STUDENT',
    canSubmitAssignments: ru === 'STUDENT',
    canViewSubmissions: ru === 'FACULTY'
  };

  useEffect(() => {
    if (permissions.canViewAssignments && course) fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.coursecode, permissions.canViewAssignments]);

  useEffect(() => {
    if (!socket || !course) return;
    const onNew = () => fetchAssignments();
    const onResp = () => selectedAssignment && fetchSubmissions(selectedAssignment._id);
    socket.on('new_assignment', onNew);
    socket.on('assignment_response', onResp);
    return () => {
      socket.off('new_assignment', onNew);
      socket.off('assignment_response', onResp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, selectedAssignment?._id, course?.coursecode]);

  const fetchAssignments = async () => {
    if (!course) return;
    setLoading(true);
    try {
      let response;
      if (permissions.isStudent) {
        response = await ep3.get('/getassignmentsfirstudentremedial', {
          params: {
            coursecode: course.coursecode,
            colid: global1.colid,
            regno: global1.userRegno
          }
        });
      } else {
        response = await ep3.get('/getassignmentsbycourseremedial', {
          params: {
            coursecode: course.coursecode,
            colid: global1.colid
          }
        });
      }
      if (response.data.success) setAssignments(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    if (!permissions.canViewSubmissions) return;
    const response = await ep3.get(`/getassignmentsubmissionsremedial/${assignmentId}`);
    if (response.data.success) setSubmissions(response.data.data || []);
  };

  const handleCreateAssignment = async () => {
    if (!permissions.canCreateAssignments) return alert('No permission');
    const f = assignmentForm;
    if (!f.assignment || !f.description || !f.duedate) return alert('Please fill required fields');
    try {
      const response = await ep3.post('/createassignmentremedial', {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        year: course.year,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        ...f
      });
      if (response.data.success) {
        setOpenAssignment(false);
        setAssignmentForm({ assignment: '', description: '', duedate: '', methodology: '', learning: '', doclink: '' });
        fetchAssignments();
        if (socket) {
          socket.emit('assignment_posted', {
            room: roomId,
            assignment: response.data.data
          });
        }
      }
    } catch {
      alert('Failed to create assignment');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!permissions.canSubmitAssignments) return alert('No permission');
    if (!submissionForm.description) return alert('Provide a submission description');
    try {
      const response = await ep3.post('/submitassignmentremedial', {
        name: global1.userName,
        user: selectedAssignment.user,
        colid: global1.colid,
        year: course.year,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        assignment: selectedAssignment.assignment,
        assignmentid: selectedAssignment._id,
        student: global1.userName,
        regno: global1.userRegno,
        ...submissionForm
      });
      if (response.data.success) {
        setOpenSubmission(false);
        setSubmissionForm({ description: '', doclink: '' });
        fetchAssignments();
        if (socket) {
          socket.emit('assignment_submitted', {
            room: roomId,
            submission: response.data.data,
            assignmentId: selectedAssignment._id
          });
        }
        alert('Assignment submitted successfully!');
      }
    } catch {
      alert('Failed to submit assignment');
    }
  };

  const handleFileUpload = (url, isSubmission = false) => {
    if (isSubmission) setSubmissionForm({ ...submissionForm, doclink: url });
    else setAssignmentForm({ ...assignmentForm, doclink: url });
  };

  const getFileName = (u) => (!u ? '' : u.split('/').pop());
  const isOverdue = (d) => new Date(d) < new Date();
  const formatDate = (s) => new Date(s).toLocaleDateString();

  if (!permissions.canViewAssignments) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Alert severity="warning">You do not have permission to view assignments.</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {permissions.isFaculty
          ? 'As Faculty, you can create assignments and view all submissions.'
          : 'As a Student, you can view assignments and submit your responses.'}
      </Alert>

      {permissions.canCreateAssignments && (
        <Button
          onClick={() => setOpenAssignment(true)}
          variant="contained"
          sx={{ mb: 2, backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, textTransform: 'none', borderRadius: 2 }}
          startIcon={<Add />}
        >
          Create Assignment
        </Button>
      )}

      {loading ? (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : assignments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            {permissions.isFaculty ? 'No assignments created yet' : 'No assignments available'}
          </Typography>
          {permissions.canCreateAssignments && (
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>Create your first assignment to get started</Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {assignments.map((a) => (
            <Grid key={a._id} item xs={12} md={6}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{a.assignment}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Due: {formatDate(a.duedate)}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{a.description}</Typography>
                  {a.methodology && <Typography sx={{ mt: 1 }} variant="body2">Methodology: {a.methodology}</Typography>}
                  {a.doclink && (
                    <Button href={a.doclink} target="_blank" size="small" variant="outlined" sx={{ textTransform: 'none', mt: 1 }}>
                      Download ({getFileName(a.doclink)})
                    </Button>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {permissions.canSubmitAssignments && !a.hasSubmitted && !isOverdue(a.duedate) && (
                      <Button size="small" variant="contained" onClick={() => { setSelectedAssignment(a); setOpenSubmission(true); }}>
                        Submit
                      </Button>
                    )}
                    {permissions.isStudent && a.hasSubmitted && (
                      <Button size="small" variant="outlined" color="success" onClick={() => { setSelectedAssignment(a); setOpenSubmission(true); }}>
                        View Submission
                      </Button>
                    )}
                    {permissions.canViewSubmissions && (
                      <Button size="small" variant="outlined" onClick={() => { setSelectedAssignment(a); fetchSubmissions(a._id); setOpenSubmission(true); }}>
                        View Submissions
                      </Button>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Posted by {a.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={openAssignment} onClose={() => setOpenAssignment(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth label="Title" sx={{ mb: 2 }} value={assignmentForm.assignment} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignment: e.target.value })} />
          <TextField fullWidth label="Description" sx={{ mb: 2 }} value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
          <TextField fullWidth label="Due Date" type="date" sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={assignmentForm.duedate} onChange={(e) => setAssignmentForm({ ...assignmentForm, duedate: e.target.value })} />
          <TextField fullWidth label="Methodology" sx={{ mb: 2 }} value={assignmentForm.methodology} onChange={(e) => setAssignmentForm({ ...assignmentForm, methodology: e.target.value })} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachment (Optional)</Typography>
          <FileUpload onUpload={(url) => setAssignmentForm({ ...assignmentForm, doclink: url })} />
          {assignmentForm.doclink && <Typography variant="caption">File uploaded: {assignmentForm.doclink.split('/').pop()}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignment(false)}>Cancel</Button>
          <Button onClick={handleCreateAssignment} variant="contained">Create Assignment</Button>
        </DialogActions>
      </Dialog>

      {/* Submit / View Assignment Dialog */}
      <Dialog open={openSubmission} onClose={() => setOpenSubmission(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {permissions.canSubmitAssignments ? 'Submit Assignment' : 'Assignment Submissions'}: {selectedAssignment?.assignment}
        </DialogTitle>
        <DialogContent dividers>
          {permissions.canSubmitAssignments && !selectedAssignment?.hasSubmitted && (
            <>
              <TextField fullWidth label="Submission Description" sx={{ mb: 2 }} value={submissionForm.description} onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Assignment File</Typography>
              <FileUpload onUpload={(url) => setSubmissionForm({ ...submissionForm, doclink: url })} />
              {submissionForm.doclink && <Typography variant="caption">File uploaded: {submissionForm.doclink.split('/').pop()}</Typography>}
            </>
          )}

          {permissions.isStudent && selectedAssignment?.submission && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Your Submission</Typography>
              <Typography>Description: {selectedAssignment.submission.description}</Typography>
              <Typography variant="body2" color="text.secondary">Submitted: {formatDate(selectedAssignment.submission.submitdate)}</Typography>
              {selectedAssignment.submission.doclink && (
                <Button href={selectedAssignment.submission.doclink} target="_blank" size="small" variant="outlined" sx={{ mt: 1 }}>
                  Download ({selectedAssignment.submission.doclink.split('/').pop()})
                </Button>
              )}
            </Box>
          )}

          {permissions.canViewSubmissions && submissions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>All Student Submissions ({submissions.length})</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {submissions.map((s) => (
                  <Paper key={s._id} sx={{ p: 1.5 }}>
                    <Typography sx={{ fontWeight: 600 }}>{s.student}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Regno: {s.regno} • Submitted: {formatDate(s.submitdate)}
                    </Typography>
                    {s.doclink && (
                      <Button href={s.doclink} target="_blank" size="small" sx={{ mt: 0.5 }}>
                        Download ({s.doclink.split('/').pop()})
                      </Button>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {permissions.canViewSubmissions && submissions.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No submissions yet</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmission(false)}>Close</Button>
          {permissions.canSubmitAssignments && !selectedAssignment?.hasSubmitted && (
            <Button onClick={handleSubmitAssignment} variant="contained">Submit Assignment</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentRoom;
