import React, { useEffect, useState, useRef } from 'react';
import { rideService } from '@/lib/rideService';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add custom CSS for Uber-like styling
const customMapStyle = `
  .leaflet-container {
    background-color: #f8f9fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: none;
    background: white;
  }
  
  .leaflet-popup-content {
    margin: 16px 20px;
    min-width: 200px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
  }
  
  .leaflet-popup-tip {
    background-color: white;
    box-shadow: none;
  }
  
  .leaflet-control-zoom {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: none;
  }
  
  .leaflet-control-zoom a {
    background-color: white;
    color: #1a1a1a;
    font-weight: 600;
    font-size: 18px;
    border: none;
    width: 44px;
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;
  }
  
  .leaflet-control-zoom a:hover {
    background-color: #f5f5f5;
    color: #000;
  }
  
  .leaflet-control-attribution {
    background-color: rgba(255, 255, 255, 0.8) !important;
    color: #666 !important;
    font-size: 10px !important;
    border-radius: 4px;
    padding: 2px 6px;
  }
  
  /* Hide default markers */
  .leaflet-marker-icon {
    filter: none !important;
  }
  
  /* Pulse animation for current location */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
  
  .current-location-pulse {
    animation: pulse 2s infinite;
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
  nearbyDrivers?: Array<{ id: string; current_location: { latitude: number; longitude: number } | null }>;
}

// Uber-style current location icon (blue dot with pulse)
const currentLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="current-location-pulse" style="
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
        background: linear-gradient(135deg, #1a1a1a, #000);
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
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
      background: linear-gradient(135deg, #1a1a1a, #333);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      position: relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
      <div style="
        position: absolute;
        top: -8px;
        right: -8px;
        width: 12px;
        height: 12px;
        background: #10B981;
        border-radius: 50%;
        border: 2px solid white;
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Create different nearby car icons with various colors
const createNearbyCarIcon = (color: string, isMoving: boolean = false) => {
  return new L.DivIcon({
    className: `custom-div-icon ${isMoving ? 'car-moving' : ''}`,
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        transform: rotate(${Math.random() * 360}deg);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Car colors for variety (Uber-like colors)
const carColors = ['#1a1a1a', '#4B5563', '#6B7280', '#374151', '#111827', '#1F2937'];

const MapViewComponent: React.FC<MapViewProps> = ({
  currentLocation,
  destination,
  driverLocation,
  showRoute = false,
  onMapPress,
  showNearbyDrivers = true,
  nearbyDrivers: propNearbyDrivers,
}: MapViewProps) => {
  const mapRef = useRef<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<Array<{ id: string; current_location: { latitude: number; longitude: number } | null }>>([]);
  const [driverMovement, setDriverMovement] = useState<{ latitude: number; longitude: number } | null>(null);

  // Default center (San Francisco)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const center: [number, number] = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude]
    : defaultCenter;

  // Fetch nearby drivers if not provided as props
  useEffect(() => {
    const fetchNearbyDrivers = async () => {
      if (currentLocation && showNearbyDrivers && !propNearbyDrivers) {
        console.log('Fetching nearby drivers from service');
        const drivers = await rideService.getNearbyDrivers(
          currentLocation.latitude,
          currentLocation.longitude
        );
        console.log(`Got ${drivers.length} drivers from service`);
        setNearbyDrivers(drivers);
      } else if (propNearbyDrivers) {
        console.log(`Using ${propNearbyDrivers.length} drivers from props`);
        setNearbyDrivers(propNearbyDrivers);
      }
    };

    fetchNearbyDrivers();
    const interval = !propNearbyDrivers ? setInterval(fetchNearbyDrivers, 15000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentLocation, showNearbyDrivers, propNearbyDrivers]);

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <MapEvents />

        {/* Nearby drivers */}
        {showNearbyDrivers && nearbyDrivers && nearbyDrivers.length > 0 && (
          <>
            {nearbyDrivers.map((driver, index) => (
              driver.current_location && (
                <Marker
                  key={driver.id}
                  position={[driver.current_location.latitude, driver.current_location.longitude]}
                  icon={createNearbyCarIcon(carColors[index % carColors.length], true)}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>Available Driver</h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                        {Math.ceil(Math.random() * 5 + 1)} min away
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </>
        )}

        {/* Current Location with accuracy circle */}
        {currentLocation && (
          <>
            <Circle
              center={[currentLocation.latitude, currentLocation.longitude]}
              radius={50}
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 1,
                opacity: 0.3
              }}
            />
            <Marker 
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={currentLocationIcon}
            >
              <Popup>
                <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1a1a1a' }}>Your Location</div>
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
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1a1a1a' }}>Destination</div>
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
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>Your Driver</div>
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
              color="#000000"
              weight={8}
              opacity={0.2}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main route line */}
            <Polyline
              positions={routeCoordinates}
              color="#1a1a1a"
              weight={5}
              opacity={0.9}
              lineCap="round"
              lineJoin="round"
            />
            {/* Route highlight */}
            <Polyline
              positions={routeCoordinates}
              color="#3B82F6"
              weight={3}
              opacity={0.7}
              lineCap="round"
              lineJoin="round"
              dashArray="0, 10, 5, 10"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});