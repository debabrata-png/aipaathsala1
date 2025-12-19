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
  CircularProgress
} from '@mui/material';
import { Send, BusinessCenter, CheckCircle } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';

const ConsultancyChatCreator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [consultancyData, setConsultancyData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);

  const consultancyQuestions = [
    {
      field: 'year',
      question: 'In which year did this consultancy take place?',
      type: 'text',
      required: true,
      placeholder: 'Enter year (e.g., 2024)'
    },
    {
      field: 'consultant',
      question: 'What is the name of the consultant?',
      type: 'text',
      required: true,
      placeholder: 'Enter consultant name'
    },
    {
      field: 'advisor',
      question: 'Who is the advisor for this consultancy?',
      type: 'text',
      required: true,
      placeholder: 'Enter advisor name'
    },
    {
      field: 'agency',
      question: 'Which agency/organization requested this consultancy?',
      type: 'text',
      required: true,
      placeholder: 'Enter agency/organization name'
    },
    {
      field: 'contact',
      question: 'What is the contact number for this consultancy?',
      type: 'number',
      required: true,
      placeholder: 'Enter contact number'
    },
    {
      field: 'revenue',
      question: 'What revenue was generated from this consultancy?',
      type: 'number',
      required: true,
      placeholder: 'Enter amount in rupees'
    },
    {
      field: 'status1',
      question: 'What is the current status of this consultancy?',
      type: 'select',
      required: true,
      options: ['Ongoing', 'Completed', 'Pending', 'Cancelled', 'On Hold']
    },
    {
      field: 'comments',
      question: 'Please provide comments about this consultancy:',
      type: 'textarea',
      required: true,
      placeholder: 'Enter details about the consultancy project, outcomes, etc.'
    },
    {
      field: 'title',
      question: 'What is the title/topic of this consultancy? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter consultancy title or topic'
    },
    {
      field: 'duration',
      question: 'What was the duration of this consultancy? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'e.g., 3 months, 6 weeks, 1 year'
    },
    {
      field: 'department',
      question: 'Which department was involved in this consultancy? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter department name'
    },
    {
      field: 'trainees',
      question: 'How many trainees were involved? (Optional)',
      type: 'number',
      required: false,
      placeholder: 'Enter number of trainees'
    },
    {
      field: 'role',
      question: 'What was your role in this consultancy? (Optional)',
      type: 'select',
      required: false,
      options: ['Lead Consultant', 'Co-Consultant', 'Technical Advisor', 'Subject Matter Expert', 'Project Manager', 'Trainer']
    },
    {
      field: 'doclink',
      question: 'Would you like to upload any supporting document (contract, report, etc.)? (Optional)',
      type: 'file',
      required: false
    }
  ];

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'll help you register a new consultancy project. Let's gather the necessary information.`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: consultancyQuestions[0].question,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!currentInput.trim() && !showFileUpload) return;

    const currentQuestion = consultancyQuestions[currentStep];
    
    if (currentInput.trim()) {
      setMessages(prev => [...prev, {
        type: 'user',
        content: currentInput,
        timestamp: new Date()
      }]);

      setConsultancyData(prev => ({
        ...prev,
        [currentQuestion.field]: currentQuestion.type === 'number' ? parseFloat(currentInput) : currentInput.trim()
      }));
    }

    if (currentStep < consultancyQuestions.length - 1) {
      setTimeout(() => {
        const nextQuestion = consultancyQuestions[currentStep + 1];
        setMessages(prev => [...prev, {
          type: 'bot',
          content: nextQuestion.question,
          timestamp: new Date()
        }]);
        
        if (nextQuestion.type === 'file') {
          setShowFileUpload(true);
        } else {
          setShowFileUpload(false);
        }
        
        setCurrentStep(currentStep + 1);
        setCurrentInput('');
      }, 1000);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '✅ Excellent! I have collected all the consultancy information. Here\'s a summary:',
          timestamp: new Date()
        }]);
        setIsCompleted(true);
        setCurrentInput('');
      }, 1000);
    }
  };

  const handleFileUpload = (url) => {
    setConsultancyData(prev => ({
      ...prev,
      doclink: url
    }));
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: '📎 Document uploaded successfully',
      timestamp: new Date()
    }]);

    setShowFileUpload(false);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '✅ Perfect! I have collected all the information. Here\'s a summary of your consultancy:',
        timestamp: new Date()
      }]);
      setIsCompleted(true);
    }, 1000);
  };

  const handleSubmitConsultancy = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await ep3.post('/createconsultancy', {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        ...consultancyData
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '🎉 Excellent! Your consultancy has been successfully registered in the system.',
          timestamp: new Date()
        }, {
          type: 'bot',
          content: 'You can view and manage all your consultancies in the "My Consultancies" tab.',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          setConsultancyData({});
          setCurrentStep(0);
          setIsCompleted(false);
          setMessages([{
            type: 'bot',
            content: '🚀 Ready to register another consultancy? Let\'s begin!',
            timestamp: new Date()
          }, {
            type: 'bot',
            content: consultancyQuestions[0].question,
            timestamp: new Date()
          }]);
        }, 3000);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Sorry, there was an error saving your consultancy. Please try again.',
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2, 
        backgroundColor: '#fafafa' 
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
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: message.type === 'user' ? '#059669' : 'white',
                    color: message.type === 'user' ? 'white' : 'black'
                  }}
                >
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
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
          
          {isCompleted && (
            <ListItem sx={{ p: 0.5, display: 'block' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={2}
                  sx={{
                    maxWidth: '85%',
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessCenter /> Consultancy Summary
                  </Typography>
                  
                  <Box sx={{ space: 1 }}>
                    {Object.entries(consultancyData).map(([key, value]) => {
                      const question = consultancyQuestions.find(q => q.field === key);
                      if (!value || !question) return null;
                      
                      return (
                        <Box key={key} sx={{ mb: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            {question.question.replace('?', '')}:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                            {key === 'doclink' ? '📎 Document attached' : 
                             key === 'revenue' ? formatCurrency(value) : value}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitConsultancy}
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle />}
                      sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Consultancy'}
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </ListItem>
          )}
          
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {showFileUpload && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
          <FileUpload 
            onFileUpload={handleFileUpload}
            onCancel={() => {
              setShowFileUpload(false);
              handleSendMessage();
            }}
          />
        </Box>
      )}

      {!isCompleted && !showFileUpload && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0', 
          backgroundColor: 'white' 
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {consultancyQuestions[currentStep]?.type === 'select' ? (
              <TextField
                fullWidth
                select
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={consultancyQuestions[currentStep]?.placeholder}
                size="small"
                SelectProps={{ native: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                <option value="">Select option...</option>
                {consultancyQuestions[currentStep]?.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            ) : consultancyQuestions[currentStep]?.type === 'textarea' ? (
              <TextField
                fullWidth
                multiline
                rows={3}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={consultancyQuestions[currentStep]?.placeholder}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc'
                  }
                }}
              />
            ) : consultancyQuestions[currentStep]?.type === 'number' ? (
              <TextField
                fullWidth
                type="number"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={consultancyQuestions[currentStep]?.placeholder}
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
            ) : (
              <TextField
                fullWidth
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={consultancyQuestions[currentStep]?.placeholder}
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
              disabled={!currentInput.trim() && consultancyQuestions[currentStep]?.required}
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
          
          {consultancyQuestions[currentStep]?.required && (
            <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5 }}>
              * This field is required
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ConsultancyChatCreator;
