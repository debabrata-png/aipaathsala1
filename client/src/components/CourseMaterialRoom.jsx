// components/CourseMaterialRoom.jsx
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
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const CourseMaterialRoom = ({ course, socket, roomId }) => {
  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slideno: '',
    title: '',
    description: '',
    imagelink: '',
    voicetext: '',
    doclink: '',
    type: '',
    mode: ''
  });

  const permissions = (() => {
    const ru = global1.userRole?.toUpperCase();
    return {
      isFaculty: ru === 'FACULTY',
      isStudent: ru === 'STUDENT',
      canCreate: ru === 'FACULTY',
      canView: ru === 'FACULTY' || ru === 'STUDENT'
    };
  })();

  useEffect(() => {
    if (permissions.canView && course) fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.coursecode, permissions.canView]);

  useEffect(() => {
    if (!socket || !course) return;
    const onNew = () => fetchMaterials();
    socket.on('new_material', onNew);
    return () => socket.off('new_material', onNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, course?.coursecode]);

  const fetchMaterials = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const response = await ep3.get('/getcoursematerialsbycourse', {
        params: {
          coursecode: course.coursecode,
          colid: global1.colid
        }
      });
      if (response.data.success) {
        setMaterials(response.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!permissions.canCreate) return alert('Only Faculty can upload materials');
    if (!formData.title || !formData.description || !formData.slideno) {
      return alert('Please fill required fields');
    }
    try {
      const response = await ep3.post('/createcoursematerial', {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        year: course.year,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        ...formData
      });
      if (response.data.success) {
        setOpen(false);
        setFormData({
          slideno: '',
          title: '',
          description: '',
          imagelink: '',
          voicetext: '',
          doclink: '',
          type: '',
          mode: ''
        });
        fetchMaterials();
        if (socket) {
          socket.emit('material_uploaded', {
            room: roomId,
            material: response.data.data
          });
        }
      }
    } catch {
      alert('Failed to create course material');
    }
  };

  const getFileName = (url) => (!url ? '' : url.split('/').pop());
  const handleFileUpload = (url, type) => setFormData({ ...formData, [type]: url });

  if (!permissions.canView) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Alert severity="warning">You do not have permission to view course materials.</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {permissions.isFaculty
          ? 'As Faculty, you can upload and manage course materials.'
          : 'As a Student, you can view and download course materials.'}
      </Alert>

      {permissions.canCreate && (
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          sx={{ mb: 2, backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' }, textTransform: 'none', borderRadius: 2 }}
          startIcon={<Add />}
        >
          Add Material
        </Button>
      )}

      {loading ? (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : materials.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            {permissions.isFaculty ? 'No materials uploaded yet' : 'No materials available'}
          </Typography>
          {permissions.canCreate && (
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
              Upload your first material to get started
            </Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {materials
            .sort((a, b) => (a.slideno || 0) - (b.slideno || 0))
            .map((material) => (
              <Grid key={material._id} item xs={12} md={6} lg={4}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{material.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Slide {material.slideno}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{material.description}</Typography>
                    {material.voicetext && (
                      <Typography sx={{ mt: 1 }} variant="body2">
                        Notes: {material.voicetext}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {material.doclink && (
                        <Button
                          href={material.doclink}
                          target="_blank"
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none' }}
                        >
                          Download ({getFileName(material.doclink)})
                        </Button>
                      )}
                      {material.imagelink && (
                        <Button
                          href={material.imagelink}
                          target="_blank"
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none' }}
                        >
                          View Image
                        </Button>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Added by {material.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Add Material Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Course Material</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Slide No."
                value={formData.slideno}
                onChange={(e) => setFormData({ ...formData, slideno: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Type"
                placeholder="Lecture, Lab, Tutorial"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mode"
                placeholder="Offline / Online"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                placeholder="Additional notes or instructions"
                value={formData.voicetext}
                onChange={(e) => setFormData({ ...formData, voicetext: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Files</Typography>
              <Typography variant="body2">Document File:</Typography>
              <FileUpload onUpload={(url) => handleFileUpload(url, 'doclink')} />
              {formData.doclink && (
                <Typography variant="caption">Document uploaded: {getFileName(formData.doclink)}</Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Image File:</Typography>
                <FileUpload onUpload={(url) => handleFileUpload(url, 'imagelink')} />
                {formData.imagelink && (
                  <Typography variant="caption">Image uploaded: {getFileName(formData.imagelink)}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Material</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseMaterialRoom;
