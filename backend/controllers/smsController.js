import { sendAppointmentSMS } from "../services/twilioService.js";

/**
 * POST /api/sms/send
 * Body: { phone, patientName, token, queuePosition, estimatedWait, isEmergency }
 */
export const sendSMS = async (req, res) => {
    try {
        const { phone, patientName, token, queuePosition, estimatedWait, isEmergency } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, error: "Phone number is required." });
        }

        // Build the message body shown on the dashboard
        let messageBody;

        if (isEmergency) {
            messageBody =
                `🚨 *EMERGENCY Appointment Confirmed* 🚨\n\n` +
                `Hello ${patientName || "Patient"},\n\n` +
                `Your emergency appointment has been successfully booked.\n\n` +
                `📋 *Details:*\n` +
                `• Patient Token : ${token}\n` +
                `• Queue Type    : ICU (Emergency)\n` +
                `• Priority      : EMERGENCY\n\n` +
                `Please report to the ICU reception immediately.\n\n` +
                `– Hospital Management System`;
        } else {
            messageBody =
                `✅ *Appointment Confirmed!*\n\n` +
                `Hello ${patientName || "Patient"},\n\n` +
                `Your appointment has been successfully booked.\n\n` +
                `📋 *Details:*\n` +
                `• Patient Token    : ${token}\n` +
                `• Queue Position   : #${queuePosition}\n` +
                `• Est. Wait Time   : ~${estimatedWait} minutes\n` +
                `• Queue Type       : OPD\n\n` +
                `Please arrive on time and keep this token handy.\n\n` +
                `– Hospital Management System`;
        }

        const message = await sendAppointmentSMS(phone, messageBody);

        return res.status(200).json({
            success: true,
            message: "SMS sent successfully.",
            sid: message.sid,
        });
    } catch (error) {
        console.error("[SMS Controller] Error sending SMS:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to send SMS.",
            details: error.message,
        });
    }
};
