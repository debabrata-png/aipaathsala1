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
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  People,
  Save as SaveIcon,
  Edit,
  Delete,
  MoreVert,
  SmartToy,
  AutoAwesome,
  Add,
  Chat,
} from "@mui/icons-material";
import ep3 from "../../api/ep3";
import global1 from "../../pages/global1";
import AIChatInterface from "./AIChatInterface";
import CreateClassInterface from "../remedialclasses/CreateClassInterface";
import socketInstance from "../../api/ep2";

const ManageClassesInterfaceByCourse = ({ course }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [aiChatDialog, setAiChatDialog] = useState({ open: false, cls: null });
  const [socket, setSocket] = useState(null);
  const [processingAI, setProcessingAI] = useState({});
  const [analyses, setAnalyses] = useState([]);
  const [createAIDialogOpen, setCreateAIDialogOpen] = useState(false);
  const [createManualDialogOpen, setCreateManualDialogOpen] = useState(false);
  const [manualMessages, setManualMessages] = useState([]);
  const [manualStep, setManualStep] = useState("start");
  const [manualForm, setManualForm] = useState({
    topic: "",
    classdate: "",
    classtime: "",
    module: "",
    link: "",
    classtype: "Lecture",
  });
  const [manualInput, setManualInput] = useState("");
  const [editDialog, setEditDialog] = useState({ open: false, class: null });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    class: null,
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuClass, setMenuClass] = useState(null);

  const isFaculty = (global1.userRole || "").toUpperCase() === "FACULTY";

  useEffect(() => {
    fetchClasses();
    if (isFaculty) fetchAIAnalyses();
  }, [course]);

  useEffect(() => {
    if (!isFaculty) return;
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    setSocket(socketInstance);

    const handleStatusUpdate = () => {
      fetchAIAnalyses();
      fetchClasses();
    };

    socketInstance.on("ai_analysis_status_update", handleStatusUpdate);

    return () => {
      if (socketInstance) {
        socketInstance.off("ai_analysis_status_update", handleStatusUpdate);
      }
    };
  }, [isFaculty]);

  useEffect(() => {
    if (selectedClass && attendanceDialog) fetchEnrolledStudents(selectedClass);
  }, [selectedClass, attendanceDialog]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      let list = [];
      if (isFaculty) {
        const response = await ep3.get("/getclassesbyuserremedial", {
          params: {
            user: global1.userEmail,
            colid: global1.colid,
            coursecode: course.coursecode,
          },
        });
        if (response.data.success) list = response.data.data;
      } else {
        const response = await ep3.get("/getclassesbycourseremedial", {
          params: { coursecode: course.coursecode, colid: global1.colid },
        });
        if (response.data.success) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          list = response.data.data.filter((c) => {
            const d = new Date(c.classdate);
            d.setHours(0, 0, 0, 0);
            return d.getTime() <= today.getTime();
          });
        }
      }
      const groupedClasses = groupClassesByCourse(list);
      setClasses(groupedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnalyses = async () => {
    if (!isFaculty) return;
    try {
      const response = await ep3.get("/getaivideoanalysisbyuserremedial", {
        params: { colid: global1.colid, user: global1.userEmail },
      });
      if (response.data.success) setAnalyses(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch AI analyses:", error);
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
    Object.keys(grouped).forEach((key) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const future = [],
        todayArr = [],
        past = [];
      grouped[key].classes.forEach((c) => {
        const d = new Date(c.classdate);
        const dc = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const tc = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        if (dc.getTime() > tc.getTime()) future.push(c);
        else if (dc.getTime() === tc.getTime()) todayArr.push(c);
        else past.push(c);
      });
      future.sort((a, b) => new Date(a.classdate) - new Date(b.classdate));
      todayArr.sort((a, b) =>
        (a.classtime || "") > (b.classtime || "") ? 1 : -1
      );
      past.sort((a, b) => new Date(b.classdate) - new Date(a.classdate));
      grouped[key].classes = [...future, ...todayArr, ...past];
    });
    return grouped;
  };

  const fetchEnrolledStudents = async (classItem) => {
    try {
      const response = await ep3.get("/getenrolledstudentsremedial", {
        params: { coursecode: classItem.coursecode, colid: global1.colid },
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
      const response = await ep3.post("/markattendanceremedial", { attendanceRecords });
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
      const response = await ep3.put(`/updateclassremedial/${editDialog.class._id}`, {
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
      const response = await ep3.delete(
        `/deleteclassremedial/${deleteDialog.class._id}`,
        {
          params: { user: global1.userEmail, colid: global1.colid },
        }
      );
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

  const triggerAIAnalysis = async (classItem) => {
    const classId = classItem._id;
    if (processingAI[classId]) return;
    const existingAnalysis = analyses.find(
      (a) =>
        a.classid === classId &&
        ["searching", "analyzing", "generating"].includes(a.status)
    );
    if (existingAnalysis) {
      alert(`AI analysis already in progress for "${classItem.topic}".`);
      return;
    }
    setProcessingAI((prev) => ({ ...prev, [classId]: true }));
    try {
      const response = await ep3.post("/processaivideoanalysisremedial", {
        classid: classId,
        user: global1.userEmail,
        colid: global1.colid,
      });
      if (response.data.success) {
        alert(`AI analysis started for "${classItem.topic}"!`);
        fetchAIAnalyses();
        fetchClasses();
      } else {
        throw new Error(response.data.message || "Failed to start analysis");
      }
    } catch (error) {
      let errorMsg = "Failed to start AI analysis";
      if (error.response?.status === 404) errorMsg = "API keys not configured.";
      else if (error.response?.data?.message)
        errorMsg = error.response.data.message;
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessingAI((prev) => ({ ...prev, [classId]: false }));
    }
  };

  const handleJoinClass = (classItem) => {
    setAiChatDialog({ open: true, cls: classItem });
  };

  const startManualCreate = () => {
    setManualMessages([
      {
        role: "bot",
        text: `Hi ${global1.userName}! Let's create a class for ${course.course || course.coursename
          } (${course.coursecode}).`,
      },
      { role: "bot", text: "First, what is the topic of the class?" },
    ]);
    setManualStep("topic");
    setManualForm({
      topic: "",
      classdate: "",
      classtime: "",
      module: "",
      link: "",
      classtype: "Lecture",
    });
    setManualInput("");
    setCreateManualDialogOpen(true);
  };

  const handleManualInput = (e) => {
    if (e.key === "Enter" && manualInput.trim()) processManualInput();
  };

  const processManualInput = () => {
    const value = manualInput.trim();
    if (!value) return;
    setManualMessages((prev) => [...prev, { role: "user", text: value }]);

    if (manualStep === "topic") {
      setManualForm((prev) => ({ ...prev, topic: value }));
      setManualMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Topic: "${value}"\n\nWhat is the class date? (YYYY-MM-DD)\nExample: 2025-10-15`,
        },
      ]);
      setManualStep("date");
    } else if (manualStep === "date") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        setManualMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Invalid date format! Use YYYY-MM-DD (e.g., 2025-10-15)",
          },
        ]);
        setManualInput("");
        return;
      }
      setManualForm((prev) => ({ ...prev, classdate: value }));
      setManualMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Date: ${value}\n\nWhat time? (HH:MM 24-hour)\nExample: 14:30\nOr type "skip"`,
        },
      ]);
      setManualStep("time");
    } else if (manualStep === "time") {
      if (value.toLowerCase() === "skip") {
        setManualForm((prev) => ({ ...prev, classtime: "" }));
        setManualMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: 'Time: Not specified\n\nModule/Unit? (e.g., Module 1)\nOr type "skip"',
          },
        ]);
      } else {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          setManualMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: 'Invalid time format! Use HH:MM (e.g., 14:30) or type "skip"',
            },
          ]);
          setManualInput("");
          return;
        }
        setManualForm((prev) => ({ ...prev, classtime: value }));
        setManualMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `Time: ${value}\n\nModule/Unit? (e.g., Module 1)\nOr type "skip"`,
          },
        ]);
      }
      setManualStep("module");
    } else if (manualStep === "module") {
      const moduleVal = value.toLowerCase() === "skip" ? "" : value;
      setManualForm((prev) => ({ ...prev, module: moduleVal }));
      setManualMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `${moduleVal ? `Module: ${moduleVal}` : "Module: Not specified"
            }\n\n**Review:**\nCourse: ${course.course || course.coursename} (${course.coursecode
            })\nTopic: ${manualForm.topic}\nDate: ${manualForm.classdate
            }\nTime: ${manualForm.classtime || "Not specified"}\nModule: ${moduleVal || "Not specified"
            }\nProgram: ${course.program || "N/A"}\nSemester: ${course.semester
            }\nSection: ${course.section}\n\nClick "Create Class" to confirm!`,
        },
      ]);
      setManualStep("confirm");
    }
    setManualInput("");
  };

  const handleManualCreateConfirm = async () => {
    if (manualStep !== "confirm") return;
    setManualMessages((prev) => [
      ...prev,
      { role: "bot", text: "Creating your class..." },
    ]);
    try {
      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        year: new Date().getFullYear().toString(),
        program: course.program || "",
        programcode: course.programcode || "",
        course: course.course || course.coursename,
        coursecode: course.coursecode,
        semester: course.semester,
        section: course.section,
        classdate: manualForm.classdate,
        classtime: manualForm.classtime || "00:00",
        topic: manualForm.topic,
        module: manualForm.module || "",
        link: manualForm.link || "",
        classtype: manualForm.classtype || "Lecture",
        status1: "Active",
        comments: `Created manually by ${global1.userName}`,
      };
      const resp = await ep3.post("/createclassremedial", payload);
      if (resp.data && resp.data.success) {
        setManualMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `Class "${manualForm.topic}" created successfully for ${manualForm.classdate}!\n\nClosing in 2 seconds...`,
          },
        ]);
        setTimeout(() => {
          setCreateManualDialogOpen(false);
          fetchClasses();
        }, 2000);
      } else {
        throw new Error(resp.data?.message || "Failed to create class");
      }
    } catch (error) {
      console.error("Create class error:", error);
      setManualMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Failed to create class: ${error.response?.data?.message || error.message
            }\n\nPlease try again.`,
        },
      ]);
    }
  };

  const hasStarted = (dateStr, timeStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const classDate = new Date(dateStr);
    const timeRegex = /\d{1,2}:\d{2}/;
    if (timeStr && timeRegex.test(timeStr)) {
      const [h, m] = timeStr.split(":").map(Number);
      classDate.setHours(h, m, 0, 0);
    } else {
      classDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
    }
    return classDate.getTime() <= now.getTime();
  };

  const getClassStatus = (classDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classDay = new Date(classDate);
    classDay.setHours(0, 0, 0, 0);
    const diffTime = classDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0)
      return {
        label: diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`,
        color: "info",
        canMarkAttendance: false,
        reason: "Future class",
        isPast: false,
      };
    else if (diffDays === 0)
      return {
        label: "Today",
        color: "primary",
        canMarkAttendance: true,
        reason: "Today's class",
        isPast: false,
      };
    else if (diffDays >= -7)
      return {
        label: diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)} days ago`,
        color: "success",
        canMarkAttendance: true,
        reason: "Within 7 days",
        isPast: true,
      };
    else
      return {
        label: `${Math.abs(diffDays)} days ago`,
        color: "default",
        canMarkAttendance: false,
        reason: "More than 7 days old",
        isPast: true,
      };
  };

  const getAIAnalysisStatus = (classId) =>
    analyses.find((a) => a.classid === classId);

  const getAIButtonText = (classId) => {
    if (processingAI[classId]) return "Starting...";
    const analysis = getAIAnalysisStatus(classId);
    if (!analysis) return "Start AI Analysis";
    switch (analysis.status) {
      case "searching":
        return "Searching Videos...";
      case "analyzing":
        return "Analyzing...";
      case "generating":
        return "Generating...";
      case "completed":
        return "View AI Analysis";
      case "failed":
        return "Retry AI Analysis";
      default:
        return "Processing...";
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

  const formatTime = (timeString) => timeString || "Not specified";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading classes...</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={2}
        sx={{ p: 2, mb: 2, backgroundColor: "#1976d2", color: "white" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isFaculty ? "📋 Manage Classes & Attendance" : "📚 My Classes"}
            </Typography>
            <Typography variant="body2">
              {isFaculty
                ? `View, edit, delete classes and mark attendance for ${course.course}`
                : `View your enrolled classes for ${course.course}`}
            </Typography>
          </Box>
          {isFaculty && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={() => setCreateAIDialogOpen(true)}
                sx={{
                  backgroundColor: "#7c3aed",
                  "&:hover": { backgroundColor: "#6d28d9" },
                }}
              >
                Create with AI
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={startManualCreate}
                sx={{
                  backgroundColor: "#059669",
                  "&:hover": { backgroundColor: "#047857" },
                }}
              >
                Create Manual
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {Object.keys(classes).length}
              </Typography>
              <Typography variant="caption">
                {isFaculty ? "Active Courses" : "Course Sections"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {Object.values(classes).reduce(
                  (total, group) => total + group.classes.length,
                  0
                )}
              </Typography>
              <Typography variant="caption">Total Classes</Typography>
            </CardContent>
          </Card>
        </Grid>
        {isFaculty && (
          <>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">
                    {Object.values(classes).reduce((total, group) => {
                      return (
                        total +
                        group.classes.filter(
                          (cls) =>
                            getClassStatus(cls.classdate).canMarkAttendance
                        ).length
                      );
                    }, 0)}
                  </Typography>
                  <Typography variant="caption">
                    Attendance Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">
                    {analyses.filter((a) => a.status === "completed").length}
                  </Typography>
                  <Typography variant="caption">
                    AI Analyses Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        {!isFaculty && (
          <Grid item xs={12} sm={6}>
            <Card sx={{ backgroundColor: "#e3f2fd" }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  💡 Click "Join Class" to access AI video analysis and learning
                  materials
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {Object.keys(classes).length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            <Typography variant="h6">No classes found</Typography>
            <Typography>
              {isFaculty
                ? "Create your first class to get started"
                : "No classes are scheduled for this course yet. Check back later!"}
            </Typography>
          </Alert>
        </Paper>
      ) : (
        Object.entries(classes).map(([courseKey, courseGroup]) => (
          <Card key={courseKey} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {courseGroup.courseInfo.coursecode} -{" "}
                  {courseGroup.courseInfo.course}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Semester {courseGroup.courseInfo.semester} • Section{" "}
                  {courseGroup.courseInfo.section} •{" "}
                  {courseGroup.classes.length} classes
                  {isFaculty &&
                    ` • ${courseGroup.classes.filter(
                      (cls) => getClassStatus(cls.classdate).canMarkAttendance
                    ).length
                    } attendance available`}
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>Class #</TableCell>
                      <TableCell>Topic</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseGroup.classes.map((classItem, index) => {
                      const status = getClassStatus(classItem.classdate);
                      const aiAnalysis = isFaculty
                        ? getAIAnalysisStatus(classItem._id)
                        : null;
                      return (
                        <TableRow
                          key={classItem._id}
                          sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {classItem.topic || "Topic not set"}
                              {aiAnalysis?.status === "completed" && (
                                <Chip
                                  icon={<SmartToy />}
                                  label="AI Ready"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {formatDate(classItem.classdate)}
                          </TableCell>
                          <TableCell>
                            {formatTime(classItem.classtime)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Chat />}
                                onClick={() => handleJoinClass(classItem)}
                                disabled={
                                  !hasStarted(
                                    classItem.classdate,
                                    classItem.classtime
                                  )
                                }
                                sx={{
                                  backgroundColor: "#1976d2",
                                  "&:hover": { backgroundColor: "#1565c0" },
                                  minWidth: "120px",
                                }}
                              >
                                Join Class
                              </Button>
                              {isFaculty && (
                                <>
                                  {status.canMarkAttendance && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<People />}
                                      onClick={() =>
                                        handleAttendanceClick(classItem)
                                      }
                                      sx={{
                                        bgcolor: "#059669",
                                        "&:hover": { bgcolor: "#047857" },
                                        minWidth: "auto",
                                        px: 1,
                                      }}
                                    >
                                      Attendance
                                    </Button>
                                  )}
                                  <Button
                                    variant={
                                      aiAnalysis?.status === "completed"
                                        ? "outlined"
                                        : "contained"
                                    }
                                    size="small"
                                    startIcon={
                                      processingAI[classItem._id] ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <SmartToy />
                                      )
                                    }
                                    onClick={() => {
                                      if (aiAnalysis?.status === "completed")
                                        handleJoinClass(classItem);
                                      else triggerAIAnalysis(classItem);
                                    }}
                                    disabled={
                                      processingAI[classItem._id] ||
                                      (aiAnalysis &&
                                        [
                                          "searching",
                                          "analyzing",
                                          "generating",
                                        ].includes(aiAnalysis.status))
                                    }
                                    sx={{
                                      bgcolor:
                                        aiAnalysis?.status === "completed"
                                          ? "transparent"
                                          : "#7c3aed",
                                      color:
                                        aiAnalysis?.status === "completed"
                                          ? "#7c3aed"
                                          : "white",
                                      borderColor: "#7c3aed",
                                      "&:hover": {
                                        bgcolor:
                                          aiAnalysis?.status === "completed"
                                            ? "#f3e8ff"
                                            : "#6d28d9",
                                        borderColor: "#6d28d9",
                                      },
                                      minWidth: "auto",
                                      px: 1,
                                    }}
                                  >
                                    {getAIButtonText(classItem._id)}
                                  </Button>
                                  <IconButton
                                    size="small"
                                    onClick={(e) =>
                                      handleMenuClick(e, classItem)
                                    }
                                  >
                                    <MoreVert />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))
      )}

      {isFaculty && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Class
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Class
          </MenuItem>
        </Menu>
      )}

      <Dialog
        open={attendanceDialog}
        onClose={() => setAttendanceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { maxHeight: "80vh" } }}
      >
        <DialogTitle>📝 Mark Attendance - {selectedClass?.course}</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Date: {formatDate(selectedClass.classdate)} | Time:{" "}
                {formatTime(selectedClass.classtime)}
              </Typography>
              {selectedClass.topic && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Topic: {selectedClass.topic}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Status: {getClassStatus(selectedClass.classdate).reason}
              </Typography>
            </>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            Toggle switches to mark attendance. Green = Present, Gray = Absent
          </Alert>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Students ({enrolledStudents.length})
          </Typography>
          <List>
            {enrolledStudents.map((student, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Box>
                  <Typography variant="body2">{student.student}</Typography>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {attendanceData[student.regno] === 1 ? (
                        <>
                          <CheckCircle fontSize="small" color="success" />
                          Present
                        </>
                      ) : (
                        <>
                          <Cancel fontSize="small" color="error" />
                          Absent
                        </>
                      )}
                    </Box>
                  }
                  labelPlacement="start"
                />
              </ListItem>
            ))}
          </List>
          {enrolledStudents.length === 0 && (
            <Alert severity="warning">
              No students enrolled in this class. Please enroll students first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAttendanceDialog(false)}
            disabled={savingAttendance}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAttendance}
            variant="contained"
            disabled={savingAttendance || enrolledStudents.length === 0}
            startIcon={
              savingAttendance ? <CircularProgress size={20} /> : <SaveIcon />
            }
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
          >
            {savingAttendance ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, class: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>✏️ Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            label="Topic"
            fullWidth
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
            label="Date"
            type="date"
            fullWidth
            value={editDialog.class?.classdate?.split("T")[0] || ""}
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
            label="Time"
            type="time"
            fullWidth
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
          <Button onClick={handleEditSave} variant="contained">
            Update Class
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, class: null })}
      >
        <DialogTitle>🗑️ Delete Class</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class?</Typography>
          {deleteDialog.class && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Class:</strong>{" "}
                {deleteDialog.class.topic || "Untitled Class"}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{" "}
                {formatDate(deleteDialog.class.classdate)}
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
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete Class
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={aiChatDialog.open}
        onClose={() => setAiChatDialog({ open: false, cls: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: "80vh" } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToy color="primary" />
            <Typography variant="h6">
              AI Learning Assistant - {aiChatDialog.cls?.topic || course.course}
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            View AI video analysis, learning materials, and chat with the AI
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {aiChatDialog.cls && (
            <AIChatInterface
              course={{
                coursecode: aiChatDialog.cls.coursecode,
                course: aiChatDialog.cls.course,
                coursename: aiChatDialog.cls.course,
                semester: aiChatDialog.cls.semester,
                section: aiChatDialog.cls.section,
                classInfo: aiChatDialog.cls,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiChatDialog({ open: false, cls: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createAIDialogOpen}
        onClose={() => setCreateAIDialogOpen(false)}
        fullScreen
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesome color="secondary" />
            <Typography variant="h6">Create Classes with AI</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <CreateClassInterface
            course={course}
            onClose={() => setCreateAIDialogOpen(false)}
            onCreated={() => {
              setCreateAIDialogOpen(false);
              fetchClasses();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateAIDialogOpen(false);
              fetchClasses();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createManualDialogOpen}
        onClose={() => setCreateManualDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { height: "70vh" } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Add color="success" />
            <Typography variant="h6">Create Single Class</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", p: 0 }}>
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {manualMessages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "80%",
                    backgroundColor:
                      msg.role === "user" ? "#1976d2" : "#f5f5f5",
                    color: msg.role === "user" ? "white" : "black",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          {manualStep !== "confirm" && (
            <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
              <TextField
                fullWidth
                size="small"
                placeholder={
                  manualStep === "topic"
                    ? "Enter class topic..."
                    : manualStep === "date"
                      ? "Enter date (YYYY-MM-DD)..."
                      : manualStep === "time"
                        ? "Enter time (HH:MM) or type skip..."
                        : "Enter module or type skip..."
                }
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={handleManualInput}
                autoFocus
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateManualDialogOpen(false)}>
            Cancel
          </Button>
          {manualStep === "confirm" && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleManualCreateConfirm}
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
            >
              Create Class
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageClassesInterfaceByCourse;
