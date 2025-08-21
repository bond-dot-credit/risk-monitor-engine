# Logging System

A production-ready logging system for the Risk Monitor Engine with support for multiple transports, performance tracking, and error reporting.

## Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Multiple Transports**: Console and remote HTTP endpoints
- **Performance Tracking**: Built-in timing and performance monitoring
- **Error Reporting**: Integration with external error reporting services
- **Batch Processing**: Efficient remote logging with configurable batching
- **Retry Logic**: Automatic retry with exponential backoff
- **Context Support**: Rich metadata for each log entry
- **Source Tracking**: Automatic caller source detection

## Architecture

### Core Components

- **Logger**: Main logging class with configuration and transport management
- **LogTransport**: Interface for different logging destinations
- **ConsoleTransport**: Local console logging
- **RemoteTransport**: HTTP-based remote logging with batching

### Log Entry Structure

```typescript
interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  source?: string;
}
```

## Usage

### Basic Logging

```typescript
import { logger, info, warn, error } from '@/lib/logging';

// Using the logger instance
logger.info('Application started');
logger.warn('High memory usage detected', { memoryUsage: '85%' });
logger.error('Database connection failed', { retryCount: 3 }, dbError);

// Using convenience functions
info('User logged in', { userId: '123', method: 'oauth' });
warn('Rate limit approaching', { current: 95, limit: 100 });
error('API request failed', { endpoint: '/api/users', status: 500 }, apiError);
```

### Performance Tracking

```typescript
import { startTimer, endTimer } from '@/lib/logging';

// Start timing an operation
startTimer('database-query');

// ... perform database operation ...

// End timing and log the duration
endTimer('database-query', { table: 'users', query: 'SELECT * FROM users' });
```

### Error Reporting

```typescript
import { reportError } from '@/lib/logging';

try {
  // ... risky operation ...
} catch (err) {
  reportError(err, { 
    operation: 'user-authentication',
    userId: '123',
    timestamp: new Date()
  });
}
```

### Configuration

```typescript
import { Logger } from '@/lib/logging';

const customLogger = new Logger({
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: true,
  remoteEndpoint: 'https://logs.example.com/api/logs',
  batchSize: 50,
  flushInterval: 3000,
  maxRetries: 5,
  retryDelay: 1000,
  enablePerformanceTracking: true,
  enableErrorReporting: true,
  errorReportingService: 'https://errors.example.com/api/errors',
  errorReportingKey: 'your-api-key'
});
```

## Configuration Options

### Logger Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `LogLevel` | `INFO` | Minimum log level to process |
| `enableConsole` | `boolean` | `true` | Enable console logging |
| `enableRemote` | `boolean` | `false` | Enable remote logging |
| `remoteEndpoint` | `string` | `undefined` | Remote logging endpoint URL |
| `batchSize` | `number` | `100` | Number of logs to batch before sending |
| `flushInterval` | `number` | `5000` | Auto-flush interval in milliseconds |
| `maxRetries` | `number` | `3` | Maximum retry attempts for failed requests |
| `retryDelay` | `number` | `1000` | Base delay between retries in milliseconds |
| `enablePerformanceTracking` | `boolean` | `true` | Enable performance timing features |
| `enableErrorReporting` | `boolean` | `true` | Enable error reporting to external services |

### Environment Variables

The logger can be configured using environment variables:

```bash
# Log level
LOG_LEVEL=debug

# Remote logging
REMOTE_LOGGING_ENDPOINT=https://logs.example.com/api/logs
REMOTE_LOGGING_BATCH_SIZE=50
REMOTE_LOGGING_FLUSH_INTERVAL=3000

# Error reporting
ERROR_REPORTING_SERVICE=https://errors.example.com/api/errors
ERROR_REPORTING_API_KEY=your-api-key
```

## Transports

### Console Transport

- **Purpose**: Local development and debugging
- **Features**: Color-coded output, structured formatting
- **Performance**: No network overhead, immediate output

### Remote Transport

- **Purpose**: Production logging and aggregation
- **Features**: Batch processing, retry logic, compression
- **Performance**: Network efficient, configurable batching

## Performance Considerations

- **Async Operations**: All logging operations are asynchronous
- **Batch Processing**: Remote logs are batched for efficiency
- **Memory Management**: Automatic cleanup of old performance marks
- **Error Handling**: Graceful degradation on transport failures

## Security Features

- **Context Filtering**: Sensitive data can be filtered from logs
- **Rate Limiting**: Built-in rate limiting for remote endpoints
- **Authentication**: Support for API key authentication
- **SSL/TLS**: Secure transmission for remote logging

## Integration

The logging system integrates with:

- **Error Boundaries**: Automatic error logging
- **Performance Monitoring**: Performance metric logging
- **Configuration Management**: Environment-based configuration
- **Health Checks**: System health logging
- **Metrics Collection**: Performance and error metrics

## Best Practices

1. **Use Appropriate Levels**: Reserve ERROR for actual errors, WARN for recoverable issues
2. **Include Context**: Provide relevant metadata for debugging
3. **Performance Tracking**: Use timers for expensive operations
4. **Error Reporting**: Report errors with sufficient context
5. **Configuration**: Use environment-specific configurations
6. **Monitoring**: Monitor log volume and error rates

## Future Enhancements

- **Structured Logging**: JSON and other structured formats
- **Log Rotation**: Automatic log file management
- **Search and Analytics**: Log search and analysis tools
- **Alerting**: Automated alerts based on log patterns
- **Compliance**: GDPR and other compliance features
