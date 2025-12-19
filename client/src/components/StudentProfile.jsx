import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  School,
  Assignment,
  Quiz,
  TrendingUp,
  CheckCircle,
  Schedule,
  MenuBook,
  EmojiEvents,
} from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        regno: global1.userRegno,
        colid: global1.colid,
      };

      const [
        profileRes,
        statsRes,
        activitiesRes,
        assignmentsRes,
        testsRes,
        coursesRes,
      ] = await Promise.all([
        ep3.get("/getstudentprofile", { params }),
        ep3.get("/getstudentprofilestats", { params }),
        ep3.get("/getstudentrecentactivities", { params }),
        ep3.get("/getstudentupcomingassignments", { params }),
        ep3.get("/getstudentpcomingtests", { params }),
        ep3.get("/getstudentcoursesdetails", { params }),
      ]);

      if (profileRes.data.success) setUserInfo(profileRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (activitiesRes.data.success)
        setRecentActivities(activitiesRes.data.data);
      if (assignmentsRes.data.success)
        setUpcomingAssignments(assignmentsRes.data.data);
      if (testsRes.data.success) setUpcomingTests(testsRes.data.data);
      if (coursesRes.data.success) setCourseDetails(coursesRes.data.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#059669" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section - GREEN GRADIENT */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #00695C 0%, #004D40 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar
            sx={{ width: 100, height: 100, border: "4px solid white" }}
            src={userInfo?.photo || ""}
          >
            {userInfo?.name?.charAt(0) || "S"}
          </Avatar>
          <Box sx={{ flex: 1, color: "white" }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {userInfo?.name || "Student"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {userInfo?.email || "N/A"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Chip
                label={`Regno: ${userInfo?.regno || "N/A"}`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
              <Chip
                label={`${userInfo?.department || "N/A"}`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
              <Chip
                label={`Sem ${userInfo?.semester || "N/A"} - Sec ${
                  userInfo?.section || "N/A"
                }`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards - ALL GREEN SHADES */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #00695C 0%, #004D40 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.enrollments?.total || 0}
                  </Typography>
                  <Typography variant="body2">Total Courses</Typography>
                </Box>
                <School sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.tests?.completed || 0}/{stats?.tests?.total || 0}
                  </Typography>
                  <Typography variant="body2">Tests Completed</Typography>
                </Box>
                <Quiz sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.tests?.averageScore?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2">Average Score</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.tests?.upcoming || 0}
                  </Typography>
                  <Typography variant="body2">Upcoming Tests</Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root.Mui-selected": { color: "#059669" },
            "& .MuiTabs-indicator": { backgroundColor: "#059669" },
          }}
        >
          <Tab label="Overview" icon={<School />} iconPosition="start" />
          <Tab label="My Courses" icon={<MenuBook />} iconPosition="start" />
          <Tab label="Upcoming" icon={<Schedule />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Enrollment Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#00695C",
                  }}
                >
                  <School /> Course Enrollments
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Regular Courses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.enrollments?.regular || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (stats?.enrollments?.regular /
                        (stats?.enrollments?.total || 1)) *
                      100
                    }
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      mb: 2,
                      bgcolor: "#e0f2f1",
                      "& .MuiLinearProgress-bar": { bgcolor: "#00695C" },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Advance Courses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.enrollments?.advance || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (stats?.enrollments?.advance /
                        (stats?.enrollments?.total || 1)) *
                      100
                    }
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      mb: 2,
                      bgcolor: "#e0f2f1",
                      "& .MuiLinearProgress-bar": { bgcolor: "#059669" },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Remedial Courses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats?.enrollments?.remedial || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (stats?.enrollments?.remedial /
                        (stats?.enrollments?.total || 1)) *
                      100
                    }
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: "#e0f2f1",
                      "& .MuiLinearProgress-bar": { bgcolor: "#10b981" },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#00695C",
                  }}
                >
                  <EmojiEvents /> Test Performance
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: "#e0f2f1", textAlign: "center" }}
                    >
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#00695C" }}
                      >
                        {stats?.tests?.completed || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: "#d1fae5", textAlign: "center" }}
                    >
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#059669" }}
                      >
                        {stats?.tests?.pending || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Pending
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography
                        variant="h2"
                        sx={{ fontWeight: 700, color: "#10b981" }}
                      >
                        {stats?.tests?.averageScore?.toFixed(1) || 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average Score
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: "#00695C" }}>
                  Recent Activities
                </Typography>
                {recentActivities.length === 0 ? (
                  <Alert severity="info">No recent activities found.</Alert>
                ) : (
                  <List>
                    {recentActivities.slice(0, 10).map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {activity.type === "test" ? (
                                  <Quiz sx={{ color: "#00695C" }} />
                                ) : (
                                  <School sx={{ color: "#059669" }} />
                                )}
                                <Typography variant="body1">
                                  {activity.title}
                                </Typography>
                                {activity.type === "test" && activity.score && (
                                  <Chip
                                    label={`${activity.percentage}%`}
                                    size="small"
                                    sx={{
                                      bgcolor: "#d1fae5",
                                      color: "#059669",
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {activity.coursecode} •{" "}
                                  {formatDate(activity.date)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {courseDetails?.regular && courseDetails.regular.length > 0 && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: "#00695C" }}>
                    Regular Courses ({courseDetails.regular.length})
                  </Typography>
                  <List dense>
                    {courseDetails.regular.map((course, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={course.course}
                          secondary={course.coursecode}
                        />
                        <CheckCircle
                          sx={{ color: "#00695C" }}
                          fontSize="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {courseDetails?.advance && courseDetails.advance.length > 0 && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: "#059669" }}>
                    Advance Courses ({courseDetails.advance.length})
                  </Typography>
                  <List dense>
                    {courseDetails.advance.map((course, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={course.course}
                          secondary={course.coursecode}
                        />
                        <CheckCircle
                          sx={{ color: "#059669" }}
                          fontSize="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {courseDetails?.remedial && courseDetails.remedial.length > 0 && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: "#10b981" }}>
                    Remedial Courses ({courseDetails.remedial.length})
                  </Typography>
                  <List dense>
                    {courseDetails.remedial.map((course, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={course.course}
                          secondary={course.coursecode}
                        />
                        <CheckCircle
                          sx={{ color: "#10b981" }}
                          fontSize="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {!courseDetails?.regular?.length &&
            !courseDetails?.advance?.length &&
            !courseDetails?.remedial?.length && (
              <Grid item xs={12}>
                <Alert severity="info">No enrolled courses found.</Alert>
              </Grid>
            )}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#00695C",
                  }}
                >
                  <Quiz /> Upcoming Tests ({upcomingTests.length})
                </Typography>
                {upcomingTests.length === 0 ? (
                  <Alert severity="info">No upcoming tests scheduled.</Alert>
                ) : (
                  <List>
                    {upcomingTests.map((test, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={test.testname || "Test"}
                            secondary={
                              <>
                                <Typography variant="caption" display="block">
                                  {test.coursecode} •{" "}
                                  {formatDate(test.scheduleddate)}
                                </Typography>
                                <Chip
                                  label={`${test.duration || 0} min`}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    bgcolor: "#e0f2f1",
                                    color: "#00695C",
                                  }}
                                />
                              </>
                            }
                          />
                        </ListItem>
                        {index < upcomingTests.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#059669",
                  }}
                >
                  <Assignment /> Upcoming Assignments (
                  {upcomingAssignments.length})
                </Typography>
                {upcomingAssignments.length === 0 ? (
                  <Alert severity="info">No upcoming assignments.</Alert>
                ) : (
                  <List>
                    {upcomingAssignments.map((assignment, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={assignment.topic || "Assignment"}
                            secondary={
                              <>
                                <Typography variant="caption" display="block">
                                  {assignment.coursecode} •{" "}
                                  {formatDate(assignment.classdate)}
                                </Typography>
                                {assignment.module && (
                                  <Chip
                                    label={assignment.module}
                                    size="small"
                                    sx={{
                                      mt: 0.5,
                                      bgcolor: "#d1fae5",
                                      color: "#059669",
                                    }}
                                  />
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < upcomingAssignments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StudentProfile;
