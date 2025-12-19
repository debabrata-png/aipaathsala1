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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Send, BusinessCenter, CheckCircle } from "@mui/icons-material";
import FileUploadWithOCR from "./FileUploadWithOCR";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const ConsultancyChatCreator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [consultancyData, setConsultancyData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDocumentOptions, setShowDocumentOptions] = useState(false);
  const [documentChoice, setDocumentChoice] = useState("");
  const [validationResults, setValidationResults] = useState(null);
  const messagesEndRef = useRef(null);

  // Field mappings for OCR validation
  const fieldMappings = {
    year: ["year", "date", "period", "2024", "2023"],
    consultant: ["consultant", "expert", "advisor", "specialist"],
    advisor: ["advisor", "supervisor", "guide", "mentor"],
    agency: ["agency", "organization", "company", "firm", "corporation"],
    revenue: [
      "amount",
      "revenue",
      "payment",
      "fee",
      "cost",
      "price",
      "rupees",
      "inr",
      "₹",
    ],
    title: ["title", "project", "topic", "subject"],
    department: ["department", "division", "section", "unit"],
    contact: ["contact", "phone", "mobile", "telephone", "number"],
    duration: ["duration", "period", "time", "months", "weeks", "days"],
  };

  const consultancyQuestions = [
    {
      field: "year",
      question: "In which year did this consultancy take place?",
      type: "text",
      required: true,
      placeholder: "Enter year (e.g., 2024)",
    },
    {
      field: "consultant",
      question: "What is the name of the consultant?",
      type: "text",
      required: true,
      placeholder: "Enter consultant name",
    },
    {
      field: "advisor",
      question: "Who is the advisor for this consultancy?",
      type: "text",
      required: true,
      placeholder: "Enter advisor name",
    },
    {
      field: "agency",
      question: "Which agency/organization requested this consultancy?",
      type: "text",
      required: true,
      placeholder: "Enter agency/organization name",
    },
    {
      field: "contact",
      question: "What is the contact number for this consultancy?",
      type: "number",
      required: true,
      placeholder: "Enter contact number",
    },
    {
      field: "revenue",
      question: "What revenue was generated from this consultancy?",
      type: "number",
      required: true,
      placeholder: "Enter amount in rupees",
    },
    {
      field: "status1",
      question: "What is the current status of this consultancy?",
      type: "select",
      required: true,
      options: ["Ongoing", "Completed", "Pending", "Cancelled", "On Hold"],
    },
    {
      field: "comments",
      question: "Please provide comments about this consultancy:",
      type: "textarea",
      required: true,
      placeholder:
        "Enter details about the consultancy project, outcomes, etc.",
    },
    {
      field: "title",
      question: "What is the title/topic of this consultancy? (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter consultancy title or topic",
    },
    {
      field: "duration",
      question: "What was the duration of this consultancy? (Optional)",
      type: "text",
      required: false,
      placeholder: "e.g., 3 months, 6 weeks, 1 year",
    },
    {
      field: "department",
      question: "Which department was involved in this consultancy? (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter department name",
    },
    {
      field: "trainees",
      question: "How many trainees were involved? (Optional)",
      type: "number",
      required: false,
      placeholder: "Enter number of trainees",
    },
    {
      field: "role",
      question: "What was your role in this consultancy? (Optional)",
      type: "select",
      required: false,
      options: [
        "Lead Consultant",
        "Co-Consultant",
        "Technical Advisor",
        "Subject Matter Expert",
        "Project Manager",
        "Trainer",
      ],
    },
    {
      field: "doclink",
      question: "Would you like to add supporting documents? (Optional)",
      type: "document",
      required: false,
    },
  ];

  useEffect(() => {
    setMessages([
      {
        type: "bot",
        content: `👋 Hello ${global1.userName}! I'll help you register a new consultancy project. Let's gather the necessary information.`,
        timestamp: new Date(),
      },
      {
        type: "bot",
        content: consultancyQuestions[0].question,
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

  const handleSendMessage = () => {
    if (!currentInput.trim() && !showFileUpload && !showDocumentOptions) return;

    const currentQuestion = consultancyQuestions[currentStep];

    if (currentQuestion.type === "document") {
      setShowDocumentOptions(true);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "How would you like to add your document?",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    if (currentInput.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: currentInput,
          timestamp: new Date(),
        },
      ]);

      setConsultancyData((prev) => ({
        ...prev,
        [currentQuestion.field]:
          currentQuestion.type === "number"
            ? parseFloat(currentInput)
            : currentInput.trim(),
      }));
    }

    moveToNextQuestion();
  };

  const handleDocumentChoice = (choice) => {
    setDocumentChoice(choice);
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content:
          choice === "upload"
            ? "I want to upload a document"
            : "I want to provide a document link",
        timestamp: new Date(),
      },
    ]);

    if (choice === "upload") {
      setShowFileUpload(true);
      setShowDocumentOptions(false);
    } else if (choice === "link") {
      setShowDocumentOptions(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Please provide the document link:",
          timestamp: new Date(),
        },
      ]);
    } else if (choice === "skip") {
      setShowDocumentOptions(false);
      moveToNextQuestion();
    }
  };

  const handleFileUpload = (fileData) => {
    setConsultancyData((prev) => ({
      ...prev,
      doclink: fileData.url,
    }));

    // Store validation results for review
    if (fileData.validationResults) {
      setValidationResults(fileData.validationResults);

      // Add validation message
      const score = Math.round(fileData.validationResults.overallScore);
      let validationMessage = "";

      if (score >= 80) {
        validationMessage = `✅ Great! Document validation successful (${score}% match). The uploaded document appears to match your entered information.`;
      } else if (score >= 60) {
        validationMessage = `⚠️ Document validation completed (${score}% match). Please review any highlighted discrepancies.`;
      } else {
        validationMessage = `❌ Document validation shows low match (${score}%). Please verify your information or upload a different document.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: validationMessage,
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: "📎 Document uploaded successfully",
          timestamp: new Date(),
        },
      ]);
    }

    setShowFileUpload(false);
    moveToNextQuestion();
  };

  const handleDocumentLink = () => {
    if (currentInput.trim()) {
      setConsultancyData((prev) => ({
        ...prev,
        doclink: currentInput.trim(),
      }));
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: currentInput.trim(),
          timestamp: new Date(),
        },
      ]);
      setCurrentInput("");
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    if (currentStep < consultancyQuestions.length - 1) {
      setTimeout(() => {
        const nextQuestion = consultancyQuestions[currentStep + 1];
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: nextQuestion.question,
            timestamp: new Date(),
          },
        ]);
        setCurrentStep(currentStep + 1);
        setCurrentInput("");
      }, 1000);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content:
              "✅ Excellent! I have collected all the consultancy information. Here's a summary:",
            timestamp: new Date(),
          },
        ]);
        setIsCompleted(true);
        setCurrentInput("");
      }, 1000);
    }
  };

  const handleSubmitConsultancy = async () => {
    setIsSubmitting(true);
    try {
      const response = await ep3.post("/createconsultancy", {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        ...consultancyData,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content:
              "🎉 Excellent! Your consultancy has been successfully registered in the system.",
            timestamp: new Date(),
          },
          {
            type: "bot",
            content:
              'You can view and manage all your consultancies in the "My Consultancies" tab.',
            timestamp: new Date(),
          },
        ]);

        setTimeout(() => {
          setConsultancyData({});
          setCurrentStep(0);
          setIsCompleted(false);
          setDocumentChoice("");
          setValidationResults(null);
          setMessages([
            {
              type: "bot",
              content: "🚀 Ready to register another consultancy? Let's begin!",
              timestamp: new Date(),
            },
            {
              type: "bot",
              content: consultancyQuestions[0].question,
              timestamp: new Date(),
            },
          ]);
        }, 3000);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "❌ Sorry, there was an error saving your consultancy. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          margin: 2,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#059669",
            color: "white",
            padding: 2,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <BusinessCenter />
            Consultancy Registration Assistant
          </Typography>
        </Box>

        {/* Messages Container with proper scrolling */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List
            sx={{
              flex: 1,
              overflow: "auto",
              padding: 2,
              maxHeight: "calc(100vh - 300px)", // Ensures proper height calculation
            }}
          >
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: "column",
                  alignItems:
                    message.type === "user" ? "flex-end" : "flex-start",
                  padding: "4px 0",
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    padding: 2,
                    maxWidth: "80%",
                    backgroundColor:
                      message.type === "user" ? "#059669" : "#e5e7eb",
                    color: message.type === "user" ? "white" : "black",
                    borderRadius:
                      message.type === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                  }}
                >
                  <Typography sx={{ wordBreak: "break-word" }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.7, fontSize: "0.7rem" }}
                  >
                    {formatDate(message.timestamp)}
                  </Typography>
                </Paper>
              </ListItem>
            ))}

            {isCompleted && (
              <Box
                sx={{
                  padding: 3,
                  backgroundColor: "#f0fdf4",
                  borderRadius: 2,
                  margin: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#059669", marginBottom: 2 }}
                >
                  <CheckCircle
                    sx={{ verticalAlign: "middle", marginRight: 1 }}
                  />
                  Consultancy Summary
                </Typography>

                {/* Show validation summary if available */}
                {validationResults && (
                  <Alert
                    severity={
                      validationResults.overallScore >= 80
                        ? "success"
                        : validationResults.overallScore >= 60
                        ? "warning"
                        : "error"
                    }
                    sx={{ marginBottom: 2 }}
                  >
                    Document Validation Score:{" "}
                    {Math.round(validationResults.overallScore)}%
                    {validationResults.overallScore < 80 &&
                      " - Please verify the highlighted information carefully."}
                  </Alert>
                )}

                <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                  {Object.entries(consultancyData).map(([key, value]) => {
                    const question = consultancyQuestions.find(
                      (q) => q.field === key
                    );
                    if (!value || !question) return null;

                    // Check if this field had validation issues
                    const hasValidationIssue =
                      validationResults?.mismatches?.some(
                        (m) => m.field === key
                      ) ||
                      validationResults?.suggestions?.some(
                        (s) => s.field === key
                      );

                    return (
                      <Box
                        key={key}
                        sx={{
                          display: "flex",
                          marginBottom: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            minWidth: "150px",
                            color: hasValidationIssue ? "orange" : "inherit",
                            marginRight: 1,
                          }}
                        >
                          {question.question
                            .replace("?", "")
                            .replace(" (Optional)", "")}
                          :{hasValidationIssue && " ⚠️"}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {key === "doclink"
                            ? "📎 Document attached"
                            : key === "revenue"
                            ? formatCurrency(value)
                            : value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmitConsultancy}
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CheckCircle />
                    )
                  }
                  sx={{
                    backgroundColor: "#059669",
                    "&:hover": { backgroundColor: "#047857" },
                    marginTop: 2,
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Consultancy"}
                </Button>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Document Options */}
        {showDocumentOptions && (
          <Box
            sx={{
              padding: 2,
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <FormControl component="fieldset">
              <FormLabel component="legend">Choose an option:</FormLabel>
              <RadioGroup
                value={documentChoice}
                onChange={(e) => handleDocumentChoice(e.target.value)}
              >
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload a document file (with OCR validation)"
                />
                <FormControlLabel
                  value="link"
                  control={<Radio />}
                  label="Provide a document link"
                />
                <FormControlLabel
                  value="skip"
                  control={<Radio />}
                  label="Skip (no document)"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* File Upload Section */}
        {showFileUpload && (
          <Box
            sx={{
              padding: 2,
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e5e7eb",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <FileUploadWithOCR
              onFileUpload={handleFileUpload}
              onCancel={() => {
                setShowFileUpload(false);
                setShowDocumentOptions(true);
              }}
              formData={consultancyData}
              fieldMappings={fieldMappings}
              documentType="consultancy"
            />
          </Box>
        )}

        {/* Input Section */}
        {!isCompleted && !showFileUpload && !showDocumentOptions && (
          <Box sx={{ padding: 2, borderTop: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              {consultancyQuestions[currentStep]?.type === "select" ? (
                <TextField
                  select
                  fullWidth
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={consultancyQuestions[currentStep]?.placeholder}
                  size="small"
                  SelectProps={{ native: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  <option value="">Select option...</option>
                  {consultancyQuestions[currentStep]?.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              ) : consultancyQuestions[currentStep]?.type === "textarea" ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={consultancyQuestions[currentStep]?.placeholder}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                />
              ) : consultancyQuestions[currentStep]?.type === "number" ? (
                <TextField
                  fullWidth
                  type="number"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={consultancyQuestions[currentStep]?.placeholder}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      documentChoice === "link"
                        ? handleDocumentLink()
                        : handleSendMessage();
                    }
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={consultancyQuestions[currentStep]?.placeholder}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                    },
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      documentChoice === "link"
                        ? handleDocumentLink()
                        : handleSendMessage();
                    }
                  }}
                />
              )}

              <IconButton
                onClick={
                  documentChoice === "link"
                    ? handleDocumentLink
                    : handleSendMessage
                }
                sx={{
                  backgroundColor: "#059669",
                  color: "white",
                  "&:hover": { backgroundColor: "#047857" },
                }}
                disabled={!currentInput.trim() && documentChoice !== "link"}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ConsultancyChatCreator;
