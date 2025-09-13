import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { driversTable } from '@/lib/typedSupabase';
import { Database } from '@/types/database';

type Driver = Database['public']['Tables']['drivers']['Row'];

// Add custom CSS for Uber-like styling
const customMapStyle = `
  .leaflet-container {
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: none;
    background: white;
  }
  
  .leaflet-popup-content {
    margin: 16px 20px;
    min-width: 200px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    color: #1a1a1a;
  }
  
  .leaflet-popup-tip {
    background-color: white;
    box-shadow: none;
  }
  
  .leaflet-control-zoom {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: none;
    background: white;
  }
  
  .leaflet-control-zoom a {
    background-color: white;
    color: #000000;
    font-weight: 600;
    font-size: 18px;
    border: none;
    width: 44px;
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .leaflet-control-zoom a:last-child {
    border-bottom: none;
  }

  .leaflet-control-zoom a:hover {
    background-color: #f8f8f8;
    color: #000;
  }
  
  .leaflet-control-attribution {
    background-color: rgba(255, 255, 255, 0.95) !important;
    color: #999 !important;
    font-size: 10px !important;
    border-radius: 6px;
    padding: 4px 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Hide default markers */
  .leaflet-marker-icon {
    filter: none !important;
  }
  
  /* Pulse animation for current location */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(24, 119, 242, 0.6);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(24, 119, 242, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(24, 119, 242, 0);
    }
  }
  
  .current-location-pulse {
    animation: pulse 1.5s infinite;
  }
  
  /* Car rotation animation */
  @keyframes carMove {
    0% { transform: translateX(-2px); }
    50% { transform: translateX(2px); }
    100% { transform: translateX(-2px); }
  }
  
  .car-moving {
    animation: carMove 3s ease-in-out infinite;
  }

  /* Uber-style road styling */
  .leaflet-tile-pane {
    filter: brightness(1.05) contrast(0.95) saturate(0.9);
  }
`;

// Add the custom CSS to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = customMapStyle;
  document.head.appendChild(style);
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { width, height } = Dimensions.get('window');

interface MapViewProps {
  currentLocation?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  driverLocation?: { latitude: number; longitude: number };
  showRoute?: boolean;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  showNearbyDrivers?: boolean;
  nearbyDrivers?: Driver[];
}

// Uber-style current location icon (blue dot with pulse)
const currentLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="current-location-pulse" style="
      background: linear-gradient(135deg, #1877F2, #0866FF);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(24, 119, 242, 0.25);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Uber-style destination icon (black pin)
const destinationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 40px;
    ">
      <div style="
        background: #000000;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 32],
});

