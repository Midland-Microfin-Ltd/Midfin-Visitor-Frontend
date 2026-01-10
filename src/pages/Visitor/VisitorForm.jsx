import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Zoom,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Alert,
  Link,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  MeetingRoom as MeetingRoomIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  CameraAlt as CameraAltIcon,
  DeleteOutline as DeleteOutlineIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import {
  sendOtp,
  verifyOtp,
  submitVisitorSelfie,
  submitVisitorRequest,
} from "../../utilities/apiUtils/apiHelper";

const PURPOSES = [
  { id: "business", label: "Business Meeting", icon: "💼" },
  { id: "interview", label: "Interview", icon: "👔" },
  { id: "delivery", label: "Delivery", icon: "📦" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
  { id: "event", label: "Event/Conference", icon: "🎤" },
  { id: "other", label: "Other", icon: "📋" },
];

const DEPARTMENTS = [
  "Human Resources",
  "IT",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Customer Support",
  "Engineering",
];

const STEPS = [
  "Verification",
  "Photo",
  "Purpose",
  "Details",
  "Meeting Info",
  "Review",
];

// Initial form state
const INITIAL_FORM_DATA = {
  phone: "",
  otp: "",
  otpSent: false,
  verified: false,
  termsAccepted: false,
  purpose: "",
  fullName: "",
  company: "",
  governmentId: "",
  personToMeet: "",
  department: "",
  visitDuration: "",
  photo: null,
  photoPreview: null,
};

// Camera component
const CameraComponent = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const photoData = canvas.toDataURL("image/jpeg");

      // Stop camera
      stopCamera();

      // Pass photo data to parent
      onCapture(photoData);
    }
  };

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: "relative", width: "100%", height: 300, mb: 2 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
            transform: "scaleX(-1)", // Mirror the video
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CameraAltIcon />}
          onClick={capturePhoto}
          sx={{
            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            color: "white",
          }}
        >
          Capture Photo
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            color: "#f44336",
            borderColor: "#f44336",
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

