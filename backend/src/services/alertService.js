const twilio = require("twilio");

async function sendIncidentAlert(message, toPhoneNumber = null) {
  const targetPhone = toPhoneNumber || process.env.ALERT_TO_PHONE_NUMBER;
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER || !targetPhone) {
    console.log(`[AlertService SIMULATION] SMS to ${targetPhone || 'Central Dispatch'}: "${message}"`);
    return { sent: true, simulated: true, to: targetPhone, message };
  }
  
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: targetPhone
    });
    return { sent: true, sid: result.sid, to: targetPhone };
  } catch (err) {
    console.error(`[AlertService ERROR] Failed to send SMS to ${targetPhone}:`, err.message);
    return { sent: false, error: err.message, to: targetPhone };
  }
}

async function triggerVoiceCall(message, toPhoneNumber) {
  if (!toPhoneNumber) return { sent: false, reason: "No phone number provided" };

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[AlertService VOICE CALL SIMULATION] Calling ${toPhoneNumber}: "${message}"`);
    return { sent: true, simulated: true, type: "CALL", to: toPhoneNumber };
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const twiml = `<Response><Say voice="alice" language="en-US">${message}</Say></Response>`;
    const call = await client.calls.create({
      twiml: twiml,
      to: toPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return { sent: true, sid: call.sid, type: "CALL", to: toPhoneNumber };
  } catch (err) {
    console.error(`[AlertService VOICE CALL ERROR] Failed to call ${toPhoneNumber}:`, err.message);
    return { sent: false, error: err.message, to: toPhoneNumber };
  }
}

async function notifyEmergencyContacts(user, sosData = {}) {
  const contactsNotified = [];
  
  if (!user || !user.emergencyContacts) {
    return contactsNotified;
  }

  let contacts = [];
  try {
    contacts = typeof user.emergencyContacts === "string" 
      ? JSON.parse(user.emergencyContacts) 
      : user.emergencyContacts;
  } catch (e) {
    console.error("[AlertService] Error parsing emergency contacts:", e);
    return contactsNotified;
  }

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return contactsNotified;
  }

  const lat = sosData.latitude || 3.8480;
  const lng = sosData.longitude || 11.5021;
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const userName = user.name || "SafeRide User";
  const customMessage = sosData.message || "EMERGENCY SOS ALERT: Immediate assistance required!";

  const smsMessage = `🚨 [SafeRide SOS ALERT] ${userName} has triggered an EMERGENCY PANIC SIGNAL! Message: "${customMessage}". Live GPS Location: ${mapsUrl}`;
  const voiceMessage = `Emergency SOS Alert from SafeRide Security System. Passenger ${userName} has triggered a distress signal. Live location coordinates have been dispatched to your phone via SMS. Please check immediately.`;

  for (const contact of contacts) {
    if (contact.phone) {
      console.log(`[SOS Dispatch] Triggering SMS & Auto Call to emergency contact: ${contact.name} (${contact.phone})`);
      
      // Send SMS
      const smsRes = await sendIncidentAlert(smsMessage, contact.phone);
      
      // Trigger Automated Emergency Voice Call
      const callRes = await triggerVoiceCall(voiceMessage, contact.phone);

      contactsNotified.push({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || "Contact",
        smsStatus: smsRes.sent ? (smsRes.simulated ? "SIMULATED_SMS" : "SMS_SENT") : "SMS_FAILED",
        callStatus: callRes.sent ? (callRes.simulated ? "SIMULATED_CALL" : "CALL_INITIATED") : "CALL_FAILED",
        timestamp: new Date().toISOString()
      });
    }
  }

  return contactsNotified;
}

module.exports = { sendIncidentAlert, triggerVoiceCall, notifyEmergencyContacts };


