import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, LocationUser, LocationMessage } from '../services/websocket.service';
import { useAuth } from '../context/AuthContext';

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
    if (!user?.id) {
      console.warn('Cannot connect to WebSocket: No user ID available');
      setError('Authentication required for live locations');
      return;
    }

    try {
      // Get auth token if available
      const token = localStorage.getItem('token') || undefined;
      
      // Connect to WebSocket
      websocketService.connect(user.id, token);
      setIsConnected(true);
      setError(null);
      console.log('Connecting to live locations for user:', user.id);
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect to location service');
      setIsConnected(false);
    }
  }, [user?.id]);

  // Monitor WebSocket connection state
  const monitorConnection = useCallback(() => {
    const checkInterval = setInterval(() => {
      const currentState = websocketService.isConnected();
      if (currentState !== isConnected) {
        setIsConnected(currentState);
        if (!currentState && user?.id) {
          setError('Connection to location service lost');
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isConnected, user?.id]);

  // Initialize WebSocket connection and set up event listeners
  useEffect(() => {
    if (!user?.id) {
      console.log('No user available for WebSocket connection');
      return;
    }

    // Register message handler
    const unsubscribe = websocketService.onMessage(handleMessage);

    // Connect to WebSocket
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
  }, [user?.id, handleMessage, connectWebSocket, monitorConnection]);

  // Cleanup on user logout
  useEffect(() => {
    if (!user) {
      setUsers([]);
      setIsConnected(false);
      websocketService.disconnect();
      console.log('User logged out, disconnecting from WebSocket');
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
