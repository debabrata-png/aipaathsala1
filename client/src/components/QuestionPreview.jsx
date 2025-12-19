import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ExpandMore, Edit, Delete, CheckCircle } from "@mui/icons-material";
import MathRenderer from "./MathRenderer";

const QuestionPreview = ({
  questions,
  onConfirm,
  onEdit,
  sectionBased = false,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Group questions by section
  const groupedQuestions = sectionBased
    ? questions.reduce((acc, q) => {
        if (!acc[q.section]) acc[q.section] = [];
        acc[q.section].push(q);
        return acc;
      }, {})
    : { "All Questions": questions };

  // ✅ FIXED: Handle edit dialog open
  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setEditFormData({ ...question });
    setEditDialogOpen(true);
  };

  // ✅ FIXED: Handle edit save
  const handleEditSave = () => {
    if (onEdit) {
      onEdit(editFormData);
    }
    setEditDialogOpen(false);
    setEditingQuestion(null);
  };

  // ✅ FIXED: Handle edit form change
  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 700, color: "#1e40af" }}
      >
        📋 Question Preview ({questions.length} questions)
      </Typography>

      {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
        <Box key={section} sx={{ mb: 4 }}>
          {sectionBased && (
            <Box
              sx={{
                mb: 2,
                pb: 2,
                borderBottom: "3px solid #1e40af",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1e40af",
                }}
              >
                📚 {section}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                {sectionQuestions.length} questions
              </Typography>
            </Box>
          )}

          {sectionQuestions.map((question, idx) => (
            <Accordion
              key={question.questionnumber}
              expanded={expandedQuestion === question.questionnumber}
              onChange={() =>
                setExpandedQuestion(
                  expandedQuestion === question.questionnumber
                    ? -1
                    : question.questionnumber
                )
              }
              sx={{
                mb: 1.5,
                backgroundColor: "#fafafa",
                border: "1px solid #e5e7eb",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      minWidth: 50,
                      color: "#1e40af",
                    }}
                  >
                    Q{question.questionnumber}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {question.question}
                    </Typography>
                  </Box>
                  <Chip
                    label={question.difficulty}
                    size="small"
                    color={
                      question.difficulty === "easy"
                        ? "success"
                        : question.difficulty === "medium"
                        ? "warning"
                        : "error"
                    }
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid #e5e7eb",
                  pt: 3,
                  pb: 3,
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  {/* Question Text */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#f0f9ff",
                      borderLeft: "4px solid #0284c7",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: "#0c4a6e",
                      }}
                    >
                      📌 Question:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      <MathRenderer block>{question.question}</MathRenderer>
                    </Typography>
                  </Box>

                  {/* Options */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: "#1e40af",
                      }}
                    >
                      🔹 Options:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                      }}
                    >
                      {["optiona", "optionb", "optionc", "optiond"].map(
                        (option, i) => {
                          const isCorrect =
                            question[option] === question.correctanswer;
                          return (
                            <Box
                              key={option}
                              sx={{
                                p: 1.5,
                                borderRadius: 1,
                                backgroundColor: isCorrect
                                  ? "#dcfce7"
                                  : "#ffffff",
                                border: isCorrect
                                  ? "2px solid #22c55e"
                                  : "1px solid #d1d5db",
                                display: "flex",
                                gap: 1.5,
                                alignItems: "flex-start",
                                transition: "all 0.2s",
                                "&:hover": {
                                  backgroundColor: isCorrect
                                    ? "#dcfce7"
                                    : "#f9fafb",
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  minWidth: 30,
                                  color: isCorrect ? "#22c55e" : "#6b7280",
                                }}
                              >
                                {String.fromCharCode(65 + i)}.
                              </Typography>
                              <Box
                                sx={{
                                  flex: 1,
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                  wordWrap: "break-word",
                                }}
                              >
                                <MathRenderer>{question[option]}</MathRenderer>
                              </Box>
                              {isCorrect && (
                                <CheckCircle
                                  sx={{
                                    color: "#22c55e",
                                    fontSize: 22,
                                    minWidth: 22,
                                    mt: 0.5,
                                  }}
                                />
                              )}
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  </Box>

                  {/* Explanation */}
                  {question.explanation && (
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "#fef3c7",
                        borderLeft: "4px solid #f59e0b",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: "#92400e",
                        }}
                      >
                        💡 Explanation:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                        }}
                      >
                        <MathRenderer>{question.explanation}</MathRenderer>
                      </Typography>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      pt: 1,
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditClick(question)}
                      variant="outlined"
                      color="primary"
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      {/* Confirmation Buttons */}
      <Box
        sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4, mb: 2 }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={onConfirm}
          sx={{ minWidth: 220, py: 1.2 }}
          size="large"
        >
          ✓ Confirm & Create Test
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (typeof onRegenerate === "function") {
              onRegenerate();
            }
          }}
          sx={{ minWidth: 220, py: 1.2 }}
          size="large"
        >
          ✗ Regenerate
        </Button>
      </Box>

      {/* ✅ FIXED: Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1e40af" }}>
          Edit Question
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Question"
            fullWidth
            multiline
            rows={3}
            value={editFormData.question || ""}
            onChange={(e) => handleEditChange("question", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Option A"
            fullWidth
            multiline
            rows={2}
            value={editFormData.optiona || ""}
            onChange={(e) => handleEditChange("optiona", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Option B"
            fullWidth
            multiline
            rows={2}
            value={editFormData.optionb || ""}
            onChange={(e) => handleEditChange("optionb", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Option C"
            fullWidth
            multiline
            rows={2}
            value={editFormData.optionc || ""}
            onChange={(e) => handleEditChange("optionc", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Option D"
            fullWidth
            multiline
            rows={2}
            value={editFormData.optiond || ""}
            onChange={(e) => handleEditChange("optiond", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Correct Answer"
            fullWidth
            value={editFormData.correctanswer || ""}
            onChange={(e) => handleEditChange("correctanswer", e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Explanation"
            fullWidth
            multiline
            rows={2}
            value={editFormData.explanation || ""}
            onChange={(e) => handleEditChange("explanation", e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              // ✅ FIXED: Call onEdit with updated data and close dialog
              if (onEdit) {
                onEdit(editFormData);
              }
              setEditDialogOpen(false);
              setEditingQuestion(null);
            }}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPreview;
