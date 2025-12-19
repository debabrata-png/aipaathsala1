// components/Sidebar.js
import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  Menu,
  MenuItem,
  Paper,
  Chip,
} from "@mui/material";
import {
  School,
  ExpandLess,
  ExpandMore,
  Assignment,
  Science,
  Description,
  Lightbulb,
  Add,
  Groups,
  Assessment,
  RecordVoiceOver,
  BusinessCenter,
  Quiz,
  AccountCircle,
  Handshake,
  Chat,
  SmartToy,
  VideoLibrary,
  Logout, // Add Logout icon
  ExitToApp,
  Book, // Alternative logout icon
  Edit,
  Delete,
} from "@mui/icons-material";

import SidebarNotificationCenter from "./SidebarNotificationCenter";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const Sidebar = ({
  onCourseSelect,
  onSectionSelect,
  selectedCourse,
  selectedSection,
}) => {
  const [courses, setCourses] = useState([]);
  const [advanceCourses, setAdvanceCourses] = useState([]); // NEW: advance courses
  const [remedialCourses, setRemedialCourses] = useState([]); // NEW: remedial courses
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    courses: false,
    advanceCourses: false, // NEW
    remedialCourses: false, // NEW
    projects: false,
    collaboration: false,
    notifications: false,
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [courseForm, setCourseForm] = useState({
    coursename: "",
    coursecode: "",
    year: "",
    type: "",
  });
  const [formError, setFormError] = useState("");
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [createDialogType, setCreateDialogType] = useState("regular"); // NEW
  // ADD these state variables after existing state declarations in Sidebar.jsx
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCourseData, setEditCourseData] = useState(null);
  const [editCourseType, setEditCourseType] = useState("regular");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Permissions
  const getUserPermissions = (role) => {
    const roleUpper = role?.toUpperCase();
    return {
      isFaculty: roleUpper === "FACULTY",
      isStudent: roleUpper === "STUDENT",
      canViewCourses: ["FACULTY", "STUDENT"].includes(roleUpper),
      canCreateCourse: roleUpper === "FACULTY",
      canViewFacultyFeatures: roleUpper === "FACULTY",
    };
  };
  const permissions = getUserPermissions(global1.userRole);

  useEffect(() => {
    if (permissions.canViewCourses) {
      fetchCourses();
      fetchAdvanceCourses();
      fetchRemedialCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let response;
      if (permissions.isFaculty) {
        response = await ep3.get("/getcoursebyfaculty", {
          params: { user: global1.userEmail, colid: global1.colid },
        });
      } else {
        response = await ep3.get("/getcoursesbystudent", {
          params: { regno: global1.userRegno, colid: global1.colid },
        });
      }
      if (response.data.success) setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Advance courses
  const fetchAdvanceCourses = async () => {
    try {
      let response;
      if (permissions.isFaculty) {
        response = await ep3.get("/getcoursebyfacultyadvance", {
          params: { user: global1.userEmail, colid: global1.colid },
        });
      } else {
        response = await ep3.get("/getcoursesbystudentadvance", {
          params: { regno: global1.userRegno, colid: global1.colid },
        });
      }
      if (response.data.success) setAdvanceCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Advance Courses:", error);
    }
  };

  // NEW: Remedial courses
  const fetchRemedialCourses = async () => {
    try {
      let response;
      if (permissions.isFaculty) {
        response = await ep3.get("/getcoursebyfacultyremedial", {
          params: { user: global1.userEmail, colid: global1.colid },
        });
      } else {
        response = await ep3.get("/getcoursesbystudentremedial", {
          params: { regno: global1.userRegno, colid: global1.colid },
        });
      }
      if (response.data.success) setRemedialCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Remedial Courses:", error);
    }
  };

  const handleSectionToggle = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle logout function
  const handleLogout = () => {
    // Clear all data from global1
    Object.keys(global1).forEach((key) => {
      delete global1[key];
    });

    // Clear localStorage/sessionStorage if used
    localStorage.clear();
    sessionStorage.clear();

    // Close dialog
    setLogoutDialog(false);

    // Redirect to login page
    window.location.href = "/login"; // Force page reload to ensure clean state
  };

  // Course selection (with type)
  const selectCourse = async (c, courseType = "regular") => {
    if (c.coursename || c.course || c.title) {
      onCourseSelect({
        coursename: c.coursename || c.course || c.title,
        coursecode: c.coursecode,
        year: c.year,
        program: c.program || "",
        programcode: c.programcode || "",
        courseType: courseType,
      });
      onSectionSelect("course");
      return;
    }
    try {
      const endpoint =
        courseType === "advance"
          ? "/getcoursebyfacultyadvance"
          : courseType === "remedial"
          ? "/getcoursebyfacultyremedial"
          : "/getcoursebyfaculty";
      const r = await ep3.get(endpoint, {
        params: { colid: global1.colid, coursecode: c.coursecode },
      });
      const full = Array.isArray(r.data?.data) ? r.data.data[0] : null;
      onCourseSelect({
        coursename: full?.coursename || full?.course || c.coursecode,
        coursecode: c.coursecode,
        year: c.year,
        program: full?.program || "",
        programcode: full?.programcode || "",
        courseType: courseType,
      });
    } catch (e) {
      onCourseSelect({
        coursename: c.coursecode,
        coursecode: c.coursecode,
        year: c.year,
        program: "",
        programcode: "",
        courseType: courseType,
      });
    }
    onSectionSelect("course");
  };

  const handleSectionClick = (sectionType) => onSectionSelect(sectionType);

  // Dialog type: regular/advance/remedial
  const openCreateCourseDialog = (type) => {
    setCreateDialogType(type);
    setOpenCreateDialog(true);
  };

  const handleCreateCourse = async () => {
    if (!courseForm.coursename || !courseForm.coursecode || !courseForm.year) {
      setFormError("Please fill in all required fields");
      return;
    }
    try {
      let endpoint;
      switch (createDialogType) {
        case "advance":
          endpoint = "/createcourseadvance";
          break;
        case "remedial":
          endpoint = "/createcourseremedial";
          break;
        default:
          endpoint = "/createcourse";
      }
      const response = await ep3.post(endpoint, {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        ...courseForm,
      });
      if (response.data.success) {
        setOpenCreateDialog(false);
        setCourseForm({ coursename: "", coursecode: "", year: "", type: "" });
        setFormError("");
        // Refresh lists
        if (createDialogType === "advance") {
          fetchAdvanceCourses();
        } else if (createDialogType === "remedial") {
          fetchRemedialCourses();
        } else {
          fetchCourses();
        }
        alert(
          `${
            createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)
          } Course created successfully!`
        );
      }
    } catch (error) {
      setFormError("Failed to create course. Please try again.");
    }
  };

  // ADD this function to handle course editing
  const handleEditCourse = async () => {
    if (
      !editCourseData.coursename ||
      !editCourseData.coursecode ||
      !editCourseData.year
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      let endpoint;
      switch (editCourseType) {
        case "advance":
          endpoint = `/updatecourseadvance/${editCourseData._id}`;
          break;
        case "remedial":
          endpoint = `/updatecourseremedial/${editCourseData._id}`;
          break;
        default:
          endpoint = `/updatecourse/${editCourseData._id}`;
      }

      const response = await ep3.put(endpoint, {
        coursename: editCourseData.coursename,
        coursecode: editCourseData.coursecode,
        year: editCourseData.year,
        type: editCourseData.type,
        status1: editCourseData.status1,
        comments: editCourseData.comments,
      });

      if (response.data.success) {
        setEditDialogOpen(false);
        setEditCourseData(null);
        setFormError("");

        // Refresh appropriate course list
        if (editCourseType === "advance") {
          fetchAdvanceCourses();
        } else if (editCourseType === "remedial") {
          fetchRemedialCourses();
        } else {
          fetchCourses();
        }

        alert(
          `${
            editCourseType.charAt(0).toUpperCase() + editCourseType.slice(1)
          } Course updated successfully!`
        );
      }
    } catch (error) {
      setFormError("Failed to update course. Please try again.");
      console.error("Error updating course:", error);
    }
  };

  // ADD this function to handle course deletion
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    try {
      let endpoint;
      switch (courseToDelete.type) {
        case "advance":
          endpoint = `/deletecourseadvance/${courseToDelete._id}`;
          break;
        case "remedial":
          endpoint = `/deletecourseremedial/${courseToDelete._id}`;
          break;
        default:
          endpoint = `/deletecourse/${courseToDelete._id}`;
      }

      const response = await ep3.delete(endpoint);

      if (response.data.success) {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);

        // Refresh appropriate course list
        if (courseToDelete.type === "advance") {
          fetchAdvanceCourses();
        } else if (courseToDelete.type === "remedial") {
          fetchRemedialCourses();
        } else {
          fetchCourses();
        }

        // Clear selected course if it was the deleted one
        if (selectedCourse?.coursecode === courseToDelete.coursecode) {
          onCourseSelect(null);
        }

        alert("Course deleted successfully!");
      }
    } catch (error) {
      alert("Failed to delete course. Please try again.");
      console.error("Error deleting course:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ADD these functions to open edit and delete dialogs
  const openEditDialog = (course, type) => {
    setEditCourseData({
      _id: course._id,
      coursename: course.coursename || course.course,
      coursecode: course.coursecode,
      year: course.year,
      type: course.type || "",
      status1: course.status1 || "",
      comments: course.comments || "",
    });
    setEditCourseType(type);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (course, type) => {
    setCourseToDelete({ ...course, type });
    setDeleteDialogOpen(true);
  };

  // REPLACE existing renderCourseSection with this updated version
  const renderCourseSection = (
    title,
    courseList,
    sectionKey,
    icon,
    courseType,
    chipColor
  ) => (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleSectionToggle(sectionKey)}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {title}
                </Typography>
                {courseList.length > 0 && (
                  <Chip
                    label={courseList.length}
                    size="small"
                    color={chipColor}
                    sx={{ height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Box>
            }
          />
          {openSections[sectionKey] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>

      <Collapse in={openSections[sectionKey]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {permissions.canCreateCourse && (
            <ListItem sx={{ pl: 4 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                fullWidth
                onClick={() => openCreateCourseDialog(courseType)}
                sx={{
                  backgroundColor:
                    chipColor === "primary"
                      ? "#1976d2"
                      : chipColor === "secondary"
                      ? "#9c27b0"
                      : "#16a34a",
                  "&:hover": {
                    backgroundColor:
                      chipColor === "primary"
                        ? "#1565c0"
                        : chipColor === "secondary"
                        ? "#7b1fa2"
                        : "#15803d",
                  },
                  textTransform: "none",
                }}
              >
                Create {title.replace(" Courses", "")}
              </Button>
            </ListItem>
          )}

          {courseList.map((course, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => selectCourse(course, courseType)}
                sx={{
                  pl: 4,
                  backgroundColor:
                    selectedCourse?.coursecode === course.coursecode
                      ? "#e8f5e8"
                      : "transparent",
                  borderLeft:
                    selectedCourse?.coursecode === course.coursecode
                      ? "3px solid #075e54"
                      : "none",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <School sx={{ fontSize: 20, color: "#075e54" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {course.coursename ||
                          course.course ||
                          course.coursecode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.coursecode} • {course.year}
                      </Typography>
                    </Box>
                  }
                />

                {/* ADD Edit and Delete Icons for Faculty */}
                {permissions.canCreateCourse && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(course, courseType);
                      }}
                      sx={{
                        color: "#1976d2",
                        "&:hover": { backgroundColor: "#e3f2fd" },
                      }}
                    >
                      <Edit sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(course, courseType);
                      }}
                      sx={{
                        color: "#d32f2f",
                        "&:hover": { backgroundColor: "#ffebee" },
                      }}
                    >
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          ))}

          {courseList.length === 0 && !loading && (
            <ListItem sx={{ pl: 4 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No {title.toLowerCase()} available
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Collapse>
    </>
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          backgroundColor: "#075e54",
          color: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: "#16a34a", width: 48, height: 48 }}>
            {global1.userName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {global1.userName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {global1.userRole} • {global1.userDepartment}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setLogoutDialog(true)}
            sx={{
              color: "#d32f2f",
              "&:hover": { backgroundColor: "#ffebee" },
            }}
            title="Logout"
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List sx={{ py: 1 }}>
          <SidebarNotificationCenter />
          <Divider sx={{ my: 1 }} />

          {/* Profile (Faculty only) */}
          {permissions.canViewCourses && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("profile")}
                  sx={{
                    backgroundColor:
                      selectedSection === "profile" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "profile"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <AccountCircle sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 1 }} />
            </>
          )}

          {/* Regular Courses */}
          {permissions.canViewCourses &&
            renderCourseSection(
              "Courses",
              courses,
              "courses",
              <School />,
              "regular",
              "success"
            )}

          {/* Advance Courses (NEW) */}
          {permissions.canViewCourses &&
            renderCourseSection(
              "Advance Courses",
              advanceCourses,
              "advanceCourses",
              <School />,
              "advance",
              "primary"
            )}

          {/* Remedial Courses (NEW) */}
          {permissions.canViewCourses &&
            renderCourseSection(
              "Remedial Courses",
              remedialCourses,
              "remedialCourses",
              <School />,
              "remedial",
              "secondary"
            )}

          {/* Faculty-only sections */}
          {permissions.canViewFacultyFeatures && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("tests")}
                  sx={{
                    backgroundColor:
                      selectedSection === "tests" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "tests"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Quiz sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Tests & Assessments" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("classes")}
                  sx={{
                    backgroundColor:
                      selectedSection === "classes" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "classes"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Groups sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Classes & Attendance" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("advanceclasses")}
                  sx={{
                    backgroundColor:
                      selectedSection === "advanceclasses"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "classes"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Groups sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Advance Classes & Attendance" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("remedialclasses")}
                  sx={{
                    backgroundColor:
                      selectedSection === "remedialclasses"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "classes"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Groups sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Remedial Classes & Attendance" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("reports")}
                  sx={{
                    backgroundColor:
                      selectedSection === "reports" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "reports"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Assessment sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Reports" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("consolidated-attendance-report")}
                  sx={{
                    backgroundColor:
                      selectedSection === "consolidated-attendance-report" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "consolidated-attendance-report"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Assessment sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Consolidated Attendance Report" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("advance-reports")}
                  sx={{
                    backgroundColor:
                      selectedSection === "advance-reports" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "advance-reports"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Assessment sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Advance Reports" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("remedial-reports")}
                  sx={{
                    backgroundColor:
                      selectedSection === "remedial-reports" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "remedial-reports"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Assessment sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Remedial Reports" />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding>
                <ListItemButton onClick={() => handleSectionToggle("projects")}>
                  <ListItemIcon>
                    <Science sx={{ color: "#8b5cf6" }} />
                  </ListItemIcon>
                  <ListItemText primary="Projects" />
                  {openSections.projects ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={openSections.projects} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleSectionClick("projects")}
                    >
                      <ListItemIcon>
                        <Science sx={{ color: "#6b7280" }} />
                      </ListItemIcon>
                      <ListItemText primary="My Projects" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("books")}
                  sx={{
                    backgroundColor:
                      selectedSection === "books" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "books"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Book sx={{ color: "#fffff" }} />
                  </ListItemIcon>
                  <ListItemText primary="Book & Chapter" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionToggle("collaboration")}
                >
                  <ListItemIcon>
                    <Handshake sx={{ color: "#f59e0b" }} />
                  </ListItemIcon>
                  <ListItemText primary="Collaboration" />
                  {openSections.collaboration ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse
                in={openSections.collaboration}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleSectionClick("collaboration-posts")}
                    >
                      <ListItemIcon>
                        <Handshake sx={{ color: "#6b7280" }} />
                      </ListItemIcon>
                      <ListItemText primary="Collaboration" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleSectionClick("chat-rooms")}
                    >
                      <ListItemIcon>
                        <Chat sx={{ color: "#6b7280" }} />
                      </ListItemIcon>
                      <ListItemText primary="Chat Rooms" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("patents")}
                  sx={{
                    backgroundColor:
                      selectedSection === "patents" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "patents"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Lightbulb sx={{ color: "#f59e0b" }} />
                  </ListItemIcon>
                  <ListItemText primary="Patents" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("publications")}
                  sx={{
                    backgroundColor:
                      selectedSection === "publications"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "publications"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Description sx={{ color: "#ef4444" }} />
                  </ListItemIcon>
                  <ListItemText primary="Publications" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("seminars")}
                  sx={{
                    backgroundColor:
                      selectedSection === "seminars"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "seminars"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <RecordVoiceOver sx={{ color: "#06b6d4" }} />
                  </ListItemIcon>
                  <ListItemText primary="Seminars" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("consultancy")}
                  sx={{
                    backgroundColor:
                      selectedSection === "consultancy"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "consultancy"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <BusinessCenter sx={{ color: "#059669" }} />
                  </ListItemIcon>
                  <ListItemText primary="Consultancy" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {permissions.canViewFacultyFeatures && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText
                  primary="🤖 AI Features"
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    color: "#7c3aed",
                  }}
                />
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("ai-analysis")}
                  sx={{
                    pl: 2,
                    backgroundColor:
                      selectedSection === "ai-analysis"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "ai-analysis"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <VideoLibrary sx={{ color: "#7c3aed" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI Video Analysis"
                    primaryTypographyProps={{ fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("advance-ai-analysis")}
                  sx={{
                    pl: 2,
                    backgroundColor:
                      selectedSection === "ai-analysis"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "ai-analysis"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <VideoLibrary sx={{ color: "#7c3aed" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Advance AI Video Analysis"
                    primaryTypographyProps={{ fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("remedial-ai-analysis")}
                  sx={{
                    pl: 2,
                    backgroundColor:
                      selectedSection === "ai-analysis"
                        ? "#e8f5e8"
                        : "transparent",
                    borderLeft:
                      selectedSection === "ai-analysis"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <VideoLibrary sx={{ color: "#7c3aed" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Remedial AI Video Analysis"
                    primaryTypographyProps={{ fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("ai-keys")}
                  sx={{
                    pl: 2,
                    backgroundColor:
                      selectedSection === "ai-keys" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "ai-keys"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <SmartToy sx={{ color: "#7c3aed" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI API Keys"
                    primaryTypographyProps={{ fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* Student-only tests */}
          {permissions.isStudent && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick("tests")}
                  sx={{
                    backgroundColor:
                      selectedSection === "tests" ? "#e8f5e8" : "transparent",
                    borderLeft:
                      selectedSection === "tests"
                        ? "3px solid #075e54"
                        : "none",
                  }}
                >
                  <ListItemIcon>
                    <Quiz sx={{ color: "#075e54" }} />
                  </ListItemIcon>
                  <ListItemText primary="Tests & Assessments" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#f8fafc",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#6b7280", textAlign: "center", display: "block" }}
        >
          Campus Technology LMS v2.0
        </Typography>
        {permissions.isStudent && (
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", textAlign: "center", display: "block" }}
          >
            Student Portal
          </Typography>
        )}
      </Box>

      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ExitToApp color="warning" />
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout? You will be redirected to the login
            page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Course Dialog (Faculty only) */}
      {permissions.canCreateCourse && (
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Create New{" "}
            {createDialogType.charAt(0).toUpperCase() +
              createDialogType.slice(1)}{" "}
            Course
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Course Name"
              fullWidth
              variant="outlined"
              value={courseForm.coursename}
              onChange={(e) =>
                setCourseForm({ ...courseForm, coursename: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Course Code"
              fullWidth
              variant="outlined"
              value={courseForm.coursecode}
              onChange={(e) =>
                setCourseForm({ ...courseForm, coursecode: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Academic Year"
              fullWidth
              variant="outlined"
              placeholder="e.g., 2024-25"
              value={courseForm.year}
              onChange={(e) =>
                setCourseForm({ ...courseForm, year: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Course Type"
              fullWidth
              variant="outlined"
              placeholder="e.g., Core, Elective, Lab"
              value={courseForm.type}
              onChange={(e) =>
                setCourseForm({ ...courseForm, type: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateDialog(false);
                setFormError("");
                setCourseForm({
                  coursename: "",
                  coursecode: "",
                  year: "",
                  type: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} variant="contained">
              Create Course
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* ADD Edit Course Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditCourseData(null);
          setFormError("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit{" "}
          {editCourseType.charAt(0).toUpperCase() + editCourseType.slice(1)}{" "}
          Course
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            variant="outlined"
            value={editCourseData?.coursename || ""}
            onChange={(e) =>
              setEditCourseData({
                ...editCourseData,
                coursename: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Course Code"
            fullWidth
            variant="outlined"
            value={editCourseData?.coursecode || ""}
            onChange={(e) =>
              setEditCourseData({
                ...editCourseData,
                coursecode: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Academic Year"
            fullWidth
            variant="outlined"
            placeholder="e.g., 2024-25"
            value={editCourseData?.year || ""}
            onChange={(e) =>
              setEditCourseData({ ...editCourseData, year: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Course Type"
            fullWidth
            variant="outlined"
            placeholder="e.g., Core, Elective, Lab"
            value={editCourseData?.type || ""}
            onChange={(e) =>
              setEditCourseData({ ...editCourseData, type: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            variant="outlined"
            value={editCourseData?.status1 || ""}
            onChange={(e) =>
              setEditCourseData({ ...editCourseData, status1: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Comments"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editCourseData?.comments || ""}
            onChange={(e) =>
              setEditCourseData({ ...editCourseData, comments: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setEditCourseData(null);
              setFormError("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditCourse}
            variant="contained"
            color="primary"
          >
            Update Course
          </Button>
        </DialogActions>
      </Dialog>
      {/* ADD Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCourseToDelete(null);
        }}
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Delete color="error" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this course?</Typography>
          {courseToDelete && (
            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
            >
              <Typography variant="body2" fontWeight="bold">
                {courseToDelete.coursename || courseToDelete.course}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {courseToDelete.coursecode} • {courseToDelete.year}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All associated data will be
            permanently removed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setCourseToDelete(null);
            }}
            disabled={deleteLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCourse}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={<Delete />}
          >
            {deleteLoading ? "Deleting..." : "Delete Course"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
