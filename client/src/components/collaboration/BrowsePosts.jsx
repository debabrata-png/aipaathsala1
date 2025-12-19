// components/collaboration/BrowsePosts.js - UPDATED FOR NEW POST TYPES
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Search,
  Business,
  CalendarToday,
  Send,
  Visibility,
  School,
  Person,
  Group,
  Article,
  Science,
  Category
} from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const BrowsePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestDialog, setRequestDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [requestData, setRequestData] = useState({
    message: '',
    requestedRole: '',
    proposedContribution: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getcollaborationposts', {
        params: {
          user: global1.userEmail,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      setError('Failed to load collaboration posts');
      console.error('Posts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Get icon for post type
  const getPostTypeIcon = (postFor) => {
    switch (postFor) {
      case 'project':
        return <Science sx={{ color: '#3b82f6' }} />;
      case 'publication':
        return <Article sx={{ color: '#8b5cf6' }} />;
      case 'other':
        return <Category sx={{ color: '#f59e0b' }} />;
      default:
        return <Business sx={{ color: '#6b7280' }} />;
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
        return 'Collaboration';
    }
  };

  const fetchOwnerProfile = async (ownerUser, ownerColid) => {
    try {
      const response = await ep3.get('/getfacultyprofilewithworks', {
        params: {
          user: ownerUser,
          colid: ownerColid
        }
      });

      if (response.data.success) {
        setSelectedProfile(response.data.data);
        setProfileDialog(true);
      } else {
        alert('Unable to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('Error loading profile');
    }
  };

  const handleSendRequest = (post) => {
    setSelectedPost(post);
    setRequestData({
      message: '',
      requestedRole: '',
      proposedContribution: ''
    });
    setRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    try {
      const response = await ep3.post('/sendcollaborationrequest', {
        postId: selectedPost._id,
        requesterUser: global1.userEmail,
        requesterColid: global1.colid,
        ownerUser: selectedPost.user,
        ownerColid: selectedPost.colid,
        message: requestData.message,
        requestedRole: requestData.requestedRole,
        proposedContribution: requestData.proposedContribution
      });

      if (response.data.success) {
        setRequestDialog(false);
        alert('Collaboration request sent successfully!');
      } else {
        alert(response.data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Send request error:', error);
      alert('Error sending collaboration request');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.collaborationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.otherType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCollaborationTypeColor = (type) => {
    const colors = {
      'Technical': '#3b82f6',
      'Research': '#8b5cf6',
      'Funding': '#059669',
      'Advisory': '#f59e0b',
      'Implementation': '#ef4444'
    };
    return colors[type] || '#6b7280';
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

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search collaboration posts by title, description, or type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Posts List - Full Width Cards */}
      {filteredPosts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No collaboration posts found
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a collaboration post!'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredPosts.map((post) => (
            <Card key={post._id} sx={{ 
              display: 'flex', 
              p: 3,
              '&:hover': { 
                boxShadow: 4,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              {/* Left: Avatar and Profile Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: '#075e54', 
                    mb: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => fetchOwnerProfile(post.user, post.colid)}
                >
                  {post.ownerProfile?.userInfo?.name?.charAt(0) || post.user?.charAt(0)}
                </Avatar>
              </Box>

              {/* Center: Post Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Post Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => fetchOwnerProfile(post.user, post.colid)}
                  >
                    {post.ownerProfile?.userInfo?.name || post.user}
                  </Typography>
                  {post.colid !== global1.colid && (
                    <Chip label="External" size="small" sx={{ fontSize: '0.7rem' }} />
                  )}
                </Box>

                {/* ✅ NEW: Post Type Display */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getPostTypeIcon(post.postFor)}
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    <strong>{post.postFor?.charAt(0).toUpperCase() + post.postFor?.slice(1)}:</strong> {getPostTypeDisplay(post)}
                  </Typography>
                </Box>

                {/* Post Title */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {post.title}
                </Typography>

                {/* Post Description */}
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.5 }}>
                  {post.description}
                </Typography>

                {/* Post Meta Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip 
                      label={post.collaborationType}
                      size="small"
                      sx={{ 
                        backgroundColor: getCollaborationTypeColor(post.collaborationType),
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Group fontSize="small" />
                    {post.currentCollaborators || 0}/{post.maxCollaborators}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday fontSize="small" />
                    {new Date(post.postedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Skills Preview */}
                {post.requiredSkills?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>Skills:</Typography>
                    {post.requiredSkills.slice(0, 2).map((skill, index) => (
                      <Chip 
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ mr: 0.5, fontSize: '0.7rem', height: '20px' }}
                      />
                    ))}
                    {post.requiredSkills.length > 2 && (
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        +{post.requiredSkills.length - 2} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Right: Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                {/* Status */}
                <Chip 
                  label={post.currentCollaborators < post.maxCollaborators ? 'Open' : 'Full'}
                  size="small"
                  color={post.currentCollaborators < post.maxCollaborators ? 'success' : 'error'}
                  sx={{ fontSize: '0.7rem' }}
                />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => fetchOwnerProfile(post.user, post.colid)}
                    sx={{ fontSize: '0.75rem', px: 1.5 }}
                  >
                    Profile
                  </Button>
                  
                  {post.user !== global1.userEmail && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Send />}
                      onClick={() => handleSendRequest(post)}
                      disabled={post.currentCollaborators >= post.maxCollaborators}
                      sx={{
                        backgroundColor: '#f59e0b',
                        '&:hover': { backgroundColor: '#d97706' },
                        fontSize: '0.75rem',
                        px: 1.5
                      }}
                    >
                      Request
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Profile Dialog - Existing */}
      <Dialog
        open={profileDialog}
        onClose={() => setProfileDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Faculty Profile</DialogTitle>
        <DialogContent>
          {selectedProfile && (
            <Box>
              {/* Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#075e54' }}>
                  {selectedProfile.userInfo?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedProfile.userInfo?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    {selectedProfile.facultyProfile?.designation || 'Faculty'} • {selectedProfile.userInfo?.department}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    📧 {selectedProfile.userInfo?.email}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Stats */}
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#075e54' }}>
                    {selectedProfile.works?.projects?.data?.length || 0}
                  </Typography>
                  <Typography variant="caption">Projects</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#075e54' }}>
                    {selectedProfile.works?.publications?.data?.length || 0}
                  </Typography>
                  <Typography variant="caption">Publications</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#075e54' }}>
                    {selectedProfile.works?.patents?.data?.length || 0}
                  </Typography>
                  <Typography variant="caption">Patents</Typography>
                </Box>
              </Box>

              {/* About */}
              {selectedProfile.facultyProfile?.aboutMe && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>About</Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {selectedProfile.facultyProfile.aboutMe}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Request Dialog - Existing */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Collaboration Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Send a collaboration request for: <strong>{selectedPost?.title}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Your Role"
            value={requestData.requestedRole}
            onChange={(e) => setRequestData({...requestData, requestedRole: e.target.value})}
            sx={{ mb: 2 }}
            placeholder="e.g., Co-investigator, Technical Advisor, etc."
          />

          <TextField
            fullWidth
            label="Your Contribution"
            value={requestData.proposedContribution}
            onChange={(e) => setRequestData({...requestData, proposedContribution: e.target.value})}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder="Describe what you can contribute to this collaboration"
          />

          <TextField
            fullWidth
            label="Message"
            value={requestData.message}
            onChange={(e) => setRequestData({...requestData, message: e.target.value})}
            multiline
            rows={4}
            placeholder="Introduce yourself and explain why you'd like to collaborate"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitRequest}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrowsePosts;
