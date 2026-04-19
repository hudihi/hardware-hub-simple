import { DivIcon, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { memo, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocationUser } from '../../services/websocket.service';

delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const MARKER_STYLES = {
  active:  { color: '#198754', label: 'Active' },
  visitor: { color: '#6c757d', label: 'Visitor' },
  engaged: { color: '#0d6efd', label: 'Engaged' },
} as const;

const DEFAULT_CENTER: [number, number] = [-6.8, 39.2];
const DEFAULT_ZOOM = 11;
const MAP_STYLE = { height: '100%', width: '100%' };

// ─── Inner controller — lives inside MapContainer so useMap() is always valid ──
const BoundsController: React.FC<{ users: LocationUser[] }> = ({ users }) => {
  const map = useMap();
  const prevIdsRef = useRef<string>('');

  useEffect(() => {
    const currentIds = users.map(u => u.user_id).sort().join(',');
    if (currentIds === prevIdsRef.current) return;
    prevIdsRef.current = currentIds;

    if (users.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const positions: [number, number][] = users.map(u => [u.latitude, u.longitude]);
    try {
      if (positions.length === 1) {
        map.setView(positions[0], DEFAULT_ZOOM);
      } else {
        map.fitBounds(new LatLngBounds(positions), { padding: [20, 20], maxZoom: DEFAULT_ZOOM });
      }
    } catch (e) {
      console.error('LiveMap bounds error:', e);
    }
  }, [users, map]);

  return null;
};

interface LiveMapProps {
  users: LocationUser[];
  height?: string;
  className?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ users, height = '400px', className = '' }) => (
  <div className={`live-map-container ${className}`} style={{ height }}>
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={MAP_STYLE}
      className="rounded"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Handles pan/zoom — correct React-Leaflet v4 pattern via useMap() */}
      <BoundsController users={users} />

      {users.map((user) => {
        const status = user.status ?? 'active';
        const sessionMin = user.session_seconds ? Math.floor(user.session_seconds / 60) : 0;
        const sessionSec = user.session_seconds ? user.session_seconds % 60 : 0;
        const sessionLabel = sessionMin > 0 ? `${sessionMin}m ${sessionSec}s` : `${sessionSec}s`;

        const deviceIcon = user.device_type === 'mobile' ? '📱'
          : user.device_type === 'tablet' ? '📋' : '💻';

        const referrerLabel = !user.referrer ? 'Direct'
          : user.referrer.includes('google') ? 'Google'
          : user.referrer.includes('facebook') ? 'Facebook'
          : user.referrer.includes('instagram') ? 'Instagram'
          : new URL(user.referrer).hostname;

        return (
          <Marker
            key={user.user_id}
            position={[user.latitude, user.longitude]}
            icon={ICONS[status] ?? ICONS.visitor}
          >
            <Popup minWidth={200}>
              <div style={{ fontSize: 12 }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className={`badge bg-${
                    status === 'active' ? 'success' :
                    status === 'visitor' ? 'secondary' : 'primary'
                  }`}>
                    {MARKER_STYLES[status as keyof typeof MARKER_STYLES]?.label ?? 'Visitor'}
                  </span>
                  <span>{deviceIcon} {user.device_type ?? 'desktop'}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#888', paddingRight: 6 }}>📍 Location</td>
                      <td><strong>{user.city ?? '—'}, {user.country ?? '—'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888' }}>📄 Page</td>
                      <td><strong>{user.page_title ?? user.page ?? '/'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888' }}>⏱ Session</td>
                      <td><strong>{sessionLabel}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888' }}>🔗 Source</td>
                      <td><strong>{referrerLabel}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {users.length === 0 && (
      <div
        className="position-absolute top-50 start-50 translate-middle text-center text-muted bg-white bg-opacity-90 rounded p-3"
        style={{ zIndex: 1000 }}
      >
        <i className="bi bi-geo-alt fs-3 mb-2 d-block" />
        <p className="mb-0 fw-semibold">No active users yet</p>
        <small>Waiting for location updates...</small>
      </div>
    )}

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
              const count = users.filter(u => (u.status ?? 'active') === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="d-flex align-items-center gap-1 justify-content-end">
                  <div
                    className="rounded-circle"
                    style={{ width: 8, height: 8, backgroundColor: style.color }}
                  />
                  <span className="small text-muted">{count} {style.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default memo(LiveMap, (prev, next) => {
  if (prev.height !== next.height || prev.className !== next.className) return false;
  if (prev.users.length !== next.users.length) return false;
  return prev.users.every((u, i) =>
    u.user_id === next.users[i].user_id && u.status === next.users[i].status
  );
});
