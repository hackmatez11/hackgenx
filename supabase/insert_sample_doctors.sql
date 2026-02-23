-- Insert sample doctors into user_profiles
-- Note: Replace the UUIDs with actual auth.users IDs from your Supabase auth

-- Example doctors (replace with real UUIDs from auth.users)
INSERT INTO user_profiles (id, email, role, name) VALUES
('00000000-0000-0000-0000-000000000001', 'dr.smith@mediflow.com', 'doctor', 'Dr. John Smith'),
('00000000-0000-0000-0000-000000000002', 'dr.jones@mediflow.com', 'doctor', 'Dr. Emily Jones'),
('00000000-0000-0000-0000-000000000003', 'dr.brown@mediflow.com', 'doctor', 'Dr. Michael Brown')
ON CONFLICT (id) DO NOTHING;

-- You can add more doctors as needed