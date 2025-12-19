// components/enrollment/EnrollmentRequests.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
} from "@mui/material";
import ep3 from "../../api/ep3";
import global1 from "../../pages/global1";

const EnrollmentRequests = ({ course }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("all"); // all | pending | active
  const [q, setQ] = useState("");

  const load = async () => {
    if (!course) return;
    setLoading(true);
    setErr("");
    try {
      const params = {
        colid: global1.colid,
        coursecode: course.coursecode,
        year: course.year,
        user: global1.userEmail, // faculty identity stamped on enrollments
      };
      if (status !== "all") params.status = status;
      if (q.trim()) params.q = q.trim();

      const r = await ep3.get("/getenrollmentsadvance", { params });
      if (r.data.success) setRows(r.data.data || []);
      else setErr(r.data.message || "Failed to load");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [course?.coursecode, course?.year, status]);

  const updateStatus = async (id, makeActive) => {
    try {
      const r = await ep3.put(`/update-enrollment-statusadvance/${id}`, {
        active: makeActive ? "Yes" : "No",
        status1: makeActive ? "Active" : "Pending",
      });
      if (r.data.success) {
        setMsg(
          makeActive ? "Student activated" : "Enrollment moved to Pending"
        );
        setErr("");
        load();
      } else {
        setErr(r.data.message || "Failed to update");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to update");
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Enrollments —{" "}
        {course?.coursename || course?.course || course?.coursecode} (
        {course?.coursecode})
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { xs: "stretch", sm: "center" } }}
      >
        <ToggleButtonGroup
          value={status}
          exclusive
          onChange={(_, v) => v && setStatus(v)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder="Search student or regno"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") load();
          }}
          sx={{ minWidth: 220 }}
        />
        <Button
          onClick={load}
          variant="contained"
          sx={{
            ml: "auto",
            backgroundColor: "#16a34a",
            "&:hover": { backgroundColor: "#15803d" },
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Refresh
        </Button>
      </Stack>

      {msg && (
        <Alert sx={{ mb: 2 }} severity="success" onClose={() => setMsg("")}>
          {msg}
        </Alert>
      )}
      {err && (
        <Alert sx={{ mb: 2 }} severity="error" onClose={() => setErr("")}>
          {err}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary">No enrollments found.</Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((r) => (
            <Paper
              key={r._id}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 220 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {r.student} — {r.regno}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status:{" "}
                  {r.status1 || (r.active === "Yes" ? "Active" : "Pending")} •
                  Learning: {r.learning || "-"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {r.active === "Yes" ? (
                  <Button
                    onClick={() => updateStatus(r._id, false)}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Mark Pending
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateStatus(r._id, true)}
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#16a34a",
                      "&:hover": { backgroundColor: "#15803d" },
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                  >
                    Activate
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default EnrollmentRequests;
