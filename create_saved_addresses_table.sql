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

-- Add RLS policies
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own addresses
CREATE POLICY "Users can view their own addresses" 
  ON public.saved_addresses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own addresses
CREATE POLICY "Users can insert their own addresses" 
  ON public.saved_addresses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own addresses
CREATE POLICY "Users can update their own addresses" 
  ON public.saved_addresses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own addresses
CREATE POLICY "Users can delete their own addresses" 
  ON public.saved_addresses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS saved_addresses_user_id_idx ON public.saved_addresses (user_id);
CREATE INDEX IF NOT EXISTS saved_addresses_is_default_idx ON public.saved_addresses (is_default);
