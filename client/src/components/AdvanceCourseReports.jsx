import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Chip, CircularProgress } from '@mui/material';
import { getAttendanceSummary, getAttendanceBelow, getCourseSummary, getAssignmentsSummary, getTestsSummary, getAttendanceBySession, getAttendanceStudentTable, getCourseOverTime, getAssignmentsByAssignment, getTestsByTest, getSyllabusSummary, getSyllabusBySession, getMaterialsSummary, getMaterialsOverTime, getAiSummary, getCollabSummary, getCollabOverTime, getLibrarySummary, getNotificationsSummary } from '../api/reports';
import global1 from '../pages/global1';

const AdvanceCourseReports = () => {
  const [coursecode, setCoursecode] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [below, setBelow] = useState([]);
  const [bySession, setBySession] = useState([]);
  const [studentTable, setStudentTable] = useState([]);
  const [enrollOverTime, setEnrollOverTime] = useState([]);
  const [assnByAssn, setAssnByAssn] = useState([]);
  const [testsBy, setTestsBy] = useState([]);
  const [syllabusSum, setSyllabusSum] = useState(null);
  const [syllabusBy, setSyllabusBy] = useState([]);
  const [materialsSum, setMaterialsSum] = useState(null);
  const [materialsBy, setMaterialsBy] = useState([]);
  const [aiSum, setAiSum] = useState(null);
  const [collabSum, setCollabSum] = useState(null);
  const [collabBy, setCollabBy] = useState([]);
  const [librarySum, setLibrarySum] = useState(null);
  const [notifSum, setNotifSum] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');

  const loadReports = async () => {
    if (!coursecode) return;
    setLoading(true);
    try {
      const params = { coursecode, colid: global1.colid, from, to };
      const [att, low, enr, asg, ses, stu, enrt, asgBy, syl, sylBy, mat, matBy, ai, col, colBy, lib, noti] = await Promise.all([
        getAttendanceSummary('advance', params),
        getAttendanceBelow('advance', { ...params, threshold: 75 }),
        getCourseSummary('advance', params),
        getAssignmentsSummary('advance', params),
        getAttendanceBySession('advance', params),
        getAttendanceStudentTable('advance', params),
        getCourseOverTime('advance', params),
        getAssignmentsByAssignment('advance', params),
        getSyllabusSummary('advance', params),
        getSyllabusBySession('advance', params),
        getMaterialsSummary('advance', params),
        getMaterialsOverTime('advance', params),
        getAiSummary('advance', params),
        getCollabSummary('advance', params),
        getCollabOverTime('advance', params),
        getLibrarySummary('advance', params),
        getNotificationsSummary('advance', params),
      ]);
      setSummary({
        attendance: att?.data?.data || {},
        enrollments: enr?.data?.data || {},
        assignments: asg?.data?.data || {},
      });
      setBelow(low?.data?.data || []);
      setBySession(ses?.data?.data || []);
      setStudentTable(stu?.data?.data || []);
      setEnrollOverTime(enrt?.data?.data || []);
      setAssnByAssn(asgBy?.data?.data || []);
      setTestsBy(tstBy?.data?.data || []);
      setSyllabusSum(syl?.data?.data || null);
      setSyllabusBy(sylBy?.data?.data || []);
      setMaterialsSum(mat?.data?.data || null);
      setMaterialsBy(matBy?.data?.data || []);
      setAiSum(ai?.data?.data || null);
      setCollabSum(col?.data?.data || null);
      setCollabBy(colBy?.data?.data || []);
      setLibrarySum(lib?.data?.data || null);
      setNotifSum(noti?.data?.data || null);
    } catch (e) {
      setSummary(null);
      setBelow([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, caption }) => (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
      </CardContent>
    </Card>
  );

  const BandBar = ({ bands }) => {
    const total = (bands?.lt50 || 0) + (bands?.b50_74 || 0) + (bands?.b75_89 || 0) + (bands?.gte90 || 0);
    const pct = (n) => (total ? Math.round((n * 100) / total) : 0);
    return (
      <Box sx={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
        <Box sx={{ width: `${pct(bands?.lt50 || 0)}%`, background: '#ef4444' }} />
        <Box sx={{ width: `${pct(bands?.b50_74 || 0)}%`, background: '#f59e0b' }} />
        <Box sx={{ width: `${pct(bands?.b75_89 || 0)}%`, background: '#38bdf8' }} />
        <Box sx={{ width: `${pct(bands?.gte90 || 0)}%`, background: '#22c55e' }} />
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Paper elevation={2} sx={{ p: 2, backgroundColor: '#1565c0', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>🚀 Advance Course Reports</Typography>
        <Typography variant="body2">KPIs, bands, and tables for advance courses</Typography>
      </Paper>

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {['attendance','courses','assignments','syllabus','materials','ai','collab','library','notifications'].map(tab => (
            <Button key={tab} size="small" variant={activeTab===tab?'contained':'outlined'} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </Button>
          ))}
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField label="Course Code" fullWidth size="small" value={coursecode} onChange={(e) => setCoursecode(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="From" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="To" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={loadReports} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : 'Load'}
            </Button>
          </Grid>
        </Grid>

        {summary && activeTab==='attendance' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <StatCard title="Students" value={summary.enrollments.total || 0} caption={`Active: ${summary.enrollments.active || 0}`} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard title="Avg Attendance" value={`${Math.round(summary.attendance.averagePercent || 0)}%`} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard title="Assignments" value={summary.assignments.assignmentsCount || 0} caption={`Submissions: ${summary.assignments.submissionsCount || 0}`} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <StatCard title="Tests Pass Rate" value={`${Math.round(summary.tests.passRate || 0)}%`} caption={`Attendees: ${summary.tests.attendees || 0}`} />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Attendance Bands</Typography>
                <BandBar bands={summary.attendance.bands} />
                <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`<50%: ${summary.attendance.bands?.lt50 || 0}`} color="error" />
                  <Chip size="small" label={`50-74%: ${summary.attendance.bands?.b50_74 || 0}`} color="warning" />
                  <Chip size="small" label={`75-89%: ${summary.attendance.bands?.b75_89 || 0}`} color="info" />
                  <Chip size="small" label={`>=90%: ${summary.attendance.bands?.gte90 || 0}`} color="success" />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab==='attendance' && below.length > 0 && (
          <TableContainer component={Paper}>
            <Typography variant="h6" sx={{ p: 2 }}>Students Below 75%</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Reg. No.</TableCell>
                  <TableCell align="right">Percent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {below.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.regno}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={`${Math.round(s.percent)}%`} color={s.percent >= 75 ? 'success' : s.percent >= 60 ? 'warning' : 'error'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab==='attendance' && bySession.length > 0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Attendance By Session</Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              {bySession.map((d, i) => {
                const rate = d.total ? Math.round((d.present * 100) / d.total) : 0;
                return (
                  <Box key={i} sx={{ minWidth: 120 }}>
                    <Typography variant="caption">{d.date}</Typography>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                      <Box sx={{ width: '40%', height: `${rate}%`, background: '#22c55e' }} />
                      <Box sx={{ width: '40%', height: `${100 - rate}%`, background: '#ef4444' }} />
                    </Box>
                    <Typography variant="caption">{rate}%</Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}

        {activeTab==='attendance' && studentTable.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ p: 2 }}>Student Attendance Table</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Reg. No.</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Absent</TableCell>
                  <TableCell align="right">Percent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentTable.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.regno}</TableCell>
                    <TableCell>{s.present}</TableCell>
                    <TableCell>{s.total}</TableCell>
                    <TableCell>{s.absent}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={`${Math.round(s.percent)}%`} color={s.percent >= 75 ? 'success' : s.percent >= 60 ? 'warning' : 'error'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab==='courses' && enrollOverTime.length > 0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
        {activeTab==='assignments' && assnByAssn.length > 0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Assignments</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              {assnByAssn.map((a,i)=> (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 18, height: `${(a.submissions||0)*10}px`, background: '#f59e0b', borderRadius: '4px' }} />
                  <Typography variant="caption">{(a.assignment||'').slice(0,6)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {activeTab==='tests' && testsBy.length > 0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Tests</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {testsBy.map((t,i)=> (
                <Card key={i} sx={{ minWidth: 200 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.title}</Typography>
                    <Typography variant="caption">Attendees: {t.attendees}</Typography><br/>
                    <Typography variant="caption">Pass: {t.pass} • Fail: {t.fail}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        )}

        {activeTab==='syllabus' && syllabusSum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}><StatCard title="Modules" value={syllabusSum.total||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Completed" value={syllabusSum.completed||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Pending" value={syllabusSum.pending||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Progress" value={`${Math.round(syllabusSum.percent||0)}%`} /></Grid>
          </Grid>
        )}
        {activeTab==='syllabus' && syllabusBy.length>0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Coverage Over Time</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 120 }}>
              {syllabusBy.map((d,i)=> (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 18, height: `${Math.round(d.percent)}px`, background: '#10b981', borderRadius: '4px' }} />
                  <Typography variant="caption">{d.date.slice(5)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {activeTab==='materials' && materialsSum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}><StatCard title="Files" value={materialsSum.total||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="PDF" value={materialsSum.pdf||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Video" value={materialsSum.video||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Doc" value={materialsSum.doc||0} /></Grid>
          </Grid>
        )}
        {activeTab==='materials' && materialsBy.length>0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Uploads Over Time</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 120 }}>
              {materialsBy.map((d,i)=> (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 18, height: `${d.count*10}px`, background: '#6366f1', borderRadius: '4px' }} />
                  <Typography variant="caption">{d.date.slice(5)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {activeTab==='ai' && aiSum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}><StatCard title="Analyses" value={aiSum.total||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Completed" value={aiSum.completed||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Processing" value={aiSum.processing||0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Failed" value={aiSum.failed||0} /></Grid>
          </Grid>
        )}

        {activeTab==='collab' && collabSum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}><StatCard title="Active" value={collabSum.active||0} /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Posts" value={collabSum.posts||0} /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Requests" value={collabSum.requests||0} /></Grid>
          </Grid>
        )}
        {activeTab==='collab' && collabBy.length>0 && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Collab Posts Over Time</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 120 }}>
              {collabBy.map((d,i)=> (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 18, height: `${d.count*10}px`, background: '#14b8a6', borderRadius: '4px' }} />
                  <Typography variant="caption">{d.date.slice(5)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {activeTab==='library' && librarySum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={2}><StatCard title="Books" value={librarySum.books||0} /></Grid>
            <Grid item xs={12} sm={2}><StatCard title="Projects" value={librarySum.projects||0} /></Grid>
            <Grid item xs={12} sm={2}><StatCard title="Publications" value={librarySum.publications||0} /></Grid>
            <Grid item xs={12} sm={2}><StatCard title="Seminars" value={librarySum.seminars||0} /></Grid>
            <Grid item xs={12} sm={2}><StatCard title="Patents" value={librarySum.patents||0} /></Grid>
          </Grid>
        )}

        {activeTab==='notifications' && notifSum && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}><StatCard title="Total" value={notifSum.total||0} /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Read" value={notifSum.read||0} /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Unread" value={notifSum.unread||0} /></Grid>
          </Grid>
        )}
            <Typography variant="h6" sx={{ mb: 1 }}>Enrollments Over Time</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 120 }}>
              {enrollOverTime.map((d, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 18, height: `${d.count * 10}px`, background: '#3b82f6', borderRadius: '4px' }} />
                  <Typography variant="caption">{d.date.slice(5)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AdvanceCourseReports;


