export const determineHost = () => {
  const hostEnvironment = import.meta.env.VITE_ENVIRONMENT;
  const hostDomain = import.meta.env.VITE_HOST_DOMAIN;
  
  if (hostEnvironment === "development" && window.location.hostname === "localhost") {
    return "http://localhost:5678";
  } else {
    return `https://${hostDomain}`; 
  }
};

export const networkError = { 
  errorCode: "networkError", 
  errorDescription: "Please check your internet connection!" 
};

export const redirectOnTokenExpiry = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userData");
  
  window.location.href = window.location.origin + "/login";
};