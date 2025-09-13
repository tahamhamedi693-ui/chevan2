/*
  # Create test driver account

  1. New Test Data
    - Create a test driver account for testing driver features
    - Add sample driver data with vehicle information
    - Set up proper verification status

  2. Test Credentials
    - Email: driver@test.com
    - This will be a verified driver account for testing
*/

-- Insert test driver data
INSERT INTO drivers (
  id,
  name,
  email,
  phone,
  rating,
  vehicle_type,
  license_plate,
  status,
  documents_verified,
  total_rides,
  earnings,
  last_active
) VALUES (
  gen_random_uuid(),
  'John Smith',
  'driver@test.com',
  '+1-555-0123',
  4.8,
  'Toyota Camry 2022',
  'ABC-123',
  'active',
  true,
  247,
  5680.50,
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  rating = EXCLUDED.rating,
  vehicle_type = EXCLUDED.vehicle_type,
  license_plate = EXCLUDED.license_plate,
  status = EXCLUDED.status,
  documents_verified = EXCLUDED.documents_verified,
  total_rides = EXCLUDED.total_rides,
  earnings = EXCLUDED.earnings,
  last_active = EXCLUDED.last_active;

-- Insert corresponding passenger record (drivers can also be passengers)
INSERT INTO passengers (
  id,
  name,
  email,
  phone,
  status,
  total_rides,
  total_spent
) VALUES (
  gen_random_uuid(),
  'John Smith',
  'driver@test.com',
  '+1-555-0123',
  'active',
  12,
  340.75
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  total_rides = EXCLUDED.total_rides,
  total_spent = EXCLUDED.total_spent;