export const determineHost = () => {
  const hostEnvironment = import.meta.env.VITE_ENVIRONMENT;
  const hostDomain = import.meta.env.VITE_HOST_DOMAIN;
  
  if (hostEnvironment === "development" && window.location.hostname === "localhost") {
    return "http://localhost:5678";
  } else {
    return `https://${hostDomain}`; 
  }
};

export const transformImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
  
  // If the image URL contains localhost:5678, replace it with the production host
  if (imageUrl.includes('localhost:5678')) {
    const productionHost = determineHost();
    return imageUrl.replace('http://localhost:5678', productionHost);
  }
  
  return imageUrl;
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