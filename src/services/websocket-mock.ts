/**
 * WebSocket Mock Service
 * Simulates real-time data for development and testing
 */

import { WebSocketMessage } from './websocket-service';

export class WebSocketMockService {
  private isConnected = false;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startMockData();
  }

  /**
   * Simulate connection
   */
  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        resolve();
      }, 1000);
    });
  }

  /**
   * Simulate disconnection
   */
  disconnect(): void {
    this.isConnected = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Subscribe to message types
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
   * Send message (mock)
   */
  send(message: Partial<WebSocketMessage>): void {
    console.log('Mock WebSocket send:', message);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: false,
      reconnectAttempts: 0
    };
  }

  /**
   * Start generating mock data
   */
  private startMockData(): void {
    this.intervalId = setInterval(() => {
      if (!this.isConnected) return;

      // Generate random events
      const events = ['deposit', 'withdraw', 'allocate', 'yield_claim', 'price_update'];
      const eventType = events[Math.floor(Math.random() * events.length)];
      
      const mockMessage: WebSocketMessage = {
        type: eventType as any,
        data: this.generateMockEventData(eventType),
        timestamp: Date.now()
      };

      const handler = this.messageHandlers.get(eventType);
      if (handler) {
        handler(mockMessage);
      }
    }, 10000); // Generate event every 10 seconds
  }

  /**
   * Generate mock event data based on type
   */
  private generateMockEventData(eventType: string): any {
    const users = ['alice.testnet', 'bob.testnet', 'charlie.testnet', 'dave.testnet'];
    const tokens = ['NEAR', 'USDC', 'USDT'];
    const opportunities = ['NEAR Staking', 'USDC Lending', 'Liquidity Pool'];
    
    const user = users[Math.floor(Math.random() * users.length)];
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const amount = (Math.random() * 1000 + 1).toFixed(2);

    switch (eventType) {
      case 'deposit':
        return {
          user,
          token,
          amount,
          txHash: this.generateMockTxHash(),
          timestamp: Date.now()
        };

      case 'withdraw':
        return {
          user,
          token,
          amount,
          txHash: this.generateMockTxHash(),
          timestamp: Date.now()
        };

      case 'allocate':
        const opportunity = opportunities[Math.floor(Math.random() * opportunities.length)];
        return {
          user,
          token,
          amount,
          opportunity,
          apy: (Math.random() * 20 + 5).toFixed(1),
          txHash: this.generateMockTxHash(),
          timestamp: Date.now()
        };

      case 'yield_claim':
        return {
          user,
          token,
          amount: (Math.random() * 100 + 1).toFixed(4),
          txHash: this.generateMockTxHash(),
          timestamp: Date.now()
        };

      case 'price_update':
        return {
          token,
          price: (Math.random() * 10 + 1).toFixed(4),
          change24h: (Math.random() - 0.5) * 0.1,
          timestamp: Date.now()
        };

      default:
        return {
          user,
          token,
          amount,
          timestamp: Date.now()
        };
    }
  }

  /**
   * Generate mock transaction hash
   */
  private generateMockTxHash(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

// Export singleton instance
export const websocketMockService = new WebSocketMockService();
