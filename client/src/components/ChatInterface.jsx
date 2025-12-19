import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Assignment, MenuBook, Folder } from '@mui/icons-material';
import SyllabusRoom from './SyllabusRoom';
import AssignmentRoom from './AssignmentRoom';
import CourseMaterialRoom from './CourseMaterialRoom';
import io from 'socket.io-client';
import global1 from '../pages/global1';

const ChatInterface = ({ course, selectedRoom, onRoomChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!course) return;

    
    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    const newSocket = io('https://epaathsala.azurewebsites.net',
    //const newSocket = io('http://localhost:8000',
     {
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      timeout: 20000,
    });
    
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      
      // Join ALL rooms immediately after connection
      const allRooms = [
        `${course.coursecode}_syllabus`,
        `${course.coursecode}_assignments`,
        `${course.coursecode}_materials`
      ];

      allRooms.forEach(room => {
        newSocket.emit('join_room', {
          room,
          userEmail: global1.userEmail,
          userName: global1.userName,
          userRole: global1.userRole,
          courseId: course._id
        });
      });

      // Test all rooms
      setTimeout(() => {
        allRooms.forEach(room => {
          newSocket.emit('test_room', { room });
        });
      }, 1000);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      setConnectionStatus('error');
    });

    return () => {
      if (newSocket && newSocket.connected) {
        const allRooms = [
          `${course.coursecode}_syllabus`,
          `${course.coursecode}_assignments`,
          `${course.coursecode}_materials`
        ];
        
        allRooms.forEach(room => {
          newSocket.emit('leave_room', {
            room,
            userEmail: global1.userEmail,
            userName: global1.userName
          });
        });
        newSocket.close();
      }
    };
  }, [course._id]); // Only re-run when course changes

  const handleTabChange = (event, newValue) => {
    onRoomChange(newValue);
  };

  const tabsConfig = [
    { value: 'syllabus', label: 'Syllabus', icon: <MenuBook /> },
    { value: 'assignments', label: 'Assignments', icon: <Assignment /> },
    { value: 'materials', label: 'Materials', icon: <Folder /> }
  ];

  const renderRoomContent = () => {
    const roomId = `${course.coursecode}_${selectedRoom}`;
    
    switch (selectedRoom) {
      case 'syllabus':
        return <SyllabusRoom course={course} socket={socket} roomId={roomId} />;
      case 'assignments':
        return <AssignmentRoom course={course} socket={socket} roomId={roomId} />;
      case 'materials':
        return <CourseMaterialRoom course={course} socket={socket} roomId={roomId} />;
      default:
        return <SyllabusRoom course={course} socket={socket} roomId={roomId} />;
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Course Header - Only on desktop */}
      {!isMobile && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            backgroundColor: '#075e54', 
            color: 'white',
            borderRadius: 0,
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {course.coursename || course.course}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {course.coursecode} • {course.year}
              </Typography>
            </Box>
            <Typography variant="caption" 
              sx={{ 
                color: connectionStatus === 'connected' ? '#4caf50' : '#f44336',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {connectionStatus === 'connected' ? '🟢 Connected' : 
               connectionStatus === 'error' ? '🔴 Error' : '🟡 Connecting...'}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Room Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 0, 
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0
        }}
      >
        <Tabs
          value={selectedRoom}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          indicatorColor="primary"
          textColor="primary"
          sx={{ 
            minHeight: { xs: 40, sm: 48 },
            '& .MuiTab-root': {
              minHeight: { xs: 40, sm: 48 },
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              padding: { xs: '6px 12px', sm: '12px 16px' }
            }
          }}
        >
          {tabsConfig.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {tab.icon}
                  </Box>
                  <span>{tab.label}</span>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Room Content */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        width: '100%',
        minHeight: 0
      }}>
        {renderRoomContent()}
      </Box>
    </Box>
  );
};

export default ChatInterface;
