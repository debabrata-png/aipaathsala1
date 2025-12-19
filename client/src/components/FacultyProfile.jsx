// components/FacultyProfile.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  IconButton,
  TextField,
  Snackbar
} from '@mui/material';
import { 
  Edit, 
  Science, 
  Description, 
  Lightbulb, 
  RecordVoiceOver, 
  BusinessCenter,
  Add,
  TrendingUp,
  WorkOutline,
  Save,
  Cancel,
  Delete
} from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const FacultyProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [works, setWorks] = useState({});
  const [stats, setStats] = useState({});
  const [overallStats, setOverallStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [uploadDialog, setUploadDialog] = useState(false);
  const [profileEditDialog, setProfileEditDialog] = useState(false);
  const [workExperienceDialog, setWorkExperienceDialog] = useState(false);
  
  // Editing states
  const [editingProfile, setEditingProfile] = useState({});
  const [editingWorkExp, setEditingWorkExp] = useState([]);
  const [newWorkExp, setNewWorkExp] = useState({
    institution: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false
  });
  
  // UI states
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, worksRes, statsRes, activitiesRes] = await Promise.all([
        ep3.get('/getfacultyprofile', {
          params: { user: global1.userEmail, colid: global1.colid }
        }),
        ep3.get('/getfacultyprofilewithworks', {
          params: { user: global1.userEmail, colid: global1.colid }
        }),
        ep3.get('/getfacultyprofilestats', {
          params: { user: global1.userEmail, colid: global1.colid }
        }),
        ep3.get('/getrecentactivities', {
          params: { user: global1.userEmail, colid: global1.colid, limit: 10 }
        })
      ]);

      if (profileRes.data.success) {
        setUserInfo(profileRes.data.data.userInfo);
        setFacultyProfile(profileRes.data.data.facultyProfile);
        setEditingProfile(profileRes.data.data.facultyProfile || {});
      }

      if (worksRes.data.success) {
        setWorks(worksRes.data.data.works);
        setOverallStats(worksRes.data.data.overallStatistics);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (activitiesRes.data.success) {
        setRecentActivities(activitiesRes.data.data);
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photoUrl) => {
    setUploading(true);
    try {
      const response = await ep3.post('/updateuserphoto', {
        email: global1.userEmail,
        colid: global1.colid,
        photo: photoUrl
      });

      if (response.data.success) {
        setUserInfo(prev => ({...prev, photo: photoUrl}));
        global1.userPhoto = photoUrl;
        setUploadDialog(false);
        showSnackbar('Profile photo updated successfully!', 'success');
      } else {
        showSnackbar('Failed to update profile photo', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating profile photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const response = await ep3.post('/createfacultyprofile', {
        user: global1.userEmail,
        colid: global1.colid,
        ...editingProfile
      });

      if (response.data.success) {
        setFacultyProfile(response.data.data);
        setProfileEditDialog(false);
        showSnackbar('Profile updated successfully!', 'success');
        fetchProfileData();
      } else {
        showSnackbar('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      showSnackbar('Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED: Work Experience Handlers
  const handleWorkExperienceEdit = () => {
    setEditingWorkExp(facultyProfile?.workExperience || []);
    setWorkExperienceDialog(true);
  };

  const handleWorkExpChange = (index, field, value) => {
    setEditingWorkExp(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ✅ FIXED: Add individual work experience
  const handleAddWorkExp = async () => {
    if (!newWorkExp.institution || !newWorkExp.position || !newWorkExp.startDate) {
      showSnackbar('Institution, position, and start date are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const workExpToAdd = {
        ...newWorkExp,
      };

      const response = await ep3.post('/addworkexperience', {
        user: global1.userEmail,
        colid: global1.colid,
        workExperience: workExpToAdd
      });

      if (response.data.success) {
        // Update local state
        setEditingWorkExp(prev => [...prev, workExpToAdd]);
        setNewWorkExp({
          institution: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrent: false
        });
        showSnackbar('Work experience added successfully!', 'success');
      } else {
        showSnackbar('Failed to add work experience', 'error');
      }
    } catch (error) {
      console.error('Add work experience error:', error);
      showSnackbar('Error adding work experience', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkExp = (index) => {
    if (window.confirm('Are you sure you want to delete this work experience?')) {
      setEditingWorkExp(prev => prev.filter((_, i) => i !== index));
    }
  };

  // In FacultyProfile.jsx - Fixed handleSaveWorkExperience
const handleSaveWorkExperience = async () => {
    setSaving(true);
    try {
        // ✅ Clean and validate work experience data before sending
        const cleanedWorkExp = editingWorkExp.map(exp => ({
            institution: exp.institution || '',
            position: exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.isCurrent ? '' : (exp.endDate || ''),
            description: exp.description || '',
            isCurrent: Boolean(exp.isCurrent)
            // Don't send _id field
        })).filter(exp => exp.institution && exp.position && exp.startDate); // Filter out incomplete entries

        const response = await ep3.post('/createfacultyprofile', {
            user: global1.userEmail,
            colid: global1.colid,
            ...editingProfile,
            workExperience: cleanedWorkExp
        });

        if (response.data.success) {
            setFacultyProfile(response.data.data);
            setWorkExperienceDialog(false);
            showSnackbar('Work experience updated successfully!', 'success');
            fetchProfileData();
        } else {
            showSnackbar('Failed to update work experience', 'error');
        }
    } catch (error) {
        console.error('Save work experience error:', error);
        showSnackbar('Error updating work experience', 'error');
    } finally {
        setSaving(false);
    }
};


  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getWorkIcon = (type) => {
    switch (type) {
      case 'project': return <Science sx={{ color: '#8b5cf6' }} />;
      case 'publication': return <Description sx={{ color: '#ef4444' }} />;
      case 'patent': return <Lightbulb sx={{ color: '#f59e0b' }} />;
      case 'seminar': return <RecordVoiceOver sx={{ color: '#06b6d4' }} />;
      case 'consultancy': return <BusinessCenter sx={{ color: '#059669' }} />;
      default: return <WorkOutline />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Box sx={{ p: 3, backgroundColor: '#075e54', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            👨‍🎓 Faculty Profile
          </Typography>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" />
          <Tab label="Work Experience" />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: '#f8fafc', p: 3 }}>
        
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Profile Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={userInfo?.photo}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: '#075e54',
                        fontSize: '2rem',
                        border: '4px solid #e5e7eb'
                      }}
                    >
                      {userInfo?.name?.charAt(0)}
                    </Avatar>
                    <IconButton
                      onClick={() => setUploadDialog(true)}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: '#075e54',
                        color: 'white',
                        '&:hover': { bgcolor: '#128c7e' }
                      }}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid item xs>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {userInfo?.name}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {facultyProfile?.designation || 'Faculty'} • {userInfo?.department}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                        📧 {userInfo?.email} • 📱 {userInfo?.phone}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        🏢 {facultyProfile?.currentInstitution || 'Current Institution Not Set'}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setProfileEditDialog(true)}
                      sx={{ borderColor: '#075e54', color: '#075e54' }}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Grid>

                <Grid item>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: '#075e54' }}>
                      {overallStats?.totalWorks || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Total Works
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {facultyProfile?.aboutMe && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{facultyProfile.aboutMe}"
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Science sx={{ color: '#8b5cf6', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {stats?.projects?.count || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Projects
                        </Typography>
                        {stats?.projects?.totalFunds > 0 && (
                          <Typography variant="caption" sx={{ color: '#059669' }}>
                            {formatCurrency(stats.projects.totalFunds)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Description sx={{ color: '#ef4444', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {stats?.publications?.count || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Publications
                        </Typography>
                        {stats?.publications?.totalCitations > 0 && (
                          <Typography variant="caption" sx={{ color: '#059669' }}>
                            {stats.publications.totalCitations} citations
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Lightbulb sx={{ color: '#f59e0b', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {stats?.patents?.count || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Patents
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TrendingUp sx={{ color: '#059669', fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          ₹{overallStats?.totalRevenue || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Total Revenue
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activities */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                🔄 Recent Activities
              </Typography>
              
              {recentActivities.length > 0 ? (
                <List>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        {getWorkIcon(activity.type)}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {activity.details} • {activity.year}
                          </Typography>
                        </Box>
                        <Chip 
                          label={activity.type} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No recent activities found.
                </Typography>
              )}
            </Paper>
          </Box>
        )}

        {/* Work Experience Tab */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkOutline /> Work Experience
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={handleWorkExperienceEdit}
                sx={{ backgroundColor: '#075e54' }}
              >
                Edit Experience
              </Button>
            </Box>

            {facultyProfile?.workExperience?.length > 0 ? (
              <Box>
                {facultyProfile.workExperience.map((exp, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {exp.position}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#075e54', fontWeight: 500 }}>
                        {exp.institution}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        {new Date(exp.startDate).toLocaleDateString()} - {
                          exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'
                        }
                        {exp.isCurrent && (
                          <Chip label="Current" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      {exp.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {exp.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WorkOutline sx={{ fontSize: 60, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                  No work experience added yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                  Add your professional experience to showcase your career journey
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleWorkExperienceEdit}
                  sx={{ mt: 2, backgroundColor: '#075e54' }}
                >
                  Add Work Experience
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Photo Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <FileUpload 
            onFileUpload={handlePhotoUpload}
            onCancel={() => setUploadDialog(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileEditDialog} onClose={() => setProfileEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About Me"
                multiline
                rows={4}
                value={editingProfile.aboutMe || ''}
                onChange={(e) => setEditingProfile({...editingProfile, aboutMe: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Institution"
                value={editingProfile.currentInstitution || ''}
                onChange={(e) => setEditingProfile({...editingProfile, currentInstitution: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                value={editingProfile.designation || ''}
                onChange={(e) => setEditingProfile({...editingProfile, designation: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileEditDialog(false)}>Cancel</Button>
          <Button onClick={handleProfileSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Experience Dialog */}
      <Dialog open={workExperienceDialog} onClose={() => setWorkExperienceDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Work Experience</DialogTitle>
        <DialogContent>
          {/* Add New Work Experience */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Add New Experience
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={newWorkExp.institution}
                  onChange={(e) => setNewWorkExp({...newWorkExp, institution: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={newWorkExp.position}
                  onChange={(e) => setNewWorkExp({...newWorkExp, position: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newWorkExp.startDate}
                  onChange={(e) => setNewWorkExp({...newWorkExp, startDate: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newWorkExp.endDate}
                  onChange={(e) => setNewWorkExp({...newWorkExp, endDate: e.target.value})}
                  disabled={newWorkExp.isCurrent}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant={newWorkExp.isCurrent ? "contained" : "outlined"}
                  onClick={() => setNewWorkExp({...newWorkExp, isCurrent: !newWorkExp.isCurrent, endDate: ''})}
                  sx={{ height: '56px', width: '100%' }}
                >
                  Current Position
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={newWorkExp.description}
                  onChange={(e) => setNewWorkExp({...newWorkExp, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddWorkExp}
                  disabled={!newWorkExp.institution || !newWorkExp.position || !newWorkExp.startDate || saving}
                  sx={{ backgroundColor: '#075e54' }}
                >
                  {saving ? <CircularProgress size={20} /> : 'Add Experience'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Existing Work Experiences */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Current Experiences
          </Typography>
          {editingWorkExp.map((exp, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Institution"
                    value={exp.institution || ''}
                    onChange={(e) => handleWorkExpChange(index, 'institution', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={exp.position || ''}
                    onChange={(e) => handleWorkExpChange(index, 'position', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton
                    onClick={() => handleDeleteWorkExp(index)}
                    sx={{ color: '#ef4444' }}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleWorkExpChange(index, 'startDate', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleWorkExpChange(index, 'endDate', e.target.value)}
                    disabled={exp.isCurrent}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant={exp.isCurrent ? "contained" : "outlined"}
                    onClick={() => handleWorkExpChange(index, 'isCurrent', !exp.isCurrent)}
                    sx={{ height: '56px', width: '100%' }}
                  >
                    Current
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={2}
                    value={exp.description || ''}
                    onChange={(e) => handleWorkExpChange(index, 'description', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkExperienceDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkExperience} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyProfile;
