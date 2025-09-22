/**
 * WebSocket Service
 * Handles real-time data updates for blockchain events and market data
 */

export interface WebSocketMessage {
  type: 'deposit' | 'withdraw' | 'allocate' | 'yield_claim' | 'price_update' | 'health_check';
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private isConnected = false;
  private isConnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          
          if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(messageType: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Unsubscribe from message types
   */
  unsubscribe(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Send message to WebSocket server
   */
  send(message: Partial<WebSocketMessage>): void {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    try {
      const fullMessage: WebSocketMessage = {
        type: message.type!,
        data: message.data || {},
        timestamp: Date.now(),
        ...message
      };

      this.ws.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'health_check',
          data: { timestamp: Date.now() }
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Create singleton instance
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws';

// Use mock service in development
const isDevelopment = process.env.NODE_ENV === 'development';

export const websocketService = isDevelopment 
  ? require('./websocket-mock').websocketMockService
  : new WebSocketService({
      url: WEBSOCKET_URL,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    });
