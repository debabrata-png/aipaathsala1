// components/MessageSection.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { Send, ArrowBack } from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const MessageSection = ({ socket, roomId, course, onExit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  // ✅ DEBUGGING: Add comprehensive logging
  useEffect(() => {
    console.log('🔧 MessageSection initialized with:', {
      roomId,
      course: course?.coursecode,
      socket: !!socket,
      socketConnected: socket?.connected
    });
  }, [roomId, course, socket]);

  // Load existing messages
  useEffect(() => {
    const run = async () => {
      if (!roomId || !course) {
        console.log('⚠️ Missing roomId or course, skipping message load');
        return;
      }
      
      setLoading(true);
      setError("");
      
      try {
        console.log('📥 Loading messages for room:', roomId);
        const response = await ep3.get(`/getmessagesbyroom/${roomId}`, {
          params: { colid: global1.colid, coursecode: course.coursecode },
        });
        
        if (response.data.success) {
          const sorted = (response.data.data || []).sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          console.log('✅ Loaded messages:', sorted.length);
          setMessages(sorted);
        } else {
          console.error('❌ Failed to load messages:', response.data);
          setError("Failed to load messages");
        }
      } catch (err) {
        console.error('💥 Error loading messages:', err);
        setError("Error loading messages");
      } finally {
        setLoading(false);
      }
    };
    
    run();
  }, [roomId, course?.coursecode]);

  // Socket room join + listeners
  useEffect(() => {
    if (!socket || !roomId) {
      console.log('⚠️ Missing socket or roomId for socket setup');
      return;
    }

    console.log('🔌 Setting up socket for room:', roomId);

    const onReceive = (data) => {
      console.log('📨 Received message:', data);
      
      if (data.room !== roomId || data.coursecode !== course?.coursecode) {
        console.log('🚫 Message not for this room/course, ignoring');
        return;
      }

      setMessages((prev) => {
        const dup = prev.find(
          (m) =>
            m._id === data._id ||
            (m.sender === data.sender &&
              m.message === data.message &&
              Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2500)
        );
        
        if (dup) {
          console.log('🔄 Duplicate message detected, ignoring');
          return prev;
        }

        console.log('✅ Adding new message to list');
        const arr = [...prev, data];
        arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return arr;
      });
    };

    // Join room and set up listeners
    socket.emit("join_room", { 
      room: roomId,
      userEmail: global1.userEmail,
      userName: global1.userName,
      userRole: global1.userRole
    });
    socket.on("receive_message", onReceive);

    console.log('✅ Socket setup complete for room:', roomId);

    return () => {
      console.log('🚪 Cleaning up socket for room:', roomId);
      socket.off("receive_message", onReceive);
      socket.emit("leave_room", { 
        room: roomId,
        userName: global1.userName
      });
    };
  }, [socket, roomId, course?.coursecode]);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    
    if (!text || !course) {
      console.log('⚠️ Missing message text or course');
      return;
    }

    const messageData = {
      room: roomId,
      sender: global1.userEmail,
      sendername: global1.userName,
      role: global1.userRole,
      message: text,
      msgtype: "text",
      colid: global1.colid,
      course: course.coursename || course.coursecode || course.course,
      coursecode: course.coursecode,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message:', messageData);

    try {
      const response = await ep3.post("/savemessage", messageData);
      
      if (response.data.success) {
        messageData._id = response.data.data._id;
        console.log('💾 Message saved, emitting to socket');
        
        // Add to local messages immediately
        setMessages((prev) => [...prev, messageData]);
        
        // Emit to socket
        if (socket?.connected) {
          socket.emit("send_message", messageData);
          console.log('📡 Message emitted to socket');
        } else {
          console.error('🔌 Socket not connected, message not sent to others');
        }
        
        setNewMessage("");
        setError("");
      } else {
        console.error('❌ Failed to save message:', response.data);
        setError("Failed to send message");
      }
    } catch (err) {
      console.error('💥 Error sending message:', err);
      setError("Failed to send message");
    }
  };

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const isMine = (m) => m.sender === global1.userEmail;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0, boxShadow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {onExit && (
            <Button
              startIcon={<ArrowBack />}
              onClick={onExit}
              sx={{ textTransform: "none" }}
            >
              Back
            </Button>
          )}
          <Typography variant="h6">
            Room Discussion • {course?.coursecode}{" "}
            ({messages.length} {messages.length === 1 ? "message" : "messages"})
          </Typography>
        </Stack>
      </Paper>

      {/* Message list */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {error && (
          <Alert onClose={() => setError("")} severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((m) => {
              const mine = isMine(m);
              return (
                <ListItem
                  key={m._id || `${m.sender}-${m.timestamp}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: mine ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  {/* Sender line (only for others) */}
                  {!mine && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {m.sendername?.charAt(0)?.toUpperCase() || "?"}
                      </Avatar>
                      <Typography variant="caption" color="textSecondary">
                        {m.sendername} ({m.role})
                      </Typography>
                    </Stack>
                  )}

                  {/* Bubble */}
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: "70%",
                      bgcolor: mine ? "#1976d2" : "#f5f5f5",
                      color: mine ? "white" : "inherit",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{m.message}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ 
                        display: "block", 
                        mt: 0.5,
                        opacity: 0.8,
                        textAlign: "right"
                      }}
                    >
                      {formatTime(m.timestamp)}
                    </Typography>
                  </Paper>
                </ListItem>
              );
            })}
            <div ref={endRef} />
          </List>
        )}
      </Box>

      {/* Composer (sticky) */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <form onSubmit={sendMessage}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#f8fafc",
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <IconButton 
              type="submit" 
              color="primary"
              disabled={!newMessage.trim()}
              sx={{ 
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" }
              }}
            >
              <Send />
            </IconButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default MessageSection;
