import { useState, useRef, useEffect } from "react";
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
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Alert,
  Link,
  Avatar,
  useTheme,
  useMediaQuery,
  Fab,
  MobileStepper,
  CardActionArea,
  CircularProgress,
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
  CameraEnhance as CameraEnhanceIcon,
  PersonPin as PersonPinIcon,
  Schedule as ScheduleIcon,
  FactCheck as FactCheckIcon,
  QrCodeScanner as QrCodeScannerIcon,
  WifiTethering as WifiTetheringIcon,
  FlashOn as FlashOnIcon,
  Animation as AnimationIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  VerifiedUser as VerifiedUserIcon,
  Fingerprint as FingerprintIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  sendOtp,
  verifyOtp,
  submitVisitorSelfie,
  submitVisitorRequest,
  generateVisitorPass,
} from "../../utilities/apiUtils/apiHelper";
import { keyframes } from "@emotion/react";
import VisitorPass from "../Passess/VisitorPassmaker";
import html2canvas from "html2canvas";
import {
  downloadPassAsImage,
  formatPassData,
} from "../../utilities/PassDownloadUtils";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(33, 150, 243, 0.5); }
  50% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.8), 0 0 30px rgba(33, 150, 243, 0.4); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const PURPOSES = [
  { id: "business", label: "Business", icon: "💼", color: "#2196f3" },
  { id: "interview", label: "Interview", icon: "👔", color: "#4caf50" },
  { id: "delivery", label: "Delivery", icon: "📦", color: "#ff9800" },
  { id: "maintenance", label: "Maintenance", icon: "🔧", color: "#795548" },
  { id: "event", label: "Event", icon: "🎤", color: "#9c27b0" },
  { id: "other", label: "Other", icon: "📋", color: "#607d8b" },
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
  "Meeting",
  "Review",
];

// Mobile-optimized step labels
const MOBILE_STEPS = [
  { label: "Verify", icon: <PhoneIcon /> },
  { label: "Photo", icon: <CameraAltIcon /> },
  { label: "Purpose", icon: <BusinessCenterIcon /> },
  { label: "Details", icon: <PersonIcon /> },
  { label: "Meeting", icon: <MeetingRoomIcon /> },
  { label: "Review", icon: <FactCheckIcon /> },
];

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

