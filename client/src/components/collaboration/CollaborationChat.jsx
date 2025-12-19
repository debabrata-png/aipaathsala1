// components/collaboration/CollaborationChat.jsx - COMPLETE VERSION
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Send,
  ArrowBack,
  Search,
  Group,
  Business,
  Schedule
} from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const CollaborationChat = ({ selectedRoom: initialSelectedRoom }) => { // ✅ ACCEPT SELECTED ROOM
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(initialSelectedRoom || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    // If a room is passed from props, use it
    if (initialSelectedRoom) {
      setSelectedRoom(initialSelectedRoom);
      setMessages([]); // Clear previous messages
    }
  }, [initialSelectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.chatRoomId);
      const interval = setInterval(() => {
        fetchMessages(selectedRoom.chatRoomId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getactivecollaborations', {
        params: {
          user: global1.userEmail,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        setChatRooms(response.data.data);
      }
    } catch (error) {
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatRoomId) => {
    try {
      const response = await ep3.get(`/getmessagesbyroom/${chatRoomId}`, {
      });
      
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Messages fetch error:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    setSendingMessage(true);
    try {
      const response = await ep3.post('/savemessage', {
        room: selectedRoom.chatRoomId,
        sender: global1.userEmail,
        sendername: global1.userName,
        role: global1.userRole,
        message: newMessage,
        msgtype: 'text',
        colid: global1.colid,
        course: selectedRoom.postId?.title || 'Collaboration',
        coursecode: selectedRoom._id
      });

      if (response.data.success) {
        setNewMessage('');
        fetchMessages(selectedRoom.chatRoomId);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatTime(timestamp);
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setError('');
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setMessages([]);
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  // ✅ SHOW CHAT ROOM LIST - FULL WIDTH LIST ITEMS
  if (!selectedRoom) {
    return (
      <Box sx={{ 
        height: '100vh', 
        backgroundColor: '#f0f2f5',
        overflow: 'auto'
      }}>
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          backgroundColor: '#075e54',
          color: 'white',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            💬 Collaboration Chat Rooms
          </Typography>
          <IconButton sx={{ color: 'white' }}>
            <Search />
          </IconButton>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        {/* Chat Rooms List */}
        <Paper sx={{ m: 3, borderRadius: 2 }}>
          {chatRooms.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#667781', mb: 2 }}>
                No Active Chat Rooms
              </Typography>
              <Typography variant="body1" sx={{ color: '#9ca3af' }}>
                Start collaborating to see your chat rooms here
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {chatRooms.map((room, index) => (
                <React.Fragment key={room._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleRoomClick(room)}
                      sx={{
                        py: 3,
                        px: 3,
                        width: '100%',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      {/* Avatar */}
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#075e54', 
                            width: 56, 
                            height: 56,
                            fontSize: '1.2rem'
                          }}
                        >
                          {room.postId?.title?.charAt(0) || 'C'}
                        </Avatar>
                      </ListItemAvatar>

                      {/* Main Content */}
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {room.postId?.title || 'Collaboration Chat'}
                            </Typography>
                            <Chip 
                              label="Active"
                              size="small"
                              sx={{ 
                                bgcolor: '#059669',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {/* Project Info */}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mb: 0.5
                              }}
                            >
                              <Business fontSize="small" />
                              {room.projectId?.project || 'Project collaboration'}
                            </Typography>

                            {/* Participants */}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <Group fontSize="small" />
                              {room.participants?.length || 0} participants
                            </Typography>
                          </Box>
                        }
                      />

                      {/* Right Side - Last Activity */}
                      <Box sx={{ 
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 0.5
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <Schedule fontSize="small" />
                          Last activity
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#667781', 
                            fontWeight: 600 
                          }}
                        >
                          {formatLastSeen(room.lastActivity)}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  
                  {/* Divider between items */}
                  {index < chatRooms.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    );
  }

  // ✅ SHOW CHAT INTERFACE - FULL SCREEN
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Chat Header */}
      <Paper sx={{ 
        p: 2,
        backgroundColor: '#075e54',
        color: 'white',
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconButton 
          sx={{ color: 'white', mr: 2 }}
          onClick={handleBackToRooms}
        >
          <ArrowBack />
        </IconButton>
        
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
          {selectedRoom.postId?.title?.charAt(0) || 'C'}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedRoom.postId?.title || 'Collaboration Chat'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {selectedRoom.participants?.length} participants • {selectedRoom.projectId?.project}
          </Typography>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="a" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="translate(0,0) scale(1,1)"%3E%3Crect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.05)"%3E%3C/rect%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="url(%23a)"%3E%3C/rect%3E%3C/svg%3E")',
        p: 2
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <Avatar sx={{ 
              bgcolor: '#075e54', 
              width: 80, 
              height: 80,
              mb: 3,
              fontSize: '2rem'
            }}>
              💬
            </Avatar>
            <Typography variant="h5" sx={{ color: '#667781', mb: 1 }}>
              No messages yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Start the conversation with your collaborators
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender === global1.userEmail;
              
              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 1,
                    alignItems: 'flex-end'
                  }}
                >
                  {!isOwnMessage && (
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1,
                        bgcolor: '#6b7280'
                      }}
                    >
                      {message.sendername?.charAt(0) || 'U'}
                    </Avatar>
                  )}
                  
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      backgroundColor: isOwnMessage ? '#dcf8c6' : 'white',
                      borderRadius: isOwnMessage 
                        ? '18px 18px 5px 18px' 
                        : '18px 18px 18px 5px',
                      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                      position: 'relative'
                    }}
                  >
                    {!isOwnMessage && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#075e54',
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        {message.sendername}
                      </Typography>
                    )}
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        wordBreak: 'break-word',
                        mb: 0.5
                      }}
                    >
                      {message.message}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#667781',
                        fontSize: '0.7rem',
                        float: 'right',
                        mt: 0.5
                      }}
                    >
                      {formatTime(message.timestamp)}
                      {isOwnMessage && ' ✓✓'}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Paper
        component="form"
        onSubmit={sendMessage}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 0,
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          size="small"
          disabled={sendingMessage}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: 'white'
            }
          }}
        />
        
        <IconButton
          type="submit"
          disabled={!newMessage.trim() || sendingMessage}
          sx={{
            backgroundColor: '#075e54',
            color: 'white',
            '&:hover': {
              backgroundColor: '#128c7e'
            },
            '&:disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          {sendingMessage ? <CircularProgress size={20} /> : <Send />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default CollaborationChat;
