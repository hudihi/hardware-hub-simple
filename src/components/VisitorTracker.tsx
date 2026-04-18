import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { websocketService } from '../services/websocket.service';

const INACTIVITY_TIMEOUT_MS = 30_000;

function getPageStatus(pathname: string): 'visitor' | 'engaged' {
  if (
    pathname.startsWith('/products') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout')
  ) {
    return 'engaged';
  }
  return 'visitor';
}

const VisitorTracker: React.FC = () => {
  const location = useLocation();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    websocketService.connect();
  }, []);

  useEffect(() => {
    const pageStatus = getPageStatus(location.pathname);
    websocketService.sendMessage({ type: pageStatus });

    const resetInactivityTimer = () => {
      websocketService.sendMessage({ type: 'active' });

      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        websocketService.sendMessage({ type: pageStatus });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [location.pathname]);

  return null;
};

export default VisitorTracker;
