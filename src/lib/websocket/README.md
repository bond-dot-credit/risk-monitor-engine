# Real-Time Features

This module provides comprehensive real-time functionality for the Credit Vault Management system, including WebSocket communication, live data updates, and real-time notifications.

## 🚀 Features

### WebSocket Management
- **Connection Management**: Automatic connection handling with reconnection logic
- **Heartbeat System**: Keep-alive mechanism to maintain connections
- **Error Handling**: Robust error handling and recovery
- **Event System**: Event-driven architecture for real-time updates

### Real-Time Data Hooks
- **useRealTimeData**: Generic hook for any real-time data type
- **useVaultUpdates**: Specialized hook for vault updates
- **useRiskAlerts**: Specialized hook for risk alerts
- **useMarketData**: Specialized hook for market data
- **useSystemStatus**: Specialized hook for system status

### Notification System
- **Real-Time Alerts**: Instant notification of important events
- **Auto-Dismiss**: Configurable auto-dismiss functionality
- **Action Support**: Interactive notifications with custom actions
- **Unread Count**: Track unread notifications with badge display

## 🏗️ Architecture

### WebSocket Manager
The `WebSocketManager` class provides a robust foundation for real-time communication:

```typescript
import { WebSocketManager } from '@/lib/websocket';

const wsManager = new WebSocketManager({
  url: 'ws://localhost:3001',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
});

// Connect to WebSocket
await wsManager.connect();

// Send messages
wsManager.sendTyped('vault_update', { vaultId: '123', ltv: 75 });

// Listen for events
wsManager.on('message', (message) => {
  console.log('Received:', message);
});
```

### Real-Time Data Hooks
React hooks for easy integration of real-time data:

```typescript
import { useVaultUpdates, useRiskAlerts } from '@/hooks/useRealTimeData';

function VaultMonitor({ vaultId }: { vaultId: string }) {
  const [vaultData, { connect, disconnect }] = useVaultUpdates(vaultId);
  const [riskAlerts] = useRiskAlerts();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [vaultId, connect, disconnect]);

  return (
    <div>
      <h3>Vault {vaultId}</h3>
      {vaultData.data && (
        <div>LTV: {vaultData.data.ltv}%</div>
      )}
      {riskAlerts.data && (
        <div className="alert">Risk Alert: {riskAlerts.data.message}</div>
      )}
    </div>
  );
}
```

### Notification Center
Real-time notification system with configurable options:

```typescript
import NotificationCenter from '@/components/notifications/NotificationCenter';

function App() {
  return (
    <div>
      {/* Your app content */}
      <NotificationCenter
        position="top-right"
        maxNotifications={10}
        autoDismiss={true}
        dismissDelay={5000}
      />
    </div>
  );
}
```

## 📡 WebSocket Message Types

### Standard Message Format
All WebSocket messages follow a consistent format:

```typescript
interface WebSocketMessage {
  type: string;        // Message type identifier
  data: any;          // Message payload
  timestamp: number;   // Unix timestamp
  id?: string;        // Optional message ID
}
```

### Predefined Message Types
- **`vault_update_{vaultId}`**: Vault data updates
- **`risk_alert`**: Risk alerts and warnings
- **`market_data_{chainId}`**: Market data updates
- **`system_status`**: System health and status
- **`heartbeat`**: Connection keep-alive

### Custom Message Types
You can define custom message types for your specific needs:

```typescript
// Send custom message
wsManager.sendTyped('custom_event', {
  event: 'user_action',
  userId: '123',
  action: 'vault_created'
});

// Listen for custom messages
wsManager.on('message', (message) => {
  if (message.type === 'custom_event') {
    handleCustomEvent(message.data);
  }
});
```

## 🔧 Configuration

### Environment Variables
Configure WebSocket connections via environment variables:

```bash
# WebSocket server URL
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Alternative: Use secure WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com/ws
```

### Connection Options
Customize connection behavior:

