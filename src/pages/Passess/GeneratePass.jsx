import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
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
  DialogTitle,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../../components/MiniDrawer";
import { useThemeContext } from "../../context/ThemeContext";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  getVisitorRequests,
} from "../../utilities/apiUtils/apiHelper";
import {
  getInitials,
} from "../../utilities/PassDownloadUtils";

// Helper function to get base URL for QR code
const getBaseUrl = () => {
  const hostEnvironment = import.meta.env.VITE_ENVIRONMENT;
  
  // If running on localhost, use localhost URL
  if (hostEnvironment === "development" && window.location.hostname === "localhost") {
    return `${window.location.origin}${window.location.pathname}`;
  } else {
    // Use production dashboard domain
    return "https://midfinvisitordashboarduat.midlandmicrofin.co.in/";
  }
};

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
  const [visitors, setVisitors] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [qrDialog, setQrDialog] = useState(false);

  // Create a ref for the QR code for downloading
  const qrCodeRef = useRef(null);

  const fetchApprovedVisitors = async (
    currentPage = 0,
    currentRowsPerPage = 10,
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
          (visitor) => visitor.status === "APPROVED",
        );
        setVisitors(approvedVisitors);
        setTotalRecords(response.data.totalRecords);
      } else {
        showSnackbar(
          response.message || "Failed to fetch approved visitors",
          "error",
        );
      }
    } catch (error) {
      console.error("Error fetching approved visitors:", error);
      showSnackbar("Error fetching approved visitors data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = (visitor) => {
    setSelectedVisitor(visitor);
    setQrDialog(true);
    showSnackbar("QR Code generated successfully!", "success");
  };

  const handleDownloadQRCode = () => {
    if (!selectedVisitor) return;
    
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `visitor-qr-${selectedVisitor.visitorId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar("QR Code downloaded successfully!", "success");
    }
  };

  const closeQRDialog = () => {
    setQrDialog(false);
    setSelectedVisitor(null);
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
              Generate Visitor QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate QR codes for approved visitors to check their status
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
                  <TableCell align="center">Generate QR Code</TableCell>
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
                          onClick={() => handleGenerateQRCode(visitor)}
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                            },
                          }}
                        >
                          Generate QR
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

      {/* Dialog with QR Code */}
      <Dialog
        open={qrDialog}
        onClose={closeQRDialog}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
          }}
        >
          {selectedVisitor && (
            <>
              {/* QR Code */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                  p: 3,
                  background: "white",
                  borderRadius: 2,
                  border: "2px solid #f0f0f0",
                }}
              >
                <QRCodeSVG
                  value={`${getBaseUrl()}#/statuspass?id=${selectedVisitor.visitorId}`}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              </Box>
              
              {/* Hidden canvas for download */}
              <Box ref={qrCodeRef} sx={{ display: "none" }}>
                <QRCodeCanvas
                  value={`${getBaseUrl()}#/statuspass?id=${selectedVisitor.visitorId}`}
                  size={400}
                  level="H"
                  includeMargin={true}
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                <Button
                  onClick={closeQRDialog}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
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
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQRCode}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
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
                  Download
                </Button>
              </Stack>
            </>
          )}
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
