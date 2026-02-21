-- Migration: Bed Queue
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bed_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Link back to OPD queue entry
  opd_queue_id UUID REFERENCES opd_queue(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  -- Patient info (denormalized for fast display)
  patient_name TEXT NOT NULL,
  disease TEXT NOT NULL,
  token_number TEXT,
  age INTEGER,
  phone TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Bed assignment
  bed_type TEXT DEFAULT 'general' CHECK (bed_type IN ('icu', 'emergency', 'general', 'private', 'maternity')),
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  -- Queue tracking
  status TEXT DEFAULT 'waiting_for_bed' CHECK (status IN ('waiting_for_bed', 'bed_assigned', 'admitted', 'discharged')),
  admitted_from_opd_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bed_assigned_at TIMESTAMP WITH TIME ZONE,
  admitted_at TIMESTAMP WITH TIME ZONE,
  discharged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bed_queue_doctor_id ON bed_queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_bed_queue_status ON bed_queue(status);
CREATE INDEX IF NOT EXISTS idx_bed_queue_admitted_at ON bed_queue(admitted_from_opd_at);

-- RLS
ALTER TABLE bed_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access on bed_queue" ON bed_queue;
CREATE POLICY "Allow authenticated users full access on bed_queue" ON bed_queue
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
