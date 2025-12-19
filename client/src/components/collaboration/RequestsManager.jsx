// components/collaboration/RequestsManager.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Inbox,
  Send as SendIcon,
  Check,
  Close,
  Person,
  Business,
  CalendarToday,
  Chat
} from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const RequestsManager = ({ onOpenChat }) => { // ✅ ADD: Receive onOpenChat prop
  const [activeTab, setActiveTab] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseDialog, setResponseDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false); // ✅ ADD: Loading state for actions

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        ep3.get('/getcollaborationrequests', {
          params: {
            user: global1.userEmail,
            colid: global1.colid
          }
        }),
        ep3.get('/getsentcollaborationrequests', {
          params: {
            user: global1.userEmail,
            colid: global1.colid
          }
        })
      ]);

      if (receivedRes.data.success) {
        setReceivedRequests(receivedRes.data.data);
      }

      if (sentRes.data.success) {
        setSentRequests(sentRes.data.data);
      }
    } catch (error) {
      setError('Failed to load collaboration requests');
      console.error('Requests fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Accept Request Handler
  const handleAcceptRequest = async (request) => {
    console.log('Accepting request:', request._id);
    setActionLoading(true);
    
    try {
      const response = await ep3.post('/acceptcollaborationrequest', {
        requestId: request._id
      });

      console.log('Accept response:', response.data);

      // ✅ FIXED: Check response.data.success specifically
      if (response.data && response.data.success === true) {
        alert('🎉 Collaboration request accepted successfully!');
        
        // ✅ FIXED: Refresh requests to update UI
        await fetchRequests();
        
        // ✅ FIXED: Open chat room if chatRoomId is provided
        if (response.data.data && response.data.data.chatRoomId) {
          console.log('Opening chat room:', response.data.data.chatRoomId);
          
          // Create a collaboration object for the chat
          const collaborationForChat = {
            _id: response.data.data.collaboration._id,
            postId: request.postId,
            chatRoomId: response.data.data.chatRoomId,
            participants: response.data.data.collaboration.participants
          };
          
          // ✅ FIXED: Open chat room
          if (onOpenChat && typeof onOpenChat === 'function') {
            onOpenChat(collaborationForChat);
          } else {
            console.warn('onOpenChat function not provided to RequestsManager');
            // Fallback: You can add navigation logic here
            // For example: navigate(`/collaboration/chat/${response.data.data.chatRoomId}`);
          }
        } else {
          console.warn('No chatRoomId found in accept response');
        }
      } else {
        // ✅ FIXED: Show specific error message from backend
        const errorMessage = response.data?.message || 'Failed to accept collaboration request';
        alert(`❌ ${errorMessage}`);
        console.error('Accept request failed:', response.data);
      }
    } catch (error) {
      console.error('Accept request error:', error);
      
      // ✅ FIXED: Better error message handling
      let errorMessage = 'Failed to accept collaboration request';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FIXED: Reject Request Handler  
  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setResponseDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;
    
    console.log('Rejecting request:', selectedRequest._id);
    setActionLoading(true);
    
    try {
      const response = await ep3.post('/rejectcollaborationrequest', {
        requestId: selectedRequest._id,
        rejectionReason: responseMessage
      });

      console.log('Reject response:', response.data);

      // ✅ FIXED: Check response.data.success specifically
      if (response.data && response.data.success === true) {
        setResponseDialog(false);
        setResponseMessage('');
        alert('✅ Collaboration request rejected successfully');
        
        // ✅ FIXED: Refresh requests to update UI
        await fetchRequests();
      } else {
        const errorMessage = response.data?.message || 'Failed to reject collaboration request';
        alert(`❌ ${errorMessage}`);
        console.error('Reject request failed:', response.data);
      }
    } catch (error) {
      console.error('Reject request error:', error);
      
      let errorMessage = 'Failed to reject collaboration request';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<Inbox />} 
            label={`Received (${receivedRequests.length})`} 
            value={0} 
          />
          <Tab 
            icon={<SendIcon />} 
            label={`Sent (${sentRequests.length})`} 
            value={1} 
          />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box>
        {activeTab === 0 ? (
          // Received Requests
          <Box>
            {receivedRequests.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                  No collaboration requests received
                </Typography>
                <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                  When faculty members request to collaborate on your projects, they'll appear here
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {receivedRequests.map((request) => (
                  <Grid item xs={12} md={6} lg={4} key={request._id}>
                    <Card sx={{ 
                      height: '100%',
                      '&:hover': { 
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}>
                      <CardContent>
                        {/* Requester Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: '#075e54', mr: 2 }}>
                            {request.requesterProfile?.userInfo?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {request.requesterProfile?.userInfo?.name || request.requesterUser}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {request.requesterProfile?.userInfo?.department || 'Unknown Department'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Project Info */}
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          For: {request.postId?.title || 'Unknown Project'}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                          <strong>Requested Role:</strong> {request.requestedRole}
                        </Typography>

                        {request.proposedContribution && (
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                            <strong>Contribution:</strong> {request.proposedContribution}
                          </Typography>
                        )}

                        {/* Request Message */}
                        <Paper sx={{ p: 2, backgroundColor: '#f8fafc', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{request.message}"
                          </Typography>
                        </Paper>

                        {/* Status and Date */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip 
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleAcceptRequest(request)}
                              disabled={actionLoading}
                              sx={{
                                backgroundColor: '#059669',
                                '&:hover': { backgroundColor: '#047857' },
                                flex: 1
                              }}
                            >
                              {actionLoading ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Close />}
                              onClick={() => handleRejectRequest(request)}
                              disabled={actionLoading}
                              sx={{
                                borderColor: '#ef4444',
                                color: '#ef4444',
                                '&:hover': { 
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  borderColor: '#dc2626'
                                },
                                flex: 1
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          // Sent Requests
          <Box>
            {sentRequests.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                  No collaboration requests sent
                </Typography>
                <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                  Browse collaboration posts and send requests to connect with other faculty
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {sentRequests.map((request) => (
                  <Grid item xs={12} md={6} lg={4} key={request._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        {/* Post Info */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {request.postId?.title || 'Unknown Project'}
                        </Typography>

                        {/* Owner Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: '#075e54', mr: 2, width: 32, height: 32 }}>
                            {request.ownerUser?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              To: {request.ownerUser}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              College ID: {request.ownerColid}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Request Details */}
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Your Role:</strong> {request.requestedRole}
                        </Typography>

                        {request.proposedContribution && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Your Contribution:</strong> {request.proposedContribution}
                          </Typography>
                        )}

                        {/* Request Message */}
                        <Paper sx={{ p: 2, backgroundColor: '#f8fafc', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{request.message}"
                          </Typography>
                        </Paper>

                        {/* Status and Dates */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                              Sent: {new Date(request.requestedAt).toLocaleDateString()}
                            </Typography>
                            {request.respondedAt && (
                              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                                Responded: {new Date(request.respondedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>

      {/* Rejection Dialog */}
      <Dialog 
        open={responseDialog} 
        onClose={() => setResponseDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Reject Collaboration Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this collaboration request (optional):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleRejectConfirm}
            disabled={actionLoading}
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
          >
            {actionLoading ? 'Processing...' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestsManager;
