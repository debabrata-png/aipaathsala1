// src/components/BooksInterface.jsx
import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import BookChatCreator from './BookChatCreator';
import BooksList from './BooksList';

const BooksInterface = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#8b5cf6'
            }
          }}
        >
          <Tab
            label="Create Book Entry"
            sx={{
              '&.Mui-selected': {
                color: '#8b5cf6'
              }
            }}
          />
          <Tab
            label="Books List"
            sx={{
              '&.Mui-selected': {
                color: '#8b5cf6'
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {currentTab === 0 && <BookChatCreator />}
        {currentTab === 1 && <BooksList />}
      </Box>
    </Box>
  );
};

export default BooksInterface;
