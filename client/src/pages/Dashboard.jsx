import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import { Menu, ArrowBack } from "@mui/icons-material";
import socket from "../api/ep2";
import Sidebar from "../components/Sidebar";
import ChatInterface from "../components/ChatInterface";
import PatentsInterface from "../components/PatentsInterface";
import ProjectsInterface from "../components/ProjectsInterface";
import PublicationsInterface from "../components/PublicationsInterface";
import SeminarsInterface from "../components/SeminarsInterface";
import ConsultancyInterface from "../components/ConsultancyInterface";
import TestsInterface from "../components/TestsInterface";
import FacultyProfile from "../components/FacultyProfile";
import CollaborationInterface from "../components/CollaborationInterface";
import global1 from "./global1";
import ClassesInterface from "../components/ClassesInterface";
import ReportsInterface from "../components/ReportsInterface";
import AdvanceCourseReports from "../components/AdvanceCourseReports";
import RemedialCourseReports from "../components/RemedialCourseReports";
import CollaborationChat from "../components/collaboration/CollaborationChat";
import CourseHub from "../components/CourseHub";
import MessageSection from "../components/MessageSection";
import AIVideoAnalysisInterface from "../components/AIVideoAnalysisInterface";
import AIChatInterface from "../components/AIChatInterface";
import APIKeyManagerInterface from "../components/APIKeyManagerInterface";
import BooksInterface from "../components/BooksInterface";
import AdvanceCourseHub from "../components/AdvanceCourseHub";
import RemedialCourseHub from "../components/RemedialCourseHub";
import AdvanceClassInterface from "../components/AdvanceClassInterface";
import RemedialClassInterface from "../components/RemedialClassInterface";
import AdvanceClassesInterface from "../components/AdvanceClassInterface";
import AdvanceAIVideoAnalysisInterface from "../components/AdvanceAIVideoAnalysisInterface";
import RemedialAiVideoAnalysisInterface from "../components/RemedialAiVideoAnalysis";
import StudentProfile from "../components/StudentProfile";
import ConsolidatedAttendanceReport from "../components/ConsolidatedAttendanceReport";

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState("course");
  const [selectedRoom, setSelectedRoom] = useState("syllabus");
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  // NEW: per-tab messaging
  const [activeCourseTab, setActiveCourseTab] = useState("syllabus");
  const [showCourseMessages, setShowCourseMessages] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [localSocket, setLocalSocket] = useState(null); // Renamed to avoid conflict with imported 'socket'

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    // Initialize socket connection
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }
    setLocalSocket(socket); // Set the local state to the imported socket instance

    // Cleanup on unmount - we don't necessarily want to disconnect the global socket 
    // but the original code did. Given it's a dashboard, it might be fine to keep it connected.
    // However, for consistency with original behavior if needed:
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  const handleOpenChat = (collaboration) => {
    setSelectedChatRoom(collaboration);
    setSelectedSection("chat-rooms");
    if (isMobile) setMobileOpen(false);
  };

  // ✅ FIXED: Enhanced course selection with debugging
  const handleCourseSelect = (course) => {
    console.log("🎯 Dashboard handleCourseSelect called with:", {
      course,
      _id: course?._id,
      coursecode: course?.coursecode,
      coursename: course?.coursename,
      courseType: course?.courseType,
    });

    setSelectedCourse(course);
    setSelectedSection("course");
    setSelectedRoom("syllabus");
    setActiveCourseTab("syllabus"); // reset to syllabus tab
    setShowCourseMessages(false);
    setCurrentRoomId(""); // Reset room ID
    if (isMobile) setMobileOpen(false);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    if (section !== "course") {
      setSelectedCourse(null);
      setShowCourseMessages(false);
      setCurrentRoomId("");
    }
    if (isMobile) setMobileOpen(false);
  };

  const handleBackToSidebar = () => {
    if (isMobile) {
      setSelectedCourse(null);
      setSelectedSection("course");
      setShowCourseMessages(false);
      setCurrentRoomId("");
    }
  };

  const drawerWidth = isMobile ? 280 : 320;

  // ✅ FIXED: Enhanced getSectionTitle with proper course validation
  const getSectionTitle = () => {
    if (selectedSection === "course" && selectedCourse) {
      const courseName =
        selectedCourse.coursename ||
        selectedCourse.course ||
        selectedCourse.coursecode ||
        "Unknown Course";
      const typeLabel =
        selectedCourse.courseType === "advance"
          ? " (ADVANCE)"
          : selectedCourse.courseType === "remedial"
            ? " (REMEDIAL)"
            : "";
      return courseName + typeLabel;
    } else if (selectedSection === "profile") {
      return "My Profile";
    } else if (selectedSection === "ai-analysis") {
      return "AI Video Analysis";
    } else if (selectedSection === "ai-keys") {
      return "AI API Keys";
    } else if (selectedSection === "collaboration") {
      return "Project Collaboration";
    } else if (selectedSection === "collaboration-posts") {
      return "Collaboration Posts";
    } else if (selectedSection === "chat-rooms") {
      return "Chat Rooms";
    } else if (selectedSection === "patents") {
      return "Patents";
    } else if (selectedSection === "projects") {
      return "Projects";
    } else if (selectedSection === "books") {
      return "Books & Chapters";
    } else if (selectedSection === "publications") {
      return "Publications";
    } else if (selectedSection === "tests") {
      return "Tests & Assessments";
    } else if (selectedSection === "classes") {
      return "Classes & Attendance";
    } else if (selectedSection === "reports") {
      return "Reports";
    } else if (selectedSection === "seminars") {
      return "Seminars";
    } else if (selectedSection === "consultancy") {
      return "Consultancy";
    }
    return "Course Hub";
  };

  const getSectionIcon = () => {
    if (selectedSection === "course" && selectedCourse) {
      const baseIcon =
        selectedCourse.coursename?.charAt(0) ||
        selectedCourse.coursecode?.charAt(0) ||
        "📚";
      if (selectedCourse.courseType === "advance") return "🚀" + baseIcon;
      if (selectedCourse.courseType === "remedial") return "🛠️" + baseIcon;
      return baseIcon;
    }
    if (selectedSection === "profile") return "👨‍🎓";
    if (selectedSection === "ai-analysis") return "🤖";
    if (selectedSection === "ai-keys") return "🔑";
    if (selectedSection === "collaboration") return "🤝";
    if (selectedSection === "collaboration-posts") return "🤝";
    if (selectedSection === "chat-rooms") return "💬";
    if (selectedSection === "patents") return "💡";
    if (selectedSection === "projects") return "🔬";
    if (selectedSection === "publications") return "📄";
    if (selectedSection === "tests") return "📝";
    if (selectedSection === "classes") return "🏫";
    if (selectedSection === "reports") return "📊";
    if (selectedSection === "seminars") return "🎤";
    if (selectedSection === "consultancy") return "💼";
    if (selectedSection === "books") return "📚";
    return null;
  };

  const shouldShowProfile = () => {
    return (
      global1.userRole?.toUpperCase() === "FACULTY" &&
      selectedSection === "course" &&
      !selectedCourse
    );
  };

  // ✅ FIXED: Complete renderCourse function with proper validation and room ID generation
  const renderCourse = () => {
    // ✅ DEBUGGING: Log what we're receiving
    console.log("🐛 renderCourse called:", {
      selectedCourse,
      hasSelectedCourse: !!selectedCourse,
      courseType: selectedCourse?.courseType,
      coursecode: selectedCourse?.coursecode,
      coursename: selectedCourse?.coursename,
      showCourseMessages,
      currentRoomId,
      activeCourseTab,
    });

    if (!selectedCourse) {
      console.log("❌ No selectedCourse, returning null");
      return null;
    }

    // ✅ FIXED: Enhanced room ID computation with validation
    const computeRoomId = () => {
      if (!selectedCourse?.coursecode) {
        console.warn("⚠️ No coursecode found in selectedCourse");
        return "";
      }

      // Add course type prefix to separate chat rooms
      const typePrefix =
        selectedCourse.courseType === "advance"
          ? "adv_"
          : selectedCourse.courseType === "remedial"
            ? "rem_"
            : "";
      const base = `${typePrefix}course_${selectedCourse.coursecode}`;

      if (activeCourseTab === "syllabus") return `${base}_syllabus`;
      if (activeCourseTab === "materials") return `${base}_materials`;
      if (activeCourseTab === "assignments") return `${base}_assignments`;
      return base;
    };

    const roomId = computeRoomId();
    console.log("🏠 Computed roomId:", roomId);

    // ✅ FIXED: Message section rendering with proper validation
    if (showCourseMessages) {
      console.log("💬 Rendering MessageSection with roomId:", currentRoomId);
      return (
        <MessageSection
          roomId={currentRoomId}
          course={selectedCourse}
          socket={socket}
          onExit={() => {
            console.log("🚪 Exiting message room");
            setShowCourseMessages(false);
            setCurrentRoomId("");
          }}
        />
      );
    }

    // ✅ FIXED: Enhanced onEnterMessages handler
    const handleEnterMessages = ({ roomId: incomingRoomId, tab }) => {
      console.log("🚀 handleEnterMessages called:", {
        incomingRoomId,
        tab,
        computedRoomId: roomId,
        socket: !!socket,
      });

      if (!incomingRoomId) {
        console.error("❌ No roomId provided to handleEnterMessages");
        return;
      }

      if (!socket) {
        console.error("❌ No socket connection available");
        return;
      }

      setCurrentRoomId(incomingRoomId);
      setShowCourseMessages(true);
    };

    // Choose Hub component based on course type
    if (selectedCourse.courseType === "advance") {
      return (
        <AdvanceCourseHub
          course={selectedCourse}
          socket={socket}
          activeTab={activeCourseTab}
          onChangeTab={setActiveCourseTab} // ✅ FIXED: Correct prop name
          onEnterMessages={handleEnterMessages}
        />
      );
    }

    if (selectedCourse.courseType === "remedial") {
      console.log("🛠️ Rendering RemedialCourseHub");
      return (
        <RemedialCourseHub
          course={selectedCourse}
          socket={socket}
          activeTab={activeCourseTab}
          onChangeTab={setActiveCourseTab} // ✅ FIXED: Correct prop name
          onEnterMessages={handleEnterMessages}
        />
      );
    }
    return (
      <CourseHub
        course={selectedCourse}
        socket={socket}
        activeTab={activeCourseTab}
        onChangeTab={setActiveCourseTab} // ✅ FIXED: Correct prop name
        onEnterMessages={handleEnterMessages}
      />
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {selectedSection !== "course" || selectedCourse ? (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={() => {
                    if (selectedSection === "course" && selectedCourse) {
                      setSelectedCourse(null);
                      setShowCourseMessages(false);
                      setCurrentRoomId("");
                    } else {
                      setSelectedSection("course");
                      setSelectedCourse(null);
                      setShowCourseMessages(false);
                      setCurrentRoomId("");
                    }
                  }}
                  sx={{ mr: 2 }}
                >
                  <ArrowBack />
                </IconButton>
                {getSectionIcon() && (
                  <Typography sx={{ mr: 1 }}>{getSectionIcon()}</Typography>
                )}
                <Typography variant="h6" noWrap component="div">
                  {getSectionTitle()}
                </Typography>
              </>
            ) : (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <Menu />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  Course Hub
                </Typography>
                <Avatar sx={{ ml: "auto", bgcolor: "secondary.main" }}>
                  {global1.userName?.charAt(0)}
                </Avatar>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && <Toolbar />}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {isMobile ? (
          <Sidebar
            onCourseSelect={handleCourseSelect}
            onSectionSelect={handleSectionSelect}
            selectedCourse={selectedCourse}
            selectedSection={selectedSection}
            onOpenChat={handleOpenChat}
          />
        ) : (
          <Sidebar
            onCourseSelect={handleCourseSelect}
            onSectionSelect={handleSectionSelect}
            selectedCourse={selectedCourse}
            selectedSection={selectedSection}
            onOpenChat={handleOpenChat}
          />
        )}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {selectedSection === "course" && selectedCourse ? (
          renderCourse()
        ) : selectedSection === "profile" ? (
          global1.userRole?.toUpperCase() === "FACULTY" ? (
            <FacultyProfile />
          ) : (
            <StudentProfile />
          )
        ) : selectedSection === "ai-analysis" ? (
          <AIVideoAnalysisInterface />
        ) : selectedSection === "advance-ai-analysis" ? (
          <AdvanceAIVideoAnalysisInterface />
        ) : selectedSection === "remedial-ai-analysis" ? (
          <RemedialAiVideoAnalysisInterface />
        ) : selectedSection === "ai-keys" ? (
          <APIKeyManagerInterface />
        ) : selectedSection === "collaboration" ? (
          <CollaborationInterface />
        ) : selectedSection === "collaboration-posts" ? (
          <CollaborationInterface />
        ) : selectedSection === "chat-rooms" ? (
          <CollaborationChat collaboration={selectedChatRoom} socket={socket} />
        ) : selectedSection === "chat" ? (
          <ChatInterface socket={socket} />
        ) : selectedSection === "classes" ? (
          <ClassesInterface />
        ) : selectedSection === "advanceclasses" ? (
          <AdvanceClassesInterface />
        ) : selectedSection === "remedialclasses" ? (
          <RemedialClassInterface />
        ) : selectedSection === "reports" ? (
          <ReportsInterface />
        ) : selectedSection === "advance-reports" ? (
          <AdvanceCourseReports />
        ) : selectedSection === "remedial-reports" ? (
          <RemedialCourseReports />
        ) : selectedSection === "tests" ? (
          <TestsInterface />
        ) : selectedSection === "consultancy" ? (
          <ConsultancyInterface />
        ) : selectedSection === "seminars" ? (
          <SeminarsInterface />
        ) : selectedSection === "patents" ? (
          <PatentsInterface />
        ) : selectedSection === "books" ? (
          <BooksInterface />
        ) : selectedSection === "projects" ? (
          <ProjectsInterface />
        ) : selectedSection === "publications" ? (
          <PublicationsInterface />
        ) : global1.userRole?.toUpperCase() === "FACULTY" &&
          selectedSection === "course" ? (
          <FacultyProfile />
        ) : (
          <StudentProfile />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
