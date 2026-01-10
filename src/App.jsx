
import React, { Suspense, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeContextProvider } from "./context/ThemeContext";
import { CircularProgress, Box, Typography } from "@mui/material";

const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Visitors = React.lazy(() => import("./pages/Visitor/Visitors"));
const VisitorForm = React.lazy(() => import("./pages/Visitor/VisitorForm"));
const Management = React.lazy(() => import("./pages/Manage/Management"));
const Passes = React.lazy(() => import("./pages/Passess/GeneratePass"));

const Loader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: (theme) => theme.palette.background.default,
    }}
  >
    <CircularProgress />
  </Box>
);

// Fullscreen wrapper for mobile
const FullscreenWrapper = ({ children }) => {
  useEffect(() => {
    // Apply fullscreen styles
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    // Hide browser UI
    const hideBrowserUI = () => {
      window.scrollTo(0, 1);
    };
    
    hideBrowserUI();
    window.addEventListener('resize', hideBrowserUI);
    window.addEventListener('orientationchange', hideBrowserUI);
    
    return () => {
      window.removeEventListener('resize', hideBrowserUI);
      window.removeEventListener('orientationchange', hideBrowserUI);
    };
  }, []);

  return children;
};

// QR Validation Route
const QrProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);

  useEffect(() => {
    const checkQRValidity = () => {
      // Get QR code from URL params
      const pathParts = location.pathname.split('/');
      const qrCodeFromUrl = pathParts[pathParts.length - 1];
      
      // Check if it's a valid QR code format
      if (qrCodeFromUrl && qrCodeFromUrl.startsWith('VISITOR-')) {
        // Store QR code in session storage for use in form
        sessionStorage.setItem('visitorQRCode', qrCodeFromUrl);
        sessionStorage.setItem('qrTimestamp', Date.now().toString());
        
        // Mark as valid
        setIsValid(true);
        setIsValidating(false);
      } else {
        // Check session storage for recent QR scan
        const storedQR = sessionStorage.getItem('visitorQRCode');
        const storedTime = sessionStorage.getItem('qrTimestamp');
        
        if (storedQR && storedTime) {
          const timeDiff = Date.now() - parseInt(storedTime);
          // QR code valid for 30 minutes
          if (timeDiff < 30 * 60 * 1000) {
            setIsValid(true);
            setIsValidating(false);
            return;
          }
        }
        
        // Invalid or expired QR, redirect to home
        navigate('/');
      }
    };

    // Only validate if we're on register route
    if (location.pathname.includes('/register')) {
      checkQRValidity();
    } else {
      setIsValidating(false);
    }
  }, [location, navigate]);

  if (isValidating) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0a1929",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography sx={{ color: "white" }}>
          Loading registration...
        </Typography>
      </Box>
    );
  }

  if (!isValid) {
    return null; // Will redirect in useEffect
  }

  return (
    <FullscreenWrapper>
      {children}
    </FullscreenWrapper>
  );
};

// Normal protected route for admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ThemeInitializer = () => {
  useEffect(() => {
    const cleanupThemeStorage = () => {
      const validThemes = ["light", "dark"];
      const currentTheme = localStorage.getItem("themeMode") || "light";

      if (!validThemes.includes(currentTheme)) {
        localStorage.setItem("themeMode", "light");
      }

      const inconsistentKeys = ["thememode"];
      inconsistentKeys.forEach((key) => localStorage.removeItem(key));

      if (localStorage.getItem("themeMode")) {
        localStorage.setItem("theme", localStorage.getItem("themeMode"));
      }
    };

    cleanupThemeStorage();
  }, []);

  return null;
};

function App() {
  return (
    <ThemeContextProvider>
      <ThemeInitializer />
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitors"
              element={
                <ProtectedRoute>
                  <Visitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/management"
              element={
                <ProtectedRoute>
                  <Management />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passes"
              element={
                <ProtectedRoute>
                  <Passes/>
                </ProtectedRoute>
              }
            />
            <Route path="/register/:qrCode" element={
              <QrProtectedRoute>
                <VisitorForm />
              </QrProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;