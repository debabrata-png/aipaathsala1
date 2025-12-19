// src/components/BookChatCreator.jsx
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
import { Send, MenuBook, CheckCircle } from '@mui/icons-material';
import FileUpload from './FileUpload';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import { ocrAndCheckValues } from '../utils/ocrService';

const BookChatCreator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [bookData, setBookData] = useState({});
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

  const bookQuestions = [
    {
      field: 'booktitle',
      question: 'What is the title of the book/proceedings?',
      type: 'text',
      required: true,
      placeholder: 'Enter book or proceedings title'
    },
    {
      field: 'papertitle',
      question: 'What is the title of your paper/chapter in this book?',
      type: 'text',
      required: true,
      placeholder: 'Enter paper/chapter title'
    },
    {
      field: 'proceeding',
      question: 'What are the proceedings details?',
      type: 'text',
      required: true,
      placeholder: 'Enter proceedings details'
    },
    {
      field: 'publisher',
      question: 'Who is the publisher of this book?',
      type: 'text',
      required: true,
      placeholder: 'Enter publisher name'
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
      question: 'What is the ISBN/ISSN number?',
      type: 'text',
      required: true,
      placeholder: 'Enter ISBN or ISSN'
    },
    {
      field: 'type',
      question: 'What type of book contribution is this?',
      type: 'select',
      required: true,
      options: ['Book', 'Chapter', 'Proceedings']
    },
    {
      field: 'level',
      question: 'What is the level of this publication?',
      type: 'select',
      required: true,
      options: ['International', 'National', 'Regional', 'Local']
    },
    {
      field: 'conferencename',
      question: 'If this is from a conference, what is the conference name? (Optional)',
      type: 'text',
      required: false,
      placeholder: 'Enter conference name'
    },
    {
      field: 'affiliated',
      question: 'Are you affiliated with the publisher/organizing body?',
      type: 'select',
      required: true,
      options: ['Yes', 'No']
    },
    {
      field: 'status1',
      question: 'What is the current status?',
      type: 'select',
      required: true,
      options: ['Published', 'Accepted', 'Under Review', 'Submitted', 'In Press', 'In Preparation']
    },
    {
      field: 'comments',
      question: 'Any additional comments about this book contribution? (Optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional details about your contribution'
    }
  ];

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'll help you register a book publication/chapter. Let's gather the necessary information.`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: bookQuestions[0].question,
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

    const currentQuestion = bookQuestions[currentStep];
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }]);

    setBookData(prev => ({
      ...prev,
      [currentQuestion.field]: currentInput.trim()
    }));

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextStep = currentStep + 1;
    if (nextStep < bookQuestions.length) {
      setCurrentStep(nextStep);
      setCurrentInput('');
      setMessages(prev => [...prev, {
        type: 'bot',
        content: bookQuestions[nextStep].question,
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
        content: 'Select a document to check if it matches your entered data: name, book title, paper title, and publisher.',
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
    
    // Create items to check: name, booktitle, papertitle, publisher
    const itemsToCheck = [
      global1.userName,
      bookData.booktitle,
      bookData.papertitle,
      bookData.publisher
    ].filter(Boolean).join('~');

    const { score } = await ocrAndCheckValues(docToCheckFile, itemsToCheck);
    
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
      setIsCompleted(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Great! All information collected. Ready to save your book entry.',
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setBookData(prev => ({ ...prev, doclink: fileUrl }));
    setShowFileUpload(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Document uploaded successfully!',
      timestamp: new Date()
    }]);
    setIsCompleted(true);
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Great! All information collected. Ready to save your book entry.',
      timestamp: new Date()
    }]);
  };

  const handleCancelUpload = () => {
    setShowFileUpload(false);
    setShowDocumentOptions(true);
  };

  const handleLinkSubmit = () => {
    if (currentInput.trim()) {
      setBookData(prev => ({ ...prev, doclink: currentInput.trim() }));
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
        content: 'Document link saved! All information collected. Ready to save your book entry.',
        timestamp: new Date()
      }]);
    }
  };

  const handleSelectOption = (value) => {
    const currentQuestion = bookQuestions[currentStep];
    setBookData(prev => ({ ...prev, [currentQuestion.field]: value }));
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: value,
      timestamp: new Date()
    }]);

    moveToNextQuestion();
  };

  const handleSubmitBook = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        booktitle: bookData.booktitle || '',
        papertitle: bookData.papertitle || '',
        proceeding: bookData.proceeding || '',
        yop: bookData.yop || '',
        issn: bookData.issn || '',
        publisher: bookData.publisher || '',
        status1: bookData.status1 || '',
        comments: bookData.comments || '',
        conferencename: bookData.conferencename || '',
        level: bookData.level || '',
        type: bookData.type || '',
        doclink: bookData.doclink || '',
        affiliated: bookData.affiliated || ''
      };

      const response = await ep3.post('createbook', payload);
      
      if (response?.data?.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Book entry saved successfully! 🎉',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Failed to save book entry. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Error saving book entry. Please try again.',
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

  const currentQuestion = bookQuestions[currentStep];
  const allBasicQuestionsAnswered = currentStep >= bookQuestions.length;
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: '#8b5cf6', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook /> Create Book Entry
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

        {/* Validation Choice */}
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

            <Button size="small" variant="outlined" onClick={handleDocumentCheck} sx={{ mb: 2 }}>
              Check Document
            </Button>

            {ocrMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>{ocrMessage}</Alert>
            )}

            <Button variant="contained" onClick={proceedToDocumentOptions}>
              Continue to Document Options
            </Button>
          </Box>
        )}

        {/* Document Options */}
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
            
            <Typography variant="h6" sx={{ mb: 2 }}>Book Summary:</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Book Title:</strong> {bookData.booktitle}</Typography>
              <Typography><strong>Paper Title:</strong> {bookData.papertitle}</Typography>
              <Typography><strong>Publisher:</strong> {bookData.publisher}</Typography>
              <Typography><strong>Year:</strong> {bookData.yop}</Typography>
              <Typography><strong>Type:</strong> {bookData.type}</Typography>
              <Typography><strong>Level:</strong> {bookData.level}</Typography>
              <Typography><strong>Status:</strong> {bookData.status1}</Typography>
              <Typography><strong>ISBN/ISSN:</strong> {bookData.issn}</Typography>
              <Typography><strong>Affiliated:</strong> {bookData.affiliated}</Typography>
              {bookData.conferencename && <Typography><strong>Conference:</strong> {bookData.conferencename}</Typography>}
              {bookData.comments && <Typography><strong>Comments:</strong> {bookData.comments}</Typography>}
              {bookData.doclink && <Typography><strong>Document:</strong> Added</Typography>}
            </Box>

            <Button 
              variant="contained" 
              size="large" 
              onClick={handleSubmitBook} 
              disabled={isSubmitting}
              sx={{ mt: 2, backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Book Entry'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Input Area */}
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

export default BookChatCreator;
