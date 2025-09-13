  import React, { useEffect, useState } from 'react';
import { rideService } from '@/lib/rideService';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add custom CSS for Moroccan-inspired styling
const customMapStyle = `
  .leaflet-container {
    background-color: #f9f5e9; /* Light sand color */
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #C1272D; /* Moroccan red border */
  }
  
  .leaflet-popup-content {
    margin: 12px 16px;
    min-width: 180px;
    font-family: 'Arial', sans-serif;
  }
  
  .leaflet-popup-tip {
    background-color: #C1272D; /* Moroccan red tip */
  }
  
  .leaflet-control-zoom {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #C1272D; /* Moroccan red border */
  }
  
  .leaflet-control-zoom a {
    background-color: white;
    color: #C1272D; /* Moroccan red text */
    font-weight: bold;
  }
  
  .leaflet-control-zoom a:hover {
    background-color: #f0f0f0;
  }
  
  .leaflet-control-attribution {
    background-color: rgba(255, 255, 255, 0.7) !important;
    color: #666 !important;
    font-size: 10px !important;
  }
  
  /* Add a subtle Moroccan pattern to the map container */
  .leaflet-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L20,20 M20,0 L0,20" stroke="%23C1272D" stroke-width="0.5" opacity="0.05"/></svg>');
    z-index: 1000;
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

// Moroccan-themed custom icons with green current location
const currentLocationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="current-location-pulse" style="
      background-color: #10B981; /* Green color */
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="
      background-color: #006233; /* Moroccan green */
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background-color: white;
        width: 8px;
        height: 8px;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Moroccan taxi icon for drivers
const driverIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="
      background-color: #C1272D; /* Moroccan red */
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Create different car icons for variety
const createCarIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        transform: rotate(${Math.random() * 360}deg);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

// Different car colors for variety
const carColors = ['#C1272D', '#006233', '#000000', '#1E3A8A', '#7E22CE', '#BE185D'];

const MapViewComponent: React.FC<MapViewProps> = ({
  currentLocation,
  destination,
  driverLocation,
  showRoute = false,
  onMapPress,
  showNearbyDrivers = true,
  nearbyDrivers: propNearbyDrivers,
}: MapViewProps) => {
  // Reference to the map
  const mapRef = React.useRef<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<Array<{ id: string; current_location: { latitude: number; longitude: number } | null }>>([]);
  const [nearbyDriversMarkers, setNearbyDriversMarkers] = useState<Array<{position: [number, number], icon: L.DivIcon}>>([]);

  // Default center (Casablanca, Morocco)
  const defaultCenter: [number, number] = [33.5731, -7.5898];
  const center: [number, number] = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude]
    : defaultCenter;

  // Generate random nearby drivers
  const generateNearbyDrivers = (center: [number, number], count: number = 8) => {
    const drivers = [];
    const [centerLat, centerLng] = center;
    
    for (let i = 0; i < count; i++) {
      // Generate random position within ~1-2km of center
      const jitterLat = (Math.random() - 0.5) * 0.02;
      const jitterLng = (Math.random() - 0.5) * 0.02;
      
      const position: [number, number] = [
        centerLat + jitterLat,
        centerLng + jitterLng
      ];
      
      // Randomly select a car color
      const colorIndex = Math.floor(Math.random() * carColors.length);
      const icon = createCarIcon(carColors[colorIndex]);
      
      drivers.push({ position, icon });
    }
    
    return drivers;
  };
  
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
        // Use the drivers provided via props
        console.log(`Using ${propNearbyDrivers.length} drivers from props`);
        setNearbyDrivers(propNearbyDrivers);
      }
    };

    fetchNearbyDrivers();
    // Refresh drivers every 10 seconds if not using prop drivers
    const interval = !propNearbyDrivers ? setInterval(fetchNearbyDrivers, 10000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentLocation, showNearbyDrivers, propNearbyDrivers]);

  useEffect(() => {
    if (currentLocation && destination) {
      // Create a more realistic route with waypoints for a more Uber-like appearance
      // In a real app, you'd use a routing service like OpenRouteService or MapBox
      
      // Generate some intermediate waypoints to make the route look more realistic
      const numPoints = 5; // Number of waypoints
      const waypoints: [number, number][] = [];
      
      // Start with current location
      waypoints.push([currentLocation.latitude, currentLocation.longitude]);
      
      // Add some slight variations to create a curved path
      for (let i = 1; i <= numPoints; i++) {
        const ratio = i / (numPoints + 1);
        
        // Linear interpolation between points
        const lat = currentLocation.latitude + (destination.latitude - currentLocation.latitude) * ratio;
        const lng = currentLocation.longitude + (destination.longitude - currentLocation.longitude) * ratio;
        
        // Add some randomness to make it look like a real street route
        const jitterLat = (Math.random() - 0.5) * 0.005;
        const jitterLng = (Math.random() - 0.5) * 0.005;
        
        waypoints.push([lat + jitterLat, lng + jitterLng]);
      }
      
      // End with destination
      waypoints.push([destination.latitude, destination.longitude]);
      
      setRouteCoordinates(waypoints);
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
        // Store map reference
        mapRef.current = map;
      },
    });
    
    // Always center on current location when it changes
    React.useEffect(() => {
      if (map && currentLocation) {
        map.setView(
          [currentLocation.latitude, currentLocation.longitude],
          15,
          { animate: true }
        );
      }
    }, [map, currentLocation]);
    
    return null;
  };

  return (
    <View style={styles.container}>
      <MapContainer
        center={center}
        zoom={15} // Closer zoom for urban environment like Uber
        style={styles.map}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={false} // Hide attribution for cleaner look
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={false} // Disable box zoom for mobile-like experience
        keyboard={false} // Disable keyboard navigation for mobile-like experience
      >
        {/* Use a modern light map style similar to Uber's daytime look */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        
        <MapEvents />

        {/* Add markers for drivers */}
        {(() => {
          if (showNearbyDrivers && nearbyDrivers && nearbyDrivers.length > 0) {
            console.log(`Rendering ${nearbyDrivers.length} drivers on map`);
            return (
              <>
                {nearbyDrivers.map((driver) => (
                  driver.current_location && (
                    <Marker
                      key={driver.id}
                      position={[driver.current_location.latitude, driver.current_location.longitude]}
                      icon={createCarIcon(carColors[Math.floor(Math.random() * carColors.length)])}
                    >
                      <Popup>
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#C1272D' }}>Available Driver</h3>
                          <p style={{ margin: '0', fontSize: '14px' }}>Ready for pickup</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </>
            );
          } else {
            console.log('No drivers to display');
            return null;
          }
        })()}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={currentLocationIcon}
          >
            <Popup className="modern-popup">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your Location</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker 
            position={[destination.latitude, destination.longitude]}
            icon={destinationIcon}
          >
            <Popup className="modern-popup">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Destination</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Estimated arrival: 12 mins
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker 
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={driverIcon}
          >
            <Popup className="modern-popup">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your Driver</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Toyota Camry • ABC 123 • 4.9 ★
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline - Main route */}
        {showRoute && routeCoordinates.length > 0 && (
          <>
            {/* Shadow/glow effect */}
            <Polyline
              positions={routeCoordinates}
              color="rgba(193, 39, 45, 0.3)" /* Moroccan red with transparency */
              weight={10}
              opacity={0.5}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main route line */}
            <Polyline
              positions={routeCoordinates}
              color="#C1272D" /* Moroccan red */
              weight={4}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
              dashArray="1, 8"
              dashOffset="0"
            />
          </>
        )}
      </MapContainer>
    </View>
  );
}

export default MapViewComponent;

// Add pulsing animation for current location (Green theme)
const pulsingDotStyle = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }
  
  .current-location-pulse {
    animation: pulse 2s infinite;
  }
  .current-location-pulse::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border-radius: 50%;
    background-color: rgba(16, 185, 129, 0.4);
    animation: pulse 2s infinite;
    z-index: -1;
  }

  .current-location-pulse::after {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    width: calc(100% + 16px);
    height: calc(100% + 16px);
    border-radius: 50%;
    background-color: rgba(16, 185, 129, 0.2);
    animation: pulse 2s infinite 0.3s;
    z-index: -2;
  }
`;

// Add the pulsing animation CSS to the document
if (typeof document !== 'undefined') {
  const pulseStyle = document.createElement('style');
  pulseStyle.innerHTML = pulsingDotStyle;
  document.head.appendChild(pulseStyle);
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
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