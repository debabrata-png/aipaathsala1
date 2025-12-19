import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import ep3 from "../../api/ep3";
import global1 from "../../pages/global1";

const StudentEnrollmentForm = ({ meta }) => {
  const [form, setForm] = useState({
    learning: "Regular",
    gender: "",
    classgroup: "",
    coursetype: "",
    semester: "",
    comments: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [existingEnrollment, setExistingEnrollment] = useState(null);

  // Check for existing enrollment on component mount
  useEffect(() => {
    checkExistingEnrollment();
  }, []);

  const checkExistingEnrollment = async () => {
    try {
      setCheckingEnrollment(true);
      const r = await ep3.get("/checkexistingenrollmentremedial", {
        params: {
          colid: meta.colid,
          regno: global1.userRegno,
          student: global1.userName,
          coursecode: meta.coursecode,
          course: meta.course,
          user: meta.creatorUser,
        },
      });

      if (r.data.success && r.data.exists) {
        setAlreadyEnrolled(true);
        setExistingEnrollment(r.data.enrollment);
      }
    } catch (error) {
      console.error("Failed to check existing enrollment:", error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const onChange = (k) => (e) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: meta.creatorName,
        user: meta.creatorUser,
        colid: meta.colid,
        year: meta.year,
        program: meta.program || "",
        programcode: meta.programcode || "",
        course: meta.course,
        coursecode: meta.coursecode,
        student: global1.userName,
        regno: global1.userRegno,
        learning: form.learning,
        gender: form.gender,
        classgroup: "A",
        coursetype: meta.coursetype,
        semester: global1.semester,
        active: "No",
        status1: "Pending",
        comments: "NA",
      };

      const r = await ep3.post("/enrollstudentremedial", payload);

      if (r.data.success) {
        setMsg(`Enrollment submitted successfully! Wait for activation by ${meta.creatorName}.`);
        setErr("");
      } else if (r.data.alreadyEnrolled) {
        setAlreadyEnrolled(true);
        setExistingEnrollment(r.data.enrollment);
        setErr("");
      } else {
        setErr(r.data.message || "Failed to enroll");
      }
    } catch (e) {
      if (e.response?.data?.alreadyEnrolled) {
        setAlreadyEnrolled(true);
        setExistingEnrollment(e.response.data.enrollment);
      } else {
        setErr(e.response?.data?.message || "Failed to enroll");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingEnrollment) {
    return (
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (alreadyEnrolled) {
    const status = existingEnrollment?.status1 || 
                  (existingEnrollment?.active === "Yes" ? "Active" : "Pending");
    
    return (
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Already Enrolled
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You have already enrolled in <strong>{meta.course}</strong> ({meta.coursecode})
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Status:</strong> {status}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Faculty:</strong> {meta.creatorName}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          <strong>Learning Mode:</strong> {existingEnrollment?.learning || "Regular"}
        </Typography>

        {status === "Pending" ? (
          <Alert severity="info">
            Your enrollment is pending approval. Please wait for {meta.creatorName} to activate your enrollment.
          </Alert>
        ) : (
          <Alert severity="success">
            Your enrollment is active! You can now access the course materials.
          </Alert>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Enroll in {meta.course} ({meta.coursecode})
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Logged in as {global1.userName} • {global1.userRegno}
      </Typography>

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {!msg && (
        <Stack spacing={2}>
          <TextField
            label="Learning Mode"
            value={form.learning}
            onChange={onChange("learning")}
            select
            SelectProps={{ native: true }}
          >
            <option value="Regular">Regular</option>
            <option value="Distance">Distance</option>
            <option value="Online">Online</option>
          </TextField>

          <TextField
            label="Gender"
            value={form.gender}
            onChange={onChange("gender")}
            select
            SelectProps={{ native: true }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </TextField>

          <Button
            variant="contained"
            onClick={submit}
            disabled={loading}
            sx={{
              backgroundColor: "#16a34a",
              "&:hover": { backgroundColor: "#15803d" },
            }}
          >
            {loading ? "Submitting..." : "Submit Enrollment"}
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default StudentEnrollmentForm;
