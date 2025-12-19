import React, { useState } from "react";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  Email,
  Lock,
  LoginOutlined,
} from "@mui/icons-material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ep3 from "../api/ep3";
import global1 from "./global1";

const themeGreen = {
  bg: "linear-gradient(135deg, #00695C 0%, #004D40 50%, #00251A 100%)",
  primary: "#00695C",
  primaryDark: "#004D40",
  hover: "#00574B",
};

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Check if redirect is from enrollment link
  const isEnrollmentRedirect = location.state?.redirectTo?.includes('/enroll/');
  const enrollmentToken = isEnrollmentRedirect 
    ? location.state?.redirectTo?.split('/enroll/')[1] 
    : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await ep3.post("/loginuser", formData);
      if (response.data.success) {
        const user = response.data.data.user;

        // optional AWS config load (kept from your app)
        const awsResponse = await ep3.get("/getawsconfigbycolid", {
          params: { colid: user.colid },
        });
        let awsConfig = { username: "", password: "", region: "", bucket: "" };
        if (awsResponse.data.success && awsResponse.data.data.length > 0) {
          const config = awsResponse.data.data[0];
          awsConfig = {
            username: config.username || "",
            password: config.password || "",
            region: config.region || "",
            bucket: config.bucket || "",
          };
        }

        // set session globals
        Object.assign(global1, {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          userRegno: user.regno,
          userDepartment: user.department,
          colid: user.colid,
          userPhoto: user.photo,
          programcode: user.programcode,
          semester: user.semester,
          section: user.section,
          username: awsConfig.username,
          password: awsConfig.password,
          region: awsConfig.region,
          bucket: awsConfig.bucket,
        });
        setIsAuthenticated?.(true);

        // redirect back if coming from /enroll/:token
        const redirectTo = location.state?.redirectTo;
        if (redirectTo && typeof redirectTo === "string") {
          navigate(redirectTo, { replace: true });
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to get register link with token
  const getRegisterLink = () => {
    if (enrollmentToken) {
      return `/register/${enrollmentToken}`;
    }
    return "/register";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: themeGreen.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3, md: 4, lg: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ minHeight: { md: "80vh" } }}>
          {!isMobile && (
            <Grid item md={6} lg={6} xl={6}>
              <Fade in timeout={900}>
                <Card
                  sx={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    borderRadius: "20px 0 0 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    textAlign: "center",
                    p: { md: 4, lg: 5 },
                  }}
                >
                  <School sx={{ fontSize: 78, mb: 2.5, opacity: 0.9 }} />
                  <Typography variant="h3" gutterBottom fontWeight={700}>
                    Welcome Back
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    {isEnrollmentRedirect 
                      ? "Sign in to complete your course enrollment"
                      : "Access your academic management system"}
                  </Typography>
                  <Box sx={{ width: "100%", maxWidth: 320 }}>
                    <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>
                      {isEnrollmentRedirect 
                        ? "Don't have an account? Register for this course"
                        : "New here?"}
                    </Typography>
                    <Button
                      component={Link}
                      to={getRegisterLink()}
                      state={{ redirectTo: location.state?.redirectTo }}
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: "#fff",
                        borderColor: "#fff",
                        borderRadius: "24px",
                        py: 1.4,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: "#fff",
                        },
                      }}
                    >
                      {isEnrollmentRedirect ? "Register for Course" : "Create Account"}
                    </Button>
                  </Box>
                </Card>
              </Fade>
            </Grid>
          )}

          <Grid item xs={12} md={6} lg={6} xl={6}>
            <Fade in timeout={1000}>
              <Paper
                elevation={24}
                sx={{
                  height: "100%",
                  borderRadius: { xs: 3, md: "0 20px 20px 0" },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  p: { xs: 3, sm: 4, md: 5, lg: 6 },
                }}
              >
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <LoginOutlined
                    sx={{ fontSize: 48, color: themeGreen.primary, mb: 1.5 }}
                  />
                  <Typography variant="h4" fontWeight={700}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {isEnrollmentRedirect 
                      ? "Sign in to complete your course enrollment"
                      : "Enter your credentials to continue"}
                  </Typography>
                </Box>

                {/* Show enrollment context alert */}
                {isEnrollmentRedirect && (
                  <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                    You're accessing this from a course enrollment link
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 },
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.6,
                      borderRadius: 2,
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      textTransform: "none",
                      background: `linear-gradient(45deg, ${themeGreen.primary} 30%, ${themeGreen.primaryDark} 90%)`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${themeGreen.hover} 30%, #00251A 90%)`,
                      },
                    }}
                  >
                    {loading ? "Signing In…" : "Sign In"}
                  </Button>

                  {isMobile && (
                    <>
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          OR
                        </Typography>
                      </Divider>
                      <Button
                        component={Link}
                        to={getRegisterLink()}
                        state={{ redirectTo: location.state?.redirectTo }}
                        fullWidth
                        variant="outlined"
                        sx={{
                          py: 1.4,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                          borderColor: themeGreen.primary,
                          color: themeGreen.primary,
                          "&:hover": {
                            borderColor: themeGreen.primaryDark,
                            color: themeGreen.primaryDark,
                            backgroundColor: "rgba(0,105,92,0.06)",
                          },
                        }}
                      >
                        {isEnrollmentRedirect ? "Register for Course" : "Create New Account"}
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;

