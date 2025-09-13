/*
  # Driver Account System

  1. New Tables
    - `driver_applications` - Store driver applications with documents and verification status
    - Update `profiles` table to include driver role
    - Update `drivers` table structure for better integration

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own applications
    - Add policies for admins to review applications

  3. Features
    - Driver application process
    - Document upload tracking
    - Application status management
    - Driver profile management
*/

-- Update profiles table to better handle driver roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'driver_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN driver_status text DEFAULT 'none' CHECK (driver_status IN ('none', 'applied', 'approved', 'active', 'suspended'));
  END IF;
END $$;

-- Create driver applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  license_number text NOT NULL,
  vehicle_type text NOT NULL,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text NOT NULL,
  vehicle_color text NOT NULL,
  license_plate text NOT NULL,
  insurance_number text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  documents jsonb DEFAULT '{}',
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email),
  UNIQUE(license_number),
  UNIQUE(license_plate)
);

-- Enable RLS
ALTER TABLE driver_applications ENABLE ROW LEVEL SECURITY;

-- Policies for driver applications
CREATE POLICY "Users can view their own applications"
  ON driver_applications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own applications"
  ON driver_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their pending applications"
  ON driver_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT user_id FROM profiles WHERE user_id = auth.uid()) AND status = 'pending');

-- Admin policies (for future admin panel)
CREATE POLICY "Admins can manage all applications"
  ON driver_applications
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_applications_user_id ON driver_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_driver_applications_status ON driver_applications (status);
CREATE INDEX IF NOT EXISTS idx_driver_applications_email ON driver_applications (email);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_applications_updated_at
  BEFORE UPDATE ON driver_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update drivers table to link with applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drivers' AND column_name = 'application_id'
  ) THEN
    ALTER TABLE drivers ADD COLUMN application_id uuid REFERENCES driver_applications(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drivers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE drivers ADD COLUMN user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;