// src/components/ProjectChatCreator.jsx
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Send, Science, CheckCircle } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import { ocrAndCheckValues } from '../utils/ocrService';

const ProjectChatCreator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Document validation flow states
  const [showValidationChoice, setShowValidationChoice] = useState(false);
  const [showDocumentOptions, setShowDocumentOptions] = useState(false);
  const [showDocCheck, setShowDocCheck] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  
  // Document checking
  const [docToCheckFile, setDocToCheckFile] = useState(null);
  const [ocrMessage, setOcrMessage] = useState('');

  const messagesEndRef = useRef(null);

  const projectQuestions = [
    {
      field: 'project',
      question: 'What is the title of your project?',
      type: 'text',
      required: true,
      placeholder: 'Enter project title'
    },
    {
      field: 'agency',
      question: 'Which agency/organization is funding this project?',
      type: 'text',
      required: true,
      placeholder: 'Enter funding agency name'
    },
    {
      field: 'type',
      question: 'What type of project is this?',
      type: 'select',
      required: true,
      options: ['University funded', 'External funding', 'RUSA', 'TEQIP']
    },
    {
      field: 'department',
      question: 'Which department is this project associated with?',
      type: 'text',
      required: true,
      placeholder: 'Enter department name'
    },
    {
      field: 'funds',
      question: 'What is the total funding amount for this project?',
      type: 'number',
      required: true,
      placeholder: 'Enter amount in rupees'
    },
    {
      field: 'duration',
      question: 'What is the duration of this project?',
      type: 'text',
      required: true,
      placeholder: 'e.g., 2 years, 18 months'
    },
    {
      field: 'yop',
      question: 'In which year was this project awarded/started?',
      type: 'text',
      required: true,
      placeholder: 'Enter year (e.g., 2024)'
    },
    {
      field: 'level',
      question: 'What is the level of this project? (Optional)',
      type: 'select',
      required: false,
      options: ['National', 'International', 'State', 'Regional', 'Local', 'Institutional']
    },
    {
      field: 'status1',
      question: 'What is the current status of this project? (Optional)',
      type: 'select',
      required: false,
      options: ['Ongoing', 'Completed', 'Suspended', 'Terminated', 'Pending']
    },
    {
      field: 'comments',
      question: 'Any additional comments about this project? (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional details, objectives, or outcomes'
    }
  ];

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'll help you register a new research project. Let's gather the necessary information.`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: projectQuestions[0].question,
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
    if (!currentInput.trim()) return;

    const currentQuestion = projectQuestions[currentStep];
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }]);

    setProjectData(prev => ({
      ...prev,
      [currentQuestion.field]: currentQuestion.type === 'number' ? parseFloat(currentInput) : currentInput.trim()
    }));

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextStep = currentStep + 1;
    if (nextStep < projectQuestions.length) {
      setCurrentStep(nextStep);
      setCurrentInput('');
      setMessages(prev => [...prev, {
        type: 'bot',
        content: projectQuestions[nextStep].question,
        timestamp: new Date()
      }]);
    } else {
      // All basic questions done, now show validation choice
      setShowValidationChoice(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Document validation options:',
        timestamp: new Date()
      }]);
    }
  };

  const handleValidationChoice = (choice) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: choice === 'check' ? 'Check Document' : 'Skip Validating',
      timestamp: new Date()
    }]);

    setShowValidationChoice(false);

    if (choice === 'check') {
      setShowDocCheck(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Select a document to check if it matches your entered data: name, agency, project title, and funds.',
        timestamp: new Date()
      }]);
    } else {
      // Skip validation, go directly to document options
      setShowDocumentOptions(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Document options:',
        timestamp: new Date()
      }]);
    }
  };

  const handleDocumentCheck = async () => {
  if (!docToCheckFile) {
    setOcrMessage('Please choose a file to check.');
    return;
  }

  setOcrMessage('Running OCR...');
  
  // Create items to check: name, agency, project, funds
  const itemsToCheck = [
    global1.userName,
    projectData.agency,
    projectData.project,
    projectData.funds ? String(projectData.funds) : ''
  ].filter(Boolean).join('~');

  const { score } = await ocrAndCheckValues(docToCheckFile, itemsToCheck);
  
  // FIX: Handle the missing items - it's already a string, not an array
  const missingItems = score.missing || '';
  
  setOcrMessage(`Match ${score.percentage}% — Missing: ${missingItems}`);
};


  const proceedToDocumentOptions = () => {
    setShowDocCheck(false);
    setShowDocumentOptions(true);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Document options:',
      timestamp: new Date()
    }]);
  };

  const handleDocumentChoice = (choice) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: choice === 'upload' ? 'Upload Document' : 
               choice === 'link' ? 'Add Doc Link' : 'Skip',
      timestamp: new Date()
    }]);

    setShowDocumentOptions(false);

    if (choice === 'upload') {
      setShowFileUpload(true);
    } else if (choice === 'link') {
      setShowLinkInput(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Please provide the document link:',
        timestamp: new Date()
      }]);
    } else if (choice === 'skip') {
      // Skip document, go to completion
      setIsCompleted(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Great! All information collected. Ready to save your project.',
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setProjectData(prev => ({ ...prev, doclink: fileUrl }));
    setShowFileUpload(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Document uploaded successfully!',
      timestamp: new Date()
    }]);
    setIsCompleted(true);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Great! All information collected. Ready to save your project.',
      timestamp: new Date()
    }]);
  };

  const handleCancelUpload = () => {
    setShowFileUpload(false);
    setShowDocumentOptions(true); // Show document options again
  };

  const handleLinkSubmit = () => {
    if (currentInput.trim()) {
      setProjectData(prev => ({ ...prev, doclink: currentInput.trim() }));
      setMessages(prev => [...prev, {
        type: 'user',
        content: currentInput,
        timestamp: new Date()
      }]);
      setShowLinkInput(false);
      setCurrentInput('');
      setIsCompleted(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Document link saved! All information collected. Ready to save your project.',
        timestamp: new Date()
      }]);
    }
  };

  const handleSelectOption = (value) => {
    const currentQuestion = projectQuestions[currentStep];
    setProjectData(prev => ({ ...prev, [currentQuestion.field]: value }));
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: value,
      timestamp: new Date()
    }]);

    moveToNextQuestion();
  };

  const handleSubmitProject = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        project: projectData.project || '',
        agency: projectData.agency || '',
        type: projectData.type || '',
        yop: projectData.yop || '',
        department: projectData.department || '',
        funds: Number(projectData.funds) || 0,
        status1: projectData.status1 || '',
        comments: projectData.comments || '',
        level: projectData.level || '',
        duration: projectData.duration || '',
        doclink: projectData.doclink || ''
      };

      const response = await ep3.post('createproject', payload);
      
      if (response?.data?.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Project saved successfully! 🎉',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Failed to save project. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Error saving project. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showLinkInput) {
        handleLinkSubmit();
      } else if (currentInput.trim()) {
        handleSendMessage();
      }
    }
  };

  const currentQuestion = projectQuestions[currentStep];
  const allBasicQuestionsAnswered = currentStep >= projectQuestions.length;
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: '#8b5cf6', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science /> Create Project
        </Typography>
      </Paper>

      {/* Messages */}
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '75%',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: message.type === 'user' ? '#8b5cf6' : '#ffffff',
                  color: message.type === 'user' ? '#fff' : '#111827',
                  border: message.type === 'user' ? 'none' : '1px solid #e5e7eb'
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Step 1: Validation Choice (Check Document or Skip Validating) */}
        {showValidationChoice && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1, backgroundColor: 'white' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Document Validation Options</FormLabel>
              <RadioGroup>
                <FormControlLabel
                  value="check"
                  control={<Radio />}
                  label="Check Document"
                  onClick={() => handleValidationChoice('check')}
                />
                <FormControlLabel
                  value="skip"
                  control={<Radio />}
                  label="Skip Validating"
                  onClick={() => handleValidationChoice('skip')}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Document Check UI */}
        {showDocCheck && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1, backgroundColor: 'white' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Document Check</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Button variant="outlined" component="label">
                Choose File
                <input
                  hidden
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setDocToCheckFile(file);
                  }}
                />
              </Button>
              {docToCheckFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {docToCheckFile.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button size="small" variant="outlined" onClick={handleDocumentCheck}>
                Check Document
              </Button>
            </Box>

            {ocrMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>{ocrMessage}</Alert>
            )}

            <Button variant="contained" onClick={proceedToDocumentOptions}>
              Continue to Document Options
            </Button>
          </Box>
        )}

        {/* Step 2: Document Options (Upload/Link/Skip) */}
        {showDocumentOptions && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1, backgroundColor: 'white' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Document Options</FormLabel>
              <RadioGroup>
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload Document"
                  onClick={() => handleDocumentChoice('upload')}
                />
                <FormControlLabel
                  value="link"
                  control={<Radio />}
                  label="Add Doc Link"
                  onClick={() => handleDocumentChoice('link')}
                />
                <FormControlLabel
                  value="skip"
                  control={<Radio />}
                  label="Skip"
                  onClick={() => handleDocumentChoice('skip')}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* File Upload */}
        {showFileUpload && (
          <Box sx={{ mt: 2 }}>
            <FileUpload onFileUpload={handleFileUpload} onCancel={handleCancelUpload} />
          </Box>
        )}

        {/* Completion Summary */}
        {isCompleted && !showFileUpload && !showDocumentOptions && !showDocCheck && !showValidationChoice && !showLinkInput && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #059669', borderRadius: 1, backgroundColor: '#f0fdf4' }}>
            <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 2 }}>
              All information collected successfully!
            </Alert>
            
            <Typography variant="h6" sx={{ mb: 2 }}>Project Summary:</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Title:</strong> {projectData.project}</Typography>
              <Typography><strong>Agency:</strong> {projectData.agency}</Typography>
              <Typography><strong>Type:</strong> {projectData.type}</Typography>
              <Typography><strong>Department:</strong> {projectData.department}</Typography>
              <Typography><strong>Funds:</strong> ₹{projectData.funds}</Typography>
              <Typography><strong>Duration:</strong> {projectData.duration}</Typography>
              <Typography><strong>Year:</strong> {projectData.yop}</Typography>
              {projectData.level && <Typography><strong>Level:</strong> {projectData.level}</Typography>}
              {projectData.status1 && <Typography><strong>Status:</strong> {projectData.status1}</Typography>}
              {projectData.comments && <Typography><strong>Comments:</strong> {projectData.comments}</Typography>}
              {projectData.doclink && <Typography><strong>Document:</strong> Added</Typography>}
            </Box>

            <Button 
              variant="contained" 
              size="large" 
              onClick={handleSubmitProject} 
              disabled={isSubmitting}
              sx={{ mt: 2, backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Project'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Input Area for regular questions and link input */}
      {((!allBasicQuestionsAnswered && currentQuestion) || showLinkInput) && !showValidationChoice && !showDocumentOptions && !showDocCheck && !showFileUpload && (
        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          {showLinkInput ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Enter document link (URL)"
                variant="outlined"
                size="small"
              />
              <IconButton color="primary" onClick={handleLinkSubmit}>
                <Send />
              </IconButton>
            </Box>
          ) : currentQuestion?.type === 'select' ? (
            <FormControl component="fieldset">
              <FormLabel component="legend">{currentQuestion.question}</FormLabel>
              <RadioGroup>
                {currentQuestion.options?.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                    onClick={() => handleSelectOption(option)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline={currentQuestion?.type === 'textarea'}
                rows={currentQuestion?.type === 'textarea' ? 3 : 1}
                type={currentQuestion?.type === 'number' ? 'text' : 'text'}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={currentQuestion?.placeholder}
                variant="outlined"
                size="small"
              />
              <IconButton color="primary" onClick={handleSendMessage}>
                <Send />
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectChatCreator;
