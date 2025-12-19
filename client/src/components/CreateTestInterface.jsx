import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Send, ArrowBack, Quiz, CheckCircle } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";
import QuestionPreview from "./QuestionPreview";

const CreateTestInterface = ({ course, onBack, onTestCreated }) => {
  // Chat flow state
  const [showPreview, setShowPreview] = useState(false);

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState({
    testtitle: "",
    topic: "",
    description: "",
    duration: 60,
    passingscore: 50,
    starttime: null,
    endtime: null,
  });

  // Section flow state
  const [flowStage, setFlowStage] = useState("basic");
  const [sectionBased, setSectionBased] = useState(null);
  const [sectionCount, setSectionCount] = useState(0);
  const [sections, setSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSectionStep, setCurrentSectionStep] = useState("name");
  const [currentSectionData, setCurrentSectionData] = useState({
    name: "",
    questionCount: 0,
    difficulty: "",
  });

  // FIXED: Add state for non-section based tests
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [questionDifficulty, setQuestionDifficulty] = useState("");

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Generation state
  const [useAI, setUseAI] = useState(true);
  const [apiKeySettings, setApiKeySettings] = useState(null);
  const [isLoadingAPIKey, setIsLoadingAPIKey] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);

  const testQuestions = [
    {
      field: "testtitle",
      question: "What should we call this test?",
      type: "text",
      required: true,
      placeholder: "e.g., Midterm Exam, Quiz 1",
    },
    {
      field: "topic",
      question: "What topic will this test cover?",
      type: "text",
      required: true,
      placeholder: "e.g., Calculus, Physics",
    },
    {
      field: "description",
      question: "Add a brief description (optional)",
      type: "text",
      required: false,
      placeholder: "Test description",
    },
    {
      field: "duration",
      question: "How many minutes should students have?",
      type: "number",
      required: true,
      placeholder: "e.g., 60, 90, 120",
    },
    {
      field: "passingscore",
      question: "What should be the passing score (percentage)?",
      type: "number",
      required: false,
      placeholder: "Default: 50",
    },
    {
      field: "starttime",
      question: "When should the test start?",
      type: "datetime",
      required: true,
    },
    {
      field: "endtime",
      question: "When should the test end?",
      type: "datetime",
      required: true,
    },
  ];

  useEffect(() => {
    setMessages([
      {
        type: "bot",
        content: `Hi ${global1.userName}! I'll help you create a test for ${course.coursename}. Let's get started!`,
        timestamp: new Date(),
      },
      {
        type: "bot",
        content: testQuestions[0].question,
        timestamp: new Date(),
      },
    ]);
  }, [course]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (useAI && !apiKeySettings) {
      fetchActiveAPIKey();
    }
  }, [useAI]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content,
          timestamp: new Date(),
        },
      ]);
    }, 500);
  };

  const addUserMessage = (content) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const fetchActiveAPIKey = async () => {
    setIsLoadingAPIKey(true);
    try {
      const response = await ep3.get("/getactiveapikeyds1", {
        params: {
          colid: global1.colid,
          facultyid: global1.userEmail,
        },
      });

      if (response.data.success) {
        setApiKeySettings(response.data.data);
      } else {
        throw new Error("No active API key found");
      }
    } catch (error) {
      addBotMessage(
        "No Gemini API key configured. Set up your API key in Settings first."
      );
    } finally {
      setIsLoadingAPIKey(false);
    }
  };

  // Handle basic test info inputs
  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    if (flowStage === "basic") {
      const currentQuestion = testQuestions[currentStep];
      addUserMessage(currentInput);

      let value = currentInput.trim();
      if (currentQuestion.type === "number") {
        value = parseInt(value) || 0;
      }

      setTestData((prev) => ({
        ...prev,
        [currentQuestion.field]: value,
      }));

      if (currentStep < testQuestions.length - 1) {
        const nextQuestion = testQuestions[currentStep + 1];
        addBotMessage(nextQuestion.question);

        if (nextQuestion.type === "datetime") {
          setShowDatePicker(true);
          setDatePickerField(nextQuestion.field);
        }
        setCurrentStep(currentStep + 1);
      } else {
        addBotMessage("Do you want to create this test with grouped sections?");
        setFlowStage("section-choice");
      }
    } else if (flowStage === "section-count") {
      const count = parseInt(currentInput.trim());
      if (isNaN(count) || count < 1 || count > 10) {
        addBotMessage("Please enter a valid number of sections (1-10).");
        setCurrentInput("");
        return;
      }
      addUserMessage(currentInput);
      setSectionCount(count);
      setCurrentSectionIndex(0);
      setCurrentSectionStep("name");
      setCurrentSectionData({
        name: "",
        questionCount: 0,
        difficulty: "",
      });
      addBotMessage(
        `Perfect! Now let's set up each section.\n\nSection 1: What should we call this section?`
      );
      setFlowStage("section-details");
    } else if (flowStage === "section-details") {
      handleSectionDetailInput();
    } else if (flowStage === "no-section-setup") {
      // FIXED: Handle non-section based test setup
      if (currentSectionStep === "questions") {
        const count = parseInt(currentInput.trim());
        if (isNaN(count) || count < 1 || count > 50) {
          addBotMessage("Please enter a valid number of questions (1-50).");
          setCurrentInput("");
          return;
        }
        addUserMessage(currentInput);
        setTotalQuestionCount(count);
        setCurrentSectionStep("difficulty");
        addBotMessage(
          `How many questions should this test have? You entered: ${count}\n\nWhat difficulty level should the questions be? (easy/medium/hard)`
        );
      } else if (currentSectionStep === "difficulty") {
        const difficulty = currentInput.trim().toLowerCase();
        if (!["easy", "medium", "hard"].includes(difficulty)) {
          addBotMessage("Please enter: easy, medium, or hard");
          setCurrentInput("");
          return;
        }
        addUserMessage(currentInput);
        setQuestionDifficulty(difficulty);
        addBotMessage(
          `Perfect! Your test will have ${totalQuestionCount} ${difficulty} questions about ${testData.topic}. Ready to create!`
        );
        setFlowStage("ready");
        setIsCompleted(true);
      }
    }

    setCurrentInput("");
  };

  const handleSectionDetailInput = () => {
    const input = currentInput.trim();
    addUserMessage(input);

    if (currentSectionStep === "name") {
      if (!input) {
        addBotMessage("Please enter a valid section name.");
        return;
      }
      setCurrentSectionData((prev) => ({
        ...prev,
        name: input,
      }));
      setCurrentSectionStep("questions");
      addBotMessage(`How many questions should be in the "${input}" section?`);
    } else if (currentSectionStep === "questions") {
      const count = parseInt(input);
      if (isNaN(count) || count < 1 || count > 50) {
        addBotMessage("Please enter a valid number of questions (1-50).");
        return;
      }
      setCurrentSectionData((prev) => ({
        ...prev,
        questionCount: count,
      }));
      setCurrentSectionStep("difficulty");
      addBotMessage(
        `What difficulty level should the questions be for "${currentSectionData.name}" section?\n(easy/medium/hard)`
      );
    } else if (currentSectionStep === "difficulty") {
      const difficulty = input.toLowerCase();
      if (!["easy", "medium", "hard"].includes(difficulty)) {
        addBotMessage("Please enter: easy, medium, or hard");
        return;
      }

      // Complete current section
      const completedSection = {
        id: Date.now(),
        name: currentSectionData.name,
        questionCount: currentSectionData.questionCount,
        difficulty: difficulty,
      };

      setSections((prev) => [...prev, completedSection]);
      addBotMessage(
        `✓ Section "${completedSection.name}" added with ${completedSection.questionCount} ${completedSection.difficulty} questions.`
      );

      // Check if we need more sections
      if (currentSectionIndex + 1 < sectionCount) {
        setCurrentSectionIndex((prev) => prev + 1);
        setCurrentSectionStep("name");
        setCurrentSectionData({
          name: "",
          questionCount: 0,
          difficulty: "",
        });
        setTimeout(() => {
          addBotMessage(
            `Section ${
              currentSectionIndex + 2
            }: What should we call this section?`
          );
        }, 1000);
      } else {
        // All sections completed
        setTimeout(() => {
          addBotMessage(
            "✓ All sections configured! Your test is ready to be created."
          );
          setFlowStage("ready");
          setIsCompleted(true);
        }, 1000);
      }
    }
  };

  // FIXED: Date Time picker handler
  const handleDateTimeAccept = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) return;

    const dt = dateTime instanceof Date ? dateTime : new Date(dateTime);
    dt.setSeconds(0, 0);

    addUserMessage(dt.toLocaleString());
    setTestData((prev) => ({
      ...prev,
      [datePickerField]: dt,
    }));
    setShowDatePicker(false);

    setTimeout(() => {
      if (currentStep < testQuestions.length - 1) {
        const nextQuestion = testQuestions[currentStep + 1];
        addBotMessage(nextQuestion.question);
        if (nextQuestion.type === "datetime") {
          setShowDatePicker(true);
          setDatePickerField(nextQuestion.field);
        }
        setCurrentStep(currentStep + 1);
      } else {
        addBotMessage("Do you want to create this test with grouped sections?");
        setFlowStage("section-choice");
      }
    }, 700);
  };

  // Handle section choice buttons
  const handleSectionChoice = (choice) => {
    setSectionBased(choice);
    if (choice) {
      addUserMessage("Yes, create sections");
      addBotMessage("Great! How many sections would you like in this test?");
      setFlowStage("section-count");
    } else {
      addUserMessage("No, single group");
      // FIXED: Properly handle non-section flow
      setCurrentSectionStep("questions");
      addBotMessage("Perfect! How many questions should this test have?");
      setFlowStage("no-section-setup");
    }
  };

  const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        // Exponential backoff
        delay = delay * 2;
        addBotMessage(`⏳ Rate limited. Retrying in ${delay / 1000}s...`);
      }
    }
  };

  // FIXED: Generate questions with better prompts
  const generateQuestionsWithGemini = async () => {
    if (!apiKeySettings?.apikey) return;

    setIsGenerating(true);
    addBotMessage("🤖 Generating questions with Gemini AI...");

    try {
      const genAI = new GoogleGenerativeAI(apiKeySettings.apikey);

      // ✅ FIXED: Use gemini-2.5-flash with proper structured output
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              questions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    optiona: { type: "STRING" },
                    optionb: { type: "STRING" },
                    optionc: { type: "STRING" },
                    optiond: { type: "STRING" },
                    correctanswer: { type: "STRING" },
                    explanation: { type: "STRING" },
                    concept: { type: "STRING" },
                  },
                  required: [
                    "question",
                    "optiona",
                    "optionb",
                    "optionc",
                    "optiond",
                    "correctanswer",
                    "explanation",
                  ],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      let allQuestions = [];
      let questionCounter = 1;
      let usedConcepts = new Set();

      if (sectionBased && sections.length > 0) {
        // Section-based generation
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          addBotMessage(
            `📝 Generating ${section.questionCount} ${section.difficulty} questions for "${section.name}"...`
          );

          // ✅ Add delay before each section (except first)
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          try {
            // ✅ Improved prompt for structured output
            const prompt = `
Generate exactly ${totalQuestionCount} multiple-choice questions on ${
              testData.topic
            }.
Difficulty: ${questionDifficulty.toUpperCase()}
Each question MUST have exactly 4 options labeled A, B, C, and D.
Return ONLY valid JSON with:
questions: [ 
  { 
    "question": "...", 
    "optiona": "...", 
    "optionb": "...", 
    "optionc": "...", 
    "optiond": "...", 
    "correctanswer": "a/b/c/d" // Give the correct answer as just the option key 
    "explanation": "..." 
  } 
]
IMPORTANT: The correctanswer property must always be just one of: "a", "b", "c", or "d" (NOT the option text).
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textContent = response.text();

            // ✅ Parse response correctly
            let parsedData;

            try {
              parsedData = JSON.parse(textContent);
            } catch (e) {
              // If direct parse fails, try to extract JSON
              const jsonMatch = textContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
              } else {
                throw new Error("No valid JSON found in response");
              }
            }

            // ✅ Extract questions from response
            let sectionQuestions = parsedData.questions || parsedData;

            if (!Array.isArray(sectionQuestions)) {
              throw new Error("Response is not an array");
            }

            // ✅ Ensure correct count
            if (sectionQuestions.length !== section.questionCount) {
              addBotMessage(
                `⚠️ Generated ${sectionQuestions.length} instead of ${section.questionCount}`
              );
              sectionQuestions = sectionQuestions.slice(
                0,
                section.questionCount
              );
            }

            // Track concepts
            sectionQuestions.forEach((q) => {
              if (q.concept) usedConcepts.add(q.concept);
            });

            // Format questions
            const formattedQuestions = sectionQuestions.map((q) => ({
              questionnumber: questionCounter++,
              question: q.question?.trim() || "",
              questiontype: "multiple-choice",
              optiona: q.optiona?.trim() || "",
              optionb: q.optionb?.trim() || "",
              optionc: q.optionc?.trim() || "",
              optiond: q.optiond?.trim() || "",
              correctanswer: q.correctanswer?.trim() || "",
              explanation: q.explanation?.trim() || "",
              points: 1,
              difficulty: section.difficulty,
              section: section.name,
              hasmathcontent: /\\|_|\^|\$|{|}/.test(q.question),
              isgenerated: true,
            }));

            allQuestions = [...allQuestions, ...formattedQuestions];
            addBotMessage(
              `✅ Generated ${formattedQuestions.length} questions for "${section.name}"`
            );
          } catch (sectionError) {
            addBotMessage(
              `❌ Error generating questions for "${section.name}": ${sectionError.message}`
            );
          }
        }
      } else {
        // Non-section based generation
        addBotMessage(
          `📝 Generating ${totalQuestionCount} ${questionDifficulty} questions...`
        );

        try {
          const prompt = `Generate exactly ${totalQuestionCount} multiple-choice questions on "${
            testData.topic
          }".

Difficulty: ${questionDifficulty.toUpperCase()}
Each question MUST have exactly 4 options (A, B, C, D).
Return ONLY valid JSON with structure: {"questions": [...]}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const textContent = response.text();

          // ✅ Parse response
          let parsedData;

          try {
            parsedData = JSON.parse(textContent);
          } catch (e) {
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("No valid JSON found in response");
            }
          }

          let questions = parsedData.questions || parsedData;

          if (!Array.isArray(questions)) {
            throw new Error("Response is not an array");
          }

          if (questions.length !== totalQuestionCount) {
            questions = questions.slice(0, totalQuestionCount);
          }

          allQuestions = questions.map((q) => ({
            questionnumber: questionCounter++,
            question: q.question?.trim() || "",
            questiontype: "multiple-choice",
            optiona: q.optiona?.trim() || "",
            optionb: q.optionb?.trim() || "",
            optionc: q.optionc?.trim() || "",
            optiond: q.optiond?.trim() || "",
            correctanswer: q.correctanswer?.trim() || "",
            explanation: q.explanation?.trim() || "",
            points: 1,
            difficulty: questionDifficulty,
            section: "",
            hasmathcontent: /\\|_|\^|\$|{|}/.test(q.question),
            isgenerated: true,
          }));

          addBotMessage(`✅ Generated ${allQuestions.length} questions!`);
        } catch (error) {
          addBotMessage(`❌ Error generating questions: ${error.message}`);
        }
      }

      setGeneratedQuestions(allQuestions);

      if (allQuestions.length > 0) {
        addBotMessage(
          `🎉 Successfully generated ${allQuestions.length} questions!`
        );
      }
    } catch (error) {
      addBotMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate total questions from sections
  const getTotalQuestionsFromSections = () => {
    return sections.reduce(
      (total, section) => total + section.questionCount,
      0
    );
  };

  // Submit test
  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const totalQuestions = sectionBased
        ? getTotalQuestionsFromSections()
        : totalQuestionCount || generatedQuestions.length;

      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        classid: course.coursecode,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        sectionBased,
        sections: sectionBased ? sections : [],
        questions: generatedQuestions,
        totalnoofquestion: totalQuestions,
        status: "draft",
        ispublished: false,
        scheduleddate: testData.starttime ? new Date() : new Date(),
        ...testData,
        starttime: testData.starttime
          ? new Date(testData.starttime).toISOString()
          : null,
        endtime: testData.endtime
          ? new Date(testData.endtime).toISOString()
          : null,
        year: course.year,
      };

      const response = await ep3.post("/createtestds1", payload);

      if (response.data.success) {
        addBotMessage(
          `🎉 Test "${testData.testtitle}" created successfully with ${
            generatedQuestions.length
          } questions!${
            sectionBased ? ` Organized into ${sections.length} sections.` : ""
          }`
        );
        setTimeout(() => {
          onTestCreated();
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to create test");
      }
    } catch (error) {
      addBotMessage(`❌ Failed to create test: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedQuestions([]);
    setShowPreview(false); // hide preview during generation
    setIsGenerating(true);
    generateQuestionsWithGemini(); // or your own question gen logic
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper sx={{ p: 2, backgroundColor: "#f97316", color: "white" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create Test: {course.coursename}
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ color: "white" }}
          >
            Back
          </Button>
        </Box>
      </Paper>

      {/* AI Toggle */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <FormControlLabel
            control={
              <Switch
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
            }
            label="Use Gemini AI to generate questions"
          />
          {useAI && isLoadingAPIKey && (
            <CircularProgress size={20} sx={{ ml: 2 }} />
          )}
        </Box>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  message.type === "bot" ? "flex-start" : "flex-end",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    message.type === "bot" ? "#f1f5f9" : "#3b82f6",
                  color: message.type === "bot" ? "#1e293b" : "white",
                  border: `1px solid ${
                    message.type === "bot" ? "#e2e8f0" : "#3b82f6"
                  }`,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    opacity: 0.7,
                    textAlign: message.type === "bot" ? "left" : "right",
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Areas */}
      {/* Basic Info Input or Section Details Input */}
      {(flowStage === "basic" ||
        flowStage === "section-count" ||
        flowStage === "section-details" ||
        flowStage === "no-section-setup") &&
        !showDatePicker && (
          <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
            <Box sx={{ display: "flex", gap: 2, maxWidth: 800, mx: "auto" }}>
              <TextField
                fullWidth
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={
                  flowStage === "basic"
                    ? testQuestions[currentStep]?.placeholder
                    : flowStage === "section-count"
                    ? "Enter number of sections (1-10)"
                    : flowStage === "no-section-setup"
                    ? currentSectionStep === "questions"
                      ? "Number of questions"
                      : "easy, medium, or hard"
                    : currentSectionStep === "name"
                    ? "Section name"
                    : currentSectionStep === "questions"
                    ? "Number of questions"
                    : "easy, medium, or hard"
                }
                size="small"
                type={
                  (flowStage === "basic" &&
                    testQuestions[currentStep]?.type === "number") ||
                  flowStage === "section-count" ||
                  (flowStage === "no-section-setup" &&
                    currentSectionStep === "questions") ||
                  currentSectionStep === "questions"
                    ? "number"
                    : "text"
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                startIcon={<Send />}
              >
                Send
              </Button>
            </Box>
          </Box>
        )}

      {/* Date Picker */}
      {showDatePicker && (
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={
                  testQuestions.find((q) => q.field === datePickerField)
                    ?.question
                }
                value={testData[datePickerField]}
                onChange={(dt) => {
                  if (!dt) return;
                  const v = dt instanceof Date ? dt : new Date(dt);
                  if (!isNaN(v.getTime())) {
                    setTestData((prev) => ({
                      ...prev,
                      [datePickerField]: v,
                    }));
                  }
                }}
                onAccept={handleDateTimeAccept}
                minDateTime={new Date()}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      )}

      {/* Section Choice Buttons */}
      {flowStage === "section-choice" && (
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              maxWidth: 800,
              mx: "auto",
            }}
          >
            <Button
              variant="contained"
              onClick={() => handleSectionChoice(true)}
              sx={{ minWidth: 200 }}
            >
              Yes, Create Sections
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSectionChoice(false)}
              sx={{ minWidth: 200 }}
            >
              No, Single Group
            </Button>
          </Box>
        </Box>
      )}

      {/* Final Actions */}
      {flowStage === "ready" && isCompleted && (
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Test Summary
            </Typography>
            <Box
              sx={{ mb: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Title:</strong> {testData.testtitle}
              </Typography>
              <Typography variant="body2">
                <strong>Topic:</strong> {testData.topic}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {testData.duration} minutes
              </Typography>
              {sectionBased ? (
                <Typography variant="body2">
                  <strong>Sections:</strong> {sections.length} sections,{" "}
                  {getTotalQuestionsFromSections()} total questions
                </Typography>
              ) : (
                <Typography variant="body2">
                  <strong>Questions:</strong> {totalQuestionCount}{" "}
                  {questionDifficulty} questions
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {useAI && apiKeySettings && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    await generateQuestionsWithGemini();
                    setShowPreview(true);
                  }}
                  disabled={
                    isGenerating || (sectionBased && sections.length === 0)
                  }
                  startIcon={<Quiz />}
                >
                  {isGenerating
                    ? "Generating..."
                    : "Generate Questions with AI"}
                </Button>
              )}

              <Button
                variant="contained"
                color="success"
                onClick={handleSubmitTest}
                disabled={
                  isSubmitting || (useAI && generatedQuestions.length === 0)
                }
                startIcon={<CheckCircle />}
              >
                {isSubmitting ? "Creating..." : "Create Test"}
              </Button>
            </Box>

            {generatedQuestions.length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Generated {generatedQuestions.length} questions successfully!{" "}
                {sectionBased &&
                  "Each section has the difficulty level you specified."}
              </Alert>
            )}
          </Box>
        </Box>
      )}
      {showPreview && generatedQuestions.length > 0 && (
        <QuestionPreview
          questions={generatedQuestions}
          sectionBased={sectionBased}
          onConfirm={handleSubmitTest}
          onRegenerate={handleRegenerate}
          onEdit={(editedQuestion) => {
            // ✅ FIXED: Update state and show confirmation
            setGeneratedQuestions((prevQuestions) =>
              prevQuestions.map((q) =>
                q.questionnumber === editedQuestion.questionnumber
                  ? editedQuestion
                  : q
              )
            );

            // Show success message in chat
            addBotMessage(
              `✏️ Question ${editedQuestion.questionnumber} updated successfully!`
            );
          }}
        />
      )}
    </Box>
  );
};

export default CreateTestInterface;
