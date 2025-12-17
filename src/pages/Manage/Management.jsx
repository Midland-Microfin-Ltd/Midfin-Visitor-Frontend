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
  Switch,
  FormControlLabel,
  Autocomplete,
  Avatar,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Groups as GroupsIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import MiniDrawer from "../../components/MiniDrawer";
import { useThemeContext } from "../../context/ThemeContext";
import {
  getBuildings,
  updateBuilding,
} from "../../utilities/apiUtils/apiHelper";

const Management = () => {
  const { mode } = useThemeContext();
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

  // Visitor Types State
  const [visitorTypes, setVisitorTypes] = useState([
    {
      id: 1,
      name: "Business Visitor",
      duration: "8 hours",
      requiresApproval: true,
    },
    {
      id: 2,
      name: "Client Meeting",
      duration: "4 hours",
      requiresApproval: false,
    },
    {
      id: 3,
      name: "Contractor",
      duration: "Multiple days",
      requiresApproval: true,
    },
    {
      id: 4,
      name: "Family Visit",
      duration: "2 hours",
      requiresApproval: false,
    },
  ]);

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

  const [newVisitorType, setNewVisitorType] = useState({
    name: "",
    duration: "",
    requiresApproval: true,
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
      color: "#48BB78",
      buildingType: "guestHouses",
    },
    { label: "Visitor Types", icon: <GroupsIcon />, color: "#ED8936" },
    {
      label: "Offices",
      icon: <LocationIcon />,
      color: "#F56565",
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
          buildingType: "offices", // FIXED: Use plural form
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
      case "visitorType":
        setNewVisitorType({ name: "", duration: "", requiresApproval: true });
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

        case "visitorType":
          // For visitor types (not using API, local state only)
          if (editMode) {
            setVisitorTypes(
              visitorTypes.map((type) =>
                type.id === currentEditId
                  ? { ...newVisitorType, id: currentEditId }
                  : type
              )
            );
            showSnackbar("Visitor type updated successfully", "success");
          } else {
            const newType = {
              ...newVisitorType,
              id: visitorTypes.length + 1,
            };
            setVisitorTypes([...visitorTypes, newType]);
            showSnackbar("Visitor type added successfully", "success");
          }
          handleCloseDialog();
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

    // For visitor types (local state only)
    if (type === "visitorType") {
      setDialogType(type);
      setEditMode(true);
      setCurrentEditId(id);
      const typeToEdit = visitorTypes.find((type) => type.id === id);
      setNewVisitorType(typeToEdit);
      setOpenDialog(true);
    }
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
        case "visitorType":
          setVisitorTypes(visitorTypes.filter((vtype) => vtype.id !== id));
          showSnackbar("Visitor type deleted successfully", "success");
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
        return visitorTypes;
      case 2:
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

    switch (selectedTab) {
      case 0: // Guest Houses (from API)
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Guest House</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Rooms</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((house) => (
                  <React.Fragment key={house.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: tabs[selectedTab].color,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <HomeIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {house.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Created:{" "}
                              {new Date(house.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              maxWidth: 300,
                            }}
                          >
                            {house.address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${house.rooms} rooms`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {house.createdBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={house.status}
                          color={getStatusColor(house.status)}
                          size="small"
                          icon={getStatusIcon(house.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEdit("guestHouse", house.id)}
                            disabled={true} // Disabled until update API is available
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete("guestHouse", house.id)}
                            disabled={true} // Disabled until delete API is available
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 1: // Visitor Types
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Visitor Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Approval Required</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((type) => (
                  <TableRow key={type.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: tabs[selectedTab].color,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <GroupsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {type.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{type.duration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={type.requiresApproval ? "Yes" : "No"}
                        color={type.requiresApproval ? "warning" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEdit("visitorType", type.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete("visitorType", type.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 2: // Offices (from API)
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Office Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((office) => (
                  <React.Fragment key={office.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: tabs[selectedTab].color,
                              width: 40,
                              height: 40,
                            }}
                          >
                            <LocationIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {office.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Created:{" "}
                              {new Date(office.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              maxWidth: 300,
                            }}
                          >
                            {office.address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {office.createdBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={office.status}
                          color={getStatusColor(office.status)}
                          size="small"
                          icon={getStatusIcon(office.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEdit("office", office.id)}
                            disabled={true} // Disabled until update API is available
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete("office", office.id)}
                            disabled={true} // Disabled until delete API is available
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        );
    }
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

      case "visitorType":
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Visitor Type Name"
              fullWidth
              value={newVisitorType.name}
              onChange={(e) =>
                setNewVisitorType({ ...newVisitorType, name: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Default Duration"
              fullWidth
              value={newVisitorType.duration}
              onChange={(e) =>
                setNewVisitorType({
                  ...newVisitorType,
                  duration: e.target.value,
                })
              }
              sx={{ mt: 2 }}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newVisitorType.requiresApproval}
                  onChange={(e) =>
                    setNewVisitorType({
                      ...newVisitorType,
                      requiresApproval: e.target.checked,
                    })
                  }
                />
              }
              label="Requires Approval"
              sx={{ mt: 2 }}
            />
          </>
        );

      default:
        return null;
    }
  };

  const currentStats = getCurrentStats();

  return (
    <MiniDrawer>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom color="text.primary">
              System Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage all system configurations and settings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              switch (selectedTab) {
                case 0:
                  handleOpenDialog("guestHouse");
                  break;
                case 1:
                  handleOpenDialog("visitorType");
                  break;
                case 2:
                  handleOpenDialog("office");
                  break;
                default:
                  handleOpenDialog("guestHouse");
              }
            }}
            sx={{
              backgroundColor: tabs[selectedTab].color,
              "&:hover": {
                backgroundColor: tabs[selectedTab].color,
                opacity: 0.9,
              },
            }}
          >
            Add {tabs[selectedTab].label.slice(0, -1)}
          </Button>
        </Box>

        {/* Tabs with icons */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "0.875rem",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={{
                  color: selectedTab === index ? tab.color : "text.secondary",
                  "&.Mui-selected": {
                    color: tab.color,
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder={`Search ${tabs[selectedTab].label.toLowerCase()}...`}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total {tabs[selectedTab].label}
                    </Typography>
                    <Typography variant="h5" color="text.primary">
                      {currentStats.total}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${tabs[selectedTab].color}20`,
                      color: tabs[selectedTab].color,
                    }}
                  >
                    {tabs[selectedTab].icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active
                    </Typography>
                    <Typography variant="h5" color="text.primary">
                      {currentStats.active}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#48BB7820", color: "#48BB78" }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Inactive
                    </Typography>
                    <Typography variant="h5" color="text.primary">
                      {currentStats.inactive}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#F5656520", color: "#F56565" }}>
                    <ErrorIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Loading State */}
        {apiLoading && (selectedTab === 0 || selectedTab === 2) ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* Data Table */
          <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
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
          </Paper>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "guestHouse"
            ? "Add New Guest House"
            : dialogType === "office"
            ? "Add New Office"
            : editMode
            ? "Edit Visitor Type"
            : "Add New Visitor Type"}
        </DialogTitle>
        <DialogContent>{renderDialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MiniDrawer>
  );
};

export default Management;