const CameraComponent = ({ onCapture, onCancel, isMobile }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (isMobile) {
    document.body.style.overflow = "hidden";
  }

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      if (isMobile) {
        document.body.style.overflow = "auto";
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 640 : 480 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          capturePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (flash) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const photoData = canvas.toDataURL("image/jpeg");

      stopCamera();
      onCapture(photoData);
    }
  };

  const toggleFlash = () => {
    setFlash(!flash);
  };

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "rgba(244, 67, 54, 0.1)",
            mb: 2,
            mx: "auto",
          }}
        >
          <CameraAltIcon sx={{ fontSize: 40, color: "#f44336" }} />
        </Avatar>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 3,
            background: "rgba(244, 67, 54, 0.1)",
            border: "1px solid rgba(244, 67, 54, 0.3)",
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={onCancel}
          sx={{
            background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
            color: "white",
            borderRadius: 3,
            px: 4,
            py: 1.5,
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: "relative", mb: 3 }}>
        {countdown > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: "white",
                fontSize: 80,
                fontWeight: 700,
                animation: `${pulse} 1s infinite`,
              }}
            >
              {countdown}
            </Typography>
          </Box>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: isMobile ? "50vh" : 400,
            objectFit: "cover",
            borderRadius: 16,
            transform: "scaleX(-1)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            background: `
              linear-gradient(to right, transparent 48%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.1) 52%, transparent 52%),
              linear-gradient(to bottom, transparent 48%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.1) 52%, transparent 52%)
            `,
            borderRadius: 16,
          }}
        />

        {/* Face outline animation */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "25%",
            right: "25%",
            bottom: "20%",
            border: "3px dashed rgba(33, 150, 243, 0.6)",
            borderRadius: "50%",
            animation: `${glow} 2s infinite`,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Camera controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: isMobile ? 2 : 3,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          startIcon={<FlashOnIcon />}
          onClick={toggleFlash}
          sx={{
            background: flash
              ? "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
              : "rgba(255, 255, 255, 0.1)",
            color: flash ? "white" : "rgba(255, 255, 255, 0.7)",
            borderRadius: 3,
            px: 3,
            py: 1.5,
            minWidth: isMobile ? "auto" : 120,
          }}
        >
          {flash ? "ON" : "Flash"}
        </Button>

        <Fab
          color="primary"
          onClick={startCountdown}
          sx={{
            width: isMobile ? 70 : 80,
            height: isMobile ? 70 : 80,
            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            animation: `${pulse} 2s infinite`,
            "&:hover": {
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            },
          }}
        >
          <CameraAltIcon sx={{ fontSize: isMobile ? 30 : 35 }} />
        </Fab>

        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: "rgba(255, 255, 255, 0.3)",
            color: "rgba(255, 255, 255, 0.7)",
            borderRadius: 3,
            px: 3,
            py: 1.5,
            minWidth: isMobile ? "auto" : 120,
            "&:hover": {
              borderColor: "#f44336",
              color: "#f44336",
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

// Mobile Bottom Navigation
const MobileStepNavigation = ({ activeStep, onStepChange, isMobile }) => {
  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "linear-gradient(135deg, #0a1929 0%, #001e3c 100%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px 20px 0 0",
        px: 1,
        py: 2,
      }}
      elevation={3}
    >
      <MobileStepper
        variant="dots"
        steps={6}
        position="static"
        activeStep={activeStep}
        sx={{
          background: "transparent",
          "& .MuiMobileStepper-dot": {
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            width: 8,
            height: 8,
            margin: "0 4px",
          },
          "& .MuiMobileStepper-dotActive": {
            backgroundColor: "#2196f3",
            width: 20,
            borderRadius: 4,
          },
        }}
      />

      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 2, mt: 1 }}
      >
        {MOBILE_STEPS.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              opacity: index === activeStep ? 1 : 0.3,
              transition: "all 0.3s ease",
              transform: index === activeStep ? "translateY(-5px)" : "none",
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background:
                  index === activeStep
                    ? "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                color:
                  index === activeStep ? "white" : "rgba(255, 255, 255, 0.3)",
                mb: 0.5,
              }}
            >
              {step.icon}
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                color:
                  index === activeStep ? "#2196f3" : "rgba(255, 255, 255, 0.3)",
                fontWeight: index === activeStep ? 600 : 400,
                fontSize: 10,
                textAlign: "center",
              }}
            >
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// Review Item Component for Mobile
const ReviewItemMobile = ({
  label,
  value,
  subValue,
  icon,
  uploadedPhoto,
  color = "#2196f3",
  onEdit,
}) => (
  <Paper
    sx={{
      p: 2,
      background: "rgba(255, 255, 255, 0.05)",
      borderLeft: `4px solid ${color}`,
      borderRadius: 2,
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.08)",
        transform: "translateX(4px)",
      },
    }}
  >
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: `${color}20`,
        color: color,
      }}
    >
      {icon}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255, 255, 255, 0.6)", display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ color: "white", fontWeight: 500, mb: subValue ? 0.5 : 0 }}
      >
        {value}
      </Typography>
      {subValue && (
        <Typography
          variant="body2"
          sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.875rem" }}
        >
          {subValue}
        </Typography>
      )}
      {uploadedPhoto && label === "Visitor Photo" && (
        <Box sx={{ mt: 1 }}>
          <img
            src={uploadedPhoto}
            alt="Uploaded selfie"
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${color}`,
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/60";
            }}
          />
          <Link
            href={uploadedPhoto}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: color,
              fontSize: "0.75rem",
              display: "inline-block",
              mt: 0.5,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            View Photo
          </Link>
        </Box>
      )}
    </Box>
    {onEdit && (
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{
          color: color,
          alignSelf: "center",
          "&:hover": {
            background: "rgba(33, 150, 243, 0.1)",
          },
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    )}
  </Paper>
);

