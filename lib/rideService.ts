import { ridesTable, driversTable, passengersTable, appSettingsTable, profilesTable, supabase } from './typedSupabase';
import { Database } from '@/types/database';

type Ride = Database['public']['Tables']['rides']['Row'];
type RideInsert = Database['public']['Tables']['rides']['Insert'];
type RideUpdate = Database['public']['Tables']['rides']['Update'];
type Driver = Database['public']['Tables']['drivers']['Row'];
type Passenger = Database['public']['Tables']['passengers']['Row'];

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RideRequest {
  pickup: Location;
  destination: Location;
  rideType: 'economy' | 'comfort' | 'luxury';
  passengers: number;
  scheduledTime?: Date;
}

export class RideService {
  // Get nearby drivers within a certain radius (in km)
  async getNearbyDrivers(latitude: number, longitude: number, radius: number = 5): Promise<Driver[]> {
    const result = await driversTable()
      .select('*')
      .eq('status', 'available')
      .execute();

    if (!result.data) return [];

    return result.data.filter((driver) => {
      if (!driver.current_location) return false;
      const distance = this.calculateDistance(
        latitude,
        longitude,
        driver.current_location.latitude,
        driver.current_location.longitude
      );
      return distance <= radius;
    });
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Calculate fare based on distance, time, and ride type
  async calculateFare(distance: number, duration: number, rideType: string): Promise<number> {
    const { data: settings } = await appSettingsTable()
      .select('*')
      .single();

    // Base fares by ride type
    const baseFares = {
      'economy': settings?.base_fare || 3.50,
      'comfort': (settings?.base_fare || 3.50) * 1.5,
      'luxury': (settings?.base_fare || 3.50) * 2.2
    };
    
    // Per km rates by ride type
    const perKmRates = {
      'economy': settings?.per_km_rate || 1.20,
      'comfort': (settings?.per_km_rate || 1.20) * 1.4,
      'luxury': (settings?.per_km_rate || 1.20) * 2.0
    };
    
    // Per minute rates by ride type
    const perMinuteRates = {
      'economy': settings?.per_minute_rate || 0.25,
      'comfort': (settings?.per_minute_rate || 0.25) * 1.3,
      'luxury': (settings?.per_minute_rate || 0.25) * 1.8
    };

    const baseFare = baseFares[rideType as keyof typeof baseFares] || baseFares.economy;
    const perKmRate = perKmRates[rideType as keyof typeof perKmRates] || perKmRates.economy;
    const perMinuteRate = perMinuteRates[rideType as keyof typeof perMinuteRates] || perMinuteRates.economy;
    
    // Calculate fare: base + (distance in km * rate per km) + (time in minutes * rate per minute)
    const distanceFare = distance * perKmRate;
    const timeFare = duration * perMinuteRate;
    const totalFare = baseFare + distanceFare + timeFare;
    
    // Apply minimum fare
    const minimumFare = baseFare * 1.5;
    const fare = Math.max(totalFare, minimumFare);
    
    return Math.round(fare * 100) / 100;
  }

  // Find nearby available drivers
  async findNearbyDrivers(pickup: Location, maxDistance: number = 10): Promise<Driver[]> {
    const result = await driversTable()
      .select('*')
      .eq('status', 'active')
      .eq('documents_verified', true)
      .execute();

    if (result.error || !result.data) return [];

    // Filter by distance and sort
    return result.data
      .filter((driver: Driver) => {
        if (!driver.vehicle_type) return false;
        // In a real app, you'd have driver location data
        // For now, we'll use mock locations
        const distance = this.calculateDistance(
          pickup.latitude,
          pickup.longitude,
          37.7749 + (Math.random() - 0.5) * 0.1, // Mock driver location
          -122.4194 + (Math.random() - 0.5) * 0.1
        );
        return distance <= maxDistance;
      })
      .sort((a: Driver, b: Driver) => a.rating > b.rating ? -1 : 1);
  }

  // Create a new ride request
  async requestRide(userId: string, request: RideRequest): Promise<Ride> {
    // Ensure passenger exists and get passenger ID
    const passengerId = await this.ensurePassengerExists(userId);

    const distance = this.calculateDistance(
      request.pickup.latitude,
      request.pickup.longitude,
      request.destination.latitude,
      request.destination.longitude
    );

    const duration = Math.ceil(distance * 2.5); // Estimate: 2.5 minutes per km
    const fare = await this.calculateFare(distance, duration, request.rideType);

    const rideData: RideInsert = {
      passenger_id: passengerId, // Use the actual passenger ID
      pickup_location: request.pickup.address,
      dropoff_location: request.destination.address,
      status: 'active',
      fare: fare,
      distance: distance,
      duration: duration,
      eta: `${Math.ceil(distance * 2)} min`,
    };

    const { data: ride, error } = await ridesTable()
      .insert(rideData)
      .select()
      .single();

    if (error) throw error;

    // Try to assign a driver
    await this.assignDriver(ride.id);

    return ride;
  }

  // Assign a driver to a ride
  private async assignDriver(rideId: string): Promise<void> {
    const { data: ride } = await ridesTable()
      .select('*')
      .eq('id', rideId)
      .single();

    if (!ride) return;

    const drivers = await this.findNearbyDrivers({
      latitude: 37.7749, // Mock pickup location
      longitude: -122.4194,
      address: ride.pickup_location
    });

    if (drivers.length > 0) {
      const assignedDriver = drivers[0];
      
      await ridesTable()
        .update({ 
          driver_id: assignedDriver.id,
          status: 'active'
        })
        .eq('id', rideId);

      // Update driver status
      await driversTable()
        .update({ status: 'active' })
        .eq('id', assignedDriver.id);
    }
  }

  // Get user's ride history
  async getUserRides(userId: string): Promise<Ride[]> {
    // First get the passenger ID for this user
    const passengerId = await this.ensurePassengerExists(userId);
    
    const { data: rides, error } = await ridesTable()
      .select('*')
      .eq('passenger_id', passengerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return rides || [];
  }

  // Cancel a ride
  async cancelRide(rideId: string): Promise<void> {
    const { error } = await ridesTable()
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', rideId);

    if (error) throw error;

    // Free up the driver
    const { data: ride } = await ridesTable()
      .select('driver_id')
      .eq('id', rideId)
      .single();

    if (ride?.driver_id) {
      await driversTable()
        .update({ status: 'active' })
        .eq('id', ride.driver_id);
    }
  }

  // Complete a ride
  async completeRide(rideId: string, actualFare?: number): Promise<void> {
    const updateData: RideUpdate = {
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    if (actualFare) {
      updateData.fare = actualFare;
    }

    const { error } = await ridesTable()
      .update(updateData)
      .eq('id', rideId);

    if (error) throw error;

    // Update driver and passenger stats
    const { data: ride } = await ridesTable()
      .select('driver_id, passenger_id, fare')
      .eq('id', rideId)
      .single();

    if (ride) {
      // Note: RPC functions would need to be implemented in Supabase
      // For now, we'll skip the stats update
      console.log('Stats update skipped - RPC functions not implemented');
    }
  }

  // Ensure passenger record exists and return passenger ID
  private async ensurePassengerExists(userId: string): Promise<string> {
    const { data: profile } = await profilesTable()
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      // If no profile exists, create a basic one
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('User not found');
      
      // Create a passenger with basic info from auth
      const { data: newPassenger, error } = await passengersTable()
        .insert({
          name: user.user.email?.split('@')[0] || 'User',
          email: user.user.email || '',
          phone: '',
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return newPassenger.id;
    }

    // Check if passenger exists
    const { data: existingPassenger } = await passengersTable()
      .select('id')
      .eq('email', profile.email)
      .single();

    if (existingPassenger) {
      return existingPassenger.id;
    }

    // Create new passenger
    const { data: newPassenger, error } = await passengersTable()
      .insert({
        name: profile.full_name || 'User',
        email: profile.email,
        phone: profile.phone || '',
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    return newPassenger.id;
  }

  // Get route estimate
  async getRouteEstimate(pickup: Location, destination: Location, rideType: string): Promise<{
    distance: number;
    duration: number;
    fare: number;
  }> {
    const distance = this.calculateDistance(
      pickup.latitude,
      pickup.longitude,
      destination.latitude,
      destination.longitude
    );

    const duration = Math.ceil(distance * 2.5);
    const fare = await this.calculateFare(distance, duration, rideType);

    return { distance, duration, fare };
  }

  // Subscribe to ride updates
  subscribeToRideUpdates(rideId: string, callback: (ride: Ride) => void) {
    return supabase
      .channel(`ride-${rideId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `id=eq.${rideId}`
      }, (payload) => {
        callback(payload.new as Ride);
      })
      .subscribe();
  }
}

export const rideService = new RideService();