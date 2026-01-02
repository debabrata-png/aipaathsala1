import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add,
    Save,
    ArrowBack,
    Edit,
    Delete,
    DragHandle,
    CloudUpload
} from '@mui/icons-material';
import QuestionEditor from './QuestionEditor';
import BulkQuestionUploader from './BulkQuestionUploader';
import MathRenderer from '../../MathRenderer';
import ep3 from '../../../api/ep3';
import global1 from '../../../pages/global1';

const TestQuestionManager = ({ test, onBack, onUpdate }) => {
    const [questions, setQuestions] = useState(test.questions || []);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // 0: List, 1: Bulk Upload

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            questionnumber: questions.length + 1,
            question: '',
            optiona: '',
            optionb: '',
            optionc: '',
            optiond: '',
            correctanswer: 'a',
            explanation: '',
            difficulty: 'medium',
            section: test.sections?.[0]?.name || '',
            isgenerated: false
        };
        setEditingQuestion(newQuestion);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion({ ...question });
    };

    const handleDeleteQuestion = (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = questions
                .filter(q => (q._id || q.id) !== questionId)
                .map((q, idx) => ({ ...q, questionnumber: idx + 1 }));
            setQuestions(updatedQuestions);
        }
    };

    const handleSaveQuestion = (updatedQuestion) => {
        if (editingQuestion.id || !editingQuestion._id) {
            // New question or unsaved new question
            const existingIdx = questions.findIndex(q => (q.id === editingQuestion.id));
            if (existingIdx !== -1) {
                const updated = [...questions];
                updated[existingIdx] = updatedQuestion;
                setQuestions(updated);
            } else {
                setQuestions([...questions, updatedQuestion]);
            }
        } else {
            // Editing existing question from DB
            setQuestions(questions.map(q => q._id === updatedQuestion._id ? updatedQuestion : q));
        }
        setEditingQuestion(null);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const response = await ep3.post('/updatetestquestionsds1', {
                testid: test._id,
                questions: questions.map((q, idx) => ({ ...q, questionnumber: idx + 1 })),
                colid: global1.colid,
                user: global1.userEmail
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Questions updated successfully!' });
                if (onUpdate) onUpdate(response.data.data);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update questions' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkSuccess = (updatedQuestions) => {
        setQuestions(updatedQuestions);
        if (onUpdate) onUpdate(updatedQuestions);
        setMessage({ type: 'success', text: 'Questions uploaded successfully!' });
        setActiveTab(0);
    };

    if (editingQuestion) {
        return (
            <Box sx={{ p: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => setEditingQuestion(null)}
                    sx={{ mb: 2 }}
                >
                    Back to List
                </Button>
                <QuestionEditor
                    initialData={editingQuestion}
                    onSave={handleSaveQuestion}
                    onCancel={() => setEditingQuestion(null)}
                    sections={test.sections || []}
                    sectionBased={test.sectionBased}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e40af' }}>
                        Manage Questions: {test.testtitle}
                    </Typography>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mt: 1 }}>
                        <Tab label={`List (${questions.length})`} />
                        <Tab label="Bulk Upload" icon={<CloudUpload fontSize="small" />} iconPosition="start" />
                    </Tabs>
                </Box>
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={handleAddQuestion}
                        >
                            Add Question
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Save />}
                            onClick={handleSaveAll}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </Box>
                )}
            </Box>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {activeTab === 1 ? (
                <BulkQuestionUploader
                    testId={test._id}
                    colid={global1.colid}
                    user={global1.userEmail}
                    onUploadSuccess={handleBulkSuccess}
                />
            ) : (
                <Box>
                    {questions.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                            <Typography color="text.secondary">No questions in this test yet.</Typography>
                            <Button startIcon={<Add />} onClick={handleAddQuestion} sx={{ mt: 2 }}>
                                Add Your First Question
                            </Button>
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {questions.map((q, index) => (
                                <Paper
                                    key={q._id || q.id}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'flex-start',
                                        '&:hover': { bgcolor: '#f8fafc' }
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700, minWidth: 40, color: '#1e40af' }}>
                                        Q{index + 1}
                                    </Typography>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            {q.isgenerated && <Chip label="AI" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />}
                                            <Chip label={q.difficulty} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                                            {q.section && <Chip label={q.section} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                                        </Box>
                                        <Box sx={{ mb: 1 }}>
                                            <MathRenderer content={q.question} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Correct: {q.correctanswer?.toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton size="small" onClick={() => handleEditQuestion(q)} color="primary">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteQuestion(q._id || q.id)} color="error">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default TestQuestionManager;
