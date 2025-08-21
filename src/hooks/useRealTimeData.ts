import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager, WebSocketMessage } from '@/lib/websocket/WebSocketManager';

export interface RealTimeDataOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface RealTimeDataState<T = any> {
  data: T | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionState: string;
  error: Error | null;
  lastMessage: WebSocketMessage | null;
  messageCount: number;
}

export function useRealTimeData<T = any>(
  messageType: string,
  initialData: T | null = null,
  options: RealTimeDataOptions = {}
): [
  RealTimeDataState<T>,
  {
    connect: () => Promise<void>;
    disconnect: () => void;
    sendMessage: (data: any) => void;
    clearData: () => void;
  }
] {
  const {
    autoConnect = true,
    reconnectOnError = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [state, setState] = useState<RealTimeDataState<T>>({
    data: initialData,
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    connectionState: 'CLOSED',
    error: null,
    lastMessage: null,
    messageCount: 0,
  });

  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const messageCountRef = useRef(0);

  // Initialize WebSocket manager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      wsManagerRef.current = new WebSocketManager({
        url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 30000,
        onMessage: (message: WebSocketMessage) => {
          if (message.type === messageType) {
            setState(prev => ({
              ...prev,
              data: message.data,
              lastMessage: message,
              messageCount: prev.messageCount + 1,
            }));
            messageCountRef.current = prev.messageCount + 1;
            onMessage?.(message);
          }
        },
        onConnect: () => {
          setState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            connectionState: 'OPEN',
            error: null,
          }));
          onConnect?.();
        },
        onDisconnect: () => {
          setState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            connectionState: 'CLOSED',
          }));
          onDisconnect?.();
        },
        onError: (error: Event) => {
          setState(prev => ({
            ...prev,
            error: error as Error,
            isConnecting: false,
          }));
          onError?.(error);
        },
      });

      // Set up event listeners
      const manager = wsManagerRef.current;
      manager.on('connect', () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          connectionState: 'OPEN',
          error: null,
        }));
      });

      manager.on('disconnect', () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionState: 'CLOSED',
        }));
      });

      manager.on('error', (error: Error) => {
        setState(prev => ({
          ...prev,
          error,
          isConnecting: false,
        }));
      });

      // Auto-connect if enabled
      if (autoConnect) {
        connect();
      }
    }

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
        wsManagerRef.current = null;
      }
    };
  }, [autoConnect, messageType, onMessage, onConnect, onDisconnect, onError]);

  // Update connection state
  useEffect(() => {
    if (wsManagerRef.current) {
      const updateConnectionState = () => {
        setState(prev => ({
          ...prev,
          isConnected: wsManagerRef.current!.isConnected,
          connectionState: wsManagerRef.current!.connectionState,
        }));
      };

      // Update state periodically
      const interval = setInterval(updateConnectionState, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    if (wsManagerRef.current) {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      try {
        await wsManagerRef.current.connect();
      } catch (error) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: error as Error,
        }));
        throw error;
      }
    }
  }, []);

  const disconnect = useCallback((): void => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
    }
  }, []);

  const sendMessage = useCallback((data: any): void => {
    if (wsManagerRef.current && wsManagerRef.current.isConnected) {
      wsManagerRef.current.sendTyped(messageType, data);
    } else {
      throw new Error('WebSocket is not connected');
    }
  }, [messageType]);

  const clearData = useCallback((): void => {
    setState(prev => ({
      ...prev,
      data: null,
      lastMessage: null,
      messageCount: 0,
    }));
    messageCountRef.current = 0;
  }, []);

  return [
    state,
    {
      connect,
      disconnect,
      sendMessage,
      clearData,
    },
  ];
}

// Specialized hooks for common use cases
export function useVaultUpdates(vaultId: string) {
  return useRealTimeData(`vault_update_${vaultId}`, null, {
    autoConnect: true,
    reconnectOnError: true,
  });
}

export function useRiskAlerts() {
  return useRealTimeData('risk_alert', null, {
    autoConnect: true,
    reconnectOnError: true,
  });
}

export function useMarketData(chainId: string) {
  return useRealTimeData(`market_data_${chainId}`, null, {
    autoConnect: true,
    reconnectOnError: true,
  });
}

export function useSystemStatus() {
  return useRealTimeData('system_status', null, {
    autoConnect: true,
    reconnectOnError: true,
  });
}
