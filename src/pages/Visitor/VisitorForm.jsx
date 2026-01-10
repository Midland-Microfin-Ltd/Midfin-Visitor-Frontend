import React, { useState, useRef, useEffect, useCallback, memo } from "react";
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
  AppBar,
  Toolbar,
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
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  sendOtp,
  verifyOtp,
  submitVisitorSelfie,
  submitVisitorRequest,
} from "../../utilities/apiUtils/apiHelper";

// ============ ADDED: Page Title Configuration ============
const PAGE_TITLES = {
  default: "Visitor Registration Tool",
  verification: "Visitor Tool - Phone Verification",
  photo: "Visitor Tool - Take Photo",
  purpose: "Visitor Tool - Purpose",
  details: "Visitor Tool - Details",
  meeting: "Visitor Tool - Meeting Info",
  review: "Visitor Tool - Review",
  success: "Visitor Tool - Registration Complete",
};
// =========================================================

// Memoized components for better performance
const PurposesGrid = memo(({ purposes, selectedPurpose, onSelect }) => (
  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
    {purposes.map((purpose) => (
      <Grid item xs={6} key={purpose.id}>
        <Paper
          onClick={() => onSelect(purpose.id)}
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            textAlign: "center",
            cursor: "pointer",
            background:
              selectedPurpose === purpose.id
                ? "linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(3, 169, 244, 0.2) 100%)"
                : "rgba(255, 255, 255, 0.05)",
            border:
              selectedPurpose === purpose.id
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
          <Typography sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }}>
            {purpose.icon}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontWeight: selectedPurpose === purpose.id ? 600 : 400,
              fontSize: "0.9rem",
            }}
          >
            {purpose.label}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
));

const ReviewItem = memo(({ label, value, subValue, onEdit, uploadedPhoto }) => (
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
      <Typography
        variant="caption"
        sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.8rem" }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: "white", fontWeight: 500, fontSize: "0.95rem" }}>
        {value}
      </Typography>
      {subValue && (
        <Typography
          variant="body2"
          sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}
        >
          {subValue}
        </Typography>
      )}
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
            sx={{
              color: "#2196f3",
              display: "block",
              mt: 0.5,
              fontSize: "0.7rem",
            }}
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
));

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

// Optimized Camera component with lazy loading
const CameraComponent = memo(({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error accessing camera:", err);
          setError("Unable to access camera. Please check camera permissions.");
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL("image/jpeg", 0.8); // Reduced quality for performance

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      onCapture(photoData);
    }
  }, [stream, onCapture]);

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
        {isLoading && (
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
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <Typography sx={{ color: "white" }}>Loading camera...</Typography>
          </Box>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
            transform: "scaleX(-1)",
            backgroundColor: "#000",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CameraAltIcon />}
          onClick={capturePhoto}
          disabled={isLoading}
          sx={{
            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            color: "white",
          }}
        >
          {isLoading ? "Loading..." : "Capture Photo"}
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
});

