import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  Link,
  Alert,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Send,
  SmartToy,
  Person,
  VideoLibrary,
  Assignment,
  Refresh,
  PlayArrow,
  OpenInNew,
  VolumeUp, Pause, Stop, VolumeOff
} from "@mui/icons-material";
import socketInstance from "../../api/ep2";
import ep3 from "../../api/ep3";
import global1 from "../../pages/global1";
import TextToSpeech from '../TextToSpeech';

// ✅ FIXED: Simple, stable room generation using only coursecode
const generateAIChatRoom = (coursecode) => {
  if (!coursecode || typeof coursecode !== "string") {
    throw new Error("Invalid coursecode provided");
  }
  const safeCourseCode = coursecode.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `ai-chat-${safeCourseCode}`;
};

const AIChatInterface = ({ course }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const messagesEndRef = useRef(null);

  // ✅ FIXED: Use only coursecode for room generation
  const chatRoomId = course?.coursecode
    ? generateAIChatRoom(course.coursecode)
    : null;

  const isFaculty = global1.userRole?.toUpperCase() === "FACULTY";
  const isStudent = global1.userRole?.toUpperCase() === "STUDENT";
  const canSendMessages = isFaculty;

  // Enhanced debugging
  useEffect(() => {
    const debug = {
      course: course,
      coursecode: course?.coursecode,
      chatRoomId: chatRoomId,
      userRole: global1.userRole,
      userEmail: global1.userEmail,
    };
  }, [course, chatRoomId]);

  useEffect(() => {
    if (!course?.coursecode || !chatRoomId) {
      console.error("❌ Missing coursecode:", {
        coursecode: course?.coursecode,
        chatRoomId: chatRoomId,
      });
      return;
    }

    // Use centralized socket
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    setSocket(socketInstance);

    // Join with coursecode-based room ID
    const joinData = {
      chatRoomId,
      userRole: global1.userRole,
      user: global1.userEmail,
      userName: global1.userName,
      colid: global1.colid,
    };
    socketInstance.emit("join_ai_chat", joinData);

    // ✅ Enhanced message listeners
    socketInstance.on("receive_ai_message", (messageData) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) =>
            msg.timestamp === messageData.timestamp &&
            msg.sender === messageData.sender &&
            msg.message === messageData.message
        );

        if (isDuplicate) return prev;
        return [...prev, messageData];
      });
      scrollToBottom();
    });

    socketInstance.on("ai_content_ready", (analysisData) => {
      setTimeout(fetchMessages, 1000);
    });

    socketInstance.on("ai_error", (errorData) => {
      console.error("🔴 AI Error event received:", errorData);
      const errorMessage = {
        sender: "ai@system.com",
        sendername: "AI Assistant",
        role: "ai",
        message: `❌ **AI Error**: ${errorData.error || "Unknown error occurred"
          }`,
        msgtype: "ai_error",
        timestamp: new Date(),
        room: chatRoomId,
      };
      setMessages((prev) => [...prev, errorMessage]);
      scrollToBottom();
    });

    fetchMessages();

    return () => {
      if (socketInstance) {
        socketInstance.emit("leave_ai_chat", {
          chatRoomId,
          userRole: global1.userRole,
          userName: global1.userName,
        });
        // We don't close the global socket here
        socketInstance.off("receive_ai_message");
        socketInstance.off("ai_content_ready");
        socketInstance.off("ai_error");
      }
    };
  }, [chatRoomId]);

  const fetchMessages = async () => {
    if (!chatRoomId) return;

    setLoading(true);
    try {
      const response = await ep3.get(
        `/getaichatmessagesadvance/${encodeURIComponent(chatRoomId)}`,
        {
          params: {
            colid: global1.colid,
            coursecode: course.coursecode,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !canSendMessages || !socket || !chatRoomId)
      return;

    const messageData = {
      room: chatRoomId,
      sender: global1.userEmail,
      sendername: global1.userName,
      role: "Faculty",
      message: newMessage.trim(),
      msgtype: "text",
      colid: global1.colid,
      course: course.coursename || course.course,
      coursecode: course.coursecode,
      timestamp: new Date(),
    };

    try {
      await ep3.post("/savemessageadvance", messageData);
      socket.emit("send_ai_message", {
        ...messageData,
        chatRoomId,
        senderRole: "Faculty",
      });
      setNewMessage("");
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced message formatting (same as before)
  // Update the formatMessage function to include voice assistance:
  const formatMessage = (message) => {
    if (message.msgtype === 'ai_analysis') {
      const lines = message.message.split('\n').filter(line => line.trim());

      return (
        <Card variant="outlined" sx={{ mt: 1, bgcolor: '#f8fafc', border: '1px solid #e0e7ff' }}>
          <CardContent sx={{ p: 3 }}>
            {/* ✅ NEW: Voice Assistance Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 'bold' }}>
                🤖 AI Analysis Complete
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextToSpeech
                  text={message.message}
                  title="Listen to complete AI analysis"
                  variant="icon"
                  size="medium"
                />
                <Chip
                  label="🔊 Voice Available"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {lines.map((line, index) => {
              const trimmedLine = line.trim();

              // Topic section
              if (trimmedLine.includes('**Topic**:')) {
                const topic = trimmedLine.replace(/.*\*\*Topic\*\*:\s*/, '');
                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#7c3aed', fontWeight: 'bold', mb: 1 }}>
                      📚 Topic: {topic}
                    </Typography>
                    <Box sx={{ display: 'flex', justify: 'flex-end', mb: 1 }}>
                      <TextToSpeech
                        text={`Topic: ${topic}`}
                        variant="chip"
                        size="small"
                      />
                    </Box>
                  </Box>
                );
              }

              // Video section
              if (trimmedLine.includes('**Video Found**:')) {
                const videoTitle = trimmedLine.replace(/.*\*\*Video Found\*\*:\s*/, '');
                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#059669', fontWeight: 'bold', mb: 1 }}>
                      🎥 Video: {videoTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', justify: 'flex-end', mb: 1 }}>
                      <TextToSpeech
                        text={`Educational video found: ${videoTitle}`}
                        variant="chip"
                        size="small"
                      />
                    </Box>
                  </Box>
                );
              }

              // Summary section
              if (trimmedLine.includes('**Summary**:')) {
                return (
                  <Box key={index} sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                      📝 AI Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>
                );
              }

              // Summary content (appears after Summary header)
              if (index > 0 && lines[index - 1].includes('**Summary**:') && !trimmedLine.includes('**')) {
                return (
                  <Paper key={index} sx={{ p: 2, mb: 3, bgcolor: '#f0f9f0', border: '1px solid #c3e6cb' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#374151', flex: 1 }}>
                        {trimmedLine}
                      </Typography>
                      <TextToSpeech
                        text={`Summary: ${trimmedLine}`}
                        variant="icon"
                        size="small"
                      />
                    </Box>
                  </Paper>
                );
              }

              // Discussion section
              if (trimmedLine.includes('**Discussion**:')) {
                return (
                  <Box key={index} sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                      💬 Discussion
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>
                );
              }

              // Discussion content
              if (index > 0 && lines[index - 1].includes('**Discussion**:') && !trimmedLine.includes('**')) {
                return (
                  <Paper key={index} sx={{ p: 2, mb: 3, bgcolor: '#fef7ff', border: '1px solid #e4c2ff' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#374151', flex: 1 }}>
                        {trimmedLine}
                      </Typography>
                      <TextToSpeech
                        text={`Discussion: ${trimmedLine}`}
                        variant="icon"
                        size="small"
                      />
                    </Box>
                  </Paper>
                );
              }

              // Learning Objectives section
              if (trimmedLine.includes('**Learning Objectives**:')) {
                return (
                  <Box key={index} sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      🎯 Learning Objectives
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>
                );
              }

              // Learning objectives content (bullet points)
              if (trimmedLine.startsWith('•') && index > 0 &&
                lines.slice(Math.max(0, index - 5), index).some(l => l.includes('**Learning Objectives**:'))) {
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ pl: 2, py: 0.25, color: '#4b5563', flex: 1 }}>
                      {trimmedLine}
                    </Typography>
                    <TextToSpeech
                      text={trimmedLine.replace('•', 'Learning objective:')}
                      variant="icon"
                      size="small"
                    />
                  </Box>
                );
              }

              // Assignment section
              if (trimmedLine.includes('**Dynamic Assignment Created**:')) {
                const assignment = trimmedLine.replace(/.*\*\*Dynamic Assignment Created\*\*:\s*/, '');
                return (
                  <Box key={index} sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#dc2626', fontWeight: 'bold' }}>
                      📋 Assignment: {assignment}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<Assignment />}
                        label="AI Generated"
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <TextToSpeech
                        text={`Assignment created: ${assignment}`}
                        variant="chip"
                        size="small"
                      />
                    </Box>
                  </Box>
                );
              }

              // Video Link
              if (trimmedLine.includes('**Link**:')) {
                const link = trimmedLine.replace(/.*\*\*Link\*\*:\s*/, '');
                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Button
                      component={Link}
                      href={link}
                      target="_blank"
                      rel="noopener"
                      startIcon={<PlayArrow />}
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#dc2626',
                        '&:hover': { backgroundColor: '#b91c1c' },
                        mr: 1
                      }}
                    >
                      Watch Video
                    </Button>
                    <TextToSpeech
                      text={`Video link available: ${link}`}
                      variant="chip"
                      size="small"
                    />
                  </Box>
                );
              }

              // Default content handling
              if (trimmedLine && !trimmedLine.includes('**')) {
                return (
                  <Typography key={index} variant="body2" sx={{ py: 0.25, color: '#374151' }}>
                    {trimmedLine}
                  </Typography>
                );
              }

              return null;
            })}

            {/* ✅ NEW: Complete Analysis Voice Control */}
            <Box sx={{
              mt: 4,
              p: 2,
              backgroundColor: '#f8fafc',
              border: '2px dashed #e0e7ff',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <VolumeUp sx={{ color: '#7c3aed' }} />
                <Typography variant="subtitle2" sx={{ color: '#7c3aed', fontWeight: 'bold' }}>
                  Listen to Complete Analysis
                </Typography>
                <TextToSpeech
                  text={message.message}
                  title="Listen to complete AI analysis with all sections"
                  variant="button"
                  size="large"
                />
              </Box>
              <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1, color: '#6b7280' }}>
                🎧 Available for both Faculty and Students • High-quality speech synthesis
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Handle error messages
    if (message.msgtype === 'ai_error') {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {message.message}
            </Typography>
            <TextToSpeech
              text={`Error: ${message.message}`}
              variant="icon"
              size="small"
            />
          </Box>
        </Alert>
      );
    }

    // Handle regular text messages
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Typography variant="body2" sx={{ py: 1, flex: 1 }}>
          {message.message}
        </Typography>
        <TextToSpeech
          text={message.message}
          variant="icon"
          size="small"
        />
      </Box>
    );
  };

  // Connection status
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "success";
      case "error":
        return "error";
      default:
        return "warning";
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "🟢 Connected";
      case "error":
        return "🔴 Error";
      default:
        return "🟡 Connecting...";
    }
  };

  // ✅ FIXED: Better error handling - only check coursecode now
  if (!chatRoomId || !course?.coursecode) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">⚠️ Course Code Missing</Typography>
          <Typography>
            Cannot generate AI chat room without course code.
          </Typography>
        </Alert>

        <Card sx={{ p: 2, bgcolor: "#f9fafb" }}>
          <Typography variant="h6" gutterBottom>
            🔧 Debug Information:
          </Typography>
          <pre style={{ fontSize: "0.8rem" }}>
            {JSON.stringify(
              {
                coursecode: course?.coursecode,
                chatRoomId: chatRoomId,
                courseAvailable: !!course,
              },
              null,
              2
            )}
          </pre>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "75vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SmartToy sx={{ color: "#7c3aed" }} />
              AI Assistant - {course.coursename || course.course}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isFaculty
                ? "💬 Chat with AI about video analyses and assignments."
                : "👀 View AI-generated educational content and faculty discussions."}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Room: {chatRoomId}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={getConnectionText()}
              color={getConnectionColor()}
              size="small"
            />
            <Tooltip title="Refresh messages">
              <IconButton onClick={fetchMessages} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        {loading && messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading messages...</Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <SmartToy sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No AI Content Yet
            </Typography>
            <Typography color="textSecondary">
              {isFaculty
                ? "Start an AI video analysis to see content here."
                : "Your instructor hasn't started any AI analyses yet."}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ alignItems: "flex-start", px: 1, py: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: message.role === "ai" ? "#7c3aed" : "#00695C",
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {message.role === "ai" ? <SmartToy /> : <Person />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {message.sendername}
                      </Typography>
                      {message.role === "ai" && (
                        <Chip
                          label="AI"
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 20,
                            bgcolor: "#7c3aed",
                            color: "white",
                          }}
                        />
                      )}
                      <Typography variant="caption" color="textSecondary">
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    {formatMessage(message)}
                  </Box>
                </ListItem>
                {index < messages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input (Faculty only) */}
      {canSendMessages && (
        <Paper sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Alert severity="info" sx={{ mb: 2, py: 1 }}>
            <Typography variant="body2">
              💡 Ask the AI about educational content or discuss analyses.
            </Typography>
          </Alert>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask the AI assistant..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              multiline
              maxRows={3}
              disabled={connectionStatus !== "connected"}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!newMessage.trim() || connectionStatus !== "connected"}
              sx={{
                bgcolor: "#7c3aed",
                color: "white",
                "&:hover": { bgcolor: "#6d28d9" },
                "&.Mui-disabled": { bgcolor: "#e0e0e0" },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Student footer */}
      {isStudent && (
        <Paper
          sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e0e0e0" }}
        >
          <Typography variant="body2" color="textSecondary" textAlign="center">
            👀 <strong>Student View:</strong> You can view AI content. Only
            instructors can chat with AI.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AIChatInterface;
