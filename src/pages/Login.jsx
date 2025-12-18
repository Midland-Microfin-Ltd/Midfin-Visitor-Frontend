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
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  QrCodeScanner as QrCodeScannerIcon,
  QrCode as QrCodeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Notes as NotesIcon,
  Security as SecurityIcon,
  CameraAlt as CameraIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import visitorBgImage from "../assets/visitor_bg_image.webp";
import { loginUser } from "../utilities/apiUtils/apiHelper";
import {
  storeInLocalStorage,
  storeObjectInLocalStorage,
} from "../utilities/localStorageUtils";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Visitor QR is now first tab
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const navigate = useNavigate();

  const generateQRCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VISITOR-${timestamp.toString(36).toUpperCase()}-${random}`;
  };

  const getRegistrationLink = (qrCode) => {
    return `${window.location.origin}/#/register/${qrCode}`;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      if (response.data) {
        const { token, user } = response.data;

        if (token) {
          storeInLocalStorage("token", token);
          storeInLocalStorage("isAuthenticated", "true");

          if (user) {
            storeObjectInLocalStorage("userData", user);
            storeInLocalStorage(
              "username",
              user.username || user.email || username
            );
          } else {
            storeInLocalStorage("username", username);
          }

          navigate("/dashboard");
        } else {
          setError("No token received from server");
        }
      } else if (response.token) {
        storeInLocalStorage("token", response.token);
        storeInLocalStorage("isAuthenticated", "true");
        storeInLocalStorage("username", response.user?.username || username);

        if (response.user) {
          storeObjectInLocalStorage("userData", response.user);
        }

        navigate("/dashboard");
      } else {
        setError(response.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.errorCode === "networkError") {
        setError("Please check your internet connection!");
      } else if (error.errorDescription) {
        setError(error.errorDescription);
      } else if (error.message) {
        setError(error.message);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = () => {
    setQrLoading(true);
    setTimeout(() => {
      const qrCode = generateQRCode();
      setGeneratedQRCode(qrCode);
      setQrLoading(false);
      setQrSuccess(true);
      setQrDialogOpen(true);
    }, 800);
  };

  const handleCloseQRDialog = () => {
    setQrDialogOpen(false);
    setTimeout(() => {
      setQrSuccess(false);
      setGeneratedQRCode("");
    }, 300);
  };

  const handleCopyQRCode = () => {
    const link = getRegistrationLink(generatedQRCode);
    navigator.clipboard.writeText(link);
    alert("Registration link copied to clipboard!");
  };

  const handleShareQRCode = () => {
    const link = getRegistrationLink(generatedQRCode);
    if (navigator.share) {
      navigator.share({
        title: "Visitor Registration",
        text: `Please use this link to register as a visitor: ${link}`,
        url: link,
      });
    } else {
      handleCopyQRCode();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${visitorBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        py: { xs: 2, sm: 4 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(3px)",
        },
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {/* Left Side - Branding */}
            <Grid item xs={12} md={5}>
              <Fade in={true} timeout={800}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 3 },
                    textAlign: "center",
                    backgroundColor: "rgba(25, 118, 210, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <SecurityIcon
                      sx={{
                        fontSize: 64,
                        color: "white",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      background: "linear-gradient(45deg, #fff 30%, #21CBF3 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: { xs: "1.8rem", sm: "2.2rem" },
                    }}
                  >
                    MIDFIN VISITOR
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      mb: 1,
                    }}
                  >
                    Visitor Management System
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "block",
                      mt: 2,
                    }}
                  >
                    Secure • Efficient • Professional
                  </Typography>
                </Card>
              </Fade>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid item xs={12} md={7}>
              <Zoom in={true} timeout={800}>
                <Paper
                  elevation={6}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    width: "100%",
                    borderRadius: 3,
                    backgroundColor: "rgba(30, 35, 46, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.4)",
                    maxWidth: 500,
                    mx: "auto",
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    sx={{
                      mb: 2,
                      minHeight: 48,
                      "& .MuiTab-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        minHeight: 48,
                        px: { xs: 1, sm: 2 },
                        "&.Mui-selected": {
                          color: "white",
                        },
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#1976d2",
                        height: 3,
                        borderRadius: 3,
                      },
                    }}
                  >
                    {/* VISITOR QR TAB FIRST */}
                    <Tab
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 0.5,
                          }}
                        >
                          <QrCodeIcon fontSize="small" />
                          <Typography
                            sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                          >
                            VISITOR QR
                          </Typography>
                        </Box>
                      }
                    />
                    {/* ADMIN LOGIN TAB SECOND */}
                    <Tab
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 0.5,
                          }}
                        >
                          <SecurityIcon fontSize="small" />
                          <Typography
                            sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                          >
                            ADMIN LOGIN
                          </Typography>
                        </Box>
                      }
                    />
                  </Tabs>

                  <Divider
                    sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
                  />

                  {activeTab === 0 ? ( // VISITOR QR CONTENT
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: "white",
                          fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        }}
                      >
                        Generate Visitor QR
                      </Typography>

                      <Typography
                        variant="body2"
                        gutterBottom
                        sx={{
                          mb: 3,
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: { xs: "0.8rem", sm: "0.85rem" },
                        }}
                      >
                        Create QR code for visitor self-registration
                      </Typography>

                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          maxWidth: 220,
                          height: 220,
                          margin: "0 auto 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {qrLoading ? (
                          <CircularProgress
                            size={60}
                            thickness={4}
                            sx={{ color: "#4CAF50" }}
                          />
                        ) : qrSuccess ? (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "white",
                              borderRadius: 2,
                              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                            }}
                          >
                            <QRCodeSVG
                              value={getRegistrationLink(generatedQRCode)}
                              size={160}
                              includeMargin
                              level="H"
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              border: "2px dashed rgba(255, 255, 255, 0.3)",
                              borderRadius: 3,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "rgba(255, 255, 255, 0.5)",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                borderColor: "#4CAF50",
                                backgroundColor: "rgba(76, 175, 80, 0.05)",
                                color: "#4CAF50",
                              },
                            }}
                            onClick={handleGenerateQR}
                          >
                            <QrCodeIcon
                              sx={{ fontSize: 60, mb: 1.5 }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" } }}
                            >
                              Generate QR Code
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {generatedQRCode && (
                        <Box sx={{ mt: 1.5 }}>
                          <Chip
                            label={generatedQRCode}
                            color="success"
                            size="small"
                            sx={{
                              mb: 1.5,
                              fontWeight: "medium",
                              fontSize: { xs: "0.75rem", sm: "0.8rem" },
                              py: 1,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "rgba(255, 255, 255, 0.6)",
                              mb: 2,
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            }}
                          >
                            Scan QR or share link to register
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          onClick={handleGenerateQR}
                          disabled={qrLoading}
                          startIcon={
                            qrLoading ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <QrCodeIcon />
                            )
                          }
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: "none",
                            px: 3,
                            fontSize: { xs: "0.8rem", sm: "0.85rem" },
                            background: qrSuccess
                              ? "linear-gradient(45deg, #4CAF50 0%, #2E7D32 100%)"
                              : "linear-gradient(45deg, #4CAF50 0%, #66BB6A 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #388E3C 0%, #1B5E20 100%)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          {qrLoading
                            ? "Generating..."
                            : qrSuccess
                            ? "New QR"
                            : "Generate QR"}
                        </Button>

                        {qrSuccess && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            onClick={() => setQrDialogOpen(true)}
                            startIcon={<PhotoCameraIcon />}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              px: 3,
                              fontSize: { xs: "0.8rem", sm: "0.85rem" },
                              borderColor: "rgba(255, 255, 255, 0.3)",
                              color: "white",
                              "&:hover": {
                                borderColor: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                              },
                            }}
                          >
                            View & Share
                          </Button>
                        )}
                      </Box>

                      <Divider
                        sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
                      />

                      <Typography
                        variant="body2"
                        color="rgba(255, 255, 255, 0.6)"
                        sx={{
                          mt: 1,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        }}
                      >
                        Scan QR → Fill form → Approval → Check-in
                      </Typography>
                    </Box>
                  ) : ( // ADMIN LOGIN CONTENT (now tab 1)
                    <Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: "white",
                          fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        }}
                      >
                        Admin Dashboard Access
                      </Typography>

                      {error && (
                        <Alert
                          severity="error"
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                            color: "#ff6b6b",
                            py: 0.5,
                            fontSize: { xs: "0.8rem", sm: "0.85rem" },
                          }}
                          onClose={() => setError("")}
                        >
                          {error}
                        </Alert>
                      )}

                      <form onSubmit={handleSubmit}>
                        <TextField
                          fullWidth
                          label="Username / Email"
                          variant="outlined"
                          margin="normal"
                          size="small"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          autoFocus
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.2)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.3)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              "&.Mui-focused": {
                                color: "#1976d2",
                              },
                            },
                            "& .MuiInputBase-input": {
                              color: "white",
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              py: 1.5,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.5)",
                                    fontSize: { xs: "1rem", sm: "1.1rem" },
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          variant="outlined"
                          margin="normal"
                          size="small"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.2)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.3)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              "&.Mui-focused": {
                                color: "#1976d2",
                              },
                            },
                            "& .MuiInputBase-input": {
                              color: "white",
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              py: 1.5,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SecurityIcon
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.5)",
                                    fontSize: { xs: "1rem", sm: "1.1rem" },
                                  }}
                                />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    fontSize: { xs: "1rem", sm: "1.1rem" },
                                    "&:hover": {
                                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                                      color: "white",
                                    },
                                  }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="medium"
                          type="submit"
                          disabled={loading}
                          startIcon={
                            loading ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <LoginIcon />
                            )
                          }
                          sx={{
                            mt: 2,
                            mb: 1.5,
                            py: 1.2,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "0.95rem" },
                            textTransform: "none",
                            background:
                              "linear-gradient(45deg, #1976d2 0%, #21CBF3 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #1565c0 0%, #00B0FF 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 16px rgba(25, 118, 210, 0.3)",
                            },
                            "&.Mui-disabled": {
                              background: "rgba(255, 255, 255, 0.1)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {loading ? "Signing in..." : "Sign in to Dashboard"}
                        </Button>
                      </form>
                    </Box>
                  )}

                  <Typography
                    variant="caption"
                    display="block"
                    align="center"
                    sx={{
                      mt: 3,
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    © {new Date().getFullYear()} Midfin Visitor Management System. All rights reserved.
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQRDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(30, 35, 46, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 3,
            mx: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            pb: 1,
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
            Visitor Registration QR
          </Typography>
          <IconButton
            onClick={handleCloseQRDialog}
            sx={{ color: "rgba(255, 255, 255, 0.7)", p: 0.5 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ textAlign: "center", pt: 2, pb: 2 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              display: "inline-block",
              mb: 2,
            }}
          >
            <QRCodeSVG
              value={getRegistrationLink(generatedQRCode)}
              size={160}
              includeMargin
            />
          </Box>

          <Typography variant="subtitle1" color="white" gutterBottom sx={{ fontWeight: 600 }}>
            {generatedQRCode}
          </Typography>

          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="white" gutterBottom sx={{ fontSize: "0.85rem" }}>
              Registration Link:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  flex: 1,
                  textAlign: "left",
                  color: "rgba(255, 255, 255, 0.8)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem",
                }}
              >
                {getRegistrationLink(generatedQRCode)}
              </Typography>
              <IconButton
                size="small"
                onClick={handleCopyQRCode}
                sx={{ color: "rgba(255, 255, 255, 0.7)", p: 0.5 }}
              >
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Paper>
          </Box>

          <Grid container spacing={1.5} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyQRCode}
                size="small"
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontSize: "0.85rem",
                  py: 0.8,
                  "&:hover": {
                    borderColor: "#4CAF50",
                  },
                }}
              >
                Copy Link
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShareQRCode}
                size="small"
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontSize: "0.85rem",
                  py: 0.8,
                  "&:hover": {
                    borderColor: "#1976d2",
                  },
                }}
              >
                Share
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 1.5, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleCloseQRDialog}
            size="small"
            sx={{
              borderRadius: 2,
              px: 3,
              fontSize: "0.9rem",
              background: "linear-gradient(45deg, #1976d2 0%, #21CBF3 100%)",
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;