```typescript
const wsManager = new WebSocketManager({
  url: 'ws://localhost:3001',
  reconnectInterval: 5000,        // 5 seconds
  maxReconnectAttempts: 10,       // Max 10 attempts
  heartbeatInterval: 30000,       // 30 seconds
  onMessage: handleMessage,       // Custom message handler
  onConnect: handleConnect,       // Custom connect handler
  onDisconnect: handleDisconnect, // Custom disconnect handler
  onError: handleError,           // Custom error handler
});
```

## 📊 Real-Time Data Management

### Data State
Each real-time data hook provides comprehensive state information:

```typescript
interface RealTimeDataState<T> {
  data: T | null;                    // Current data
  isConnected: boolean;              // Connection status
  isConnecting: boolean;             // Connecting status
  isReconnecting: boolean;           // Reconnecting status
  connectionState: string;           // Detailed connection state
  error: Error | null;               // Any connection errors
  lastMessage: WebSocketMessage | null; // Last received message
  messageCount: number;              // Total message count
}
```

### Connection Management
Full control over WebSocket connections:

```typescript
const [state, { connect, disconnect, sendMessage, clearData }] = useRealTimeData('vault_updates');

// Manual connection control
useEffect(() => {
  connect();
  return () => disconnect();
}, []);

// Send custom messages
const updateVault = (vaultData: any) => {
  sendMessage(vaultData);
};

// Clear stored data
const resetData = () => {
  clearData();
};
```

## 🔔 Notification System

### Notification Types
Support for different notification categories:

```typescript
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: number; // milliseconds
}
```

### Auto-Dismiss Configuration
Configure automatic notification dismissal:

```typescript
// Auto-dismiss after 10 seconds
addNotification({
  type: 'warning',
  title: 'Risk Alert',
  message: 'LTV approaching limit',
  autoDismiss: 10000,
});

// No auto-dismiss (manual only)
addNotification({
  type: 'error',
  title: 'Critical Error',
  message: 'System failure detected',
  // autoDismiss not set - manual dismissal required
});
```

### Interactive Notifications
Notifications can include custom actions:

```typescript
addNotification({
  type: 'warning',
  title: 'Vault Risk',
  message: 'Vault ETH-001 LTV is high',
  action: {
    label: 'View Vault',
    onClick: () => navigateToVault('ETH-001'),
  },
});
```

## 🚨 Error Handling

### Connection Errors
Automatic handling of connection issues:

```typescript
const [state, { connect }] = useRealTimeData('vault_updates', null, {
  onError: (error) => {
    console.error('WebSocket error:', error);
    // Show user-friendly error message
    showToast('Connection lost. Attempting to reconnect...');
  },
});
```

### Reconnection Logic
Built-in reconnection with exponential backoff:

```typescript
const wsManager = new WebSocketManager({
  url: 'ws://localhost:3001',
  reconnectInterval: 5000,        // Start with 5 seconds
  maxReconnectAttempts: 10,       // Try up to 10 times
  heartbeatInterval: 30000,       // Send heartbeat every 30 seconds
});
```

### Error Recovery
Graceful recovery from various error conditions:

```typescript
wsManager.on('maxReconnectAttemptsReached', () => {
  // All reconnection attempts failed
  showCriticalError('Unable to establish connection. Please refresh the page.');
});

wsManager.on('error', (error) => {
  // Handle specific error types
  if (error.message.includes('Invalid message format')) {
    console.warn('Received malformed message, ignoring...');
  } else {
    console.error('WebSocket error:', error);
  }
});
```

## 📱 Mobile Support

### Responsive Design
All real-time components are mobile-optimized:

```typescript
// Notification center adapts to screen size
<NotificationCenter
  position="top-right"
  className="md:top-4 md:right-4 top-2 right-2"
/>
```

### Touch Interactions
Optimized for touch devices:

```typescript
// Touch-friendly notification dismissal
<button
  onClick={() => dismissNotification(notification.id)}
  className="p-2 touch-manipulation" // Optimized for touch
  aria-label="Dismiss notification"
>
  <XIcon className="w-4 h-4" />
</button>
```

