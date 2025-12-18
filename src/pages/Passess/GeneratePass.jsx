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
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  Fingerprint as FingerprintIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
        setPassData(response.data);
        setPassDialog(true);
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
  };

  const downloadPassAsImage = async () => {
    try {
      // Create a temporary div to render the card with all styles
      const cardElement = document.getElementById("visitor-pass-card");

      if (!cardElement) {
        showSnackbar("Pass card not found!", "error");
        return;
      }

      // Clone the card element to avoid affecting the original
      const clonedCard = cardElement.cloneNode(true);

      // Apply styles for better capture
      clonedCard.style.position = "fixed";
      clonedCard.style.top = "0";
      clonedCard.style.left = "0";
      clonedCard.style.zIndex = "9999";
      clonedCard.style.width = "380px";
      clonedCard.style.transform = "scale(1)";
      clonedCard.style.boxShadow = "0 15px 35px rgba(12, 36, 97, 0.2)";
      clonedCard.style.visibility = "visible";
      clonedCard.style.opacity = "1";

      // Append to body
      document.body.appendChild(clonedCard);

      // Create a canvas with higher resolution
      const canvas = await html2canvas(clonedCard, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: true,
        width: 380,
        height: clonedCard.offsetHeight,
        windowWidth: 380,
        windowHeight: clonedCard.offsetHeight,
        onclone: (documentClone, element) => {
          // Ensure all styles are preserved in the clone
          const clonedPassCard = documentClone
            .getElementById("visitor-pass-card")
            ?.cloneNode(true);
          if (clonedPassCard) {
            // Force print styles
            const style = documentClone.createElement("style");
            style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            * {
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              font-smooth: always !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            
            .MuiTypography-root {
              font-family: 'Roboto', 'Arial', sans-serif !important;
            }
            
            .MuiButton-root, .MuiChip-root {
              background-image: none !important;
            }
          `;
            documentClone.head.appendChild(style);
          }
        },
      });

      // Remove the cloned element
      document.body.removeChild(clonedCard);

      // Convert canvas to high-quality image
      const imageData = canvas.toDataURL("image/png", 1.0);

      // Create a temporary link to download the image
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `visitor-pass-${
        selectedVisitor?.visitorId || passData?.visitorId || "pass"
      }-${new Date().toISOString().split("T")[0]}.png`;

      // Trigger download
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
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

      <Dialog
        open={passDialog}
        onClose={closePassDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            maxWidth: 450,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "transparent",
          }}
        >
          {/* Enhanced Visitor Pass Card */}
          <Box
            id="visitor-pass-card"
            className="pass-card"
            sx={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 15px 35px rgba(12, 36, 97, 0.2)",
              bgcolor: "white",
              mb: 4,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background:
                  "linear-gradient(90deg, #0c2461 0%, #4a69bd 50%, #0c2461 100%)",
              },
            }}
          >
            {/* Card Header with Gradient */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #0c2461 0%, #1e3799 100%)",
                color: "white",
                p: 2.5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 100,
                  height: 100,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: "white",
                  fontSize: "1.2rem",
                  letterSpacing: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                MIDLAND MICROFIN LTD
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "0.85rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                VISITOR ACCESS CARD
              </Typography>
            </Box>

            {/* Card Content */}
            <Box sx={{ p: 3.5, position: "relative" }}>
              {/* Decorative Elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                  opacity: 0.7,
                }}
              />

              {/* Contact Info with Icon */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: 2,
                  borderLeft: "4px solid #0c2461",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: "bold",
                    color: "#0c2461",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PhoneIcon fontSize="small" />
                  Contact
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#2c3e50",
                    mb: 0.5,
                    fontWeight: "medium",
                    fontFamily: "monospace",
                    fontSize: "1.1rem",
                  }}
                >
                  {passData?.phoneNo}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7f8c8d",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <BadgeIcon fontSize="small" />
                  Govt. Id:{" "}
                  {passData?.governmentId?.substring(0, 6) || "475895"}
                </Typography>
              </Box>

              {/* Person to Meet */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background:
                    "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                  borderRadius: 2,
                  borderLeft: "4px solid #2e7d32",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: "bold",
                    color: "#2e7d32",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Person to Meet
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#1b5e20",
                    fontWeight: "medium",
                    fontSize: "1.1rem",
                  }}
                >
                  {passData?.personToMeet}
                </Typography>
              </Box>

              {/* Visitor Info with Avatar */}
              <Box
                sx={{
                  mb: 2.5,
                  p: 2.5,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #e9ecef",
                  position: "relative",
                }}
              >
                {/* Avatar Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #0c2461 0%, #4a69bd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    boxShadow: "0 4px 10px rgba(12, 36, 97, 0.3)",
                    border: "3px solid white",
                  }}
                >
                  {getInitials(passData?.visitorName)}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: "#0c2461",
                    mb: 1,
                    mt: 3,
                    fontSize: "1.3rem",
                  }}
                >
                  {passData?.visitorName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                    mt: 2,
                  }}
                >
                  <Chip
                    label={`ID: ${passData?.visitorId}`}
                    size="small"
                    sx={{
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      fontWeight: "medium",
                      color: "#0c2461",
                    }}
                  />
                  <Chip
                    label="Visitor"
                    size="small"
                    sx={{
                      background:
                        "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                      fontWeight: "medium",
                      color: "#2e7d32",
                    }}
                  />
                </Box>
              </Box>

              {/* Valid Dates with Cards */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 4,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    p: 2,
                    background:
                      "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #ffcc80",
                  }}
                >
                  <CalendarTodayIcon
                    sx={{
                      color: "#f57c00",
                      mb: 1,
                      fontSize: "1.5rem",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#e65100",
                      display: "block",
                      mb: 0.5,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Valid From
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      color: "#333",
                      fontSize: "0.95rem",
                    }}
                  >
                    {passData?.validFrom}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    p: 2,
                    background:
                      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #a5d6a7",
                  }}
                >
                  <CalendarTodayIcon
                    sx={{
                      color: "#388e3c",
                      mb: 1,
                      fontSize: "1.5rem",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#2e7d32",
                      display: "block",
                      mb: 0.5,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    Valid Until
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      color: "#333",
                      fontSize: "0.95rem",
                    }}
                  >
                    {passData?.validUntil}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Card Footer */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                p: 2,
                textAlign: "center",
                borderTop: "2px solid #e0e0e0",
              }}
            >
            </Box>
          </Box>

          {/* Action Buttons - Only Close and Download */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              width: "100%",
              maxWidth: 380,
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
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Close
            </Button>
            <Button
              onClick={downloadPassAsImage}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                fontWeight: "medium",
                boxShadow: "0 4px 12px rgba(46, 204, 113, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #27ae60 0%, #219a52 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(46, 204, 113, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Download
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
