-- Migration: Add bed_number to beds table
-- This allows human-readable IDs like ICU-01

ALTER TABLE beds ADD COLUMN IF NOT EXISTS bed_number TEXT UNIQUE;
ALTER TABLE beds ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status check constraint to include 'cleaning'
ALTER TABLE beds DROP CONSTRAINT IF EXISTS beds_status_check;
ALTER TABLE beds ADD CONSTRAINT beds_status_check 
  CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning', 'critical'));

-- Update RLS for beds table
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users full access on beds" ON beds;
CREATE POLICY "Allow authenticated users full access on beds" ON beds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