## 🧪 Testing

### Mock WebSocket
Test real-time features with mock implementations:

```typescript
// Mock WebSocket for testing
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  readyState: WebSocket.OPEN,
};

// Test real-time data hook
const { result } = renderHook(() => useRealTimeData('test_type'));
expect(result.current[0].isConnected).toBe(false);
```

### Integration Testing
Test complete real-time workflows:

```typescript
// Test notification flow
const { getByText, getByLabelText } = render(<NotificationCenter />);

// Simulate real-time alert
fireEvent.click(getByLabelText('Open notifications'));
expect(getByText('Risk Alert')).toBeInTheDocument();
```

## 🔒 Security

### Message Validation
Validate all incoming WebSocket messages:

```typescript
wsManager.on('message', (message) => {
  // Validate message structure
  if (!isValidMessage(message)) {
    console.warn('Invalid message received:', message);
    return;
  }
  
  // Process valid message
  handleMessage(message);
});
```

### Connection Security
Secure WebSocket connections:

```typescript
// Use secure WebSocket in production
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://your-domain.com/ws'
  : 'ws://localhost:3001';

const wsManager = new WebSocketManager({
  url: wsUrl,
  // Additional security options
});
```

## 📈 Performance

### Message Batching
Efficient handling of high-frequency updates:

```typescript
// Batch multiple updates
const batchUpdates = debounce((updates: any[]) => {
  wsManager.sendTyped('batch_update', { updates });
}, 100);

// Use in high-frequency scenarios
updates.forEach(update => {
  batchUpdates(update);
});
```

### Memory Management
Efficient memory usage for long-running connections:

```typescript
// Clean up old notifications
useEffect(() => {
  const cleanup = setInterval(() => {
    setNotifications(prev => 
      prev.filter(n => 
        Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24 hours
      )
    );
  }, 60000); // Clean up every minute

  return () => clearInterval(cleanup);
}, []);
```

## 🚀 Future Enhancements

### Planned Features
- **Message Queuing**: Offline message queuing and replay
- **Compression**: Message compression for bandwidth optimization
- **Encryption**: End-to-end encryption for sensitive data
- **Load Balancing**: Multiple WebSocket server support
- **Analytics**: Real-time usage analytics and monitoring

### Extensibility
- **Plugin System**: Custom message handlers and processors
- **Middleware**: Message transformation and validation
- **Custom Protocols**: Support for custom WebSocket protocols
- **Multi-tenant**: Isolated connections for different users

## 📚 Best Practices

### Connection Management
1. **Always Clean Up**: Disconnect WebSocket on component unmount
2. **Handle Errors Gracefully**: Provide user feedback for connection issues
3. **Use Heartbeats**: Implement keep-alive mechanisms
4. **Reconnect Strategically**: Implement exponential backoff for reconnections

### Message Handling
1. **Validate Messages**: Always validate incoming message structure
2. **Handle Edge Cases**: Consider offline scenarios and reconnection
3. **Rate Limiting**: Implement rate limiting for high-frequency updates
4. **Error Boundaries**: Use React error boundaries for real-time components

### Performance
1. **Debounce Updates**: Batch frequent updates to reduce overhead
2. **Memory Management**: Clean up old data and notifications
3. **Lazy Loading**: Load real-time features only when needed
4. **Connection Pooling**: Reuse connections when possible

## 🤝 Contributing

When adding new real-time features:

1. **Follow Patterns**: Use existing WebSocket and hook patterns
2. **Add Tests**: Include comprehensive test coverage
3. **Document Changes**: Update this README with new features
4. **Performance Review**: Ensure new features don't impact performance
5. **Security Review**: Validate security implications of new features

## 📞 Support

For real-time feature issues:

1. Check WebSocket server connectivity
2. Verify message format and validation
3. Review connection configuration
4. Check browser WebSocket support
5. Consult WebSocket server logs
