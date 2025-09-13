export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  location: Location;
  isAvailable: boolean;
  isOnline: boolean;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  pickup: Location;
  destination: Location;
  rideType: 'economy' | 'comfort' | 'luxury';
  passengers: number;
  scheduledTime?: Date;
  estimatedFare: number;
  estimatedDuration: number;
  distance: number;
}

export interface Trip {
  id: string;
  passengerId: string;
  driverId?: string;
  driver?: Driver;
  pickup: Location;
  destination: Location;
  rideType: string;
  status: 'requested' | 'driver_assigned' | 'driver_arriving' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';
  estimatedFare: number;
  actualFare?: number;
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  passengers: number;
  requestedAt: Date;
  driverAssignedAt?: Date;
  pickupTime?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  route?: Location[];
  currentLocation?: Location;
  eta?: number;
  progress?: number;
}

// Mock driver data for demonstration
const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'John Smith',
    rating: 4.9,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      licensePlate: 'ABC 123'
    },
    location: {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      address: 'Downtown SF'
    },
    isAvailable: true,
    isOnline: true
  },
  {
    id: 'driver-2',
    name: 'Sarah Johnson',
    rating: 4.8,
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      color: 'Black',
      licensePlate: 'XYZ 789'
    },
    location: {
      latitude: 37.7849 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4094 + (Math.random() - 0.5) * 0.01,
      address: 'Mission District'
    },
    isAvailable: true,
    isOnline: true
  },
  {
    id: 'driver-3',
    name: 'Mike Davis',
    rating: 4.7,
    vehicle: {
      make: 'BMW',
      model: '3 Series',
      year: 2023,
      color: 'White',
      licensePlate: 'LUX 456'
    },
    location: {
      latitude: 37.7649 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4294 + (Math.random() - 0.5) * 0.01,
      address: 'SOMA'
    },
    isAvailable: true,
    isOnline: true
  }
];

export class RideAlgorithm {
  private trips: Map<string, Trip> = new Map();
  private drivers: Driver[] = [...mockDrivers];
  private listeners: Map<string, (trip: Trip) => void> = new Map();

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
  calculateFare(distance: number, duration: number, rideType: string, surgeMultiplier: number = 1): number {
    const baseFares = {
      'economy': 2.50,
      'comfort': 3.50,
      'luxury': 5.00
    };

    const perKmRates = {
      'economy': 1.20,
      'comfort': 1.80,
      'luxury': 2.50
    };

    const perMinuteRates = {
      'economy': 0.25,
      'comfort': 0.35,
      'luxury': 0.50
    };

    const baseFare = baseFares[rideType as keyof typeof baseFares] || baseFares.economy;
    const perKmRate = perKmRates[rideType as keyof typeof perKmRates] || perKmRates.economy;
    const perMinuteRate = perMinuteRates[rideType as keyof typeof perMinuteRates] || perMinuteRates.economy;

    const fare = (baseFare + (distance * perKmRate) + (duration * perMinuteRate)) * surgeMultiplier;
    return Math.round(fare * 100) / 100; // Round to 2 decimal places
  }