// Main VisitorForm Component
export default function VisitorForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [passData, setPassData] = useState(null);
  const [passVisible, setPassVisible] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [generatingPass, setGeneratingPass] = useState(false);
  const [generatedVisitorId, setGeneratedVisitorId] = useState(null);
  const passRef = useRef(null);

  const fileInputRef = useRef(null);

  // Derived values
  const selectedPurpose = PURPOSES.find((p) => p.id === formData.purpose);
  const canProceedToMeetingInfo =
    formData.fullName && formData.company && formData.governmentId;
  const canProceedToReview =
    formData.personToMeet && formData.department && formData.visitDuration;

  // Generate pass number
  const generatePassNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `VP-${randomNum}`;
  };

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
      const formattedPhone = formData.phone.replace(/\D/g, "");
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
          "Failed to send OTP. Please try again.",
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
          "Invalid OTP. Please try again.",
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
          "Failed to upload photo. Please try again.",
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

    const uploadSuccess = await uploadSelfie();

    if (uploadSuccess) {
      setActiveStep(2);
    }
  };

  const handlePurposeSelect = (purposeId) => {
    setFormData({ ...formData, purpose: purposeId });
    setTimeout(() => setActiveStep(3), 400);
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

    const visitorData = {
      visitorType: "external",
      visitType: "personal",
      firstName: formData.fullName.split(" ")[0] || formData.fullName,
      lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
      phoneNo: formData.phone,
      governmentId: formData.governmentId,
      visitDuration: formData.visitDuration,
      visitPurpose: selectedPurpose?.label || formData.purpose || "Other",
      department: formData.department,
      personToMeet: formData.personToMeet,
      officeId: 1,
      registerdBy: "self",
      company: formData.company || "",
    };

    try {
      // Step 1: Submit visitor request
      const response = await submitVisitorRequest(
        selfieResponse.visitorId,
        visitorData,
      );

      if (response?.success || response?.data?.success) {
        // Store the visitor ID
        const visitorId = selfieResponse.visitorId;
        setGeneratedVisitorId(visitorId);

        // Step 2: Generate visitor pass immediately
        await handleGeneratePass(visitorId);
      } else {
        throw new Error(response?.message || "Failed to submit registration");
      }
    } catch (error) {
      console.error("[API] Error submitting visitor request:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit registration. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePass = async (visitorId) => {
    setGeneratingPass(true);
    setErrorMessage("");

    try {
      const response = await generateVisitorPass({
        visitorId: visitorId,
      });

      if (response.success) {
        // Use the utility function to format pass data
        const formattedPassData = formatPassData(
          formData,
          response.data,
          selectedPurpose,
        );

        setPassData(formattedPassData);
        setIsSubmitted(true);

        // Show pass with animation
        setTimeout(() => {
          setPassVisible(true);
        }, 300);

        // Show action buttons after pass animation
        setTimeout(() => {
          setShowActions(true);
        }, 1000);
      } else {
        throw new Error(response?.message || "Failed to generate pass");
      }
    } catch (error) {
      console.error("[API] Error generating pass:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Error generating visitor pass. Please try again.",
      );
    } finally {
      setGeneratingPass(false);
    }
  };

  const handleDownloadPass = async () => {
    try {
      setErrorMessage("");
      await downloadPassAsImage(passRef, passData, setErrorMessage);

      // Show success message
      setErrorMessage("Pass downloaded successfully!");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("Failed to download pass. Please try again.");
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
    setPassData(null);
    setPassVisible(false);
    setShowActions(false);
    setGeneratedVisitorId(null);
  };

  const handleStepChange = (step) => {
    if (step < 0 || step > 5) return;

    // Check validations before moving
    if (step > activeStep) {
      if (step === 1 && (!formData.verified || !formData.termsAccepted)) {
        setErrorMessage("Please verify phone and accept terms first");
        return;
      }
      if (step === 2 && !formData.photo) {
        setErrorMessage("Please upload a photo first");
        return;
      }
      if (step === 3 && !formData.purpose) {
        setErrorMessage("Please select a purpose");
        return;
      }
      if (step === 4 && !canProceedToMeetingInfo) {
        setErrorMessage("Please fill all personal details");
        return;
      }
      if (step === 5 && !canProceedToReview) {
        setErrorMessage("Please fill all meeting details");
        return;
      }
    }

    setActiveStep(step);
  };

  if (isSubmitted && passData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 2 : 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)",
            animation: `${float} 10s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)",
            animation: `${float} 8s ease-in-out infinite reverse`,
          }}
        />

        <Box
          sx={{
            animation: `${fadeInUp} 1s ease-out`,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            maxWidth: isMobile ? "100%" : "460px",
            mb: 4,
          }}
        >
          <VisitorPass
            passData={passData}
            visible={passVisible}
            downloadRef={passRef}
          />
        </Box>

        <Fade in={showActions} timeout={500}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
              mt: 3,
              animation: `${fadeInUp} 0.5s ease-out`,
            }}
          >
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPass}
              sx={{
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                color: "white",
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                },
              }}
            >
              Download Pass
            </Button>
            <Button
              variant="outlined"
              onClick={handleFillAnother}
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#764ba2",
                  color: "#764ba2",
                  background: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              Register Another
            </Button>
          </Box>
        </Fade>
        {generatingPass && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                background: "white",
                borderRadius: 3,
              }}
            >
              <CircularProgress size={60} sx={{ mb: 2, color: "#667eea" }} />
              <Typography variant="h6" sx={{ color: "#333", fontWeight: 600 }}>
                Generating Visitor Pass...
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Please wait while we create your digital pass
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Main Form View
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        p: isMobile ? 0 : 2,
        pb: isMobile ? 0 : 0,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: isMobile ? "100%" : 500,
          minHeight: isMobile ? "100vh" : "auto",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: isMobile ? 0 : 4,
          boxShadow: isMobile ? "none" : "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <Paper
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "linear-gradient(135deg, #0a1929 0%, #001e3c 100%)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              p: 2,
              borderRadius: 0,
            }}
            elevation={0}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: 40, visibility: "hidden" }} />
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Visitor Registration
              </Typography>
              <Box sx={{ width: 40 }} />
            </Box>

            {/* Progress bar */}
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 6,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${(activeStep / 5) * 100}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)",
                    transition: "width 0.3s ease",
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          </Paper>
        )}

        <CardContent
          sx={{
            p: isMobile ? 2 : 4,
            flex: 1,
            pb: isMobile ? 10 : 4,
          }}
        >
          {!isMobile && (
            <>
              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
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

              {/* Desktop Stepper */}
              <Box sx={{ mb: 4 }}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    "& .MuiStepLabel-root .Mui-completed": {
                      color: "#4caf50",
                    },
                    "& .MuiStepLabel-root .Mui-active": {
                      color: "#2196f3",
                    },
                    "& .MuiStepLabel-root .MuiStepLabel-alternativeLabel": {
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "8px",
                    },
                  }}
                >
                  {STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          "& .MuiStepLabel-label": {
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "0.8rem",
                            "&.Mui-active": {
                              color: "#2196f3",
                              fontWeight: 600,
                            },
                            "&.Mui-completed": {
                              color: "#4caf50",
                            },
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  background: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  "& .MuiAlert-icon": {
                    color: "#f44336",
                  },
                }}
                onClose={() => setErrorMessage("")}
              >
                {errorMessage}
              </Alert>
            </Fade>
          )}

          {/* Step 0: Phone Verification */}
          {activeStep === 0 && (
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    background:
                      "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                    mb: 2,
                    mx: "auto",
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <PhoneIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ color: "white", fontWeight: 600, mb: 1 }}
                >
                  Phone Verification
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    px: isMobile ? 2 : 0,
                  }}
                >
                  Enter your phone number to receive OTP
                </Typography>
              </Box>

              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="10 digit mobile number"
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
                      borderRadius: 3,
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196f3",
                        boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.1)",
                      },
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
                      py: isMobile ? 1.5 : 2,
                      borderRadius: 3,
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      fontWeight: 600,
                      animation: isSendingOtp ? "none" : `${pulse} 2s infinite`,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      },
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <WifiTetheringIcon
                          sx={{ mr: 1, animation: `${shimmer} 1s infinite` }}
                        />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
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
                        placeholder="4 digit code"
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
                            borderRadius: 3,
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
                            py: isMobile ? 1.5 : 2,
                            borderRadius: 3,
                            fontSize: isMobile ? "1rem" : "1.1rem",
                            fontWeight: 600,
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                            },
                          }}
                        >
                          {isVerifying ? (
                            <>
                              <FingerprintIcon
                                sx={{
                                  mr: 1,
                                  animation: `${shimmer} 1s infinite`,
                                }}
                              />
                              Verifying...
                            </>
                          ) : (
                            "Verify OTP"
                          )}
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
                            borderRadius: 3,
                            minWidth: 0,
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
                          borderRadius: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "rgba(76, 175, 80, 0.2)",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <VerifiedUserIcon sx={{ color: "#4caf50" }} />
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{ color: "#4caf50", fontWeight: 600 }}
                          >
                            Phone Verified Successfully!
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
                              "&.Mui-checked": {
                                color: "#2196f3",
                                animation: `${pulse} 1s`,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: isMobile ? "0.9rem" : "1rem",
                            }}
                          >
                            I accept the terms and conditions
                          </Typography>
                        }
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Box>
          )}

          {/* Step 1: Photo Upload */}
          {activeStep === 1 && (
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              {showCamera ? (
                <CameraComponent
                  onCapture={handleCapturePhoto}
                  onCancel={handleCancelCamera}
                  isMobile={isMobile}
                />
              ) : (
                <>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Avatar
                      sx={{
                        width: isMobile ? 60 : 80,
                        height: isMobile ? 60 : 80,
                        background:
                          "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                        mb: 2,
                        mx: "auto",
                        animation: `${float} 3s ease-in-out infinite`,
                      }}
                    >
                      <CameraEnhanceIcon
                        sx={{ fontSize: isMobile ? 40 : 50 }}
                      />
                    </Avatar>
                    <Typography
                      variant={isMobile ? "h5" : "h6"}
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Visitor Photo
                    </Typography>
                  </Box>

                  {!formData.photoPreview ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      {/* Take Photo Button */}
                      <CardActionArea
                        onClick={handleStartCamera}
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          animation: `${glow} 2s infinite`,
                        }}
                      >
                        <Card
                          sx={{
                            background:
                              "linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)",
                            border: "2px dashed rgba(33, 150, 243, 0.5)",
                            p: isMobile ? 4 : 6,
                            textAlign: "center",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%)",
                            },
                          }}
                        >
                          <CameraAltIcon
                            sx={{
                              fontSize: isMobile ? 60 : 80,
                              color: "#2196f3",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ color: "white", fontWeight: 600, mb: 1 }}
                          >
                            Take Photo
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                          >
                            Use camera for instant capture
                          </Typography>
                        </Card>
                      </CardActionArea>

                      {/* Hidden file input for upload */}
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
                          width: isMobile ? 175 : 215,
                          height: isMobile ? 175 : 215,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid #2196f3",
                          position: "relative",
                          animation: `${pulse} 2s infinite`,
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
                            bottom: 10,
                            right: 10,
                            color: "#4caf50",
                            bgcolor: "white",
                            borderRadius: "50%",
                            fontSize: isMobile ? 30 : 40,
                            p: 0.5,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        Photo Ready!
                      </Typography>

                      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={deletePhoto}
                          sx={{
                            color: "#f44336",
                            borderColor: "#f44336",
                            py: isMobile ? 1.25 : 1.5,
                            borderRadius: 3,
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
                            py: isMobile ? 1.25 : 1.5,
                            borderRadius: 3,
                            fontSize: isMobile ? "1rem" : "1.1rem",
                            fontWeight: 600,
                            "&:hover": {
                              background: isUploadingSelfie
                                ? "rgba(33, 150, 243, 0.5)"
                                : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                            },
                          }}
                        >
                          {isUploadingSelfie ? (
                            <>
                              <WifiTetheringIcon
                                sx={{
                                  mr: 1,
                                  animation: `${shimmer} 1s infinite`,
                                }}
                              />
                              Uploading...
                            </>
                          ) : (
                            "Continue"
                          )}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Step 2: Purpose Selection */}
          {activeStep === 2 && (
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 60 : 100,
                    height: isMobile ? 60 : 100,
                    background:
                      "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                    mb: 2,
                    mx: "auto",
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <BusinessCenterIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ color: "white", fontWeight: 600, mb: 1 }}
                >
                  Purpose of Visit
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    px: isMobile ? 2 : 0,
                  }}
                >
                  Select the primary reason for your visit
                </Typography>
              </Box>

              <Grid container spacing={isMobile ? 1.5 : 2}>
                {PURPOSES.map((purpose) => (
                  <Grid item xs={6} key={purpose.id}>
                    <CardActionArea
                      onClick={() => handlePurposeSelect(purpose.id)}
                    >
                      <Card
                        sx={{
                          p: isMobile ? 2 : 3,
                          textAlign: "center",
                          height: "100%",
                          minHeight: isMobile ? 120 : 140,
                          background:
                            formData.purpose === purpose.id
                              ? `linear-gradient(135deg, ${purpose.color}40 0%, ${purpose.color}20 100%)`
                              : "rgba(255, 255, 255, 0.05)",
                          border:
                            formData.purpose === purpose.id
                              ? `2px solid ${purpose.color}`
                              : "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          borderRadius: 3,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${purpose.color}40`,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: isMobile ? 40 : 48,
                            mb: 1.5,
                            animation:
                              formData.purpose === purpose.id
                                ? `${float} 2s ease-in-out infinite`
                                : "none",
                          }}
                        >
                          {purpose.icon}
                        </Typography>
                        <Typography
                          variant={isMobile ? "body2" : "body1"}
                          sx={{
                            color: "white",
                            fontWeight:
                              formData.purpose === purpose.id ? 600 : 400,
                          }}
                        >
                          {purpose.label}
                        </Typography>
                        {formData.purpose === purpose.id && (
                          <Box
                            sx={{
                              mt: 1,
                              width: 24,
                              height: 4,
                              background: purpose.color,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </Card>
                    </CardActionArea>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 3: Personal Details */}
          {activeStep === 3 && (
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 70 : 100,
                    height: isMobile ? 70 : 100,
                    background:
                      "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                    mb: 2,
                    mx: "auto",
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <PersonPinIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ color: "white", fontWeight: 600, mb: 1 }}
                >
                  Personal Details
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    px: isMobile ? 2 : 0,
                  }}
                >
                  Please provide your information
                </Typography>
              </Box>

              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Enter your full name"
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
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196f3",
                        boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Company/Organization"
                  value={formData.company}
                  onChange={handleChange("company")}
                  placeholder="Enter company name"
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
                      borderRadius: 3,
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
                  label="Government ID Number"
                  value={formData.governmentId}
                  onChange={handleChange("governmentId")}
                  placeholder="Aadhar, PAN, Driving License, etc."
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
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleStepChange(activeStep + 1)}
                    disabled={!canProceedToMeetingInfo}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      py: isMobile ? 1.25 : 1.5,
                      borderRadius: 3,
                      fontSize: isMobile ? "1rem" : "1.1rem",
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
                    Continue
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Step 4: Meeting Information */}
          {activeStep === 4 && (
            <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 70 : 100,
                    height: isMobile ? 70 : 100,
                    background:
                      "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                    mb: 2,
                    mx: "auto",
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <MeetingRoomIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ color: "white", fontWeight: 600, mb: 1 }}
                >
                  Meeting Details
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    px: isMobile ? 2 : 0,
                  }}
                >
                  Who are you here to meet?
                </Typography>
              </Box>

              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  fullWidth
                  label="Person to Meet"
                  value={formData.personToMeet}
                  onChange={handleChange("personToMeet")}
                  placeholder="Enter person's name"
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
                      borderRadius: 3,
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196f3",
                        boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
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
                      borderRadius: 3,
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
                            "linear-gradient(135deg, #0a1929 0%, #001e3c 100%)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          marginTop: "4px",
                          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
                          maxHeight: isMobile ? 300 : 400,
                          "& .MuiMenuItem-root": {
                            color: "rgba(255, 255, 255, 0.9)",
                            backgroundColor: "transparent",
                            padding: "12px 16px",
                            "&:hover": {
                              backgroundColor: "rgba(33, 150, 243, 0.2)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(33, 150, 243, 0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.4)",
                              },
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
                      borderRadius: 3,
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
                            "linear-gradient(135deg, #0a1929 0%, #001e3c 100%)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          marginTop: "4px",
                          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
                          "& .MuiMenuItem-root": {
                            color: "rgba(255, 255, 255, 0.9)",
                            backgroundColor: "transparent",
                            padding: "12px 16px",
                            "&:hover": {
                              backgroundColor: "rgba(33, 150, 243, 0.2)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(33, 150, 243, 0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.4)",
                              },
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

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleStepChange(activeStep + 1)}
                    disabled={!canProceedToReview}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      py: isMobile ? 1.25 : 1.5,
                      borderRadius: 3,
                      fontSize: isMobile ? "1rem" : "1.1rem",
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
                </Box>
              </Stack>
            </Box>
          )}

          {/* Step 5: Review */}
          {activeStep === 5 && (
            <Box
              sx={{
                animation: `${fadeInUp} 0.5s ease-out`,
                ...(isMobile && {
                  maxHeight: "calc(100vh - 220px)",
                  overflowY: "auto",
                  pb: 6,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                    marginRight: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(33, 150, 243, 0.3)",
                    borderRadius: "10px",
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                    "&:hover": {
                      background: "rgba(33, 150, 243, 0.5)",
                    },
                  },
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(33, 150, 243, 0.3) transparent",
                  pr: "2px",
                }),
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    background:
                      "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                    mb: 2,
                    mx: "auto",
                  }}
                >
                  <FactCheckIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ color: "white", fontWeight: 600, mb: 1 }}
                >
                  Review & Submit
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    px: isMobile ? 2 : 0,
                  }}
                >
                  Please verify all details before submitting
                </Typography>
              </Box>

              <Stack spacing={2}>
                <ReviewItemMobile
                  label="Phone Number"
                  value={formData.phone}
                  icon={<PhoneIcon />}
                  onEdit={() => handleEdit(0)}
                />
                <ReviewItemMobile
                  label="Visitor Photo"
                  value={selfieResponse ? "Uploaded ✓" : "Not uploaded"}
                  subValue={
                    selfieResponse
                      ? `Visitor ID: ${selfieResponse.visitorId}`
                      : undefined
                  }
                  icon={<CameraAltIcon />}
                  onEdit={() => handleEdit(1)}
                  uploadedPhoto={uploadedPhotoUrl}
                />
                <ReviewItemMobile
                  label="Purpose of Visit"
                  value={selectedPurpose?.label}
                  icon={<BusinessCenterIcon />}
                  onEdit={() => handleEdit(2)}
                  color={selectedPurpose?.color}
                />
                <ReviewItemMobile
                  label="Personal Details"
                  value={formData.fullName}
                  subValue={`${formData.company} | ID: ${formData.governmentId}`}
                  icon={<PersonIcon />}
                  onEdit={() => handleEdit(3)}
                />
                <ReviewItemMobile
                  label="Meeting Details"
                  value={formData.personToMeet}
                  subValue={`${formData.department} | Duration: ${
                    formData.visitDuration
                  } ${formData.visitDuration === "1" ? "Day" : "Days"}`}
                  icon={<MeetingRoomIcon />}
                  onEdit={() => handleEdit(4)}
                />

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selfieResponse}
                    sx={{
                      background:
                        isSubmitting || !selfieResponse
                          ? "rgba(33, 150, 243, 0.5)"
                          : "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                      color: "white",
                      py: isMobile ? 1.25 : 1.5,
                      borderRadius: 3,
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          isSubmitting || !selfieResponse
                            ? "rgba(33, 150, 243, 0.5)"
                            : "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <WifiTetheringIcon
                          sx={{ mr: 1, animation: `${shimmer} 1s infinite` }}
                        />
                        Submitting...
                      </>
                    ) : (
                      "Generate Visitor Pass"
                    )}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </CardContent>

        {!isMobile && (
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
        )}
      </Card>

      {/* Mobile Bottom Navigation */}
      <MobileStepNavigation
        activeStep={activeStep}
        onStepChange={handleStepChange}
        isMobile={isMobile}
      />
    </Box>
  );
}
