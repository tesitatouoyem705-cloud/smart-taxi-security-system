// QR Code Generator & Encoder Helper Utilities

/**
 * Generates an encrypted/structured payload for a Taxi QR Code
 */
export function createTaxiQRPayload({
  vehicleNumber = "TX-901",
  registrationNumber = "NYC-7842-TX",
  driverName = "Marcus Vance",
  driverId = 2,
  safetyRating = 4.92,
  securityGrade = "A+ (99.8%)"
} = {}) {
  const payload = {
    type: "SAFE_RIDE_AUTHENTICATION",
    code: `QR_${vehicleNumber.replace("-", "_")}_SECURE_AUTH`,
    vehicleNumber,
    registrationNumber,
    driverName,
    driverId,
    safetyRating,
    securityGrade,
    timestamp: new Date().toISOString(),
    signature: `SIG_SHA256_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Generates a Trip Tracking Share URL & Payload
 */
export function createTripShareQRPayload({
  tripId = 1,
  shareToken = "demo-live-share-token-2026",
  pickup = "Times Square Broadway 42nd St",
  dropoff = "Grand Central Terminal Park Ave",
  driverName = "Marcus Vance"
} = {}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5174";
  return `${origin}/trip/shared/${shareToken}`;
}

/**
 * Generates an Emergency Safety Pass QR Payload
 */
export function createEmergencyPassQRPayload({
  userName = "Elena Rostova",
  emergencyPhone = "+1 (555) 998-1122",
  bloodType = "O+",
  emergencyContact = "David Rostova"
} = {}) {
  const payload = {
    type: "EMERGENCY_MEDICAL_SAFETY_PASS",
    userName,
    emergencyPhone,
    bloodType,
    emergencyContact,
    issuedAt: new Date().toISOString()
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Downloads a rendered QR Code as a PNG image
 */
export function downloadQRCodePNG(canvasOrSvgElementId, filename = "saferide-qr.png") {
  try {
    const container = document.getElementById(canvasOrSvgElementId);
    if (!container) return false;

    const canvas = container.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      return true;
    }

    const svg = container.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = 400;
        offscreenCanvas.height = 400;
        const ctx = offscreenCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);

        DOMURL.revokeObjectURL(url);
        const link = document.createElement("a");
        link.download = filename;
        link.href = offscreenCanvas.toDataURL("image/png");
        link.click();
      };
      img.src = url;
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error downloading QR Code:", e);
    return false;
  }
}
