# Configuration Management

A comprehensive configuration management system for the Risk Monitor Engine with environment-based configuration, feature flags, and validation.

## Features

- **Environment-Based Configuration**: Development, staging, and production environments
- **Feature Flags**: Runtime feature enablement/disablement
- **Multi-Source Loading**: Environment variables, config files, and remote sources
- **Configuration Validation**: Built-in validation and error reporting
- **Type Safety**: Full TypeScript support with interfaces
- **Hot Reloading**: Configuration reloading without restart
- **Security**: Environment-specific security settings

## Architecture

### Core Components

- **ConfigManager**: Singleton configuration manager with caching
- **Configuration Interfaces**: Type-safe configuration definitions
- **Environment Loading**: Multi-environment configuration support
- **Validation Engine**: Configuration validation and error reporting

### Configuration Structure

```typescript
interface FullConfig {
  app: AppConfig;           // Application settings
  database: DatabaseConfig; // Database connection settings
  redis: RedisConfig;       // Redis configuration
  websocket: WebSocketConfig; // WebSocket settings
  security: SecurityConfig; // Security and authentication
  monitoring: MonitoringConfig; // Monitoring and metrics
  features: FeatureFlags;   // Feature toggles
  blockchain: BlockchainConfig; // Blockchain connections
  externalServices: ExternalServicesConfig; // Third-party services
}
```

## Usage

### Basic Configuration Access

```typescript
import { configManager, getConfig, isFeatureEnabled } from '@/lib/config';

// Access configuration sections
const dbConfig = configManager.getDatabaseConfig();
const appConfig = configManager.getAppConfig();

// Access specific values
const port = getConfig<number>('app.port');
const dbHost = getConfig<string>('database.host');

// Check feature flags
if (isFeatureEnabled('enableCreditVaults')) {
  // Credit vault functionality
}

// Check environment
if (configManager.isProduction()) {
  // Production-specific logic
}
```

### Environment Variables

The system automatically loads configuration from environment variables:

```bash
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
BASE_URL=https://riskmonitor.example.com

# Database
DB_HOST=postgres.example.com
DB_PORT=5432
DB_USERNAME=risk_monitor
DB_PASSWORD=secure_password
DB_NAME=risk_monitor_prod
DB_SSL=true

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
ENABLE_HTTPS=true
ENABLE_HSTS=true

# Feature Flags
ENABLE_CREDIT_VAULTS=true
ENABLE_RISK_MONITORING=true
ENABLE_LIQUIDATION_PROTECTION=true
ENABLE_MULTI_CHAIN=true

# Blockchain
ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ARB_RPC_URL=https://arb1.arbitrum.io/rpc
POLYGON_RPC_URL=https://polygon-rpc.com

# External Services
RISK_ORACLE_URL=https://api.riskoracle.com
RISK_ORACLE_API_KEY=your-api-key
PRICE_FEED_URL=https://api.coingecko.com/api/v3
```

### Configuration Validation

```typescript
import { configManager } from '@/lib/config';

// Validate configuration
const validation = configManager.validate();

if (!validation.isValid) {
  console.error('Configuration validation failed:');
  validation.errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
```

## Configuration Sections

### Application Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `environment` | `string` | `development` | Runtime environment |
| `port` | `number` | `3000` | Application port |
| `host` | `string` | `localhost` | Application host |
| `baseUrl` | `string` | `http://localhost:3000` | Base URL |
| `apiVersion` | `string` | `v1` | API version |
| `enableSwagger` | `boolean` | `false` | Enable Swagger docs |
| `logLevel` | `string` | `info` | Logging level |
| `timezone` | `string` | `UTC` | Application timezone |
| `locale` | `string` | `en-US` | Application locale |

### Database Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `host` | `string` | `localhost` | Database host |
| `port` | `number` | `5432` | Database port |
| `username` | `string` | `postgres` | Database username |
| `password` | `string` | `password` | Database password |
| `database` | `string` | `risk_monitor` | Database name |
| `ssl` | `boolean` | `false` | Enable SSL |
| `maxConnections` | `number` | `10` | Connection pool size |
| `connectionTimeout` | `number` | `5000` | Connection timeout (ms) |
| `idleTimeout` | `number` | `30000` | Idle timeout (ms) |

