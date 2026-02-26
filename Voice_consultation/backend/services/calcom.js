const axios = require('axios');
require('dotenv').config();

const CALCOM_API_KEY = process.env.CALCOM_API_KEY;

const calcomService = {
    async createBooking(bookingData) {
        if (!CALCOM_API_KEY) {
            console.log('Mock Mode: Creating Cal.com booking', bookingData);
            return { booking_id: 'CAL-' + Math.random().toString(36).substr(2, 6) };
        }

        try {
            // Note: Actual Cal.com API endpoints might vary. This is a generic representation.
            const response = await axios.post('https://api.cal.com/v1/bookings', {
                eventTypeId: process.env.CALCOM_EVENT_TYPE_ID,
                start: bookingData.date, // Needs proper ISO formatting
                responses: {
                    name: 'Voice Agent Customer',
                    email: 'customer@example.com'
                }
            }, {
                headers: { 'Authorization': `Bearer ${CALCOM_API_KEY}` }
            });
            return { booking_id: response.data.booking.id };
        } catch (error) {
            console.error('Cal.com Booking Error:', error.response?.data || error.message);
            throw new Error('Failed to create Cal.com booking');
        }
    },

    async cancelBooking(bookingId) {
        if (!CALCOM_API_KEY) {
            console.log(`Mock Mode: Canceling Cal.com booking ${bookingId}`);
            return { success: true };
        }

        try {
            const response = await axios.delete(`https://api.cal.com/v1/bookings/${bookingId}`, {
                headers: { 'Authorization': `Bearer ${CALCOM_API_KEY}` }
            });
            return response.data;
        } catch (error) {
            console.error('Cal.com Cancellation Error:', error.response?.data || error.message);
            throw new Error('Failed to cancel Cal.com booking');
        }
    }
};

module.exports = calcomService;
