import { Box, Card, Typography, Avatar, Grid, Button, Chip } from "@mui/material"
import {
  PersonOutline,
  BadgeOutlined,
  BusinessOutlined,
  PhoneOutlined,
  EventAvailableOutlined,
  EventBusyOutlined,
  VerifiedUser,
  QrCode2,
  Download,
  Print,
  Security,
} from "@mui/icons-material"
import { useState, useEffect } from "react"

export default function VisitorPassPage() {
  const [passData] = useState({
    fullName: "John Doe",
    govtId: "AADHAR-1234-5678-9012",
    photo: "/professional-headshot.png",
    purposeOfVisit: "Business Meeting",
    personToMeet: "Mr. Rajesh Kumar",
    contactNumber: "+91 98765 43210",
    validFrom: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    validTill: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    passNumber: `VP-${Date.now().toString().slice(-6)}`,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert("Pass download functionality would be implemented here")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, sm: 3 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(240, 147, 251, 0.3) 0%, transparent 50%)",
          animation: "pulse 8s ease-in-out infinite",
          pointerEvents: "none",
        },
        "@keyframes pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
      }}
    >
      {/* Card-Style Pass */}
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: 420, md: 460 },
          width: "100%",
          position: "relative",
          zIndex: 1,
          transform: isVisible ? "translateY(0) rotateX(0deg)" : "translateY(30px) rotateX(15deg)",
          opacity: isVisible ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          perspective: "1000px",
        }}
      >
        <Card
          sx={{
            background: "linear-gradient(to bottom, #ffffff 0%, #fafbff 100%)",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 25px 70px rgba(102, 126, 234, 0.4), 0 10px 40px rgba(118, 75, 162, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
          }}
        >
          {/* Premium Header with Holographic Effect */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f6d365 100%)",
              padding: { xs: "20px", sm: "24px" },
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation: "shine 3s infinite",
              },
              "@keyframes shine": {
                "0%": { left: "-100%" },
                "100%": { left: "200%" },
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Security sx={{ color: "white", fontSize: { xs: 20, sm: 22 } }} />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.95)",
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
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
                    fontSize: { xs: "1.5rem", sm: "1.7rem" },
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
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    mt: 0.5,
                  }}
                >
                  {passData.passNumber}
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
                <QrCode2 sx={{ color: "#667eea", fontSize: { xs: 44, sm: 52 } }} />
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ padding: { xs: "24px", sm: "28px" } }}>
            {/* Photo and Name Section with Premium Styling */}
            <Box sx={{ display: "flex", gap: { xs: 2.5, sm: 3 }, mb: 3 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={passData.photo}
                  alt={passData.fullName}
                  sx={{
                    width: { xs: 95, sm: 105 },
                    height: { xs: 95, sm: 105 },
                    border: "4px solid transparent",
                    backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #667eea, #764ba2)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  }}
                />
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
                    fontSize: { xs: "1.3rem", sm: "1.5rem" },
                    mb: 0.8,
                    lineHeight: 1.2,
                  }}
                >
                  {passData.fullName}
                </Typography>
                <Chip
                  icon={<BadgeOutlined sx={{ fontSize: 15 }} />}
                  label={passData.govtId}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                    color: "#667eea",
                    fontWeight: 800,
                    fontSize: { xs: "0.72rem", sm: "0.75rem" },
                    height: { xs: 26, sm: 28 },
                    border: "1.5px solid rgba(102, 126, 234, 0.3)",
                    mb: 1.2,
                    "& .MuiChip-icon": {
                      color: "#764ba2",
                    },
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneOutlined sx={{ color: "#667eea", fontSize: { xs: 16, sm: 18 } }} />
                  <Typography
                    sx={{
                      color: "#4a5568",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      fontWeight: 700,
                    }}
                  >
                    {passData.contactNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Details Grid with Premium Cards */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04))",
                    borderRadius: 2.5,
                    padding: { xs: "14px 16px", sm: "16px 18px" },
                    border: "1.5px solid rgba(102, 126, 234, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                      borderColor: "rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BusinessOutlined sx={{ color: "#667eea", fontSize: { xs: 22, sm: 24 } }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: "#718096",
                          fontSize: { xs: "0.7rem", sm: "0.72rem" },
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
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                        }}
                      >
                        {passData.purposeOfVisit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(118, 75, 162, 0.06), rgba(240, 147, 251, 0.04))",
                    borderRadius: 2.5,
                    padding: { xs: "14px 16px", sm: "16px 18px" },
                    border: "1.5px solid rgba(118, 75, 162, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(118, 75, 162, 0.15)",
                      borderColor: "rgba(118, 75, 162, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PersonOutline sx={{ color: "#764ba2", fontSize: { xs: 22, sm: 24 } }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: "#718096",
                          fontSize: { xs: "0.7rem", sm: "0.72rem" },
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
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                        }}
                      >
                        {passData.personToMeet}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(72, 187, 120, 0.08), rgba(104, 211, 145, 0.05))",
                    borderRadius: 2.5,
                    padding: { xs: "14px 12px", sm: "16px 14px" },
                    border: "1.5px solid rgba(72, 187, 120, 0.25)",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(72, 187, 120, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <EventAvailableOutlined sx={{ color: "#48bb78", fontSize: { xs: 22, sm: 24 }, mb: 0.8 }} />
                  <Typography
                    sx={{
                      color: "#718096",
                      fontSize: { xs: "0.65rem", sm: "0.68rem" },
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
                      fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    }}
                  >
                    {passData.validFrom}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(245, 101, 101, 0.08), rgba(252, 129, 129, 0.05))",
                    borderRadius: 2.5,
                    padding: { xs: "14px 12px", sm: "16px 14px" },
                    border: "1.5px solid rgba(245, 101, 101, 0.25)",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(245, 101, 101, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <EventBusyOutlined sx={{ color: "#f56565", fontSize: { xs: 22, sm: 24 }, mb: 0.8 }} />
                  <Typography
                    sx={{
                      color: "#718096",
                      fontSize: { xs: "0.65rem", sm: "0.68rem" },
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
                      fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    }}
                  >
                    {passData.validTill}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Premium Footer */}
          <Box
            sx={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.06))",
              borderTop: "1.5px solid rgba(102, 126, 234, 0.15)",
              padding: { xs: "14px 20px", sm: "16px 24px" },
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "0.75rem", sm: "0.8rem" },
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              Provided by Midland Microfin Limited
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3.5,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          sx={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            fontWeight: 800,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
            boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #764ba2, #667eea)",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.5)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Download Pass
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{
            borderColor: "rgba(255, 255, 255, 0.6)",
            color: "white",
            fontWeight: 800,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            borderWidth: 2,
            textTransform: "none",
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.15)",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.9)",
              background: "rgba(255, 255, 255, 0.25)",
              borderWidth: 2,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Print Pass
        </Button>
      </Box>
    </Box>
  )
}
