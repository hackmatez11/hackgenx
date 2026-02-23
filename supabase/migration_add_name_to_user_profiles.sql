-- Migration: Add name column to user_profiles
-- Run this to add the name column for doctors and patients

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS name TEXT;