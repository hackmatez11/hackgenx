-- Migration: Add Token Number to Appointments Table
-- Run this to add unique token number generation to existing appointments table

-- Add token_number column if it doesn't exist
ALTER TABLE IF EXISTS appointments
ADD COLUMN IF NOT EXISTS token_number TEXT UNIQUE;

-- Create index for token_number if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_appointments_token_number ON appointments(token_number);

-- Function to generate unique 3-digit token numbers for appointments
CREATE OR REPLACE FUNCTION public.generate_appointment_token()
RETURNS TRIGGER AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  IF NEW.token_number IS NULL THEN
    LOOP
      new_token := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
      SELECT EXISTS(SELECT 1 FROM appointments WHERE token_number = new_token) INTO token_exists;
      IF NOT token_exists THEN
        NEW.token_number := new_token;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS generate_appointment_token_trigger ON appointments;

-- Create trigger to auto-generate token number for new appointments
CREATE TRIGGER generate_appointment_token_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_appointment_token();
