import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import { Add, List } from '@mui/icons-material';
import SeminarChatCreator from './SeminarChatCreator';
import SeminarsList from './SeminarsList';

const SeminarsInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Box sx={{ p: 2, backgroundColor: '#06b6d4', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            🎤 Seminars Management
          </Typography>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add />
                <span>Create Seminar</span>
              </Box>
            }
            value={0}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <List />
                <span>My Seminars</span>
              </Box>
            }
            value={1}
          />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        {activeTab === 0 && <SeminarChatCreator />}
        {activeTab === 1 && <SeminarsList />}
      </Box>
    </Box>
  );
};

export default SeminarsInterface;
