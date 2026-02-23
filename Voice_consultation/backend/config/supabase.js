const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Database operations will fail or use mock mode.');
}

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const initDb = async () => {
  if (!supabase) return;

  const { error } = await supabase.rpc('create_voice_calls_table', {}, { get: true });
  
  if (error) {
    // If RPC doesn't exist, we might need to create it manually or expect the table to exist.
    // For this implementation, we'll assume the user might need to run a SQL script,
    // but we'll try to check if the table exists.
    console.log('Ensure voice_calls table exists in Supabase.');
  }
};

module.exports = { supabase, initDb };
