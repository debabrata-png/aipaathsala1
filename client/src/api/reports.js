import ep3 from './ep3';

export const getAttendanceSummary = (type, params) => ep3.get(`/reports/${type}/attendance/summary`, { params });
export const getAttendanceBelow = (type, params) => ep3.get(`/reports/${type}/attendance/below-threshold`, { params });
export const getCourseSummary = (type, params) => ep3.get(`/reports/${type}/course/summary`, { params });
export const getAssignmentsSummary = (type, params) => ep3.get(`/reports/${type}/assignments/summary`, { params });
export const getTestsSummary = (type, params) => ep3.get(`/reports/${type}/tests/summary`, { params });
export const getAssignmentsByAssignment = (type, params) => ep3.get(`/reports/${type}/assignments/by-assignment`, { params });
export const getTestsByTest = (type, params) => ep3.get(`/reports/${type}/tests/by-test`, { params });
export const getSyllabusSummary = (type, params) => ep3.get(`/reports/${type}/syllabus/summary`, { params });
export const getSyllabusBySession = (type, params) => ep3.get(`/reports/${type}/syllabus/by-session`, { params });
export const getMaterialsSummary = (type, params) => ep3.get(`/reports/${type}/materials/summary`, { params });
export const getMaterialsOverTime = (type, params) => ep3.get(`/reports/${type}/materials/over-time`, { params });
export const getAiSummary = (type, params) => ep3.get(`/reports/${type}/ai/summary`, { params });
export const getCollabSummary = (type, params) => ep3.get(`/reports/${type}/collab/summary`, { params });
export const getCollabOverTime = (type, params) => ep3.get(`/reports/${type}/collab/over-time`, { params });
export const getLibrarySummary = (type, params) => ep3.get(`/reports/${type}/library/summary`, { params });
export const getNotificationsSummary = (type, params) => ep3.get(`/reports/${type}/notifications/summary`, { params });
export const getAttendanceBySession = (type, params) => ep3.get(`/reports/${type}/attendance/by-session`, { params });
export const getAttendanceStudentTable = (type, params) => ep3.get(`/reports/${type}/attendance/student-table`, { params });
export const getCourseOverTime = (type, params) => ep3.get(`/reports/${type}/course/over-time`, { params });


