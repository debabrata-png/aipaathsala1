// src/components/PatentsList.jsx
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
  Lightbulb, 
  DocumentScanner, 
  CloudUpload, 
  Visibility, 
  Link as LinkIcon,
  CheckCircle,
  ErrorOutline 
} from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import FileUpload from './FileUpload';
import { ocrAndCheckValues } from '../utils/ocrService';

const PatentsList = () => {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [formData, setFormData] = useState({});

  // Document management states
  const [docDialog, setDocDialog] = useState({
    open: false,
    patent: null,
    tab: 0 // 0: Check Document, 1: Update Document, 2: View Document
  });
  const [docCheckFile, setDocCheckFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [docUpdateLink, setDocUpdateLink] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('getpatentsbyuser', {
        params: { user: global1.userEmail, colid: global1.colid }
      });
      if (response?.data?.success) {
        setPatents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patent) => {
    setSelectedPatent(patent);
    setFormData({ ...patent });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post(`updatepatent/${selectedPatent._id}`, formData);
      if (response?.data?.success) {
        setEditDialog(false);
        fetchPatents();
        alert('Patent updated successfully!');
      }
    } catch (error) {
      alert('Failed to update patent');
    }
  };

  const handleDelete = async (patentId) => {
    if (window.confirm('Are you sure you want to delete this patent?')) {
      try {
        const response = await ep3.delete(`deletepatent/${patentId}`);
        if (response?.data?.success) {
          fetchPatents();
          alert('Patent deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete patent');
      }
    }
  };

  // Document management functions
  const openDocumentDialog = (patent, tab = 0) => {
    setDocDialog({ open: true, patent, tab });
    setDocUpdateLink(patent.doclink || '');
    setOcrResult(null);
    setDocCheckFile(null);
  };

  const closeDocumentDialog = () => {
    setDocDialog({ open: false, patent: null, tab: 0 });
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
      const patent = docDialog.patent;
      // Check: name, title, patentnumber, agency
      const itemsToCheck = [
        patent.name,
        patent.title,
        patent.patentnumber,
        patent.agency
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
        // Handle file upload through FileUpload component
        return;
      }

      const response = await ep3.post(`updatepatent/${docDialog.patent._id}`, {
        ...docDialog.patent,
        doclink: doclink
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchPatents();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setDocUpdateLink(fileUrl);
    setShowFileUpload(false);
    // Auto-update with the new file URL
    handleUpdateDocumentWithUrl(fileUrl);
  };

  const handleUpdateDocumentWithUrl = async (fileUrl) => {
    try {
      const response = await ep3.post(`updatepatent/${docDialog.patent._id}`, {
        ...docDialog.patent,
        doclink: fileUrl
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchPatents();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'granted': return 'success';
      case 'published': return 'info';
      case 'filed': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN');
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
      {patents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Lightbulb sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No patents registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the Create Patent tab to register your first patent
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {patents.map((patent) => (
            <Grid item xs={12} md={6} lg={4} key={patent._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {patent.title}
                    </Typography>
                    <Chip 
                      label={patent.status1} 
                      color={getStatusColor(patent.status1)} 
                      size="small" 
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Patent Number:</strong> {patent.patentnumber}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Agency:</strong> {patent.agency}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Date of Application:</strong> {formatDate(patent.doa)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Year of Publication:</strong> {patent.yop}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      <strong>Patent Status:</strong> {patent.patentstatus}
                    </Typography>

                    {patent.comments && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic' }}>
                        {patent.comments.substring(0, 100)}{patent.comments.length > 100 ? '...' : ''}
                      </Typography>
                    )}

                    {/* Document Status */}
                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Status:
                      </Typography>
                      {patent.doclink ? (
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
                        onClick={() => openDocumentDialog(patent, 0)}
                      >
                        Check Document
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => openDocumentDialog(patent, 1)}
                      >
                        Update Document
                      </Button>
                      {patent.doclink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(patent.doclink, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton onClick={() => handleEdit(patent)} size="small" sx={{ color: '#3b82f6' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(patent._id)} size="small" sx={{ color: '#ef4444' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Patent Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Patent</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Patent Title"
                fullWidth
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Patent Number"
                fullWidth
                value={formData.patentnumber || ''}
                onChange={(e) => setFormData({ ...formData, patentnumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Agency"
                fullWidth
                value={formData.agency || ''}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Date of Application"
                type="date"
                fullWidth
                value={formData.doa || ''}
                onChange={(e) => setFormData({ ...formData, doa: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Year of Publication"
                fullWidth
                value={formData.yop || ''}
                onChange={(e) => setFormData({ ...formData, yop: e.target.value })}
              />
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
                <option value="Filed">Filed</option>
                <option value="Published">Published</option>
                <option value="Granted">Granted</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
                <option value="Withdrawn">Withdrawn</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Patent Status"
                select
                fullWidth
                value={formData.patentstatus || ''}
                onChange={(e) => setFormData({ ...formData, patentstatus: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select patent status</option>
                <option value="Applied">Applied</option>
                <option value="Published">Published</option>
                <option value="Granted">Granted</option>
                <option value="Expired">Expired</option>
                <option value="Abandoned">Abandoned</option>
              </TextField>
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
          <Button onClick={handleUpdate} variant="contained">Update Patent</Button>
        </DialogActions>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={docDialog.open} onClose={closeDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Document Management - {docDialog.patent?.title}
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
                Upload a document to verify it matches your patent data: name, patent title, patent number, and agency.
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
                Update the document for this patent by uploading a new file or providing a document link.
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
              {docDialog.patent?.doclink ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Current document for this patent:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIcon />
                    <Link 
                      href={docDialog.patent.doclink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {docDialog.patent.doclink}
                    </Link>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => window.open(docDialog.patent.doclink, '_blank')}
                    sx={{ mt: 2 }}
                  >
                    Open Document
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  No document attached to this patent. Use the "Update Document" tab to add one.
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

export default PatentsList;
