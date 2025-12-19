// components/collaboration/CreatePost.js - COMPLETE VERSION WITH FIXED FLOW
import React, { useState, useEffect, useRef } from 'react';
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
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  ButtonGroup
} from '@mui/material';
import { Send, Add, Delete } from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';

const CreatePost = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [postData, setPostData] = useState({});
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPostTypeButtons, setShowPostTypeButtons] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ FIXED: Proper question order and conditions
  const collaborationQuestions = [
    {
      field: 'postFor',
      question: 'What type of collaboration post do you want to create?',
      type: 'button-select',
      required: true,
      options: [
        { value: 'project', label: '🔬 Project', color: '#3b82f6' },
        { value: 'publication', label: '📄 Publication', color: '#8b5cf6' },
        { value: 'other', label: '🎯 Other', color: '#f59e0b' }
      ]
    },
    {
      field: 'projectId',
      question: 'Which project do you want to collaborate on?',
      type: 'project-select',
      required: true,
      condition: (data) => data.postFor === 'project'
    },
    {
      field: 'publicationId',
      question: 'Which publication do you want to collaborate on?',
      type: 'publication-select',
      required: true,
      condition: (data) => data.postFor === 'publication'
    },
    {
      field: 'otherType',
      question: 'Please specify the type of collaboration:',
      type: 'text',
      required: true,
      placeholder: 'e.g., Research Paper, Conference, Workshop, etc.',
      condition: (data) => data.postFor === 'other'
    },
    {
      field: 'title',
      question: 'What\'s the title for your collaboration post?',
      type: 'text',
      required: true,
      placeholder: 'Enter a descriptive title'
    },
    {
      field: 'description',
      question: 'Please describe what kind of collaboration you\'re looking for:',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the collaboration opportunity, goals, and expectations'
    },
    {
      field: 'collaborationType',
      question: 'What type of collaboration is this?',
      type: 'select',
      required: true,
      options: ['Technical', 'Research', 'Funding', 'Advisory', 'Implementation']
    },
    {
      field: 'requiredSkills',
      question: 'What skills are you looking for in collaborators? (Optional)',
      type: 'skills',
      required: false,
      placeholder: 'Add skills one by one'
    },
    {
      field: 'maxCollaborators',
      question: 'How many collaborators do you need?',
      type: 'number',
      required: true,
      placeholder: 'Enter number (e.g., 3)'
    },
    {
      field: 'visibility',
      question: 'Who should be able to see this collaboration post?',
      type: 'select',
      required: true,
      options: ['same-college', 'cross-college', 'public']
    },
    {
      field: 'deadline',
      question: 'Do you have a deadline for this collaboration? (Optional)',
      type: 'date',
      required: false
    }
  ];

  useEffect(() => {
    fetchAllData();
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! Let's create a collaboration post to connect with other faculty members.`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: collaborationQuestions[0].question,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ FIXED: Better data fetching with error handling
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      console.log('Fetching user data...', { user: global1.userEmail, colid: global1.colid });
      
      const [projectRes, pubRes] = await Promise.all([
        ep3.get('/getprojectsbyuser', {
          params: { 
            user: global1.userEmail, 
            colid: global1.colid 
          }
        }),
        ep3.get('/getpublicationsbyuser', {
          params: { 
            user: global1.userEmail, 
            colid: global1.colid 
          }
        })
      ]);

      console.log('Project response:', projectRes.data);
      console.log('Publication response:', pubRes.data);

      if (projectRes.data.success && projectRes.data.data) {
        setProjects(projectRes.data.data);
        console.log('Projects set:', projectRes.data.data);
      } else {
        setProjects([]);
      }

      if (pubRes.data.success && pubRes.data.data) {
        setPublications(pubRes.data.data);
        console.log('Publications set:', pubRes.data.data);
      } else {
        setPublications([]);
      }

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setProjects([]);
      setPublications([]);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '⚠️ Unable to fetch your projects and publications. You can still create a collaboration post for "Other" types.',
        timestamp: new Date()
      }]);
    } finally {
      setLoadingData(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ FIXED: Better condition checking with debugging
  const shouldShowQuestion = (question) => {
    if (!question.condition) {
      console.log(`Question ${question.field} has no condition, showing it`);
      return true;
    }
    
    const result = question.condition(postData);
    console.log(`Question ${question.field} condition result:`, result, 'postData:', postData);
    return result;
  };

  // ✅ FIXED: Better debugging for question flow
  const getNextQuestion = (currentIndex) => {
    console.log('Getting next question from index:', currentIndex);
    console.log('Current postData:', postData);
    
    for (let i = currentIndex + 1; i < collaborationQuestions.length; i++) {
      const question = collaborationQuestions[i];
      console.log(`Checking question ${i}:`, question.field, question.condition ? 'has condition' : 'no condition');
      
      if (shouldShowQuestion(question)) {
        console.log(`✅ Next question found: ${i} - ${question.field}`);
        return i;
      } else {
        console.log(`❌ Skipping question ${i} - ${question.field}`);
      }
    }
    console.log('No more questions found');
    return -1;
  };

  // ✅ FIXED: Post type selection with immediate state update and proper flow
  const handlePostTypeSelection = (selectedType) => {
    console.log('Selected type:', selectedType);
    
    setMessages(prev => [...prev, {
      type: 'user',
      content: selectedType.label,
      timestamp: new Date()
    }]);

    // Check data availability first
    if (selectedType.value === 'project' && projects.length === 0) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '⚠️ You don\'t have any projects yet. Please create a project first or choose "Other" for general collaboration.',
        timestamp: new Date()
      }]);
      return;
    }

    if (selectedType.value === 'publication' && publications.length === 0) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '⚠️ You don\'t have any publications yet. Please create a publication first or choose "Other" for general collaboration.',
        timestamp: new Date()
      }]);
      return;
    }

    // ✅ CRITICAL FIX: Update postData immediately
    const updatedPostData = {
      ...postData,
      postFor: selectedType.value
    };
    
    setPostData(updatedPostData);
    setShowPostTypeButtons(false);

    // ✅ FIXED: Use timeout to ensure state is updated and find next question
    setTimeout(() => {
      let nextStep = -1;
      
      // Find the appropriate next question based on selection
      if (selectedType.value === 'project') {
        nextStep = collaborationQuestions.findIndex(q => q.field === 'projectId');
      } else if (selectedType.value === 'publication') {
        nextStep = collaborationQuestions.findIndex(q => q.field === 'publicationId');
      } else if (selectedType.value === 'other') {
        nextStep = collaborationQuestions.findIndex(q => q.field === 'otherType');
      }
      
      console.log('Determined next step:', nextStep, 'for type:', selectedType.value);
      
      if (nextStep !== -1 && nextStep < collaborationQuestions.length) {
        const nextQuestion = collaborationQuestions[nextStep];
        console.log('Moving to question:', nextQuestion.field, nextQuestion.question);
        
        setCurrentStep(nextStep);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: nextQuestion.question,
          timestamp: new Date()
        }]);
      } else {
        // Fallback to title question
        const titleIndex = collaborationQuestions.findIndex(q => q.field === 'title');
        console.log('Fallback to title question at index:', titleIndex);
        
        if (titleIndex !== -1) {
          setCurrentStep(titleIndex);
          setMessages(prev => [...prev, {
            type: 'bot',
            content: collaborationQuestions[titleIndex].question,
            timestamp: new Date()
          }]);
        }
      }
    }, 1000);
  };

  // ✅ FIXED: Handle regular message sending
  const handleSendMessage = () => {
    if (!currentInput.trim() && collaborationQuestions[currentStep].required) return;

    const currentQuestion = collaborationQuestions[currentStep];
    console.log('Handling message for question:', currentQuestion.field);
    
    // Show user's response in chat
    let displayContent = currentInput || 'Skipped';
    
    let processedValue = currentInput.trim();
    
    if (currentQuestion.type === 'number') {
      processedValue = parseInt(currentInput) || 1;
    } else if (currentQuestion.type === 'project-select') {
      const selectedProject = projects.find(p => p._id === currentInput);
      processedValue = currentInput;
      
      if (selectedProject) {
        const projectName = selectedProject.project || selectedProject.title || selectedProject.name;
        displayContent = projectName;
        setPostData(prev => ({
          ...prev, 
          selectedProjectName: projectName
        }));
        console.log('Selected project:', projectName);
      }
    } else if (currentQuestion.type === 'publication-select') {
      const selectedPublication = publications.find(p => p._id === currentInput);
      processedValue = currentInput;
      
      if (selectedPublication) {
        const publicationName = selectedPublication.title || selectedPublication.name;
        displayContent = publicationName;
        setPostData(prev => ({
          ...prev, 
          selectedPublicationName: publicationName
        }));
        console.log('Selected publication:', publicationName);
      }
    } else if (currentQuestion.type === 'skills') {
      processedValue = skills;
      displayContent = `${skills.length} skills added`;
    }

    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: displayContent,
      timestamp: new Date()
    }]);

    // Update postData
    setPostData(prev => ({
      ...prev,
      [currentQuestion.field]: processedValue
    }));

    // Find next question
    const nextStep = getNextQuestion(currentStep);
    
    if (nextStep !== -1) {
      setTimeout(() => {
        const nextQuestion = collaborationQuestions[nextStep];
        console.log('Moving to next question:', nextQuestion.field);
        
        setMessages(prev => [...prev, {
          type: 'bot',
          content: nextQuestion.question,
          timestamp: new Date()
        }]);
        setCurrentStep(nextStep);
        setCurrentInput('');
      }, 1000);
    } else {
      // All questions completed
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '✅ Perfect! Here\'s your collaboration post summary:',
          timestamp: new Date()
        }]);
        setIsCompleted(true);
        setCurrentInput('');
      }, 1000);
    }
  };

  const handleSkillAdd = () => {
    if (currentInput.trim()) {
      setSkills(prev => [...prev, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  // ✅ FIXED: Better submit with proper data preparation
  const handleSubmitPost = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        title: postData.title,
        description: postData.description,
        postFor: postData.postFor,
        user: global1.userEmail,
        colid: global1.colid,
        department: global1.userDepartment,
        collaborationType: postData.collaborationType,
        maxCollaborators: postData.maxCollaborators,
        visibility: postData.visibility,
        requiredSkills: skills,
        deadline: postData.deadline
      };

      // Add conditional fields based on post type
      if (postData.postFor === 'project' && postData.projectId) {
        submitData.projectId = postData.projectId;
      }
      
      if (postData.postFor === 'publication' && postData.publicationId) {
        submitData.publicationId = postData.publicationId;
      }
      
      if (postData.postFor === 'other' && postData.otherType) {
        submitData.otherType = postData.otherType;
      }

      console.log('Submitting collaboration post:', submitData);

      const response = await ep3.post('/createcollaborationpost', submitData);

      if (response.data.success) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '🎉 Excellent! Your collaboration post has been published successfully.',
          timestamp: new Date()
        }]);

        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `❌ Error: ${error.response?.data?.message || error.message || 'Failed to create post'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPostData({});
    setSkills([]);
    setCurrentStep(0);
    setIsCompleted(false);
    setShowPostTypeButtons(true);
    setMessages([{
      type: 'bot',
      content: '🚀 Ready to create another collaboration post?',
      timestamp: new Date()
    }, {
      type: 'bot',
      content: collaborationQuestions[0].question,
      timestamp: new Date()
    }]);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayValue = (field, value) => {
    switch (field) {
      case 'postFor':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'visibility':
        return value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      default:
        return value;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc'
    }}>
      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        minHeight: 0
      }}>
        <List sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ 
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              py: 1
            }}>
              <Paper sx={{
                p: 1.5,
                backgroundColor: message.type === 'user' ? '#075e54' : '#ffffff',
                color: message.type === 'user' ? 'white' : 'inherit',
                maxWidth: '70%',
                borderRadius: '18px',
                borderBottomRightRadius: message.type === 'user' ? '6px' : '18px',
                borderBottomLeftRadius: message.type === 'user' ? '18px' : '6px'
              }}>
                <Typography variant="body2">
                  {message.content}
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  mt: 0.5,
                  opacity: 0.7,
                  textAlign: 'right'
                }}>
                  {formatDate(message.timestamp)}
                </Typography>
              </Paper>
            </ListItem>
          ))}

          {/* ✅ FIXED: Post Type Selection Buttons */}
          {currentStep === 0 && showPostTypeButtons && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px' }}>
                {loadingData ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ mt: 2, color: '#6b7280' }}>
                      Loading your projects and publications...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {collaborationQuestions[0].options.map((option) => {
                      let disabled = false;
                      let subtitle = '';
                      
                      if (option.value === 'project') {
                        disabled = projects.length === 0;
                        subtitle = projects.length > 0 ? `${projects.length} projects available` : 'No projects found';
                      } else if (option.value === 'publication') {
                        disabled = publications.length === 0;
                        subtitle = publications.length > 0 ? `${publications.length} publications available` : 'No publications found';
                      } else {
                        subtitle = 'For any other type of collaboration';
                      }

                      return (
                        <Button
                          key={option.value}
                          variant="contained"
                          size="large"
                          disabled={disabled}
                          onClick={() => handlePostTypeSelection(option)}
                          sx={{
                            backgroundColor: disabled ? '#9ca3af' : option.color,
                            '&:hover': { 
                              backgroundColor: disabled ? '#9ca3af' : option.color,
                              filter: disabled ? 'none' : 'brightness(0.9)'
                            },
                            py: 2,
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          {option.label}
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {subtitle}
                          </Typography>
                        </Button>
                      );
                    })}
                  </>
                )}
              </Box>
            </ListItem>
          )}

          {/* ✅ FIXED: Summary Display */}
          {isCompleted && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <Paper sx={{ p: 2, maxWidth: '600px', width: '100%' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  textAlign: 'center',
                  color: '#075e54'
                }}>
                  🤝 Collaboration Post Summary
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {postData.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                    {postData.description}
                  </Typography>
                  
                  <Typography variant="body2"><strong>Post Type:</strong> {getDisplayValue('postFor', postData.postFor)}</Typography>
                  
                  {/* ✅ FIXED: Show selected project/publication/other type */}
                  {postData.postFor === 'other' && postData.otherType && (
                    <Typography variant="body2"><strong>Type:</strong> {postData.otherType}</Typography>
                  )}
                  {postData.postFor === 'project' && postData.selectedProjectName && (
                    <Typography variant="body2"><strong>Project:</strong> {postData.selectedProjectName}</Typography>
                  )}
                  {postData.postFor === 'publication' && postData.selectedPublicationName && (
                    <Typography variant="body2"><strong>Publication:</strong> {postData.selectedPublicationName}</Typography>
                  )}
                  
                  <Typography variant="body2"><strong>Collaboration Type:</strong> {postData.collaborationType}</Typography>
                  <Typography variant="body2"><strong>Max Collaborators:</strong> {postData.maxCollaborators}</Typography>
                  <Typography variant="body2"><strong>Visibility:</strong> {getDisplayValue('visibility', postData.visibility)}</Typography>
                  
                  {skills.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Skills Required:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {skills.map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill}
                            size="small"
                            sx={{ backgroundColor: '#e8f5e8' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmitPost}
                  disabled={isSubmitting}
                  sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Collaboration Post'}
                </Button>
              </Paper>
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* ✅ FIXED: Input Area */}
      {!isCompleted && !showPostTypeButtons && (
        <Paper sx={{ 
          p: 2,
          borderRadius: 0, 
          borderTop: '1px solid #e0e0e0',
          minHeight: 'auto'
        }}>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {/* Skills Input */}
            {collaborationQuestions[currentStep]?.type === 'skills' && (
              <Box>
                {skills.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Added Skills:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {skills.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill}
                          onDelete={() => handleSkillRemove(skill)}
                          deleteIcon={<Delete />}
                          size="small"
                          sx={{ backgroundColor: '#e8f5e8' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Enter a skill"
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillAdd();
                      }
                    }}
                  />
                  <IconButton onClick={handleSkillAdd} sx={{ backgroundColor: '#075e54', color: 'white' }}>
                    <Add />
                  </IconButton>
                </Box>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#f59e0b' }}
                  onClick={() => {
                    setCurrentInput('');
                    handleSendMessage();
                  }}
                >
                  Continue
                </Button>
              </Box>
            )}

            {/* Other Input Types */}
            {collaborationQuestions[currentStep]?.type !== 'skills' && collaborationQuestions[currentStep]?.type !== 'button-select' && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                {collaborationQuestions[currentStep]?.type === 'select' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Option</InputLabel>
                    <Select
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      label="Select Option"
                    >
                      {collaborationQuestions[currentStep]?.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : collaborationQuestions[currentStep]?.type === 'project-select' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Project</InputLabel>
                    <Select
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      label="Select Project"
                    >
                      {projects.map((project) => (
                        <MenuItem key={project._id} value={project._id}>
                          {project.project || project.title || project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : collaborationQuestions[currentStep]?.type === 'publication-select' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Publication</InputLabel>
                    <Select
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      label="Select Publication"
                    >
                      {publications.map((publication) => (
                        <MenuItem key={publication._id} value={publication._id}>
                          {publication.title || publication.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : collaborationQuestions[currentStep]?.type === 'textarea' ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder={collaborationQuestions[currentStep]?.placeholder}
                    size="small"
                  />
                ) : collaborationQuestions[currentStep]?.type === 'date' ? (
                  <TextField
                    fullWidth
                    type="date"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder={collaborationQuestions[currentStep]?.placeholder}
                    size="small"
                    type={collaborationQuestions[currentStep]?.type === 'number' ? 'number' : 'text'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                )}

                <IconButton 
                  onClick={handleSendMessage}
                  sx={{ backgroundColor: '#075e54', color: 'white' }}
                >
                  <Send />
                </IconButton>
              </Box>
            )}

            {collaborationQuestions[currentStep]?.required && (
              <Typography variant="caption" sx={{ color: '#ef4444', mt: 1, display: 'block' }}>
                * This field is required
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CreatePost;
