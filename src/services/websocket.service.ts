// WebSocket service for real-time location updates
// Follows SOLID principles - single responsibility for WebSocket communication

import { getOrCreateUserId, STORAGE_KEYS } from './user.service';

export interface LocationUser {
  user_id: string;
  latitude: number;
  longitude: number;
  status?: 'active' | 'visitor' | 'engaged'; // Optional status for marker styling
}

export interface LocationMessage {
  type: 'users_update';
  data: LocationUser[];
}

export type WebSocketMessageCallback = (message: LocationMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageCallbacks: Set<WebSocketMessageCallback> = new Set();
  private userId: string | null = null;

  /**
   * Connect to WebSocket endpoint
   * @param token - Optional auth token
   */
  connect(token?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Get or create user ID automatically
    this.userId = getOrCreateUserId();
    
    // Build WebSocket URL with optional token
    const wsUrl = this.buildWebSocketUrl(this.userId, token);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      console.log('Connecting to WebSocket:', wsUrl);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Handle connection errors gracefully
   */
  private handleConnectionError(error: any): void {
    console.error('WebSocket connection failed:', error);
    
    // Check if it's a 403 Forbidden error
    if (error?.message?.includes('403') || error?.code === 403) {
      console.warn('403 Forbidden - generating new UUID and retrying...');
      // Clear existing ID and generate new one
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
      
      // Retry with new UUID after short delay
      setTimeout(() => {
        const newUserId = getOrCreateUserId();
        console.log('Retrying with new UUID:', newUserId);
        this.connect();
      }, 2000);
      return;
    }
    
    // Notify callbacks about connection failure
    const errorMessage: LocationMessage = {
      type: 'users_update',
      data: []
    };
    
    this.messageCallbacks.forEach(callback => {
      try {
        callback(errorMessage);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
    
    // Don't attempt reconnection for production endpoint failures
    // This prevents endless retry loops when backend is not running
    console.log('WebSocket endpoint not available - map will work without live updates');
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks.clear();
    this.userId = null;
    this.reconnectAttempts = 0;
    console.log('WebSocket disconnected');
  }

  /**
   * Register callback for message handling
   * @param callback - Function to handle incoming messages
   */
  onMessage(callback: WebSocketMessageCallback): () => void {
    this.messageCallbacks.add(callback);
    
    // Return cleanup function
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  /**
   * Send a message to the server
   */
  sendMessage(data: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Get current connection state
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private buildWebSocketUrl(userId: string, token?: string): string {
    // Check if we're in development mode
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // Use proxied WebSocket URL for development
      let wsUrl = `ws://localhost:8080/ws/locations/${userId}`;
      
      // Add token as query parameter if provided
      if (token) {
        wsUrl += `?token=${encodeURIComponent(token)}`;
      }
      
      return wsUrl;
    } else {
      // Production WebSocket URL
      const wsBaseUrl = 'wss://api.pahala.store';
      const url = new URL(`/ws/locations/${userId}`, wsBaseUrl.replace('wss://', 'https://'));
      
      // Convert back to WebSocket protocol
      url.protocol = 'wss:';
      
      // Add token as query parameter if provided
      if (token) {
        url.searchParams.set('token', token);
      }
      
      return url.toString();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: LocationMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      
      // Only attempt reconnection for clean closures or specific error codes
      // Don't reconnect for connection failures (code 1006) to prevent endless loops
      if (event.wasClean && this.userId) {
        this.handleReconnect();
      } else if (event.code === 1000 || event.code === 1001) {
        // Normal closure - reconnect if we have a user ID
        if (this.userId) {
          this.handleReconnect();
        }
      } else {
        console.log('Connection failed - map will work without live updates');
        this.handleConnectionError(new Error(`WebSocket closed with code ${event.code}`));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(message: LocationMessage): void {
    // Validate message structure
    if (!this.isValidMessage(message)) {
      console.warn('Invalid message structure received:', message);
      return;
    }

    // Notify all registered callbacks
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  private isValidMessage(message: any): message is LocationMessage {
    return (
      message &&
      typeof message === 'object' &&
      message.type === 'users_update' &&
      Array.isArray(message.data) &&
      message.data.every((user: any) =>
        typeof user.user_id === 'string' &&
        typeof user.latitude === 'number' &&
        typeof user.longitude === 'number' &&
        (!user.status || ['active', 'visitor', 'engaged'].includes(user.status))
      )
    );
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
