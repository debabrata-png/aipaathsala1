import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid as MuiGrid,
  Stack,
  Tabs,
  Tab,
  Badge,
  Container,
} from "@mui/material";
import { Timer, Warning, CheckCircle, Lock } from "@mui/icons-material";
import MathRenderer from "./MathRenderer";
import FullScreenModal from "./FullScreenModal";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const TestTakerInterface = ({ test, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSectionTab, setCurrentSectionTab] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60);
  const [testSubmission, setTestSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(new Date());

  // Section-based navigation
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [sectionsList, setSectionsList] = useState([]);

  // **ADD THESE MISSING HELPER FUNCTIONS**

  // Count answered questions
  const getAnsweredCount = () => {
    return Object.values(answers).filter(
      (v) => v && String(v).trim().length > 0
    ).length;
  };

  // Get progress percentage
  const getProgressValue = () => {
    const total = shuffledQuestions.length || 1;
    return (getAnsweredCount() / total) * 100;
  };

  // Get section progress - THIS WAS MISSING!
  const getSectionProgress = (sectionName) => {
    const sectionQs = sectionQuestions[sectionName] || [];
    const total = sectionQs.length;

    const answered = sectionQs.filter((q) => {
      // Find the question index in shuffledQuestions
      const questionIndex = shuffledQuestions.findIndex(
        (sq) => sq.questionnumber === q.questionnumber
      );
      return hasAnswer(questionIndex);
    }).length;

    return { answered, total };
  };

  // Check if a question has an answer
  const hasAnswer = (idx) => {
    const v = answers[idx];
    return v !== undefined && String(v).trim().length > 0;
  };

  // Helper functions for test settings
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const addWarning = (message) => {
    setWarnings((prev) => [...prev, message]);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    const warningTime = (test.timewarning || 5) * 60;
    if (timeRemaining < warningTime / 2) return "error";
    if (timeRemaining < warningTime) return "warning";
    return "primary";
  };

  // Check maximum attempts before starting
  useEffect(() => {
    checkMaxAttempts();
  }, []);

  // Initialize questions with shuffling if enabled
  useEffect(() => {
    let questionsToUse = [...(test.questions || [])];

    // Shuffle questions if setting is enabled
    if (test.shufflequestions || test.randomizequestions) {
      questionsToUse = shuffleArray(questionsToUse);
    }

    setShuffledQuestions(questionsToUse);

    // Initialize sections if test is section-based
    if (test.sectionBased && test.sections && test.sections.length > 0) {
      initializeSections(questionsToUse);
    }
  }, [test]);

  // Apply test security settings
  useEffect(() => {
    if (testStarted && !testCompleted) {
      // Prevent copy/paste if enabled
      if (test.preventcopy) {
        const preventCopyPaste = (e) => {
          if (
            e.ctrlKey &&
            (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")
          ) {
            e.preventDefault();
            addWarning(
              `Copy/paste attempt blocked at ${new Date().toLocaleTimeString()}`
            );
            return false;
          }
        };

        const preventRightClick = (e) => {
          e.preventDefault();
          addWarning(
            `Right-click blocked at ${new Date().toLocaleTimeString()}`
          );
          return false;
        };

        // Disable F12, Ctrl+Shift+I, Ctrl+U
        const preventDevTools = (e) => {
          if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && e.key === "I") ||
            (e.ctrlKey && e.key === "u")
          ) {
            e.preventDefault();
            addWarning(
              `Developer tools access blocked at ${new Date().toLocaleTimeString()}`
            );
            return false;
          }
        };

        document.addEventListener("keydown", preventCopyPaste);
        document.addEventListener("contextmenu", preventRightClick);
        document.addEventListener("keydown", preventDevTools);

        // Disable text selection
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.mozUserSelect = "none";

        return () => {
          document.removeEventListener("keydown", preventCopyPaste);
          document.removeEventListener("contextmenu", preventRightClick);
          document.removeEventListener("keydown", preventDevTools);
          document.body.style.userSelect = "";
          document.body.style.webkitUserSelect = "";
          document.body.style.mozUserSelect = "";
        };
      }

      // Setup lockdown mode if enabled
      if (test.lockdown) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }
  }, [testStarted, testCompleted, test.preventcopy, test.lockdown]);

  // Time warning functionality
  useEffect(() => {
    const warningTime = (test.timewarning || 5) * 60; // Convert minutes to seconds
    if (timeRemaining === warningTime && timeRemaining > 0) {
      setShowTimeWarning(true);
      addWarning(`⏰ Warning: ${test.timewarning || 5} minutes remaining!`);

      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowTimeWarning(false), 5000);
    }
  }, [timeRemaining, test.timewarning]);

  // Auto-submit guards
  useEffect(() => {
    const autoSubmit = (e) => {
      if (testStarted && !testCompleted) {
        handleAutoSubmit();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", autoSubmit);
    window.addEventListener("popstate", autoSubmit);

    return () => {
      window.removeEventListener("beforeunload", autoSubmit);
      window.removeEventListener("popstate", autoSubmit);
    };
  }, [testStarted, testCompleted]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const checkMaxAttempts = async () => {
    if (test.maxattempts && test.maxattempts > 1) {
      try {
        const response = await ep3.get("/getstudentattemptscount", {
          params: {
            testid: test._id,
            studentid: global1.userEmail,
            colid: global1.colid,
          },
        });

        if (response.data.success) {
          const attemptCount = response.data.data.attemptCount || 0;
          setAttempts(attemptCount);

          if (attemptCount >= test.maxattempts) {
            alert(
              `You have reached the maximum number of attempts (${test.maxattempts}) for this test.`
            );
            onBack();
            return;
          }
        }
      } catch (error) {
        console.error("Error checking attempts:", error);
      }
    }
  };

  const initializeSections = (questions) => {
    const organized = {};
    const sections = [];

    test.sections.forEach((section, sectionIndex) => {
      const sectionQs = questions.filter((q) => q.section === section.name);
      organized[section.name] = sectionQs;
      sections.push({
        ...section,
        questions: sectionQs,
        index: sectionIndex,
      });
    });

    setSectionQuestions(organized);
    setSectionsList(sections);

    if (sections.length > 0 && sections[0].questions.length > 0) {
      const firstQuestion = sections[0].questions[0];
      const questionIndex = questions.findIndex(
        (q) => q.questionnumber === firstQuestion.questionnumber
      );
      if (questionIndex !== -1) {
        setCurrentQuestion(questionIndex);
      }
    }
  };

  const setupTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const setupTabSwitchDetection = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !testCompleted) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        addWarning(
          `Tab switch detected #${newCount} at ${new Date().toLocaleTimeString()}`
        );

        if (test.proctoring && newCount >= 3) {
          alert(
            "Multiple tab switches detected! This test will be flagged for review."
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  const handleStartTest = () => {
    setShowStartDialog(false);
    setTestStarted(true);
    startTest();
    setupTimer();
    setupTabSwitchDetection();
  };

  const startTest = async () => {
    try {
      const response = await ep3.post("/starttestds2", {
        testid: test._id,
        studentid: global1.userEmail,
        colid: global1.colid,
        name: global1.userName,
        user: global1.userEmail,
        classid: test.classid,
        attemptNumber: attempts + 1,
      });

      if (response.data.success) {
        setTestSubmission(response.data.data);
        if (response.data.isResume) {
          addWarning('Resumed previous session. Timer adjusted.');

          // Restore timer
          if (response.data.data.timeremaining) {
            setTimeRemaining(response.data.data.timeremaining);
          }

          // Restore answers
          if (response.data.data.answers && response.data.data.answers.length > 0) {
            const restoredAnswers = {};
            response.data.data.answers.forEach(ans => {
              // questionnumber is 1-indexed in backend
              const idx = ans.questionnumber - 1;
              restoredAnswers[idx] = {
                selectedanswerkey: ans.selectedanswerkey,
                selectedanswer: ans.selectedanswer
              };
            });
            setAnswers(restoredAnswers);
          }

          // Restore last question position
          if (response.data.data.lastQuestionAttempted) {
            setCurrentQuestion(response.data.data.lastQuestionAttempted - 1);
            updateSectionTabForQuestion(response.data.data.lastQuestionAttempted - 1);
          }
        }
      }
    } catch (error) {
      alert("Failed to start test. Please try again.");
      onBack();
    }
  };

  const handleAnswerChange = (questionIndex, selectedKey) => {
    const question = shuffledQuestions[questionIndex];
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        selectedanswerkey: selectedKey,
        selectedanswer: question["option" + selectedKey],
      },
    }));
  };

  const submitAnswer = async (questionIndex, answer) => {
    if (!testSubmission) return;

    try {
      const question = shuffledQuestions[questionIndex];
      await ep3.post("/submitanswerds2", {
        testid: test._id,
        studentid: global1.userEmail,
        colid: global1.colid,
        questionnumber: questionIndex + 1,
        selectedanswerkey: answers[questionIndex]?.selectedanswerkey, // 'a', 'b', 'c', or 'd'
        selectedanswer: answers[questionIndex]?.selectedanswer,
        section: question?.section || null,
        timespent: Math.floor((new Date() - startTimeRef.current) / 1000),
        timeremaining: timeRemaining // Send current timer state
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleNextQuestion = () => {
    if (hasAnswer(currentQuestion)) {
      submitAnswer(currentQuestion, answers[currentQuestion]);
    }

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      updateSectionTabForQuestion(currentQuestion + 1);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      updateSectionTabForQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionNavigation = (targetIndex) => {
    setCurrentQuestion(targetIndex);
    updateSectionTabForQuestion(targetIndex);
  };

  const updateSectionTabForQuestion = (questionIndex) => {
    if (test.sectionBased && sectionsList.length > 0) {
      const question = shuffledQuestions[questionIndex];
      const sectionIndex = sectionsList.findIndex(
        (section) => section.name === question.section
      );
      if (sectionIndex !== -1 && sectionIndex !== currentSectionTab) {
        setCurrentSectionTab(sectionIndex);
      }
    }
  };

  const handleSectionTabChange = (event, newValue) => {
    setCurrentSectionTab(newValue);
    const selectedSection = sectionsList[newValue];
    if (selectedSection && selectedSection.questions.length > 0) {
      const firstQuestion = selectedSection.questions[0];
      const questionIndex = shuffledQuestions.findIndex(
        (q) => q.questionnumber === firstQuestion.questionnumber
      );
      if (questionIndex !== -1) {
        setCurrentQuestion(questionIndex);
      }
    }
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      if (hasAnswer(currentQuestion)) {
        await submitAnswer(currentQuestion, answers[currentQuestion]);
      }

      const response = await ep3.post("/submittestds2", {
        testid: test._id,
        studentid: global1.userEmail,
        colid: global1.colid,
        tabSwitches: tabSwitches,
        warnings: warnings,
        attemptNumber: attempts + 1,
      });

      if (response.data.success) {
        setTestCompleted(true);
        setTestStarted(false);
        setShowSubmitDialog(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (error) {
      alert("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => !testCompleted && handleSubmitTest();

  // Start dialog with enhanced security warnings
  if (showStartDialog) {
    return (
      <FullScreenModal open={showStartDialog}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Lock sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              Start Secure Test Mode
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Once you start this test, security measures will be active:
            </Typography>

            <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>You cannot leave this page until you submit</li>
                <li>Browser refresh will auto-submit your test</li>
                {test.preventcopy && (
                  <li>Copy/paste and right-click are disabled</li>
                )}
                {test.proctoring && <li>Tab switching is monitored</li>}
                {test.lockdown && (
                  <li>Lockdown mode prevents other applications</li>
                )}
                {test.shufflequestions && (
                  <li>Questions are randomly shuffled</li>
                )}
                {test.maxattempts > 1 && (
                  <li>
                    Maximum attempts: {test.maxattempts} (Current:{" "}
                    {attempts + 1})
                  </li>
                )}
                {test.timewarning && (
                  <li>
                    You'll get a warning at {test.timewarning} minutes remaining
                  </li>
                )}
              </ul>
            </Alert>

            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Test Duration: {test.duration} minutes | Questions:{" "}
              {shuffledQuestions.length}
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button onClick={onBack} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleStartTest}
                variant="contained"
                color="primary"
                size="large"
              >
                I Understand - Start Test
              </Button>
            </Stack>
          </Paper>
        </Container>
      </FullScreenModal>
    );
  }

  // Completion screen
  if (testCompleted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Test Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your answers have been recorded and saved.
          </Typography>

          {tabSwitches > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Note: {tabSwitches} tab switch(es) were detected and recorded.
            </Alert>
          )}

          {test.showresults !== false && (
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              You can view your results in the Results section.
            </Typography>
          )}

          <Button onClick={onBack} variant="contained">
            Back to Tests
          </Button>
        </Paper>
      </Container>
    );
  }

  // No questions guard
  if (!shuffledQuestions || shuffledQuestions.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          This test has no questions yet. Please contact your instructor.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button onClick={onBack} variant="contained">
            Back to Tests
          </Button>
        </Box>
      </Container>
    );
  }

  const question = shuffledQuestions[currentQuestion];

  return (
    <FullScreenModal open={testStarted && !testCompleted}>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header - FIXED */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 0,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {test.testtitle} (Secure Mode)
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            {test.proctoring && tabSwitches > 0 && (
              <Chip
                label={`⚠️ ${tabSwitches} Tab Switch${tabSwitches > 1 ? "es" : ""
                  }`}
                color="warning"
                size="small"
              />
            )}

            <Chip
              icon={<Timer />}
              label={formatTime(timeRemaining)}
              color={getTimeColor()}
              sx={{
                backgroundColor: "white",
                color:
                  getTimeColor() === "error" ? "error.main" : "primary.main",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
          </Stack>
        </Paper>

        {/* Time Warning Alert */}
        {showTimeWarning && (
          <Alert
            severity="warning"
            sx={{ m: 2 }}
            onClose={() => setShowTimeWarning(false)}
          >
            <Typography variant="body2">
              ⏰ Warning: Only {test.timewarning || 5} minutes remaining!
            </Typography>
          </Alert>
        )}

        {/* Progress - FIXED */}
        <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Question {currentQuestion + 1} of {shuffledQuestions.length}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answered: {getAnsweredCount()}/{shuffledQuestions.length}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{ height: 8, borderRadius: 4 }}
          />

          {question?.section && (
            <Chip
              label={`Section: ${question.section}`}
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Paper>

        {/* Section Tabs - SCROLLABLE */}
        {test.sectionBased && sectionsList.length > 0 && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "background.paper",
              flexShrink: 0,
            }}
          >
            <Tabs
              value={currentSectionTab}
              onChange={handleSectionTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  minWidth: { xs: 100, sm: 140 },
                  fontSize: { xs: "0.7rem", sm: "0.85rem" },
                  py: 1,
                },
              }}
            >
              {sectionsList.map((section, index) => {
                const progress = getSectionProgress(section.name);
                return (
                  <Tab
                    key={section.name}
                    label={
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          }}
                        >
                          {section.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" } }}
                        >
                          {progress.answered}/{progress.total} •{" "}
                          {section.difficulty}
                        </Typography>
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          </Box>
        )}

        {/* Main Content - SCROLLABLE */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Question Area */}
          <Box
            sx={{
              flex: { xs: 1, lg: 2 },
              overflow: "auto",
              p: { xs: 1, sm: 2 },
            }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                >
                  Question {currentQuestion + 1}
                </Typography>

                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "grey.50",
                  }}
                >
                  {question.questionimage && (
                    <Box sx={{ mb: 2, textAlign: "center" }}>
                      <img
                        src={question.questionimage}
                        alt="Question Reference"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                  >
                    <MathRenderer>{question.question}</MathRenderer>
                  </Typography>
                </Box>

                {/* Options */}
                {question.questiontype === "multiple-choice" ? (
                  <FormControl fullWidth>
                    <RadioGroup
                      value={answers[currentQuestion]?.selectedanswerkey || ""}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion, e.target.value)
                      }
                      sx={{ gap: 1 }}
                    >
                      {["optiona", "optionb", "optionc", "optiond"].map(
                        (k, idx) => {
                          const key = String.fromCharCode(97 + idx); // 'a', 'b', 'c', 'd'
                          if (!question[k]) return null;
                          return (
                            <FormControlLabel
                              key={k}
                              value={key} // value is now 'a', 'b', 'c', or 'd'
                              control={<Radio />}
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    p: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    backgroundColor: "background.paper",
                                    "&:hover": {
                                      backgroundColor: "action.hover",
                                    },
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      minWidth: 24,
                                      color: "primary.main",
                                    }}
                                  >
                                    {String.fromCharCode(65 + idx)}.
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontSize: {
                                        xs: "0.85rem",
                                        sm: "0.95rem",
                                      },
                                      lineHeight: 1.5,
                                      wordBreak: "break-word",
                                      flex: 1,
                                      ml: 1,
                                    }}
                                  >
                                    <MathRenderer>{question[k]}</MathRenderer>
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                mb: 1.5,
                                alignItems: "flex-start",
                                margin: 0,
                                width: "100%",
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                },
                              }}
                            />
                          );
                        }
                      )}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={answers[currentQuestion] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    variant="outlined"
                  />
                )}

                {/* Navigation Buttons */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  >
                    Previous
                  </Button>

                  {currentQuestion === test.questions.length - 1 ? (
                    <Button
                      onClick={() => setShowSubmitDialog(true)}
                      variant="contained"
                      color="success"
                      sx={{ flex: 1 }}
                    >
                      Submit Test
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      variant="contained"
                      color="primary"
                      sx={{ flex: 1 }}
                    >
                      Next
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
          {/* Navigation Panel - SCROLLABLE */}
          <Box
            sx={{
              flex: { xs: 1, lg: 1 },
              overflow: "auto",
              p: { xs: 1, sm: 2 },
              borderLeft: { lg: "1px solid" },
              borderColor: { lg: "divider" },
              borderTop: { xs: "1px solid", lg: "none" },
              maxHeight: { xs: "300px", lg: "none" },
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
              >
                Navigate Questions
              </Typography>

              {test.sectionBased && sectionsList.length > 0 ? (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {sectionsList[currentSectionTab]?.name} Questions
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(45px, 1fr))",
                      gap: 1,
                      maxHeight: { xs: "150px", lg: "400px" },
                      overflowY: "auto",
                    }}
                  >
                    {(
                      sectionQuestions[sectionsList[currentSectionTab]?.name] ||
                      []
                    ).map((q) => {
                      const qIdx = test.questions.findIndex(
                        (tq) => tq.questionnumber === q.questionnumber
                      );
                      const isActive = currentQuestion === qIdx;
                      const isAnswered = hasAnswer(qIdx);

                      return (
                        <Button
                          key={qIdx}
                          onClick={() => handleQuestionNavigation(qIdx)}
                          sx={{
                            minWidth: 45,
                            minHeight: 45,
                            fontSize: "0.8rem",
                            fontWeight: isActive ? 700 : 500,
                            border: "2px solid",
                            borderColor: isActive
                              ? "primary.main"
                              : isAnswered
                                ? "success.main"
                                : "grey.300",
                            bgcolor: isActive
                              ? "primary.main"
                              : isAnswered
                                ? "success.main"
                                : "background.paper",
                            color:
                              isActive || isAnswered ? "white" : "text.primary",
                            "&:hover": {
                              bgcolor: isActive
                                ? "primary.dark"
                                : isAnswered
                                  ? "success.dark"
                                  : "action.hover",
                            },
                          }}
                        >
                          {q.questionnumber}
                        </Button>
                      );
                    })}
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    All Questions
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(45px, 1fr))",
                      gap: 1,
                      maxHeight: { xs: "150px", lg: "400px" },
                      overflowY: "auto",
                    }}
                  >
                    {test.questions.map((_, idx) => {
                      const isActive = currentQuestion === idx;
                      const isAnswered = hasAnswer(idx);

                      return (
                        <Button
                          key={idx}
                          onClick={() => handleQuestionNavigation(idx)}
                          sx={{
                            minWidth: 45,
                            minHeight: 45,
                            fontSize: "0.8rem",
                            fontWeight: isActive ? 700 : 500,
                            border: "2px solid",
                            borderColor: isActive
                              ? "primary.main"
                              : isAnswered
                                ? "success.main"
                                : "grey.300",
                            bgcolor: isActive
                              ? "primary.main"
                              : isAnswered
                                ? "success.main"
                                : "background.paper",
                            color:
                              isActive || isAnswered ? "white" : "text.primary",
                            "&:hover": {
                              bgcolor: isActive
                                ? "primary.dark"
                                : isAnswered
                                  ? "success.dark"
                                  : "action.hover",
                            },
                          }}
                        >
                          {idx + 1}
                        </Button>
                      );
                    })}
                  </Box>
                </>
              )}

              {/* Progress Summary */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Progress Summary
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Answered: {getAnsweredCount()}/{test.questions.length}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Remaining: {test.questions.length - getAnsweredCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {formatTime(timeRemaining)}
                </Typography>
              </Box>
            </Paper>
          </Box>

        </Box>

        {/* Submit Dialog */}
        <Dialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit Test</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to submit your test?
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              You have answered {getAnsweredCount()} out of{" "}
              {shuffledQuestions.length} questions. Once submitted, you cannot
              make any changes.
            </Typography>

            {getAnsweredCount() < shuffledQuestions.length && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have {shuffledQuestions.length - getAnsweredCount()}{" "}
                unanswered questions.
              </Alert>
            )}

            {tabSwitches > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Note: {tabSwitches} tab switch(es) detected during this session.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitDialog(false)}>
              Continue Test
            </Button>
            <Button
              onClick={handleSubmitTest}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FullScreenModal>
  );
};

export default TestTakerInterface;
