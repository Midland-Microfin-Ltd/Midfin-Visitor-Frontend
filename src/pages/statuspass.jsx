import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Paper,
  Stack,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  PersonPin as PersonPinIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Badge as BadgeIcon,
  MeetingRoom as MeetingRoomIcon,
  Home as HomeIcon,
  QrCode2 as QrCode2Icon,
  ErrorOutline as ErrorOutlineIcon,
  SentimentVeryDissatisfied as SadIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { keyframes } from "@emotion/react";
import { getVisitorStatus } from "../utilities/apiUtils/apiHelper";

// Animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const rotateGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 40px rgba(76, 175, 80, 0.8), 0 0 60px rgba(76, 175, 80, 0.4); }
  100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.4); }
`;

const StatusPass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [responseType, setResponseType] = useState(null); // 'pending', 'approved', 'rejected', 'notFound'

  const visitorId = searchParams.get("id");

  useEffect(() => {
    const loadVisitorStatus = async () => {
      if (!visitorId) {
        setResponseType("notFound");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getVisitorStatus(visitorId);

        setApiResponse(response);

        // Case 1: Pending - data is null and success is true
        if (response?.success && response?.data === null) {
          setResponseType("pending");
        }
        // Case 2: Expired - success false and message contains "expired"
        else if (
          response?.success === false &&
          response?.message?.toLowerCase().includes("expired")
        ) {
          setResponseType("expired");
        }
        // Case 3: Rejected with success false - data is null
        else if (response?.success === false && response?.data === null) {
          setResponseType("rejected");
        }
        // Case 4: Approved - data with APPROVED status
        else if (response?.success && response?.data?.status === "APPROVED") {
          setResponseType("approved");
        }
        // Case 5: Rejected - data with REJECTED status
        else if (response?.success && response?.data?.status === "REJECTED") {
          setResponseType("rejected");
        }
        // Case 6: Visitor not found
        else if (response?.errorCode === "visitorRequestNotFound") {
          setResponseType("notFound");
        }
        // Default case
        else {
          setResponseType("notFound");
        }
      } catch (err) {
        console.error("Error fetching visitor status:", err);

        // Check if error response has visitorRequestNotFound
        if (err.response?.data?.errorCode === "visitorRequestNotFound") {
          setApiResponse(err.response.data);
          setResponseType("notFound");
        } else {
          setResponseType("error");
        }
      } finally {
        setLoading(false);
      }
    };

    loadVisitorStatus();
  }, [visitorId]);

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Fade in={loading}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={isMobile ? 50 : 60}
              sx={{ color: "#2196f3", mb: 2 }}
            />
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Loading visitor status...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  // Case 1: Pending Status - Only show message
  if (responseType === "pending") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 2 : 4,
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Grow in={!loading} timeout={800}>
          <Card
            sx={{
              maxWidth: isMobile ? "100%" : 500,
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: isMobile ? 2 : 3,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: isMobile ? 3 : 5 }}>
              <Box
                sx={{
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    bgcolor: "#ff980020",
                    color: "#ff9800",
                    margin: "0 auto 20px",
                    border: "3px solid #ff9800",
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                >
                  <HourglassEmptyIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
              </Box>

              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Pending Approval
              </Typography>

              <Chip
                label="PENDING"
                sx={{
                  bgcolor: "#ff980020",
                  color: "#ff9800",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 2 : 2.5,
                  border: "2px solid #ff9800",
                  mb: 3,
                }}
              />

              <Paper
                sx={{
                  p: isMobile ? 2 : 3,
                  background: "rgba(255, 152, 0, 0.1)",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    color: "#ff9800",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {apiResponse?.message ||
                    "Visitor pass will be generated after approval"}
                </Typography>
              </Paper>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 3,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Please wait while your request is being reviewed by our team.
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    );
  }

  // Case 2b: Expired Status
  if (responseType === "expired") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 2 : 4,
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Grow in={!loading} timeout={800}>
          <Card
            sx={{
              maxWidth: isMobile ? "100%" : 500,
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: isMobile ? 2 : 3,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: isMobile ? 3 : 5 }}>
              <Box
                sx={{
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: isMobile ? "4rem" : "5rem",
                    mb: 2,
                  }}
                >
                  ⏰
                </Typography>
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    bgcolor: "#ff980020",
                    color: "#ff9800",
                    margin: "0 auto 20px",
                    border: "3px solid #ff9800",
                  }}
                >
                  <HourglassEmptyIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
              </Box>

              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Pass Expired
              </Typography>

              <Chip
                label="EXPIRED"
                sx={{
                  bgcolor: "#ff980020",
                  color: "#ff9800",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 2 : 2.5,
                  border: "2px solid #ff9800",
                  mb: 3,
                }}
              />

              <Paper
                sx={{
                  p: isMobile ? 2 : 3,
                  background: "rgba(255, 152, 0, 0.1)",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    color: "#ff9800",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  Your pass has expired
                </Typography>
              </Paper>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 3,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Please refill the form again to request a new visitor pass. 📝
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  py: isMobile ? 1.2 : 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    );
  }

  // Case 3: Rejected Status
  if (responseType === "rejected") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 2 : 4,
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Grow in={!loading} timeout={800}>
          <Card
            sx={{
              maxWidth: isMobile ? "100%" : 500,
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: isMobile ? 2 : 3,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: isMobile ? 3 : 5 }}>
              <Box
                sx={{
                  animation: `${shake} 0.5s`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: isMobile ? "4rem" : "5rem",
                    mb: 2,
                  }}
                >
                  😢
                </Typography>
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    bgcolor: "#f4433620",
                    color: "#f44336",
                    margin: "0 auto 20px",
                    border: "3px solid #f44336",
                  }}
                >
                  <SadIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
              </Box>

              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Oops!
              </Typography>

              <Chip
                label="REJECTED"
                sx={{
                  bgcolor: "#f4433620",
                  color: "#f44336",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 2 : 2.5,
                  border: "2px solid #f44336",
                  mb: 3,
                }}
              />

              <Paper
                sx={{
                  p: isMobile ? 2 : 3,
                  background: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    color: "#f44336",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {apiResponse?.message || "Please try again next time"}
                </Typography>
              </Paper>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 3,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Your visitor request has been rejected. Better luck next time!
                🙏
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  py: isMobile ? 1.2 : 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    );
  }

  // Case 3: Visitor Not Found
  if (responseType === "notFound" || responseType === "error") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 2 : 4,
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Grow in={!loading} timeout={800}>
          <Card
            sx={{
              maxWidth: isMobile ? "100%" : 500,
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: isMobile ? 2 : 3,
            }}
          >
            <CardContent sx={{ textAlign: "center", p: isMobile ? 3 : 5 }}>
              <Box
                sx={{
                  animation: `${bounce} 1s`,
                }}
              >
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    bgcolor: "#f4433620",
                    color: "#f44336",
                    margin: "0 auto 20px",
                    border: "3px solid #f44336",
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
              </Box>

              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Not Found
              </Typography>

              <Paper
                sx={{
                  p: isMobile ? 2 : 3,
                  background: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    color: "#f44336",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {apiResponse?.errorDescription ||
                    "The specified visitor request does not exist."}
                </Typography>
              </Paper>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 3,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Please check your visitor ID or contact support for assistance.
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    );
  }

  // Case 4: Approved Status - Show Full Details
  const visitorData = apiResponse?.data;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: isMobile ? 2 : 4,
        py: isMobile ? 3 : 4,
        background:
          "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
      }}
    >
      <Grow in={!loading} timeout={800}>
        <Card
          sx={{
            maxWidth: isMobile ? "100%" : isTablet ? 550 : 600,
            width: "100%",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: isMobile ? 2 : 3,
          }}
        >
          <CardContent sx={{ p: isMobile ? 2.5 : isTablet ? 3 : 4 }}>
            {/* Header */}
            <Fade in={!loading} timeout={1000}>
              <Box sx={{ textAlign: "center", mb: isMobile ? 3 : 4 }}>
                <Box
                  sx={{
                    animation: `${rotateGlow} 2s ease-in-out infinite`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: isMobile ? 80 : 100,
                      height: isMobile ? 80 : 100,
                      bgcolor: "#4caf5020",
                      color: "#4caf50",
                      margin: "0 auto 20px",
                      border: "3px solid #4caf50",
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                  </Avatar>
                </Box>

                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    mb: 1,
                    fontSize: isMobile ? "1.5rem" : "2.125rem",
                  }}
                >
                  Visitor Pass
                </Typography>

                <Chip
                  label="APPROVED"
                  sx={{
                    bgcolor: "#4caf5020",
                    color: "#4caf50",
                    fontWeight: 600,
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 2 : 2.5,
                    border: "2px solid #4caf50",
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                />
              </Box>
            </Fade>

            <Divider
              sx={{
                mb: isMobile ? 2 : 3,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            />

            {/* Visitor Details */}
            <Stack spacing={isMobile ? 1.5 : 2}>
              {/* Visitor ID */}
              <Slide direction="right" in={!loading} timeout={600}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #2196f3",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#2196f320",
                        color: "#2196f3",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <QrCode2Icon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Visitor ID
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontFamily: "monospace",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {visitorData?.visitorId}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Full Name */}
              <Slide direction="right" in={!loading} timeout={700}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #9c27b0",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#9c27b020",
                        color: "#9c27b0",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <PersonPinIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Visitor Name
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {visitorData?.visitorName}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Phone */}
              <Slide direction="right" in={!loading} timeout={800}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #4caf50",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#4caf5020",
                        color: "#4caf50",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <PhoneIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Phone Number
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                        }}
                      >
                        {visitorData?.phoneNo}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Government ID */}
              <Slide direction="right" in={!loading} timeout={900}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #ff9800",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#ff980020",
                        color: "#ff9800",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <BadgeIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Government ID
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {visitorData?.governmentId}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Purpose */}
              <Slide direction="right" in={!loading} timeout={1000}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #e91e63",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#e91e6320",
                        color: "#e91e63",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <EventNoteIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Purpose of Visit
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {visitorData?.visitPurpose}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Person to Meet */}
              <Slide direction="right" in={!loading} timeout={1100}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #00bcd4",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#00bcd420",
                        color: "#00bcd4",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <MeetingRoomIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Person to Meet
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {visitorData?.personToMeet}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        {visitorData?.department}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>

              {/* Valid Period */}
              <Slide direction="right" in={!loading} timeout={1200}>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderLeft: "4px solid #607d8b",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={isMobile ? 1.5 : 2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#607d8b20",
                        color: "#607d8b",
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                        }}
                      >
                        Valid Period
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: isMobile ? "0.9rem" : "1rem",
                        }}
                      >
                        {visitorData?.validFrom} to {visitorData?.validUntil}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Slide>
            </Stack>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
};

export default StatusPass;
