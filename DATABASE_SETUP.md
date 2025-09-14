# Database Setup Guide for User Types

## Problem
The error "Database error saving new user" occurs because the `profiles` table in your Supabase database doesn't have the `user_type` column that the application is trying to insert.

## Solution Options

### Option 1: Using Supabase Dashboard (Recommended for Quick Fix)

1. **Log in to your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Select the `profiles` table

3. **Add the user_type column**
   - Click on "Add column" button
   - Configure the column:
     - Name: `user_type`
     - Type: `text`
     - Default value: `'passenger'`
     - Required: Yes (check the box)
   - Click "Save"

4. **Add a constraint for valid values**
   - Go to "SQL Editor" in the left sidebar
   - Run this query:
   ```sql
   ALTER TABLE public.profiles 
   ADD CONSTRAINT user_type_check 
   CHECK (user_type IN ('passenger', 'driver'));
   ```

### Option 2: Using SQL Migration

1. **Run the migration file**
   - The migration file has been created at: `supabase/migrations/add_user_type_to_profiles.sql`
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the contents of the migration file
   - Click "Run"

### Option 3: Complete Database Schema

If you're setting up from scratch, here's the complete schema for the profiles table:

```sql
-- Drop existing table if needed (WARNING: This will delete all data)
-- DROP TABLE IF EXISTS public.profiles;

-- Create profiles table with user_type
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver')),
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'passenger')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Testing the Fix

After applying the database changes:

1. **Test user registration**:
   - Go to the app
   - Click "Sign Up"
   - Select user type (Passenger or Driver)
   - Complete the registration form
   - The user should be created successfully

2. **Verify in Supabase**:
   - Go to Table Editor > profiles
   - Check that new users have the correct `user_type` value

## Troubleshooting

If you still encounter errors:

1. **Check Supabase connection**:
   - Verify your `.env` or `.env.local` file has correct Supabase credentials
   - Ensure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set

2. **Clear app cache**:
   ```bash
   npx expo start -c
   ```

3. **Check browser console/logs** for specific error messages

4. **Verify RLS policies** are not blocking the insert operation

## Additional Notes

- The `user_type` field determines whether a user sees the passenger interface (tabs) or driver interface
- Users cannot change their type after registration (you can modify this if needed)
- The default type is 'passenger' if not specified
