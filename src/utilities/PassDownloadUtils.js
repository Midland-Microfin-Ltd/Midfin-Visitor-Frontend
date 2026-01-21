// utilities/PassDownloadUtils.js
import html2canvas from "html2canvas";

/**
 * Utility functions for downloading Visitor Pass as image
 */

/**
 * Downloads a Visitor Pass as PNG image
 * @param {React.RefObject} passRef - Reference to the pass component
 * @param {Object} passData - Pass data for filename
 * @param {Function} showSnackbar - Optional function to show notifications
 * @returns {Promise<boolean>} - Success status
 */
export const downloadPassAsImage = async (passRef, passData, showSnackbar = null) => {
  try {
    // Use the ref to get the pass component
    const cardElement = passRef.current;
    if (!cardElement) {
      if (showSnackbar) {
        showSnackbar("Pass card not found!", "error");
      }
      return false;
    }

    // Clone the card element for manipulation
    const clonedCard = cardElement.cloneNode(true);
    clonedCard.style.position = "fixed";
    clonedCard.style.top = "0";
    clonedCard.style.left = "0";
    clonedCard.style.zIndex = "9999";
    clonedCard.style.transform = "scale(1)";
    clonedCard.style.boxShadow = "0 25px 70px rgba(102, 126, 234, 0.4)";
    clonedCard.style.visibility = "visible";
    clonedCard.style.opacity = "1";
    clonedCard.style.width = "460px";
    clonedCard.style.maxWidth = "460px";

    document.body.appendChild(clonedCard);

    // Create canvas from the element
    const canvas = await html2canvas(clonedCard, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true,
      imageTimeout: 0,
      removeContainer: true,
      width: 460,
      height: clonedCard.offsetHeight,
      windowWidth: 460,
      windowHeight: clonedCard.offsetHeight,
    });

    // Clean up the cloned element
    document.body.removeChild(clonedCard);

    // Convert to data URL and trigger download
    const imageData = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `visitor-pass-${passData?.passNumber || "pass"}-${
      new Date().toISOString().split("T")[0]
    }.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message if callback provided
    if (showSnackbar) {
      showSnackbar("Pass image downloaded successfully!", "success");
    }

    return true;
  } catch (error) {
    console.error("Error downloading pass image:", error);
    
    if (showSnackbar) {
      showSnackbar("Error downloading pass image", "error");
    }
    
    return false;
  }
};

/**
 * Opens the Visitor Pass in a new tab for printing
 * @param {React.RefObject} passRef - Reference to the pass component
 * @param {Object} passData - Pass data
 */
export const printPass = (passRef, passData) => {
  try {
    const cardElement = passRef.current;
    if (!cardElement) {
      console.error("Pass card not found for printing");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const cardHTML = cardElement.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visitor Pass - ${passData?.passNumber || 'Pass'}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .print-container {
              transform: scale(1);
              page-break-inside: avoid;
            }
            @media print {
              body {
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">${cardHTML}</div>
          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Pass
            </button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
  } catch (error) {
    console.error("Error printing pass:", error);
    alert("Error opening print preview. Please try downloading the pass instead.");
  }
};

/**
 * Formats pass data for display
 * @param {Object} formData - Form data from the form
 * @param {Object} apiData - Additional data from API response
 * @param {Object} selectedPurpose - Selected purpose object
 * @returns {Object} Formatted pass data
 */
export const formatPassData = (formData, apiData = {}, selectedPurpose = null) => {
  const now = new Date();
  const visitDuration = parseInt(formData.visitDuration || 1);
  const endDate = new Date(now.getTime() + visitDuration * 24 * 60 * 60 * 1000);

  return {
    passNumber: `VP-${Math.floor(100000 + Math.random() * 900000)}`,
    fullName: formData.fullName || apiData.visitorName || "",
    contactNumber: formData.phone || apiData.phoneNo || "",
    govtId: formData.governmentId || apiData.governmentId || "ID Not Provided",
    purposeOfVisit: selectedPurpose?.label || formData.purpose || apiData.purposeOfVisit || "Other",
    personToMeet: formData.personToMeet || apiData.personToMeet || "",
    validFrom: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    validTill: endDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    ...apiData, // Include any additional data from API
  };
};

/**
 * Generates initials from a name for avatars
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const names = name.trim().split(" ");
  let initials = "";
  for (let i = 0; i < Math.min(2, names.length); i++) {
    if (names[i].length > 0) {
      initials += names[i][0].toUpperCase();
    }
  }
  return initials || "?";
};