// Main VisitorForm component with performance optimizations
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
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // ============ ADDED: Dynamic Page Title Updater ============
  useEffect(() => {
    const updatePageTitle = () => {
      let title = PAGE_TITLES.default;

      if (isSubmitted) {
        title = PAGE_TITLES.success;
      } else {
        switch (activeStep) {
          case 0:
            title = PAGE_TITLES.verification;
            break;
          case 1:
            title = PAGE_TITLES.photo;
            break;
          case 2:
            title = PAGE_TITLES.purpose;
            break;
          case 3:
            title = PAGE_TITLES.details;
            break;
          case 4:
            title = PAGE_TITLES.meeting;
            break;
          case 5:
            title = PAGE_TITLES.review;
            break;
          default:
            title = PAGE_TITLES.default;
        }
      }

      // Update document title
      document.title = title;

      // Update meta tags for better sharing
      updateMetaTags(title);

      // Update history state to hide URL parameters
      updateHistoryState(title);
    };

    const updateMetaTags = (title) => {
      // Update Open Graph tags for better sharing
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');

      if (ogTitle) ogTitle.setAttribute("content", title);
      if (ogDescription)
        ogDescription.setAttribute("content", "Visitor Registration System");
      if (twitterTitle) twitterTitle.setAttribute("content", title);
    };

    const updateHistoryState = (title) => {
      // Clean URL in history to hide parameters
      if (window.history?.replaceState) {
        try {
          // Create a clean URL without hash parameters
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, title, cleanUrl);

          // Also update the page state for PWA
          if (
            window.navigator.standalone ||
            window.matchMedia("(display-mode: standalone)").matches
          ) {
            // In PWA mode, ensure title is clean
            document.title = "Visitor Tool";
          }
        } catch (error) {
          console.warn("Could not update history state:", error);
        }
      }
    };

    updatePageTitle();

    // Also update periodically to ensure title stays correct
    const titleInterval = setInterval(updatePageTitle, 2000);

    return () => {
      clearInterval(titleInterval);
      // Restore original title on unmount
      document.title = "Visitor Registration Tool";
    };
  }, [activeStep, isSubmitted]);
  // =========================================================

  // Performance: Debounce scroll events
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Smooth scrolling optimization
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.willChange = "transform";
        }
      }, 100);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Optimized useEffect for initial setup
  useEffect(() => {
    // ============ ADDED: Initial URL & Title Setup ============
    // Set initial document title
    document.title = "Visitor Registration Tool";

    // Update meta tags for PWA
    const metaTags = [
      { name: "application-name", content: "Visitor Tool" },
      { name: "apple-mobile-web-app-title", content: "Visitor Tool" },
      { property: "og:title", content: "Visitor Tool" },
      { property: "og:description", content: "Visitor Registration System" },
      { property: "og:type", content: "website" },
    ];

    metaTags.forEach((tag) => {
      let element = document.querySelector(
        `[${tag.name ? "name" : "property"}="${tag.name || tag.property}"]`
      );
      if (!element) {
        element = document.createElement("meta");
        if (tag.name) element.name = tag.name;
        if (tag.property) element.setAttribute("property", tag.property);
        if (tag.content) element.content = tag.content;
        document.head.appendChild(element);
      } else if (tag.content) {
        element.content = tag.content;
      }
    });
    // =========================================================

    // Get QR code
    const storedQR = sessionStorage.getItem("visitorQRCode");
    if (storedQR) {
      setQrCode(storedQR);
    } else {
      const path = window.location.hash;
      const match = path.match(/\/register\/(VISITOR-[A-Z0-9]+-[0-9]+)/);
      if (match?.[1]) {
        setQrCode(match[1]);
        sessionStorage.setItem("visitorQRCode", match[1]);
        sessionStorage.setItem("qrTimestamp", Date.now().toString());
      }
    }

    // Mobile optimization functions
    const optimizeMobileExperience = () => {
      // Set proper viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      document.body.style.height = `${window.innerHeight}px`;

      // Hide URL bar (works on iOS/Android)
      setTimeout(() => window.scrollTo(0, 1), 100);
      setTimeout(() => window.scrollTo(0, 1), 500);

      // Enable hardware acceleration
      document.documentElement.style.transform = "translateZ(0)";
      document.documentElement.style.backfaceVisibility = "hidden";

      // Optimize scrolling performance
      document.body.style.overflow = "hidden";
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.webkitOverflowScrolling = "touch";
        scrollContainerRef.current.style.overscrollBehavior = "contain";
      }
    };

    // Prevent pull-to-refresh with passive listeners
    const preventPullToRefresh = (e) => {
      if (window.scrollY === 0 && e.touches[0].pageY > 10) {
        e.preventDefault();
      }
    };

    // Initialize
    optimizeMobileExperience();
    setIsLoading(false);

    // Add event listeners
    const events = ["resize", "orientationchange"];
    events.forEach((event) =>
      window.addEventListener(event, optimizeMobileExperience)
    );

    // Use passive listeners for better performance
    document.addEventListener("touchmove", preventPullToRefresh, {
      passive: false,
    });

    // ============ ADDED: Browser UI Hiding ============
    // Hide browser UI on mobile
    const hideBrowserUI = () => {
      // For iOS Safari
      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 100);
      }

      // For Android Chrome
      if (navigator.userAgent.match(/Android/i)) {
        document.body.style.minHeight = "100vh";
        document.body.style.minHeight = "-webkit-fill-available";
      }

      // Update title to simple version for URL bar
      setTimeout(() => {
        document.title = "Visitor Tool";
      }, 50);
    };

    hideBrowserUI();
    window.addEventListener("focus", hideBrowserUI);
    // ==================================================

    // Cleanup
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, optimizeMobileExperience)
      );
      document.removeEventListener("touchmove", preventPullToRefresh);
      window.removeEventListener("focus", hideBrowserUI);

      // Restore original title
      document.title = "VMS";
    };
  }, []);

  // Derived values - memoized
  const selectedPurpose = PURPOSES.find((p) => p.id === formData.purpose);
  const canProceedToMeetingInfo = useCallback(
    () => formData.fullName && formData.company && formData.governmentId,
    [formData.fullName, formData.company, formData.governmentId]
  );
  const canProceedToReview = useCallback(
    () =>
      formData.personToMeet && formData.department && formData.visitDuration,
    [formData.personToMeet, formData.department, formData.visitDuration]
  );

  // Format phone number
  const formatPhoneNumber = useCallback(
    (phone) => phone.replace(/\D/g, ""),
    []
  );

  // Optimized handlers with useCallback
  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    setErrorMessage("");
  }, []);

  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setFormData((prev) => ({ ...prev, otp: value }));
    setErrorMessage("");
  }, []);

  const handleSendOtp = useCallback(async () => {
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
        setFormData((prev) => ({ ...prev, otpSent: true }));
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
  }, [formData.phone, formatPhoneNumber]);

  const handleResendOtp = useCallback(() => {
    if (resendCountdown > 0) return;
    handleSendOtp();
  }, [resendCountdown, handleSendOtp]);

  const handleVerifyOtp = useCallback(async () => {
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
        setFormData((prev) => ({ ...prev, verified: true }));
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
  }, [formData.otp, txnId]);

  const handleTermsChange = useCallback(
    (e) => {
      const newTermsAccepted = e.target.checked;
      setFormData((prev) => ({ ...prev, termsAccepted: newTermsAccepted }));

      if (newTermsAccepted && formData.verified) {
        setTimeout(() => setActiveStep(1), 500);
      }
    },
    [formData.verified]
  );

  // Camera handlers
  const handleStartCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleCancelCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleCapturePhoto = useCallback((photoData) => {
    fetch(photoData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: photoData,
        }));
        setShowCamera(false);
      })
      .catch((err) => {
        console.error("Error converting photo:", err);
        setErrorMessage("Failed to capture photo. Please try again.");
        setShowCamera(false);
      });
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage("Please select a valid image file.");
    }
  }, []);

  // Upload selfie API call
  const uploadSelfie = useCallback(async () => {
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
  }, [formData.photo]);

  const deletePhoto = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      photo: null,
      photoPreview: null,
    }));
    setSelfieResponse(null);
    setUploadedPhotoUrl(null);
  }, []);

  const handlePhotoContinue = useCallback(async () => {
    if (!formData.photo) {
      setErrorMessage("Please take or upload a photo first.");
      return;
    }

    const uploadSuccess = await uploadSelfie();

    if (uploadSuccess) {
      setActiveStep(2);
    }
  }, [formData.photo, uploadSelfie]);

  const handlePurposeSelect = useCallback((purposeId) => {
    setFormData((prev) => ({ ...prev, purpose: purposeId }));
    setTimeout(() => setActiveStep(3), 300); // Reduced timeout for smoother transition
  }, []);

  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleEdit = useCallback((step) => {
    setActiveStep(step);
  }, []);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  // ============ ADDED: Enhanced Submit Handler with Title Update ============
  const handleSubmit = useCallback(async () => {
    if (!selfieResponse || !selfieResponse.visitorId) {
      setErrorMessage("Please upload a photo before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // Update title to show submitting state
    document.title = "Visitor Tool - Submitting...";

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
      qrCode: qrCode || "",
    };

    try {
      const response = await submitVisitorRequest(
        selfieResponse.visitorId,
        visitorData
      );

      if (response?.success || response?.data?.success) {
        // Update title to success state
        document.title = "Visitor Tool - Registration Complete";

        setIsSubmitted(true);
        sessionStorage.removeItem("visitorQRCode");
        sessionStorage.removeItem("qrTimestamp");
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
      // Restore title on error
      document.title = "Visitor Tool - Review";
    } finally {
      setIsSubmitting(false);
    }
  }, [selfieResponse, formData, selectedPurpose, qrCode]);
  // ==========================================================================

  const handleFillAnother = useCallback(() => {
    setIsSubmitted(false);
    setActiveStep(0);
    setFormData(INITIAL_FORM_DATA);
    setTxnId("");
    setResendCountdown(0);
    setErrorMessage("");
    setShowCamera(false);
    setSelfieResponse(null);
    setUploadedPhotoUrl(null);
    // Reset title
    document.title = "Visitor Tool - Phone Verification";
  }, []);

  const handleClose = useCallback(() => {
    sessionStorage.removeItem("visitorQRCode");
    sessionStorage.removeItem("qrTimestamp");
    window.close();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a1929",
        }}
      >
        <Typography sx={{ color: "white" }}>Loading Visitor Tool...</Typography>
      </Box>
    );
  }

  if (isSubmitted) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          backgroundColor: "#0a1929",
          background:
            "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
          height: "100vh",
          height: "calc(var(--vh, 1vh) * 100)",
          overflow: "hidden",
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
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              sx={{
                mt: 2,
                color: "rgba(255, 255, 255, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              Close
            </Button>
          </Card>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a1929",
        background:
          "linear-gradient(135deg, #0a1929 0%, #001e3c 50%, #0d47a1 100%)",
        height: "100vh",
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
        transform: "translateZ(0)", // Hardware acceleration
        willChange: "transform",
      }}
    >
      {/* App-like Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "rgba(0, 30, 60, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          {activeStep > 0 ? (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 48 }} />
          )}

          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: "center",
              fontWeight: 600,
              background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {activeStep === 0 && "Phone Verification"}
            {activeStep === 1 && "Take Photo"}
            {activeStep === 2 && "Visit Purpose"}
            {activeStep === 3 && "Personal Details"}
            {activeStep === 4 && "Meeting Info"}
            {activeStep === 5 && "Review & Submit"}
          </Typography>

          <IconButton edge="end" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress Bar - Fixed height */}
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {STEPS.map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  index <= activeStep
                    ? index === activeStep
                      ? "#2196f3"
                      : "#4caf50"
                    : "rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 0.5,
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.7rem",
          }}
        >
          Step {activeStep + 1} of {STEPS.length}
        </Typography>
      </Box>

      {/* Main Content with optimized scrolling */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          WebkitOverflowScrolling: "touch", // iOS momentum scrolling
          overscrollBehavior: "contain", // Prevent overscroll effects
          transform: "translateZ(0)", // Hardware acceleration
          willChange: "scroll-position",
          p: { xs: 2, sm: 3 },
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 600,
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: { xs: 2, sm: 3 },
            transform: "translateZ(0)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Error Message */}
            {errorMessage && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    color: "#ff6b6b",
                  }}
                  onClose={() => setErrorMessage("")}
                >
                  {errorMessage}
                </Alert>
              </Fade>
            )}

            {/* Step 0: Phone Verification */}
            {activeStep === 0 && (
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Verify Your Phone
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
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
                        fontSize: "1rem",
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
                        fontSize: "0.95rem",
                      },
                    }}
                  />

                  {!formData.otpSent &&
                    !formData.verified &&
                    formData.phone && (
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
                          fontSize: "1rem",
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
                              fontSize: "1rem",
                              "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.2)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(33, 150, 243, 0.5)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: "0.95rem",
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
                              fontSize: "1rem",
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
                              fontSize: "0.9rem",
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
                              sx={{
                                color: "#4caf50",
                                fontWeight: 600,
                                fontSize: "1rem",
                              }}
                            >
                              Phone Verified!
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: "0.85rem",
                              }}
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
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: "0.95rem",
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
              </Zoom>
            )}

            {/* Step 1: Photo Upload */}
            {activeStep === 1 && (
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Upload Your Photo
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
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
                            sx={{
                              color: "white",
                              textAlign: "center",
                              fontSize: "0.95rem",
                            }}
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
                              sx={{
                                px: 2,
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: "0.9rem",
                              }}
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
                              fontSize: "1rem",
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
                                fontSize: "0.95rem",
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
                                fontSize: "1rem",
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
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Purpose of Visit
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Select the reason for your visit today
                    </Typography>
                  </Box>

                  <PurposesGrid
                    purposes={PURPOSES}
                    selectedPurpose={formData.purpose}
                    onSelect={handlePurposeSelect}
                  />
                </Box>
              </Zoom>
            )}

            {/* Step 3: Personal Details */}
            {activeStep === 3 && (
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Personal Details
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
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
                          fontSize: "1rem",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(33, 150, 243, 0.5)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.95rem",
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
                          fontSize: "1rem",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(33, 150, 243, 0.5)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.95rem",
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
                          fontSize: "1rem",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(33, 150, 243, 0.5)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.95rem",
                        },
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setActiveStep(4)}
                      disabled={!canProceedToMeetingInfo()}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        mt: 2,
                        background:
                          "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                        color: "white",
                        p: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
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
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Meeting Information
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
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
                          fontSize: "1rem",
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
                          fontSize: "0.95rem",
                          "&.Mui-focused": { color: "#2196f3" },
                        },
                      }}
                    />

                    <FormControl fullWidth>
                      <InputLabel
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.95rem",
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
                          fontSize: "1rem",
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
                                fontSize: "0.95rem",
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
                              fontSize: "0.95rem",
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
                          fontSize: "0.95rem",
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
                          fontSize: "1rem",
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
                                fontSize: "0.95rem",
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
                      disabled={!canProceedToReview()}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        mt: 2,
                        background:
                          "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                        color: "white",
                        p: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
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
              <Zoom in timeout={300}>
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
                      variant="h5"
                      sx={{ color: "white", fontWeight: 600, mb: 1 }}
                    >
                      Review Your Information
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.9rem",
                      }}
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
                        fontSize: "1rem",
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
              sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}
            >
              Powered by Midland Microfin Limited
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
