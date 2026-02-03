import React, { Suspense, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeContextProvider } from "./context/ThemeContext";
import { CircularProgress, Box } from "@mui/material";

const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Visitors = React.lazy(() => import("./pages/Visitor/Visitors"));
const VisitorForm = React.lazy(() => import("./pages/Visitor/VisitorForm"));
const Management = React.lazy(() => import("./pages/Manage/Management"));
const Passes = React.lazy(() => import("./pages/Passess/GeneratePass"));
const StatusPass = React.lazy(() => import("./pages/statuspass"));

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
            <Route path="/statuspass/:passId" element={<StatusPass />} /> 
            <Route path="/statuspass" element={<StatusPass />} /> 
            <Route path="/register/:qrCode" element={<VisitorForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;