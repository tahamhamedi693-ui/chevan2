/*
  # Create saved addresses table

  1. New Tables
    - `saved_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `label` (text, address label like "Home", "Work")
      - `address` (text, full address string)
      - `latitude` (double precision, location latitude)
      - `longitude` (double precision, location longitude)
      - `is_default` (boolean, whether this is the default address)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `saved_addresses` table
    - Add policies for users to manage their own addresses
    - Add indexes for performance

  3. Triggers
    - Add trigger to update `updated_at` timestamp
*/

-- Create saved_addresses table
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own addresses" 
  ON public.saved_addresses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
  ON public.saved_addresses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
  ON public.saved_addresses 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
  ON public.saved_addresses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS saved_addresses_user_id_idx ON public.saved_addresses (user_id);
CREATE INDEX IF NOT EXISTS saved_addresses_is_default_idx ON public.saved_addresses (is_default);
CREATE INDEX IF NOT EXISTS saved_addresses_created_at_idx ON public.saved_addresses (created_at DESC);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_saved_addresses_updated_at 
  BEFORE UPDATE ON public.saved_addresses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();