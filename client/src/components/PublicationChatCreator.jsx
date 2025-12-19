// src/components/PublicationChatCreator.jsx
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
import { Send, Article, CheckCircle } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import { ocrAndCheckValues } from '../utils/ocrService';

const PublicationChatCreator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [publicationData, setPublicationData] = useState({});
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

  const publicationQuestions = [
    {
      field: 'title',
      question: 'What is the title of your publication?',
      type: 'text',
      required: true,
      placeholder: 'Enter publication title'
    },
    {
      field: 'journal',
      question: 'Which journal was this published in?',
      type: 'text',
      required: true,
      placeholder: 'Enter journal name'
    },
    {
      field: 'department',
      question: 'Which department is associated with this publication?',
      type: 'text',
      required: true,
      placeholder: 'Enter department name'
    },
    {
      field: 'yop',
      question: 'What is the year of publication?',
      type: 'text',
      required: true,
      placeholder: 'Enter year (e.g., 2024)'
    },
    {
      field: 'issn',
      question: 'What is the ISSN of the journal? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter ISSN number'
    },
    {
      field: 'level',
      question: 'What is the level of this publication?',
      type: 'select',
      required: true,
      options: ['International', 'National', 'Regional', 'Local']
    },
    {
      field: 'ugclisted',
      question: 'Is this journal UGC listed?',
      type: 'select',
      required: true,
      options: ['Yes', 'No']
    },
    {
      field: 'hindex',
      question: 'What is the H-Index of the journal? (Optional)',
      type: 'number',
      required: false,
      placeholder: 'Enter H-Index value'
    },
    {
      field: 'citation',
      question: 'How many citations does this publication have? (Optional)',
      type: 'number',
      required: false,
      placeholder: 'Enter citation count'
    },
    {
      field: 'citationindex',
      question: 'What is the citation index? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter citation index (e.g., SCI, Scopus)'
    },
    {
      field: 'status1',
      question: 'What is the current status of this publication?',
      type: 'select',
      required: true,
      options: ['Published', 'Accepted', 'Under Review', 'Submitted', 'In Progress']
    },
    {
      field: 'articlelink',
      question: 'Provide the article link (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter article URL'
    },
    {
      field: 'journallink',
      question: 'Provide the journal link (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter journal URL'
    },
    {
      field: 'comments',
      question: 'Any additional comments about this publication? (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional details'
    }
  ];

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'll help you register a new publication. Let's gather the necessary information.`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: publicationQuestions[0].question,
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

    const currentQuestion = publicationQuestions[currentStep];
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }]);

    setPublicationData(prev => ({
      ...prev,
      [currentQuestion.field]: currentQuestion.type === 'number' ? parseFloat(currentInput) || 0 : currentInput.trim()
    }));

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextStep = currentStep + 1;
    if (nextStep < publicationQuestions.length) {
      setCurrentStep(nextStep);
      setCurrentInput('');
      setMessages(prev => [...prev, {
        type: 'bot',
        content: publicationQuestions[nextStep].question,
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
        content: 'Select a document to check if it matches your entered data: name, publication title, journal name, and year of publication.',
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
    
    // Create items to check: name, title, journal, yop
    const itemsToCheck = [
      global1.userName,
      publicationData.title,
      publicationData.journal,
      publicationData.yop
    ].filter(Boolean).join('~');

    const { score } = await ocrAndCheckValues(docToCheckFile, itemsToCheck);
    
    // Handle the missing items - it's already a string, not an array
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
        content: 'Great! All information collected. Ready to save your publication.',
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setPublicationData(prev => ({ ...prev, doclink: fileUrl }));
    setShowFileUpload(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Document uploaded successfully!',
      timestamp: new Date()
    }]);
    setIsCompleted(true);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Great! All information collected. Ready to save your publication.',
      timestamp: new Date()
    }]);
  };

  const handleCancelUpload = () => {
    setShowFileUpload(false);
    setShowDocumentOptions(true); // Show document options again
  };

  const handleLinkSubmit = () => {
    if (currentInput.trim()) {
      setPublicationData(prev => ({ ...prev, doclink: currentInput.trim() }));
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
        content: 'Document link saved! All information collected. Ready to save your publication.',
        timestamp: new Date()
      }]);
    }
  };

  const handleSelectOption = (value) => {
    const currentQuestion = publicationQuestions[currentStep];
    setPublicationData(prev => ({ ...prev, [currentQuestion.field]: value }));
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: value,
      timestamp: new Date()
    }]);

    moveToNextQuestion();
  };

  const handleSubmitPublication = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        department: publicationData.department || '',
        title: publicationData.title || '',
        journal: publicationData.journal || '',
        yop: publicationData.yop || '',
        issn: publicationData.issn || '',
        articlelink: publicationData.articlelink || '',
        journallink: publicationData.journallink || '',
        hindex: publicationData.hindex || 0,
        citation: publicationData.citation || 0,
        status1: publicationData.status1 || '',
        comments: publicationData.comments || '',
        level: publicationData.level || '',
        citationindex: publicationData.citationindex || '',
        doclink: publicationData.doclink || '',
        ugclisted: publicationData.ugclisted || ''
      };

      const response = await ep3.post('createpublication', payload);
      
      if (response?.data?.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Publication saved successfully! 🎉',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Failed to save publication. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Error saving publication. Please try again.',
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

  const currentQuestion = publicationQuestions[currentStep];
  const allBasicQuestionsAnswered = currentStep >= publicationQuestions.length;
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: '#8b5cf6', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Article /> Create Publication
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
            
            <Typography variant="h6" sx={{ mb: 2 }}>Publication Summary:</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Title:</strong> {publicationData.title}</Typography>
              <Typography><strong>Journal:</strong> {publicationData.journal}</Typography>
              <Typography><strong>Department:</strong> {publicationData.department}</Typography>
              <Typography><strong>Year:</strong> {publicationData.yop}</Typography>
              <Typography><strong>Level:</strong> {publicationData.level}</Typography>
              <Typography><strong>UGC Listed:</strong> {publicationData.ugclisted}</Typography>
              <Typography><strong>Status:</strong> {publicationData.status1}</Typography>
              {publicationData.issn && <Typography><strong>ISSN:</strong> {publicationData.issn}</Typography>}
              {publicationData.hindex > 0 && <Typography><strong>H-Index:</strong> {publicationData.hindex}</Typography>}
              {publicationData.citation > 0 && <Typography><strong>Citations:</strong> {publicationData.citation}</Typography>}
              {publicationData.citationindex && <Typography><strong>Citation Index:</strong> {publicationData.citationindex}</Typography>}
              {publicationData.articlelink && <Typography><strong>Article Link:</strong> Added</Typography>}
              {publicationData.journallink && <Typography><strong>Journal Link:</strong> Added</Typography>}
              {publicationData.doclink && <Typography><strong>Document:</strong> Added</Typography>}
              {publicationData.comments && <Typography><strong>Comments:</strong> {publicationData.comments}</Typography>}
            </Box>

            <Button 
              variant="contained" 
              size="large" 
              onClick={handleSubmitPublication} 
              disabled={isSubmitting}
              sx={{ mt: 2, backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Publication'}
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
                type={currentQuestion?.type === 'number' ? 'number' : 'text'}
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

export default PublicationChatCreator;
