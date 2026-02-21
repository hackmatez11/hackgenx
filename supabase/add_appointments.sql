-- Migration: Add Appointments Table
-- This file adds the appointments table and related database functions
-- Run this after the complete_schema.sql has been executed

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT UNIQUE,
  patient_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  disease TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_token_number ON appointments(token_number);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);

-- Function to generate unique token numbers for appointments
CREATE OR REPLACE FUNCTION public.generate_appointment_token()
RETURNS TRIGGER AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  IF NEW.token_number IS NULL THEN
    LOOP
      new_token := 'APT' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
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

-- Trigger to auto-generate token number for new appointments
CREATE TRIGGER generate_appointment_token_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_appointment_token();

-- Create trigger for updated_at column
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
