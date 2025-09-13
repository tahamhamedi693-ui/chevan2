import { useState, useEffect, useCallback } from 'react';
import { rideAlgorithm, Trip, RideRequest, Location } from '@/lib/rideAlgorithm';

export function useRideAlgorithm() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Request a new ride
  const requestRide = useCallback(async (
    pickup: Location,
    destination: Location,
    rideType: 'economy' | 'comfort' | 'luxury',
    passengers: number = 1,
    passengerId: string
  ): Promise<Trip> => {
    setLoading(true);
    
    try {
      // Get route estimate
      const estimate = rideAlgorithm.getRouteEstimate(pickup, destination, rideType);
      
      const request: RideRequest = {
        id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        passengerId,
        pickup,
        destination,
        rideType,
        passengers,
        estimatedFare: estimate.fare,
        estimatedDuration: estimate.duration,
        distance: estimate.distance
      };

      const trip = await rideAlgorithm.requestRide(request);
      setActiveTrip(trip);
      
      // Subscribe to trip updates
      const unsubscribe = rideAlgorithm.subscribeToTrip(trip.id, (updatedTrip) => {
        setActiveTrip(updatedTrip);
        
        // If trip is completed or cancelled, move to history
        if (updatedTrip.status === 'completed' || updatedTrip.status === 'cancelled') {
          setActiveTrip(null);
          setTripHistory(prev => [updatedTrip, ...prev]);
        }
      });

      return trip;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel active trip
  const cancelTrip = useCallback((reason?: string) => {
    if (activeTrip) {
      rideAlgorithm.cancelTrip(activeTrip.id, reason);
    }
  }, [activeTrip]);

  // Complete active trip (for demo purposes)
  const completeTrip = useCallback(() => {
    if (activeTrip) {
      rideAlgorithm.completeTrip(activeTrip.id);
    }
  }, [activeTrip]);

  // Get route estimate
  const getRouteEstimate = useCallback((
    pickup: Location,
    destination: Location,
    rideType: string
  ) => {
    return rideAlgorithm.getRouteEstimate(pickup, destination, rideType);
  }, []);

  // Load trip history for a passenger
  const loadTripHistory = useCallback((passengerId: string) => {
    const trips = rideAlgorithm.getPassengerTrips(passengerId);
    setTripHistory(trips);
    
    // Check for any active trips
    const active = trips.find(trip => 
      ['requested', 'driver_assigned', 'driver_arriving', 'driver_arrived', 'in_progress'].includes(trip.status)
    );
    
    if (active) {
      setActiveTrip(active);
      
      // Subscribe to updates
      rideAlgorithm.subscribeToTrip(active.id, (updatedTrip) => {
        setActiveTrip(updatedTrip);
        
        if (updatedTrip.status === 'completed' || updatedTrip.status === 'cancelled') {
          setActiveTrip(null);
          setTripHistory(prev => [updatedTrip, ...prev.filter(t => t.id !== updatedTrip.id)]);
        }
      });
    }
  }, []);

  return {
    activeTrip,
    tripHistory,
    loading,
    requestRide,
    cancelTrip,
    completeTrip,
    getRouteEstimate,
    loadTripHistory
  };
}