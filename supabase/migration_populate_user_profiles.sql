-- Migration: Populate user_profiles for existing auth users
-- Run this to create user_profiles entries for users who signed up before the profile creation was implemented

-- Insert user_profiles for existing auth users who don't have profiles yet
INSERT INTO user_profiles (id, email, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'patient') as role
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Update any existing profiles with correct role from metadata if needed
UPDATE user_profiles
SET role = COALESCE(up.role, au.raw_user_meta_data->>'role', 'patient')
FROM auth.users au
WHERE user_profiles.id = au.id
  AND user_profiles.role IS NULL;