// Main VisitorForm component
export default function VisitorForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [txnId, setTxnId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [selfieResponse, setSelfieResponse] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);

  const fileInputRef = useRef(null);

  // Derived values
  const selectedPurpose = PURPOSES.find((p) => p.id === formData.purpose);
  const canProceedToMeetingInfo =
    formData.fullName && formData.company && formData.governmentId;
  const canProceedToReview =
    formData.personToMeet && formData.department && formData.visitDuration;

  // Format phone number
  const formatPhoneNumber = (phone) => phone.replace(/\D/g, "");

  // Handlers
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: value });
    setErrorMessage("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setFormData({ ...formData, otp: value });
    setErrorMessage("");
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage("");

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      const response = await sendOtp({ phoneNo: formattedPhone });

      const txnIdValue =
        response.txnId || (response.data && response.data.txnId);

      if (txnIdValue) {
        setTxnId(txnIdValue);
        setFormData({ ...formData, otpSent: true });
        setResendCountdown(30);

        const countdownInterval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("[API] Error sending OTP:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit OTP");
      return;
    }

    if (!txnId) {
      setErrorMessage("OTP session expired. Please request a new OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const response = await verifyOtp({ txnId, otp: formData.otp });

      if (response?.success) {
        setFormData({ ...formData, verified: true });
      } else {
        throw new Error(response?.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("[API] Error verifying OTP:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTermsChange = (e) => {
    const newTermsAccepted = e.target.checked;
    setFormData({ ...formData, termsAccepted: newTermsAccepted });

    if (newTermsAccepted && formData.verified) {
      setTimeout(() => setActiveStep(1), 500);
    }
  };

  // Camera handlers
  const handleStartCamera = () => {
    setShowCamera(true);
  };

  const handleCancelCamera = () => {
    setShowCamera(false);
  };

  const handleCapturePhoto = (photoData) => {
    // Convert data URL to blob
    fetch(photoData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });
        setFormData({
          ...formData,
          photo: file,
          photoPreview: photoData,
        });
        setShowCamera(false);
      })
      .catch((err) => {
        console.error("Error converting photo:", err);
        setErrorMessage("Failed to capture photo. Please try again.");
        setShowCamera(false);
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: file,
          photoPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage("Please select a valid image file.");
    }
  };

  // Upload selfie API call
  const uploadSelfie = async () => {
    if (!formData.photo) {
      setErrorMessage("Please select a photo first.");
      return false;
    }

    setIsUploadingSelfie(true);
    setErrorMessage("");

    try {
      const response = await submitVisitorSelfie(formData.photo);

      if (response?.success) {
        setSelfieResponse(response.data);
        setUploadedPhotoUrl(response.data.visitorSelfieUrl);
        return true;
      } else {
        throw new Error(response?.message || "Failed to upload selfie");
      }
    } catch (error) {
      console.error("[API] Error uploading selfie:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload photo. Please try again."
      );
      return false;
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  const deletePhoto = () => {
    setFormData({
      ...formData,
      photo: null,
      photoPreview: null,
    });
    setSelfieResponse(null);
    setUploadedPhotoUrl(null);
  };

  const handlePhotoContinue = async () => {
    if (!formData.photo) {
      setErrorMessage("Please take or upload a photo first.");
      return;
    }

    // Upload selfie when clicking continue
    const uploadSuccess = await uploadSelfie();

    if (uploadSuccess) {
      setActiveStep(2);
    }
  };

  const handlePurposeSelect = (purposeId) => {
    setFormData({ ...formData, purpose: purposeId });
    setTimeout(() => setActiveStep(3), 600);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleEdit = (step) => {
    setActiveStep(step);
  };

  const handleSubmit = async () => {
    if (!selfieResponse || !selfieResponse.visitorId) {
      setErrorMessage("Please upload a photo before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // Prepare visitor data according to API requirements
    const visitorData = {
      visitorType: "external", // Default to external as per your form
      visitType: "personal", // Changed to "personal" as per API example
      firstName: formData.fullName.split(" ")[0] || formData.fullName,
      lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
      phoneNo: formData.phone,
      governmentId: formData.governmentId,
      visitDuration: formData.visitDuration,
      visitPurpose: selectedPurpose?.label || formData.purpose || "Other",
      department: formData.department,
      personToMeet: formData.personToMeet,
      officeId: 1, // Default office ID - update as needed
      registerdBy: "self", // Self registration
      // Additional fields that might be needed
      company: formData.company || "",
      // visitorId is NOT included in body - will be URL parameter
    };

    try {
      // Pass visitorId as first parameter and visitorData as second
      const response = await submitVisitorRequest(
        selfieResponse.visitorId,
        visitorData
      );

      if (response?.success || response?.data?.success) {
        // Success - show thank you message
        setIsSubmitted(true);
      } else {
        throw new Error(response?.message || "Failed to submit registration");
      }
    } catch (error) {
      console.error("[API] Error submitting visitor request:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillAnother = () => {
    setIsSubmitted(false);
    setActiveStep(0);
    setFormData(INITIAL_FORM_DATA);
    setTxnId("");
    setResendCountdown(0);
    setErrorMessage("");
    setShowCamera(false);
    setSelfieResponse(null);
    setUploadedPhotoUrl(null);
  };

  if (isSubmitted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        }}
      >
        <Zoom in timeout={800}>
          <Card
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 500 },
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              p: { xs: 3, sm: 5 },
              textAlign: "center",
            }}
          >
            <CheckCircleIcon
              sx={{ fontSize: { xs: 80, sm: 100 }, color: "#4caf50", mb: 3 }}
            />
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: 700, mb: 2 }}
            >
              Thank You!
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 4 }}
            >
              Thanks for your valuable time. After review and approval we will
              provide you a pass.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFillAnother}
              sx={{
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                color: "white",
                p: { xs: 1.25, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  boxShadow: "0 8px 24px rgba(33, 150, 243, 0.4)",
                },
              }}
            >
              Fill Another Form
            </Button>
          </Card>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 500 },
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          borderRadius: { xs: 2, sm: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: "white",
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Visitor Registration
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.6)",
              mb: 4,
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            Welcome! Please complete the registration process
          </Typography>

          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ color: "white" }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                justifyContent: "center",
                gap: 1,
                mb: 3,
              }}
            >
              {STEPS.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      index === activeStep
                        ? "#2196f3"
                        : index < activeStep
                        ? "#4caf50"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Error Message */}
          {errorMessage && (
            <Fade in>
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setErrorMessage("")}
              >
                {errorMessage}
              </Alert>
            </Fade>
          )}

          {/* Step 0: Phone Verification */}
          {activeStep === 0 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <PhoneIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#2196f3",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Verify Your Phone
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    {!formData.otpSent
                      ? "Enter your phone number to receive OTP"
                      : "Enter the OTP sent to your phone"}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10 digit phone number"
                  disabled={formData.verified || formData.otpSent}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#2196f3" }} />
                      </InputAdornment>
                    ),
                    endAdornment: formData.verified && (
                      <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                      "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />

                {!formData.otpSent && !formData.verified && formData.phone && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || formData.phone.length < 10}
                    sx={{
                      mb: 2,
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      p: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      },
                    }}
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </Button>
                )}

                {formData.otpSent && !formData.verified && (
                  <Fade in>
                    <Box>
                      <TextField
                        fullWidth
                        label="Enter OTP"
                        value={formData.otp}
                        onChange={handleOtpChange}
                        placeholder="Enter 4-digit code"
                        inputProps={{ maxLength: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon sx={{ color: "#2196f3" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(255, 255, 255, 0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(33, 150, 243, 0.5)",
                            },
                          },
                        }}
                      />

                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleVerifyOtp}
                          disabled={isVerifying || formData.otp.length !== 4}
                          sx={{
                            flex: 2,
                            background:
                              "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                            color: "white",
                            p: 1.5,
                            fontWeight: 600,
                          }}
                        >
                          {isVerifying ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleResendOtp}
                          disabled={resendCountdown > 0 || isSendingOtp}
                          startIcon={<RefreshIcon />}
                          sx={{
                            flex: 1,
                            borderColor: "rgba(33, 150, 243, 0.5)",
                            color:
                              resendCountdown > 0
                                ? "rgba(255, 255, 255, 0.5)"
                                : "#2196f3",
                          }}
                        >
                          {resendCountdown > 0
                            ? `${resendCountdown}s`
                            : "Resend"}
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}

                {formData.verified && (
                  <Fade in>
                    <Box>
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          background: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <CheckCircleIcon sx={{ color: "#4caf50" }} />
                        <Box>
                          <Typography
                            sx={{ color: "#4caf50", fontWeight: 600 }}
                          >
                            Phone Verified!
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                          >
                            Please accept terms to continue
                          </Typography>
                        </Box>
                      </Paper>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.termsAccepted}
                            onChange={handleTermsChange}
                            sx={{
                              color: "rgba(255, 255, 255, 0.5)",
                              "&.Mui-checked": { color: "#2196f3" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            I accept the terms and conditions
                          </Typography>
                        }
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Zoom>
          )}

          {/* Step 1: Photo Upload */}
          {activeStep === 1 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <CameraAltIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#2196f3",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Upload Your Photo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    {showCamera
                      ? "Position yourself and click capture"
                      : "Take a photo or upload from your device"}
                  </Typography>
                </Box>

                {showCamera ? (
                  <CameraComponent
                    onCapture={handleCapturePhoto}
                    onCancel={handleCancelCamera}
                  />
                ) : (
                  <>
                    {!formData.photoPreview ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            border: "3px dashed #2196f3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            background: "rgba(33, 150, 243, 0.1)",
                            "&:hover": {
                              background: "rgba(33, 150, 243, 0.2)",
                            },
                          }}
                          onClick={handleStartCamera}
                        >
                          <CameraAltIcon
                            sx={{ fontSize: 60, color: "#2196f3" }}
                          />
                        </Box>

                        <Typography
                          sx={{ color: "white", textAlign: "center" }}
                        >
                          Click to take a photo with camera
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            my: 2,
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              height: 1,
                              background: "rgba(255, 255, 255, 0.2)",
                            }}
                          />
                          <Typography
                            sx={{ px: 2, color: "rgba(255, 255, 255, 0.6)" }}
                          >
                            OR
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              height: 1,
                              background: "rgba(255, 255, 255, 0.2)",
                            }}
                          />
                        </Box>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          onClick={() => fileInputRef.current.click()}
                          sx={{
                            color: "#2196f3",
                            borderColor: "rgba(33, 150, 243, 0.5)",
                            p: 1.5,
                            "&:hover": {
                              borderColor: "#2196f3",
                              background: "rgba(33, 150, 243, 0.1)",
                            },
                          }}
                        >
                          Upload from Device
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileUpload}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "3px solid #2196f3",
                            position: "relative",
                          }}
                        >
                          <img
                            src={formData.photoPreview}
                            alt="Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <CheckCircleIcon
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              color: "#4caf50",
                              bgcolor: "white",
                              borderRadius: "50%",
                              fontSize: 30,
                            }}
                          />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={deletePhoto}
                            sx={{
                              color: "#f44336",
                              borderColor: "#f44336",
                              "&:hover": {
                                background: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            Retake
                          </Button>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handlePhotoContinue}
                            disabled={isUploadingSelfie}
                            sx={{
                              background: isUploadingSelfie
                                ? "rgba(33, 150, 243, 0.5)"
                                : "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                              color: "white",
                              "&:hover": {
                                background: isUploadingSelfie
                                  ? "rgba(33, 150, 243, 0.5)"
                                  : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                              },
                            }}
                          >
                            {isUploadingSelfie ? "Uploading..." : "Continue"}
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Zoom>
          )}

          {/* Step 2: Purpose Selection */}
          {activeStep === 2 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <BusinessCenterIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#2196f3",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Purpose of Visit
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    Select the reason for your visit today
                  </Typography>
                </Box>

                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  {PURPOSES.map((purpose) => (
                    <Grid item xs={6} key={purpose.id}>
                      <Paper
                        onClick={() => handlePurposeSelect(purpose.id)}
                        sx={{
                          p: { xs: 1.5, sm: 2.5 },
                          textAlign: "center",
                          cursor: "pointer",
                          background:
                            formData.purpose === purpose.id
                              ? "linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(3, 169, 244, 0.2) 100%)"
                              : "rgba(255, 255, 255, 0.05)",
                          border:
                            formData.purpose === purpose.id
                              ? "2px solid #2196f3"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(3, 169, 244, 0.1) 100%)",
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <Typography
                          sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }}
                        >
                          {purpose.icon}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight:
                              formData.purpose === purpose.id ? 600 : 400,
                          }}
                        >
                          {purpose.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Zoom>
          )}

          {/* Step 3: Personal Details */}
          {activeStep === 3 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <PersonIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#2196f3",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Personal Details
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    Please provide your information
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Enter Full Name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#2196f3" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Company"
                    value={formData.company}
                    onChange={handleChange("company")}
                    placeholder="Enter Your Company Name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: "#2196f3" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Government ID"
                    value={formData.governmentId}
                    onChange={handleChange("governmentId")}
                    placeholder="Enter Any Government ID Number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: "#2196f3" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setActiveStep(4)}
                    disabled={!canProceedToMeetingInfo}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 2,
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      p: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      },
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Box>
            </Zoom>
          )}

          {/* Step 4: Meeting Information */}
          {activeStep === 4 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <MeetingRoomIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#2196f3",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Meeting Information
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    Who are you here to meet?
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Person to Meet"
                    value={formData.personToMeet}
                    onChange={handleChange("personToMeet")}
                    placeholder="Enter Person Name You are Meeting"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#2196f3" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#2196f3" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                        "&.Mui-focused": { color: "#2196f3" },
                      },
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&.Mui-focused": { color: "#2196f3" },
                      }}
                    >
                      Department
                    </InputLabel>
                    <Select
                      value={formData.department}
                      label="Department"
                      onChange={handleChange("department")}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#2196f3",
                        },
                        "& .MuiSelect-icon": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background:
                              "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            marginTop: "4px",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                            "& .MuiMenuItem-root": {
                              color: "rgba(255, 255, 255, 0.9)",
                              backgroundColor: "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.2)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(33, 150, 243, 0.3)",
                                "&:hover": {
                                  backgroundColor: "rgba(33, 150, 243, 0.4)",
                                },
                              },
                              "&.Mui-focusVisible": {
                                backgroundColor: "rgba(33, 150, 243, 0.3)",
                              },
                            },
                          },
                        },
                      }}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <MenuItem
                          key={dept}
                          value={dept}
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(33, 150, 243, 0.2)",
                            },
                          }}
                        >
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&.Mui-focused": { color: "#2196f3" },
                      }}
                    >
                      Visit Duration
                    </InputLabel>
                    <Select
                      value={formData.visitDuration}
                      label="Visit Duration"
                      onChange={handleChange("visitDuration")}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(33, 150, 243, 0.5)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#2196f3",
                        },
                        "& .MuiSelect-icon": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background:
                              "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            marginTop: "4px",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                            "& .MuiMenuItem-root": {
                              color: "rgba(255, 255, 255, 0.9)",
                              backgroundColor: "transparent",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.2)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(33, 150, 243, 0.3)",
                                "&:hover": {
                                  backgroundColor: "rgba(33, 150, 243, 0.4)",
                                },
                              },
                              "&.Mui-focusVisible": {
                                backgroundColor: "rgba(33, 150, 243, 0.3)",
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="1">1 Day</MenuItem>
                      <MenuItem value="2">2 Days</MenuItem>
                      <MenuItem value="3">3 Days</MenuItem>
                      <MenuItem value="5">5 Days</MenuItem>
                      <MenuItem value="7">1 Week</MenuItem>
                      <MenuItem value="14">2 Weeks</MenuItem>
                      <MenuItem value="30">1 Month</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setActiveStep(5)}
                    disabled={!canProceedToReview}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 2,
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      p: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      },
                      "&:disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    Continue to Review
                  </Button>
                </Stack>
              </Box>
            </Zoom>
          )}

          {/* Step 5: Review */}
          {activeStep === 5 && (
            <Zoom in timeout={500}>
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <CheckCircleIcon
                    sx={{
                      fontSize: { xs: 48, sm: 60 },
                      color: "#4caf50",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 1 }}
                  >
                    Review Your Information
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    Please verify all details before submitting
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <ReviewItem
                    label="Phone Number"
                    value={formData.phone}
                    onEdit={() => handleEdit(0)}
                  />
                  <ReviewItem
                    label="Photo"
                    value={selfieResponse ? "Uploaded ✓" : "Not uploaded"}
                    subValue={
                      selfieResponse
                        ? `Visitor ID: ${selfieResponse.visitorId}`
                        : undefined
                    }
                    onEdit={() => handleEdit(1)}
                    uploadedPhoto={uploadedPhotoUrl}
                  />
                  <ReviewItem
                    label="Purpose of Visit"
                    value={selectedPurpose?.label}
                    onEdit={() => handleEdit(2)}
                  />
                  <ReviewItem
                    label="Personal Details"
                    value={formData.fullName}
                    subValue={`${formData.company} | ID: ${formData.governmentId}`}
                    onEdit={() => handleEdit(3)}
                  />
                  <ReviewItem
                    label="Meeting Details"
                    value={formData.personToMeet}
                    subValue={`${formData.department} | Duration: ${
                      formData.visitDuration
                    } ${formData.visitDuration === "1" ? "Day" : "Days"}`}
                    onEdit={() => handleEdit(4)}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selfieResponse}
                    sx={{
                      mt: 3,
                      background:
                        isSubmitting || !selfieResponse
                          ? "rgba(33, 150, 243, 0.5)"
                          : "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                      color: "white",
                      p: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          isSubmitting || !selfieResponse
                            ? "rgba(33, 150, 243, 0.5)"
                            : "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                      },
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </Stack>
              </Box>
            </Zoom>
          )}
        </CardContent>

        <Box
          sx={{
            textAlign: "center",
            py: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255, 255, 255, 0.5)" }}
          >
            Powered by Midland Microfin Limited
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

// Updated ReviewItem component to show uploaded photo
const ReviewItem = ({ label, value, subValue, onEdit, uploadedPhoto }) => (
  <Paper
    sx={{
      p: 2,
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
        {label}
      </Typography>
      <Typography sx={{ color: "white", fontWeight: 500 }}>{value}</Typography>
      {subValue && (
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          {subValue}
        </Typography>
      )}
      {/* Show uploaded photo preview for photo section */}
      {uploadedPhoto && label === "Photo" && (
        <Box sx={{ mt: 1 }}>
          <img
            src={uploadedPhoto}
            alt="Uploaded selfie"
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #2196f3",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/60";
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "#2196f3", display: "block", mt: 0.5 }}
          >
            <Link
              href={uploadedPhoto}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#2196f3", fontSize: "0.75rem" }}
            >
              View Photo
            </Link>
          </Typography>
        </Box>
      )}
    </Box>
    <IconButton size="small" onClick={onEdit} sx={{ color: "#2196f3" }}>
      <EditIcon fontSize="small" />
    </IconButton>
  </Paper>
);