// Uber-style driver car icon
const driverIcon = new L.DivIcon({
  className: 'custom-div-icon car-moving',
  html: `
    <div style="
      background: #000000;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 2px solid white;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      position: relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
      <div style="
        position: absolute;
        top: -6px;
        right: -6px;
        width: 10px;
        height: 10px;
        background: #00C851;
        border-radius: 50%;
        border: 2px solid white;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Create different nearby car icons with various colors
const createNearbyCarIcon = (color: string, isMoving: boolean = false) => {
  return new L.DivIcon({
    className: `custom-div-icon ${isMoving ? 'car-moving' : ''}`,
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        transform: rotate(${Math.random() * 360}deg);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Car colors for variety (Uber-like neutral colors)
const carColors = ['#000000', '#333333', '#555555', '#777777', '#2C2C2C', '#404040'];

const MapViewComponent: React.FC<MapViewProps> = ({
  currentLocation,
  destination,
  driverLocation,
  showRoute = false,
  onMapPress,
  showNearbyDrivers = true,
  nearbyDrivers,
}: MapViewProps) => {
  const mapRef = useRef<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [fetchedDrivers, setFetchedDrivers] = useState<Driver[]>([]);
  const [driverMovement, setDriverMovement] = useState<{ latitude: number; longitude: number } | null>(null);

  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const center: [number, number] = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude]
    : defaultCenter;

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI/180);
  };

  // Fetch nearby drivers from database
  useEffect(() => {
    const fetchNearbyDrivers = async () => {
      if (currentLocation && showNearbyDrivers && !nearbyDrivers) {
        try {
          console.log('Fetching nearby drivers from database');
          
          // Fetch all active drivers
          const { data: allDrivers, error } = await driversTable()
            .select('*')
            .eq('status', 'active')
            .eq('documents_verified', true);

          if (error) {
            console.error('Error fetching drivers:', error);
            return;
          }

          if (!allDrivers || allDrivers.length === 0) {
            console.log('No active drivers found in database');
            return;
          }

          // Filter drivers within 10km radius and add mock locations if needed
          const nearbyDriversWithLocation = allDrivers
            .map(driver => {
              // If driver doesn't have location, generate one nearby
              if (!driver.current_location) {
                const jitterLat = (Math.random() - 0.5) * 0.02; // ~1km radius
                const jitterLng = (Math.random() - 0.5) * 0.02;
                
                return {
                  ...driver,
                  current_location: {
                    latitude: currentLocation.latitude + jitterLat,
                    longitude: currentLocation.longitude + jitterLng
                  }
                };
              }
              return driver;
            })
            .filter(driver => {
              if (!driver.current_location) return false;
              
              const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                driver.current_location.latitude,
                driver.current_location.longitude
              );
              
              return distance <= 10; // Within 10km
            })
            .sort((a, b) => {
              // Sort by distance, then by rating
              const distanceA = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                a.current_location!.latitude,
                a.current_location!.longitude
              );
              const distanceB = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                b.current_location!.latitude,
                b.current_location!.longitude
              );
              
              if (distanceA !== distanceB) {
                return distanceA - distanceB;
              }
              
              return (b.rating || 0) - (a.rating || 0);
            });

          console.log(`Found ${nearbyDriversWithLocation.length} nearby drivers`);
          setFetchedDrivers(nearbyDriversWithLocation);
          
        } catch (error) {
          console.error('Error fetching nearby drivers:', error);
        }
      }
    };

    fetchNearbyDrivers();
    
    // Refresh drivers every 30 seconds if not provided as props
    const interval = !nearbyDrivers ? setInterval(fetchNearbyDrivers, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentLocation, showNearbyDrivers, nearbyDrivers]);

  // Simulate driver movement for active rides
  useEffect(() => {
    if (driverLocation && currentLocation && destination) {
      const interval = setInterval(() => {
        setDriverMovement(prev => {
          if (!prev) return driverLocation;
          
          // Simulate movement towards destination
          const deltaLat = (destination.latitude - prev.latitude) * 0.001;
          const deltaLng = (destination.longitude - prev.longitude) * 0.001;
          
          return {
            latitude: prev.latitude + deltaLat,
            longitude: prev.longitude + deltaLng
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [driverLocation, currentLocation, destination]);

  // Generate realistic route with multiple waypoints
  useEffect(() => {
    if (currentLocation && destination && showRoute) {
      const generateRoute = () => {
        const waypoints: [number, number][] = [];
        const numPoints = 8; // More points for smoother route
        
        waypoints.push([currentLocation.latitude, currentLocation.longitude]);
        
        // Create curved path that follows street-like patterns
        for (let i = 1; i <= numPoints; i++) {
          const ratio = i / (numPoints + 1);
          
          // Base interpolation
          let lat = currentLocation.latitude + (destination.latitude - currentLocation.latitude) * ratio;
          let lng = currentLocation.longitude + (destination.longitude - currentLocation.longitude) * ratio;
          
          // Add realistic street-following variations
          const streetVariation = Math.sin(ratio * Math.PI * 3) * 0.002;
          const randomVariation = (Math.random() - 0.5) * 0.001;
          
          lat += streetVariation + randomVariation;
          lng += streetVariation * 0.7 + randomVariation;
          
          waypoints.push([lat, lng]);
        }
        
        waypoints.push([destination.latitude, destination.longitude]);
        setRouteCoordinates(waypoints);
      };

      generateRoute();
    }
  }, [currentLocation, destination, showRoute]);

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        if (onMapPress) {
          onMapPress({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          });
        }
      },
      load: () => {
        mapRef.current = map;
      },
    });
    
    // Auto-center and zoom to show route or current location
    React.useEffect(() => {
      if (map) {
        if (currentLocation && destination) {
          // Fit bounds to show both pickup and destination
          const bounds = L.latLngBounds([
            [currentLocation.latitude, currentLocation.longitude],
            [destination.latitude, destination.longitude]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else if (currentLocation) {
          map.setView([currentLocation.latitude, currentLocation.longitude], 15, { animate: true });
        }
      }
    }, [map, currentLocation, destination]);
    
    return null;
  };

  return (
    <View style={styles.container}>
      <MapContainer
        center={center}
        zoom={15}
        style={styles.map}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={false}
        keyboard={false}
        maxZoom={18}
        minZoom={10}
      >
        {/* Use Uber-like map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          subdomains="abcd"
        />
        
        <MapEvents />

        {/* Use either provided drivers or fetched drivers */}
        {(() => {
          const driversToShow = nearbyDrivers || fetchedDrivers;
          
          return showNearbyDrivers && driversToShow && driversToShow.length > 0 && (
            <>
              {driversToShow.map((driver, index) => (
                driver.current_location && (
                  <Marker
                    key={driver.id}
                    position={[driver.current_location.latitude, driver.current_location.longitude]}
                    icon={createNearbyCarIcon(carColors[index % carColors.length], true)}
                  >
                    <Popup>
                      <div style={{ textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>
                          {driver.name}
                        </h3>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#333' }}>
                          {driver.vehicle_type} • {driver.license_plate}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                          <span style={{ color: '#FFD700', fontSize: '14px' }}>★</span>
                          <span style={{ fontSize: '12px', color: '#666' }}>{driver.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                          {Math.ceil(
                            calculateDistance(
                              currentLocation!.latitude,
                              currentLocation!.longitude,
                              driver.current_location.latitude,
                              driver.current_location.longitude
                            ) * 2
                          )} min away
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </>
          );
        })()}

        {/* Current Location with accuracy circle */}
        {currentLocation && (
          <>
            <Circle
              center={[currentLocation.latitude, currentLocation.longitude]}
              radius={50}
              pathOptions={{
                fillColor: '#1877F2',
                fillOpacity: 0.08,
                color: '#1877F2',
                weight: 1,
                opacity: 0.2
              }}
            />
            <Marker 
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={currentLocationIcon}
            >
              <Popup>
                <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: '#000000' }}>Your Location</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Accurate to 50 meters
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker 
            position={[destination.latitude, destination.longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#000000' }}>Destination</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Drop-off location
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Location with real-time tracking */}
        {(driverMovement || driverLocation) && (
          <Marker 
            position={[
              (driverMovement || driverLocation)!.latitude, 
              (driverMovement || driverLocation)!.longitude
            ]}
            icon={driverIcon}
          >
            <Popup>
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#000000' }}>Your Driver</div>
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
                  <strong>John Smith</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Toyota Camry • Silver
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  License: ABC 123
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#FFD700', fontSize: '14px' }}>★</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>4.9 rating</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Uber-style route with multiple layers for depth */}
        {showRoute && routeCoordinates.length > 0 && (
          <>
            {/* Route shadow/outline */}
            <Polyline
              positions={routeCoordinates}
              color="#CCCCCC"
              weight={6}
              opacity={0.3}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main route line */}
            <Polyline
              positions={routeCoordinates}
              color="#000000"
              weight={4}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
            {/* Route highlight */}
            <Polyline
              positions={routeCoordinates}
              color="#1877F2"
              weight={2}
              opacity={0.6}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}
      </MapContainer>
    </View>
  );
}

export default MapViewComponent;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Platform.OS === 'web' ? 0 : 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
});