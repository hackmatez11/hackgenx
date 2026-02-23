const axios = require('axios');
require('dotenv').config();

const RETAIL_AI_API_KEY = process.env.RETAIL_AI_API_KEY;

const retailAiService = {
    async initiateCall(phoneNumber) {
        if (!RETAIL_AI_API_KEY) {
            console.log(`Mock Mode: Initiating Retail AI call to ${phoneNumber}`);
            return { call_id: 'call-' + Math.random().toString(36).substr(2, 9) };
        }

        try {
            // Retell's telephony endpoint is different, but keeping this for generic retail ai compatibility
            const response = await axios.post('https://api.retellai.com/v2/create-phone-call', {
                phone_number: phoneNumber,
                agent_id: process.env.RETAIL_AI_AGENT_ID,
            }, {
                headers: { 'Authorization': `Bearer ${RETAIL_AI_API_KEY}` }
            });
            return response.data;
        } catch (error) {
            console.error('Retail AI API Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate Retail AI call');
        }
    },

    async createWebCall() {
        if (!RETAIL_AI_API_KEY || !process.env.RETAIL_AI_AGENT_ID) {
            if (!process.env.RETAIL_AI_AGENT_ID && RETAIL_AI_API_KEY) {
                console.warn('RETAIL_AI_AGENT_ID is missing. Falling back to Mock Mode for Web Call.');
            } else {
                console.log('Mock Mode: Creating Retail AI Web Call Token');
            }
            return {
                access_token: 'mock-web-token-' + Math.random().toString(36).substr(2, 9),
                call_id: 'web-call-' + Date.now()
            };
        }

        try {
            console.log('Requesting Real Retell Web Call Token for agent:', process.env.RETAIL_AI_AGENT_ID);
            const response = await axios.post('https://api.retellai.com/v2/create-web-call', {
                agent_id: process.env.RETAIL_AI_AGENT_ID,
            }, {
                headers: { 'Authorization': `Bearer ${RETAIL_AI_API_KEY}` }
            });
            console.log('Retell API Response Successful:', !!response.data.access_token);
            return response.data;
        } catch (error) {
            console.error('Retail AI Web Call API Error Status:', error.response?.status);
            console.error('Retail AI Web Call API Error Body:', JSON.stringify(error.response?.data, null, 2));
            throw new Error('Failed to create Retail AI web call. Ensure Agent ID and API Key are correct.');
        }
    }
};

module.exports = retailAiService;
