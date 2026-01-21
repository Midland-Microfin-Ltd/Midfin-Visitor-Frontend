import React from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  Grid,
} from "@mui/material";
import {
  Security,
  QrCode2,
  VerifiedUser,
  PhoneOutlined,
  BadgeOutlined,
  BusinessOutlined,
  PersonOutline,
  EventAvailableOutlined,
  EventBusyOutlined,
} from "@mui/icons-material";

const VisitorPass = ({ passData, visible = true, downloadRef = null }) => {
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    const names = name.trim().split(" ");
    let initials = "";
    for (let i = 0; i < Math.min(2, names.length); i++) {
      if (names[i].length > 0) {
        initials += names[i][0].toUpperCase();
      }
    }
    return initials || "?";
  };

  return (
    <Box
      id="premium-visitor-pass-card"
      ref={downloadRef}
      sx={{
        maxWidth: 460,
        width: "100%",
        position: "relative",
        zIndex: 1,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "all 0.5s ease",
      }}
    >
      <Card
        sx={{
          background: "linear-gradient(to bottom, #ffffff 0%, #fafbff 100%)",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          boxShadow:
            "0 15px 35px rgba(102, 126, 234, 0.25), 0 5px 15px rgba(118, 75, 162, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.9)",
        }}
      >
        {/* Premium Header with Holographic Effect */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f6d365 100%)",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "shine 3s infinite",
            },
            "@keyframes shine": {
              "0%": { left: "-100%" },
              "100%": { left: "200%" },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Security sx={{ color: "white", fontSize: 22 }} />
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Authorized Visitor
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "1.7rem",
                  letterSpacing: 1.2,
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  lineHeight: 1,
                }}
              >
                VISITOR PASS
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  mt: 0.5,
                }}
              >
                {passData?.passNumber || "VP-000000"}
              </Typography>
            </Box>
            <Box
              sx={{
                background: "white",
                borderRadius: 2,
                padding: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <QrCode2 sx={{ color: "#667eea", fontSize: 52 }} />
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ padding: "28px" }}>
          {/* Photo and Name Section */}
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                alt={passData?.fullName}
                sx={{
                  width: 105,
                  height: 105,
                  border: "4px solid transparent",
                  backgroundImage:
                    "linear-gradient(white, white), linear-gradient(135deg, #667eea, #764ba2)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  fontSize: "3rem",
                  bgcolor: "#667eea",
                }}
              >
                {getInitials(passData?.fullName)}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid white",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                <VerifiedUser sx={{ color: "white", fontSize: 16 }} />
              </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  mb: 0.8,
                  lineHeight: 1.2,
                }}
              >
                {passData?.fullName || "Visitor Name"}
              </Typography>
              <Chip
                icon={<BadgeOutlined sx={{ fontSize: 15 }} />}
                label={passData?.govtId || "ID: N/A"}
                size="small"
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                  color: "#667eea",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  height: 28,
                  border: "1.5px solid rgba(102, 126, 234, 0.3)",
                  mb: 1.2,
                  "& .MuiChip-icon": {
                    color: "#764ba2",
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneOutlined sx={{ color: "#667eea", fontSize: 18 }} />
                <Typography
                  sx={{
                    color: "#4a5568",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {passData?.contactNumber || "Phone: N/A"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04))",
                  borderRadius: 2.5,
                  padding: "16px 18px",
                  border: "1.5px solid rgba(102, 126, 234, 0.15)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <BusinessOutlined
                    sx={{ color: "#667eea", fontSize: 24 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "#718096",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 0.3,
                      }}
                    >
                      Purpose of Visit
                    </Typography>
                    <Typography
                      sx={{
                        color: "#2d3748",
                        fontWeight: 800,
                        fontSize: "1rem",
                      }}
                    >
                      {passData?.purposeOfVisit || "Business Meeting"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(118, 75, 162, 0.06), rgba(240, 147, 251, 0.04))",
                  borderRadius: 2.5,
                  padding: "16px 18px",
                  border: "1.5px solid rgba(118, 75, 162, 0.15)",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <PersonOutline
                    sx={{ color: "#764ba2", fontSize: 24 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "#718096",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 0.3,
                      }}
                    >
                      Person to Meet
                    </Typography>
                    <Typography
                      sx={{
                        color: "#2d3748",
                        fontWeight: 800,
                        fontSize: "1rem",
                      }}
                    >
                      {passData?.personToMeet || "Contact Person"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(72, 187, 120, 0.08), rgba(104, 211, 145, 0.05))",
                  borderRadius: 2.5,
                  padding: "16px 14px",
                  border: "1.5px solid rgba(72, 187, 120, 0.25)",
                  textAlign: "center",
                }}
              >
                <EventAvailableOutlined
                  sx={{ color: "#48bb78", fontSize: 24, mb: 0.8 }}
                />
                <Typography
                  sx={{
                    color: "#718096",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    mb: 0.5,
                  }}
                >
                  Valid From
                </Typography>
                <Typography
                  sx={{
                    color: "#2f855a",
                    fontWeight: 900,
                    fontSize: "0.85rem",
                  }}
                >
                  {passData?.validFrom}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(245, 101, 101, 0.08), rgba(252, 129, 129, 0.05))",
                  borderRadius: 2.5,
                  padding: "16px 14px",
                  border: "1.5px solid rgba(245, 101, 101, 0.25)",
                  textAlign: "center",
                }}
              >
                <EventBusyOutlined
                  sx={{ color: "#f56565", fontSize: 24, mb: 0.8 }}
                />
                <Typography
                  sx={{
                    color: "#718096",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    mb: 0.5,
                  }}
                >
                  Valid Till
                </Typography>
                <Typography
                  sx={{
                    color: "#c53030",
                    fontWeight: 900,
                    fontSize: "0.85rem",
                  }}
                >
                  {passData?.validTill}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Premium Footer */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.06))",
            borderTop: "1.5px solid rgba(102, 126, 234, 0.15)",
            padding: "16px 24px",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "0.8rem",
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            Provided by Midland Microfin Limited
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default VisitorPass;