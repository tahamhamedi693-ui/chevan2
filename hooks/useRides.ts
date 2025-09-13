import { useState, useEffect, useCallback } from 'react';
import { rideService, Location, RideRequest } from '@/lib/rideService';
import { Database } from '@/types/database';
import { useAuth } from './useAuth';

type Ride = Database['public']['Tables']['rides']['Row'];

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load user's rides
  const loadRides = useCallback(async (): Promise<{ rides: Ride[], activeRide: Ride | null } | null> => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userRides = await rideService.getUserRides(user.id);
      setRides(userRides);
      
      // Find active ride
      const active = userRides.find(ride => ride.status === 'active');
      setActiveRide(active || null);
      
      return { rides: userRides, activeRide: active || null };
    } catch (error) {
      console.error('Error loading rides:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Request a new ride
  const requestRide = useCallback(async (request: RideRequest): Promise<Ride> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const ride = await rideService.requestRide(user.id, request);
      setActiveRide(ride);
      await loadRides();
      return ride;
    } finally {
      setLoading(false);
    }
  }, [user, loadRides]);

  // Cancel active ride
  const cancelRide = useCallback(async (rideId: string) => {
    setLoading(true);
    try {
      await rideService.cancelRide(rideId);
      setActiveRide(null);
      await loadRides();
    } finally {
      setLoading(false);
    }
  }, [loadRides]);

  // Complete active ride
  const completeRide = useCallback(async (rideId: string, actualFare?: number) => {
    setLoading(true);
    try {
      await rideService.completeRide(rideId, actualFare);
      setActiveRide(null);
      await loadRides();
    } finally {
      setLoading(false);
    }
  }, [loadRides]);

  // Get route estimate
  const getRouteEstimate = useCallback(async (
    pickup: Location,
    destination: Location,
    rideType: string
  ) => {
    return await rideService.getRouteEstimate(pickup, destination, rideType);
  }, []);

  // Load rides on mount
  useEffect(() => {
    loadRides();
  }, [loadRides]);

  return {
    rides,
    activeRide,
    loading,
    requestRide,
    cancelRide,
    completeRide,
    getRouteEstimate,
    loadRides
  };
}