import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Card,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  PersonOutline,
  BadgeOutlined,
  BusinessOutlined,
  PhoneOutlined,
  EventAvailableOutlined,
  EventBusyOutlined,
  VerifiedUser,
  QrCode2,
  Security,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import MiniDrawer from "../../components/MiniDrawer";
import { useThemeContext } from "../../context/ThemeContext";
import {
  getVisitorRequests,
  generateVisitorPass,
} from "../../utilities/apiUtils/apiHelper";

const GeneratePass = () => {
  const { mode } = useThemeContext();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [generatingPass, setGeneratingPass] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [passDialog, setPassDialog] = useState(false);
  const [passData, setPassData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchApprovedVisitors = async (
    currentPage = 0,
    currentRowsPerPage = 10
  ) => {
    setLoading(true);
    try {
      const pageNumber = currentPage + 1;
      const pageSize = currentRowsPerPage;

      const response = await getVisitorRequests({
        page: pageNumber,
        pageSize: pageSize,
        status: "APPROVED",
      });

      if (response.success) {
        const approvedVisitors = response.data.visitorRequests.filter(
          (visitor) => visitor.status === "APPROVED"
        );
        setVisitors(approvedVisitors);
        setTotalRecords(response.data.totalRecords);
      } else {
        showSnackbar(
          response.message || "Failed to fetch approved visitors",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching approved visitors:", error);
      showSnackbar("Error fetching approved visitors data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePass = async (visitor) => {
    setGeneratingPass(true);
    try {
      const response = await generateVisitorPass({
        visitorId: visitor.visitorId,
      });

      if (response.success) {
        setSelectedVisitor(visitor);

        const formattedPassData = {
          ...response.data,
          fullName: response.data.visitorName || visitor.visitorName,
          govtId: response.data.governmentId || "AADHAR-XXXX-XXXX-XXXX",
          purposeOfVisit:
            response.data.purposeOfVisit || visitor.purposeOfVisit,
          personToMeet: response.data.personToMeet || visitor.personToMeet,
          contactNumber: response.data.phoneNo || visitor.phoneNo,
          validFrom:
            response.data.validFrom ||
            new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          validTill:
            response.data.validUntil ||
            new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
          passNumber: `VP-${Date.now().toString().slice(-6)}`,
        };

        setPassData(formattedPassData);
        setPassDialog(true);
        setIsVisible(true);
        showSnackbar("Visitor pass generated successfully!", "success");
      } else {
        showSnackbar(response.message || "Failed to generate pass", "error");
      }
    } catch (error) {
      console.error("Error generating pass:", error);
      showSnackbar("Error generating visitor pass", "error");
    } finally {
      setGeneratingPass(false);
    }
  };

  const closePassDialog = () => {
    setPassDialog(false);
    setSelectedVisitor(null);
    setPassData(null);
    setIsVisible(false);
  };

  const downloadPassAsImage = async () => {
    try {
      const cardElement = document.getElementById("premium-visitor-pass-card");
      if (!cardElement) {
        showSnackbar("Pass card not found!", "error");
        return;
      }

      const clonedCard = cardElement.cloneNode(true);
      clonedCard.style.position = "fixed";
      clonedCard.style.top = "0";
      clonedCard.style.left = "0";
      clonedCard.style.zIndex = "9999";
      clonedCard.style.transform = "scale(1)";
      clonedCard.style.boxShadow = "0 25px 70px rgba(102, 126, 234, 0.4)";
      clonedCard.style.visibility = "visible";
      clonedCard.style.opacity = "1";
      clonedCard.style.width = "460px";
      clonedCard.style.maxWidth = "460px";

      document.body.appendChild(clonedCard);

      const canvas = await html2canvas(clonedCard, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: true,
        width: 460,
        height: clonedCard.offsetHeight,
        windowWidth: 460,
        windowHeight: clonedCard.offsetHeight,
      });

      document.body.removeChild(clonedCard);

      const imageData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `visitor-pass-${passData?.passNumber || "pass"}-${
        new Date().toISOString().split("T")[0]
      }.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar("Pass image downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading image:", error);
      showSnackbar("Error downloading pass image", "error");
    }
  };

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

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  useEffect(() => {
    fetchApprovedVisitors(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const filteredVisitors = visitors.filter((visitor) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const visitorName = visitor.visitorName || "";
    const visitorId = visitor.visitorId || "";
    const phoneNo = visitor.phoneNo || "";
    const personToMeet = visitor.personToMeet || "";
    const departmentToVisit = visitor.departmentToVisit || "";

    return (
      visitorName.toLowerCase().includes(searchLower) ||
      visitorId.toLowerCase().includes(searchLower) ||
      phoneNo.toLowerCase().includes(searchLower) ||
      personToMeet.toLowerCase().includes(searchLower) ||
      departmentToVisit.toLowerCase().includes(searchLower)
    );
  });

  return (
    <MiniDrawer>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom color="text.primary">
              Generate Visitor Pass
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Search visitors..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Visitor</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Visit Details</TableCell>
                  <TableCell align="center">Generate Pass</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchQuery
                          ? "No approved visitors match your search"
                          : "No approved visitors found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.visitorId} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: mode === "dark" ? "#4f46e5" : "#4338ca",
                              fontWeight: "bold",
                            }}
                          >
                            {getInitials(visitor.visitorName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {visitor.visitorName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              ID: {visitor.visitorId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PhoneIcon fontSize="small" />
                          {visitor.phoneNo || "N/A"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Type: {visitor.visitorType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Meeting: {visitor.personToMeet}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Department: {visitor.departmentToVisit}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Purpose: {visitor.purposeOfVisit}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleGeneratePass(visitor)}
                          disabled={generatingPass}
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                            },
                          }}
                        >
                          {generatingPass ? "Generating..." : "Generate Pass"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Visitors per page:"
          />
        </Paper>
      )}

      {/* Dialog with Premium Pass Card - NO BACKGROUND */}
      <Dialog
        open={passDialog}
        onClose={closePassDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: "white",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            maxWidth: 500,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
          }}
        >
          {/* Card-Style Pass ONLY - No background container */}
          <Box
            id="premium-visitor-pass-card"
            sx={{
              maxWidth: 460,
              width: "100%",
              position: "relative",
              zIndex: 1,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              opacity: isVisible ? 1 : 0,
              transition: "all 0.5s ease",
            }}
          >
            <Card
              sx={{
                background:
                  "linear-gradient(to bottom, #ffffff 0%, #fafbff 100%)",
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

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 3,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              onClick={closePassDialog}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: "#bdc3c7",
                color: "#2c3e50",
                fontWeight: "medium",
                "&:hover": {
                  borderColor: "#95a5a6",
                  backgroundColor: "rgba(189, 195, 199, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadPassAsImage}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontWeight: "medium",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Download Pass
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MiniDrawer>
  );
};

export default GeneratePass;
