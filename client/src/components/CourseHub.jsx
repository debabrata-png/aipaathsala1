import React, { useMemo } from "react";
import { Box, Tabs, Tab, Button, Stack, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SyllabusRoom from "./SyllabusRoom";
import CourseMaterialRoom from "./CourseMaterialRoom";
import AssignmentRoom from "./AssignmentRoom";
import EnrollStudentsForCourse from "./enrollment/EnrollStudentsForCourse";
import EnrollmentRequests from "./enrollment/EnrollmentRequests";
import AIChatInterface from "./AIChatInterface";
import global1 from "../pages/global1";
import ManageClassesInterfaceByCourse from "./ManageClassInterfaceByCourse";

const CourseHub = ({
  course,
  socket,
  activeTab,
  onChangeTab,
  onEnterMessages,
}) => {
  // ✅ FIXED: Early return if course is not provided
  if (!course) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Please select a course to continue
        </Typography>
      </Box>
    );
  }

  const isFaculty = (global1?.userRole || "").toUpperCase() === "FACULTY";

  const allTabs = [
  { key: "syllabus", label: "Syllabus" },
  { key: "materials", label: "Materials" },
  { key: "assignments", label: "Assignments" },
  { key: "ai-chat", label: "🤖 AI Chat" },
  { key: "classes", label: isFaculty ? "Manage Classes" : "My Classes" },
  { key: "enroll", label: "Enroll Students" },
  { key: "requests", label: "Enrollment Requests" },
];

  // ✅ FIXED: Enhanced course data validation and debugging
  React.useEffect(() => {
    console.log('🏫 CourseHub course data:', {
      course: course,
      _id: course?._id,
      id: course?.id,
      courseId: course?.courseId,
      coursecode: course?.coursecode,
      coursename: course?.coursename
    });
    if (activeTab === 'ai-chat') {
      console.log('🤖 AI Chat tab active with course data');
    }
  }, [course, activeTab]);

  const tabs = useMemo(() => {
    return isFaculty
      ? allTabs
      : allTabs.filter((t) => !["enroll", "requests"].includes(t.key));
  }, [isFaculty]);

  const roomId = useMemo(() => {
    if (!course?.coursecode || !course?.year) return "";
    const base = `course_${course.coursecode}_${course.year}`;
    if (activeTab === "syllabus") return `${base}_syllabus`;
    if (activeTab === "materials") return `${base}_materials`;
    if (activeTab === "assignments") return `${base}_assignments`;
    return "";
  }, [course?.coursecode, course?.year, activeTab]);

  const buttonLabel =
    activeTab === "syllabus"
      ? "Syllabus Room"
      : activeTab === "materials"
      ? "Materials Room"
      : activeTab === "assignments"
      ? "Assignments Room"
      : activeTab === "ai-chat"
      ? "AI Chat Room"
      : "Enter Message Room";

  const chatEnabled =
    roomId && ["syllabus", "materials", "assignments"].includes(activeTab);

  const showChatButton = chatEnabled && activeTab !== "ai-chat";

  // ✅ FIXED: Add null check for onChangeTab
  const handleTabChange = (event, newValue) => {
    if (onChangeTab && typeof onChangeTab === 'function') {
      onChangeTab(newValue);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            "& .MuiTabs-indicator": { backgroundColor: "#00695C" },
            "& .Mui-selected": { color: "#00695C !important" },
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>

        {showChatButton && (
          <Button
            onClick={() =>
              chatEnabled && onEnterMessages && onEnterMessages({ roomId, tab: activeTab })
            }
            startIcon={<ChatIcon />}
            disabled={!chatEnabled}
            sx={{
              ml: "auto",
              background: chatEnabled
                ? "linear-gradient(45deg, #00695C 30%, #004D40 90%)"
                : "#e5e7eb",
              color: chatEnabled ? "#fff" : "#6b7280",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": chatEnabled
                ? {
                    background:
                      "linear-gradient(45deg, #00574B 30%, #00251A 90%)",
                  }
                : {},
            }}
          >
            {buttonLabel}
          </Button>
        )}
      </Stack>

      {activeTab === "syllabus" && (
        <SyllabusRoom course={course} socket={socket} />
      )}

      {activeTab === "materials" && (
        <CourseMaterialRoom course={course} socket={socket} />
      )}

      {activeTab === "assignments" && (
        <AssignmentRoom course={course} socket={socket} />
      )}

      { activeTab === "classes" && (
        <ManageClassesInterfaceByCourse course={course} />
      )}
      {/* ✅ FIXED: Enhanced AI Chat with proper course data */}
      {activeTab === "ai-chat" && (
        <AIChatInterface course={course} socket={socket} />
      )}

      {isFaculty && activeTab === "enroll" && (
        <EnrollStudentsForCourse course={course} />
      )}

      {isFaculty && activeTab === "requests" && (
        <EnrollmentRequests course={course} />
      )}
    </Box>
  );
};

export default CourseHub;
