import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from "@mui/material";
import {
  Assessment,
  TrendingUp,
  CheckCircle,
  Cancel,
  Timer,
  Quiz,
  School,
  EmojiEvents,
  Visibility,
  ExpandMore,
} from "@mui/icons-material";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const TestResultsInterface = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const getUserPermissions = (role) => {
    const roleUpper = role?.toUpperCase();
    return {
      isFaculty: roleUpper === "FACULTY",
      isStudent: roleUpper === "STUDENT",
    };
  };

  const permissions = getUserPermissions(global1.userRole);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await ep3.get("/gettestsubmissionsbyuser1", {
        params: {
          colid: global1.colid,
          user: global1.userEmail,
        },
      });
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    if (results.length === 0)
      return { totalTests: 0, averageScore: 0, passedTests: 0 };
    const totalTests = results.length;
    const averageScore =
      results.reduce((sum, result) => sum + (result.percentage || 0), 0) /
      totalTests;
    const passedTests = results.filter((result) => result.passed).length;
    return { totalTests, averageScore, passedTests };
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "success";
      case "B":
        return "info";
      case "C":
        return "warning";
      case "D":
        return "warning";
      case "F":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setDetailsDialog(true);
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {permissions.isFaculty ? "Test Results Overview" : "My Test Results"}
      </Typography>

      {results.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {permissions.isFaculty
              ? "No test results available yet"
              : "You haven't taken any tests yet"}
          </Typography>
          <Typography variant="body2">
            {permissions.isFaculty
              ? "Results will appear here once students complete tests"
              : "Check the Available Tests tab to take your first test"}
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Quiz sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalTests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tests Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Assessment
                    sx={{ fontSize: 40, color: "info.main", mb: 1 }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.averageScore.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <EmojiEvents
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.passedTests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tests Passed (
                    {stats.totalTests > 0
                      ? ((stats.passedTests / stats.totalTests) * 100).toFixed(
                          0
                        )
                      : 0}
                    %)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Performance Alert */}
          {stats.totalTests > 0 && (
            <Alert
              severity={
                stats.averageScore >= 70
                  ? "success"
                  : stats.averageScore >= 50
                  ? "info"
                  : "warning"
              }
              sx={{ mb: 3 }}
            >
              {stats.averageScore >= 70 &&
                "Excellent performance! Keep up the great work!"}
              {stats.averageScore >= 50 &&
                stats.averageScore < 70 &&
                "Good progress! Consider reviewing areas where you can improve."}
              {stats.averageScore < 50 &&
                "There's room for improvement. Focus on understanding the concepts better."}
            </Alert>
          )}

          {/* Results List */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Test Results
          </Typography>

          <Grid container spacing={2}>
            {results.map((result) => (
              <Grid item xs={12} key={result._id}>
                <Card
                  sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
                  onClick={() => handleViewDetails(result)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {result.testtitle}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mb: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={result.passed ? "Passed" : "Failed"}
                            color={result.passed ? "success" : "error"}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Grade: ${result.grade || "N/A"}`}
                            color={getGradeColor(result.grade)}
                            size="small"
                          />
                          {result.sectionBased && (
                            <Chip
                              label="Section-based"
                              color="info"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Score: {result.totalscore}/
                          {result.answers?.length || 0} • Submitted:{" "}
                          {formatDate(result.submissiondate)}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {result.percentage?.toFixed(1) || 0}%
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(result);
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Result Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test Result Details: {selectedResult?.testtitle}
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              {/* Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {selectedResult.percentage?.toFixed(1) || 0}%
                      </Typography>
                      <Typography variant="body2">Final Score</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 600,
                          color: getGradeColor(selectedResult.grade),
                        }}
                      >
                        {selectedResult.grade || "N/A"}
                      </Typography>
                      <Typography variant="body2">Grade</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Test Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Test Information
                </Typography>
                <Typography variant="body2">
                  Questions: {selectedResult.answers?.length || 0} • Status:{" "}
                  {selectedResult.status} • Submitted:{" "}
                  {formatDate(selectedResult.submissiondate)}
                </Typography>
                {selectedResult.tabswitches > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Tab switches detected: {selectedResult.tabswitches} times
                  </Alert>
                )}
              </Box>

              {/* Section Scores (if section-based) */}
              {selectedResult.sectionBased &&
                selectedResult.sectionScores &&
                selectedResult.sectionScores.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Section Performance
                    </Typography>
                    {selectedResult.sectionScores.map((section, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {section.sectionName}
                            </Typography>
                            <Chip
                              label={`${
                                section.sectionPercentage?.toFixed(1) || 0
                              }%`}
                              color={
                                section.sectionPercentage >= 70
                                  ? "success"
                                  : section.sectionPercentage >= 50
                                  ? "warning"
                                  : "error"
                              }
                              size="small"
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Correct: {section.correctAnswers}/
                            {section.totalQuestions} • Answered:{" "}
                            {section.answeredQuestions}/{section.totalQuestions}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={section.sectionPercentage || 0}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}

              {/* Answer Breakdown */}
              {selectedResult.answers && selectedResult.answers.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Answer Breakdown
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Question</TableCell>
                          {selectedResult.sectionBased && (
                            <TableCell>Section</TableCell>
                          )}
                          <TableCell>Answer</TableCell>
                          <TableCell>Result</TableCell>
                          <TableCell>Points</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedResult.answers.map((answer, index) => (
                          <TableRow key={index}>
                            <TableCell>Q{answer.questionnumber}</TableCell>
                            {selectedResult.sectionBased && (
                              <TableCell>{answer.section || "N/A"}</TableCell>
                            )}
                            <TableCell>
                              {answer.selectedanswer ? (
                                <Typography variant="body2" noWrap>
                                  {answer.selectedanswer.length > 50
                                    ? `${answer.selectedanswer.substring(
                                        0,
                                        50
                                      )}...`
                                    : answer.selectedanswer}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No answer
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={
                                  answer.iscorrect ? (
                                    <CheckCircle />
                                  ) : (
                                    <Cancel />
                                  )
                                }
                                label={
                                  answer.iscorrect ? "Correct" : "Incorrect"
                                }
                                color={answer.iscorrect ? "success" : "error"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {answer.points || 0}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestResultsInterface;
