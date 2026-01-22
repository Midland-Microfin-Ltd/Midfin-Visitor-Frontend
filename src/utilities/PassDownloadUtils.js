import html2canvas from "html2canvas";

/**
/**
 * @param {React.RefObject} passRef 
 * @param {Object} passData 
 * @param {Function} showSnackbar 
 * @returns {Promise<boolean>} 
 */
export const downloadPassAsImage = async (
  passRef,
  passData,
  showSnackbar = null,
) => {
  try {
    const cardElement = passRef.current;
    if (!cardElement) {
      showSnackbar?.("Pass card not found!", "error");
      return false;
    }

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const clonedCard = cardElement.cloneNode(true);

    clonedCard.style.position = "absolute";
    clonedCard.style.top = "-10000px";
    clonedCard.style.left = "-10000px";
    clonedCard.style.width = "460px";
    clonedCard.style.maxWidth = "460px";
    clonedCard.style.opacity = "1";
    clonedCard.style.visibility = "visible";
    clonedCard.style.transform = "none";
    clonedCard.style.background = "#ffffff";
    clonedCard.style.boxShadow = "none";

    document.body.appendChild(clonedCard);

    const canvas = await html2canvas(clonedCard, {
      scale: Math.min(window.devicePixelRatio || 2, 2),
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 460,
      width: 460,
      height: clonedCard.offsetHeight,
    });

    document.body.removeChild(clonedCard);

    const imageData = canvas.toDataURL("image/png", 1.0);

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `visitor-pass-${passData?.passNumber || "pass"}-${
      new Date().toISOString().split("T")[0]
    }.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSnackbar?.("Pass image downloaded successfully!", "success");
    return true;
  } catch (error) {
    console.error("Download error:", error);
    showSnackbar?.("Error downloading pass image", "error");
    return false;
  }
};

/**
 * @param {React.RefObject} passRef
 * @param {Object} passData
 */
export const printPass = (passRef, passData) => {
  try {
    const cardElement = passRef.current;
    if (!cardElement) {
      console.error("Pass card not found for printing");
      return;
    }

    const printWindow = window.open("", "_blank");
    const cardHTML = cardElement.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visitor Pass - ${passData?.passNumber || "Pass"}</title>
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
    alert(
      "Error opening print preview. Please try downloading the pass instead.",
    );
  }
};

/**
 * @param {Object} formData
 * @param {Object} apiData
 * @param {Object} selectedPurpose
 * @returns {Object}
 */
export const formatPassData = (
  formData,
  apiData = {},
  selectedPurpose = null,
) => {
  const now = new Date();
  const visitDuration = parseInt(formData.visitDuration || 1);
  const endDate = new Date(now.getTime() + visitDuration * 24 * 60 * 60 * 1000);

  return {
    passNumber: `VP-${Math.floor(100000 + Math.random() * 900000)}`,
    fullName: formData.fullName || apiData.visitorName || "",
    contactNumber: formData.phone || apiData.phoneNo || "",
    govtId: formData.governmentId || apiData.governmentId || "ID Not Provided",
    purposeOfVisit:
      selectedPurpose?.label ||
      formData.purpose ||
      apiData.purposeOfVisit ||
      "Other",
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
    ...apiData,
  };
};

/**
 * @param {string} name
 * @returns {string}
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
