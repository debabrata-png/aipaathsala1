import React, { useState, useRef, useEffect } from "react";
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
    Card,
    CardContent,
    Grid,
    Chip,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    LinearProgress,
} from "@mui/material";
import {
    Send,
    SmartToy,
    Person,
    CheckCircle,
    Schedule,
    AutoAwesome,
} from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

// ✅ UNCHANGED: Schedule Generator Class
class ScheduleGenerator {
    constructor() {
        this.apiBaseUrl = '';
    }

    // ✅ UNCHANGED: Generate class dates and topics with dynamic times
    generateClassDatesAndTopics(data) {
        const {
            topics, startDate, totalHours, selectedDays, dayTimeMapping, user, colid, name,
            course, coursecode, program, programcode, semester, section
        } = data;

        const classes = [];
        const start = new Date(startDate);
        const sortedDays = [...selectedDays].sort();
        let current = new Date(start);
        let classIndex = 0;
        let safetyCounter = 0;
        const maxIterations = totalHours * 10;

        while (classIndex < totalHours && safetyCounter < maxIterations) {
            const currentDay = current.getDay();

            if (sortedDays.includes(currentDay)) {
                // ✅ DYNAMIC TIME: Use time specific to this day
                const classTime = dayTimeMapping[currentDay] || '09:00';

                classes.push({
                    name,
                    user,
                    colid: parseInt(colid),
                    year: new Date().getFullYear().toString(),
                    course,
                    coursecode,
                    program: program || '',
                    programcode: programcode || '',
                    semester: semester.toString(),
                    section: section || '',
                    topic: topics[classIndex] || `${course} - Class ${classIndex + 1}`,
                    classdate: new Date(current),
                    classtime: classTime, // ✅ DYNAMIC TIME!
                    duration: 1,
                    classnumber: classIndex + 1,
                    status: 'scheduled',
                    classtype: 'Tutorial',
                    createdat: new Date()
                });
                classIndex++;
            }

            current.setDate(current.getDate() + 1);
            safetyCounter++;
        }

        return classes;
    }

    // ✅ UNCHANGED: Generate assessment requests (frontend processing)
    generateAssessmentRequests(classes, courseData) {
        if (classes.length === 0) return [];

        const assessmentCount = Math.min(4, Math.max(2, Math.floor(classes.length / 15)));
        const requests = [];
        const startDate = classes[0].classdate;
        const endDate = classes[classes.length - 1].classdate;
        const timeSpan = endDate.getTime() - startDate.getTime();
        const interval = timeSpan / (assessmentCount + 1);

        for (let i = 0; i < assessmentCount; i++) {
            const testDate = new Date(startDate.getTime() + (interval * (i + 1)));
            const classesUpToDate = classes.filter(c => c.classdate <= testDate);
            const topics = [...new Set(classesUpToDate.map(c => c.topic))];

            if (topics.length === 0) continue;

            const questionCount = Math.min(20, Math.max(10, 8 + (i * 3)));

            requests.push({
                assessmentNumber: i + 1,
                topics,
                questionCount,
                testDate,
                course: courseData.course,
                coursecode: courseData.coursecode,
                user: courseData.user,
                colid: courseData.colid,
                name: courseData.name
            });
        }

        return requests;
    }
}

