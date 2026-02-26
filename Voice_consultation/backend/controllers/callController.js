const retailAiService = require('../services/retailAi');
const voiceCallService = require('../services/database');
const calcomService = require('../services/calcom');
const { supabase } = require('../config/supabase');

const callController = {
    async createCall(req, res) {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

        try {
            const callData = await retailAiService.initiateCall(phoneNumber);
            const initialRecord = await voiceCallService.insertCall({
                call_id: callData.call_id,
                phone_number: phoneNumber,
                status: 'calling',
                created_at: new Date().toISOString()
            });

            res.status(201).json({ success: true, call_id: callData.call_id, record: initialRecord });

            // If in Mock Mode (no key or no agent id), simulate a webhook after 5 seconds
            const isMockMode = !process.env.RETAIL_AI_API_KEY || !process.env.RETAIL_AI_AGENT_ID;
            if (isMockMode) {
                setTimeout(async () => {
                    console.log('Mock Webhook Triggered');
                    const mockWebhookData = {
                        call_id: callData.call_id,
                        transcript: "I'd like to book an appointment for March 15th at 2 PM.",
                        intent: "book",
                        booking_date: "2026-03-15T14:00:00Z"
                    };
                    await callController.handleWebhook({ body: mockWebhookData }, { status: () => ({ send: () => { } }) });
                }, 5000);
            }
        } catch (error) {
            console.error('Create Call Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async createWebCall(req, res) {
        try {
            console.log('=== Incoming Create Web Call Request ===');
            const webCallData = await retailAiService.createWebCall();
            console.log('Web call data generated:', webCallData);

            // Store initial record
            console.log('Attempting to insert initial database record for call:', webCallData.call_id);
            try {
                const record = await voiceCallService.insertCall({
                    call_id: webCallData.call_id,
                    phone_number: 'Browser User',
                    status: 'calling',
                    created_at: new Date().toISOString()
                });
                console.log('Record inserted successfully:', record);
            } catch (dbError) {
                console.error('DATABASE ERROR (Non-blocking):', dbError.message);
                console.warn('Proceeding without database logging. Ensure voice_calls table exists!');
            }

            res.status(201).json(webCallData);
            console.log('Response sent: 201 Created');

            // In Mock Mode, simulate webhook after connection
            const isMockMode = !process.env.RETAIL_AI_API_KEY || !process.env.RETAIL_AI_AGENT_ID;
            if (isMockMode) {
                setTimeout(async () => {
                    console.log('Mock Web Webhook Triggered');
                    const mockWebhookData = {
                        call_id: webCallData.call_id,
                        transcript: "Hello! I'm calling from your website. I want to book an appointment.",
                        intent: "book",
                        booking_date: "2026-03-20T10:00:00Z"
                    };
                    await callController.handleWebhook({ body: mockWebhookData }, { status: () => ({ send: () => { } }) });
                }, 8000);
            }
        } catch (error) {
            console.error('Create Web Call Controller Error:', error.stack || error);
            res.status(500).json({ error: error.message });
        }
    },

    async handleWebhook(req, res) {
        const {
            call_id,
            transcript,
            intent,
            booking_date,
            booking_id,
            patient_name,
            age,
            disease,
            phone,
            email,
            doctor_id,
            notes,
            is_emergency,
        } = req.body;
        console.log(`Webhook received for call ${call_id}:`, {
            intent,
            booking_date,
            booking_id,
            patient_name,
            age,
            disease,
            phone,
            email,
            doctor_id,
            is_emergency,
        });

        try {
            let resultBookingId = booking_id;
            let actionType = intent;

            if (intent === 'book') {
                const booking = await calcomService.createBooking({ date: booking_date });
                resultBookingId = booking.booking_id;
            } else if (intent === 'cancel') {
                await calcomService.cancelBooking(booking_id);
            }

            await voiceCallService.updateCallByCallId(call_id, {
                status: 'completed',
                transcript,
                action_type: actionType,
                booking_id: resultBookingId,
                appointment_date: booking_date
            });

            // Also create an appointment record in Supabase using details collected by the voice agent
            if (supabase && intent === 'book' && patient_name && phone) {
                try {
                    const { data, error } = await supabase
                        .from('appointments')
                        .insert([{
                            patient_name,
                            age: age ? parseInt(age, 10) : null,
                            disease: disease || null,
                            phone,
                            email: email || null,
                            appointment_date: new Date().toISOString(),
                            doctor_id: doctor_id || null,
                            notes: notes || null,
                            status: 'scheduled',
                            is_emergency: !!is_emergency,
                        }])
                        .select()
                        .single();

                    if (error) {
                        console.error('Supabase appointments insert error from webhook:', error.message);
                    } else {
                        console.log('Appointment created from voice webhook:', data.id);
                    }
                } catch (dbErr) {
                    console.error('Unexpected error inserting appointment from webhook:', dbErr);
                }
            }

            if (res.status) res.status(200).send('Webhook processed');
        } catch (error) {
            console.error('Webhook processing error:', error);
            await voiceCallService.updateCallByCallId(call_id, { status: 'failed' });
            if (res.status) res.status(500).send('Internal Server Error');
        }
    },

    async getLatestCall(req, res) {
        try {
            const call = await voiceCallService.getLatestCall();
            res.status(200).json(call);
        } catch (error) {
            console.error('Get Latest Call Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = callController;
