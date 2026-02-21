-- Migration: OPD Queue + Moving Average Wait Time
-- Run this in your Supabase SQL Editor

-- 1. Add token_number to appointments if it doesn't exist yet
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS token_number TEXT;

-- Auto-generate token numbers for appointments (sequence-based)
CREATE SEQUENCE IF NOT EXISTS appointment_token_seq START 1000;

-- Function to generate appointment token
CREATE OR REPLACE FUNCTION generate_appointment_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token_number IS NULL THEN
    NEW.token_number := 'OPD-' || LPAD(nextval('appointment_token_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token on appointment insert
DROP TRIGGER IF EXISTS set_appointment_token ON appointments;
CREATE TRIGGER set_appointment_token
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_appointment_token();

-- 2. Create OPD Queue table
CREATE TABLE IF NOT EXISTS opd_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  disease TEXT NOT NULL,
  token_number TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  queue_position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  entered_queue_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consultation_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_wait_minutes NUMERIC,
  actual_wait_minutes NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opd_queue_doctor_id ON opd_queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_opd_queue_status ON opd_queue(status);
CREATE INDEX IF NOT EXISTS idx_opd_queue_position ON opd_queue(queue_position);
CREATE INDEX IF NOT EXISTS idx_opd_queue_entered_at ON opd_queue(entered_queue_at);

-- 4. Enable Row Level Security
ALTER TABLE opd_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users full access" ON opd_queue;

-- Allow authenticated users (doctors) full access
CREATE POLICY "Allow authenticated users full access" ON opd_queue
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
