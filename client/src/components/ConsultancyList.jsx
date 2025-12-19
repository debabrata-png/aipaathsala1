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
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import { Edit, Delete, GetApp, BusinessCenter, Phone } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const ConsultancyList = () => {
  const [consultancies, setConsultancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedConsultancy, setSelectedConsultancy] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchConsultancies();
  }, []);

  const fetchConsultancies = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getconsultanciesbyuser', {
        params: {
          user: global1.userEmail,
          colid: global1.colid
        }
      });
      
      if (response.data.success) {
        setConsultancies(response.data.data);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (consultancy) => {
    setSelectedConsultancy(consultancy);
    setFormData({ ...consultancy });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('/updateconsultancy', formData, {
        params: { id: selectedConsultancy._id }
      });
      
      if (response.data.success) {
        setEditDialog(false);
        fetchConsultancies();
        alert('Consultancy updated successfully!');
      }
    } catch (error) {
      alert('Failed to update consultancy');
    }
  };

  const handleDelete = async (consultancyId) => {
    if (window.confirm('Are you sure you want to delete this consultancy?')) {
      try {
        const response = await ep3.get('/deleteconsultancy', {
          params: { id: consultancyId }
        });
        
        if (response.data.success) {
          fetchConsultancies();
          alert('Consultancy deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete consultancy');
      }
    }
  };

  const handleFileUpload = (url) => {
    setFormData({ ...formData, doclink: url });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'ongoing': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'on hold': return 'default';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'lead consultant': return 'error';
      case 'co-consultant': return 'success';
      case 'technical advisor': return 'info';
      case 'project manager': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getFileName = (url) => {
    if (!url) return '';
    return url.split('/').pop();
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
      {consultancies.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <BusinessCenter sx={{ fontSize: 60, color: '#059669', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No consultancies registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the "Create Consultancy" tab to register your first consultancy
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {consultancies.map((consultancy) => (
            <Grid item xs={12} md={6} lg={4} key={consultancy._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {consultancy.title || 'Consultancy Project'}
                    </Typography>
                    <Chip 
                      label={consultancy.status1}
                      color={getStatusColor(consultancy.status1)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    <strong>Agency:</strong> {consultancy.agency}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    <strong>Consultant:</strong> {consultancy.consultant}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    <strong>Advisor:</strong> {consultancy.advisor}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    <strong>Year:</strong> {consultancy.year}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                    <strong>Revenue:</strong> {formatCurrency(consultancy.revenue)}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {consultancy.role && (
                      <Chip 
                        label={consultancy.role}
                        color={getRoleColor(consultancy.role)}
                        size="small"
                      />
                    )}
                    {consultancy.duration && (
                      <Chip label={consultancy.duration} size="small" variant="outlined" />
                    )}
                    {consultancy.trainees && (
                      <Chip label={`${consultancy.trainees} Trainees`} size="small" variant="outlined" />
                    )}
                  </Box>

                  {consultancy.department && (
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Department:</strong> {consultancy.department}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Phone sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {consultancy.contact}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic', fontSize: '0.8rem' }}>
                    {consultancy.comments}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {consultancy.doclink && (
                        <Button
                          startIcon={<GetApp />}
                          href={consultancy.doclink}
                          target="_blank"
                          size="small"
                          variant="outlined"
                        >
                          Download
                        </Button>
                      )}
                    </Box>
                    
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(consultancy)}
                        size="small"
                        sx={{ color: '#3b82f6' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(consultancy._id)}
                        size="small"
                        sx={{ color: '#ef4444' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Consultancy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Year"
                fullWidth
                value={formData.year || ''}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Duration"
                fullWidth
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Consultant Name"
                fullWidth
                value={formData.consultant || ''}
                onChange={(e) => setFormData({...formData, consultant: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Advisor Name"
                fullWidth
                value={formData.advisor || ''}
                onChange={(e) => setFormData({...formData, advisor: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Agency/Organization"
                fullWidth
                value={formData.agency || ''}
                onChange={(e) => setFormData({...formData, agency: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Department"
                fullWidth
                value={formData.department || ''}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Contact Number"
                type="number"
                fullWidth
                value={formData.contact || ''}
                onChange={(e) => setFormData({...formData, contact: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Revenue"
                type="number"
                fullWidth
                value={formData.revenue || ''}
                onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Number of Trainees"
                type="number"
                fullWidth
                value={formData.trainees || ''}
                onChange={(e) => setFormData({...formData, trainees: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Status"
                select
                fullWidth
                value={formData.status1 || ''}
                onChange={(e) => setFormData({...formData, status1: e.target.value})}
                SelectProps={{ native: true }}
              >
                <option value="">Select status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="On Hold">On Hold</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Role"
                select
                fullWidth
                value={formData.role || ''}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                SelectProps={{ native: true }}
              >
                <option value="">Select role</option>
                <option value="Lead Consultant">Lead Consultant</option>
                <option value="Co-Consultant">Co-Consultant</option>
                <option value="Technical Advisor">Technical Advisor</option>
                <option value="Subject Matter Expert">Subject Matter Expert</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Trainer">Trainer</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Title/Topic"
                fullWidth
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Upload Document:
            </Typography>
            <FileUpload onFileUpload={handleFileUpload} />
            {formData.doclink && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Current document: {getFileName(formData.doclink)}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update Consultancy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultancyList;
