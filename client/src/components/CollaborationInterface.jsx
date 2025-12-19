// components/CollaborationInterface.jsx - REDUCED HEADER HEIGHT
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import {
  Handshake,
  PostAdd,
  ViewList,
  Mail,
  Chat,
  Person
} from '@mui/icons-material';
import BrowsePosts from './collaboration/BrowsePosts';
import MyPosts from './collaboration/MyPosts';
import CreatePost from './collaboration/CreatePost';
import RequestsManager from './collaboration/RequestsManager';
import ActiveCollaborations from './collaboration/ActiveCollaborations';

const CollaborationInterface = ({ onOpenChat }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ✅ REDUCED: Header height */}
      {/* ✅ FIXED: Reduced header height */}
      <Paper sx={{ 
        p: 2, // ✅ Reduced from 3 to 2
        backgroundColor: '#075e54',
        color: 'white',
        borderRadius: 0
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}> {/* ✅ Reduced from h4 to h5 */}
          🤝 Create Collaboration
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Connect with faculty across institutions
        </Typography>
      </Paper>


      {/* Tabs */}
      <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ViewList />} label="Browse Posts" value={0} />
          <Tab icon={<Person />} label="My Posts" value={1} />
          <Tab icon={<PostAdd />} label="Create Post" value={2} />
          <Tab icon={<Mail />} label="Requests" value={3} />
          <Tab icon={<Handshake />} label="Active" value={4} />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 && <BrowsePosts />}
        {activeTab === 1 && <MyPosts />}
        {activeTab === 2 && <CreatePost />}
        {activeTab === 3 && <RequestsManager />}
        {activeTab === 4 && <ActiveCollaborations onOpenChat={onOpenChat} />}
      </Box>
    </Box>
  );
};

export default CollaborationInterface;
