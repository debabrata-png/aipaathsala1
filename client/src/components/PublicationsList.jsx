// src/components/PublicationsList.jsx
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
  Article, 
  DocumentScanner, 
  CloudUpload, 
  Visibility, 
  Link as LinkIcon,
  CheckCircle,
  ErrorOutline,
  OpenInNew
} from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import FileUpload from './FileUpload';
import { ocrAndCheckValues } from '../utils/ocrService';

const PublicationsList = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [formData, setFormData] = useState({});

  // Document management states
  const [docDialog, setDocDialog] = useState({
    open: false,
    publication: null,
    tab: 0 // 0: Check Document, 1: Update Document, 2: View Document
  });
  const [docCheckFile, setDocCheckFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [docUpdateLink, setDocUpdateLink] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('getpublicationsbyuser', {
        params: { user: global1.userEmail, colid: global1.colid }
      });
      if (response?.data?.success) {
        setPublications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publication) => {
    setSelectedPublication(publication);
    setFormData({ ...publication });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('updatepublication', formData, {
        params: { id: selectedPublication._id }
      });
      if (response?.data?.success) {
        setEditDialog(false);
        fetchPublications();
        alert('Publication updated successfully!');
      }
    } catch (error) {
      alert('Failed to update publication');
    }
  };

  const handleDelete = async (publicationId) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        const response = await ep3.get('deletepublication', {
          params: { id: publicationId }
        });
        if (response?.data?.success) {
          fetchPublications();
          alert('Publication deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete publication');
      }
    }
  };

  // Document management functions
  const openDocumentDialog = (publication, tab = 0) => {
    setDocDialog({ open: true, publication, tab });
    setDocUpdateLink(publication.doclink || '');
    setOcrResult(null);
    setDocCheckFile(null);
  };

  const closeDocumentDialog = () => {
    setDocDialog({ open: false, publication: null, tab: 0 });
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
      const publication = docDialog.publication;
      // Check: name, title, journal, yop
      const itemsToCheck = [
        publication.name,
        publication.title,
        publication.journal,
        publication.yop
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

      const response = await ep3.post('updatepublication', {
        ...docDialog.publication,
        doclink: doclink
      }, {
        params: { id: docDialog.publication._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchPublications();
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
      const response = await ep3.post('updatepublication', {
        ...docDialog.publication,
        doclink: fileUrl
      }, {
        params: { id: docDialog.publication._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchPublications();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'accepted': return 'info';
      case 'under review': return 'warning';
      case 'submitted': return 'primary';
      case 'in progress': return 'secondary';
      default: return 'default';
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'international': return 'error';
      case 'national': return 'success';
      case 'regional': return 'info';
      case 'local': return 'warning';
      default: return 'default';
    }
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
      {publications.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Article sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No publications registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the Create Publication tab to register your first publication
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {publications.map((publication) => (
            <Grid item xs={12} md={6} lg={4} key={publication._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {publication.title}
                    </Typography>
                    <Chip 
                      label={publication.status1} 
                      color={getStatusColor(publication.status1)} 
                      size="small" 
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Journal:</strong> {publication.journal}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Department:</strong> {publication.department}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Year:</strong> {publication.yop}
                    </Typography>
                    {publication.issn && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        <strong>ISSN:</strong> {publication.issn}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={publication.level} 
                        color={getLevelColor(publication.level)} 
                        size="small" 
                        variant="outlined" 
                      />
                      {publication.ugclisted === 'Yes' && (
                        <Chip label="UGC Listed" color="success" size="small" />
                      )}
                    </Box>

                    {(publication.hindex > 0 || publication.citation > 0 || publication.citationindex) && (
                      <Box sx={{ mb: 2 }}>
                        {publication.hindex > 0 && (
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                            <strong>H-Index:</strong> {publication.hindex}
                          </Typography>
                        )}
                        {publication.citation > 0 && (
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                            <strong>Citations:</strong> {publication.citation}
                          </Typography>
                        )}
                        {publication.citationindex && (
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                            <strong>Citation Index:</strong> {publication.citationindex}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Links */}
                    {(publication.articlelink || publication.journallink) && (
                      <Box sx={{ mb: 2 }}>
                        {publication.articlelink && (
                          <Button
                            size="small"
                            startIcon={<OpenInNew />}
                            onClick={() => window.open(publication.articlelink, '_blank')}
                            sx={{ mr: 1, mb: 0.5 }}
                          >
                            Article
                          </Button>
                        )}
                        {publication.journallink && (
                          <Button
                            size="small"
                            startIcon={<OpenInNew />}
                            onClick={() => window.open(publication.journallink, '_blank')}
                            sx={{ mb: 0.5 }}
                          >
                            Journal
                          </Button>
                        )}
                      </Box>
                    )}

                    {publication.comments && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic' }}>
                        {publication.comments.substring(0, 100)}{publication.comments.length > 100 ? '...' : ''}
                      </Typography>
                    )}

                    {/* Document Status */}
                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Status:
                      </Typography>
                      {publication.doclink ? (
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
                        onClick={() => openDocumentDialog(publication, 0)}
                      >
                        Check Document
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => openDocumentDialog(publication, 1)}
                      >
                        Update Document
                      </Button>
                      {publication.doclink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(publication.doclink, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton onClick={() => handleEdit(publication)} size="small" sx={{ color: '#3b82f6' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(publication._id)} size="small" sx={{ color: '#ef4444' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Publication Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Publication</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Publication Title"
                fullWidth
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Journal"
                fullWidth
                value={formData.journal || ''}
                onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Department"
                fullWidth
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                label="ISSN"
                fullWidth
                value={formData.issn || ''}
                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
              />
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
                <option value="Local">Local</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="UGC Listed"
                select
                fullWidth
                value={formData.ugclisted || ''}
                onChange={(e) => setFormData({ ...formData, ugclisted: e.target.value })}
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
                label="Status"
                select
                fullWidth
                value={formData.status1 || ''}
                onChange={(e) => setFormData({ ...formData, status1: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select status</option>
                <option value="Published">Published</option>
                <option value="Accepted">Accepted</option>
                <option value="Under Review">Under Review</option>
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="H-Index"
                type="number"
                fullWidth
                value={formData.hindex || ''}
                onChange={(e) => setFormData({ ...formData, hindex: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Citations"
                type="number"
                fullWidth
                value={formData.citation || ''}
                onChange={(e) => setFormData({ ...formData, citation: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Citation Index"
                fullWidth
                value={formData.citationindex || ''}
                onChange={(e) => setFormData({ ...formData, citationindex: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Article Link"
                fullWidth
                value={formData.articlelink || ''}
                onChange={(e) => setFormData({ ...formData, articlelink: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Journal Link"
                fullWidth
                value={formData.journallink || ''}
                onChange={(e) => setFormData({ ...formData, journallink: e.target.value })}
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
          <Button onClick={handleUpdate} variant="contained">Update Publication</Button>
        </DialogActions>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={docDialog.open} onClose={closeDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Document Management - {docDialog.publication?.title}
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
                Upload a document to verify it matches your publication data: name, publication title, journal name, and year of publication.
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
                Update the document for this publication by uploading a new file or providing a document link.
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
              {docDialog.publication?.doclink ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Current document for this publication:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIcon />
                    <Link 
                      href={docDialog.publication.doclink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {docDialog.publication.doclink}
                    </Link>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => window.open(docDialog.publication.doclink, '_blank')}
                    sx={{ mt: 2 }}
                  >
                    Open Document
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  No document attached to this publication. Use the "Update Document" tab to add one.
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

export default PublicationsList;
