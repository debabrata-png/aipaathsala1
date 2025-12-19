import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import { Add, List } from '@mui/icons-material';
import PublicationChatCreator from './PublicationChatCreator';
import PublicationsList from './PublicationsList';

const PublicationsInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Box sx={{ p: 2, backgroundColor: '#ef4444', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            📄 Publications Management
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
                <span>Create Publication</span>
              </Box>
            }
            value={0}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <List />
                <span>My Publications</span>
              </Box>
            }
            value={1}
          />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        {activeTab === 0 && <PublicationChatCreator />}
        {activeTab === 1 && <PublicationsList />}
      </Box>
    </Box>
  );
};

export default PublicationsInterface;

