import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    IconButton,
    Collapse,
    Divider,
    Chip,
    Tabs,
    Tab,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Functions,
    Preview,
    Save,
    Cancel,
    Add,
    Delete
} from '@mui/icons-material';
import MathKeyboard from '../Math/MathKeyboard';
import MathRenderer from '../../MathRenderer';
import FileUpload from '../../FileUpload';

const QuestionEditor = ({
    initialData,
    onSave,
    onCancel,
    sections = [],
    sectionBased = false
}) => {
    const [questionData, setQuestionData] = useState(initialData || {
        questionnumber: null,
        question: '',
        questiontype: 'multiple-choice',
        optiona: '',
        optionb: '',
        optionc: '',
        optiond: '',
        correctanswer: 'a',
        explanation: '',
        difficulty: 'medium',
        section: sections.length > 0 ? sections[0].name : '',
        points: 1,
        hasmathcontent: false,
        isgenerated: false,
        questionimage: '',
        negativemarking: false,
        negativemarks: 0
    });

    const [activeTab, setActiveTab] = useState(0); // 0: Upload, 1: Link

    const [showKeyboard, setShowKeyboard] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeInput, setActiveInput] = useState('question');
    const inputRefs = {
        question: useRef(null),
        optiona: useRef(null),
        optionb: useRef(null),
        optionc: useRef(null),
        optiond: useRef(null),
        explanation: useRef(null),
    };

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setQuestionData(prev => ({
            ...prev,
            [field]: value,
            hasmathcontent: field === 'question' ? /\\|_|\^|\$|{|}/.test(value) : prev.hasmathcontent
        }));
    };

    const handleInsertLatex = (latex) => {
        const field = activeInput;
        const input = inputRefs[field].current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = questionData[field];

        // Auto-wrap with delimiters if not already there, or just insert
        // For simplicity, we just insert for now. Users can add delimiters manually or we can help.
        const newText = text.substring(0, start) + latex + text.substring(end);

        setQuestionData(prev => ({
            ...prev,
            [field]: newText,
            hasmathcontent: true
        }));

        // Reset focus and cursor position (optional UI polish)
        setTimeout(() => {
            input.focus();
            const newPos = start + latex.length;
            input.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleSave = () => {
        // Basic validation
        if (!questionData.question.trim()) {
            alert('Question text is required');
            return;
        }
        onSave(questionData);
    };

    return (
        <Box sx={{ p: 1 }}>
            <Grid container spacing={3}>
                {/* Editor Panel */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {initialData ? 'Edit Question' : 'Add New Question'}
                        </Typography>

                        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={questionData.questiontype}
                                    label="Type"
                                    onChange={handleChange('questiontype')}
                                >
                                    <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                                    <MenuItem value="true-false">True / False</MenuItem>
                                    <MenuItem value="short-answer">Short Answer</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Difficulty</InputLabel>
                                <Select
                                    value={questionData.difficulty}
                                    label="Difficulty"
                                    onChange={handleChange('difficulty')}
                                >
                                    <MenuItem value="easy">Easy</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="hard">Hard</MenuItem>
                                </Select>
                            </FormControl>

                            {sectionBased && (
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        value={questionData.section}
                                        label="Section"
                                        onChange={handleChange('section')}
                                    >
                                        {sections.map((s, idx) => (
                                            <MenuItem key={idx} value={s.name}>{s.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Question Text
                                </Typography>
                                <Button
                                    startIcon={<Functions />}
                                    size="small"
                                    onClick={() => {
                                        setActiveInput('question');
                                        setShowKeyboard(!showKeyboard);
                                    }}
                                    variant={showKeyboard && activeInput === 'question' ? 'contained' : 'outlined'}
                                >
                                    Math
                                </Button>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Enter question text... Use \( ... \) for inline math."
                                value={questionData.question}
                                onChange={handleChange('question')}
                                onFocus={() => setActiveInput('question')}
                                inputRef={inputRefs.question}
                            />
                        </Box>

                        {/* Image Upload Section */}
                        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Question Image (Optional)</Typography>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { py: 1, minHeight: 36 } }}>
                                <Tab label="Upload Image" />
                                <Tab label="Image Link" />
                            </Tabs>

                            {activeTab === 0 ? (
                                <FileUpload
                                    onFileUpload={(url) => setQuestionData(prev => ({ ...prev, questionimage: url }))}
                                />
                            ) : (
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Paste image link here..."
                                    value={questionData.questionimage}
                                    onChange={handleChange('questionimage')}
                                    helperText="Provide a direct link to an image"
                                />
                            )}

                            {/* Validation/Preview Message */}
                            {questionData.questionimage && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label="Image Set"
                                        color="primary"
                                        size="small"
                                        onDelete={() => setQuestionData(prev => ({ ...prev, questionimage: '' }))}
                                    />
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 300 }}>
                                        {questionData.questionimage}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {questionData.questiontype === 'multiple-choice' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Options</Typography>
                                {['a', 'b', 'c', 'd'].map((opt) => (
                                    <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={opt.toUpperCase()}
                                            color={questionData.correctanswer === opt ? 'success' : 'default'}
                                            onClick={() => setQuestionData(prev => ({ ...prev, correctanswer: opt }))}
                                            sx={{ fontWeight: 'bold', width: 40 }}
                                        />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder={`Option ${opt.toUpperCase()}`}
                                            value={questionData[`option${opt}`]}
                                            onChange={handleChange(`option${opt}`)}
                                            onFocus={() => setActiveInput(`option${opt}`)}
                                            inputRef={inputRefs[`option${opt}`]}
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton size="small" onClick={() => {
                                                        setActiveInput(`option${opt}`);
                                                        setShowKeyboard(true);
                                                    }}>
                                                        <Functions fontSize="small" />
                                                    </IconButton>
                                                )
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Explanation (Optional)
                                </Typography>
                                <IconButton size="small" onClick={() => {
                                    setActiveInput('explanation');
                                    setShowKeyboard(true);
                                }}>
                                    <Functions fontSize="small" />
                                </IconButton>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Explain the answer..."
                                value={questionData.explanation}
                                onChange={handleChange('explanation')}
                                onFocus={() => setActiveInput('explanation')}
                                inputRef={inputRefs.explanation}
                            />
                        </Box>
                        <Box sx={{ mt: 3, p: 2, border: '1px dashed #e0e0e0', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Scoring</Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="small"
                                        label="Points"
                                        value={questionData.points}
                                        onChange={handleChange('points')}
                                        InputProps={{ inputProps: { min: 0 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={questionData.negativemarking}
                                                onChange={(e) => setQuestionData(prev => ({ ...prev, negativemarking: e.target.checked }))}
                                            />
                                        }
                                        label={<Typography variant="body2">Negative Marking</Typography>}
                                    />
                                </Grid>
                                {questionData.negativemarking && (
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            size="small"
                                            label="Negative Marks"
                                            value={questionData.negativemarks}
                                            onChange={handleChange('negativemarks')}
                                            InputProps={{ inputProps: { min: 0 } }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button startIcon={<Cancel />} onClick={onCancel}>Cancel</Button>
                            <Button startIcon={<Save />} variant="contained" color="primary" onClick={handleSave}>
                                Save Question
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sidebar Panel (Keyboard & Preview) */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Collapse in={showKeyboard}>
                            <Box sx={{ mb: 2 }}>
                                <MathKeyboard
                                    onInsert={handleInsertLatex}
                                    onClose={() => setShowKeyboard(false)}
                                />
                            </Box>
                        </Collapse>

                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Preview color="action" /> Live Preview
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ minHeight: 100, p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="body1" component="div">
                                    {questionData.questionimage && (
                                        <Box sx={{ maxWidth: '100%', mb: 1, textAlign: 'center' }}>
                                            <img
                                                src={questionData.questionimage}
                                                alt="Question"
                                                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </Box>
                                    )}
                                    <MathRenderer content={questionData.question || 'Question preview will appear here...'} />

                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Chip size="small" label={`${questionData.points} Pts`} variant="outlined" />
                                        {questionData.negativemarking && (
                                            <Chip size="small" label={`-${questionData.negativemarks} Neg`} color="error" variant="outlined" />
                                        )}
                                    </Box>
                                </Typography>

                                {questionData.questiontype === 'multiple-choice' && (
                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {['a', 'b', 'c', 'd'].map((opt) => (
                                            <Box key={opt} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{opt.toUpperCase()}.</Typography>
                                                <MathRenderer content={questionData[`option${opt}`] || '...'} />
                                                {questionData.correctanswer === opt && <Add color="success" sx={{ fontSize: 16 }} />}
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {questionData.explanation && (
                                    <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1, opacity: 0.8 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', d: 'block' }}>Explanation:</Typography>
                                        <MathRenderer content={questionData.explanation} />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default QuestionEditor;
