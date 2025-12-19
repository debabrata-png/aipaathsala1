import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  List,
  ListItem,
  TextField
} from '@mui/material';
import { Download, Class, DateRange, Refresh, PictureAsPdf, School } from '@mui/icons-material';
import ep3 from '../../api/ep3';
import global1 from '../../pages/global1';
import { generatePDF } from '../../utils/pdfExport';

const ReportsInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ NEW: Date Range Form Component
  const DateRangeForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      endDate: new Date().toISOString().split('T')[0] // today
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.startDate && formData.endDate) {
        onSubmit(formData);
      }
    };

    return (
      <Card sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📅 Select Date Range
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
              >
                Generate Date Range Report
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    );
  };

  // Single Student Form Component
  const SingleStudentForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
      regno: '',
      coursecode: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.regno && formData.coursecode) {
        onSubmit(formData);
      }
    };

    return (
      <Card sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🎓 Student Details
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.regno}
                onChange={(e) => setFormData({...formData, regno: e.target.value})}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Code"
                value={formData.coursecode}
                onChange={(e) => setFormData({...formData, coursecode: e.target.value})}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    );
  };

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'm your attendance report assistant. I can help you generate comprehensive reports:`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: `📊 **Course Report** - Detailed attendance analysis for a specific course\n\n🎓 **Single Student Report** - Detailed report for one specific student\n\n📅 **Date Range Report** - Attendance summary for a custom time period\n\nWhat type of report would you like to generate?`,
      timestamp: new Date(),
      showOptions: true
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // PDF export function
  const exportReportAsPDF = async () => {
    if (!reportData) return;
    setIsGeneratingPDF(true);
    try {
      let filename = `attendance_report_${Date.now()}.pdf`;
      if (reportData.type === 'course')
        filename = `course_report_${reportData.courseInfo?.coursecode || 'unknown'}_${Date.now()}.pdf`;
      else if (reportData.type === 'single')
        filename = `single_student_report_${reportData.student?.regno || 'unknown'}_${Date.now()}.pdf`;
      else if (reportData.type === 'daterange')
        filename = `date_range_report_${Date.now()}.pdf`;

      await generatePDF('report-content', filename);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `📄 PDF report generated successfully! Check your downloads folder for ${filename}`,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to generate PDF. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // CSV export function
  const exportReport = () => {
    if (!reportData) return;
    let csvContent = '';
    let filename = `attendance_report_${Date.now()}.csv`;

    if (reportData.type === 'single') {
      csvContent = 'Date,Attendance\n';
      reportData.student.dailyAttendance.forEach(day => {
        csvContent += `${day.date},${day.attendance}\n`;
      });
      filename = `single_student_report_${reportData.student.regno}_${Date.now()}.csv`;
    } else if (reportData.type === 'course') {
      csvContent = 'Student Name,Registration No,Total Classes,Present,Absent,Attendance %\n';
      reportData.students.forEach(student => {
        csvContent += `${student.student},${student.regno},${student.totalClasses},${student.presentCount},${student.absentCount},${student.attendancePercentage}\n`;
      });
      filename = `course_report_${reportData.courseInfo?.coursecode || 'unknown'}_${Date.now()}.csv`;
    } else if (reportData.type === 'daterange') {
      csvContent = 'Date,Total Students,Total Classes,Present,Absent,Attendance Rate\n';
      reportData.dateRange.forEach(day => {
        csvContent += `${day.date},${day.totalStudents},${day.totalClasses},${day.totalPresent},${day.totalAbsent},${day.attendanceRate}\n`;
      });
      filename = `date_range_report_${Date.now()}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    setMessages(prev => [...prev, {
      type: 'bot',
      content: `📥 Report exported as ${filename}. Check your downloads folder!`,
      timestamp: new Date()
    }]);
  };

  const handleReportTypeSelection = async (type) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: type === 'course' ? '📊 Course Report'
        : type === 'single' ? '🎓 Single Student Report'
        : '📅 Date Range Report',
      timestamp: new Date()
    }]);

    setReportType(type);
    setTimeout(() => {
      if (type === 'course') handleCourseReportFlow();
      else if (type === 'single') handleSingleStudentReportFlow();
      else handleDateRangeReportFlow();
    }, 500);
  };

  const handleSingleStudentReportFlow = () => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content: '🎓 I\'ll generate a detailed report for a single student. Please provide the student details:',
      timestamp: new Date(),
      showSingleStudentForm: true
    }]);
  };

  const generateSingleStudentReport = async (formData) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: `📊 Generate report for student: ${formData.regno} in course: ${formData.coursecode}`,
      timestamp: new Date()
    }]);

    setMessages(prev => [...prev, {
      type: 'bot',
      content: '⏳ Analyzing student attendance data for the last month...',
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await ep3.get('/getsinglestudentreportadvance', {
        params: {
          user: global1.userEmail,
          colid: global1.colid,
          coursecode: formData.coursecode,
          regno: formData.regno
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        setReportData({
          type: 'single',
          student: data.student,
          period: data.period
        });

        setMessages(prev => [...prev, {
          type: 'bot',
          content: `✅ Single student report generated successfully!\n\n📊 **Summary:**\n\n• Student: ${data.student.student}\n• Registration No: ${data.student.regno}\n• Course: ${data.student.course} (${data.student.coursecode})\n• Days Present in Last Month: ${data.student.daysPresent} days\n• Total Classes: ${data.student.totalClasses}\n• Attendance Rate: ${data.student.attendancePercentage}%`,
          timestamp: new Date(),
          showReport: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '❌ No attendance data found for this student. Please check the details and try again.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to generate single student report. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Course Report Flow (fetch courses instead of classes)
  const handleCourseReportFlow = async () => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content: '📚 Great! I\'ll generate a detailed course attendance report. Let me fetch your courses...',
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await ep3.get('/getfacultycoursesadvance', {
        params: { user: global1.userEmail, colid: global1.colid }
      });

      if (response.data.success && response.data.data.length > 0) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Found ${response.data.data.length} courses! Select a course to generate its detailed attendance report:`,
          timestamp: new Date(),
          showCourses: true,
          courseData: response.data.data
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '❌ No courses found. Please create classes first.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to fetch courses. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Generate Course Report (instead of class report)
  const generateCourseReport = async (selectedCourse) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: `📊 Generate report for: ${selectedCourse.course} (${selectedCourse.coursecode})`,
      timestamp: new Date()
    }]);

    setMessages(prev => [...prev, {
      type: 'bot',
      content: '⏳ Analyzing attendance data for the entire course...',
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await ep3.get('/getclassreportbycourseadvance', {
        params: {
          user: global1.userEmail,
          coursecode: selectedCourse.coursecode,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        setReportData({
          type: 'course',
          courseInfo: data.courseInfo,
          students: data.students || [],
          summary: data.summary || {}
        });

        setMessages(prev => [...prev, {
          type: 'bot',
          content: `✅ Course attendance report generated successfully!`,
          timestamp: new Date(),
          showReport: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '❌ No attendance data found for this course. Make sure attendance has been marked.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to generate course report. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Date Range Report Flow with custom date selection
  const handleDateRangeReportFlow = () => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content: '📅 I\'ll generate an attendance summary report for your custom date range. Please select the dates:',
      timestamp: new Date(),
      showDateRangeForm: true
    }]);
  };

  const generateDateRangeReport = async (dateRange) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: `📅 Generate report from ${dateRange.startDate} to ${dateRange.endDate}`,
      timestamp: new Date()
    }]);

    setMessages(prev => [...prev, {
      type: 'bot',
      content: '⏳ Analyzing attendance data for the selected date range...',
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      const response = await ep3.get('/getattendancesummarybydateadvance', {
        params: {
          user: global1.userEmail,
          colid: global1.colid,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      if (response.data.success) {
        setReportData({
          type: 'daterange',
          dateRange: response.data.data,
          startDate: new Date(dateRange.startDate).toLocaleDateString(),
          endDate: new Date(dateRange.endDate).toLocaleDateString(),
          period: response.data.period
        });

        setMessages(prev => [...prev, {
          type: 'bot',
          content: `✅ Date range attendance report generated successfully!`,
          timestamp: new Date(),
          showReport: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '❌ No attendance data found for the specified date range.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '❌ Failed to generate date range report. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{
      type: 'bot',
      content: `👋 Hello ${global1.userName}! I'm your attendance report assistant. I can help you generate comprehensive reports:`,
      timestamp: new Date()
    }, {
      type: 'bot',
      content: `📊 **Course Report** - Detailed attendance analysis for a specific course\n\n🎓 **Single Student Report** - Detailed report for one specific student\n\n📅 **Date Range Report** - Attendance summary for a custom time period\n\nWhat type of report would you like to generate?`,
      timestamp: new Date(),
      showOptions: true
    }]);
    setReportData(null);
    setReportType(null);
  };

  const formatDate = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{
        p: 3, mb: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          📊 Attendance Reports
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Generate comprehensive attendance reports and analytics
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Chat Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ maxHeight: '70vh', overflow: 'auto', p: 2 }}>
              <List sx={{ p: 0 }}>
                {messages.map((message, idx) => (
                  <ListItem key={idx} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                    px: 0
                  }}>
                    <Paper sx={{
                      p: 2, maxWidth: '85%',
                      bgcolor: message.type === 'user' ? '#1976d2' : '#f5f5f5',
                      color: message.type === 'user' ? 'white' : 'inherit',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {message.content}
                      </Typography>

                      {/* Report Type Options */}
                      {message.showOptions && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            onClick={() => handleReportTypeSelection('course')}
                            size="small"
                            sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}>
                            Course Report
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleReportTypeSelection('single')}
                            size="small"
                            sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}>
                            Single Student
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleReportTypeSelection('daterange')}
                            size="small"
                            sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}>
                            Date Range
                          </Button>
                        </Box>
                      )}

                      {/* Single Student Form */}
                      {message.showSingleStudentForm && (
                        <SingleStudentForm onSubmit={generateSingleStudentReport} />
                      )}

                      {/* ✅ UPDATED: Date Range Form */}
                      {message.showDateRangeForm && (
                        <DateRangeForm onSubmit={generateDateRangeReport} />
                      )}

                      {/* ✅ UPDATED: Course Selection (instead of class selection) */}
                      {message.showCourses && message.courseData && (
                        <Card sx={{ mt: 2, p: 2 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            📚 Select Course:
                          </Typography>
                          {message.courseData.map((course) => (
                            <Button
                              key={`${course.coursecode}-${course.semester}-${course.section}`}
                              variant="outlined"
                              onClick={() => generateCourseReport(course)}
                              size="small"
                              sx={{
                                display: 'block',
                                mb: 1,
                                textAlign: 'left',
                                width: '100%',
                                justifyContent: 'flex-start'
                              }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {course.course} ({course.coursecode})
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Semester {course.semester} • Section {course.section} • {course.totalClasses} classes
                                </Typography>
                              </Box>
                            </Button>
                          ))}
                        </Card>
                      )}

                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        {formatDate(message.timestamp)}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
              </List>

              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Generating report...</Typography>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
              <Button startIcon={<Refresh />} onClick={resetChat} size="small">
                New Report
              </Button>
              {reportData && (
                <>
                  <Button
                    startIcon={<Download />}
                    onClick={exportReport}
                    size="small"
                    sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}>
                    Export CSV
                  </Button>
                  <Button
                    startIcon={<PictureAsPdf />}
                    onClick={exportReportAsPDF}
                    disabled={isGeneratingPDF}
                    size="small"
                    sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}>
                    {isGeneratingPDF ? <CircularProgress size={16} /> : 'Export PDF'}
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Report Display Section */}
        {reportData && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box id="report-content" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    📊 {reportData.type === 'course' ? 'Course Attendance Report' :
                      reportData.type === 'single' ? 'Single Student Report' : 'Date Range Report'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      startIcon={<Download />}
                      onClick={exportReport}
                      size="small"
                      sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}>
                      Export CSV
                    </Button>
                    <Button
                      startIcon={<PictureAsPdf />}
                      onClick={exportReportAsPDF}
                      disabled={isGeneratingPDF}
                      size="small"
                      sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}>
                      {isGeneratingPDF ? <CircularProgress size={16} /> : 'Export PDF'}
                    </Button>
                  </Box>
                </Box>

                {/* Single Student Report */}
                {reportData.type === 'single' && (
                  <Box sx={{ p: 2 }}>
                    {/* Student Info */}
                    <Card sx={{ mb: 2, p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Student Information</Typography>
                      <Typography variant="body2"><strong>Student:</strong> {reportData.student.student}</Typography>
                      <Typography variant="body2"><strong>Registration No:</strong> {reportData.student.regno}</Typography>
                      <Typography variant="body2"><strong>Course:</strong> {reportData.student.course}</Typography>
                      <Typography variant="body2"><strong>Course Code:</strong> {reportData.student.coursecode}</Typography>
                    </Card>

                    {/* Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="primary">{reportData.student.daysPresent}</Typography>
                          <Typography variant="caption">Days Present</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="secondary">{reportData.student.totalClasses}</Typography>
                          <Typography variant="caption">Total Classes</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="success.main">{reportData.student.totalPresent}</Typography>
                          <Typography variant="caption">Present</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="error.main">{reportData.student.attendancePercentage}%</Typography>
                          <Typography variant="caption">Attendance Rate</Typography>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Daily Attendance Table */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Daily Attendance ({reportData.period.startDate} to {reportData.period.endDate})
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Attendance</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.student.dailyAttendance.map((day, index) => (
                                <TableRow key={index}>
                                  <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={day.attendance}
                                      color={day.attendance === 'Present' ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* ✅ UPDATED: Course Report (instead of Class Report) */}
                {reportData.type === 'course' && (
                  <Box sx={{ p: 2 }}>
                    {/* Course Info */}
                    <Card sx={{ mb: 2, p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Course Information</Typography>
                      <Typography variant="body2"><strong>Course:</strong> {reportData.courseInfo.course}</Typography>
                      <Typography variant="body2"><strong>Code:</strong> {reportData.courseInfo.coursecode}</Typography>
                      <Typography variant="body2"><strong>Semester:</strong> {reportData.courseInfo.semester}</Typography>
                      <Typography variant="body2"><strong>Section:</strong> {reportData.courseInfo.section}</Typography>
                    </Card>

                    {/* Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="primary">{reportData.summary.totalStudents || 0}</Typography>
                          <Typography variant="caption">Total Students</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="secondary">{reportData.summary.totalClasses || 0}</Typography>
                          <Typography variant="caption">Total Classes</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="success.main">{reportData.summary.totalPresent || 0}</Typography>
                          <Typography variant="caption">Present</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h6" color="info.main">{reportData.summary.overallAttendanceRate || 0}%</Typography>
                          <Typography variant="caption">Attendance Rate</Typography>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Students Table */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Student Attendance Details</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Student Name</strong></TableCell>
                                <TableCell><strong>Reg. No.</strong></TableCell>
                                <TableCell><strong>Classes</strong></TableCell>
                                <TableCell><strong>Present</strong></TableCell>
                                <TableCell><strong>Absent</strong></TableCell>
                                <TableCell><strong>Rate</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.students.map((student, index) => (
                                <TableRow key={index}>
                                  <TableCell>{student.student}</TableCell>
                                  <TableCell>{student.regno}</TableCell>
                                  <TableCell>{student.totalClasses}</TableCell>
                                  <TableCell>{student.presentCount}</TableCell>
                                  <TableCell>{student.absentCount}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${student.attendancePercentage || 0}%`}
                                      color={parseFloat(student.attendancePercentage || 0) >= 75 ? 'success' :
                                        parseFloat(student.attendancePercentage || 0) >= 60 ? 'warning' : 'error'}
                                      size="small"
                                      sx={{
                                        minWidth: '45px',
                                        fontSize: '10px',
                                        height: '22px'
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Date Range Report */}
                {reportData.type === 'daterange' && (
                  <Box sx={{ p: 2 }}>
                    <Card sx={{ mb: 2, p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Date Range Information</Typography>
                      <Typography variant="body2"><strong>Period:</strong> {reportData.startDate} to {reportData.endDate}</Typography>
                    </Card>

                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Daily Attendance Summary</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Students</strong></TableCell>
                                <TableCell><strong>Classes</strong></TableCell>
                                <TableCell><strong>Present</strong></TableCell>
                                <TableCell><strong>Absent</strong></TableCell>
                                <TableCell><strong>Rate</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.dateRange.map((day, index) => (
                                <TableRow key={index}>
                                  <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{day.totalStudents}</TableCell>
                                  <TableCell>{day.totalClasses}</TableCell>
                                  <TableCell>{day.totalPresent}</TableCell>
                                  <TableCell>{day.totalAbsent}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${day.attendanceRate || 0}%`}
                                      color={parseFloat(day.attendanceRate || 0) >= 75 ? 'success' :
                                        parseFloat(day.attendanceRate || 0) >= 60 ? 'warning' : 'error'}
                                      size="small"
                                      sx={{
                                        minWidth: '45px',
                                        fontSize: '10px',
                                        height: '22px'
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ReportsInterface;
