import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Publish,
  Assessment,
  Person,
  Quiz,
  Schedule,
  CheckCircle,
  Cancel,
  Download,
  Settings,
  AccessTime,
  PictureAsPdf,
  People,
  Refresh,
  Block,
  PlayArrow,
  Security,
  Visibility,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// Import for PDF export with pagination
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";
import TestQuestionManager from "./Test/QuestionManagement/TestQuestionManager";

const ManageTestInterface = ({ test: initialTest, onBack }) => {
  const [test, setTest] = useState(initialTest);
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [disconnectedStudents, setDisconnectedStudents] = useState([]); // New state for resume
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTest, setEditedTest] = useState({
    ...test,
    // Ensure all settings have default values
    allowretake: test.allowretake || false,
    shufflequestions: test.shufflequestions || false,
    showresults: test.showresults !== undefined ? test.showresults : true,
    proctoring: test.proctoring || false,
    lockdown: test.lockdown || false,
    timewarning: test.timewarning || 5,
    maxattempts: test.maxattempts || 1,
    feedback: test.feedback || "immediate",
    accessibility: test.accessibility || "standard",
    randomizequestions: test.randomizequestions || false,
    preventcopy: test.preventcopy || false,
    allowResume: test.allowResume || false, // New field
    resumeTimeLimit: test.resumeTimeLimit || 10 // New field
  });
  const [publishDialog, setPublishDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (activeTab === 3) { // Note: Student Permissions is tab 3
      fetchEligibleStudents();
      fetchDisconnectedStudents(); // Fetch disconnected too
    }
    if (activeTab === 4) { // Submissions is tab 4
      fetchSubmissions();
    }
  }, [activeTab]);

  // Fetch eligible students using new API
  const fetchEligibleStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await ep3.get(`/gettesteliiblestudents1/${test._id}`);
      if (response.data.success) {
        setEligibleStudents(response.data.data);
      } else {
        showSnackbar("Failed to load students", "error");
      }
    } catch (error) {
      showSnackbar("Error loading students", "error");
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchDisconnectedStudents = async () => {
    try {
      const response = await ep3.get('/getdisconnectedstudents', {
        params: { testid: test._id, colid: global1.colid }
      });
      if (response.data.success) setDisconnectedStudents(response.data.data);
    } catch (err) {
      console.error("Error fetching disconnected students", err);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await ep3.get("/gettestsubmissionsbytest1", {
        params: {
          testid: test._id,
          colid: global1.colid,
        },
      });

      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error) {
      showSnackbar("Error loading submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async () => {
    try {
      const response = await ep3.post("/updatetestds1", {
        id: test._id,
        ...editedTest,
        user: global1.userEmail,
        colid: global1.colid,
      });

      if (response.data.success) {
        showSnackbar("Test updated successfully!", "success");
        setEditMode(false);
        Object.assign(test, editedTest);
      }
    } catch (error) {
      showSnackbar("Failed to update test", "error");
    }
  };

  const handlePublishTest = async () => {
    try {
      const response = await ep3.post("/publishtestds1", {
        id: test._id,
        colid: global1.colid,
        user: global1.userEmail,
      });

      if (response.data.success) {
        showSnackbar(
          test.ispublished
            ? "Test unpublished!"
            : "Test published successfully!",
          "success"
        );
        setPublishDialog(false);
        test.ispublished = !test.ispublished;
      }
    } catch (error) {
      showSnackbar("Failed to publish test", "error");
    }
  };

  const handleDeleteTest = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this test? This action cannot be undone."
      )
    ) {
      try {
        const response = await ep3.get("/deletetestds1", {
          params: {
            id: test._id,
            colid: global1.colid,
            user: global1.userEmail,
          },
        });

        if (response.data.success) {
          showSnackbar("Test deleted successfully!", "success");
          onBack();
        }
      } catch (error) {
        showSnackbar("Failed to delete test", "error");
      }
    }
  };

  const handleAllowResume = async (studentId) => {
    try {
      const response = await ep3.post('/allowresume', {
        testid: test._id,
        studentid: studentId,
        user: global1.userEmail,
        colid: global1.colid,
        facultyName: global1.userName
      });
      if (response.data.success) {
        showSnackbar('Resume allowed successfully!', 'success');
        fetchEligibleStudents();
        fetchDisconnectedStudents();
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to allow resume', 'error');
    }
  };

  const handleAllowRetake = async (studentId) => {
    try {
      const response = await ep3.post('/allowstudentretake2', { // Updated to V2
        testid: test._id,
        studentid: studentId,
        user: global1.userEmail,
        colid: global1.colid
      });

      if (response.data.success) {
        showSnackbar('Student can now retake the test!', 'success');
        // Refresh both students and submissions data
        fetchEligibleStudents();
        fetchSubmissions();
      } else {
        showSnackbar(response.data.message || 'Failed to allow retake', 'error');
      }
    } catch (error) {
      console.error('Allow retake error:', error);
      if (error.response?.data?.message) {
        showSnackbar(error.response.data.message, 'error');
      } else {
        showSnackbar('Error allowing retake', 'error');
      }
    }
  };

  // Enhanced PDF export with pagination
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text(`Test Results: ${test.testtitle}`, pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(`Course: ${test.coursecode}`, 20, 35);
      doc.text(`Duration: ${test.duration} minutes`, 20, 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 55);

      // Statistics
      const totalSubmissions = submissions.length;
      const passedSubmissions = submissions.filter((s) => s.passed).length;
      const averageScore =
        submissions.length > 0
          ? submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
          submissions.length
          : 0;

      doc.text(`Total Students: ${totalSubmissions}`, 20, 65);
      doc.text(
        `Passed: ${passedSubmissions} (${totalSubmissions > 0
          ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
          : 0
        }%)`,
        20,
        75
      );
      doc.text(`Average Score: ${averageScore.toFixed(1)}%`, 20, 85);

      // Prepare table data
      const tableColumns = [
        { header: "Student Name", dataKey: "name" },
        { header: "Score", dataKey: "score" },
        { header: "Percentage", dataKey: "percentage" },
        { header: "Status", dataKey: "status" },
        { header: "Submitted At", dataKey: "submittedAt" },
      ];

      const tableRows = submissions.map((submission) => ({
        name: submission.name || "Unknown Student",
        score: `${submission.totalscore || 0}/${test.totalnoofquestion || 0}`,
        percentage:
          submission.percentage !== undefined && submission.percentage !== null
            ? `${parseFloat(submission.percentage).toFixed(1)}%`
            : "N/A",
        status: submission.passed ? "Passed" : "Failed",
        submittedAt: submission.submissiondate
          ? new Date(submission.submissiondate).toLocaleString()
          : "N/A",
      }));

      // Use autoTable for pagination
      autoTable(doc, {
        columns: tableColumns,
        body: tableRows,
        startY: 95,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 50 },
        },
        showHead: "everyPage",
        didDrawPage: function (data) {
          const currentPage = data.pageNumber;
          const totalPages = doc.getNumberOfPages();

          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(
            `Page ${currentPage} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      const fileName = `${test.testtitle
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_results_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      showSnackbar("PDF exported successfully", "success");
    } catch (error) {
      showSnackbar("Failed to export PDF", "error");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getSubmissionStats = () => {
    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter((s) => s.passed).length;
    const averageScore =
      submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
        submissions.length
        : 0;

    return { totalSubmissions, passedSubmissions, averageScore };
  };

  const stats = getSubmissionStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: "#f97316",
            color: "white",
            borderRadius: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={onBack} sx={{ color: "white", mr: 2 }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Manage Test: {test.testtitle}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setEditMode(!editMode)}
                startIcon={<Edit />}
                sx={{ color: "white", borderColor: "white" }}
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setPublishDialog(true)}
                startIcon={<Publish />}
                sx={{ color: "white", borderColor: "white" }}
              >
                {test.ispublished ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDeleteTest}
                startIcon={<Delete />}
                sx={{ color: "white", borderColor: "white" }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ borderBottom: "1px solid #e0e0e0" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab icon={<Quiz />} label="Test Details" />
            <Tab icon={<Settings />} label="Test Settings" />
            <Tab icon={<Quiz />} label="Questions" />
            <Tab icon={<People />} label="Student Permissions" />
            <Tab icon={<Assessment />} label="Submissions & Results" />
          </Tabs>
        </Paper>

        {/* Content */}
        <Box
          sx={{ flex: 1, overflow: "auto", p: 3, backgroundColor: "#f8fafc" }}
        >
          {/* Test Details Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Test Information
                    </Typography>

                    {editMode ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Test Title"
                          value={editedTest.testtitle}
                          onChange={(e) =>
                            setEditedTest({
                              ...editedTest,
                              testtitle: e.target.value,
                            })
                          }
                          fullWidth
                        />
                        <TextField
                          label="Topic"
                          value={editedTest.topic}
                          onChange={(e) =>
                            setEditedTest({
                              ...editedTest,
                              topic: e.target.value,
                            })
                          }
                          fullWidth
                        />
                        <TextField
                          label="Description"
                          value={editedTest.description || ""}
                          onChange={(e) =>
                            setEditedTest({
                              ...editedTest,
                              description: e.target.value,
                            })
                          }
                          multiline
                          rows={3}
                          fullWidth
                        />
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleUpdateTest}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Topic"
                            secondary={test.topic}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Description"
                            secondary={
                              test.description || "No description provided"
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Course Code"
                            secondary={test.coursecode}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Total Questions"
                            secondary={test.totalnoofquestion}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Created"
                            secondary={formatDate(test.createdat)}
                          />
                        </ListItem>
                      </List>
                    )}
                  </CardContent>
                </Card>

                {/* Questions Preview */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Questions ({test.questions?.length || 0})
                    </Typography>
                    {test.questions && test.questions.length > 0 ? (
                      <List>
                        {test.questions.slice(0, 3).map((question, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              border: "1px solid #e0e0e0",
                              mb: 1,
                              borderRadius: 1,
                            }}
                          >
                            <ListItemText
                              primary={`Q${index + 1}: ${question.question}`}
                              secondary={
                                question.questiontype === "multiple-choice"
                                  ? `Correct Answer: ${question.correctanswer}`
                                  : "Short Answer Question"
                              }
                            />
                          </ListItem>
                        ))}
                        {test.questions.length > 3 && (
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: "italic", color: "#6b7280" }}
                          >
                            ... and {test.questions.length - 3} more questions
                          </Typography>
                        )}
                      </List>
                    ) : (
                      <Alert severity="info">No questions added yet.</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Status & Statistics
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Chip
                        label={test.ispublished ? "Published" : "Draft"}
                        color={test.ispublished ? "success" : "default"}
                        icon={test.ispublished ? <CheckCircle /> : <Cancel />}
                      />

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Attempts
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {test.totalattempts || 0}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Average Score
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {test.averagescore
                            ? `${test.averagescore.toFixed(1)}%`
                            : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Test Settings Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Settings /> Test Settings
                    </Typography>

                    {editMode ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {/* Schedule Settings */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <AccessTime /> Schedule Settings
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <DateTimePicker
                                label="Start Time"
                                value={
                                  editedTest.starttime
                                    ? new Date(editedTest.starttime)
                                    : null
                                }
                                onChange={(newValue) =>
                                  setEditedTest({
                                    ...editedTest,
                                    starttime: newValue,
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField {...params} fullWidth />
                                )}
                                minDateTime={new Date()}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <DateTimePicker
                                label="End Time"
                                value={
                                  editedTest.endtime
                                    ? new Date(editedTest.endtime)
                                    : null
                                }
                                onChange={(newValue) =>
                                  setEditedTest({
                                    ...editedTest,
                                    endtime: newValue,
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField {...params} fullWidth />
                                )}
                                minDateTime={
                                  editedTest.starttime
                                    ? new Date(editedTest.starttime)
                                    : new Date()
                                }
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        <Divider />

                        {/* Test Configuration */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 2, fontWeight: 600 }}
                          >
                            Test Configuration
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Duration (minutes)"
                                type="number"
                                value={editedTest.duration}
                                onChange={(e) =>
                                  setEditedTest({
                                    ...editedTest,
                                    duration: parseInt(e.target.value) || 0,
                                  })
                                }
                                fullWidth
                                helperText="Time limit for completing the test"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                label="Passing Score (%)"
                                type="number"
                                value={editedTest.passingscore || 50}
                                onChange={(e) =>
                                  setEditedTest({
                                    ...editedTest,
                                    passingscore:
                                      parseInt(e.target.value) || 50,
                                  })
                                }
                                fullWidth
                                inputProps={{ min: 0, max: 100 }}
                                helperText="Minimum score to pass the test"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={editedTest.globalNegativeMarking || false}
                                    onChange={(e) => setEditedTest({ ...editedTest, globalNegativeMarking: e.target.checked })}
                                  />
                                }
                                label="Global Negative Marking"
                              />
                            </Grid>
                            {editedTest.globalNegativeMarking && (
                              <Grid item xs={12} md={6}>
                                <TextField
                                  label="Negative Marks (per wrong answer)"
                                  type="number"
                                  value={editedTest.globalNegativeMarks || 0}
                                  onChange={(e) => setEditedTest({ ...editedTest, globalNegativeMarks: Number(e.target.value) })}
                                  fullWidth
                                  inputProps={{ min: 0, step: 0.25 }}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </Box>

                        <Divider />

                        {/* Advanced Settings */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 2, fontWeight: 600 }}
                          >
                            Advanced Settings
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editedTest.allowretake || false}
                                  onChange={(e) =>
                                    setEditedTest({
                                      ...editedTest,
                                      allowretake: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="Allow Multiple Attempts"
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={editedTest.allowResume || false}
                                    onChange={(e) => setEditedTest({ ...editedTest, allowResume: e.target.checked })}
                                  />
                                }
                                label="Allow Exam Resume (Disconnect Protection)"
                              />
                              {editedTest.allowResume && (
                                <TextField
                                  label="Window (mins)"
                                  type="number"
                                  size="small"
                                  value={editedTest.resumeTimeLimit || 10}
                                  onChange={(e) => setEditedTest({ ...editedTest, resumeTimeLimit: Number(e.target.value) })}
                                  sx={{ width: 120 }}
                                />
                              )}
                            </Box>

                            {editedTest.allowretake && (
                              <TextField
                                label="Maximum Attempts"
                                type="number"
                                value={editedTest.maxattempts || 1}
                                onChange={(e) =>
                                  setEditedTest({
                                    ...editedTest,
                                    maxattempts: parseInt(e.target.value) || 1,
                                  })
                                }
                                fullWidth
                                inputProps={{ min: 1, max: 10 }}
                                helperText="Maximum number of attempts allowed"
                              />
                            )}

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editedTest.shufflequestions || false}
                                  onChange={(e) =>
                                    setEditedTest({
                                      ...editedTest,
                                      shufflequestions: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="Shuffle Questions"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editedTest.showresults !== false}
                                  onChange={(e) =>
                                    setEditedTest({
                                      ...editedTest,
                                      showresults: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="Show Results to Students"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editedTest.proctoring || false}
                                  onChange={(e) =>
                                    setEditedTest({
                                      ...editedTest,
                                      proctoring: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="Enable Proctoring"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={editedTest.preventcopy || false}
                                  onChange={(e) =>
                                    setEditedTest({
                                      ...editedTest,
                                      preventcopy: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="Prevent Copy/Paste"
                            />

                            <TextField
                              label="Time Warning (minutes before end)"
                              type="number"
                              value={editedTest.timewarning || 5}
                              onChange={(e) =>
                                setEditedTest({
                                  ...editedTest,
                                  timewarning: parseInt(e.target.value) || 5,
                                })
                              }
                              fullWidth
                              helperText="Show warning when this many minutes remain"
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                          <Button
                            variant="contained"
                            onClick={handleUpdateTest}
                          >
                            Save Settings
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        {/* Schedule Information */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <AccessTime /> Schedule
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Start Time"
                                secondary={formatDate(test.starttime)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="End Time"
                                secondary={formatDate(test.endtime)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Duration"
                                secondary={`${test.duration} minutes`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Passing Score"
                                secondary={`${test.passingscore || 50}%`}
                              />
                            </ListItem>
                          </List>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Advanced Settings Display */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 2, fontWeight: 600 }}
                          >
                            Configuration
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Multiple Attempts"
                                secondary={
                                  test.allowretake
                                    ? `Allowed (Max: ${test.maxattempts || 1})`
                                    : "Not Allowed"
                                }
                              />
                              <Chip
                                label={test.allowretake ? "Yes" : "No"}
                                color={test.allowretake ? "success" : "default"}
                                size="small"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Question Randomization"
                                secondary={
                                  test.shufflequestions ? "Enabled" : "Disabled"
                                }
                              />
                              <Chip
                                label={test.shufflequestions ? "On" : "Off"}
                                color={
                                  test.shufflequestions ? "success" : "default"
                                }
                                size="small"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Show Results"
                                secondary={
                                  test.showresults !== false
                                    ? "Students can view results"
                                    : "Results hidden from students"
                                }
                              />
                              <Chip
                                label={
                                  test.showresults !== false ? "Yes" : "No"
                                }
                                color={
                                  test.showresults !== false
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Proctoring"
                                secondary={
                                  test.proctoring ? "Enabled" : "Disabled"
                                }
                              />
                              <Chip
                                label={test.proctoring ? "On" : "Off"}
                                color={test.proctoring ? "warning" : "default"}
                                size="small"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Copy Prevention"
                                secondary={
                                  test.preventcopy
                                    ? "Copy/paste disabled"
                                    : "Copy/paste allowed"
                                }
                              />
                              <Chip
                                label={test.preventcopy ? "On" : "Off"}
                                color={test.preventcopy ? "warning" : "default"}
                                size="small"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Time Warning"
                                secondary={`${test.timewarning || 5
                                  } minutes before end`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Feedback Timing"
                                secondary={test.feedback || "Immediate"}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Accessibility"
                                secondary={test.accessibility || "Standard"}
                              />
                            </ListItem>
                          </List>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid >

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Quick Actions
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(!editMode)}
                        fullWidth
                      >
                        {editMode ? "Cancel Edit" : "Edit Settings"}
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Publish />}
                        onClick={() => setPublishDialog(true)}
                        color={test.ispublished ? "error" : "success"}
                        fullWidth
                      >
                        {test.ispublished ? "Unpublish Test" : "Publish Test"}
                      </Button>

                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Remember to publish the test after making changes for
                          students to see the updates.
                        </Typography>
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid >
          )}

          {/* Questions Tab */}
          {activeTab === 2 && (
            <TestQuestionManager
              test={test}
              onBack={() => setActiveTab(0)}
              onUpdate={(updatedTest) => {
                setTest(updatedTest);
                setEditedTest({ ...updatedTest });
              }}
            />
          )}

          {/* Student Permissions Tab - SIMPLIFIED RETAKE LOGIC */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Student Permissions ({eligibleStudents.length} enrolled)
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={fetchEligibleStudents}
                    disabled={studentsLoading}
                    startIcon={
                      studentsLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Refresh />
                      )
                    }
                  >
                    {studentsLoading ? "Loading..." : "Refresh"}
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Faculty can allow any student who has taken the exam to retake
                  it.
                </Alert>

                {disconnectedStudents.length > 0 && (
                  <Box sx={{ mb: 4, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffcc80' }}>
                    <Typography variant="subtitle1" color="error" sx={{ mb: 1, fontWeight: 'bold' }}>
                      ⚠️ Session Terminated / Resume Requests
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Terminated At</TableCell>
                            <TableCell>Time Remaining</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {disconnectedStudents.map((ds) => (
                            <TableRow key={ds._id}>
                              <TableCell>{ds.name} ({ds.studentid})</TableCell>
                              <TableCell>{ds.sessionTerminatedAt ? new Date(ds.sessionTerminatedAt).toLocaleString() : 'N/A'}</TableCell>
                              <TableCell>{ds.timeremaining ? `${Math.floor(ds.timeremaining / 60)}m ${ds.timeremaining % 60}s` : 'N/A'}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  onClick={() => handleAllowResume(ds.studentid)}
                                >
                                  Allow Resume
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {studentsLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : eligibleStudents.length === 0 ? (
                  <Alert severity="warning">
                    No enrolled students found for this test's course.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student Name</TableCell>
                          <TableCell>Reg No</TableCell>
                          <TableCell>Program</TableCell>
                          <TableCell>Submissions</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eligibleStudents.map((student, index) => (
                          <TableRow
                            key={`${student.studentId}-${student.name}-${index}`}
                          >
                            <TableCell>
                              {student.studentName || "Unknown"}
                            </TableCell>
                            <TableCell>{student.regno}</TableCell>
                            <TableCell>
                              {student.enrollmentData?.program ||
                                student.program}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${student.submissionCount || 0
                                  } attempts`}
                                size="small"
                                color={
                                  student.submissionCount > 0
                                    ? "primary"
                                    : "default"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  student.submissionCount > 0
                                    ? "Has Submitted"
                                    : "Not Attempted"
                                }
                                color={
                                  student.submissionCount > 0
                                    ? "success"
                                    : "default"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {(() => {
                                  const submission = student.latestSubmission;
                                  const hasAnyAttempt = student.submissionCount > 0 || !!submission;

                                  if (!hasAnyAttempt) {
                                    return (
                                      <Chip
                                        label="Not Attempted"
                                        color="default"
                                        size="small"
                                      />
                                    );
                                  }

                                  const isResumable =
                                    submission &&
                                    (submission.status === "started" ||
                                      submission.status === "in-progress" ||
                                      submission.status === "submitted");

                                  return (
                                    <>
                                      {/* Allow Resume Button - Only for active/disconnected sessions */}
                                      {isResumable && !submission.canResume ? (
                                        <Button
                                          variant="contained"
                                          color="info"
                                          size="small"
                                          onClick={() =>
                                            handleAllowResume(student.studentId)
                                          }
                                        >
                                          Allow Resume
                                        </Button>
                                      ) : submission?.canResume ? (
                                        <Chip
                                          label="Resume Allowed"
                                          color="info"
                                          size="small"
                                          variant="outlined"
                                        />
                                      ) : null}

                                      {/* Allow Retake Button - Available for any existing attempt */}
                                      <Button
                                        variant="contained"
                                        color="warning"
                                        size="small"
                                        onClick={() =>
                                          handleAllowRetake(student.studentId)
                                        }
                                      >
                                        Allow Retake
                                      </Button>
                                    </>
                                  );
                                })()}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )
          }

          {/* Submissions Tab */}
          {
            activeTab === 4 && (
              <Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {stats.totalSubmissions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Submissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 600, color: "success.main" }}
                        >
                          {stats.passedSubmissions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Passed (
                          {stats.totalSubmissions > 0
                            ? (
                              (stats.passedSubmissions /
                                stats.totalSubmissions) *
                              100
                            ).toFixed(1)
                            : 0}
                          %)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 600, color: "info.main" }}
                        >
                          {stats.averageScore.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Score
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Student Submissions ({submissions.length})
                      </Typography>
                      <Button
                        startIcon={
                          exporting ? (
                            <CircularProgress size={16} />
                          ) : (
                            <PictureAsPdf />
                          )
                        }
                        onClick={exportToPDF}
                        variant="contained"
                        color="primary"
                        disabled={exporting || submissions.length === 0}
                        size="small"
                      >
                        {exporting
                          ? "Generating PDF..."
                          : `Export ${submissions.length} Results to PDF`}
                      </Button>
                    </Box>

                    {loading ? (
                      <Box
                        sx={{ display: "flex", justifyContent: "center", py: 4 }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Student Name</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>Percentage</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Submitted At</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {submissions.map((submission, index) => (
                              <TableRow key={submission._id}>
                                <TableCell>
                                  {submission.name || "Unknown"}
                                </TableCell>
                                <TableCell>
                                  {submission.totalscore || 0}/
                                  {test.totalnoofquestion || 0}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      submission.percentage !== undefined &&
                                        submission.percentage !== null
                                        ? `${parseFloat(
                                          submission.percentage
                                        ).toFixed(1)}%`
                                        : "N/A"
                                    }
                                    color={
                                      submission.passed ? "success" : "error"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={submission.status}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {submission.submissiondate
                                    ? formatDate(submission.submissiondate)
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))}
                            {submissions.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  sx={{ textAlign: "center", py: 4 }}
                                >
                                  No submissions yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )
          }
        </Box >

        {/* Publish Dialog */}
        < Dialog open={publishDialog} onClose={() => setPublishDialog(false)}>
          <DialogTitle>
            {test.ispublished ? "Unpublish Test" : "Publish Test"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {test.ispublished
                ? "Are you sure you want to unpublish this test? Students will no longer be able to access it."
                : "Are you sure you want to publish this test? Students will be able to see and take it."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPublishDialog(false)}>Cancel</Button>
            <Button onClick={handlePublishTest} variant="contained">
              {test.ispublished ? "Unpublish" : "Publish"}
            </Button>
          </DialogActions>
        </Dialog >

        {/* Snackbar for notifications */}
        < Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar >
      </Box >
    </LocalizationProvider >
  );
};

export default ManageTestInterface;
