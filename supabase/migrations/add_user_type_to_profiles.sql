-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'passenger' 
CHECK (user_type IN ('passenger', 'driver'));

-- Update existing profiles to have a default user_type if they don't have one
UPDATE public.profiles 
SET user_type = 'passenger' 
WHERE user_type IS NULL;

-- Make user_type column NOT NULL after setting defaults
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;
