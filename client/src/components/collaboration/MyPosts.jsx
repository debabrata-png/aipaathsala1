// components/collaboration/MyPosts.js - UPDATED FOR NEW POST TYPES
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  Group,
  Science,
  Article,
  Category
} from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getcollaborationpostsbyuser', {
        params: {
          user: global1.userEmail,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      setError('Failed to load your posts');
      console.error('My posts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Get icon for post type
  const getPostTypeIcon = (postFor) => {
    switch (postFor) {
      case 'project':
        return <Science sx={{ color: '#3b82f6', mr: 0.5 }} />;
      case 'publication':
        return <Article sx={{ color: '#8b5cf6', mr: 0.5 }} />;
      case 'other':
        return <Category sx={{ color: '#f59e0b', mr: 0.5 }} />;
      default:
        return null;
    }
  };

  // ✅ NEW: Get display name for post type
  const getPostTypeDisplay = (post) => {
    switch (post.postFor) {
      case 'project':
        return post.projectId?.project || 'Project Collaboration';
      case 'publication':
        return post.publicationId?.title || 'Publication Collaboration';
      case 'other':
        return post.otherType || 'Other Collaboration';
      default:
        return 'General Collaboration';
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      collaborationType: post.collaborationType,
      maxCollaborators: post.maxCollaborators,
      deadline: post.deadline ? new Date(post.deadline).toISOString().split('T')[0] : '',
      status: post.status
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('/updatecollaborationpost', formData, {
        params: { id: selectedPost._id }
      });

      if (response.data.success) {
        setEditDialog(false);
        fetchMyPosts();
        alert('Post updated successfully!');
      }
    } catch (error) {
      alert('Failed to update post');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this collaboration post?')) {
      try {
        const response = await ep3.get('/deletecollaborationpost', {
          params: { id: postId }
        });

        if (response.data.success) {
          fetchMyPosts();
          alert('Post deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete post');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'success';
      case 'closed': return 'error';
      case 'in-progress': return 'warning';
      default: return 'default';
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

      {posts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No collaboration posts yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Create your first collaboration post to start connecting with other faculty
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post._id}>
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
                  {/* ✅ NEW: Post Type Display */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getPostTypeIcon(post.postFor)}
                    <Typography variant="caption" sx={{ 
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: 0.5
                    }}>
                      {post.postFor} Collaboration
                    </Typography>
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {post.title}
                  </Typography>

                  {/* ✅ NEW: Show what the collaboration is for */}
                  <Typography variant="body2" sx={{ color: '#059669', mb: 1, fontWeight: 500 }}>
                    {getPostTypeDisplay(post)}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                    {post.description.length > 120
                      ? `${post.description.substring(0, 120)}...`
                      : post.description}
                  </Typography>

                  {/* Meta Information */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Type:</strong> {post.collaborationType}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Group fontSize="small" />
                      {post.currentCollaborators}/{post.maxCollaborators} collaborators
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Posted:</strong> {new Date(post.postedAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                    />
                    
                    {/* Action Buttons */}
                    <Box>
                      <IconButton
                        onClick={() => handleEdit(post)}
                        size="small"
                        sx={{ color: '#3b82f6' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(post._id)}
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

      {/* Edit Dialog - Updated */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Collaboration Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Collaboration Type"
            value={formData.collaborationType}
            onChange={(e) => setFormData({...formData, collaborationType: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Technical">Technical</MenuItem>
            <MenuItem value="Research">Research</MenuItem>
            <MenuItem value="Funding">Funding</MenuItem>
            <MenuItem value="Advisory">Advisory</MenuItem>
            <MenuItem value="Implementation">Implementation</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Max Collaborators"
            type="number"
            value={formData.maxCollaborators}
            onChange={(e) => setFormData({...formData, maxCollaborators: parseInt(e.target.value)})}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPosts;
