import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Grid,
  LinearProgress,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  VpnKey,
  Save,
  Info,
  TrendingUp,
  AttachMoney,
  Speed,
  VideoLibrary,
} from "@mui/icons-material";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ep3 from "../api/ep3";
import global1 from "../pages/global1";

const APIKeyManagerInterface = () => {
  const [localApiKeySettings, setLocalApiKeySettings] = useState({
    defaultapikey: "",
    personalapikey: "",
    usepersonalkey: false,
    monthlylimit: 1000,
    currentusage: 0,
    apikeyname: "Default College Key",
    personalapikeyname: "My Gemini API Key",
    // NEW YOUTUBE FIELDS
    youtubeapikey: "",
    youtubequotaused: 0,
    youtubequotalimit: 10000,
  });

  const [savedApiKeySettings, setSavedApiKeySettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingYouTube, setTestingYouTube] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [testResult, setTestResult] = useState(null);
  const [youtubeTestResult, setYouTubeTestResult] = useState(null);

  useEffect(() => {
    fetchAPIKeySettings();
  }, []);

  const fetchAPIKeySettings = async () => {
    setLoading(true);
    try {
      const activeKeyResponse = await ep3.get("/getactiveapikeyds1", {
        params: {
          colid: global1.colid,
          facultyid: global1.userEmail,
        },
      });

      if (activeKeyResponse.data && activeKeyResponse.data.success) {
        const activeKeyData = activeKeyResponse.data.data;
        const settingsData = {
          defaultapikey: activeKeyData.usepersonalkey
            ? ""
            : activeKeyData.apikey || "",
          personalapikey: activeKeyData.usepersonalkey
            ? activeKeyData.apikey || ""
            : "",
          usepersonalkey: activeKeyData.usepersonalkey || false,
          monthlylimit: activeKeyData.monthlylimit || 10000,
          currentusage: activeKeyData.currentusage || 0,
          apikeyname: activeKeyData.keyname || "Default College Key",
          personalapikeyname: activeKeyData.keyname || "My Gemini API Key",
          // NEW YOUTUBE FIELDS
          youtubeapikey: activeKeyData.youtubeapikey || "",
          youtubequotaused: activeKeyData.youtubequotaused || 0,
          youtubequotalimit: activeKeyData.youtubequotalimit || 10000,
        };

        setSavedApiKeySettings(settingsData);
        setLocalApiKeySettings(settingsData);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Active key fetch failed:", error);
    }

    try {
      const response = await ep3.get("/getapikeyds1", {
        params: {
          colid: global1.colid,
          facultyid: global1.userEmail,
        },
      });

      if (response.data && response.data.success) {
        const serverData = response.data.data;
        const settingsData = {
          ...serverData,
          defaultapikey:
            serverData.defaultapikey === "***HIDDEN***"
              ? ""
              : serverData.defaultapikey || "",
          personalapikey:
            serverData.personalapikey === "***HIDDEN***"
              ? ""
              : serverData.personalapikey || "",
          youtubeapikey:
            serverData.youtubeapikey === "***HIDDEN***"
              ? ""
              : serverData.youtubeapikey || "",
        };

        setSavedApiKeySettings(serverData);
        setLocalApiKeySettings(settingsData);
      } else {
        console.warn("No data received or unsuccessful response");
        setMessage({
          type: "warning",
          text: "No API key settings found. Using defaults.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to load API key settings: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field, value) => {
    setLocalApiKeySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setMessage({ type: "", text: "" });
    setTestResult(null);
    setYouTubeTestResult(null);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name: global1.userName,
        user: global1.userEmail,
        colid: global1.colid,
        facultyid: global1.userEmail,
        isactive: true,
        ...localApiKeySettings,
      };

      const response = await ep3.post("/createapikeyds1", payload);

      if (response.data.success) {
        setSavedApiKeySettings(localApiKeySettings);
        setMessage({
          type: "success",
          text: "API key settings saved successfully!",
        });
        setTimeout(() => {
          fetchAPIKeySettings();
        }, 1000);
      } else {
        throw new Error(response.data.message || "Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({
        type: "error",
        text: `Failed to save API key settings: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const testGeminiAPIKey = async () => {
    setTesting(true);
    setTestResult(null);
    setMessage({ type: "", text: "" });

    const apiKeyToTest = localApiKeySettings.usepersonalkey
      ? localApiKeySettings.personalapikey?.trim()
      : localApiKeySettings.defaultapikey?.trim();

    if (!apiKeyToTest) {
      setMessage({
        type: "error",
        text: "Please enter a Gemini API key to test.",
      });
      setTesting(false);
      return;
    }

    try {
      setMessage({ type: "info", text: "Testing Gemini API key..." });

      const genAI = new GoogleGenerativeAI(apiKeyToTest);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const result = await model.generateContent(
        "Say exactly 'API working' in 2 words only."
      );
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        setTestResult("success");
        setMessage({
          type: "success",
          text: "Gemini API key is valid and working!",
        });
      } else {
        setTestResult("fail");
        setMessage({
          type: "error",
          text: "Gemini API key test returned empty response.",
        });
      }
    } catch (error) {
      console.error("API test error:", error);
      setTestResult("fail");
      let errorMsg =
        "Failed to test Gemini API key. Please check your internet connection.";

      if (
        error.message.includes("API_KEY_INVALID") ||
        error.message.includes("invalid")
      ) {
        errorMsg = "Gemini API key is invalid. Please check your key.";
      } else if (error.message.includes("quota")) {
        errorMsg =
          "Gemini API quota exceeded. Key is valid but no quota remaining.";
        setTestResult("success");
      } else if (
        error.message.includes("models/") &&
        error.message.includes("not found")
      ) {
        errorMsg = "Model not available but API key is valid.";
        setTestResult("success");
      }

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setTesting(false);
    }
  };

  // NEW: Test YouTube API Key function
  const testYouTubeAPIKey = async () => {
    setTestingYouTube(true);
    setYouTubeTestResult(null);

    const apiKey = localApiKeySettings.youtubeapikey?.trim();
    if (!apiKey) {
      setMessage({
        type: "error",
        text: "Please enter a YouTube API key to test.",
      });
      setTestingYouTube(false);
      return;
    }

    try {
      setMessage({ type: "info", text: "Testing YouTube API key..." });

      // Simple test search
      const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (response.ok && data.items) {
        setYouTubeTestResult("success");
        setMessage({
          type: "success",
          text: "YouTube API key is valid and working!",
        });
      } else {
        setYouTubeTestResult("fail");
        if (data.error) {
          if (data.error.code === 403) {
            setMessage({
              type: "error",
              text: "YouTube API key is invalid or quota exceeded.",
            });
          } else {
            setMessage({
              type: "error",
              text: `YouTube API error: ${data.error.message}`,
            });
          }
        } else {
          setMessage({ type: "error", text: "YouTube API key test failed." });
        }
      }
    } catch (error) {
      console.error("YouTube API test error:", error);
      setYouTubeTestResult("fail");
      setMessage({
        type: "error",
        text: "Failed to test YouTube API key. Please check your internet connection.",
      });
    } finally {
      setTestingYouTube(false);
    }
  };

  const getUsagePercentage = () => {
    return localApiKeySettings.monthlylimit > 0
      ? (localApiKeySettings.currentusage / localApiKeySettings.monthlylimit) *
          100
      : 0;
  };

  const getYouTubeUsagePercentage = () => {
    return localApiKeySettings.youtubequotalimit > 0
      ? (localApiKeySettings.youtubequotaused /
          localApiKeySettings.youtubequotalimit) *
          100
      : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "success";
  };

  const estimatedCost = (
    (localApiKeySettings.currentusage * 0.001) /
    1000
  ).toFixed(4);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading API key settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}
      >
        <VpnKey sx={{ color: "#7c3aed" }} />
        AI API Key Management
      </Typography>

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Usage Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <TrendingUp />
            Usage Statistics
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                Gemini AI Monthly Usage
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {localApiKeySettings.currentusage} /{" "}
                {localApiKeySettings.monthlylimit} requests
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getUsagePercentage()}
                color={getUsageColor(getUsagePercentage())}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="caption">
                {getUsagePercentage().toFixed(1)}% of limit used • Est. cost: $
                {estimatedCost}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                YouTube API Daily Usage
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {localApiKeySettings.youtubequotaused} /{" "}
                {localApiKeySettings.youtubequotalimit} quota units
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getYouTubeUsagePercentage()}
                color={getUsageColor(getYouTubeUsagePercentage())}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="caption">
                {getYouTubeUsagePercentage().toFixed(1)}% of daily quota used
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* YouTube API Key Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <VideoLibrary />
            YouTube Data API Configuration
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            YouTube API is required for AI video search. Get your free API key
            from{" "}
            <Link
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener"
            >
              Google Cloud Console
            </Link>
            . You get 10,000 quota units daily for free.
          </Alert>

          <TextField
            fullWidth
            label="YouTube Data API Key"
            value={localApiKeySettings.youtubeapikey}
            onChange={(e) =>
              handleSettingsChange("youtubeapikey", e.target.value)
            }
            placeholder="Enter your YouTube Data API v3 key..."
            sx={{ mb: 2 }}
            helperText="Required for AI video search functionality"
            InputProps={{
              endAdornment: (
                <Button
                  onClick={testYouTubeAPIKey}
                  disabled={
                    testingYouTube || !localApiKeySettings.youtubeapikey
                  }
                  startIcon={
                    testingYouTube ? (
                      <CircularProgress size={16} />
                    ) : (
                      <VideoLibrary />
                    )
                  }
                  sx={{ ml: 1, minWidth: 100 }}
                >
                  {testingYouTube ? "Testing..." : "Test"}
                </Button>
              ),
            }}
          />

          {/* YouTube Test Result */}
          {youtubeTestResult && (
            <Alert
              severity={youtubeTestResult === "success" ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              {youtubeTestResult === "success"
                ? "✅ YouTube API Key is valid and working!"
                : "❌ YouTube API Key validation failed"}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Gemini API Key Configuration - Your existing code */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <VpnKey />
            Gemini AI API Key Configuration
          </Typography>

          {/* Key Selection Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={localApiKeySettings.usepersonalkey}
                onChange={(e) =>
                  handleSettingsChange("usepersonalkey", e.target.checked)
                }
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  Use Personal Gemini API Key
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Switch between college default key and your personal Google AI
                  Studio API key
                </Typography>
              </Box>
            }
          />

          {/* Default Key Section */}
          {!localApiKeySettings.usepersonalkey && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                College Default Gemini API Key
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                You are using the college's default Gemini API key. No
                additional setup required!
              </Typography>

              <TextField
                fullWidth
                label="Key Name"
                value={localApiKeySettings.apikeyname}
                onChange={(e) =>
                  handleSettingsChange("apikeyname", e.target.value)
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Monthly Usage Limit"
                type="number"
                value={localApiKeySettings.monthlylimit}
                onChange={(e) =>
                  handleSettingsChange(
                    "monthlylimit",
                    parseInt(e.target.value) || 0
                  )
                }
                helperText="Maximum requests you can make per month"
              />
            </Box>
          )}

          {/* Personal Key Section */}
          {localApiKeySettings.usepersonalkey && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#f0f9f0", borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Personal Gemini API Key
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Enter your personal Gemini API key. Get one FREE from{" "}
                <Link
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener"
                >
                  Google AI Studio
                </Link>
                . No billing required!
              </Typography>

              <TextField
                fullWidth
                label="Personal Gemini API Key"
                value={localApiKeySettings.personalapikey}
                onChange={(e) =>
                  handleSettingsChange("personalapikey", e.target.value)
                }
                placeholder="AIza..."
                sx={{ mb: 2 }}
                helperText="Your personal Google AI Studio API key (starts with AIza)"
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Key Name"
                    value={localApiKeySettings.personalapikeyname}
                    onChange={(e) =>
                      handleSettingsChange("personalapikeyname", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    onClick={testGeminiAPIKey}
                    disabled={testing || !localApiKeySettings.personalapikey}
                    startIcon={
                      testing ? <CircularProgress size={16} /> : <Info />
                    }
                    sx={{ height: "56px" }}
                  >
                    {testing ? "Testing..." : "Test Key"}
                  </Button>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Monthly Usage Limit"
                type="number"
                value={localApiKeySettings.monthlylimit}
                onChange={(e) =>
                  handleSettingsChange(
                    "monthlylimit",
                    parseInt(e.target.value) || 0
                  )
                }
                helperText="Set your own usage limit (Gemini has generous free quotas)"
              />
            </Box>
          )}

          {/* Test Result Display */}
          {testResult && (
            <Alert
              severity={testResult === "success" ? "success" : "error"}
              sx={{ mt: 2 }}
            >
              {testResult === "success"
                ? "✅ Gemini API Key is valid and working!"
                : "❌ Gemini API Key validation failed"}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={fetchAPIKeySettings}
          variant="outlined"
          startIcon={<Info />}
        >
          Refresh
        </Button>

        <Button
          onClick={handleSaveSettings}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          sx={{
            backgroundColor: "#16a34a",
            "&:hover": { backgroundColor: "#15803d" },
            minWidth: 120,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </Box>

      {/* Usage Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 AI API Usage Tips
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Gemini AI has generous free quotas - perfect for educational use" />
            </ListItem>
            <ListItem>
              <ListItemText primary="YouTube API provides 10,000 quota units daily - each search costs 100 units" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use personal API keys for unlimited access to your own quotas" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Both APIs are completely free for educational purposes" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default APIKeyManagerInterface;
