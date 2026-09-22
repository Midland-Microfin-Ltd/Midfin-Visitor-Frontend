import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Autocomplete,
  Avatar,
  Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ManageAccounts as ManageAccountsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import MiniDrawer from "../../components/MiniDrawer";
import { PageHeader, SearchField, segmentedTabsSx, StatCard, EmptyState, BRAND_GRADIENT } from "../../components/ui";
import {
  getBuildings,
  updateBuilding,
  generateGuardPin,
  getGuardPinStatus,
} from "../../utilities/apiUtils/apiHelper";

// The one fixed link shared with every guard; the guard picks the office on the PIN screen.
const GUARD_LINK = `${window.location.origin}/#/guard`;

const Management = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Guest Houses State (Now from API)
  const [guestHouses, setGuestHouses] = useState([]);

  // Offices State (Now from API)
  const [offices, setOffices] = useState([]);

  const [newGuestHouse, setNewGuestHouse] = useState({
    name: "",
    address: "",
    buildingType: "guestHouses", 
  });

  const [newOffice, setNewOffice] = useState({
    name: "",
    address: "",
    buildingType: "offices", 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Stats from API
  const [stats, setStats] = useState({
    officesCount: 0,
    guestHousesCount: 0,
  });

  const tabs = [
    {
      label: "Guest Houses",
      icon: <HomeIcon />,
      color: "#10b981",
      buildingType: "guestHouses",
    },
    {
      label: "Offices",
      icon: <LocationIcon />,
      color: "#3b82f6",
      buildingType: "offices",
    },
  ];

  // Fetch buildings data from API
  const fetchBuildingsData = async () => {
    setApiLoading(true);
    try {
      const response = await getBuildings();
      if (response.success) {
        // Set guest houses from API
        const apiGuestHouses = response.data.guestHouses.map((house) => ({
          id: house.id,
          name: house.name,
          location: house.address,
          address: house.address,
          rooms: house.rooms || "N/A",
          status: house.status || "available",
          buildingType: "guestHouses", // FIXED: Use plural form
          createdAt: house.createdAt,
          createdBy: house.user?.employeeName || "System",
        }));
        setGuestHouses(apiGuestHouses);

        // Set offices from API
        const apiOffices = response.data.offices.map((office) => ({
          id: office.id,
          name: office.name,
          location: office.address,
          address: office.address,
          status: office.status || "active",
          buildingType: "offices", 
          createdAt: office.createdAt,
          createdBy: office.user?.employeeName || "System",
        }));
        setOffices(apiOffices);

        // Set stats
        setStats({
          officesCount: response.data.officesCount,
          guestHousesCount: response.data.guestHousesCount,
        });
      } else {
        showSnackbar("Failed to fetch buildings data", "error");
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      showSnackbar("Error fetching buildings data", "error");
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts or when relevant tabs are selected
    if (selectedTab === 0 || selectedTab === 2) {
      fetchBuildingsData();
    }
  }, [selectedTab]);

  // Guard PIN per office: { office, pin?, loading?, error? }. The PIN lives only in this dialog's state.
  const [pinDialog, setPinDialog] = useState(null);
  const [pinActiveSince, setPinActiveSince] = useState({});

  useEffect(() => {
    getGuardPinStatus()
      .then((res) =>
        setPinActiveSince(Object.fromEntries(res.data.map((o) => [o.officeId, o.isActive ? o.createdAt : null])))
      )
      .catch(() => {});
  }, []);

  const handleGeneratePin = async () => {
    setPinDialog((d) => ({ ...d, loading: true, error: "" }));
    try {
      const res = await generateGuardPin(pinDialog.office.id);
      setPinDialog((d) => ({ ...d, loading: false, pin: res.data.pin }));
      setPinActiveSince((s) => ({ ...s, [res.data.officeId]: res.data.createdAt }));
    } catch (error) {
      setPinDialog((d) => ({ ...d, loading: false, error: error?.errorDescription || "Could not generate a PIN." }));
    }
  };

  const copyPin = () =>
    navigator.clipboard
      ?.writeText(pinDialog.pin)
      .then(() => showSnackbar("PIN copied", "success"))
      .catch(() => showSnackbar("Copy failed. Note the PIN down before closing.", "warning"));

  const copyGuardLink = () =>
    navigator.clipboard
      ?.writeText(GUARD_LINK)
      .then(() => showSnackbar("Guard link copied", "success"))
      .catch(() => showSnackbar("Copy failed", "warning"));

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSearchQuery("");
    setPage(0);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setEditMode(false);

    // Reset form based on type - FIXED: Use correct buildingType values
    switch (type) {
      case "guestHouse":
        setNewGuestHouse({
          name: "",
          address: "",
          buildingType: "guestHouses", // FIXED: Use plural form
        });
        break;
      case "office":
        setNewOffice({
          name: "",
          address: "",
          buildingType: "offices", // FIXED: Use plural form
        });
        break;
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setEditMode(false);
    setCurrentEditId(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      switch (dialogType) {
        case "guestHouse":
          if (!newGuestHouse.name.trim() || !newGuestHouse.address.trim()) {
            showSnackbar("Please fill all required fields", "error");
            setLoading(false);
            return;
          }

          try {
            const buildingData = {
              buildingType: newGuestHouse.buildingType, // Should be "guestHouses"
              name: newGuestHouse.name,
              address: newGuestHouse.address,
            };

            console.log("Sending guest house data:", buildingData); // For debugging

            const response = await updateBuilding(buildingData);

            if (response.success) {
              // Fetch updated data from API
              await fetchBuildingsData();
              showSnackbar("Guest house created successfully", "success");
              handleCloseDialog();
            } else {
              showSnackbar(
                response.message || "Failed to create guest house",
                "error"
              );
            }
          } catch (error) {
            console.error("Error creating guest house:", error);
            showSnackbar(
              error.response?.data?.message || "Error creating guest house",
              "error"
            );
          }
          break;

        case "office":
          if (!newOffice.name.trim() || !newOffice.address.trim()) {
            showSnackbar("Please fill all required fields", "error");
            setLoading(false);
            return;
          }

          try {
            const buildingData = {
              buildingType: newOffice.buildingType, // Should be "offices"
              name: newOffice.name,
              address: newOffice.address,
            };

            console.log("Sending office data:", buildingData); // For debugging

            const response = await updateBuilding(buildingData);

            if (response.success) {
              // Fetch updated data from API
              await fetchBuildingsData();
              showSnackbar("Office created successfully", "success");
              handleCloseDialog();
            } else {
              showSnackbar(
                response.message || "Failed to create office",
                "error"
              );
            }
          } catch (error) {
            console.error("Error creating office:", error);
            showSnackbar(
              error.response?.data?.message || "Error creating office",
              "error"
            );
          }
          break;
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      showSnackbar("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type, id) => {
    // Note: For now, we're only allowing creation via API
    // If you need edit functionality, you'll need an update API endpoint
    showSnackbar("Edit functionality requires an update API endpoint", "info");
  };

  const handleDelete = (type, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      switch (type) {
        case "guestHouse":
          // Note: You'll need a delete API endpoint for this
          showSnackbar(
            "Delete functionality requires a delete API endpoint",
            "info"
          );
          break;
        case "office":
          // Note: You'll need a delete API endpoint for this
          showSnackbar(
            "Delete functionality requires a delete API endpoint",
            "info"
          );
          break;
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "available":
        return "success";
      case "inactive":
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "available":
        return <CheckCircleIcon fontSize="small" />;
      case "inactive":
      case "maintenance":
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case 0:
        return guestHouses;
      case 1:
        return offices;
      default:
        return [];
    }
  };

  // Get current stats based on selected tab
  const getCurrentStats = () => {
    const data = getCurrentData();
    const activeCount = data.filter(
      (item) => item.status === "active" || item.status === "available"
    ).length;
    const inactiveCount = data.filter(
      (item) => item.status === "inactive" || item.status === "maintenance"
    ).length;

    return {
      total: data.length,
      active: activeCount,
      inactive: inactiveCount,
    };
  };

  // Filter data based on search query
  const filteredData = getCurrentData().filter((item) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(query)
    );
  });

  // Paginate data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTable = () => {
    const data = paginatedData;
    const isGuestHouse = selectedTab === 0;

    if (selectedTab !== 0 && selectedTab !== 1) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    const tab = tabs[selectedTab];
    const type = isGuestHouse ? "guestHouse" : "office";

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isGuestHouse ? "Guest House" : "Office Name"}</TableCell>
              <TableCell>Address</TableCell>
              {isGuestHouse && <TableCell>Rooms</TableCell>}
              <TableCell>Created By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isGuestHouse ? 6 : 5}>
                  <EmptyState
                    icon={tab.icon}
                    title={searchQuery ? `No ${tab.label.toLowerCase()} match your search` : `No ${tab.label.toLowerCase()} yet`}
                    description={searchQuery ? "Try a different search term." : `Use “Add ${tab.label.slice(0, -1)}” to create one.`}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          borderRadius: 2.5,
                          display: "grid",
                          placeItems: "center",
                          color: tab.color,
                          bgcolor: alpha(tab.color, 0.12),
                          "& svg": { fontSize: 20 },
                        }}
                      >
                        {tab.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, maxWidth: 320 }}>
                      <LocationIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.25 }} />
                      <Typography variant="body2" sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {item.address}
                      </Typography>
                    </Box>
                  </TableCell>
                  {isGuestHouse && (
                    <TableCell>
                      <Chip label={`${item.rooms} rooms`} size="small" variant="outlined" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, fontSize: "0.7rem", bgcolor: "action.selected", color: "primary.main" }}>
                        {item.createdBy?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{item.createdBy}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      icon={getStatusIcon(item.status)}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                      {!isGuestHouse && (
                        <Tooltip
                          title={
                            pinActiveSince[item.id]
                              ? `Guard PIN active since ${new Date(pinActiveSince[item.id]).toLocaleString()}`
                              : "Generate guard PIN"
                          }
                        >
                          <IconButton size="small" color="primary" onClick={() => setPinDialog({ office: item })}>
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(type, item.id)}
                        disabled={true} // Disabled until update API is available
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(type, item.id)}
                        disabled={true} // Disabled until delete API is available
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case "guestHouse":
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Guest House Name"
              fullWidth
              value={newGuestHouse.name}
              onChange={(e) =>
                setNewGuestHouse({ ...newGuestHouse, name: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              multiline
              rows={3}
              value={newGuestHouse.address}
              onChange={(e) =>
                setNewGuestHouse({ ...newGuestHouse, address: e.target.value })
              }
              sx={{ mt: 2 }}
              required
            />
            <input type="hidden" value="guestHouses" />
          </>
        );

      case "office":
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Office Name"
              fullWidth
              value={newOffice.name}
              onChange={(e) =>
                setNewOffice({ ...newOffice, name: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              multiline
              rows={3}
              value={newOffice.address}
              onChange={(e) =>
                setNewOffice({ ...newOffice, address: e.target.value })
              }
              sx={{ mt: 2 }}
              required
            />
            <input type="hidden" value="offices" />
          </>
        );

      default:
        return null;
    }
  };

  const currentStats = getCurrentStats();

  return (
    <MiniDrawer>
      <PageHeader
        icon={<ManageAccountsIcon />}
        title="System Management"
        subtitle="Manage all system configurations and settings"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              switch (selectedTab) {
                case 0:
                  handleOpenDialog("guestHouse");
                  break;
                case 1:
                  handleOpenDialog("office");
                  break;
                default:
                  handleOpenDialog("guestHouse");
              }
            }}
            sx={{
              background: BRAND_GRADIENT,
              boxShadow: "0 8px 20px -8px rgba(99,102,241,0.7)",
              px: 2.25,
              height: 40,
              "&:hover": { background: BRAND_GRADIENT, filter: "brightness(1.08)" },
            }}
          >
            Add {tabs[selectedTab].label.slice(0, -1)}
          </Button>
        }
      />

      {/* Tabs + Search */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
          sx={segmentedTabsSx}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>

        <SearchField
          placeholder={`Search ${tabs[selectedTab].label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title={`Total ${tabs[selectedTab].label}`}
            value={currentStats.total}
            icon={tabs[selectedTab].icon}
            color={tabs[selectedTab].color}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Active" value={currentStats.active} icon={<CheckCircleIcon />} color="#16a34a" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Inactive" value={currentStats.inactive} icon={<ErrorIcon />} color="#ef4444" />
        </Grid>
      </Grid>

      {/* Guard link (Offices tab): one fixed link for every guard; the guard picks the office on the PIN screen */}
      {selectedTab === 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography sx={{ fontWeight: 600 }}>Guard link</Typography>
          <Typography variant="body2" color="text.secondary">
            Share this link with the guards. They open it, choose their office and enter that office's PIN. Create a
            PIN with the key icon on each office below.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
              {GUARD_LINK}
            </Typography>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyGuardLink}>
              Copy link
            </Button>
          </Box>
        </Paper>
      )}

      {/* Data Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {apiLoading && (selectedTab === 0 || selectedTab === 2) ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              minHeight: 260,
            }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Loading {tabs[selectedTab].label.toLowerCase()}…
            </Typography>
          </Box>
        ) : (
          <>
            {renderTable()}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={`${tabs[selectedTab].label} per page:`}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: dialogType === "office" ? tabs[1].color : tabs[0].color,
              bgcolor: alpha(dialogType === "office" ? tabs[1].color : tabs[0].color, 0.12),
            }}
          >
            {dialogType === "office" ? <LocationIcon /> : <HomeIcon />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
              {dialogType === "guestHouse"
                ? "Add New Guest House"
                : dialogType === "office"
                ? "Add New Office"
                : editMode
                ? "Edit Visitor Type"
                : "Add New Visitor Type"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details below and save.
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>{renderDialogContent()}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit" sx={{ borderColor: "divider" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guard PIN: shown once, gone when the dialog closes */}
      <Dialog open={Boolean(pinDialog)} onClose={() => setPinDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Guard PIN · {pinDialog?.office.name}</DialogTitle>
        <DialogContent>
          {pinDialog?.pin ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This PIN will not be shown again. Copy it now and give it to the guards. Any previous PIN has
                stopped working.
              </Alert>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "2.2rem", fontWeight: 700, letterSpacing: "0.3em" }}>
                  {pinDialog.pin}
                </Typography>
                <Tooltip title="Copy PIN">
                  <IconButton onClick={copyPin}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Typography variant="body2">
              {pinDialog && pinActiveSince[pinDialog.office.id]
                ? `Guards sign in with this PIN once a day. The same PIN works every day. Replace it only if it has leaked: the old one stops working straight away and every guard is signed out.`
                : "Guards sign in with this PIN once a day. The PIN stays the same every day until you replace it."}
            </Typography>
          )}
          {pinDialog?.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {pinDialog.error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {pinDialog?.pin ? (
            <Button variant="contained" onClick={() => setPinDialog(null)}>
              Done
            </Button>
          ) : (
            <>
              <Button onClick={() => setPinDialog(null)} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleGeneratePin}
                disabled={pinDialog?.loading}
                startIcon={pinDialog?.loading ? <CircularProgress size={18} color="inherit" /> : <VpnKeyIcon />}
              >
                {pinDialog && pinActiveSince[pinDialog.office.id] ? "Replace PIN" : "Generate PIN"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Management;
