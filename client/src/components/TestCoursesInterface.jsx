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
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Add,
  PlayArrow,
  Assignment,
  Info,
  AccessTime,
  CheckCircle,
  MoreVert,
  Edit,
  Delete,
  Publish,
} from "@mui/icons-material";
import CreateTestInterface from "./CreateTestInterface";
import TestTakerInterface from "./TestTakerInterface";
import ManageTestInterface from "./ManageTestInterface";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const TestCoursesInterface = () => {
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState("courses"); // 'courses', 'createTest', 'takeTest', 'manageTest'
  const [selectedTest, setSelectedTest] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  const openSnack = (msg, severity = "info") => {
    setSnack({ open: true, msg, severity });
  };

  const closeSnack = (event, reason) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const getUserPermissions = (role) => {
    const roleUpper = role?.toUpperCase();
    return {
      isFaculty: roleUpper === "FACULTY",
      isStudent: roleUpper === "STUDENT",
      canCreateTests: roleUpper === "FACULTY",
      canTakeTests: roleUpper === "STUDENT",
      canViewTests: ["FACULTY", "STUDENT"].includes(roleUpper),
      canManageTests: roleUpper === "FACULTY",
    };
  };

  const permissions = getUserPermissions(global1.userRole);

  useEffect(() => {
    if (permissions.canViewTests) {
      fetchCourses();
    }
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let response;
      if (permissions.isFaculty) {
        response = await ep3.get("/getcoursebyfaculty", {
          params: {
            user: global1.userEmail,
            colid: global1.colid,
          },
        });
      } else {
        response = await ep3.get("/getcoursesbystudent", {
          params: {
            regno: global1.userRegno,
            colid: global1.colid,
          },
        });
      }

      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsForCourse = async (course) => {
    setLoading(true);
    try {
      let response;
      if (permissions.isFaculty) {
        response = await ep3.get("/gettestsbyuser1", {
          params: {
            user: global1.userEmail,
            colid: global1.colid,
          },
        });
      } else {
        response = await ep3.get("/getavailabletestsds1", {
          params: {
            colid: global1.colid,
            classid: course.coursecode,
            user: course.user,
            year: course.year
          },
        });
      }

      if (response.data.success) {
        // Filter tests for selected course
        const courseTests = response.data.data.filter(
          (test) => test.coursecode === course.coursecode
        );
        setTests(courseTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTest = async (test) => {
    try {
      const response = await ep3.post("/publishtestds1", {
        id: test._id,
        colid: global1.colid,
        user: global1.userEmail,
      });

      if (response.data.success) {
        openSnack(
          test.ispublished
            ? "Test unpublished!"
            : "Test published successfully!",
          "success"
        );
        test.ispublished = !test.ispublished;
      }
    } catch (error) {      
      openSnack("Failed to publish test", "error");
    }
  };

  const handleDeleteTest = async (test) => {
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
          openSnack("Test deleted successfully!", "success");
          // Remove from local state
          setTests((prev) => prev.filter((t) => t._id !== test._id));
        }
      } catch (error) {
        console.error("Delete error:", error);
        if (error?.response?.status === 404) {
          openSnack(
            "API route not found. Check server configuration.",
            "error"
          );
        } else {
          openSnack("Failed to delete test", "error");
        }
      }
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchTestsForCourse(course);
  };

  const handleCreateTest = () => {
    setCurrentView("createTest");
  };

  // Add this function to check attempts before starting test
const handleTakeTest = async (test) => {
  // Check if student has reached maximum attempts
  if (test.maxattempts && test.maxattempts > 1) {
    try {
      const response = await ep3.get('/getstudentattemptscount', {
        params: {
          testid: test._id,
          studentid: global1.userEmail,
          colid: global1.colid
        }
      });
      
      if (response.data.success) {
        const attemptCount = response.data.data.attemptCount || 0;
        if (attemptCount >= test.maxattempts) {
          openSnack(`Maximum attempts (${test.maxattempts}) reached for this test`, 'error');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking attempts:', error);
    }
  }
  
  setSelectedTest(test);
  setCurrentView('takeTest');
};


  const handleManageTest = (test) => {
    setSelectedTest(test);
    setCurrentView("manageTest");
  };

  const handleBackToCourses = () => {
    setCurrentView("courses");
    setSelectedCourse(null);
    setSelectedTest(null);
  };

  const handleTestCreated = () => {
    setCurrentView("courses");
    if (selectedCourse) {
      fetchTestsForCourse(selectedCourse);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isTestActive = (test) => {
    const now = new Date();
    const startTime = new Date(test.starttime);
    const endTime = new Date(test.endtime);
    return now >= startTime && now <= endTime;
  };

  const isTestUpcoming = (test) => {
    const now = new Date();
    const startTime = new Date(test.starttime);
    return now < startTime;
  };

  const isTestCompleted = (test) => {
    const now = new Date();
    const endTime = new Date(test.endtime);
    return now > endTime;
  };

  const getTestStatusColor = (test) => {
    if (isTestActive(test)) return "success";
    if (isTestUpcoming(test)) return "info";
    if (isTestCompleted(test)) return "default";
    return "default";
  };

  const getTestStatusText = (test) => {
    if (isTestActive(test)) return "Active";
    if (isTestUpcoming(test)) return "Upcoming";
    if (isTestCompleted(test)) return "Completed";
    return "Draft";
  };

  // Render different views based on current state
  if (currentView === "createTest") {
    return (
      <CreateTestInterface
        course={selectedCourse}
        onBack={handleBackToCourses}
        onTestCreated={handleTestCreated}
      />
    );
  }

  if (currentView === "takeTest") {
    return (
      <TestTakerInterface test={selectedTest} onBack={handleBackToCourses} />
    );
  }

  if (currentView === "manageTest") {
    return (
      <ManageTestInterface test={selectedTest} onBack={handleBackToCourses} />
    );
  }

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <Alert
        severity={permissions.isFaculty ? "info" : "success"}
        sx={{ mb: 3 }}
      >
        {permissions.isFaculty &&
          "As Faculty, you can create and manage tests for your courses."}
        {permissions.isStudent &&
          "As a Student, you can take tests from your enrolled courses."}
      </Alert>

      {!selectedCourse ? (
        // Course Selection View
        <>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {permissions.isFaculty
              ? "Select a course to manage tests:"
              : "Select a course to view available tests:"}
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && courses.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Assignment sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#6b7280" }}>
                {permissions.isFaculty
                  ? "No courses created yet"
                  : "No courses assigned"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 1 }}>
                {permissions.isFaculty
                  ? "Create courses first to add tests"
                  : "Contact your instructor for course enrollment"}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid item xs={12} md={6} lg={4} key={course._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {course.coursename || course.course}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mb: 2 }}
                      >
                        Code: {course.coursecode}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Year: {course.year} • Type: {course.type || "General"}
                      </Typography>

                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button variant="outlined" size="small">
                          {permissions.isFaculty
                            ? "Manage Tests"
                            : "View Tests"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        // Tests for Selected Course View
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedCourse.coursename || selectedCourse.course}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Course Code: {selectedCourse.coursecode}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button onClick={handleBackToCourses} variant="outlined">
                Back to Courses
              </Button>
              {permissions.canCreateTests && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateTest}
                  sx={{
                    backgroundColor: "#f97316",
                    "&:hover": { backgroundColor: "#ea580c" },
                  }}
                >
                  Create Test
                </Button>
              )}
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && tests.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Assignment sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#6b7280" }}>
                {permissions.isFaculty
                  ? "No tests created for this course"
                  : "No tests available for this course"}
              </Typography>
              {permissions.canCreateTests && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateTest}
                  sx={{
                    mt: 2,
                    backgroundColor: "#f97316",
                    "&:hover": { backgroundColor: "#ea580c" },
                  }}
                >
                  Create First Test
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {tests.map((test) => (
                <Grid item xs={12} key={test._id}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {test.testtitle}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6b7280", mb: 2 }}
                          >
                            {test.description || "No description provided"}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Topic:</strong> {test.topic}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Questions:</strong> {test.totalnoofquestion}{" "}
                            • <strong>Duration:</strong> {test.duration} minutes
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={getTestStatusText(test)}
                            color={getTestStatusColor(test)}
                            size="small"
                          />
                          {permissions.canManageTests && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedTest(test);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            <AccessTime
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            Start: {formatDate(test.starttime)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            <AccessTime
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            End: {formatDate(test.endtime)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          {permissions.canTakeTests && isTestActive(test) && (
                            <Button
                              startIcon={<PlayArrow />}
                              onClick={() => handleTakeTest(test)}
                              variant="contained"
                              color="success"
                            >
                              Start Test
                            </Button>
                          )}
                          {permissions.canManageTests && (
                            <Button
                              onClick={() => handleManageTest(test)}
                              variant="outlined"
                            >
                              View Details
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Test Management Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            const test = selectedTest;
            setAnchorEl(null);
            if (test) handleManageTest(test);
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit Test
        </MenuItem>
        <MenuItem
          onClick={() => {
            const test = selectedTest;
            setAnchorEl(null);
            if (test) handlePublishTest(test);
          }}
        >
          <Publish sx={{ mr: 1 }} />
          {selectedTest?.ispublished ? "Unpublish" : "Publish"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const test = selectedTest;
            setAnchorEl(null);
            if (test) handleDeleteTest(test);
          }}
        >
          <Delete sx={{ mr: 1, color: "error.main" }} /> Delete
        </MenuItem>
      </Menu>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestCoursesInterface;
