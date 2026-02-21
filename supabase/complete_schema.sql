-- Complete Database Schema for MediFlow Medical Application
-- This file includes all tables needed for the application

-- User Profiles Table (for authentication)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  phone TEXT NOT NULL,
  token_number TEXT UNIQUE,
  current_stage TEXT DEFAULT 'registration',
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queues Table
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  queue_position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beds Table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_type TEXT NOT NULL CHECK (bed_type IN ('icu', 'emergency', 'general', 'private', 'maternity')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  admission_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  predicted_discharge_time TIMESTAMP WITH TIME ZONE,
  actual_discharge_time TIMESTAMP WITH TIME ZONE,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')),
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX IF NOT EXISTS idx_patients_token_number ON patients(token_number);
CREATE INDEX IF NOT EXISTS idx_patients_current_stage ON patients(current_stage);
CREATE INDEX IF NOT EXISTS idx_patients_priority_level ON patients(priority_level);

CREATE INDEX IF NOT EXISTS idx_queues_patient_id ON queues(patient_id);
CREATE INDEX IF NOT EXISTS idx_queues_stage_name ON queues(stage_name);
CREATE INDEX IF NOT EXISTS idx_queues_status ON queues(status);
CREATE INDEX IF NOT EXISTS idx_queues_queue_position ON queues(queue_position);

CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_beds_bed_type ON beds(bed_type);
CREATE INDEX IF NOT EXISTS idx_beds_patient_id ON beds(patient_id);

CREATE INDEX IF NOT EXISTS idx_admissions_patient_id ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_severity_level ON admissions(severity_level);
CREATE INDEX IF NOT EXISTS idx_admissions_bed_id ON admissions(bed_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admission_time ON admissions(admission_time);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_queues_updated_at
  BEFORE UPDATE ON public.queues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beds_updated_at
  BEFORE UPDATE ON public.beds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup (creates user profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'patient' -- Default role, will be updated during signup
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique token numbers (trigger version)
CREATE OR REPLACE FUNCTION public.generate_token_number()
RETURNS TRIGGER AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  IF NEW.token_number IS NULL THEN
    LOOP
      new_token := 'TOK' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
      SELECT EXISTS(SELECT 1 FROM patients WHERE token_number = new_token) INTO token_exists;
      IF NOT token_exists THEN
        NEW.token_number := new_token;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token number for new patients
CREATE OR REPLACE TRIGGER generate_patient_token
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_token_number();

-- Sample data insertion (optional - for testing)
-- Insert sample beds
INSERT INTO public.beds (bed_type, status) VALUES
('icu', 'available'),
('icu', 'available'),
('emergency', 'available'),
('emergency', 'available'),
('general', 'available'),
('general', 'available'),
('general', 'available'),
('private', 'available'),
('private', 'available'),
('maternity', 'available')
ON CONFLICT DO NOTHING;

-- Insert sample patients (optional)
INSERT INTO public.patients (name, age, phone, priority_level) VALUES
('John Doe', 45, '+1234567890', 'normal'),
('Jane Smith', 32, '+0987654321', 'high'),
('Robert Johnson', 67, '+1122334455', 'critical')
ON CONFLICT DO NOTHING;
