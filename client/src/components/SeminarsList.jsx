// src/components/SeminarsList.jsx
import React, { useEffect, useState } from 'react';
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
  Grid,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Group, 
  DocumentScanner, 
  CloudUpload, 
  Visibility, 
  Link as LinkIcon,
  CheckCircle,
  ErrorOutline,
  Person,
  PresentToAll
} from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import FileUpload from './FileUpload';
import { ocrAndCheckValues } from '../utils/ocrService';

const SeminarsList = () => {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [formData, setFormData] = useState({});

  // Document management states
  const [docDialog, setDocDialog] = useState({
    open: false,
    seminar: null,
    tab: 0 // 0: Check Document, 1: Update Document, 2: View Document
  });
  const [docCheckFile, setDocCheckFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [docUpdateLink, setDocUpdateLink] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('getseminarsbyuser', {
        params: { user: global1.userEmail, colid: global1.colid }
      });
      if (response?.data?.success) {
        setSeminars(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seminar) => {
    setSelectedSeminar(seminar);
    setFormData({ ...seminar });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('updateseminar', formData, {
        params: { id: selectedSeminar._id }
      });
      if (response?.data?.success) {
        setEditDialog(false);
        fetchSeminars();
        alert('Seminar updated successfully!');
      }
    } catch (error) {
      alert('Failed to update seminar');
    }
  };

  const handleDelete = async (seminarId) => {
    if (window.confirm('Are you sure you want to delete this seminar?')) {
      try {
        const response = await ep3.get('deleteseminar', {
          params: { id: seminarId }
        });
        if (response?.data?.success) {
          fetchSeminars();
          alert('Seminar deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete seminar');
      }
    }
  };

  // Document management functions
  const openDocumentDialog = (seminar, tab = 0) => {
    setDocDialog({ open: true, seminar, tab });
    setDocUpdateLink(seminar.doclink || '');
    setOcrResult(null);
    setDocCheckFile(null);
  };

  const closeDocumentDialog = () => {
    setDocDialog({ open: false, seminar: null, tab: 0 });
    setOcrResult(null);
    setDocCheckFile(null);
    setDocUpdateLink('');
    setShowFileUpload(false);
  };

  const handleCheckDocument = async () => {
    if (!docCheckFile) {
      alert('Please select a document to check');
      return;
    }

    try {
      const seminar = docDialog.seminar;
      // Check: name, title, yop, role
      const itemsToCheck = [
        seminar.name,
        seminar.title,
        seminar.yop,
        seminar.role
      ].filter(Boolean).join('~');

      const { score, ocr } = await ocrAndCheckValues(docCheckFile, itemsToCheck);
      setOcrResult({ score, ocr });
    } catch (error) {
      alert('Document check failed: ' + error.message);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      let doclink = docUpdateLink.trim();

      if (showFileUpload) {
        return;
      }

      const response = await ep3.post('updateseminar', {
        ...docDialog.seminar,
        doclink: doclink
      }, {
        params: { id: docDialog.seminar._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchSeminars();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setDocUpdateLink(fileUrl);
    setShowFileUpload(false);
    handleUpdateDocumentWithUrl(fileUrl);
  };

  const handleUpdateDocumentWithUrl = async (fileUrl) => {
    try {
      const response = await ep3.post('updateseminar', {
        ...docDialog.seminar,
        doclink: fileUrl
      }, {
        params: { id: docDialog.seminar._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchSeminars();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'upcoming': return 'info';
      case 'ongoing': return 'warning';
      case 'cancelled': return 'error';
      case 'postponed': return 'secondary';
      default: return 'default';
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'international': return 'error';
      case 'national': return 'success';
      case 'regional': return 'info';
      case 'state': return 'warning';
      case 'local': return 'secondary';
      case 'institutional': return 'default';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'presenter':
      case 'keynote speaker':
        return <PresentToAll sx={{ fontSize: 16 }} />;
      default:
        return <Person sx={{ fontSize: 16 }} />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      {seminars.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Group sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No seminars registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the Create Seminar tab to register your first seminar/conference/workshop
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {seminars.map((seminar) => (
            <Grid item xs={12} md={6} lg={4} key={seminar._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {seminar.title}
                    </Typography>
                    <Chip 
                      label={seminar.status1} 
                      color={getStatusColor(seminar.status1)} 
                      size="small" 
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Type:</strong> {seminar.type}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Duration:</strong> {seminar.duration}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Year:</strong> {seminar.yop}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getRoleIcon(seminar.role)}
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        <strong>Role:</strong> {seminar.role}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={seminar.level} 
                        color={getLevelColor(seminar.level)} 
                        size="small" 
                        variant="outlined" 
                      />
                      {seminar.paper === 'Yes' && (
                        <Chip label="Paper Presented" color="info" size="small" />
                      )}
                      {seminar.membership === 'Yes' && (
                        <Chip label="Member" color="success" size="small" />
                      )}
                    </Box>

                    {formatCurrency(seminar.amount) && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        <strong>Registration Fee:</strong> {formatCurrency(seminar.amount)}
                      </Typography>
                    )}

                    {seminar.comments && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic' }}>
                        {seminar.comments.substring(0, 100)}{seminar.comments.length > 100 ? '...' : ''}
                      </Typography>
                    )}

                    {/* Document Status */}
                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Status:
                      </Typography>
                      {seminar.doclink ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="body2" color="success.main">
                            Document attached
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ErrorOutline sx={{ color: '#f59e0b', fontSize: 16 }} />
                          <Typography variant="body2" color="warning.main">
                            No document
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Document Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DocumentScanner />}
                        onClick={() => openDocumentDialog(seminar, 0)}
                      >
                        Check Document
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => openDocumentDialog(seminar, 1)}
                      >
                        Update Document
                      </Button>
                      {seminar.doclink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(seminar.doclink, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton onClick={() => handleEdit(seminar)} size="small" sx={{ color: '#3b82f6' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(seminar._id)} size="small" sx={{ color: '#ef4444' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Seminar Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Seminar</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Seminar Title"
                fullWidth
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Type"
                select
                fullWidth
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select type</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Symposium">Symposium</option>
                <option value="Webinar">Webinar</option>
                <option value="Training">Training</option>
                <option value="Seminar">Seminar</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Duration"
                fullWidth
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Year"
                fullWidth
                value={formData.yop || ''}
                onChange={(e) => setFormData({ ...formData, yop: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Role"
                select
                fullWidth
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select role</option>
                <option value="Participant">Participant</option>
                <option value="Presenter">Presenter</option>
                <option value="Organizer">Organizer</option>
                <option value="Keynote Speaker">Keynote Speaker</option>
                <option value="Session Chair">Session Chair</option>
                <option value="Panelist">Panelist</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Level"
                select
                fullWidth
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select level</option>
                <option value="International">International</option>
                <option value="National">National</option>
                <option value="Regional">Regional</option>
                <option value="State">State</option>
                <option value="Local">Local</option>
                <option value="Institutional">Institutional</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Status"
                select
                fullWidth
                value={formData.status1 || ''}
                onChange={(e) => setFormData({ ...formData, status1: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select status</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Postponed">Postponed</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Membership"
                select
                fullWidth
                value={formData.membership || ''}
                onChange={(e) => setFormData({ ...formData, membership: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Paper Presented"
                select
                fullWidth
                value={formData.paper || ''}
                onChange={(e) => setFormData({ ...formData, paper: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Comments"
                fullWidth
                multiline
                rows={3}
                value={formData.comments || ''}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update Seminar</Button>
        </DialogActions>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={docDialog.open} onClose={closeDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Document Management - {docDialog.seminar?.title}
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={docDialog.tab} 
            onChange={(e, newValue) => setDocDialog({ ...docDialog, tab: newValue })}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Check Document" />
            <Tab label="Update Document" />
            <Tab label="View Document" />
          </Tabs>

          {/* Tab 0: Check Document */}
          {docDialog.tab === 0 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Upload a document to verify it matches your seminar data: name, seminar title, year, and your role.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" component="label">
                  Choose Document
                  <input
                    hidden
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setDocCheckFile(file);
                    }}
                  />
                </Button>
                {docCheckFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Selected: {docCheckFile.name}
                  </Typography>
                )}
              </Box>

              <Button 
                variant="contained" 
                onClick={handleCheckDocument}
                disabled={!docCheckFile}
                sx={{ mb: 2 }}
              >
                Check Document
              </Button>

              {ocrResult && (
                <Alert 
                  severity={ocrResult.score.percentage >= 75 ? 'success' : ocrResult.score.percentage >= 50 ? 'warning' : 'error'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2">
                    Match: {ocrResult.score.percentage}%
                  </Typography>
                  {ocrResult.score.missing && (
                    <Typography variant="body2">
                      Missing: {ocrResult.score.missing}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}

          {/* Tab 1: Update Document */}
          {docDialog.tab === 1 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Update the document for this seminar by uploading a new file or providing a document link.
              </Typography>

              {!showFileUpload ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowFileUpload(true)}
                    >
                      Upload New File
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    label="Document Link"
                    value={docUpdateLink}
                    onChange={(e) => setDocUpdateLink(e.target.value)}
                    placeholder="https://..."
                    sx={{ mb: 2 }}
                  />

                  <Button 
                    variant="contained" 
                    onClick={handleUpdateDocument}
                  >
                    Update Document
                  </Button>
                </Box>
              ) : (
                <Box>
                  <FileUpload 
                    onFileUpload={handleFileUpload} 
                    onCancel={() => setShowFileUpload(false)} 
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Tab 2: View Document */}
          {docDialog.tab === 2 && (
            <Box>
              {docDialog.seminar?.doclink ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Current document for this seminar:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIcon />
                    <Link 
                      href={docDialog.seminar.doclink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {docDialog.seminar.doclink}
                    </Link>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => window.open(docDialog.seminar.doclink, '_blank')}
                    sx={{ mt: 2 }}
                  >
                    Open Document
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  No document attached to this seminar. Use the "Update Document" tab to add one.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDocumentDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeminarsList;
