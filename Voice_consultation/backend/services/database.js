const { supabase } = require('../config/supabase');

const voiceCallService = {
    async insertCall(data) {
        if (!supabase) {
            console.log('Mock: Inserting call record', data);
            return { id: 'mock-' + Date.now(), ...data };
        }
        const { data: record, error } = await supabase
            .from('voice_calls')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('Database Insert Error:', error.message, error.details);
            throw new Error(`Database error: ${error.message}. Ensure the voice_calls table exists.`);
        }
        return record;
    },

    async updateCallByCallId(callId, updates) {
        if (!supabase) {
            console.log(`Mock: Updating call ${callId}`, updates);
            return { call_id: callId, ...updates };
        }
        const { data: record, error } = await supabase
            .from('voice_calls')
            .update(updates)
            .eq('call_id', callId)
            .select()
            .single();

        if (error) {
            console.error('Database Update Error:', error.message);
            throw error;
        }
        return record;
    },

    async getLatestCall() {
        if (!supabase) {
            console.log('Mock: Fetching latest call');
            return null;
        }
        try {
            const { data, error } = await supabase
                .from('voice_calls')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (err) {
            console.error('Database Fetch Latest Error:', err.message);
            return null;
        }
    }
};

module.exports = voiceCallService;
