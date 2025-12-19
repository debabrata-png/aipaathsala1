// pages/EnrollmentLinkGuard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CircularProgress, Box, Alert } from "@mui/material";
import ep3 from "../api/ep3";
import global1 from "./global1";
import StudentEnrollmentForm from "../components/remedailcourses/StudentEnrollmentForm";

const EnrollmentLinkGuard = () => {
  const { token } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      // Require auth; if not logged in, redirect to login and return here
      if (!global1?.userEmail) {
        nav("/login", { state: { redirectTo: loc.pathname } });
        return;
      }
      try {
        const r = await ep3.get(`/enrollment-linkremedial/${token}`);
        if (r.data.success) setMeta(r.data.data);
        else setErr(r.data.message || "Invalid or inactive link");
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load link");
      }
    };
    run();
  }, [token]);

  if (err)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{err}</Alert>
      </Box>
    );
  if (!meta)
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );

  return <StudentEnrollmentForm meta={meta} />;
};

export default EnrollmentLinkGuard;