### Security Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `jwtSecret` | `string` | `your-secret-key` | JWT signing secret |
| `jwtExpiresIn` | `string` | `24h` | JWT expiration time |
| `bcryptRounds` | `number` | `12` | Password hashing rounds |
| `rateLimitWindow` | `number` | `900000` | Rate limit window (ms) |
| `rateLimitMax` | `number` | `100` | Max requests per window |
| `corsOrigins` | `string[]` | `['http://localhost:3000']` | CORS allowed origins |
| `enableHttps` | `boolean` | `false` | Enable HTTPS |
| `enableHsts` | `boolean` | `false` | Enable HSTS |

### Feature Flags

| Feature | Type | Default | Description |
|---------|------|---------|-------------|
| `enableCreditVaults` | `boolean` | `true` | Credit vault functionality |
| `enableRiskMonitoring` | `boolean` | `true` | Risk monitoring system |
| `enableLiquidationProtection` | `boolean` | `true` | Liquidation protection |
| `enableMultiChain` | `boolean` | `true` | Multi-chain support |
| `enableRealTimeUpdates` | `boolean` | `true` | Real-time updates |
| `enableAdvancedAnalytics` | `boolean` | `false` | Advanced analytics |

### Blockchain Configuration

| Chain | Setting | Type | Default | Description |
|-------|---------|------|---------|-------------|
| **Ethereum** | `rpcUrl` | `string` | `https://mainnet.infura.io/v3/...` | RPC endpoint |
| | `chainId` | `number` | `1` | Chain ID |
| | `blockTime` | `number` | `12000` | Block time (ms) |
| | `confirmations` | `number` | `12` | Required confirmations |
| **Arbitrum** | `rpcUrl` | `string` | `https://arb1.arbitrum.io/rpc` | RPC endpoint |
| | `chainId` | `number` | `42161` | Chain ID |
| | `blockTime` | `number` | `250` | Block time (ms) |
| | `confirmations` | `number` | `1` | Required confirmations |
| **Polygon** | `rpcUrl` | `string` | `https://polygon-rpc.com` | RPC endpoint |
| | `chainId` | `number` | `137` | Chain ID |
| | `blockTime` | `number` | `2000` | Block time (ms) |
| | `confirmations` | `number` | `200` | Required confirmations |

## Environment-Specific Configuration

### Development

```typescript
// Development-specific settings
const devConfig = {
  app: {
    environment: 'development',
    enableSwagger: true,
    logLevel: 'debug'
  },
  database: {
    host: 'localhost',
    ssl: false
  },
  security: {
    enableHttps: false,
    enableHsts: false
  }
};
```

### Production

```typescript
// Production-specific settings
const prodConfig = {
  app: {
    environment: 'production',
    enableSwagger: false,
    logLevel: 'warn'
  },
  database: {
    ssl: true,
    maxConnections: 50
  },
  security: {
    enableHttps: true,
    enableHsts: true
  }
};
```

## Configuration Loading Priority

1. **Base Configuration**: Default values and common settings
2. **Environment Configuration**: Environment-specific overrides
3. **Local Configuration**: Local development overrides (gitignored)
4. **Environment Variables**: Runtime overrides

## Security Considerations

- **Secrets Management**: Use environment variables for sensitive data
- **Configuration Validation**: Validate all configuration on startup
- **Environment Isolation**: Separate configurations for different environments
- **Access Control**: Limit access to production configuration

## Integration

The configuration system integrates with:

- **Logging System**: Environment-based log levels
- **Database Connections**: Environment-specific database settings
- **Security Middleware**: Environment-based security features
- **Feature Toggles**: Runtime feature enablement
- **Monitoring**: Environment-specific monitoring settings

## Best Practices

1. **Environment Variables**: Use environment variables for secrets
2. **Validation**: Always validate configuration on startup
3. **Defaults**: Provide sensible defaults for all settings
4. **Documentation**: Document all configuration options
5. **Testing**: Test configuration in all environments
6. **Security**: Never commit secrets to version control

## Future Enhancements

- **Remote Configuration**: Load configuration from remote sources
- **Configuration UI**: Web-based configuration management
- **Dynamic Updates**: Runtime configuration updates
- **Configuration Templates**: Pre-built configuration templates
- **Configuration Migration**: Version migration support