const CreateClassInterface = () => {
    // ✅ EXISTING STATE
    const [messages, setMessages] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [classData, setClassData] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [showCourseSelection, setShowCourseSelection] = useState(false);
    const [showDaySelection, setShowDaySelection] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(null);
    const [aiTopics, setAiTopics] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [dayTimeMapping, setDayTimeMapping] = useState({});
    
    // ✅ NEW STATE: Question Topic Keyword
    const [questionTopicKeyword, setQuestionTopicKeyword] = useState("");

    const messagesEndRef = useRef(null);
    const scheduleGenerator = new ScheduleGenerator();

    const weekDays = [
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
    ];

    // ✅ UPDATED: Conversation Flow with Question Topic Keyword Step
    const conversationFlow = [
        {
            field: "program",
            question: "👋 Hello! I'll help you create a comprehensive class schedule with AI-generated topics and assessments.\n\nLet's start: What program is this for?",
            type: "text",
            placeholder: "e.g., Computer Science, Engineering, Business Administration",
        },
        {
            field: "programcode",
            question: "Great! Now what's the program code?",
            type: "text",
            placeholder: "e.g., CSE, ENGG, MBA, ECE",
        },
        {
            field: "course_selection",
            question: "Perfect! Let me fetch your courses...",
            type: "course_selection",
        },
        {
            field: "semester",
            question: "Excellent choice! Which semester is this course for?",
            type: "text",
            placeholder: "e.g., 1, 2, 3, 4, 5, 6, 7, 8",
        },
        {
            field: "section",
            question: "Which section?",
            type: "text",
            placeholder: "e.g., A, B, C1, D2",
        },
        // ✅ NEW: Question Topic Keyword Step
        {
            field: "questionTopicKeyword",
            question: "🎯 Optional: Enter a keyword or topic focus for AI generation.\n\nThis will make the AI generate topics and questions around this specific theme. Leave blank for general course topics.",
            type: "text",
            placeholder: "e.g., Machine Learning, Database Design, Web Development (Optional)",
            optional: true
        },
        {
            field: "startDate",
            question: "When should the course start?",
            type: "date",
        },
        {
            field: "totalHours",
            question: "🤖 Here's where AI magic happens!\n\nHow many hours do you need to complete the entire course? Each class will be 1 hour long, and AI will generate unique topics for each session.",
            type: "number",
            placeholder: "e.g., 45 (This will create 45 classes with AI-generated topics)",
        },
        {
            field: "classDays",
            question: "Which days of the week will you conduct classes? Select multiple days:",
            type: "day_selection",
        },
        {
            field: "classTimings",
            question: "🕐 Now set the class time for each selected day:",
            type: "time_selection",
        },
        {
            field: "confirmation",
            question: "🚀 Ready to generate your complete class schedule with AI?\n\nI'll create:\n• Individual classes with AI-generated topics\n• Auto-scheduled dates based on your selected days\n• Different times for different days as configured\n• 3-4 AI-generated assessments with questions\n• Complete course structure",
            type: "confirmation",
        },
    ];

    useEffect(() => {
        setMessages([
            {
                type: "bot",
                content: conversationFlow[0].question,
                timestamp: new Date(),
            },
        ]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ✅ UPDATED: Handle message sending with keyword support
    const handleSendMessage = async () => {
        if (!currentInput.trim() && currentStep !== conversationFlow.length - 1) return;

        const currentQuestion = conversationFlow[currentStep];

        // ✅ NEW: Handle optional keyword field
        if (currentQuestion.field === "questionTopicKeyword") {
            setQuestionTopicKeyword(currentInput.trim());
            setClassData(prev => ({
                ...prev,
                questionTopicKeyword: currentInput.trim()
            }));

            if (currentInput.trim()) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: "user",
                        content: `🎯 Keyword focus: "${currentInput.trim()}"`,
                        timestamp: new Date(),
                    },
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        type: "user",
                        content: "⚪ No specific keyword - using general course topics",
                        timestamp: new Date(),
                    },
                ]);
            }
        } else if (currentInput.trim()) {
            setMessages((prev) => [
                ...prev,
                {
                    type: "user",
                    content: currentInput,
                    timestamp: new Date(),
                },
            ]);

            setClassData((prev) => ({
                ...prev,
                [currentQuestion.field]: currentInput.trim(),
            }));
        }

        if (currentQuestion.field === "programcode") {
            await fetchCourses();
        }

        if (currentStep < conversationFlow.length - 1) {
            setTimeout(() => {
                const nextStep = currentStep + 1;
                const nextQuestion = conversationFlow[nextStep];

                if (nextQuestion.type === "course_selection") {
                    setShowCourseSelection(true);
                } else if (nextQuestion.type === "day_selection") {
                    setShowDaySelection(true);
                } else if (nextQuestion.type === "time_selection") {
                    // Time selection will be handled separately
                } else {
                    setMessages((prev) => [
                        ...prev,
                        {
                            type: "bot",
                            content: nextQuestion.question,
                            timestamp: new Date(),
                        },
                    ]);
                }

                setCurrentStep(nextStep);
                setCurrentInput("");
            }, 1000);
        } else {
            setTimeout(() => {
                handleAIGeneration();
            }, 1000);
        }
    };

    // ✅ UNCHANGED: Keep fetchCourses exactly as it was
    const fetchCourses = async () => {
        try {
            const response = await ep3.get("/getcoursebyfaculty", {
                params: {
                    colid: global1.colid,
                    user: global1.userEmail,
                },
            });

            if (response.data.success) {
                setCourses(response.data.data || []);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "bot",
                        content: "❌ No courses found. Please make sure you have courses assigned.",
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: "❌ Failed to fetch courses. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handleCourseSelection = (course) => {
        setClassData((prev) => ({ ...prev, selectedCourse: course }));
        setShowCourseSelection(false);

        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                content: `📚 Selected: ${course.coursecode} - ${course.coursename}`,
                timestamp: new Date(),
            },
        ]);

        setTimeout(() => {
            const nextStep = currentStep + 1;
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: conversationFlow[nextStep].question,
                    timestamp: new Date(),
                },
            ]);
            setCurrentStep(nextStep);
        }, 1000);
    };

    const handleDayToggle = (dayValue) => {
        setSelectedDays((prev) => {
            const newDays = prev.includes(dayValue)
                ? prev.filter((d) => d !== dayValue)
                : [...prev, dayValue];
            return newDays;
        });
    };

    // ✅ UNCHANGED: Enhanced day selection with time setup
    const confirmDaySelection = () => {
        if (selectedDays.length === 0) {
            alert("Please select at least one day");
            return;
        }

        setClassData((prev) => ({ ...prev, selectedDays }));
        setShowDaySelection(false);

        const dayNames = selectedDays
            .map((d) => weekDays.find((w) => w.value === d)?.label)
            .join(", ");

        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                content: `📅 Selected days: ${dayNames}`,
                timestamp: new Date(),
            },
        ]);

        // ✅ UNCHANGED: Initialize time mapping with default times
        const defaultTimes = {};
        selectedDays.forEach(day => {
            defaultTimes[day] = "09:00";
        });
        setDayTimeMapping(defaultTimes);

        setTimeout(() => {
            const nextStep = currentStep + 1;
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: conversationFlow[nextStep].question,
                    timestamp: new Date(),
                },
            ]);
            setCurrentStep(nextStep);
        }, 1000);
    };

    // ✅ UNCHANGED: Handle time change for specific day
    const handleTimeChange = (dayValue, time) => {
        setDayTimeMapping(prev => ({
            ...prev,
            [dayValue]: time
        }));
    };

    // ✅ UNCHANGED: Confirm time selection
    const confirmTimeSelection = () => {
        const hasAllTimes = selectedDays.every(day => dayTimeMapping[day]);
        if (!hasAllTimes) {
            alert("Please set time for all selected days");
            return;
        }

        setClassData((prev) => ({ ...prev, dayTimeMapping }));

        const timeSchedule = selectedDays.map(day => {
            const dayName = weekDays.find(w => w.value === day)?.label;
            const time = dayTimeMapping[day];
            return `${dayName}: ${time}`;
        }).join(", ");

        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                content: `🕐 Class times set: ${timeSchedule}`,
                timestamp: new Date(),
            },
        ]);

        setTimeout(() => {
            const nextStep = currentStep + 1;
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: conversationFlow[nextStep].question,
                    timestamp: new Date(),
                },
            ]);
            setCurrentStep(nextStep);
            setIsCompleted(true);
        }, 1000);
    };

    // ✅ UPDATED: Handle AI generation with keyword
    const handleAIGeneration = async () => {
        setIsSubmitting(true);
        setGenerationProgress({ step: "Initializing AI generation...", progress: 10 });

        try {
            // Step 1: Generate AI topics with keyword
            setGenerationProgress({ 
                step: questionTopicKeyword ? 
                    `Generating AI topics focused on "${questionTopicKeyword}"...` : 
                    "Generating AI topics...", 
                progress: 25 
            });
            
            const topicsData = await generateAITopics();

            if (!topicsData || topicsData.length === 0) {
                throw new Error("Failed to generate AI topics");
            }

            setAiTopics(topicsData);

            // Step 2: Process class dates (frontend) with DYNAMIC TIMES
            setGenerationProgress({ step: "Processing class schedules...", progress: 50 });
            
            const courseData = {
                course: classData.selectedCourse.coursename,
                coursecode: classData.selectedCourse.coursecode,
                topics: topicsData,
                startDate: classData.startDate,
                totalHours: parseInt(classData.totalHours),
                selectedDays: classData.selectedDays,
                dayTimeMapping: classData.dayTimeMapping, // ✅ ADD DYNAMIC TIMES!
                user: global1.userEmail,
                colid: global1.colid,
                name: global1.userName,
                program: classData.program,
                programcode: classData.programcode,
                semester: classData.semester,
                section: classData.section
            };

            const classes = scheduleGenerator.generateClassDatesAndTopics(courseData);

            // Step 3: Generate assessment requests
            setGenerationProgress({ step: "Planning assessments...", progress: 70 });
            const assessmentRequests = scheduleGenerator.generateAssessmentRequests(classes, courseData);

            // Step 4: Save everything with keyword
            setGenerationProgress({ step: "Saving to database...", progress: 90 });
            
            const saveResponse = await ep3.post("/saveClassesAndAssessments", {
                classes,
                assessmentRequests,
                questionTopicKeyword: questionTopicKeyword // ✅ NEW: Pass keyword
            });

            if (!saveResponse.data.success) {
                throw new Error(saveResponse.data.message || "Failed to save schedule");
            }

            setGenerationProgress({ step: "Complete!", progress: 100 });

            // ✅ UPDATED: Success message with keyword info
            const successMessage = questionTopicKeyword ? 
                `🎉 Success! Created ${saveResponse.data.totalClasses} classes and ${saveResponse.data.totalAssessments} AI assessments focused on "${questionTopicKeyword}"!\n\n📊 Summary:\n• Classes: ${saveResponse.data.totalClasses}\n• AI Topics: Generated with keyword focus\n• Assessments: ${saveResponse.data.totalAssessments}\n• Schedule: ${selectedDays.length} days/week with custom times` :
                `🎉 Success! Created ${saveResponse.data.totalClasses} classes and ${saveResponse.data.totalAssessments} AI assessments!\n\n📊 Summary:\n• Classes: ${saveResponse.data.totalClasses}\n• AI Topics: Generated\n• Assessments: ${saveResponse.data.totalAssessments}\n• Schedule: ${selectedDays.length} days/week with custom times`;

            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: successMessage,
                    timestamp: new Date(),
                },
            ]);

            setTimeout(() => {
                resetInterface();
            }, 5000);

        } catch (error) {
            console.error("AI generation failed:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content: `❌ AI generation failed: ${error.message}\n\nThis could be due to:\n• AI service overload - please try again\n• Network issues\n• Invalid course data\n\nPlease try again in a few moments.`,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsSubmitting(false);
            setGenerationProgress(null);
        }
    };

    // ✅ UPDATED: Generate AI topics with keyword
    const generateAITopics = async () => {
        const submissionData = {
            course: classData.selectedCourse.coursename,
            coursecode: classData.selectedCourse.coursecode,
            startDate: classData.startDate,
            totalHours: parseInt(classData.totalHours),
            selectedDays: classData.selectedDays,
            user: global1.userEmail,
            colid: global1.colid,
            name: global1.userName,
            program: classData.program,
            programcode: classData.programcode,
            semester: classData.semester,
            section: classData.section,
            questionTopicKeyword: questionTopicKeyword // ✅ NEW: Pass keyword
        };

        const response = await ep3.post("/generateclassschedule", submissionData);

        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to generate topics");
        }

        return response.data.data.topics;
    };

    // ✅ UPDATED: Reset interface with keyword
    const resetInterface = () => {
        setClassData({});
        setCurrentStep(0);
        setIsCompleted(false);
        setSelectedDays([]);
        setDayTimeMapping({});
        setQuestionTopicKeyword(""); // ✅ NEW: Reset keyword
        setShowCourseSelection(false);
        setShowDaySelection(false);
        setCourses([]);
        setAiTopics([]);
        setPreviewData(null);
        setMessages([
            {
                type: "bot",
                content: "🚀 Ready to create another class schedule?",
                timestamp: new Date(),
            },
            {
                type: "bot",
                content: conversationFlow[0].question,
                timestamp: new Date(),
            },
        ]);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getCurrentPlaceholder = () => {
        const current = conversationFlow[currentStep];
        return current?.placeholder || "Type your response...";
    };

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9ff" }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 0, bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    🤖 AI Class Creation Assistant
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Create comprehensive class schedules with AI-generated topics and assessments
                </Typography>
            </Paper>

            {/* Progress Indicator */}
            {currentStep < conversationFlow.length && (
                <Box sx={{ p: 2, bgcolor: "white" }}>
                    <Stepper activeStep={currentStep} alternativeLabel>
                        {["Program", "Course", "Details", "Keywords", "Duration", "Schedule", "Generate"].map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            )}

            {/* Chat Area - Scrollable */}
            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                    {messages.map((message, index) => (
                        <Card key={index} sx={{ mb: 2, maxWidth: "85%", ml: message.type === "user" ? "auto" : 0, mr: message.type === "bot" ? "auto" : 0 }}>
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    {message.type === "bot" && (
                                        <SmartToy sx={{ color: "#7c3aed", fontSize: 20 }} />
                                    )}
                                    {message.type === "user" && (
                                        <Person sx={{ color: "#059669", fontSize: 20 }} />
                                    )}
                                    <Typography variant="caption" fontWeight="bold" color={message.type === "bot" ? "#7c3aed" : "#059669"}>
                                        {message.type === "bot" ? "AI Assistant" : "You"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                                        {formatDate(message.timestamp)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                    {message.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Course Selection */}
                    {showCourseSelection && (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📚 Select a Course:
                                </Typography>
                                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                                    {courses.map((course) => (
                                        <ListItem key={course._id} disablePadding sx={{ mb: 1 }}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                onClick={() => handleCourseSelection(course)}
                                                sx={{
                                                    justifyContent: "flex-start",
                                                    textAlign: "left",
                                                    borderRadius: 2,
                                                    py: 1.5,
                                                    "&:hover": { bgcolor: "#7c3aed", color: "white" }
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {course.coursecode}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {course.coursename}
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    )}

                    {/* Day Selection */}
                    {showDaySelection && (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📅 Select Class Days:
                                </Typography>
                                <Grid container spacing={1}>
                                    {weekDays.map((day) => (
                                        <Grid item xs={6} sm={4} key={day.value}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedDays.includes(day.value)}
                                                        onChange={() => handleDayToggle(day.value)}
                                                        color="primary"
                                                    />
                                                }
                                                label={day.label}
                                                sx={{ display: "block" }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Button
                                    variant="contained"
                                    onClick={confirmDaySelection}
                                    disabled={selectedDays.length === 0}
                                    sx={{ mt: 2, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
                                >
                                    Confirm Selected Days ({selectedDays.length})
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* ✅ UNCHANGED: Time Selection Component */}
                    {currentStep === conversationFlow.findIndex(step => step.type === "time_selection") && (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🕐 Set Class Times for Each Day:
                                </Typography>
                                <Grid container spacing={2}>
                                    {selectedDays.map((dayValue) => {
                                        const dayName = weekDays.find(w => w.value === dayValue)?.label;
                                        return (
                                            <Grid item xs={12} sm={6} key={dayValue}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body1" sx={{ minWidth: '80px' }}>
                                                        {dayName}:
                                                    </Typography>
                                                    <TextField
                                                        type="time"
                                                        value={dayTimeMapping[dayValue] || "09:00"}
                                                        onChange={(e) => handleTimeChange(dayValue, e.target.value)}
                                                        size="small"
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{ minWidth: '130px' }}
                                                    />
                                                    <Chip
                                                        label={`Set for ${dayName}`}
                                                        size="small"
                                                        color={dayTimeMapping[dayValue] ? "success" : "default"}
                                                    />
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                <Button
                                    variant="contained"
                                    onClick={confirmTimeSelection}
                                    disabled={!selectedDays.every(day => dayTimeMapping[day])}
                                    sx={{
                                        mt: 2,
                                        bgcolor: "#7c3aed",
                                        "&:hover": { bgcolor: "#6d28d9" }
                                    }}
                                >
                                    Confirm Class Times ({selectedDays.length} days)
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generation Progress */}
                    {generationProgress && (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    AI Generation in Progress
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {generationProgress.step}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={generationProgress.progress}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    {generationProgress.progress}% Complete
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    <div ref={messagesEndRef} />
                </Box>
            </Box>

            {/* Input Area - Fixed at bottom */}
            {!isCompleted && !showCourseSelection && !showDaySelection && !isSubmitting && 
             currentStep !== conversationFlow.findIndex(step => step.type === "time_selection") && (
                <Paper elevation={3} sx={{ p: 2, m: 2, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                        {conversationFlow[currentStep]?.type === "date" ? (
                            <TextField
                                fullWidth
                                type="date"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            />
                        ) : conversationFlow[currentStep]?.type === "number" ? (
                            <TextField
                                fullWidth
                                type="number"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                placeholder={getCurrentPlaceholder()}
                                inputProps={{ min: 1, max: 200 }}
                                size="small"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            />
                        ) : (
                            <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                placeholder={getCurrentPlaceholder()}
                                size="small"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                        )}
                        
                        <IconButton
                            onClick={handleSendMessage}
                            sx={{
                                bgcolor: "#7c3aed",
                                color: "white",
                                "&:hover": { bgcolor: "#6d28d9" },
                                borderRadius: 3,
                                p: 1.5,
                            }}
                        >
                            <Send />
                        </IconButton>
                    </Box>
                    
                    {/* ✅ NEW: Keyword help text */}
                    {conversationFlow[currentStep]?.field === "questionTopicKeyword" && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            💡 Examples: "Machine Learning", "Database Design", "React Hooks", or leave blank for general topics
                        </Typography>
                    )}
                </Paper>
            )}

            {/* Final Confirmation */}
            {isCompleted && !isSubmitting && (
                <Paper elevation={3} sx={{ p: 2, m: 2, borderRadius: 3, bgcolor: "#7c3aed", color: "white" }}>
                    <Typography variant="h6" gutterBottom>
                        🚀 Ready to Generate?
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleAIGeneration}
                        sx={{
                            bgcolor: "white",
                            color: "#7c3aed",
                            "&:hover": { bgcolor: "#f8f9ff" },
                            fontWeight: "bold"
                        }}
                    >
                        Generate AI-Powered Class Schedule
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

export default CreateClassInterface;
