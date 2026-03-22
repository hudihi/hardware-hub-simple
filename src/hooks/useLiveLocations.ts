import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocationMessage, LocationUser, websocketService } from '../services/websocket.service';

// Interface for the hook's return value
interface UseLiveLocationsReturn {
  users: LocationUser[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

/**
 * Custom hook for managing live user locations via WebSocket
 * Follows SOLID principles - single responsibility for location state management
 */
export const useLiveLocations = (): UseLiveLocationsReturn => {
  const [users, setUsers] = useState<LocationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message: LocationMessage) => {
    try {
      if (message.type === 'users_update') {
        setUsers(message.data);
        setError(null);
        console.log('Live locations updated:', message.data.length, 'users');
      }
    } catch (err) {
      console.error('Error handling location message:', err);
      setError('Failed to process location updates');
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (user?.id) {
      setError(null);
      websocketService.disconnect();
      
      // Small delay before reconnecting
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    }
  }, [user?.id]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      // Get auth token if available
      const token = localStorage.getItem('token') || undefined;
      
      // Connect to WebSocket (user ID is generated automatically)
      websocketService.connect(token);
      setIsConnected(true);
      setError(null);
      console.log('Connecting to live locations...');
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect to location service');
      setIsConnected(false);
    }
  }, []);

  // Monitor WebSocket connection state
  const monitorConnection = useCallback(() => {
    const checkInterval = setInterval(() => {
      const currentState = websocketService.isConnected();
      if (currentState !== isConnected) {
        setIsConnected(currentState);
        if (!currentState) {
          setError('Connection to location service lost');
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isConnected]);

  // Initialize WebSocket connection and set up event listeners
  useEffect(() => {
    // Register message handler
    const unsubscribe = websocketService.onMessage(handleMessage);

    // Connect to WebSocket (anonymous ID is generated automatically)
    connectWebSocket();

    // Start connection monitoring
    const stopMonitoring = monitorConnection();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      stopMonitoring();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Note: We don't disconnect here to allow connection to persist across component re-renders
    };
  }, [handleMessage, connectWebSocket, monitorConnection]);

  // Cleanup on user logout (optional - keep connection for anonymous tracking)
  useEffect(() => {
    if (!user) {
      console.log('User logged out, but keeping WebSocket connection for anonymous tracking');
    }
  }, [user]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return {
    users,
    isConnected,
    error,
    reconnect
  };
};

export default useLiveLocations;
