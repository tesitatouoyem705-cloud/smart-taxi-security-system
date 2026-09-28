/**
 * Gemini AI Safety Assistant Service
 * Provides AI safety tips, emergency chat analysis, incident classification, and interactive guidance.
 */

async function chatWithGemini(message, context = {}) {
  const userMessage = (message || "").trim();
  const lower = userMessage.toLowerCase();

  // 1. Emergency Panic Detection
  const emergencyKeywords = ["help", "danger", "emergency", "attack", "kidnap", "accident", "harass", "weapon", "scared", "threat", "kill", "deviat", "speeding", "hostage"];
  const isEmergency = emergencyKeywords.some((kw) => lower.includes(kw));

  // 2. If Gemini API Key is provided, attempt live call
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are the Smart Urban Taxi AI Security Assistant. Context: ${JSON.stringify(context)}. User says: "${userMessage}". Keep answer concise, empathetic, safety-focused, actionable. If emergency, instruct immediate SOS.`
                  }
                ]
              }
            ]
          })
        }
      );
      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) {
        return {
          reply: replyText,
          isEmergency,
          suggestedActions: isEmergency ? ["TRIGGER_SOS", "SHARE_TRIP", "CALL_POLICE"] : ["VIEW_SAFETY_SCORE", "SHARE_LIVE_TRIP", "REPORT_INCIDENT"]
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart local safety AI engine:", err.message);
    }
  }

  // 3. Fallback Smart Safety Knowledge Engine
  if (isEmergency) {
    return {
      reply: "🚨 **EMERGENCY DETECTED**: Your safety is our highest priority! Please press the **Red SOS Button** at the top right immediately to broadcast your live GPS to Central Security and emergency contacts. If you are in immediate physical danger, stay calm, note landmarks, and call emergency services (911/112).",
      isEmergency: true,
      suggestedActions: ["TRIGGER_SOS", "SHARE_TRIP", "CALL_POLICE"]
    };
  }

  if (lower.includes("qr") || lower.includes("scan") || lower.includes("verify")) {
    return {
      reply: "To verify your taxi, tap **'Scan QR'** on your dashboard or Live Trip page to scan the driver's onboard QR code. This validates the driver's license, vehicle registration, and safety accreditation in real time.",
      isEmergency: false,
      suggestedActions: ["SCAN_QR", "SHARE_TRIP"]
    };
  }

  if (lower.includes("share") || lower.includes("family") || lower.includes("contact")) {
    return {
      reply: "You can securely share your real-time journey with friends or family by tapping **'Share Trip'**. It generates a secure encrypted live-tracking link with real-time GPS coordinates and driver info.",
      isEmergency: false,
      suggestedActions: ["SHARE_TRIP", "MANAGE_CONTACTS"]
    };
  }

  if (lower.includes("report") || lower.includes("incident") || lower.includes("lost") || lower.includes("complaint")) {
    return {
      reply: "You can file an incident report right from the **Report Incident** page. You can attach photos, pinpoint the exact GPS location on the map, and select severity levels. High-severity reports immediately notify system administrators.",
      isEmergency: false,
      suggestedActions: ["REPORT_INCIDENT"]
    };
  }

  if (lower.includes("fare") || lower.includes("price") || lower.includes("cost")) {
    return {
      reply: "All fares are transparently calculated based on base rate + distance ($2.50 base + $1.80/km). Night fares or dynamic security escorts have clear upfront estimates before booking.",
      isEmergency: false,
      suggestedActions: ["BOOK_RIDE"]
    };
  }

  return {
    reply: "Hello! I am your **Smart Urban Taxi AI Safety Guardian**. I monitor your trip telemetry, detect deviations, provide safety guidance, and coordinate emergency SOS dispatches. How can I assist your ride today?",
    isEmergency: false,
    suggestedActions: ["BOOK_RIDE", "SHARE_TRIP", "VIEW_SAFETY_SCORE", "REPORT_INCIDENT"]
  };
}

module.exports = { chatWithGemini };