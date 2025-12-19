// components/enrollment/EnrollStudentsForCourse.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import ep3 from "../../api/ep3";
import global1 from "../../pages/global1";

const btnGreen = {
  backgroundColor: "#16a34a",
  "&:hover": { backgroundColor: "#15803d" },
  textTransform: "none",
  borderRadius: 2,
};

const EnrollStudentsForCourse = ({ course }) => {
  const [link, setLink] = useState("");
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadLinks = async () => {
    if (!course) return;
    try {
      const r = await ep3.get("/enrollment-linksadvance", {
        params: {
          colid: global1.colid,
          user: global1.userEmail,
          coursecode: course.coursecode,
        },
      });
      if (r.data.success) setList(r.data.data || []);
    } catch {}
  };

  useEffect(() => {
    loadLinks();
  }, [course?.coursecode, global1?.colid, global1?.userEmail]);

  const createLink = async () => {
    try {
      const r = await ep3.post("/create-enrollment-linkadvance", {
        colid: global1.colid,
        user: global1.userEmail,
        name: global1.userName,
        course: course.coursename || course.course,
        coursecode: course.coursecode,
        year: course.year,
        program: course.program || "",
        programcode: course.programcode || "",
      });
      if (r.data.success) {
        const url = `${window.location.origin}/enrolladvance/${r.data.data.token}`;
        setLink(url);
        setMsg("Enrollment link created successfully");
        setErr("");
        loadLinks();
      } else {
        setErr(r.data.message || "Failed to create link");
        setMsg("");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to create link");
      setMsg("");
    }
  };

  const revoke = async (token) => {
    try {
      const r = await ep3.put(`/enrollment-linkadvance/${token}/revoke`);
      if (r.data.success) {
        setMsg("Link revoked");
        setErr("");
        loadLinks();
      } else {
        setErr(r.data.message || "Failed to revoke");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to revoke");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Enroll Students — {course?.coursename || course?.course} (
          {course?.coursecode})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a link and share it with students. They must log in or register
          before submitting the enrollment form.
        </Typography>

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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button onClick={createLink} sx={btnGreen} variant="contained">
            Create Link
          </Button>
          <TextField
            fullWidth
            label="Enrollment link"
            value={link}
            InputProps={{ readOnly: true }}
            placeholder="Create to generate a link"
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Your Links for this Course
        </Typography>

        {list.length === 0 ? (
          <Typography color="text.secondary">No links yet.</Typography>
        ) : (
          <Stack spacing={1}>
            {list.map((item) => (
              <Paper
                key={item.token}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {item.status?.toUpperCase?.() || "ACTIVE"} •{" "}
                    {new Date(item.createdat).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {window.location.origin}/enroll/{item.token}
                  </Typography>
                </Box>
                {item.status !== "revoked" && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => revoke(item.token)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Revoke
                  </Button>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default EnrollStudentsForCourse;
