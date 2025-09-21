import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService, WebSocketMessage } from '@/services/websocket-service';

export interface RealTimeData {
  deposits: any[];
  withdrawals: any[];
  allocations: any[];
  priceUpdates: any[];
  lastUpdate: number;
}

export interface UseRealTimeDataReturn {
  data: RealTimeData;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
  error: string | null;
  subscribe: (messageType: string, handler: (message: WebSocketMessage) => void) => void;
  unsubscribe: (messageType: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useRealTimeData(): UseRealTimeDataReturn {
  const [data, setData] = useState<RealTimeData>({
    deposits: [],
    withdrawals: [],
    allocations: [],
    priceUpdates: [],
    lastUpdate: Date.now()
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update connection status periodically
  const updateConnectionStatus = useCallback(() => {
    const status = websocketService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setIsConnecting(status.isConnecting);
    setReconnectAttempts(status.reconnectAttempts);
  }, []);

  // Subscribe to WebSocket messages
  const subscribe = useCallback((messageType: string, handler: (message: WebSocketMessage) => void) => {
    websocketService.subscribe(messageType, handler);
  }, []);

  // Unsubscribe from WebSocket messages
  const unsubscribe = useCallback((messageType: string) => {
    websocketService.unsubscribe(messageType);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null);
      await websocketService.connect();
      updateConnectionStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to WebSocket');
    }
  }, [updateConnectionStatus]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    updateConnectionStatus();
  }, [updateConnectionStatus]);

  // Handle deposit events
  const handleDeposit = useCallback((message: WebSocketMessage) => {
    setData(prev => ({
      ...prev,
      deposits: [message.data, ...prev.deposits.slice(0, 99)], // Keep last 100
      lastUpdate: Date.now()
    }));
    setLastMessage(message);
  }, []);

  // Handle withdrawal events
  const handleWithdrawal = useCallback((message: WebSocketMessage) => {
    setData(prev => ({
      ...prev,
      withdrawals: [message.data, ...prev.withdrawals.slice(0, 99)], // Keep last 100
      lastUpdate: Date.now()
    }));
    setLastMessage(message);
  }, []);

  // Handle allocation events
  const handleAllocation = useCallback((message: WebSocketMessage) => {
    setData(prev => ({
      ...prev,
      allocations: [message.data, ...prev.allocations.slice(0, 99)], // Keep last 100
      lastUpdate: Date.now()
    }));
    setLastMessage(message);
  }, []);

  // Handle price updates
  const handlePriceUpdate = useCallback((message: WebSocketMessage) => {
    setData(prev => ({
      ...prev,
      priceUpdates: [message.data, ...prev.priceUpdates.slice(0, 99)], // Keep last 100
      lastUpdate: Date.now()
    }));
    setLastMessage(message);
  }, []);

  // Handle yield claim events
  const handleYieldClaim = useCallback((message: WebSocketMessage) => {
    // Yield claims could be treated as a special type of withdrawal
    setData(prev => ({
      ...prev,
      withdrawals: [message.data, ...prev.withdrawals.slice(0, 99)],
      lastUpdate: Date.now()
    }));
    setLastMessage(message);
  }, []);

  // Handle health check responses
  const handleHealthCheck = useCallback((message: WebSocketMessage) => {
    setLastMessage(message);
    // Health check doesn't update data, just confirms connection
  }, []);

  // Setup WebSocket subscriptions
  useEffect(() => {
    subscribe('deposit', handleDeposit);
    subscribe('withdraw', handleWithdrawal);
    subscribe('allocate', handleAllocation);
    subscribe('price_update', handlePriceUpdate);
    subscribe('yield_claim', handleYieldClaim);
    subscribe('health_check', handleHealthCheck);

    // Update connection status every second
    statusIntervalRef.current = setInterval(updateConnectionStatus, 1000);

    return () => {
      unsubscribe('deposit');
      unsubscribe('withdraw');
      unsubscribe('allocate');
      unsubscribe('price_update');
      unsubscribe('yield_claim');
      unsubscribe('health_check');
      
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [subscribe, unsubscribe, handleDeposit, handleWithdrawal, handleAllocation, handlePriceUpdate, handleYieldClaim, handleHealthCheck, updateConnectionStatus]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    data,
    isConnected,
    isConnecting,
    reconnectAttempts,
    lastMessage,
    error,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
}