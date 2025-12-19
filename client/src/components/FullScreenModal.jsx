import React, { useEffect } from 'react';
import { Alert, Box } from '@mui/material';

const FullScreenModal = ({ open, children, onForceExit }) => {
  useEffect(() => {
    if (!open) return;

    // Prevent page refresh, closing tab, or navigating away
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Are you sure you want to leave? Your test progress will be lost.";
      return event.returnValue;
    };

    // Prevent back navigation
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      if (onForceExit) {
        onForceExit();
      } else {
        alert("You cannot leave the test until you submit it!");
      }
    };

    // Block F5, Ctrl+R, etc.
    const handleKeyDown = (event) => {
      // Block F5, Ctrl+R, Ctrl+W, Alt+F4, etc.
      if (
        event.key === 'F5' ||
        (event.ctrlKey && (event.key === 'r' || event.key === 'R')) ||
        (event.ctrlKey && (event.key === 'w' || event.key === 'W')) ||
        (event.altKey && event.key === 'F4') ||
        event.key === 'F11' // Prevent fullscreen toggle
      ) {
        event.preventDefault();
        alert("Keyboard shortcuts are disabled during the test!");
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);

    // Disable right-click context menu
    const handleContextMenu = (event) => {
      event.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [open, onForceExit]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none' // Prevent text selection
      }}
    >
      {/* Warning Banner */}
      <Alert severity="warning" sx={{ borderRadius: 0 }}>
        🔒 <strong>Secure Test Mode:</strong> You cannot exit this page until you submit the test. 
        Refreshing or closing will result in auto-submission.
      </Alert>
      
      {children}
    </Box>
  );
};

export default FullScreenModal;
