import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LocationUser } from '../../services/websocket.service';

// Fix for default Leaflet marker icons in React
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different user statuses
const createCustomIcon = (color: string, animated: boolean = false) => {
  const iconUrl = animated 
    ? `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`
    : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
    
  return new Icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: animated ? 'marker-pulse' : ''
  });
};

// Marker styles
const MARKER_STYLES = {
  active: { color: 'green', animated: true, label: 'Active' }, // Users currently interacting
  visitor: { color: 'gray', animated: false, label: 'Visitor' }, // Existing users not active
  engaged: { color: 'blue', animated: false, label: 'Engaged' } // Users engaged with content
} as const;

interface LiveMapProps {
  users: LocationUser[];
  height?: string;
  className?: string;
}

// Default center: Tanzania (Dar es Salaam)
const DEFAULT_CENTER: [number, number] = [-6.8, 39.2];
const DEFAULT_ZOOM = 11;

/**
 * LiveMap component for displaying real-time user locations
 * Follows SOLID principles - single responsibility for map rendering
 */
const LiveMap: React.FC<LiveMapProps> = ({ 
  users, 
  height = '400px', 
  className = '' 
}) => {
  const mapRef = useRef<any>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);

  // Custom user marker icon
  const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Update map bounds when users change
  useEffect(() => {
    if (!mapRef.current) return;

    if (users.length === 0) {
      // Reset to default center when no users
      mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      boundsRef.current = null;
      return;
    }

    const userPositions: [number, number][] = users.map(user => [user.latitude, user.longitude]);
    
    if (userPositions.length > 0) {
      try {
        const bounds = new LatLngBounds(userPositions);
        boundsRef.current = bounds;
        
        // Only fit bounds if we have multiple users or if map is not already centered
        if (userPositions.length > 1) {
          mapRef.current.fitBounds(bounds, { 
            padding: [20, 20],
            maxZoom: DEFAULT_ZOOM
          });
        } else if (userPositions.length === 1) {
          // Center on single user
          mapRef.current.setView(userPositions[0], DEFAULT_ZOOM);
        }
      } catch (error) {
        console.error('Error updating map bounds:', error);
      }
    }
  }, [users]);

  // Cleanup bounds on unmount
  useEffect(() => {
    return () => {
      boundsRef.current = null;
    };
  }, []);

  return (
    <div className={`live-map-container ${className}`} style={{ height }}>
      {/* Map ALWAYS renders - markers are conditional */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height, width: '100%' }}
        ref={mapRef}
        className="rounded"
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User markers - only render when users exist */}
        {users.map((user) => {
          const userStatus = user.status || 'active';
          const markerStyle = MARKER_STYLES[userStatus] || MARKER_STYLES.active;
          const icon = createCustomIcon(markerStyle.color, markerStyle.animated);
          
          return (
            <Marker
              key={user.user_id}
              position={[user.latitude, user.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="text-center">
                  <strong>User ID</strong><br />
                  <code>{user.user_id}</code><br />
                  <div className="mt-2">
                    <span className={`badge bg-${
                      userStatus === 'active' ? 'success' : 
                      userStatus === 'visitor' ? 'secondary' : 'primary'
                    }`}>
                      {markerStyle.label}
                    </span>
                  </div>
                  <small className="text-muted d-block mt-1">
                    {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* No users overlay - only when no users exist */}
      {users.length === 0 && (
        <div 
          className="position-absolute top-50 start-50 translate-middle text-center text-muted bg-white bg-opacity-90 rounded p-3"
          style={{ zIndex: 1000 }}
        >
          <i className="bi bi-geo-alt fs-3 mb-2 d-block"></i>
          <p className="mb-0 fw-semibold">No active users yet</p>
          <small>Waiting for location updates...</small>
        </div>
      )}
      
      {/* User count indicator - only when users exist */}
      {users.length > 0 && (
        <div 
          className="position-absolute top-0 end-0 m-2 bg-white rounded shadow-sm p-2"
          style={{ zIndex: 1000 }}
        >
          <div className="text-end">
            <div className="small fw-semibold mb-1">
              {users.length} {users.length === 1 ? 'User' : 'Users'} Online
            </div>
            <div className="d-flex flex-column gap-1">
              {Object.entries(MARKER_STYLES).map(([status, style]) => {
                const count = users.filter(u => (u.status || 'active') === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="d-flex align-items-center gap-1 justify-content-end">
                    <div 
                      className="rounded-circle"
                      style={{ 
                        width: '8px', 
                        height: '8px',
                        backgroundColor: status === 'active' ? '#198754' : 
                                       status === 'visitor' ? '#6c757d' : '#0d6efd'
                      }}
                    />
                    <span className="small text-muted">
                      {count} {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
