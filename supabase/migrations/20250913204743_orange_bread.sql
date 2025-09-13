/*
  # Create missing database tables

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `passengers` - Passenger-specific data for ride bookings
    - `drivers` - Driver profiles with vehicle and status information
    - `rides` - Ride records with pickup/dropoff and status tracking
    - `app_settings` - Application configuration (fares, rates)
    - `ride_ratings` - Rating system for rides between users and drivers
    - `payment_methods` - User payment method storage

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for cross-table access where needed

  3. Indexes
    - Add performance indexes on frequently queried columns
    - Add unique constraints where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  rating NUMERIC DEFAULT 0,
  total_trips INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Create passengers table
CREATE TABLE IF NOT EXISTS public.passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own passenger record"
  ON public.passengers
  FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Authenticated users can insert their own passenger record"
  ON public.passengers
  FOR INSERT
  WITH CHECK (auth.email() = email);

CREATE POLICY "Authenticated users can update their own passenger record"
  ON public.passengers
  FOR UPDATE
  USING (auth.email() = email);

CREATE INDEX IF NOT EXISTS passengers_email_idx ON public.passengers (email);
CREATE INDEX IF NOT EXISTS passengers_status_idx ON public.passengers (status);

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  vehicle_type TEXT,
  license_plate TEXT,
  status TEXT DEFAULT 'offline',
  documents_verified BOOLEAN DEFAULT FALSE,
  current_location JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own profile"
  ON public.drivers
  FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Drivers can update their own profile"
  ON public.drivers
  FOR UPDATE
  USING (auth.email() = email);

CREATE POLICY "Authenticated users can view drivers"
  ON public.drivers
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS drivers_email_idx ON public.drivers (email);
CREATE INDEX IF NOT EXISTS drivers_status_idx ON public.drivers (status);
CREATE INDEX IF NOT EXISTS drivers_vehicle_type_idx ON public.drivers (vehicle_type);

-- Create rides table
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES public.passengers(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  fare NUMERIC,
  distance NUMERIC,
  duration INT,
  eta TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passengers can view their own rides"
  ON public.rides
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.passengers WHERE id = passenger_id AND email = auth.email())
  );

CREATE POLICY "Passengers can insert rides"
  ON public.rides
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.passengers WHERE id = passenger_id AND email = auth.email())
  );

CREATE POLICY "Passengers can update their own rides"
  ON public.rides
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.passengers WHERE id = passenger_id AND email = auth.email())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.passengers WHERE id = passenger_id AND email = auth.email())
  );

CREATE POLICY "Drivers can view and update assigned rides"
  ON public.rides
  FOR ALL
  USING (driver_id = (SELECT id FROM public.drivers WHERE email = auth.email()));

CREATE INDEX IF NOT EXISTS rides_passenger_id_idx ON public.rides (passenger_id);
CREATE INDEX IF NOT EXISTS rides_driver_id_idx ON public.rides (driver_id);
CREATE INDEX IF NOT EXISTS rides_status_idx ON public.rides (status);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_fare NUMERIC NOT NULL,
  per_km_rate NUMERIC NOT NULL,
  per_minute_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app settings"
  ON public.app_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert default app settings
INSERT INTO public.app_settings (base_fare, per_km_rate, per_minute_rate)
VALUES (2.50, 1.20, 0.25)
ON CONFLICT (id) DO NOTHING;

-- Create ride_ratings table
CREATE TABLE IF NOT EXISTS public.ride_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_rating INT,
  driver_rating INT,
  user_comment TEXT,
  driver_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ride_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ride ratings"
  ON public.ride_ratings
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND passenger_id = (SELECT id FROM public.passengers WHERE email = auth.email()))
  );

CREATE POLICY "Users can insert ride ratings"
  ON public.ride_ratings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ride ratings"
  ON public.ride_ratings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Drivers can view their own ride ratings"
  ON public.ride_ratings
  FOR SELECT
  USING (
    driver_id = (SELECT id FROM public.drivers WHERE email = auth.email())
  );

CREATE POLICY "Drivers can update their own ride ratings"
  ON public.ride_ratings
  FOR UPDATE
  USING (driver_id = (SELECT id FROM public.drivers WHERE email = auth.email()))
  WITH CHECK (driver_id = (SELECT id FROM public.drivers WHERE email = auth.email()));

CREATE INDEX IF NOT EXISTS ride_ratings_ride_id_idx ON public.ride_ratings (ride_id);
CREATE INDEX IF NOT EXISTS ride_ratings_user_id_idx ON public.ride_ratings (user_id);
CREATE INDEX IF NOT EXISTS ride_ratings_driver_id_idx ON public.ride_ratings (driver_id);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  card_last_four TEXT,
  card_brand TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON public.payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON public.payment_methods (user_id);
CREATE INDEX IF NOT EXISTS payment_methods_is_default_idx ON public.payment_methods (is_default);
CREATE INDEX IF NOT EXISTS payment_methods_is_active_idx ON public.payment_methods (is_active);