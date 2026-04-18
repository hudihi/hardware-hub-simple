import { DivIcon, Icon, LatLngBounds, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { memo, useEffect, useRef } from 'react';
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

// Pre-created once — same object reference forever, prevents Leaflet from
// tearing down and rebuilding marker DOM nodes on every WebSocket message.
const ICONS: Record<string, DivIcon> = {
  active: new DivIcon({
    className: '',
    html: '<div class="lm-pulse-wrapper"><div class="lm-pulse-ring"></div><div class="lm-pulse-ring"></div><div class="lm-pulse-dot lm-dot-active"></div></div>',
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
  }),
  visitor: new DivIcon({
    className: '',
    html: '<div class="lm-pulse-wrapper"><div class="lm-pulse-dot lm-dot-visitor"></div></div>',
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
  }),
  engaged: new DivIcon({
    className: '',
    html: '<div class="lm-pulse-wrapper"><div class="lm-pulse-dot lm-dot-engaged"></div></div>',
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
  }),
};

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

// Stable style objects — defined outside render to avoid new references each cycle
const MAP_STYLE = { height: '100%', width: '100%' };

const LiveMap: React.FC<LiveMapProps> = ({
  users,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const prevUserIdsRef = useRef<string>('');

  // Only re-fit bounds when the set of users changes (join/leave), not on every status ping
  useEffect(() => {
    if (!mapRef.current) return;

    const currentIds = users.map(u => u.user_id).sort().join(',');
    if (currentIds === prevUserIdsRef.current) return;
    prevUserIdsRef.current = currentIds;

    if (users.length === 0) {
      mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const positions: [number, number][] = users.map(u => [u.latitude, u.longitude]);
    try {
      if (positions.length === 1) {
        mapRef.current.setView(positions[0], DEFAULT_ZOOM);
      } else {
        mapRef.current.fitBounds(new LatLngBounds(positions), { padding: [20, 20], maxZoom: DEFAULT_ZOOM });
      }
    } catch (e) {
      console.error('Error updating map bounds:', e);
    }
  }, [users]);

  return (
    <div className={`live-map-container ${className}`} style={{ height }}>
      {/* Map ALWAYS renders - markers are conditional */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={MAP_STYLE}
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
          const icon = ICONS[userStatus] ?? ICONS.visitor;

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

// Only re-render when user IDs or their statuses change — ignore unrelated parent updates
export default memo(LiveMap, (prev, next) => {
  if (prev.height !== next.height || prev.className !== next.className) return false;
  if (prev.users.length !== next.users.length) return false;
  return prev.users.every((u, i) =>
    u.user_id === next.users[i].user_id && u.status === next.users[i].status
  );
});
