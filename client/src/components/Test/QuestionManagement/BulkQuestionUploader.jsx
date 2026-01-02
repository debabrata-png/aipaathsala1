import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    LinearProgress,
    Stack,
    Chip
} from '@mui/material';
import { CloudUpload, Download, CheckCircle, Error as ErrorIcon, Save } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ep3 from '../../../api/ep3';

const BulkQuestionUploader = ({ testId, onUploadSuccess, colid, user }) => {
    const [file, setFile] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [errors, setErrors] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);

    // Template Headers
    const headers = [
        'Question', 'Type', 'OptionA', 'OptionB', 'OptionC', 'OptionD',
        'CorrectAnswer', 'Explanation', 'Points', 'Difficulty', 'Section',
        'QuestionImage', 'NegativeMarking', 'NegativeMarks'
    ];

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            {
                Question: 'Sample Question?',
                Type: 'multiple-choice',
                OptionA: 'Answer 1',
                OptionB: 'Answer 2',
                OptionC: 'Answer 3',
                OptionD: 'Answer 4',
                CorrectAnswer: 'a',
                Explanation: 'Explanation here',
                Points: 1,
                Difficulty: 'medium',
                Section: 'General',
                QuestionImage: 'https://example.com/image.png (Optional)',
                NegativeMarking: 'false',
                NegativeMarks: 0
            }
        ], { header: headers });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "QuestionsTemplate");
        XLSX.writeFile(wb, "Question_Upload_Template.xlsx");
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = async (file) => {
        setParsing(true);
        setErrors([]);
        setQuestions([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet);

                validateAndFormatData(json);
            } catch (err) {
                setErrors(['Failed to parse Excel file. Ensure it is a valid .xlsx file.']);
            } finally {
                setParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const validateAndFormatData = (data) => {
        const validQuestions = [];
        const validationErrors = [];

        data.forEach((row, index) => {
            const rowNum = index + 2; // +1 for 0-index, +1 for header

            // Normalize keys (lowercase)
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase()] = row[key];
            });

            // Basic Validation
            if (!normalizedRow.question) {
                validationErrors.push(`Row ${rowNum}: Question text is missing`);
                return;
            }
            if (!normalizedRow.correctanswer) {
                validationErrors.push(`Row ${rowNum}: Correct Answer is missing`);
                return;
            }

            // Map to Schema
            validQuestions.push({
                question: normalizedRow.question,
                questiontype: normalizedRow.type || 'multiple-choice',
                optiona: normalizedRow.optiona || '',
                optionb: normalizedRow.optionb || '',
                optionc: normalizedRow.optionc || '',
                optiond: normalizedRow.optiond || '',
                correctanswer: normalizedRow.correctanswer.toString().toLowerCase(),
                explanation: normalizedRow.explanation || '',
                points: normalizedRow.points || 1,
                difficulty: normalizedRow.difficulty || 'medium',
                section: normalizedRow.section,
                questionimage: normalizedRow.questionimage?.includes('http') ? normalizedRow.questionimage : '',
                negativemarking: normalizedRow.negativemarking === 'true' || normalizedRow.negativemarking === true,
                negativemarks: normalizedRow.negativemarks || 0
            });
        });

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
        } else {
            setQuestions(validQuestions);
        }
    };

    const handleUpload = async () => {
        if (questions.length === 0) return;
        setUploading(true);

        try {
            const response = await ep3.post('/bulkuploadquestions', {
                testid: testId,
                questions: questions,
                colid: colid,
                user: user
            });
            onUploadSuccess(response.data.data);
            setFile(null);
            setQuestions([]);
        } catch (error) {
            setErrors([error.response?.data?.message || 'Upload failed']);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Bulk Upload Questions</Typography>
                <Button
                    startIcon={<Download />}
                    variant="outlined"
                    onClick={handleDownloadTemplate}
                >
                    Download Template
                </Button>
            </Box>

            <Paper
                variant="outlined"
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    bgcolor: 'action.hover',
                    mb: 3
                }}
            >
                <input
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    id="excel-upload-input"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="excel-upload-input">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 2 }}
                    >
                        Select Excel File
                    </Button>
                </label>
                <Typography variant="body2" color="textSecondary">
                    {file ? file.name : "Supported formats: .xlsx, .xls"}
                </Typography>
            </Paper>

            {parsing && <LinearProgress sx={{ mb: 2 }} />}

            {errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Validation Errors:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                        {errors.length > 5 && <li>...and {errors.length - 5} more</li>}
                    </ul>
                </Alert>
            )}

            {questions.length > 0 && !uploading && (
                <Box>
                    <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                        {questions.length} questions parsed successfully. Ready to upload.
                    </Alert>

                    <TableContainer component={Paper} elevation={2} sx={{ mb: 3, maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Question</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Answer</TableCell>
                                    <TableCell>Points</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {questions.map((q, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{q.question.substring(0, 50)}...</TableCell>
                                        <TableCell><Chip label={q.questiontype} size="small" /></TableCell>
                                        <TableCell>{q.correctanswer}</TableCell>
                                        <TableCell>{q.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<Save />}
                        onClick={handleUpload}
                    >
                        Upload {questions.length} Questions
                    </Button>
                </Box>
            )}

            {uploading && <LinearProgress />}
        </Box>
    );
};

export default BulkQuestionUploader;