  // Find nearby available drivers
  findNearbyDrivers(pickup: Location, maxDistance: number = 10): Driver[] {
    return this.drivers.filter(driver => {
      if (!driver.isAvailable || !driver.isOnline) return false;
      
      const distance = this.calculateDistance(
        pickup.latitude,
        pickup.longitude,
        driver.location.latitude,
        driver.location.longitude
      );
      
      return distance <= maxDistance;
    }).sort((a, b) => {
      // Sort by distance first, then by rating
      const distanceA = this.calculateDistance(pickup.latitude, pickup.longitude, a.location.latitude, a.location.longitude);
      const distanceB = this.calculateDistance(pickup.latitude, pickup.longitude, b.location.latitude, b.location.longitude);
      
      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }
      
      return b.rating - a.rating;
    });
  }

  // Request a ride
  async requestRide(request: RideRequest): Promise<Trip> {
    const trip: Trip = {
      id: request.id,
      passengerId: request.passengerId,
      pickup: request.pickup,
      destination: request.destination,
      rideType: request.rideType,
      status: 'requested',
      estimatedFare: request.estimatedFare,
      estimatedDuration: request.estimatedDuration,
      distance: request.distance,
      passengers: request.passengers,
      requestedAt: new Date(),
      progress: 0
    };

    this.trips.set(trip.id, trip);

    // Start driver matching process
    this.matchDriver(trip);

    return trip;
  }

  // Match driver to trip
  private async matchDriver(trip: Trip): Promise<void> {
    // Simulate driver search time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const nearbyDrivers = this.findNearbyDrivers(trip.pickup);
    
    if (nearbyDrivers.length === 0) {
      trip.status = 'cancelled';
      trip.cancelledAt = new Date();
      this.notifyListeners(trip);
      return;
    }

    // Assign the best available driver
    const assignedDriver = nearbyDrivers[0];
    assignedDriver.isAvailable = false;

    trip.driverId = assignedDriver.id;
    trip.driver = assignedDriver;
    trip.status = 'driver_assigned';
    trip.driverAssignedAt = new Date();

    // Calculate ETA to pickup
    const distanceToPickup = this.calculateDistance(
      assignedDriver.location.latitude,
      assignedDriver.location.longitude,
      trip.pickup.latitude,
      trip.pickup.longitude
    );
    
    trip.eta = Math.ceil(distanceToPickup * 2); // Rough estimate: 2 minutes per km

    this.trips.set(trip.id, trip);
    this.notifyListeners(trip);

    // Start driver arrival simulation
    this.simulateDriverArrival(trip);
  }

  // Simulate driver arrival and trip progress
  private async simulateDriverArrival(trip: Trip): Promise<void> {
    // Driver arriving phase
    trip.status = 'driver_arriving';
    this.notifyListeners(trip);

    // Simulate driver arrival time
    const arrivalTime = (trip.eta || 5) * 1000; // Convert to milliseconds
    await new Promise(resolve => setTimeout(resolve, arrivalTime));

    // Driver arrived
    trip.status = 'driver_arrived';
    trip.eta = 0;
    this.notifyListeners(trip);

    // Wait for passenger pickup (simulate 2 minutes)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Trip started
    trip.status = 'in_progress';
    trip.pickupTime = new Date();
    trip.progress = 0;
    this.notifyListeners(trip);

    // Simulate trip progress
    this.simulateTripProgress(trip);
  }

  // Simulate trip progress
  private async simulateTripProgress(trip: Trip): Promise<void> {
    const totalDuration = trip.estimatedDuration * 60 * 1000; // Convert to milliseconds
    const updateInterval = 5000; // Update every 5 seconds
    const totalUpdates = Math.floor(totalDuration / updateInterval);

    for (let i = 1; i <= totalUpdates; i++) {
      await new Promise(resolve => setTimeout(resolve, updateInterval));
      
      trip.progress = (i / totalUpdates) * 100;
      trip.eta = Math.ceil((totalUpdates - i) * (updateInterval / 1000 / 60)); // Minutes remaining
      
      // Update current location (simulate movement)
      const progressRatio = i / totalUpdates;
      trip.currentLocation = {
        latitude: trip.pickup.latitude + (trip.destination.latitude - trip.pickup.latitude) * progressRatio,
        longitude: trip.pickup.longitude + (trip.destination.longitude - trip.pickup.longitude) * progressRatio,
        address: `En route to ${trip.destination.address}`
      };

      this.notifyListeners(trip);
    }

    // Trip completed
    this.completeTrip(trip.id);
  }

  // Complete a trip
  completeTrip(tripId: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) return;

    trip.status = 'completed';
    trip.completedAt = new Date();
    trip.progress = 100;
    trip.eta = 0;
    
    // Calculate actual duration
    if (trip.pickupTime) {
      trip.actualDuration = Math.ceil((Date.now() - trip.pickupTime.getTime()) / 1000 / 60);
    }

    // Calculate actual fare (could include surge, tolls, etc.)
    trip.actualFare = trip.estimatedFare + (Math.random() - 0.5) * 2; // Small variation

    // Make driver available again
    if (trip.driver) {
      const driver = this.drivers.find(d => d.id === trip.driver!.id);
      if (driver) {
        driver.isAvailable = true;
        // Update driver location to destination
        driver.location = { ...trip.destination };
      }
    }

    this.trips.set(tripId, trip);
    this.notifyListeners(trip);
  }

  // Cancel a trip
  cancelTrip(tripId: string, reason?: string): void {
    const trip = this.trips.get(tripId);
    if (!trip) return;

    trip.status = 'cancelled';
    trip.cancelledAt = new Date();

    // Make driver available again if assigned
    if (trip.driver) {
      const driver = this.drivers.find(d => d.id === trip.driver!.id);
      if (driver) {
        driver.isAvailable = true;
      }
    }

    this.trips.set(tripId, trip);
    this.notifyListeners(trip);
  }

  // Get trip by ID
  getTrip(tripId: string): Trip | undefined {
    return this.trips.get(tripId);
  }

  // Get all trips for a passenger
  getPassengerTrips(passengerId: string): Trip[] {
    return Array.from(this.trips.values())
      .filter(trip => trip.passengerId === passengerId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  // Subscribe to trip updates
  subscribeToTrip(tripId: string, callback: (trip: Trip) => void): () => void {
    this.listeners.set(tripId, callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(tripId);
    };
  }

  // Notify listeners of trip updates
  private notifyListeners(trip: Trip): void {
    const listener = this.listeners.get(trip.id);
    if (listener) {
      listener(trip);
    }
  }

  // Get estimated time and fare for a route
  getRouteEstimate(pickup: Location, destination: Location, rideType: string): {
    distance: number;
    duration: number;
    fare: number;
  } {
    const distance = this.calculateDistance(
      pickup.latitude,
      pickup.longitude,
      destination.latitude,
      destination.longitude
    );

    // Estimate duration based on distance (rough calculation)
    const duration = Math.ceil(distance * 2.5); // ~2.5 minutes per km in city traffic

    const fare = this.calculateFare(distance, duration, rideType);

    return { distance, duration, fare };
  }

  // Update driver location (for real-time tracking)
  updateDriverLocation(driverId: string, location: Location): void {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.location = location;
      
      // Update any active trips with this driver
      const activeTrip = Array.from(this.trips.values())
        .find(trip => trip.driverId === driverId && 
               ['driver_assigned', 'driver_arriving', 'driver_arrived', 'in_progress'].includes(trip.status));
      
      if (activeTrip) {
        activeTrip.currentLocation = location;
        this.notifyListeners(activeTrip);
      }
    }
  }
}

// Singleton instance
export const rideAlgorithm = new RideAlgorithm();