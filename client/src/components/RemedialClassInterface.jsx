import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import { Add, List, PersonAdd, Assessment } from '@mui/icons-material';
import CreateClassInterface from './remedialclasses/CreateClassInterface';
import ManageClassesInterface from './remedialclasses/ManageClassesInterface';
import EnrollStudentsInterface from './remedialclasses/EnrollStudentsInterface';
import ReportsInterface from './remedialclasses/ReportsInterface';

const AdvanceClassesInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

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
        <Box sx={{ p: 2, backgroundColor: '#7c3aed', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            🏫 Classes & Attendance Management
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
                <Add />
                <span>Create Class</span>
              </Box>
            }
            value={0}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd />
                <span>Enroll Students</span>
              </Box>
            }
            value={1}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                <span>Reports</span>
              </Box>
            }
            value={2}
          />
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
          {activeTab === 0 && <CreateClassInterface />}
          {activeTab === 1 && <EnrollStudentsInterface />}
          {activeTab === 2 && <ReportsInterface />}
        </Box>
      </Box>
    </Box>
  );
};

export default AdvanceClassesInterface;

