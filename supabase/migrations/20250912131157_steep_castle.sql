
/*
  # Database Functions for Ride Sharing App

  1. Functions
    - increment_driver_stats: Update driver statistics after ride completion
    - increment_passenger_stats: Update passenger statistics after ride completion
    - get_nearby_drivers: Find available drivers within a radius
    - calculate_ride_fare: Calculate fare based on distance and time

  2. Triggers
    - update_updated_at: Automatically update updated_at timestamp
*/

-- Function to increment driver stats
CREATE OR REPLACE FUNCTION increment_driver_stats(
  driver_id UUID,
  earnings NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE drivers 
  SET 
    total_rides = total_rides + 1,
    earnings = earnings + increment_driver_stats.earnings,
    updated_at = now()
  WHERE id = increment_driver_stats.driver_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment passenger stats
CREATE OR REPLACE FUNCTION increment_passenger_stats(
  passenger_id UUID,
  amount NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE passengers 
  SET 
    total_rides = total_rides + 1,
    total_spent = total_spent + increment_passenger_stats.amount,
    updated_at = now()
  WHERE id = increment_passenger_stats.passenger_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passengers_updated_at
  BEFORE UPDATE ON passengers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_applications_updated_at
  BEFORE UPDATE ON driver_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_zones_updated_at
  BEFORE UPDATE ON service_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();