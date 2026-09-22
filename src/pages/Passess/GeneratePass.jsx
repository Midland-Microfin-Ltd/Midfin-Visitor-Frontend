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
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  QrCode2 as QrCode2Icon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../../components/MiniDrawer";
import { PageHeader, SearchField, EmptyState, BRAND_GRADIENT } from "../../components/ui";
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

  const gradientButtonSx = {
    background: BRAND_GRADIENT,
    color: "#fff",
    boxShadow: "0 6px 16px -6px rgba(99,102,241,0.65)",
    "&:hover": { background: BRAND_GRADIENT, filter: "brightness(1.08)", boxShadow: "0 8px 20px -6px rgba(99,102,241,0.75)" },
  };

  return (
    <MiniDrawer>
      <PageHeader
        icon={<QrCode2Icon />}
        title="Generate Visitor QR Code"
        subtitle="Generate QR codes for approved visitors to check their status"
      />

      <Box sx={{ mb: 2.5 }}>
        <SearchField
          placeholder="Search visitors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              minHeight: 400,
            }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Loading approved visitors…
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: { xs: 560, md: "calc(100vh - 290px)" }, minHeight: 240 }}>
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
                      <TableCell colSpan={4}>
                        <EmptyState
                          icon={<QrCodeIcon />}
                          title={
                            searchQuery
                              ? "No approved visitors match your search"
                              : "No approved visitors found"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <TableRow key={visitor.visitorId} hover>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                color: "#fff",
                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                              }}
                            >
                              {getInitials(visitor.visitorName)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                {visitor.visitorName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                ID:{" "}
                                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                  {visitor.visitorId}
                                </Box>
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Typography
                            variant="body2"
                            sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 500 }}
                          >
                            <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            {visitor.phoneNo || "N/A"}
                          </Typography>
                          {visitor.visitorType && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={visitor.visitorType}
                              sx={{ mt: 1, textTransform: "capitalize" }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Meeting: {visitor.personToMeet}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Department: {visitor.departmentToVisit}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Purpose: {visitor.purposeOfVisit}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            startIcon={<QrCodeIcon />}
                            onClick={() => handleGenerateQRCode(visitor)}
                            sx={gradientButtonSx}
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
          </>
        )}
      </Paper>

      {/* Dialog with QR Code */}
      <Dialog
        open={qrDialog}
        onClose={closeQRDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent
          sx={{
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {selectedVisitor && (
            <>
              <Box sx={{ textAlign: "center", mb: 2.5 }}>
                <Chip
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                  label="Approved visitor"
                  sx={{ mb: 1.5 }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.3 }}>
                  {selectedVisitor.visitorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {selectedVisitor.visitorId}
                </Typography>
              </Box>

              {/* QR Code */}
              <Box
                sx={{
                  p: "3px",
                  mb: 1.5,
                  borderRadius: 4,
                  background: BRAND_GRADIENT,
                  boxShadow: "0 16px 40px -16px rgba(99,102,241,0.6)",
                }}
              >
                <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: "13px", display: "flex" }}>
                  <QRCodeSVG
                    value={`${getBaseUrl()}#/statuspass?id=${selectedVisitor.visitorId}`}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3 }}>
                Scan to check the visitor's pass status
              </Typography>

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
              <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                <Button
                  onClick={closeQRDialog}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  sx={{ py: 1, borderColor: "divider" }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQRCode}
                  sx={{ py: 1, ...gradientButtonSx }}
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
          sx={{ width: "100%", boxShadow: 8 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MiniDrawer>
  );
};

export default GeneratePass;
