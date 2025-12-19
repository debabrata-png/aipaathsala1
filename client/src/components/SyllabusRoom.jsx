// components/SyllabusRoom.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Link as LinkIcon,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const SyllabusRoom = ({ course, socket, roomId }) => {
  const [syllabusItems, setSyllabusItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    module: "",
    description: "",
    credits: "",
    courselink: "",
  });

  const permissions = (() => {
    const ru = global1.userRole?.toUpperCase();
    return {
      isFaculty: ru === "FACULTY",
      isStudent: ru === "STUDENT",
      canCreate: ru === "FACULTY",
      canMarkComplete: ru === "FACULTY",
      canView: ru === "FACULTY" || ru === "STUDENT",
    };
  })();

  useEffect(() => {
    if (permissions.canView && course) fetchSyllabus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.coursecode, permissions.canView]);

  useEffect(() => {
    if (!socket || !course) return;
    const onSyll = () => fetchSyllabus();
    const onComp = () => fetchSyllabus();
    socket.on("syllabus_changed", onSyll);
    socket.on("module_completed", onComp);
    return () => {
      socket.off("syllabus_changed", onSyll);
      socket.off("module_completed", onComp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, course?.coursecode]);

  const fetchSyllabus = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const r = await ep3.get("/getsyllabusbycourse", {
        params: { coursecode: course.coursecode, colid: global1.colid },
      });
      if (r.data.success) setSyllabusItems(r.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!permissions.canCreate) return alert("Only Faculty can create modules");
    if (!formData.module || !formData.description || !formData.credits) {
      return alert("Please fill required fields");
    }
    try {
      const r = await ep3.post("/createsyllabus", {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        year: course.year,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        ...formData,
      });
      if (r.data.success) {
        setOpen(false);
        setFormData({
          module: "",
          description: "",
          credits: "",
          courselink: "",
        });
        fetchSyllabus();
        if (socket)
          socket.emit("syllabus_updated", {
            room: roomId,
            action: "created",
            data: r.data.data,
          });
      }
    } catch {
      alert("Failed to create syllabus module");
    }
  };

  const handleCompleteToggle = async (syllabusId, currentStatus) => {
    if (!permissions.canMarkComplete)
      return alert("Only Faculty can mark modules as complete");
    try {
      const newStatus = currentStatus === "yes" ? "no" : "yes";
      const r = await ep3.put(`/marksyllabuscomplete/${syllabusId}`, {
        completed: newStatus,
      });
      if (r.data.success) {
        fetchSyllabus();
        if (socket)
          socket.emit("syllabus_completed", {
            room: roomId,
            syllabusId,
            completed: newStatus,
          });
      }
    } catch {
      alert("Failed to update module status");
    }
  };

  if (!permissions.canView) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Alert severity="warning">
          You do not have permission to view this syllabus content.
        </Alert>
      </Paper>
    );
  }

  const completedCount = syllabusItems.filter(
    (i) => i.completed === "yes"
  ).length;
  const progressPercentage = syllabusItems.length
    ? (completedCount / syllabusItems.length) * 100
    : 0;

  return (
    <Box>
      {/* Progress Header */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          mb: 2,
          bgcolor: "#ecfdf5",
          border: "1px solid #d1fae5",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Course Progress
        </Typography>
        <Box
          sx={{
            height: 8,
            bgcolor: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: `${progressPercentage}%`,
              height: "100%",
              bgcolor: "#10b981",
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: "#065f46" }}>
          {completedCount}/{syllabusItems.length}
        </Typography>
      </Paper>

      {permissions.canCreate && (
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          sx={{
            mb: 2,
            backgroundColor: "#16a34a",
            "&:hover": { backgroundColor: "#15803d" },
            textTransform: "none",
            borderRadius: 2,
          }}
          startIcon={<Add />}
        >
          Add Module
        </Button>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        {permissions.isFaculty
          ? "As Faculty, you can create modules and mark them as complete."
          : "As a Student, you can view syllabus modules and their completion status."}
      </Alert>

      {loading ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : syllabusItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
          <Typography sx={{ color: "text.secondary" }}>
            {permissions.isFaculty
              ? "No modules created yet"
              : "No syllabus modules available"}
          </Typography>
        </Paper>
      ) : (
        <List>
          {syllabusItems.map((item) => (
            <ListItem key={item._id} sx={{ display: "block", mb: 1 }}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    disabled={!permissions.canMarkComplete}
                    sx={{ p: 0.5 }}
                    onClick={() =>
                      permissions.canMarkComplete &&
                      handleCompleteToggle(item._id, item.completed)
                    }
                    title={
                      permissions.canMarkComplete
                        ? "Toggle completion"
                        : "Only Faculty can mark completion"
                    }
                  >
                    {item.completed === "yes" ? (
                      <CheckCircle sx={{ color: "#16a34a" }} />
                    ) : (
                      <RadioButtonUnchecked />
                    )}
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, flex: 1 }}>
                    {item.module}
                  </Typography>
                  {item.completed === "yes" && (
                    <Chip size="small" color="success" label="Completed" />
                  )}
                </Box>
                <Typography sx={{ mt: 0.5 }}>{item.description}</Typography>
                {item.courselink && (
                  <Button
                    href={item.courselink}
                    target="_blank"
                    size="small"
                    sx={{ color: "#2563eb", textTransform: "none" }}
                    startIcon={<LinkIcon />}
                  >
                    Course Link
                  </Button>
                )}
              </Paper>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Module Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Module</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Module Title"
            sx={{ mb: 2 }}
            value={formData.module}
            onChange={(e) =>
              setFormData({ ...formData, module: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Description"
            sx={{ mb: 2 }}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Credits"
            sx={{ mb: 2 }}
            value={formData.credits}
            onChange={(e) =>
              setFormData({ ...formData, credits: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Course Link (optional)"
            placeholder="https://..."
            value={formData.courselink}
            onChange={(e) =>
              setFormData({ ...formData, courselink: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Module
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SyllabusRoom;
