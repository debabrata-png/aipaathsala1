// components/SidebarNotificationCenter.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Collapse,
  Alert,
  Button
} from '@mui/material';
import {
  Notifications,
  ExpandLess,
  ExpandMore,
  Circle,
  Check,
  Clear,
  Person,
  Group,
  Schedule
} from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const SidebarNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('/getnotifications', {
        params: { 
          user: global1.userEmail, 
          colid: global1.colid 
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await ep3.get('/getunreadnotificationscount', {
        params: { 
          user: global1.userEmail, 
          colid: global1.colid 
        }
      });
      
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await ep3.post('/marknotificationread', { 
        notificationId 
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await ep3.post('/markallnotificationsread', {
        user: global1.userEmail,
        colid: global1.colid
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'collaboration_request':
        return <Group sx={{ color: '#f59e0b' }} />;
      case 'request_accepted':
        return <Check sx={{ color: '#059669' }} />;
      case 'request_rejected':
        return <Clear sx={{ color: '#ef4444' }} />;
      default:
        return <Person sx={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'collaboration_request':
        return '#f59e0b';
      case 'request_accepted':
        return '#059669';
      case 'request_rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
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

  return (
    <Box>
      {/* Notification Header in Sidebar */}
      <ListItem disablePadding>
        <ListItemButton 
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              fetchNotifications();
            }
          }}
          sx={{
            backgroundColor: isOpen ? '#e8f5e8' : 'transparent',
            borderLeft: isOpen ? '3px solid #075e54' : 'none',
            '&:hover': {
              backgroundColor: '#f0f9f0'
            }
          }}
        >
          <ListItemIcon>
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '18px',
                  minWidth: '18px'
                }
              }}
            >
              <Notifications sx={{ color: '#075e54' }} />
            </Badge>
          </ListItemIcon>
          <ListItemText 
            primary="Notifications" 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: isOpen ? 600 : 400,
                color: '#075e54'
              } 
            }}
          />
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>

      {/* Notification List Dropdown */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box sx={{ 
          backgroundColor: '#f8fafc', 
          borderRadius: '0 0 8px 8px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {/* Header with Actions */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Recent Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={markAllAsRead}
                sx={{ 
                  fontSize: '0.7rem',
                  color: '#075e54',
                  textTransform: 'none'
                }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          {/* Notifications List */}
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                No notifications yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                You'll see collaboration updates here
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ py: 0 }}>
              {notifications.slice(0, 8).map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : '#fff3cd',
                      borderLeft: notification.isRead ? 'none' : '3px solid #f59e0b',
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0f9f0'
                      }
                    }}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.isRead ? 400 : 600,
                          fontSize: '0.8rem',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#6b7280',
                          fontSize: '0.7rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 0.5 
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9ca3af',
                            fontSize: '0.65rem'
                          }}
                        >
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                        
                        {!notification.isRead && (
                          <Circle sx={{ 
                            fontSize: '8px', 
                            color: getNotificationColor(notification.type) 
                          }} />
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                  
                  {index < notifications.slice(0, 8).length - 1 && (
                    <Divider sx={{ backgroundColor: '#e5e7eb' }} />
                  )}
                </React.Fragment>
              ))}
              
              {notifications.length > 8 && (
                <ListItem sx={{ justifyContent: 'center', py: 1 }}>
                  <Button 
                    size="small" 
                    sx={{ 
                      fontSize: '0.7rem',
                      color: '#075e54',
                      textTransform: 'none'
                    }}
                  >
                    View all notifications
                  </Button>
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SidebarNotificationCenter;
