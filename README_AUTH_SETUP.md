# Authentication Setup Instructions

## Overview
This document provides instructions for setting up role-based authentication with Supabase for the MediFlow medical application.

## Prerequisites
- Create a Supabase project at https://supabase.com
- Get your Supabase URL and anon key from project settings

## Setup Steps

### 1. Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase/setup.sql`

This will:
- Create the `user_profiles` table
- Set up Row Level Security (RLS) policies
- Create triggers for automatic profile creation
- Set up proper access controls

### 3. Supabase Authentication Configuration
1. In your Supabase project, go to Authentication > Settings
2. Ensure "Enable email confirmations" is set according to your preference
3. Configure your site URL and redirect URLs:
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: `http://localhost:5173/**`

### 4. Test the Authentication
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Sign Up" to create a new account
4. Select either "Doctor" or "Patient" role
5. After signing up, you'll be redirected to sign in
6. Sign in with your credentials

## Features Implemented

### Authentication Pages
- **Sign In** (`/signin`): Email/password login
- **Sign Up** (`/signup`): Registration with role selection
- **Protected Routes**: All dashboard routes require authentication and doctor role

### Role-Based Access
- **Doctors**: Full access to dashboard, bed management, patients, and AI prediction
- **Patients**: Currently can sign in but will need additional patient-specific pages

### User Interface
- Responsive design with mobile support
- User profile display in sidebar
- Sign out functionality
- Loading states and error handling

## Database Schema

### user_profiles Table
```sql
- id: UUID (references auth.users)
- email: TEXT
- role: TEXT ('doctor' or 'patient')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Security Features
- Row Level Security (RLS) enabled
- Users can only access their own profiles
- Protected routes prevent unauthorized access
- Role-based access control for dashboard features

## Next Steps
1. Create patient-specific dashboard pages
2. Add email verification flow
3. Implement password reset functionality
4. Add user profile editing capabilities
5. Set up proper error logging and monitoring

## Troubleshooting
- Ensure environment variables are correctly set
- Check Supabase RLS policies if access is denied
- Verify redirect URLs in Supabase settings
- Check browser console for authentication errors
