/*
  # Insert Test Users

  1. Test Users
    - Passenger test account (test@passenger.com)
    - Driver test account (test@driver.com)
    - Admin test account (admin@rideshare.com)
  
  2. Security
    - Uses auth.users table for authentication
    - Creates corresponding profiles for each user
    - Sets up proper user metadata
  
  3. Features
    - Pre-configured user roles
    - Ready-to-use test accounts
    - Proper email verification status
*/

-- Insert test users into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
(
  'passenger-user-id-123',
  '00000000-0000-0000-0000-000000000000',
  'test@passenger.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Passenger"}',
  false,
  'authenticated'
),
(
  'driver-user-id-456',
  '00000000-0000-0000-0000-000000000000',
  'test@driver.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Driver"}',
  false,
  'authenticated'
),
(
  'admin-user-id-789',
  '00000000-0000-0000-0000-000000000000',
  'admin@rideshare.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO profiles (
  id,
  user_id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'test@passenger.com',
  'John Passenger',
  'user',
  now(),
  now()
),
(
  gen_random_uuid(),
  'driver-user-id-456',
  'test@driver.com',
  'John Driver',
  'driver',
  now(),
  now()
),
(
  gen_random_uuid(),
  'admin-user-id-789',
  'admin@rideshare.com',
  'Admin User',
  'admin',
  now(),
  now()
)
ON CONFLICT (user_id) DO NOTHING;

-- Insert test passenger data
INSERT INTO passengers (
  id,
  name,
  email,
  phone,
  status,
  total_rides,
  total_spent,
  created_at,
  updated_at
) VALUES 
(
  'passenger-123',
  'John Passenger',
  'test@passenger.com',
  '+1 (555) 123-4567',
  'active',
  12,
  245.75,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Insert test driver data
INSERT INTO drivers (
  id,
  name,
  email,
  phone,
  rating,
  status,
  documents_verified,
  total_rides,
  earnings,
  vehicle_type,
  license_plate,
  created_at,
  updated_at
) VALUES 
(
  'driver-456',
  'John Driver',
  'test@driver.com',
  '+1 (555) 987-6543',
  4.8,
  'active',
  true,
  342,
  8567.25,
  'Toyota Camry',
  'ABC 123',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Insert approved driver application for test driver
INSERT INTO driver_applications (
  id,
  email,
  full_name,
  phone,
  license_number,
  vehicle_type,
  vehicle_year,
  vehicle_color,
  license_plate,
  insurance_number,
  status,
  documents,
  notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'test@driver.com',
  'John Driver',
  '+1 (555) 987-6543',
  'DL123456789',
  'economy',
  '2022',
  'Silver',
  'ABC 123',
  'INS987654321',
  'approved',
  '{"license_uploaded": true, "insurance_uploaded": true, "vehicle_registration_uploaded": true}',
  'Application approved. All documents verified.',
  'admin-user-id-789',
  now(),
  now() - interval '3 days',
  now() - interval '3 days'
)
ON CONFLICT (email) DO NOTHING;

-- Insert test saved addresses for passenger
INSERT INTO saved_addresses (
  id,
  user_id,
  label,
  address,
  latitude,
  longitude,
  is_default,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'Home',
  '123 Oak Street, Residential Area, San Francisco, CA',
  37.7749,
  -122.4194,
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'Work',
  '456 Business Ave, Financial District, San Francisco, CA',
  37.7949,
  -122.4094,
  false,
  now(),
  now()
),
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'Airport',
  'San Francisco International Airport, San Francisco, CA',
  37.6213,
  -122.3790,
  false,
  now(),
  now()
)
ON CONFLICT (user_id, label) DO NOTHING;

-- Insert test payment methods for passenger
INSERT INTO payment_methods (
  id,
  user_id,
  type,
  card_last_four,
  card_brand,
  is_default,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'card',
  '4567',
  'Visa',
  true,
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  'passenger-user-id-123',
  'card',
  '8901',
  'Mastercard',
  false,
  true,
  now(),
  now()
)
ON CONFLICT (user_id, card_last_four) DO NOTHING;

-- Insert test rides for passenger
INSERT INTO rides (
  id,
  driver_id,
  passenger_id,
  pickup_location,
  dropoff_location,
  status,
  fare,
  distance,
  duration,
  eta,
  created_at,
  completed_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'driver-456',
  'passenger-123',
  '123 Oak Street, Residential Area',
  '456 Business Ave, Financial District',
  'completed',
  24.50,
  3.2,
  18,
  null,
  now() - interval '2 days',
  now() - interval '2 days' + interval '18 minutes',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  'driver-456',
  'passenger-123',
  '456 Business Ave, Financial District',
  'San Francisco International Airport',
  'completed',
  45.75,
  12.8,
  35,
  null,
  now() - interval '1 day',
  now() - interval '1 day' + interval '35 minutes',
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;