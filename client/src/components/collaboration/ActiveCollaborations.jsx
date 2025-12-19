// components/collaboration/ActiveCollaborations.js - COMPLETE VERSION WITH NAVIGATION
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  AvatarGroup,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Chat,
  Group,
  Business,
  CalendarToday,
  TrendingUp,
  Message,
  Info,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const ActiveCollaborations = ({ onOpenChat }) => { // ✅ RECEIVE PROP
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);

  useEffect(() => {
    fetchActiveCollaborations();
  }, []);

  const fetchActiveCollaborations = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getactivecollaborations', {
        params: {
          user: global1.userEmail,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        setCollaborations(response.data.data);
      }
    } catch (error) {
      setError('Failed to load active collaborations');
      console.error('Active collaborations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Navigate to chat with specific room
  const handleOpenChat = (collaboration, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Opening chat for collaboration:', collaboration.postId?.title);
    
    // Pass the collaboration data to parent component to handle navigation
    if (onOpenChat && typeof onOpenChat === 'function') {
      onOpenChat(collaboration);
    } else {
      alert(`Chat navigation not configured. Room: ${collaboration.postId?.title}`);
    }
  };

  const handleViewDetails = (collaboration, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedCollaboration(collaboration);
    setDetailsDialog(true);
  };

  const calculateProgress = (collaboration) => {
    const createdAt = new Date(collaboration.createdAt);
    const now = new Date();
    const daysSinceStart = (now - createdAt) / (1000 * 60 * 60 * 24);
    const estimatedDuration = 30;
    const progress = Math.min((daysSinceStart / estimatedDuration) * 100, 100);
    return Math.round(progress);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {collaborations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Group sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No active collaborations
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Start collaborating by accepting collaboration requests or creating posts
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {collaborations.map((collaboration) => (
            <Grid item xs={12} md={6} lg={4} key={collaboration._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': { 
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent sx={{ flex: 1 }}>
                  {/* Collaboration Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {collaboration.postId?.title || 'Collaboration'}
                    </Typography>
                    
                    <Chip 
                      label="Active"
                      size="small"
                      sx={{ 
                        bgcolor: '#059669',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  {/* Project Info */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      mb: 1
                    }}>
                      <Business fontSize="small" />
                      Project: {collaboration.projectId?.project || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5
                    }}>
                      <CalendarToday fontSize="small" />
                      Started: {new Date(collaboration.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Participants */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <Group fontSize="small" />
                      Collaborators ({collaboration.participants?.length || 0})
                    </Typography>
                    
                    <AvatarGroup max={4} sx={{ mb: 1 }}>
                      {collaboration.participants?.map((participant, index) => (
                        <Avatar
                          key={index}
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: participant.user === global1.userEmail ? '#075e54' : '#6b7280',
                            fontSize: '0.8rem'
                          }}
                        >
                          {participant.user?.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Progress
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {calculateProgress(collaboration)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(collaboration)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#f3f4f6',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#059669'
                        }
                      }}
                    />
                  </Box>

                  {/* Last Activity */}
                  <Typography variant="caption" sx={{ 
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 2
                  }}>
                    <Schedule fontSize="small" />
                    Last activity: {formatTimeAgo(collaboration.lastActivity)}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    mt: 'auto'
                  }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Chat />}
                      onClick={(event) => handleOpenChat(collaboration, event)}
                      sx={{
                        backgroundColor: '#f59e0b',
                        '&:hover': { backgroundColor: '#d97706' },
                        flex: 1,
                        textTransform: 'none'
                      }}
                    >
                      Open Chat
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Info />}
                      onClick={(event) => handleViewDetails(collaboration, event)}
                      sx={{
                        borderColor: '#f59e0b',
                        color: '#f59e0b',
                        '&:hover': { 
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderColor: '#d97706'
                        },
                        flex: 1,
                        textTransform: 'none'
                      }}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Collaboration Details
        </DialogTitle>
        <DialogContent>
          {selectedCollaboration && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedCollaboration.postId?.title}
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                {selectedCollaboration.postId?.description}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Project Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Project Name"
                    secondary={selectedCollaboration.projectId?.project || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Started On"
                    secondary={new Date(selectedCollaboration.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status"
                    secondary={selectedCollaboration.status || 'Active'}
                  />
                </ListItem>
              </List>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                Participants
              </Typography>
              <List dense>
                {selectedCollaboration.participants?.map((participant, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: participant.user === global1.userEmail ? '#075e54' : '#6b7280'
                      }}>
                        {participant.user?.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={participant.user === global1.userEmail ? 'You' : participant.user}
                      secondary={`Role: ${participant.role}`}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                Communication
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Chat Room ID: {selectedCollaboration.chatRoomId}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Last Activity: {formatTimeAgo(selectedCollaboration.lastActivity)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          {selectedCollaboration && (
            <Button 
              variant="contained"
              onClick={(event) => {
                setDetailsDialog(false);
                handleOpenChat(selectedCollaboration, event);
              }}
              sx={{ backgroundColor: '#f59e0b' }}
            >
              Open Chat
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveCollaborations;
