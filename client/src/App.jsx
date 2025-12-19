import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import global1 from './pages/global1';
import Register from './pages/Register';
import EnrollmentLinkGuard from './pages/EnrollmentLinkGuard';
import EnrollmentLinkGuard1 from './pages/EnrollmentLinkGuard1';
import EnrollmentLinkGuard2 from './pages/EnrollmentLinkGuard2';
import LandingPage from './pages/LandingPage';


const theme = createTheme({
  palette: {
    primary: {
      main: '#075e54',
    },
    secondary: {
      main: '#25d366',
    },
    background: {
      default: '#f0f2f5',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (global1.userId) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                <Login setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" />
              } 
            />
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/" element={<Navigate to="/landingpage" />} />
            <Route path='/register/:token?' element={<Register />} />
            <Route path="/enroll/:token" element={<EnrollmentLinkGuard />} />
            <Route path='/enrolladvance/:token' element={<EnrollmentLinkGuard1 />} />
            <Route path='/enrollremedial/:token' element={<EnrollmentLinkGuard2 />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

