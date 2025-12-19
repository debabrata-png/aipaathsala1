import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  School,
  CheckCircle,
  Cancel,
  People,
  Save as SaveIcon,
  Edit,
  Delete,
  MoreVert,
  SmartToy,
  Assignment,
  Schedule,
  AutoAwesome,
} from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const ManageClassesInterface = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  
  // Edit/Delete state
  const [editDialog, setEditDialog] = useState({ open: false, class: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, class: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuClass, setMenuClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && attendanceDialog) {
      fetchEnrolledStudents(selectedClass);
    }
  }, [selectedClass, attendanceDialog]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await ep3.get("/getclassesbyuser", {
        params: {
          user: global1.userEmail,
          colid: global1.colid,
        },
      });
      if (response.data.success) {
        const groupedClasses = groupClassesByCourse(response.data.data);
        setClasses(groupedClasses);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupClassesByCourse = (classList) => {
    const grouped = {};
    classList.forEach((cls) => {
      const key = `${cls.coursecode}-${cls.semester}-${cls.section}`;
      if (!grouped[key]) {
        grouped[key] = {
          courseInfo: {
            coursecode: cls.coursecode,
            course: cls.course,
            semester: cls.semester,
            section: cls.section,
            program: cls.program || "",
          },
          classes: [],
        };
      }
      grouped[key].classes.push(cls);
    });

    // Sort classes within each group by date
    Object.keys(grouped).forEach((key) => {
      grouped[key].classes.sort(
        (a, b) => new Date(a.classdate) - new Date(b.classdate)
      );
    });
    return grouped;
  };

  const fetchEnrolledStudents = async (classItem) => {
    try {
      const response = await ep3.get("/getenrolledstudents", {
        params: {
          coursecode: classItem.coursecode,
          colid: global1.colid,
        },
      });
      if (response.data.success) {
        setEnrolledStudents(response.data.data);
        const initialAttendance = {};
        response.data.data.forEach((student) => {
          initialAttendance[student.regno] = 1;
        });
        setAttendanceData(initialAttendance);
      } else {
        setEnrolledStudents([]);
        setAttendanceData({});
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      setEnrolledStudents([]);
      setAttendanceData({});
    }
  };

  const handleAttendanceClick = (classItem) => {
    setSelectedClass(classItem);
    setAttendanceDialog(true);
  };

  const handleAttendanceToggle = (regno) => {
    setAttendanceData((prev) => ({
      ...prev,
      [regno]: prev[regno] === 1 ? 0 : 1,
    }));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const attendanceRecords = enrolledStudents.map((student) => ({
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        year: selectedClass.year,
        classid: selectedClass._id,
        programcode: selectedClass.programcode,
        program: selectedClass.program,
        course: selectedClass.course,
        coursecode: selectedClass.coursecode,
        student: student.student,
        regno: student.regno,
        att: attendanceData[student.regno] || 0,
        classdate: selectedClass.classdate,
        semester: selectedClass.semester,
        section: selectedClass.section,
        status1: "Active",
        comments: `Attendance for ${selectedClass.topic || "class"}`,
      }));

      const response = await ep3.post("/markattendance", {
        attendanceRecords,
      });

      if (response.data.success) {
        alert("Attendance saved successfully!");
        setAttendanceDialog(false);
      } else {
        alert("Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleMenuClick = (event, classItem) => {
    setMenuAnchor(event.currentTarget);
    setMenuClass(classItem);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuClass(null);
  };

  const handleEditClick = () => {
    setEditDialog({ open: true, class: { ...menuClass } });
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialog({ open: true, class: menuClass });
    handleMenuClose();
  };

  const handleEditSave = async () => {
    try {
      const response = await ep3.put(`/updateclass/${editDialog.class._id}`, {
        ...editDialog.class,
        user: global1.userEmail,
        colid: global1.colid,
      });
      if (response.data.success) {
        alert("Class updated successfully!");
        setEditDialog({ open: false, class: null });
        fetchClasses();
      } else {
        alert("Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await ep3.delete(`/deleteclass/${deleteDialog.class._id}`, {
        params: {
          user: global1.userEmail,
          colid: global1.colid,
        },
      });
      if (response.data.success) {
        alert("Class deleted successfully!");
        setDeleteDialog({ open: false, class: null });
        fetchClasses();
      } else {
        alert("Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "ongoing":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString || "Not specified";
  };

  const getClassStatus = (classDate) => {
    const today = new Date();
    const classDay = new Date(classDate);
    if (classDay < today) return { label: "Completed", color: "default" };
    if (classDay.toDateString() === today.toDateString())
      return { label: "Today", color: "primary" };
    return { label: "Scheduled", color: "success" };
  };

  // ✅ NEW: Check if topic is AI generated
  const isAIGenerated = (topic) => {
    return topic && (
      topic.includes("AI") || 
      topic.includes("artificial") || 
      topic.includes("machine") ||
      topic.includes("Introduction") ||
      topic.includes("Advanced") ||
      topic.includes("Fundamentals")
    );
  };

  // ✅ NEW: Get AI stats
  const getAIStats = () => {
    const allClasses = Object.values(classes).reduce((acc, group) => acc.concat(group.classes), []);
    const aiGeneratedCount = allClasses.filter(cls => isAIGenerated(cls.topic)).length;
    return aiGeneratedCount;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading classes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          <School sx={{ mr: 1, verticalAlign: "middle" }} />
          Manage Classes & Attendance
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          View, edit, delete classes and mark attendance for your courses
        </Typography>
      </Paper>

      {/* Enhanced Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <School sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {Object.keys(classes).length}
              </Typography>
              <Typography variant="body2">Active Courses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {Object.values(classes).reduce(
                  (total, group) => total + group.classes.length,
                  0
                )}
              </Typography>
              <Typography variant="body2">Total Classes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {Object.values(classes).reduce(
                  (total, group) =>
                    total +
                    group.classes.filter(
                      (c) => new Date(c.classdate) >= new Date()
                    ).length,
                  0
                )}
              </Typography>
              <Typography variant="body2">Upcoming</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <AutoAwesome sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {getAIStats()}
              </Typography>
              <Typography variant="body2">AI Generated</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {Object.keys(classes).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc" }}>
          <School sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No classes found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first class to get started
          </Typography>
        </Paper>
      ) : (
        Object.entries(classes).map(([courseKey, courseGroup]) => (
          <Card key={courseKey} sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
            {/* Enhanced Course Header */}
            <CardContent sx={{ 
              bgcolor: "#f8fafc", 
              borderBottom: "1px solid #e2e8f0",
              background: "linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e293b" }}>
                    {courseGroup.courseInfo.coursecode} - {courseGroup.courseInfo.course}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Semester {courseGroup.courseInfo.semester} • Section {courseGroup.courseInfo.section} • 
                    {courseGroup.classes.length} classes
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip 
                    icon={<AutoAwesome />}
                    label={`${courseGroup.classes.filter(cls => isAIGenerated(cls.topic)).length} AI Topics`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>

            {/* Enhanced Classes Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Class #</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Topic</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courseGroup.classes.map((classItem, index) => {
                    const status = getClassStatus(classItem.classdate);
                    return (
                      <TableRow key={classItem._id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {isAIGenerated(classItem.topic) && (
                              <Tooltip title="AI Generated Topic">
                                <SmartToy sx={{ color: "#7c3aed", fontSize: 18 }} />
                              </Tooltip>
                            )}
                            <Typography variant="body2">
                              {classItem.topic || "Topic not set"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(classItem.classdate)}</TableCell>
                        <TableCell>{formatTime(classItem.classtime)}</TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {/* Attendance Button */}
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<People />}
                              onClick={() => handleAttendanceClick(classItem)}
                              sx={{
                                bgcolor: "#059669",
                                color: "white",
                                "&:hover": { bgcolor: "#047857" },
                                minWidth: "auto",
                                px: 1,
                              }}
                            >
                              Attendance
                            </Button>
                            
                            {/* More Actions Menu */}
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, classItem)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ))
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} /> Edit Class
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} /> Delete Class
        </MenuItem>
      </Menu>

      {/* Existing Attendance Dialog */}
      <Dialog
        open={attendanceDialog}
        onClose={() => setAttendanceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { maxHeight: "80vh" } }}
      >
        <DialogTitle sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          📝 Mark Attendance - {selectedClass?.course}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedClass && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Date: {formatDate(selectedClass.classdate)} | Time: {formatTime(selectedClass.classtime)}
              </Typography>
              {selectedClass.topic && (
                <Typography variant="body2">
                  Topic: {selectedClass.topic}
                  {isAIGenerated(selectedClass.topic) && (
                    <Chip 
                      icon={<SmartToy />}
                      label="AI Generated"
                      size="small"
                      sx={{ ml: 1 }}
                      color="secondary"
                    />
                  )}
                </Typography>
              )}
            </Alert>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Toggle switches to mark attendance. Green = Present, Gray = Absent
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, color: "#1e293b" }}>
            Students ({enrolledStudents.length})
          </Typography>
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {enrolledStudents.map((student, index) => (
              <ListItem
                key={student._id}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: attendanceData[student.regno] === 1 ? "#f0fdf4" : "#fef2f2"
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{student.student}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {student.regno}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={attendanceData[student.regno] === 1}
                      onChange={() => handleAttendanceToggle(student.regno)}
                      color="success"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {attendanceData[student.regno] === 1 ? (
                        <>
                          <CheckCircle sx={{ color: "success.main", mr: 0.5, fontSize: 16 }} />
                          Present
                        </>
                      ) : (
                        <>
                          <Cancel sx={{ color: "error.main", mr: 0.5, fontSize: 16 }} />
                          Absent
                        </>
                      )}
                    </Typography>
                  }
                  labelPlacement="start"
                />
              </ListItem>
            ))}
          </List>
          {enrolledStudents.length === 0 && (
            <Alert severity="warning">
              No students enrolled in this class. Please enroll students first using the "Enroll Students" tab.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setAttendanceDialog(false)}
            disabled={savingAttendance}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAttendance}
            disabled={savingAttendance || enrolledStudents.length === 0}
            startIcon={savingAttendance ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{
              bgcolor: "#059669",
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {savingAttendance ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, class: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>✏️ Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Topic"
            value={editDialog.class?.topic || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                class: { ...prev.class, topic: e.target.value },
              }))
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Class Date"
            type="date"
            value={
              editDialog.class?.classdate
                ? new Date(editDialog.class.classdate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                class: { ...prev.class, classdate: e.target.value },
              }))
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Class Time"
            type="time"
            value={editDialog.class?.classtime || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                class: { ...prev.class, classtime: e.target.value },
              }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, class: null })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditSave}>
            Update Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, class: null })}
      >
        <DialogTitle>🗑️ Delete Class</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class?</Typography>
          {deleteDialog.class && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#fef2f2", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Class:</strong> {deleteDialog.class.topic || "Untitled Class"}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(deleteDialog.class.classdate)}
              </Typography>
              <Typography variant="body2">
                <strong>Course:</strong> {deleteDialog.class.coursecode}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, class: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete Class
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageClassesInterface;
