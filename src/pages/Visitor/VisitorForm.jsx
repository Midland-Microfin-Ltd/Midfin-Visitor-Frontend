import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Card,
  CardContent,
  Fade,
  Slide,
  alpha,
  InputAdornment,
  Badge,
  Grow,
  Zoom,
  Collapse,
} from "@mui/material";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  BusinessCenter as BusinessCenterIcon,
  Close as CloseIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  HowToReg as HowToRegIcon,
  VerifiedUser as VerifiedUserIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../../context/ThemeContext";
import { useParams } from "react-router-dom";
import {
  submitVisitorRequest,
  sendOtp,
  verifyOtp,
  getDepartments,
} from "../../utilities/apiUtils/apiHelper";

const VisitorForm = () => {
  const { mode } = useThemeContext();
  const { qrCode } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [txnId, setTxnId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);

  const [formData, setFormData] = useState({
    visitorType: "external",
    employeeCode: "",
    visitType: "business",
    firstName: "",
    lastName: "",
    phoneNo: "",
    governmentId: "",
    visitDuration: "1",
    visitPurpose: "",
    department: "",
    personToMeet: "",
    officeId: "1",
    registerdBy: "self",
    registerdByEmployeeCode: "",
  });

  const visitorTypes = [
    { value: "external", label: "External Visitor", icon: "👤" },
    { value: "internal", label: "Internal Employee", icon: "👨‍💼" },
  ];

  const visitTypes = [
    { value: "business", label: "Business Meeting", icon: "💼" },
    { value: "personal", label: "Personal Visit", icon: "👤" },
  ];

  const registrationTypes = [
    { value: "self", label: "Self Registration", icon: "👤" },
    { value: "employee", label: "Registered by Employee", icon: "👨‍💼" },
  ];

  const visitPurposes = [
    "Meeting",
    "Interview",
    "Delivery",
    "Maintenance",
    "Client Visit",
    "Training",
    "Consultation",
    "Personal",
    "Other",
  ];

  const officeLocations = [{ id: 1, name: "Head Office - Delhi" }];

  const steps = [
    { label: "Type", icon: <HowToRegIcon /> },
    { label: "Details", icon: <PersonIcon /> },
    { label: "Visit", icon: <BusinessIcon /> },
    { label: "Review", icon: <VerifiedUserIcon /> },
  ];

  useEffect(() => {
    const phoneRegex = /^\d{10}$/;
    const isValid = phoneRegex.test(formData.phoneNo);
    setIsValidPhone(isValid);

    if (!isValid) {
      resetOtpState();
    }
  }, [formData.phoneNo]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (formData.visitorType === "external") {
      setFormData((prev) => ({
        ...prev,
        employeeCode: "",
      }));
    }
  }, [formData.visitorType]);

  useEffect(() => {
    if (formData.registerdBy !== "employee") {
      setFormData((prev) => ({
        ...prev,
        registerdByEmployeeCode: "",
      }));
    }
  }, [formData.registerdBy]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentsError(null);

        const response = await getDepartments();

        if (response.success && response.data?.departments) {
          const formattedDepartments = response.data.departments.map(
            (dept) => ({
              code: dept.departmentCode,
              name: dept.departmentName,
              active: dept.activeStatus === "1",
            })
          );

          setDepartments(formattedDepartments);

          if (formattedDepartments.length > 0 && !formData.department) {
            setFormData((prev) => ({
              ...prev,
              department: formattedDepartments[0].code,
            }));
          }
        } else {
          throw new Error(response.message || "Failed to fetch departments");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentsError(error.message || "Failed to load departments");

        setSnackbar({
          open: true,
          message: "Failed to load departments. Using default list.",
          severity: "warning",
        });
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setTxnId(null);
    setResendTimer(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      setError(null);

      const response = await sendOtp({ phoneNo: formData.phoneNo });

      // Assuming response structure is: { txnId: "some-id", ... }
      const responseData = response.data || response;

      if (responseData.txnId) {
        setTxnId(responseData.txnId);
        setOtpSent(true);
        setOtpVerified(false);
        setOtp("");
        setResendTimer(30); // 30 seconds timer

        setSnackbar({
          open: true,
          message: "OTP sent successfully to your phone!",
          severity: "success",
        });
      } else {
        throw new Error("No transaction ID received from server");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });

      // Reset OTP state on error
      resetOtpState();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!txnId) {
        throw new Error("Transaction ID not found. Please resend OTP.");
      }

      setOtpLoading(true);
      setError(null);

      const response = await verifyOtp({
        txnId: txnId,
        otp: otp,
      });

      setOtpVerified(true);

      setSnackbar({
        open: true,
        message: "Phone number verified successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      let errorMessage = "Invalid OTP. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      handleSendOtp();
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (
          formData.visitorType === "internal" &&
          !formData.employeeCode.trim()
        ) {
          return "Employee Code is required for internal visitors";
        }
        if (
          formData.registerdBy === "employee" &&
          !formData.registerdByEmployeeCode.trim()
        ) {
          return "Registered By Employee Code is required";
        }
        return null;

      case 1:
        if (!formData.firstName.trim()) return "First Name is required";
        if (!formData.lastName.trim()) return "Last Name is required";
        if (!formData.phoneNo.trim()) return "Phone Number is required";
        if (!/^\d{10}$/.test(formData.phoneNo))
          return "Phone Number must be 10 digits";
        if (!otpVerified) return "Phone number must be verified with OTP";
        if (!formData.governmentId.trim()) return "Government ID is required";
        return null;

      case 2:
        if (!formData.visitPurpose) return "Visit Purpose is required";
        if (!formData.personToMeet.trim()) return "Person to Meet is required";
        if (!formData.department) return "Department is required";
        if (!formData.visitDuration || formData.visitDuration.trim() === "") {
          return "Visit Duration is required";
        }
        if (!/^\d+$/.test(formData.visitDuration)) {
          return "Visit Duration must be a number";
        }
        if (parseInt(formData.visitDuration) < 1) {
          return "Visit Duration must be at least 1 hour";
        }
        return null;

      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep(activeStep);
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      for (let i = 0; i < steps.length - 1; i++) {
        const validationError = validateStep(i);
        if (validationError) {
          setActiveStep(i);
          throw new Error(validationError);
        }
      }

      const submitData = {
        visitorType: formData.visitorType,
        visitType: formData.visitType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNo: formData.phoneNo,
        governmentId: formData.governmentId,
        visitDuration: formData.visitDuration,
        visitPurpose: formData.visitPurpose,
        department: formData.department,
        personToMeet: formData.personToMeet,
        officeId: parseInt(formData.officeId),
        registerdBy: formData.registerdBy,
        ...(formData.visitorType === "internal" && formData.employeeCode
          ? {
              employeeCode: formData.employeeCode,
            }
          : {}),
        ...(formData.registerdBy === "employee" &&
        formData.registerdByEmployeeCode
          ? {
              registerdByEmployeeCode: formData.registerdByEmployeeCode,
            }
          : {}),
      };

      const response = await submitVisitorRequest(submitData);

      setLoading(false);
      setSubmitted(true);

      setSnackbar({
        open: true,
        message: "Visitor registration submitted successfully!",
        severity: "success",
      });
    } catch (error) {
      setLoading(false);
      let errorMessage = "Failed to submit visitor request";

      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.errorDescription) {
          const description = apiError.errorDescription;
          if (description.includes("Validation failed:")) {
            const errors = description.replace(
              "Validation failed: Please fix the following errors: ",
              ""
            );
            errorMessage = errors;
          } else {
            errorMessage = description;
          }
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmSubmit = () => {
    handleCloseDialog();
    handleSubmit();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grow in={true} timeout={300}>
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "text.primary",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <HowToRegIcon />
                Visitor Information
              </Typography>

              <Grid container spacing={3}>
                {/* Visitor Type Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="visitor-type-label">
                      Visitor Type *
                    </InputLabel>
                    <Select
                      labelId="visitor-type-label"
                      name="visitorType"
                      value={formData.visitorType}
                      onChange={handleInputChange}
                      label="Visitor Type *"
                      renderValue={(selected) => {
                        const type = visitorTypes.find(
                          (t) => t.value === selected
                        );
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type?.icon}
                            </Typography>
                            <Typography>{type?.label}</Typography>
                          </Box>
                        );
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                          },
                        },
                      }}
                    >
                      {visitorTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type.icon}
                            </Typography>
                            <Box>
                              <Typography variant="body1">
                                {type.label}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Visit Type Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="visit-type-label">Visit Type *</InputLabel>
                    <Select
                      labelId="visit-type-label"
                      name="visitType"
                      value={formData.visitType}
                      onChange={handleInputChange}
                      label="Visit Type *"
                      renderValue={(selected) => {
                        const type = visitTypes.find(
                          (t) => t.value === selected
                        );
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type?.icon}
                            </Typography>
                            <Typography>{type?.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {visitTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type.icon}
                            </Typography>
                            <Box>
                              <Typography variant="body1">
                                {type.label}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Registration By Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel id="registration-type-label">
                      Registration By *
                    </InputLabel>
                    <Select
                      labelId="registration-type-label"
                      name="registerdBy"
                      value={formData.registerdBy}
                      onChange={handleInputChange}
                      label="Registration By *"
                      renderValue={(selected) => {
                        const type = registrationTypes.find(
                          (t) => t.value === selected
                        );
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type?.icon}
                            </Typography>
                            <Typography>{type?.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {registrationTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              {type.icon}
                            </Typography>
                            <Box>
                              <Typography variant="body1">
                                {type.label}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Conditional Fields */}
                {formData.visitorType === "internal" && (
                  <Grid item xs={12} md={6}>
                    <Collapse in={formData.visitorType === "internal"}>
                      <TextField
                        fullWidth
                        label="Employee Code *"
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleInputChange}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge color="primary">
                                <BusinessCenterIcon
                                  fontSize={isMobile ? "small" : "medium"}
                                />
                              </Badge>
                            </InputAdornment>
                          ),
                        }}
                        helperText="Required for internal employees only"
                        placeholder="EMP-001"
                      />
                    </Collapse>
                  </Grid>
                )}

                {formData.registerdBy === "employee" && (
                  <Grid item xs={12} md={6}>
                    <Collapse in={formData.registerdBy === "employee"}>
                      <TextField
                        fullWidth
                        label="Registered By Employee Code *"
                        name="registerdByEmployeeCode"
                        value={formData.registerdByEmployeeCode}
                        onChange={handleInputChange}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonAddIcon
                                fontSize={isMobile ? "small" : "medium"}
                              />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Employee code of person registering"
                        placeholder="EMP-002"
                      />
                    </Collapse>
                  </Grid>
                )}
              </Grid>

              {/* Information Card */}
              {formData.visitorType === "internal" && (
                <Collapse in={formData.visitorType === "internal"}>
                  <Alert
                    severity="info"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textAlign: "left",
                    }}
                  >
                    <Typography variant="body2">
                      As an internal employee, please provide your employee code
                      for verification.
                    </Typography>
                  </Alert>
                </Collapse>
              )}
            </Box>
          </Grow>
        );

      case 1:
        return (
          <Grow in={true} timeout={300}>
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "text.primary",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonIcon />
                Personal Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* First Name Field */}
                  <TextField
                    fullWidth
                    label="First Name *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            fontSize={isMobile ? "small" : "medium"}
                          />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="John"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {/* Last Name Field */}
                  <TextField
                    fullWidth
                    label="Last Name *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    placeholder="Doe"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {/* Phone Number Field - Now in 6-column layout */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Phone Number *
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                    >
                      <TextField
                        fullWidth
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleInputChange}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon
                                fontSize={isMobile ? "small" : "medium"}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {otpVerified ? (
                                <Chip
                                  label="Verified"
                                  color="success"
                                  size="small"
                                  icon={<CheckIcon />}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  variant={otpSent ? "outlined" : "contained"}
                                  onClick={handleSendOtp}
                                  disabled={
                                    !isValidPhone ||
                                    otpLoading ||
                                    resendTimer > 0
                                  }
                                  sx={{ minWidth: 100 }}
                                >
                                  {otpLoading ? (
                                    <CircularProgress size={16} />
                                  ) : otpSent ? (
                                    resendTimer > 0 ? (
                                      `Resend (${resendTimer}s)`
                                    ) : (
                                      "Resend"
                                    )
                                  ) : (
                                    "Send OTP"
                                  )}
                                </Button>
                              )}
                            </InputAdornment>
                          ),
                        }}
                        placeholder="9876543210"
                        helperText={
                          isValidPhone
                            ? "10-digit mobile number"
                            : "Enter valid 10-digit number"
                        }
                      />
                    </Box>
                  </Box>

                  {/* OTP Input Section - This should still be full width when it appears */}
                  {otpSent && !otpVerified && (
                    <Collapse in={otpSent && !otpVerified}>
                      <Box sx={{ mb: 2, mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, color: "text.secondary" }}
                        >
                          Enter OTP *
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              value={otp}
                              onChange={handleOtpChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon
                                      fontSize={isMobile ? "small" : "medium"}
                                    />
                                  </InputAdornment>
                                ),
                                inputProps: {
                                  maxLength: 6,
                                  style: {
                                    letterSpacing: 4,
                                    fontSize: "1.2rem",
                                  },
                                },
                              }}
                              placeholder="0000"
                              helperText="Enter 4-digit OTP sent to your phone"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleVerifyOtp}
                              disabled={otp.length !== 4 || otpLoading}
                              size={isMobile ? "small" : "medium"}
                              sx={{ height: "100%", minHeight: 40 }}
                            >
                              {otpLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </Grid>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Button
                                size="small"
                                onClick={handleResendOtp}
                                disabled={resendTimer > 0}
                                startIcon={<TimerIcon />}
                                sx={{ textTransform: "none" }}
                              >
                                {resendTimer > 0
                                  ? `Resend OTP in ${resendTimer}s`
                                  : "Resend OTP"}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  )}

                  {otpVerified && (
                    <Collapse in={otpVerified}>
                      <Alert
                        severity="success"
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          textAlign: "left",
                        }}
                        icon={<CheckIcon />}
                      >
                        <Typography variant="body2">
                          Phone number verified successfully!
                        </Typography>
                      </Alert>
                    </Collapse>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  {/* Government ID Field - Now also in 6-column layout */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Government ID *
                    </Typography>
                    <TextField
                      fullWidth
                      name="governmentId"
                      value={formData.governmentId}
                      onChange={handleInputChange}
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      placeholder="Aadhar, Passport, or other government ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VerifiedUserIcon
                              fontSize={isMobile ? "small" : "medium"}
                            />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Provide valid government ID number"
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Information Card */}
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  textAlign: "left",
                }}
              >
                <Typography variant="body2">
                  Your personal information will be kept confidential and used
                  only for visitor management purposes.
                </Typography>
              </Alert>
            </Box>
          </Grow>
        );

      case 2:
        return (
          <Grow in={true} timeout={300}>
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "text.primary",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <BusinessIcon />
                Visit Details
              </Typography>

              {/* Step Instructions */}
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
                icon={<InfoIcon />}
              >
                Please fill in all visit details below
              </Alert>

              {/* Purpose Field */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  What is the purpose of your visit? *
                </Typography>
                <FormControl fullWidth variant="outlined">
                  <Select
                    name="visitPurpose"
                    value={formData.visitPurpose}
                    onChange={handleInputChange}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary">
                        Select purpose...
                      </Typography>
                    </MenuItem>
                    {visitPurposes.map((purpose) => (
                      <MenuItem key={purpose} value={purpose}>
                        {purpose}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Person to Meet */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Who are you meeting? *
                </Typography>
                <TextField
                  fullWidth
                  name="personToMeet"
                  value={formData.personToMeet}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="Full name of the person"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {/* Department */}
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    Department *
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    {departmentsLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 2,
                        }}
                      >
                        <CircularProgress size={20} />
                        <Typography variant="body2">
                          Loading departments...
                        </Typography>
                      </Box>
                    ) : (
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        displayEmpty
                        disabled={departmentsLoading}
                        sx={{
                          backgroundColor: "background.paper",
                          borderRadius: 2,
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              "& .MuiMenuItem-root": {
                                whiteSpace: "normal",
                                py: 1.5,
                                minHeight: "auto",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                "&:last-child": {
                                  borderBottom: "none",
                                },

                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="" disabled sx={{ py: 2 }}>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{ fontStyle: "italic" }}
                          >
                            Select department...
                          </Typography>
                        </MenuItem>
                        {departments.map((dept) => (
                          <MenuItem
                            key={dept.code}
                            value={dept.code}
                            disabled={!dept.active}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,

                              "& .department-name": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              className="department-name"
                              sx={{
                                color: !dept.active
                                  ? "text.disabled"
                                  : "text.primary",
                              }}
                            >
                              {dept.name}
                            </Typography>
                            {!dept.active && (
                              <Chip
                                label="Inactive"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  opacity: 0.8,
                                }}
                              />
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    {departmentsError && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {departmentsError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Office Location */}
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    Office Location *
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      name="officeId"
                      value={formData.officeId}
                      onChange={handleInputChange}
                      sx={{
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                      }}
                    >
                      {officeLocations.map((office) => (
                        <MenuItem key={office.id} value={office.id}>
                          {office.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Visit Duration */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  How long will your visit be? *
                </Typography>
                <TextField
                  fullWidth
                  name="visitDuration"
                  value={formData.visitDuration}
                  onChange={handleInputChange}
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 1, max: 24 }}
                  placeholder="Enter hours (1-24)"
                  helperText="Please enter the duration in hours"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Box>
          </Grow>
        );

      case 3:
        return (
          <Grow in={true} timeout={300}>
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "text.primary",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <VerifiedUserIcon />
                Review & Submit
              </Typography>

              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
                icon={<CheckIcon />}
              >
                Please review all information before submitting
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          gap: 2,
                          flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.main",
                            fontSize: "1.5rem",
                          }}
                        >
                          {formData.firstName?.charAt(0)}
                          {formData.lastName?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" noWrap>
                            {formData.firstName} {formData.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {
                              visitorTypes.find(
                                (v) => v.value === formData.visitorType
                              )?.label
                            }
                            {formData.visitorType === "internal" &&
                              formData.employeeCode &&
                              ` (${formData.employeeCode})`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {otpVerified && (
                            <Chip
                              label="Phone Verified"
                              color="success"
                              size="small"
                              icon={<CheckIcon />}
                            />
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Personal Information
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <PhoneIcon fontSize="small" />
                                <span>Phone: {formData.phoneNo}</span>
                                {otpVerified && (
                                  <CheckIcon color="success" fontSize="small" />
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <VerifiedUserIcon fontSize="small" />
                                <span>ID: {formData.governmentId}</span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <HowToRegIcon fontSize="small" />
                                <span>
                                  Registered by:{" "}
                                  {
                                    registrationTypes.find(
                                      (r) => r.value === formData.registerdBy
                                    )?.label
                                  }
                                </span>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Visit Information
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <BusinessIcon fontSize="small" />
                                <span>
                                  Type:{" "}
                                  {
                                    visitTypes.find(
                                      (v) => v.value === formData.visitType
                                    )?.label
                                  }
                                </span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <PersonAddIcon fontSize="small" />
                                <span>Meeting: {formData.personToMeet}</span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AccessTimeIcon fontSize="small" />
                                <span>
                                  Duration: {formData.visitDuration} hours
                                </span>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Department & Location
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <GroupsIcon fontSize="small" />
                                <span>Dept: {formData.department}</span>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocationIcon fontSize="small" />
                                <span>
                                  Office:{" "}
                                  {
                                    officeLocations.find(
                                      (o) => o.id == formData.officeId
                                    )?.name
                                  }
                                </span>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Purpose & Details
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <AssignmentIcon fontSize="small" />
                                <span>Purpose: {formData.visitPurpose}</span>
                              </Typography>
                              {formData.registerdBy === "employee" &&
                                formData.registerdByEmployeeCode && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <PersonAddIcon fontSize="small" />
                                    <span>
                                      Registered by:{" "}
                                      {formData.registerdByEmployeeCode}
                                    </span>
                                  </Typography>
                                )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CheckIcon color="success" fontSize="small" />
                  By submitting, I confirm that all information provided is
                  accurate and complete.
                </Typography>
              </Box>
            </Box>
          </Grow>
        );

      default:
        return "Unknown step";
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ px: 2, py: 4 }}>
        <Zoom in={true} timeout={500}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 3 : 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckIcon sx={{ fontSize: 48, color: "white" }} />
            </Box>

            <Typography variant="h5" gutterBottom fontWeight={600}>
              Registration Successful!
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ mb: 3 }}
            >
              Your visitor registration has been submitted successfully
            </Typography>

            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                textAlign: "left",
              }}
            >
              <Typography variant="body2">
                <strong>Status:</strong> Pending Approval
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                You will receive an ID card after approval
              </Typography>
            </Alert>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2 }}
              >
                Register Another Visitor
              </Button>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    );
  }
  return (
    <>
      <Container
        maxWidth="md"
        sx={{ px: isMobile ? 1 : 2, py: isMobile ? 1 : 3 }}
      >
        <Fade in={true} timeout={300}>
          <Paper
            elevation={isMobile ? 0 : 1}
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 4,
              background: "background.paper",
              border: isMobile ? "none" : `1px solid ${theme.palette.divider}`,
              minHeight: isMobile ? "calc(100vh - 32px)" : "auto",
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  gap: 1,
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                <IconButton
                  onClick={activeStep > 0 ? handleBack : null}
                  size="small"
                  sx={{
                    visibility: activeStep > 0 ? "visible" : "hidden",
                    order: 1,
                  }}
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    flex: 1,
                    textAlign: isMobile ? "center" : "left",
                    order: isMobile ? 3 : 2,
                    width: isMobile ? "100%" : "auto",
                    mt: isMobile ? 1 : 0,
                  }}
                >
                  Visitor Registration
                </Typography>
                <Chip
                  label={qrCode || "VMS-001"}
                  color="primary"
                  icon={<QrCodeIcon />}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    order: 2,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "center" }}
              >
                Complete the form below for a smooth check-in experience
              </Typography>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  {steps.map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            index <= activeStep
                              ? "primary.main"
                              : "action.disabledBackground",
                          color:
                            index <= activeStep
                              ? "primary.contrastText"
                              : "text.disabled",
                          zIndex: 1,
                          transition: "all 0.3s",
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          textAlign: "center",
                          color:
                            index <= activeStep
                              ? "text.primary"
                              : "text.disabled",
                          fontWeight: index === activeStep ? 600 : 400,
                        }}
                      >
                        {step.label}
                      </Typography>
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 18,
                            left: "50%",
                            right: "-50%",
                            height: 2,
                            bgcolor:
                              index < activeStep
                                ? "primary.main"
                                : "action.disabledBackground",
                            zIndex: 0,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Form Content */}
            <Box sx={{ minHeight: 300, mb: 4, position: "relative" }}>
              {getStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIosIcon />}
                sx={{ borderRadius: 2, minWidth: 100 }}
                fullWidth={isMobile}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleOpenDialog}
                  disabled={loading}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    minWidth: 150,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: 4,
                    },
                    transition: "all 0.2s",
                  }}
                  fullWidth={isMobile}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIosIcon />}
                  sx={{
                    borderRadius: 2,
                    minWidth: 100,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: 4,
                    },
                    transition: "all 0.2s",
                  }}
                  fullWidth={isMobile}
                >
                  Next
                </Button>
              )}
            </Box>

            {/* Step Indicator */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
        TransitionComponent={Slide}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <VerifiedUserIcon />
              Confirm Submission
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            You cannot edit the information after submission
          </Alert>
          <Typography>
            Are you sure all information is correct and you want to proceed?
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm & Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VisitorForm;
