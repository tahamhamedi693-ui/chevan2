/*
  # Create Test Accounts and Seed Data

  1. Test Users
    - Creates test user profiles for passenger and driver accounts
    - Includes sample data for testing all app features
  
  2. Sample Data
    - Driver applications with different statuses
    - Sample rides and bookings
    - Payment methods and saved addresses
    
  3. Test Scenarios
    - Passenger account: test@passenger.com / password123
    - Driver account: test@driver.com / password123
    - Admin account: admin@rideshare.com / admin123
*/

-- Insert test profiles (these will be linked to auth users when they sign up)
INSERT INTO profiles (id, user_id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'test@passenger.com', 'John Passenger', 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'test@driver.com', 'Sarah Driver', 'driver'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'admin@rideshare.com', 'Admin User', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Insert test passengers
INSERT INTO passengers (id, name, email, phone, status, total_rides, total_spent) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Passenger', 'test@passenger.com', '+1-555-0101', 'active', 15, 287.50),
  ('550e8400-e29b-41d4-a716-446655440004', 'Mike Customer', 'mike@example.com', '+1-555-0102', 'active', 8, 156.75)
ON CONFLICT (email) DO NOTHING;

-- Insert test drivers
INSERT INTO drivers (id, name, email, phone, rating, status, documents_verified, total_rides, earnings, vehicle_type, license_plate) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Driver', 'test@driver.com', '+1-555-0201', 4.8, 'active', true, 342, 8567.25, 'comfort', 'DRV-001'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Ahmed Hassan', 'ahmed@example.com', '+1-555-0202', 4.9, 'active', true, 567, 12890.50, 'luxury', 'DRV-002'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Maria Garcia', 'maria@example.com', '+1-555-0203', 4.7, 'active', true, 234, 5432.75, 'economy', 'DRV-003')
ON CONFLICT (email) DO NOTHING;

-- Insert test driver application
INSERT INTO driver_applications (id, email, full_name, phone, license_number, vehicle_type, vehicle_year, vehicle_color, license_plate, insurance_number, status, documents, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440007', 'test@driver.com', 'Sarah Driver', '+1-555-0201', 'DL123456789', 'comfort', '2022', 'Silver', 'DRV-001', 'INS987654321', 'approved', 
   '{"license_uploaded": true, "insurance_uploaded": true, "vehicle_registration_uploaded": true}',
   'Application approved. All documents verified. Welcome to the driver network!')
ON CONFLICT (email) DO NOTHING;

-- Insert test saved addresses
INSERT INTO saved_addresses (id, user_id, label, address, latitude, longitude, is_default) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Home', '123 Oak Street, San Francisco, CA', 37.7749, -122.4194, true),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'Work', '456 Business Ave, San Francisco, CA', 37.7849, -122.4094, false),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Airport', 'San Francisco International Airport', 37.6213, -122.3790, false)
ON CONFLICT (id) DO NOTHING;

-- Insert test payment methods
INSERT INTO payment_methods (id, user_id, type, card_last_four, card_brand, is_default, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'card', '4567', 'Visa', true, true),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'card', '1234', 'Mastercard', false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert test rides
INSERT INTO rides (id, driver_id, passenger_id, pickup_location, dropoff_location, status, fare, distance, duration, eta) VALUES
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '123 Oak Street, San Francisco', '456 Business Ave, San Francisco', 'completed', 24.50, 3.2, 18, null),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '456 Business Ave, San Francisco', 'San Francisco International Airport', 'completed', 45.75, 8.1, 35, null),
  ('550e8400-e29b-41d4-a716-446655440015', null, '550e8400-e29b-41d4-a716-446655440001', '123 Oak Street, San Francisco', 'Golden Gate Bridge, San Francisco', 'active', 32.25, 5.4, 25, '8 min')
ON CONFLICT (id) DO NOTHING;

-- Insert app settings
INSERT INTO app_settings (id, base_fare, per_km_rate, per_minute_rate, surge_enabled, max_surge_multiplier, commission_rate) VALUES
  ('550e8400-e29b-41d4-a716-446655440016', 3.50, 1.25, 0.30, true, 2.5, 20)
ON CONFLICT (id) DO NOTHING;

-- Insert service zones
INSERT INTO service_zones (id, name, coordinates, active, surge_multiplier) VALUES
  ('550e8400-e29b-41d4-a716-446655440017', 'Downtown San Francisco', 
   '{"type": "Polygon", "coordinates": [[[-122.4194, 37.7749], [-122.4094, 37.7849], [-122.4294, 37.7649], [-122.4194, 37.7749]]]}', 
   true, 1.2),
  ('550e8400-e29b-41d4-a716-446655440018', 'Airport Zone', 
   '{"type": "Polygon", "coordinates": [[[-122.3790, 37.6213], [-122.3690, 37.6313], [-122.3890, 37.6113], [-122.3790, 37.6213]]]}', 
   true, 1.5)
ON CONFLICT (id) DO NOTHING;