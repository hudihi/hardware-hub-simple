import { DivIcon, Icon, LatLngBounds, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LocationUser } from '../../services/websocket.service';

// Fix for default Leaflet marker icons in React
delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Inject pulse-dot CSS once
const PULSE_STYLE = `
  @keyframes lm-pulse {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(3.5); opacity: 0;   }
  }
  .lm-pulse-wrapper { position: relative; width: 20px; height: 20px; }
  .lm-pulse-ring {
    position: absolute; inset: 0;
    border-radius: 50%;
    background: rgba(25,135,84,0.35);
    animation: lm-pulse 1.6s ease-out infinite;
  }
  .lm-pulse-ring:nth-child(2) { animation-delay: 0.55s; }
  .lm-pulse-dot {
    position: absolute; top: 3px; left: 3px;
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 6px rgba(25,135,84,0.9);
  }
  .lm-dot-visitor  { background: #6c757d; }
  .lm-dot-active   { background: #198754; }
  .lm-dot-engaged  { background: #0d6efd; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lm-pulse-style')) {
  const el = document.createElement('style');
  el.id = 'lm-pulse-style';
  el.textContent = PULSE_STYLE;
  document.head.appendChild(el);
}

const STATUS_DOT_CLASS: Record<string, string> = {
  active:  'lm-dot-active',
  visitor: 'lm-dot-visitor',
  engaged: 'lm-dot-engaged',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active', visitor: 'Visitor', engaged: 'Engaged',
};

function createMarkerIcon(status: string): DivIcon {
  const dotClass = STATUS_DOT_CLASS[status] ?? STATUS_DOT_CLASS.visitor;
  const rings = status === 'active'
    ? '<div class="lm-pulse-ring"></div><div class="lm-pulse-ring"></div>'
    : '';
  return new DivIcon({
    className: '',
    html: `<div class="lm-pulse-wrapper">${rings}<div class="lm-pulse-dot ${dotClass}"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

// Marker styles (kept for legend rendering)
const MARKER_STYLES = {
  active:  { color: '#198754', label: 'Active' },
  visitor: { color: '#6c757d', label: 'Visitor' },
  engaged: { color: '#0d6efd', label: 'Engaged' },
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
  const mapRef = useRef<LeafletMap | null>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);

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
          const icon = createMarkerIcon(userStatus);

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
                      {MARKER_STYLES[userStatus]?.label ?? 'Visitor'}
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
