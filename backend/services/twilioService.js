import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER; // +14155238886

/**
 * Normalize a phone number to E.164 format.
 * Handles Indian numbers entered without country code.
 * Examples:
 *   "9876543210"      → "+919876543210"
 *   "+919876543210"   → "+919876543210"
 *   "919876543210"    → "+919876543210"
 */
function normalizePhone(raw) {
    // Strip spaces, dashes, parentheses
    let phone = String(raw).replace(/[\s\-().]/g, "");

    if (phone.startsWith("+")) return phone;           // already E.164
    if (phone.startsWith("91") && phone.length === 12) return `+${phone}`; // 91XXXXXXXXXX
    if (phone.length === 10) return `+91${phone}`;     // bare 10-digit Indian number
    return `+${phone}`;                                // fallback — just add +
}

/**
 * Send an appointment confirmation via Twilio WhatsApp sandbox.
 *
 * ⚠️  SANDBOX REQUIREMENT: The recipient must have sent the join-keyword
 *     to +14155238886 on WhatsApp BEFORE they can receive messages.
 *     Check: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
 *
 * @param {string} toPhone  - Patient phone (any reasonable format)
 * @param {string} body     - Message text
 * @returns {Promise<object>} Twilio message object
 */
export async function sendAppointmentSMS(toPhone, body) {
    const client = twilio(accountSid, authToken);

    const normalizedPhone = normalizePhone(toPhone);

    // Twilio WhatsApp sandbox requires "whatsapp:" prefix on both from/to
    const message = await client.messages.create({
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${normalizedPhone}`,
        body,
    });

    // Log the full status — if status is "queued" but you never receive it,
    // the sandbox opt-in is missing for this number.
    console.log(`[Twilio] Message to ${normalizedPhone}`);
    console.log(`  SID    : ${message.sid}`);
    console.log(`  Status : ${message.status}`);   // queued / sent / delivered / failed / undelivered
    console.log(`  Error  : ${message.errorCode || "none"} — ${message.errorMessage || "none"}`);

    return message;
}
