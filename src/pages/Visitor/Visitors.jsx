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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  EditCalendar as EditCalendarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../../components/MiniDrawer";
import { useThemeContext } from "../../context/ThemeContext";
import { getVisitorRequests, takeVisitorAction, getBuildings, updateVisitDuration } from "../../utilities/apiUtils/apiHelper";
import { transformImageUrl } from "../../utilities/commonutilities";

const Visitors = () => {
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // State for action dialog
  const [actionDialog, setActionDialog] = useState({
    open: false,
    visitorId: null,
    visitorName: "",
    actionType: "", 
    comment: "",
    guestHouseId: "",
  });
  
  // State for update duration dialog
  const [updateDurationDialog, setUpdateDurationDialog] = useState({
    open: false,
    visitorId: null,
    visitorName: "",
    currentDuration: 0,
    newDuration: "",
  });
  
  const [guestHouses, setGuestHouses] = useState([]);
  const [loadingGuestHouses, setLoadingGuestHouses] = useState(false);

  const fetchVisitors = async (currentPage = 0, currentRowsPerPage = 10) => {
    setLoading(true);
    try {
      const pageNumber = currentPage + 1;
      const pageSize = currentRowsPerPage;
      
      const response = await getVisitorRequests({ 
        page: pageNumber, 
        pageSize: pageSize 
      });
      
      if (response.success) {
        setVisitors(response.data.visitorRequests);
        setTotalRecords(response.data.totalRecords);
      } else {
        showSnackbar(response.message || "Failed to fetch visitors", "error");
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
      showSnackbar("Error fetching visitors data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch guest houses from API
  const fetchGuestHouses = async () => {
    setLoadingGuestHouses(true);
    try {
      const response = await getBuildings();
      if (response.success) {
        const apiGuestHouses = response.data.guestHouses.map((house) => ({
          id: house.id,
          name: house.name,
          address: house.address,
          status: house.status || "available",
        }));
        setGuestHouses(apiGuestHouses);
      } else {
        showSnackbar("Failed to fetch guest houses", "error");
      }
    } catch (error) {
      console.error("Error fetching guest houses:", error);
      showSnackbar("Error fetching guest houses data", "error");
    } finally {
      setLoadingGuestHouses(false);
    }
  };

  const openActionDialog = async (visitorId, visitorName, actionType) => {
    if (actionType === "APPROVE") {
      await fetchGuestHouses();
    }
    
    setActionDialog({
      open: true,
      visitorId,
      visitorName,
      actionType,
      comment: "",
      guestHouseId: "",
    });
  };

  // Close action dialog
  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      visitorId: null,
      visitorName: "",
      actionType: "",
      comment: "",
      guestHouseId: "",
    });
  };

  // Open update duration dialog
  const openUpdateDurationDialog = (visitorId, visitorName, currentDuration) => {
    setUpdateDurationDialog({
      open: true,
      visitorId,
      visitorName,
      currentDuration,
      newDuration: currentDuration.toString(),
    });
  };

  // Close update duration dialog
  const closeUpdateDurationDialog = () => {
    setUpdateDurationDialog({
      open: false,
      visitorId: null,
      visitorName: "",
      currentDuration: 0,
      newDuration: "",
    });
  };

  // Handle update visit duration
  const handleUpdateDuration = async () => {
    const { visitorId, newDuration } = updateDurationDialog;
    
    if (!newDuration || newDuration.trim() === "") {
      showSnackbar("Please enter visit duration", "error");
      return;
    }

    const durationNumber = parseInt(newDuration);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      showSnackbar("Please enter a valid duration (greater than 0)", "error");
      return;
    }

    try {
      const response = await updateVisitDuration(visitorId, durationNumber);
      
      if (response.success) {
        showSnackbar("Visit duration updated successfully", "success");
        closeUpdateDurationDialog();
        fetchVisitors(page, rowsPerPage);
      } else {
        showSnackbar(response.message || "Failed to update visit duration", "error");
      }
    } catch (error) {
      console.error("Error updating visit duration:", error);
      showSnackbar("Error updating visit duration", "error");
    }
  };

  // Handle approve/reject action
  const handleTakeAction = async () => {
    const { visitorId, actionType, comment, guestHouseId } = actionDialog;
    
    if (!comment.trim()) {
      showSnackbar("Please enter a comment", "error");
      return;
    }

    const actionData = {
      visitorId,
      status: actionType === "APPROVE" ? "APPROVED" : "REJECTED",
      comment: comment.trim(),
    };

    // Add guestHouseId only if provided and action is approve
    if (actionType === "APPROVE" && guestHouseId) {
      actionData.guestHouseId = parseInt(guestHouseId);
    }

    try {
      const response = await takeVisitorAction(actionData);
      if (response.success) {
        showSnackbar(
          `Visitor request ${actionType === "APPROVE" ? "approved" : "rejected"} successfully`,
          "success"
        );
        closeActionDialog();
        // Refresh the data
        fetchVisitors(page, rowsPerPage);
      } else {
        showSnackbar(response.message || `Failed to ${actionType.toLowerCase()} visitor`, "error");
      }
    } catch (error) {
      console.error(`Error ${actionType.toLowerCase()}ing visitor:`, error);
      showSnackbar(`Error ${actionType.toLowerCase()}ing visitor request`, "error");
    }
  };

  // Fetch data when page or rowsPerPage changes
  useEffect(() => {
    fetchVisitors(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Reset to first page when tab changes
  useEffect(() => {
    if (selectedTab !== 0) {
      setPage(0);
    }
  }, [selectedTab]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); 
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "CHECKED_IN":
      case "CHECKED-IN":
        return "info";
      case "CHECKED_OUT":
      case "CHECKED-OUT":
        return "default";
      default:
        return "default";
    }
  };

  const formatStatusText = (status) => {
    if (!status) return "Unknown";
    return status.toLowerCase().replace(/_/g, ' ');
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return "?";
    const names = name.trim().split(" ");
    let initials = "";
    for (let i = 0; i < Math.min(2, names.length); i++) {
      if (names[i].length > 0) {
        initials += names[i][0].toUpperCase();
      }
    }
    return initials || "?";
  };

  // Filter visitors based on selected tab and search query
  const filteredVisitors = visitors.filter((visitor) => {
    if (selectedTab === 1) {
      return visitor.status === "APPROVED";
    } else if (selectedTab === 2) {
      return visitor.status === "PENDING";
    }

    // Apply search filter
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const visitorName = visitor.visitorName || '';
    const visitorId = visitor.visitorId || '';
    const phoneNo = visitor.phoneNo || '';
    const governmentId = visitor.governmentId || '';
    const purposeOfVisit = visitor.purposeOfVisit || '';
    const personToMeet = visitor.personToMeet || '';
    const departmentToVisit = visitor.departmentToVisit || '';
    const departmentOfVisit = visitor.departmentOfVisit || '';
    const place = visitor.place || '';
    const employeeCode = visitor.employeeCode || '';
    const companyName = visitor.companyName || '';
    const interviewType = visitor.interviewType || '';
    const otherVisitPurpose = visitor.otherVisitPurpose || '';
    const officeName = visitor.officeToVisit?.name || '';

    return (
      visitorName.toLowerCase().includes(searchLower) ||
      visitorId.toLowerCase().includes(searchLower) ||
      phoneNo.toLowerCase().includes(searchLower) ||
      governmentId.toLowerCase().includes(searchLower) ||
      purposeOfVisit.toLowerCase().includes(searchLower) ||
      personToMeet.toLowerCase().includes(searchLower) ||
      departmentToVisit.toLowerCase().includes(searchLower) ||
      departmentOfVisit.toLowerCase().includes(searchLower) ||
      place.toLowerCase().includes(searchLower) ||
      employeeCode.toLowerCase().includes(searchLower) ||
      companyName.toLowerCase().includes(searchLower) ||
      interviewType.toLowerCase().includes(searchLower) ||
      otherVisitPurpose.toLowerCase().includes(searchLower) ||
      officeName.toLowerCase().includes(searchLower)
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
              Visitor Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Visitors: {totalRecords}
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => {
            setSelectedTab(newValue);
            setSearchQuery(""); // Clear search when changing tabs
          }}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        >
          <Tab label="All Visitors" />
          <Tab label="Approved" />
          <Tab label="Pending" />
        </Tabs>

        <TextField
          fullWidth
          placeholder="Search visitors by name, ID, phone, purpose, department..."
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
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
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {selectedTab === 1 ? "No approved visitors found" : 
                         selectedTab === 2 ? "No pending visitors found" : 
                         searchQuery ? "No visitors match your search" : "No visitors found"}
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
                            src={visitor.visitorSelfie ? transformImageUrl(visitor.visitorSelfie) : undefined}
                            alt={visitor.visitorName}
                            imgProps={{
                              crossOrigin: "anonymous"
                            }}
                            sx={{
                              bgcolor: mode === "dark" ? "#4299E1" : "#3182CE",
                            }}
                          >
                            {getInitials(visitor.visitorName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {visitor.visitorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              ID: {visitor.visitorId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Gov ID: {visitor.governmentId || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
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
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5 }}
                          >
                            Type: {visitor.visitorType}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5 }}
                          >
                            Verified: {visitor.isVerified ? "Yes" : "No"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {/* Purpose */}
                          {visitor.purposeOfVisit && (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Purpose: {visitor.purposeOfVisit}
                            </Typography>
                          )}
                          
                          {/* Address/Place */}
                          {visitor.place && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Address: {visitor.place}
                            </Typography>
                          )}
                          
                          {/* Interview Type */}
                          {visitor.interviewType && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Interview Type: {visitor.interviewType}
                            </Typography>
                          )}
                          
                          {/* Employee Code */}
                          {visitor.employeeCode && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Employee Code: {visitor.employeeCode}
                            </Typography>
                          )}
                          
                          {/* Other Visit Purpose */}
                          {visitor.otherVisitPurpose && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Other Purpose: {visitor.otherVisitPurpose}
                            </Typography>
                          )}
                          
                          {/* Company Name */}
                          {visitor.companyName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Company: {visitor.companyName}
                            </Typography>
                          )}
                          
                          {/* Meeting With Whom */}
                          {visitor.meetingWithWhom && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Meeting With: {visitor.meetingWithWhom}
                            </Typography>
                          )}
                          
                          {/* Person to Meet */}
                          {visitor.personToMeet && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Person: {visitor.personToMeet}
                            </Typography>
                          )}
                          
                          {/* Department - Show departmentOfVisit OR departmentToVisit */}
                          {(visitor.departmentOfVisit || visitor.departmentToVisit) && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Department: {visitor.departmentOfVisit || visitor.departmentToVisit}
                            </Typography>
                          )}
                          
                          {/* Visit Days */}
                          {visitor.visitDays && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Visit Days: {visitor.visitDays}
                            </Typography>
                          )}
                          
                          {/* Visit Duration */}
                          <Typography variant="caption" color="text.secondary" display="block">
                            Duration: {visitor.visitDuration || 0} day(s)
                          </Typography>
                          
                          {/* Office to Visit */}
                          {visitor.officeToVisit?.name && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Office: {visitor.officeToVisit.name}
                            </Typography>
                          )}
                          
                          {/* Visit Type */}
                          {visitor.visitType && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Visit Type: {visitor.visitType}
                            </Typography>
                          )}
                          
                          {/* Created Date */}
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created: {formatDate(visitor.createdAt)} • {formatTime(visitor.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatusText(visitor.status)}
                          color={getStatusColor(visitor.status)}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {visitor.status === "PENDING" && (
                            <>
                              <Tooltip title="Approve">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckIcon />}
                                  onClick={() => openActionDialog(
                                    visitor.visitorId,
                                    visitor.visitorName,
                                    "APPROVE"
                                  )}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Approve
                                </Button>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  startIcon={<CloseIcon />}
                                  onClick={() => openActionDialog(
                                    visitor.visitorId,
                                    visitor.visitorName,
                                    "REJECT"
                                  )}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Reject
                                </Button>
                              </Tooltip>
                            </>
                          )}
                          {(visitor.status === "APPROVED" || visitor.status === "PENDING") && (
                            <Tooltip title="Update Visit Duration">
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<EditCalendarIcon />}
                                onClick={() => openUpdateDurationDialog(
                                  visitor.visitorId,
                                  visitor.visitorName,
                                  visitor.visitDuration || 0
                                )}
                                sx={{ 
                                  minWidth: 'auto',
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  borderColor: mode === "dark" ? "#4299E1" : "#3182CE",
                                  color: mode === "dark" ? "#4299E1" : "#3182CE",
                                  '&:hover': {
                                    borderColor: mode === "dark" ? "#2b6cb0" : "#2c5282",
                                    backgroundColor: mode === "dark" ? "rgba(66, 153, 225, 0.1)" : "rgba(49, 130, 206, 0.1)",
                                  }
                                }}
                              >
                                Duration
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
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

      {/* Update Duration Dialog */}
      <Dialog 
        open={updateDurationDialog.open} 
        onClose={closeUpdateDurationDialog} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EditCalendarIcon />
          Update Visit Duration
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Visitor Name
            </Typography>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
              {updateDurationDialog.visitorName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Current Duration
            </Typography>
            <Chip 
              label={`${updateDurationDialog.currentDuration} day(s)`}
              size="small"
              sx={{ 
                mb: 3,
                fontWeight: 600,
                bgcolor: mode === "dark" ? "rgba(66, 153, 225, 0.2)" : "rgba(49, 130, 206, 0.1)",
                color: mode === "dark" ? "#4299E1" : "#3182CE",
              }}
            />
          </Box>

          <TextField
            fullWidth
            type="number"
            label="New Visit Duration (days) *"
            value={updateDurationDialog.newDuration}
            onChange={(e) => setUpdateDurationDialog(prev => ({ 
              ...prev, 
              newDuration: e.target.value 
            }))}
            placeholder="Enter number of days"
            InputProps={{
              inputProps: { min: 1, max: 365 }
            }}
            helperText="Enter the new visit duration in days (1-365)"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={closeUpdateDurationDialog} 
            color="inherit"
            sx={{ 
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDuration}
            variant="contained"
            disabled={!updateDurationDialog.newDuration || parseInt(updateDurationDialog.newDuration) <= 0}
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              '&:hover': {
                background: "linear-gradient(135deg, #5568d3 0%, #6b46c1 100%)",
              },
              '&:disabled': {
                background: "rgba(0, 0, 0, 0.12)",
              }
            }}
          >
            Update Duration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog for Approve/Reject */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.actionType === "APPROVE" ? "Approve Visitor" : "Reject Visitor"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionDialog.actionType === "APPROVE" ? "Approving" : "Rejecting"} visitor:{" "}
            <strong>{actionDialog.visitorName}</strong>
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment *"
            value={actionDialog.comment}
            onChange={(e) => setActionDialog(prev => ({ 
              ...prev, 
              comment: e.target.value 
            }))}
            placeholder="Enter comment for this action..."
            sx={{ mt: 2 }}
            required
          />

          {actionDialog.actionType === "APPROVE" && (
            <TextField
              fullWidth
              select
              label="Guest House (Optional)"
              value={actionDialog.guestHouseId}
              onChange={(e) => setActionDialog(prev => ({ 
                ...prev, 
                guestHouseId: e.target.value 
              }))}
              sx={{ mt: 2 }}
              disabled={loadingGuestHouses}
            >
              <MenuItem value="">
                <em>Select Guest House (Optional)</em>
              </MenuItem>
              {loadingGuestHouses ? (
                <MenuItem disabled>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading guest houses...</Typography>
                  </Box>
                </MenuItem>
              ) : guestHouses.length === 0 ? (
                <MenuItem disabled>No guest houses available</MenuItem>
              ) : (
                guestHouses.map((guestHouse) => (
                  <MenuItem key={guestHouse.id} value={guestHouse.id}>
                    <Box>
                      <Typography variant="body2">{guestHouse.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guestHouse.address}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleTakeAction}
            variant="contained"
            color={actionDialog.actionType === "APPROVE" ? "success" : "error"}
            disabled={!actionDialog.comment.trim() || (actionDialog.actionType === "APPROVE" && loadingGuestHouses)}
          >
            {actionDialog.actionType === "APPROVE" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
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

export default Visitors;