// WebSocket service for real-time location updates
// Follows SOLID principles - single responsibility for WebSocket communication

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
   * @param userId - User ID for the connection
   * @param token - Optional auth token
   */
  connect(userId: string, token?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    
    // Build WebSocket URL with optional token
    const wsUrl = this.buildWebSocketUrl(userId, token);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      console.log('Connecting to WebSocket:', wsUrl);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
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
    // Get WebSocket base URL from environment or use default
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const url = new URL(`/ws/locations/${userId}`, wsBaseUrl.replace('ws://', 'http://').replace('wss://', 'https://'));
    
    // Convert back to WebSocket protocol
    const protocol = wsBaseUrl.includes('wss://') ? 'wss:' : 'ws:';
    url.protocol = protocol;
    
    // Add token as query parameter if provided
    if (token) {
      url.searchParams.set('token', token);
    }
    
    return url.toString();
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
      if (!event.wasClean && this.userId) {
        this.handleReconnect();
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
