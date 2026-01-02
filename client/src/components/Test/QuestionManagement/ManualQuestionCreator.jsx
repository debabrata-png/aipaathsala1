import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Dialog,
    DialogContent,
    Fab,
    Tooltip,
    Chip
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    DragIndicator,
    Quiz
} from '@mui/icons-material';
import QuestionEditor from './QuestionEditor';
import MathRenderer from '../../MathRenderer';

const ManualQuestionCreator = ({
    sections = [],
    sectionBased = false,
    existingQuestions = [],
    onQuestionsChange
}) => {
    const [questions, setQuestions] = useState(existingQuestions);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setEditorOpen(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setEditorOpen(true);
    };

    const handleDeleteQuestion = (id) => {
        const updated = questions.filter(q => q.id !== id);
        setQuestions(updated);
        onQuestionsChange(updated);
    };

    const handleSaveQuestion = (questionData) => {
        let updated;
        if (editingQuestion) {
            updated = questions.map(q => q.id === editingQuestion.id ? { ...questionData, id: q.id } : q);
        } else {
            const newQuestion = {
                ...questionData,
                id: Date.now(),
                questionnumber: questions.length + 1
            };
            updated = [...questions, newQuestion];
        }

        setQuestions(updated);
        onQuestionsChange(updated);
        setEditorOpen(false);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Quiz color="primary" /> Manual Questions ({questions.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddQuestion}
                    sx={{ borderRadius: 2 }}
                >
                    Add New Question
                </Button>
            </Box>

            {questions.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        borderStyle: 'dashed'
                    }}
                >
                    <Typography color="text.secondary">
                        No manual questions added yet. Click "Add New Question" to get started.
                    </Typography>
                </Paper>
            ) : (
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {questions.map((q, index) => (
                        <Paper
                            key={q.id}
                            elevation={1}
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <ListItem sx={{ py: 2 }}>
                                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                                    <DragIndicator />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Q{index + 1}.
                                            </Typography>
                                            <Chip
                                                label={q.difficulty.toUpperCase()}
                                                size="small"
                                                color={q.difficulty === 'easy' ? 'success' : q.difficulty === 'medium' ? 'warning' : 'error'}
                                                variant="outlined"
                                            />
                                            {sectionBased && (
                                                <Chip label={q.section} size="small" variant="outlined" />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="div" sx={{ mt: 1, color: 'text.primary' }}>
                                            <MathRenderer content={q.question} />
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title="Edit">
                                        <IconButton edge="end" onClick={() => handleEditQuestion(q)} sx={{ mr: 1 }}>
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton edge="end" onClick={() => handleDeleteQuestion(q.id)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}

            {/* Floating Add Button for convenience */}
            {questions.length > 5 && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'fixed', bottom: 30, right: 30 }}
                    onClick={handleAddQuestion}
                >
                    <Add />
                </Fab>
            )}

            {/* Question Editor Dialog */}
            <Dialog
                open={editorOpen}
                onClose={() => setEditorOpen(false)}
                maxWidth="lg"
                fullWidth
                scroll="body"
            >
                <DialogContent sx={{ p: 0 }}>
                    <QuestionEditor
                        initialData={editingQuestion}
                        onSave={handleSaveQuestion}
                        onCancel={() => setEditorOpen(false)}
                        sections={sections}
                        sectionBased={sectionBased}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ManualQuestionCreator;
