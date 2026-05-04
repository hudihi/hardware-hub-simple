import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { websocketService } from '../services/websocket.service';
import { authService } from '../services/auth.service';

const INACTIVITY_TIMEOUT_MS = 30_000;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/products': 'Products',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/track-order': 'Track Order',
  '/orders': 'Orders',
  '/otp-verification': 'OTP Verification',
  '/payment-processing': 'Payment Processing',
  '/payment-status': 'Payment Status',
  '/order-confirmation': 'Order Confirmation',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/products/')) return 'Product Detail';
  if (pathname.startsWith('/orders/')) return 'Order Detail';
  if (pathname.startsWith('/track/')) return 'Order Tracking';
  if (pathname.startsWith('/payment-instructions/')) return 'Payment Instructions';
  if (pathname.startsWith('/upload-proof/')) return 'Upload Payment Proof';
  return 'Page';
}

function getPageStatus(pathname: string): 'visitor' | 'engaged' {
  if (
    pathname.startsWith('/products') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payment')
  ) return 'engaged';
  return 'visitor';
}

const VisitorTracker: React.FC = () => {
  const location = useLocation();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const referrerRef = useRef<string>(document.referrer || '');
  const watchIdRef = useRef<number | null>(null);

  // Exclude admin routes AND any browser session where an admin JWT is present.
  // authService.isAuthenticated() reads localStorage synchronously — safe during render.
  const isAdmin =
    location.pathname.startsWith('/admin') || authService.isAuthenticated();

  useEffect(() => {
    if (isAdmin) {
      // Clean up any previously opened connection if the admin navigates back to the portal.
      websocketService.disconnect();
      return;
    }

    websocketService.connect();

    const startGeoWatch = () => {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          websocketService.sendMessage({
            type: 'location_update',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
      );
    };

    const timerId = setTimeout(startGeoWatch, 500);

    return () => {
      clearTimeout(timerId);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    const pathname = location.pathname;
    const pageStatus = getPageStatus(pathname);

    websocketService.sendMessage({
      type: 'page_update',
      page: pathname,
      page_title: getPageTitle(pathname),
      referrer: referrerRef.current,
    });

    websocketService.sendMessage({ type: pageStatus });

    const handleActivity = () => {
      websocketService.sendMessage({ type: 'active' });
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        websocketService.sendMessage({ type: pageStatus });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [location.pathname, isAdmin]);

  return null;
};

export default VisitorTracker;
