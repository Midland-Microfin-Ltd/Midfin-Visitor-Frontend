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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Phone as PhoneIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  EditCalendar as EditCalendarIcon,
  PeopleAlt as PeopleAltIcon,
  Verified as VerifiedIcon,
  HelpOutline as UnverifiedIcon,
  PersonSearch as PersonSearchIcon,
  CheckCircleOutline as ApproveIcon,
  HighlightOff as RejectIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MiniDrawer from "../../components/MiniDrawer";
import { PageHeader, SearchField, segmentedTabsSx, EmptyState } from "../../components/ui";
import { getVisitorRequests, takeVisitorAction, getBuildings, updateVisitDuration } from "../../utilities/apiUtils/apiHelper";

const Visitors = () => {
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

  const formatDateTime = (value) => value && `${formatDate(value)} • ${formatTime(value)}`;
  // Recorded by the guard at the gate; "Not yet" only makes sense once the pass is approved.
  const gateTime = (visitor, value) =>
    formatDateTime(value) || (visitor.status === "APPROVED" ? "Not yet" : null);

  const getDetailRows = (visitor) =>
    [
      ["Address", visitor.place],
      ["Interview Type", visitor.interviewType],
      ["Employee Code", visitor.employeeCode],
      ["Other Purpose", visitor.otherVisitPurpose],
      ["Company", visitor.companyName],
      ["Meeting With", visitor.meetingWithWhom],
      ["Person", visitor.personToMeet],
      ["Department", visitor.departmentOfVisit || visitor.departmentToVisit],
      ["Visit Days", visitor.visitDays],
      ["Duration", `${visitor.visitDuration || 0} day(s)`],
      ["Expected Out", formatDateTime(visitor.expectedOutTime)],
      ["Checked Out", gateTime(visitor, visitor.actualOutTime)],
      ["Office", visitor.officeToVisit?.name],
      ["Visit Type", visitor.visitType],
      ["Created", `${formatDate(visitor.createdAt)} • ${formatTime(visitor.createdAt)}`],
    ].filter(([, value]) => value);

  const emptyMessage =
    selectedTab === 1 ? "No approved visitors found" :
    selectedTab === 2 ? "No pending visitors found" :
    searchQuery ? "No visitors match your search" : "No visitors found";

  const isApprove = actionDialog.actionType === "APPROVE";

  const dialogIconSx = (paletteKey) => ({
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 2.5,
    display: "grid",
    placeItems: "center",
    color: `${paletteKey}.main`,
    bgcolor: (theme) => alpha(theme.palette[paletteKey].main, 0.12),
  });

  return (
    <MiniDrawer>
      <PageHeader
        icon={<PeopleAltIcon />}
        title="Visitor Management"
        subtitle={`Total Visitors: ${totalRecords}`}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => {
            setSelectedTab(newValue);
            setSearchQuery(""); // Clear search when changing tabs
          }}
          variant="scrollable"
          scrollButtons={false}
          sx={segmentedTabsSx}
        >
          <Tab label="All Visitors" />
          <Tab label="Approved" />
          <Tab label="Pending" />
        </Tabs>

        <SearchField
          placeholder="Search name, ID, phone, purpose, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: "100%", sm: 380 } }}
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
              Loading visitors…
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: { xs: 560, md: "calc(100vh - 300px)" }, minHeight: 240 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Visitor</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell sx={{ minWidth: 340, width: "44%" }}>Visit Details</TableCell>
                    <TableCell sx={{ width: 110 }}>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVisitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={<PersonSearchIcon />}
                          title={emptyMessage}
                          description={searchQuery ? "Try a different name, ID or phone number." : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <TableRow key={visitor.visitorId} hover sx={{ "& > td": { verticalAlign: "top", py: 2 } }}>
                        {/* Visitor */}
                        <TableCell sx={{ minWidth: 230 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={visitor.visitorSelfie || undefined}
                              alt={visitor.visitorName}
                              slotProps={{ img: { crossOrigin: "anonymous" } }}
                              sx={{
                                width: 44,
                                height: 44,
                                color: "#fff",
                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 3px ${theme.palette.divider}`,
                              }}
                            >
                              {getInitials(visitor.visitorName)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.3 }}>
                                {visitor.visitorName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                ID:{" "}
                                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                  {visitor.visitorId}
                                </Box>
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Gov ID: {visitor.governmentId || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Contact */}
                        <TableCell sx={{ minWidth: 170 }}>
                          <Typography
                            variant="body2"
                            sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 500 }}
                          >
                            <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            {visitor.phoneNo || "N/A"}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
                            {visitor.visitorType && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={visitor.visitorType}
                                sx={{ textTransform: "capitalize" }}
                              />
                            )}
                            <Chip
                              size="small"
                              color={visitor.isVerified ? "success" : "default"}
                              icon={visitor.isVerified ? <VerifiedIcon /> : <UnverifiedIcon />}
                              label={visitor.isVerified ? "Verified" : "Not verified"}
                            />
                          </Box>
                        </TableCell>

                        {/* Visit Details */}
                        <TableCell>
                          {visitor.purposeOfVisit && (
                            <Chip
                              size="small"
                              color="primary"
                              label={visitor.purposeOfVisit}
                              sx={{ mb: 1.25 }}
                            />
                          )}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                              columnGap: 2,
                              rowGap: 1,
                            }}
                          >
                            {getDetailRows(visitor).map(([label, value]) => (
                              <Box key={label} sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                    color: "text.secondary",
                                  }}
                                >
                                  {label}
                                </Typography>
                                <Typography sx={{ fontSize: "0.8rem", wordBreak: "break-word" }}>
                                  {value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip
                            label={formatStatusText(visitor.status)}
                            color={getStatusColor(visitor.status)}
                            size="small"
                            icon={
                              <Box
                                component="span"
                                sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor", ml: "8px !important" }}
                              />
                            }
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>

                        {/* Actions */}
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
                                  >
                                    Approve
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CloseIcon />}
                                    onClick={() => openActionDialog(
                                      visitor.visitorId,
                                      visitor.visitorName,
                                      "REJECT"
                                    )}
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
                                  color="inherit"
                                  startIcon={<EditCalendarIcon />}
                                  onClick={() => openUpdateDurationDialog(
                                    visitor.visitorId,
                                    visitor.visitorName,
                                    visitor.visitDuration || 0
                                  )}
                                  sx={{
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    "&:hover": {
                                      borderColor: "primary.main",
                                      color: "primary.main",
                                      bgcolor: "background.paper",
                                    },
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
          </>
        )}
      </Paper>

      {/* Update Duration Dialog */}
      <Dialog
        open={updateDurationDialog.open}
        onClose={closeUpdateDurationDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={dialogIconSx("primary")}>
            <EditCalendarIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "1.05rem" }}>Update Visit Duration</Typography>
            <Typography variant="body2" color="text.secondary">
              Change how many days this visit is valid
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              mb: 2.5,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              borderRadius: 2.5,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Visitor Name
              </Typography>
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {updateDurationDialog.visitorName}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Current Duration
              </Typography>
              <Chip
                label={`${updateDurationDialog.currentDuration} day(s)`}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="New Visit Duration (days)"
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
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeUpdateDurationDialog}
            variant="outlined"
            color="inherit"
            sx={{ borderColor: "divider" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDuration}
            variant="contained"
            disabled={!updateDurationDialog.newDuration || parseInt(updateDurationDialog.newDuration) <= 0}
          >
            Update Duration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog for Approve/Reject */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={dialogIconSx(isApprove ? "success" : "error")}>
            {isApprove ? <ApproveIcon /> : <RejectIcon />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
              {isApprove ? "Approve Visitor" : "Reject Visitor"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isApprove ? "Approving" : "Rejecting"} visitor:{" "}
              <Box component="strong" sx={{ color: "text.primary" }}>{actionDialog.visitorName}</Box>
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment"
            value={actionDialog.comment}
            onChange={(e) => setActionDialog(prev => ({
              ...prev,
              comment: e.target.value
            }))}
            placeholder="Enter comment for this action..."
            sx={{ mt: 1.5 }}
            required
          />

          {isApprove && (
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
          <Button onClick={closeActionDialog} variant="outlined" color="inherit" sx={{ borderColor: "divider" }}>
            Cancel
          </Button>
          <Button
            onClick={handleTakeAction}
            variant="contained"
            color={isApprove ? "success" : "error"}
            disabled={!actionDialog.comment.trim() || (isApprove && loadingGuestHouses)}
          >
            {isApprove ? "Approve" : "Reject"}
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
          sx={{ width: "100%", boxShadow: 8 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MiniDrawer>
  );
};

export default Visitors;
