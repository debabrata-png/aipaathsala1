import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import { Quiz, Add, List, Assessment, VpnKey } from '@mui/icons-material';
import TestCoursesInterface from './TestCoursesInterface';
import TestResultsInterface from './TestResultsInterface';
import APIKeyManagerInterface from './APIKeyManagerInterface';
import global1 from '../pages/global1';

const TestsInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

  const getUserPermissions = (role) => {
    const roleUpper = role?.toUpperCase();
    return {
      isFaculty: roleUpper === 'FACULTY',
      isStudent: roleUpper === 'STUDENT',
      canCreateTests: roleUpper === 'FACULTY',
      canTakeTests: roleUpper === 'STUDENT',
      canViewResults: ['FACULTY', 'STUDENT'].includes(roleUpper),
      canManageAPIKeys: roleUpper === 'FACULTY'
    };
  };

  const permissions = getUserPermissions(global1.userRole);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Fixed Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          flexShrink: 0
        }}
      >
        <Box sx={{ p: 2, backgroundColor: '#f97316', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            📝 Tests & Assessments
            <Typography variant="body2" sx={{ ml: 2, opacity: 0.8 }}>
              {permissions.isFaculty ? 'Faculty Dashboard' : 'Student Portal'}
            </Typography>
          </Typography>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 56
            }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Quiz />
                <span>{permissions.isFaculty ? 'My Courses & Tests' : 'Available Tests'}</span>
              </Box>
            }
            value={0}
          />
          {permissions.isStudent && (
            <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                <span>Results & Analytics</span>
              </Box>
            }
            value={1}
          />
          )}
          {permissions.canManageAPIKeys && (
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKey />
                  <span>API Key Settings</span>
                </Box>
              }
              value={2}
            />
          )}
        </Tabs>
      </Paper>

      {/* Content Area */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            height: '100%'
          }}
        >
          {activeTab === 0 && <TestCoursesInterface />}
          {activeTab === 1 && permissions.isStudent && <TestResultsInterface />}
          {activeTab === 2 && permissions.canManageAPIKeys && <APIKeyManagerInterface />}
        </Box>
      </Box>
    </Box>
  );
};

export default TestsInterface;
