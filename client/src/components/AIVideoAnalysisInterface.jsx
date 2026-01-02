import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  Link,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  SmartToy,
  VideoLibrary,
  Assignment,
  Visibility,
  PlayArrow,
  Refresh,
  Delete,
  Schedule,
  TrendingUp,
} from "@mui/icons-material";
import socketInstance from "../api/ep2";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";
import TextToSpeech from './TextToSpeech';

const AIVideoAnalysisInterface = () => {
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [clickedButtons, setClickedButtons] = useState(new Set());
  const clickTimeoutRef = useRef({});

  // ✅ NEW: Add socket state for real-time updates
  const [socket, setSocket] = useState(null);

  const permissions = {
    isFaculty: global1.userRole?.toUpperCase() === "FACULTY",
    canTriggerAI: global1.userRole?.toUpperCase() === "FACULTY",
  };

  useEffect(() => {
    if (permissions.canTriggerAI) {
      fetchScheduledClasses();
      fetchAIAnalyses();
    }
  }, []);

  // ✅ NEW: Initialize socket connection for real-time updates
  useEffect(() => {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    setSocket(socketInstance);

    // ✅ Listen for AI analysis status updates
    socketInstance.on("ai_analysis_status_update", (statusUpdate) => {
      fetchAIAnalyses();
    });

    // ✅ Listen for new AI messages
    socketInstance.on("receive_ai_message", (messageData) => {
      if (messageData.msgtype === "ai_analysis") {
        fetchAIAnalyses();
        fetchScheduledClasses();
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.off("ai_analysis_status_update");
        socketInstance.off("receive_ai_message");
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(clickTimeoutRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, []);

  const fetchScheduledClasses = async () => {
    setLoading(true);
    try {
      const response = await ep3.get("/monitorscheduledclasses", {
        params: {
          colid: global1.colid,
          user: global1.userEmail,
        },
      });

      if (response.data.success) {
        setScheduledClasses(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch scheduled classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnalyses = async () => {
    try {
      const response = await ep3.get("/getaivideoanalysisbyuser", {
        params: {
          colid: global1.colid,
          user: global1.userEmail,
        },
      });

      if (response.data.success) {
        setAnalyses(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch AI analyses:", error);
    }
  };

  // ✅ ENHANCED: Updated trigger function with real-time socket joining
  const triggerAIAnalysis = async (classItem) => {
    const classId = classItem._id;

    if (processing[classId]) {
      return;
    }

    if (clickedButtons.has(classId)) {
      return;
    }

    const existingAnalysis = analyses.find(
      (a) =>
        a.classid === classId &&
        ["searching", "analyzing", "generating"].includes(a.status)
    );

    if (existingAnalysis) {
      alert(
        `⚠️ AI analysis is already in progress for "${classItem.topic}".\n\nStatus: ${existingAnalysis.status}\n\nPlease wait for it to complete or check the AI Chat room for updates.`
      );
      return;
    }

    setClickedButtons((prev) => new Set([...prev, classId]));
    setProcessing((prev) => ({ ...prev, [classId]: true }));

    try {
      const response = await ep3.post("/processaivideoanalysis", {
        classid: classId,
        user: global1.userEmail,
        colid: global1.colid,
      });

      if (response.data.success) {
        // ✅ NEW: Join the AI chat room for real-time updates
        if (socket) {
          const chatRoomId = `ai-chat-${classItem.coursecode
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")}`;
          socket.emit("join_ai_chat", {
            chatRoomId,
            userRole: global1.userRole,
            user: global1.userEmail,
            userName: global1.userName,
            colid: global1.colid,
          });
        }

        alert(
          `🤖 AI analysis started for "${classItem.topic}"!\n\n✅ Analysis ID: ${response.data.data.analysisId}\n\n📱 Real-time updates will appear automatically - no need to refresh!`
        );

        fetchAIAnalyses();
        fetchScheduledClasses();
      } else {
        throw new Error(response.data.message || "Failed to start analysis");
      }
    } catch (error) {
      let errorMsg = "Failed to start AI analysis";

      if (error.response?.status === 400) {
        errorMsg = "Invalid request. Please check your class configuration.";
      } else if (error.response?.status === 404) {
        errorMsg =
          "API keys not configured. Please set up your Gemini and YouTube API keys first.";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      alert(
        `❌ Error: ${errorMsg}\n\n🔧 Troubleshooting:\n• Make sure your API keys are configured correctly\n• Check that the class has a defined topic\n• Ensure students are enrolled in the course\n• Try refreshing the page and retry`
      );
    } finally {
      setProcessing((prev) => ({ ...prev, [classId]: false }));

      clickTimeoutRef.current[classId] = setTimeout(() => {
        setClickedButtons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(classId);
          return newSet;
        });
        delete clickTimeoutRef.current[classId];
      }, 3000);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (!window.confirm("Are you sure you want to delete this AI analysis?"))
      return;

    try {
      const response = await ep3.delete(
        `/deleteaivideoanalysis/${analysisId}`,
        {
          params: {
            colid: global1.colid,
            user: global1.userEmail,
          },
        }
      );

      if (response.data.success) {
        fetchAIAnalyses();
      }
    } catch (error) {
      alert("Failed to delete analysis");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "analyzing":
        return "warning";
      case "searching":
        return "info";
      case "generating":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "analyzing":
        return "🔍";
      case "searching":
        return "🔎";
      case "generating":
        return "⚙️";
      default:
        return "⏳";
    }
  };

  const isButtonDisabled = (classId) => {
    if (processing[classId]) return true;
    if (clickedButtons.has(classId)) return true;

    const inProgressAnalysis = analyses.find(
      (a) =>
        a.classid === classId &&
        ["searching", "analyzing", "generating"].includes(a.status)
    );
    if (inProgressAnalysis) return true;

    return false;
  };

  const getButtonText = (classId) => {
    if (processing[classId]) return "Starting...";
    if (clickedButtons.has(classId)) return "Please wait...";

    const inProgressAnalysis = analyses.find(
      (a) =>
        a.classid === classId &&
        ["searching", "analyzing", "generating"].includes(a.status)
    );

    if (inProgressAnalysis) {
      switch (inProgressAnalysis.status) {
        case "searching":
          return "Searching Videos...";
        case "analyzing":
          return "Analyzing...";
        case "generating":
          return "Generating...";
        default:
          return "Processing...";
      }
    }

    return "Start AI Analysis";
  };

  if (!permissions.canTriggerAI) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">🔒 Faculty Access Required</Typography>
          <Typography>
            AI Video Analysis is available for Faculty members only. Students
            can view AI-generated content in course chat rooms.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2 }}
        >
          <SmartToy sx={{ color: "#7c3aed", fontSize: 40 }} />
          AI Video Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Automatically search YouTube for educational videos, analyze them with
          AI, and create dynamic assignments
        </Typography>
      </Box>

      {/* Enhanced Info Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> AI searches YouTube for educational
          videos based on your class topics, analyzes them with Gemini AI,
          generates dynamic assignments, and posts everything in your course's
          AI Chat room.
          <br />
          <br />
          <strong>✨ New Features:</strong>
          <br />• <strong>Dynamic Assignments:</strong> Each assignment is
          uniquely generated by AI based on video content
          <br />• <strong>Whole Day Analysis:</strong> AI analysis available
          throughout the entire scheduled day
          <br />• <strong>Real-Time Updates:</strong> Status updates appear
          automatically without refreshing
          <br />• <strong>Enhanced Discussion:</strong> AI provides detailed
          topic discussions along with summaries
        </Typography>
      </Alert>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f8fafc" }}>
            <Typography variant="h3" color="#7c3aed">
              {scheduledClasses.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Classes Ready
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f0f9f0" }}>
            <Typography variant="h3" color="#16a34a">
              {analyses.filter((a) => a.status === "completed").length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fef3c7" }}>
            <Typography variant="h3" color="#d97706">
              {
                analyses.filter((a) =>
                  ["searching", "analyzing", "generating"].includes(a.status)
                ).length
              }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Processing
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Scheduled Classes Ready for AI Analysis */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Schedule />
              Classes Ready for AI Analysis
            </Typography>
            <Tooltip title="Refresh list">
              <IconButton onClick={fetchScheduledClasses} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : scheduledClasses.length === 0 ? (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>No classes found.</strong> Create scheduled classes with
                topics to enable AI analysis. Classes need to have enrolled
                students and a defined topic.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {scheduledClasses.map((classItem) => {
                const classId = classItem._id;
                const buttonDisabled = isButtonDisabled(classId);
                const buttonText = getButtonText(classId);

                return (
                  <Grid item xs={12} md={6} lg={4} key={classId}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {classItem.course}
                        </Typography>
                        <Typography
                          color="primary"
                          variant="body2"
                          gutterBottom
                        >
                          📚 Topic: {classItem.topic}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="body2"
                          gutterBottom
                        >
                          📅{" "}
                          {new Date(classItem.classdate).toLocaleDateString()}{" "}
                          at {classItem.classtime || "TBD"}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="body2"
                          gutterBottom
                        >
                          🏷️ {classItem.coursecode} • Section{" "}
                          {classItem.section || "All"}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            sx={{
                              backgroundColor: buttonDisabled
                                ? "#9ca3af"
                                : "#7c3aed",
                              "&:hover": {
                                backgroundColor: buttonDisabled
                                  ? "#9ca3af"
                                  : "#6d28d9",
                              },
                              "&:disabled": {
                                backgroundColor: "#9ca3af",
                                color: "#ffffff",
                              },
                            }}
                            disabled={buttonDisabled}
                            onClick={() => triggerAIAnalysis(classItem)}
                            startIcon={
                              buttonDisabled ? (
                                <CircularProgress
                                  size={16}
                                  sx={{ color: "white" }}
                                />
                              ) : (
                                <SmartToy />
                              )
                            }
                          >
                            {buttonText}
                          </Button>

                          {(() => {
                            const currentAnalysis = analyses.find(
                              (a) =>
                                a.classid === classId &&
                                [
                                  "searching",
                                  "analyzing",
                                  "generating",
                                ].includes(a.status)
                            );

                            if (currentAnalysis) {
                              return (
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    label={`${getStatusIcon(
                                      currentAnalysis.status
                                    )} ${currentAnalysis.status}`}
                                    color={getStatusColor(
                                      currentAnalysis.status
                                    )}
                                    size="small"
                                    sx={{ fontSize: "0.7rem" }}
                                  />
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 0.5, color: "#6b7280" }}
                                  >
                                    ✨ Real-time updates active
                                  </Typography>
                                </Box>
                              );
                            }
                            return null;
                          })()}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis History */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUp />
              AI Analysis History
            </Typography>
            <Button
              onClick={fetchAIAnalyses}
              startIcon={<Refresh />}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {analyses.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>No analyses yet.</strong> Start an AI analysis above to
                see results here.
              </Typography>
            </Alert>
          ) : (
            <List>
              {analyses.map((analysis) => (
                <React.Fragment key={analysis._id}>
                  <ListItem sx={{ alignItems: "flex-start", px: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getStatusIcon(analysis.status)} {analysis.topic}
                          </Typography>
                          <Chip
                            label={analysis.status}
                            color={getStatusColor(analysis.status)}
                            size="small"
                          />
                          {analysis.assignmentData?.assignmentTitle && (
                            <Chip
                              label="Dynamic Assignment"
                              color="secondary"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            paragraph
                          >
                            Course: {analysis.coursecode} •{" "}
                            {new Date(analysis.createdAt).toLocaleDateString()}
                            {analysis.assignmentData?.assignmentTitle && (
                              <span
                                style={{ color: "#7c3aed", fontWeight: "bold" }}
                              >
                                <br />
                                📋 Assignment:{" "}
                                {analysis.assignmentData.assignmentTitle}
                              </span>
                            )}
                          </Typography>

                          {analysis.status === "completed" && (
                            <Box
                              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                            >
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedAnalysis(analysis);
                                  setOpenDetails(true);
                                }}
                                startIcon={<Visibility />}
                              >
                                View Details
                              </Button>

                              {analysis.selectedVideoUrl && (
                                <Button
                                  size="small"
                                  component={Link}
                                  href={analysis.selectedVideoUrl}
                                  target="_blank"
                                  rel="noopener"
                                  startIcon={<PlayArrow />}
                                >
                                  Watch Video
                                </Button>
                              )}

                              <Button
                                size="small"
                                color="error"
                                onClick={() => deleteAnalysis(analysis._id)}
                                startIcon={<Delete />}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}

                          {analysis.status === "failed" && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                Analysis failed. Please check your API keys and
                                try again.
                              </Typography>
                            </Alert>
                          )}

                          {["searching", "analyzing", "generating"].includes(
                            analysis.status
                          ) && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress />
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  ✨ Real-time updates active - status will update
                                  automatically
                                </Typography>
                              </Box>
                            )}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Analysis Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" component="div">
            🤖 Dynamic AI Analysis: {selectedAnalysis?.topic}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedAnalysis?.coursecode} •{" "}
            {selectedAnalysis?.createdAt &&
              new Date(selectedAnalysis.createdAt).toLocaleString()}
          </Typography>
        </DialogTitle>
        // In the Dialog content section, add voice controls:
        <DialogContent>
          {selectedAnalysis && (
            <Box sx={{ pt: 1 }}>
              {/* ✅ NEW: Voice Control Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  p: 2,
                  backgroundColor: "#f8fafc",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" sx={{ color: "#7c3aed" }}>
                  🔊 Voice Assistance Available
                </Typography>
                <TextToSpeech
                  text={`Complete AI Analysis for ${selectedAnalysis.topic}. ${selectedAnalysis.aiSummary
                    } ${selectedAnalysis.assignmentData?.description || ""}`}
                  title="Listen to complete analysis details"
                  variant="button"
                  size="medium"
                />
              </Box>

              {/* Video Information with Voice */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <VideoLibrary />
                  Found Video
                </Typography>
                <TextToSpeech
                  text={`Video found: ${selectedAnalysis.selectedVideoTitle}`}
                  variant="chip"
                  size="small"
                />
              </Box>

              <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{selectedAnalysis.selectedVideoTitle}</strong>
                </Typography>
                <Link
                  href={selectedAnalysis.selectedVideoUrl}
                  target="_blank"
                  rel="noopener"
                >
                  {selectedAnalysis.selectedVideoUrl}
                </Link>
                {selectedAnalysis.relevanceScore && (
                  <Chip
                    label={`${(selectedAnalysis.relevanceScore * 100).toFixed(
                      1
                    )}% Relevant`}
                    color="success"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Paper>

              {/* AI Summary with Voice */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">📝 AI Summary</Typography>
                <TextToSpeech
                  text={`AI Summary: ${selectedAnalysis.aiSummary}`}
                  variant="chip"
                  size="small"
                />
              </Box>
              <Paper sx={{ p: 2, mb: 3, bgcolor: "#f0f9f0" }}>
                <Typography variant="body2">
                  {selectedAnalysis.aiSummary}
                </Typography>
              </Paper>

              {/* Discussion with Voice */}
              {selectedAnalysis.assignmentData?.videoAnalysis?.discussion && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">💬 AI Discussion</Typography>
                    <TextToSpeech
                      text={`Discussion: ${selectedAnalysis.assignmentData.videoAnalysis.discussion}`}
                      variant="chip"
                      size="small"
                    />
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: "#fef7ff",
                      border: "1px solid #e4c2ff",
                    }}
                  >
                    <Typography variant="body2">
                      {selectedAnalysis.assignmentData.videoAnalysis.discussion}
                    </Typography>
                  </Paper>
                </>
              )}

              {/* Learning Objectives with Voice */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">🎯 Learning Objectives</Typography>
                <TextToSpeech
                  text={`Learning Objectives: ${selectedAnalysis.learningObjectives?.join(". ") || ""
                    }`}
                  variant="chip"
                  size="small"
                />
              </Box>
              <Paper sx={{ p: 2, mb: 3 }}>
                <List dense>
                  {selectedAnalysis.learningObjectives?.map((obj, index) => (
                    <ListItem
                      key={index}
                      sx={{ pl: 0, display: "flex", alignItems: "center" }}
                    >
                      <ListItemText primary={`• ${obj}`} sx={{ flex: 1 }} />
                      <TextToSpeech
                        text={`Learning objective: ${obj}`}
                        variant="icon"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Assignment with Voice */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Assignment />
                  AI-Generated Dynamic Assignment
                </Typography>
                <TextToSpeech
                  text={`Assignment: ${selectedAnalysis.assignmentData?.assignmentTitle}. ${selectedAnalysis.assignmentData?.description}`}
                  variant="chip"
                  size="small"
                />
              </Box>

              <Paper sx={{ p: 2, bgcolor: "#fef3c7", mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>
                    {selectedAnalysis.assignmentData?.assignmentTitle ||
                      "Assignment Title"}
                  </strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedAnalysis.assignmentData?.description ||
                    "Assignment description"}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                  <Chip
                    label="🤖 AI Generated"
                    size="small"
                    color="secondary"
                  />
                  <Chip
                    label="🔊 Voice Available"
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label="✨ Dynamic Content"
                    size="small"
                    color="success"
                  />
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
          {selectedAnalysis?.selectedVideoUrl && (
            <Button
              component={Link}
              href={selectedAnalysis.selectedVideoUrl}
              target="_blank"
              rel="noopener"
              startIcon={<PlayArrow />}
            >
              Watch Video
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIVideoAnalysisInterface;
