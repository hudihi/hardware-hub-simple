import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationMessage, LocationUser, websocketService } from '../services/websocket.service';

interface UseLiveLocationsReturn {
  users: LocationUser[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useLiveLocations = (): UseLiveLocationsReturn => {
  const [users, setUsers] = useState<LocationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track connection state in the interval so we never
  // recreate the callback (which was causing the retry storm).
  const isConnectedRef = useRef(false);

  const handleMessage = useCallback((message: LocationMessage) => {
    if (message.type === 'users_update') {
      setUsers(message.data);
      setError(null);
    }
  }, []);

  const reconnect = useCallback(() => {
    setError(null);
    websocketService.disconnect();
    setTimeout(() => websocketService.connect(), 1000);
  }, []);

  useEffect(() => {
    // VisitorTracker already owns the connection — just subscribe to messages.
    const unsubscribe = websocketService.onMessage(handleMessage);

    // Poll connection state via a ref so this interval never needs to be
    // recreated and never triggers a useEffect re-run.
    const intervalId = setInterval(() => {
      const live = websocketService.isConnected();
      if (live !== isConnectedRef.current) {
        isConnectedRef.current = live;
        setIsConnected(live);
        if (!live) setError('Connection to location service lost');
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [handleMessage]); // stable — handleMessage never changes

  return { users, isConnected, error, reconnect };
};

export default useLiveLocations;
