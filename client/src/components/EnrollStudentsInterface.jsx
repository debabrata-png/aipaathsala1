import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material';
import { Send, PersonAdd, CheckCircle, Search } from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const EnrollStudentsInterface = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const enrollmentQuestions = [
    {
      field: 'program',
      question: 'What program are we enrolling students to?',
      type: 'text',
      required: true,
      placeholder: 'e.g., Computer Science'
    },
    {
      field: 'programcode',
      question: 'What is the program code?',
      type: 'text',
      required: true,
      placeholder: 'e.g., CS, ENGG'
    },
    {
      field: 'course',
      question: 'Which course?',
      type: 'text',
      required: true,
      placeholder: 'e.g., Data Structures'
    },
    {
      field: 'coursecode',
      question: 'Course code?',
      type: 'text',
      required: true,
      placeholder: 'e.g., CS101'
    },
    {
      field: 'year',
      question: 'Academic year?',
      type: 'text',
      required: true,
      placeholder: 'e.g., 2024-25'
    },
    {
      field: 'semester',
      question: 'Which semester?',
      type: 'select',
      required: true,
      options: ['1', '2', '3', '4', '5', '6', '7', '8']
    },
    {
      field: 'coursetype',
      question: 'Course type?',
      type: 'select',
      required: true,
      options: ['Core', 'Elective', 'Optional', 'Lab', 'Project']
    },
    {
      field: 'students',
      question: 'Now, let\'s search and select students to enroll:',
      type: 'student-search',
      required: true
    }
  ];

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'll help you enroll students to a course. Let's start!`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: enrollmentQuestions[0].question,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchStudents = async (query) => {
    if (query.length < 2) {
      setStudentSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await ep3.get('/searchusers', {
        params: { query, colid: global1.colid }
      });
      
      if (response.data.success) {
        setStudentSearchResults(response.data.data);
      }
    } catch (error) {
      // Handle error
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentInput.trim() && !showStudentSearch) return;

    const currentQuestion = enrollmentQuestions[currentStep];
    
    if (currentInput.trim()) {
      setMessages(prev => [...prev, {
        type: 'user',
        content: currentInput,
        timestamp: new Date()
      }]);

      setEnrollmentData(prev => ({
        ...prev,
        [currentQuestion.field]: currentInput.trim()
      }));
    }

    if (currentStep < enrollmentQuestions.length - 1) {
      setTimeout(() => {
        const nextQuestion = enrollmentQuestions[currentStep + 1];
        setMessages(prev => [...prev, {
          type: 'bot',
          content: nextQuestion.question,
          timestamp: new Date()
        }]);
        
        if (nextQuestion.type === 'student-search') {
          setShowStudentSearch(true);
        } else {
          setShowStudentSearch(false);
        }
        
        setCurrentStep(currentStep + 1);
        setCurrentInput('');
      }, 1000);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '✅ Ready to enroll the selected students?',
          timestamp: new Date()
        }]);
        setIsCompleted(true);
        setCurrentInput('');
      }, 1000);
    }
  };

  const handleStudentSelect = (student) => {
    const isAlreadySelected = selectedStudents.find(s => s._id === student._id);
    if (isAlreadySelected) return;

    setSelectedStudents(prev => [...prev, student]);
    setMessages(prev => [...prev, {
      type: 'user',
      content: `👤 Added: ${student.name} (${student.regno})`,
      timestamp: new Date()
    }]);
  };

  const handleStudentRemove = (studentId) => {
    setSelectedStudents(prev => prev.filter(s => s._id !== studentId));
  };

  const handleCompleteSelection = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setShowStudentSearch(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: `✅ Great! You've selected ${selectedStudents.length} students. Ready to enroll them?`,
      timestamp: new Date()
    }]);
    setIsCompleted(true);
  };

  const handleSubmitEnrollment = async () => {
    setIsSubmitting(true);
    
    try {
      const enrollmentPromises = selectedStudents.map(student =>
        ep3.post('/enrollstudent', {
          name: global1.userName,
          user: global1.userEmail,
          colid: global1.colid,
          student: student.name,
          regno: student.regno,
          gender: student.gender,
          learning: 'Regular',
          active: 'yes',
          status1: 'Active',
          ...enrollmentData
        })
      );

      await Promise.all(enrollmentPromises);

      setMessages(prev => [...prev, {
        type: 'bot',
        content: `🎉 Successfully enrolled ${selectedStudents.length} students!`,
        timestamp: new Date()
      }]);
      
      setTimeout(() => {
        setEnrollmentData({});
        setSelectedStudents([]);
        setCurrentStep(0);
        setIsCompleted(false);
        setMessages([{
          type: 'bot',
          content: '🚀 Ready to enroll more students?',
          timestamp: new Date()
        }, {
          type: 'bot',
          content: enrollmentQuestions[0].question,
          timestamp: new Date()
        }]);
      }, 3000);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to enroll students. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <Paper sx={{ p: 2, backgroundColor: '#059669', color: 'white' }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          👥 Enroll Students
        </Typography>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: { xs: 1, sm: 2 } 
      }}>
        <List sx={{ p: 0 }}>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ p: 0.5, display: 'block' }}>
              <Box sx={{ 
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}>
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: { xs: '85%', sm: '70%' },
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    backgroundColor: message.type === 'user' ? '#059669' : 'white',
                    color: message.type === 'user' ? 'white' : 'black'
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    wordBreak: 'break-word',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {message.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'right', 
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {formatDate(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Student Search Interface */}
      {showStudentSearch && (
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderTop: '1px solid #e0e0e0', 
          backgroundColor: 'white',
          maxHeight: '50vh',
          overflow: 'auto'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            🔍 Search & Select Students
          </Typography>
          
          <Autocomplete
            freeSolo
            options={studentSearchResults}
            getOptionLabel={(option) => `${option.name} (${option.regno})`}
            onInputChange={(event, value) => searchStudents(value)}
            onChange={(event, value) => value && handleStudentSelect(value)}
            loading={searchLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by name or registration number"
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ color: '#9e9e9e', mr: 1 }} />,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          {/* Selected Students */}
          {selectedStudents.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Selected Students ({selectedStudents.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedStudents.map((student) => (
                  <Chip
                    key={student._id}
                    label={`${student.name} (${student.regno})`}
                    onDelete={() => handleStudentRemove(student._id)}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleCompleteSelection}
            disabled={selectedStudents.length === 0}
            sx={{ 
              backgroundColor: '#059669',
              '&:hover': { backgroundColor: '#047857' }
            }}
          >
            Continue with {selectedStudents.length} Students
          </Button>
        </Box>
      )}

      {/* Enrollment Summary */}
      {isCompleted && (
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderTop: '1px solid #e0e0e0', 
          backgroundColor: '#f0f9ff' 
        }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              color: '#059669',
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}>
              📋 Enrollment Summary
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Course:</strong> {enrollmentData.course} ({enrollmentData.coursecode})
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Students to Enroll:</strong> {selectedStudents.length}
            </Typography>

            <Button
              variant="contained"
              onClick={handleSubmitEnrollment}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle />}
              sx={{ 
                backgroundColor: '#059669', 
                '&:hover': { backgroundColor: '#047857' }
              }}
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Students'}
            </Button>
          </Paper>
        </Box>
      )}

      {/* Input Area */}
      {!isCompleted && !showStudentSearch && (
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderTop: '1px solid #e0e0e0', 
          backgroundColor: 'white' 
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {enrollmentQuestions[currentStep]?.type === 'select' ? (
              <TextField
                fullWidth
                select
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={enrollmentQuestions[currentStep]?.placeholder}
                size="small"
                SelectProps={{ native: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                <option value="">Select...</option>
                {enrollmentQuestions[currentStep]?.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={enrollmentQuestions[currentStep]?.placeholder}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc'
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
            )}
            
            <IconButton
              onClick={handleSendMessage}
              disabled={!currentInput.trim()}
              sx={{ 
                color: currentInput.trim() ? '#059669' : '#9e9e9e',
                '&:hover': {
                  backgroundColor: 'rgba(5, 150, 105, 0.1)'
                }
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EnrollStudentsInterface;
