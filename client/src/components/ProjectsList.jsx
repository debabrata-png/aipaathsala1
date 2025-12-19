// src/components/ProjectsList.jsx
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
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Science, 
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

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({});

  // Document management states
  const [docDialog, setDocDialog] = useState({
    open: false,
    project: null,
    tab: 0 // 0: Check Document, 1: Update Document, 2: View Document
  });
  const [docCheckFile, setDocCheckFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [docUpdateFile, setDocUpdateFile] = useState(null);
  const [docUpdateLink, setDocUpdateLink] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getprojectsbyuser', {
        params: { user: global1.userEmail, colid: global1.colid }
      });
      if (response?.data?.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({ ...project });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('/updateproject', formData, {
        params: { id: selectedProject._id }
      });
      if (response?.data?.success) {
        setEditDialog(false);
        fetchProjects();
        alert('Project updated successfully!');
      }
    } catch (error) {
      alert('Failed to update project');
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await ep3.get('/deleteproject', {
          params: { id: projectId }
        });
        if (response?.data?.success) {
          fetchProjects();
          alert('Project deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete project');
      }
    }
  };

  // Document management functions
  const openDocumentDialog = (project, tab = 0) => {
    setDocDialog({ open: true, project, tab });
    setDocUpdateLink(project.doclink || '');
    setOcrResult(null);
    setDocCheckFile(null);
    setDocUpdateFile(null);
  };

  const closeDocumentDialog = () => {
    setDocDialog({ open: false, project: null, tab: 0 });
    setOcrResult(null);
    setDocCheckFile(null);
    setDocUpdateFile(null);
    setDocUpdateLink('');
    setShowFileUpload(false);
  };

  const handleCheckDocument = async () => {
    if (!docCheckFile) {
      alert('Please select a document to check');
      return;
    }

    try {
      const project = docDialog.project;
      const itemsToCheck = [
        project.name,
        project.agency,
        project.project,
        project.funds ? String(project.funds) : ''
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

      if (docUpdateFile && showFileUpload) {
        // Handle file upload through FileUpload component
        return;
      }

      const response = await ep3.post(`/updateproject?id=${docDialog.project._id}`, {
        id: docDialog.project._id,
        doclink: doclink
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchProjects();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setDocUpdateLink(fileUrl);
    setShowFileUpload(false);
    handleUpdateDocument();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'ongoing': return 'info';
      case 'suspended': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'international': return 'error';
      case 'national': return 'success';
      case 'state': return 'info';
      case 'regional': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
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
      {projects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Science sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No projects registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the Create Project tab to register your first project
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {project.project}
                    </Typography>
                    {project.status1 && (
                      <Chip 
                        label={project.status1} 
                        color={getStatusColor(project.status1)} 
                        size="small" 
                      />
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Agency:</strong> {project.agency}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Type:</strong> {project.type}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Department:</strong> {project.department}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Funding:</strong> {formatCurrency(project.funds)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Duration:</strong> {project.duration}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      <strong>Year:</strong> {project.yop}
                    </Typography>

                    {project.level && (
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={`${project.level} Level`} 
                          color={getLevelColor(project.level)} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>
                    )}

                    {project.comments && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic' }}>
                        {project.comments}
                      </Typography>
                    )}

                    {/* Document Status */}
                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Status:
                      </Typography>
                      {project.doclink ? (
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
                        onClick={() => openDocumentDialog(project, 0)}
                      >
                        Check Document
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => openDocumentDialog(project, 1)}
                      >
                        Update Document
                      </Button>
                      {project.doclink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(project.doclink, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton onClick={() => handleEdit(project)} size="small" sx={{ color: '#3b82f6' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(project._id)} size="small" sx={{ color: '#ef4444' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Project Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Project Title"
                fullWidth
                value={formData.project || ''}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
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
                label="Type"
                select
                fullWidth
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select type</option>
                <option value="University funded">University funded</option>
                <option value="External funding">External funding</option>
                <option value="RUSA">RUSA</option>
                <option value="TEQIP">TEQIP</option>
              </TextField>
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
                label="Funding Amount"
                type="number"
                fullWidth
                value={formData.funds || ''}
                onChange={(e) => setFormData({ ...formData, funds: parseFloat(e.target.value) })}
              />
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
          <Button onClick={handleUpdate} variant="contained">Update Project</Button>
        </DialogActions>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={docDialog.open} onClose={closeDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Document Management - {docDialog.project?.project}
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
                Upload a document to verify it matches your project data: name, agency, project title, and funding amount.
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
                Update the document for this project by uploading a new file or providing a document link.
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

          {/* Tab 3: View Document */}
          {docDialog.tab === 2 && (
            <Box>
              {docDialog.project?.doclink ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Current document for this project:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIcon />
                    <Link 
                      href={docDialog.project.doclink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {docDialog.project.doclink}
                    </Link>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => window.open(docDialog.project.doclink, '_blank')}
                    sx={{ mt: 2 }}
                  >
                    Open Document
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  No document attached to this project. Use the "Update Document" tab to add one.
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

export default ProjectsList;
