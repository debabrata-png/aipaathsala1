import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Business,
  PersonAdd,
  School,
} from "@mui/icons-material";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import ep3 from "../api/ep3";

const g = {
  bg: "linear-gradient(135deg, #00695C 0%, #004D40 50%, #00251A 100%)",
  primary: "#00695C",
  primaryDark: "#004D40",
  hover: "#00574B",
};

const steps = ["Join Type", "Role", "Details"];

const Register = () => {
  // Add enrollment functionality
  const { token } = useParams();
  const [enrollmentColid, setEnrollmentColid] = useState(null);
  const [isEnrollmentRegistration, setIsEnrollmentRegistration] = useState(false);

  const [active, setActive] = useState(0);
  const [joinType, setJoinType] = useState("individual");
  const [role, setRole] = useState("Student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    instituteCode: "",
    regno: "",
    programcode: "",
    admissionyear: "",
    semester: "",
    section: "",
    department: "",
    facAdmissionYear: "",
    facDepartment: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Handle enrollment token
  useEffect(() => {
    if (token) {
      fetchEnrollmentData();
    }
  }, [token]);

  const fetchEnrollmentData = async () => {
    try {
      const r = await ep3.get(`/enrollment-link/${token}`);
      if (r.data.success) {
        setEnrollmentColid(r.data.data.colid);
        setIsEnrollmentRegistration(true);
        setRole("Student");
        setActive(2); // Skip to Details step
      }
    } catch (error) {
      setErr("Invalid enrollment link");
    }
  };

  const must = useMemo(() => {
    if (active === 0)
      return joinType === "withInstitute"
        ? ["joinType", "instituteCode"]
        : ["joinType"];
    if (active === 1) return ["role"];
    return role === "Faculty"
      ? [
          "name",
          "email",
          "password",
          "phone",
          "facDepartment",
          "facAdmissionYear",
        ]
      : [
          "name",
          "email",
          "password",
          "phone",
          "regno",
          "programcode",
          "admissionyear",
          "semester",
          "section",
          "department",
        ];
  }, [active, joinType, role]);

  const setVal = (k) => (e) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
    if (err) setErr("");
  };

  const check = () => {
    const missing = [];
    const get = (k) =>
      k === "joinType" ? joinType : k === "role" ? role : form[k];
    must.forEach((k) => {
      const v = get(k);
      if (!v || String(v).trim() === "") missing.push(k);
    });
    if (missing.length) {
      setErr(`Please fill: ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const next = () => {
    if (!check()) return;
    setActive((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setActive((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!check()) return;
    setLoading(true);
    try {
      const payload =
        role === "Faculty"
          ? {
              joinType,
              instituteCode:
                joinType === "withInstitute"
                  ? form.instituteCode.trim()
                  : undefined,
              role,
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              password: form.password,
              department: form.facDepartment.trim(),
              admissionyear: form.facAdmissionYear.trim(),
              status: 1,
            }
          : {
              joinType,
              instituteCode:
                joinType === "withInstitute"
                  ? form.instituteCode.trim()
                  : undefined,
              role,
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              password: form.password,
              regno: form.regno.trim(),
              programcode: form.programcode.trim(),
              admissionyear: form.admissionyear.trim(),
              semester: form.semester.trim(),
              section: form.section.trim(),
              department: form.department.trim(),
              status: 1,
            };

      // Add colid for enrollment registration
      if (isEnrollmentRegistration) {
        payload.enrollcolid = enrollmentColid;
      }

      const r = await ep3.post("/register", payload);
      if (r.data.success) {
        setOk(true);
        const redirectTo = isEnrollmentRegistration 
          ? `/enroll/${token}` 
          : location.state?.redirectTo;
        setTimeout(
          () => nav("/login", { replace: true, state: { redirectTo } }),
          1300
        );
      } else {
        setErr(r.data.message || "Registration failed");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const StepJoinType = (
    <>
      <Typography
        variant="h6"
        sx={{ color: g.primaryDark, fontWeight: 700, mb: 1 }}
      >
        Join Type
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setJoinType("individual")}
            sx={{
              p: 2.5,
              cursor: "pointer",
              border:
                joinType === "individual"
                  ? `2px solid ${g.primary}`
                  : "1px solid",
              borderColor: joinType === "individual" ? g.primary : "divider",
              borderRadius: 2,
              transition: "all .2s",
              "&:hover": { borderColor: g.primary, boxShadow: 6 },
            }}
          >
            <Person sx={{ color: g.primary, mb: 1 }} />
            <Typography variant="subtitle1">Join as Individual</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card
            onClick={() => setJoinType("withInstitute")}
            sx={{
              p: 2.5,
              cursor: "pointer",
              border:
                joinType === "withInstitute"
                  ? `2px solid ${g.primary}`
                  : "1px solid",
              borderColor: joinType === "withInstitute" ? g.primary : "divider",
              borderRadius: 2,
              transition: "all .2s",
              "&:hover": { borderColor: g.primary, boxShadow: 6 },
            }}
          >
            <Business sx={{ color: g.primary, mb: 1 }} />
            <Typography variant="subtitle1">Join with Institute</Typography>
            <Typography variant="body2" color="text.secondary">
              Use code from admin
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {joinType === "withInstitute" && (
        <TextField
          fullWidth
          label="Institute Code"
          value={form.instituteCode}
          onChange={setVal("instituteCode")}
          sx={{ mb: 1 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
      )}
    </>
  );

  const StepRole = (
    <>
      <Typography
        variant="h6"
        sx={{ color: g.primaryDark, fontWeight: 700, mb: 1 }}
      >
        Select Role
      </Typography>
      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={(_, v) => v && setRole(v)}
        sx={{ mb: 2 }}
      >
        <ToggleButton
          value="Student"
          sx={{ px: 3, borderRadius: "12px 0 0 12px" }}
        >
          Student
        </ToggleButton>
        <ToggleButton
          value="Faculty"
          sx={{ px: 3, borderRadius: "0 12px 12px 0" }}
        >
          Faculty
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );

  const StepDetails = (
    <>
      <Typography
        variant="h6"
        sx={{ color: g.primaryDark, fontWeight: 700, mb: 1 }}
      >
        Your Details
      </Typography>
      
      {/* Add enrollment alert */}
      {isEnrollmentRegistration && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Registering for course enrollment
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            value={form.name}
            onChange={setVal("name")}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={form.email}
            onChange={setVal("email")}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={setVal("phone")}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Password"
            value={form.password}
            onChange={setVal("password")}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
        </Grid>

        {role === "Faculty" ? (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={form.facDepartment}
                onChange={setVal("facDepartment")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Year"
                placeholder="e.g., 2021"
                value={form.facAdmissionYear}
                onChange={setVal("facAdmissionYear")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration No."
                value={form.regno}
                onChange={setVal("regno")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Code"
                value={form.programcode}
                onChange={setVal("programcode")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admission Year"
                placeholder="e.g., 2023"
                value={form.admissionyear}
                onChange={setVal("admissionyear")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Semester"
                value={form.semester}
                onChange={setVal("semester")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Section"
                value={form.section}
                onChange={setVal("section")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={form.department}
                onChange={setVal("department")}
                required
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );

  if (ok) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: g.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card
          sx={{ p: 4, textAlign: "center", borderRadius: 3, maxWidth: 420 }}
        >
          <School sx={{ fontSize: 72, color: g.primary, mb: 1 }} />
          <Typography variant="h5" sx={{ color: g.primary, fontWeight: 700 }}>
            Registration Successful
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to login…
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: g.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3, md: 4, lg: 5 },
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Paper elevation={24} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                background: `linear-gradient(45deg, ${g.primary} 30%, ${g.primaryDark} 90%)`,
                color: "#fff",
                textAlign: "center",
                p: { xs: 3, md: 4 },
              }}
            >
              <PersonAdd sx={{ fontSize: 46, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                Create Account
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                Join our academic platform
              </Typography>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 }, pt: 3 }}>
              <Stepper activeStep={active} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          "&.Mui-active": { color: g.primary },
                          "&.Mui-completed": { color: g.primary },
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box sx={{ p: { xs: 3, md: 4 } }}>
              {err && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {err}
                </Alert>
              )}

              {active === 0 && StepJoinType}
              {active === 1 && StepRole}
              {active === 2 && StepDetails}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  onClick={back}
                  disabled={active === 0 || isEnrollmentRegistration}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                    color: g.primary,
                    "&:hover": { backgroundColor: "rgba(0,105,92,.06)" },
                  }}
                >
                  Back
                </Button>
                {active < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={next}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      px: 4,
                      background: `linear-gradient(45deg, ${g.primary} 30%, ${g.primaryDark} 90%)`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${g.hover} 30%, #00251A 90%)`,
                      },
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={loading}
                    onClick={submit}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      px: 4,
                      background: `linear-gradient(45deg, ${g.primary} 30%, ${g.primaryDark} 90%)`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${g.hover} 30%, #00251A 90%)`,
                      },
                    }}
                  >
                    {loading ? "Creating Account…" : "Create Account"}
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ redirectTo: location.state?.redirectTo }}
                    style={{
                      color: g.primary,
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
