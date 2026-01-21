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
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../../components/MiniDrawer";
import { useThemeContext } from "../../context/ThemeContext";
import VisitorPass from "./VisitorPassmaker";
import {
  getVisitorRequests,
  generateVisitorPass,
} from "../../utilities/apiUtils/apiHelper";
import {
  downloadPassAsImage,
  formatPassData,
  getInitials,
} from "../../utilities/PassDownloadUtils";

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

  // Create a ref for the pass component for downloading
  const passRef = useRef(null);

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

  const handleGeneratePass = async (visitor) => {
    setGeneratingPass(true);
    try {
      const response = await generateVisitorPass({
        visitorId: visitor.visitorId,
      });

      if (response.success) {
        setSelectedVisitor(visitor);

        // Use the utility function to format pass data
        const formattedPassData = formatPassData(
          {
            fullName: visitor.visitorName,
            phone: visitor.phoneNo,
            governmentId: visitor.governmentId,
            purpose: visitor.purposeOfVisit,
            personToMeet: visitor.personToMeet,
            visitDuration: "1", // Default 1 day for admin-generated passes
          },
          response.data,
          { label: visitor.purposeOfVisit },
        );

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

  const handleDownloadPass = async () => {
    await downloadPassAsImage(passRef, passData, showSnackbar);
  };


  const closePassDialog = () => {
    setPassDialog(false);
    setSelectedVisitor(null);
    setPassData(null);
    setIsVisible(false);
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

      {/* Dialog with VisitorPass Component */}
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
          {/* Use the VisitorPass component */}
          <VisitorPass
            passData={passData}
            visible={isVisible}
            downloadRef={passRef}
          />

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
              onClick={handleDownloadPass}
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
