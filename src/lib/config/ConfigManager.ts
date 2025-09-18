export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
}

export interface WebSocketConfig {
  port: number;
  path: string;
  heartbeatInterval: number;
  maxConnections: number;
  enableCompression: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  corsOrigins: string[];
  enableHttps: boolean;
  enableHsts: boolean;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  metricsPort: number;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enableTracing: boolean;
  tracingSampleRate: number;
}

export interface FeatureFlags {
  enableCreditVaults: boolean;
  enableRiskMonitoring: boolean;
  enableLiquidationProtection: boolean;
  enableMultiChain: boolean;
  enableRealTimeUpdates: boolean;
  enableAdvancedAnalytics: boolean;
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  host: string;
  baseUrl: string;
  apiVersion: string;
  enableSwagger: boolean;
  logLevel: string;
  timezone: string;
  locale: string;
}

export interface BlockchainConfig {
  ethereum: {
    rpcUrl: string;
    chainId: number;
    blockTime: number;
    confirmations: number;
  };
  arbitrum: {
    rpcUrl: string;
    chainId: number;
    blockTime: number;
    confirmations: number;
  };
  polygon: {
    rpcUrl: string;
    chainId: number;
    blockTime: number;
    confirmations: number;
  };
}

export interface ExternalServicesConfig {
  riskOracle: {
    url: string;
    apiKey: string;
    timeout: number;
  };
  priceFeed: {
    url: string;
    apiKey: string;
    updateInterval: number;
  };
  notificationService: {
    url: string;
    apiKey: string;
    webhookUrl?: string;
  };
}

export interface FullConfig {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  websocket: WebSocketConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  features: FeatureFlags;
  blockchain: BlockchainConfig;
  externalServices: ExternalServicesConfig;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: FullConfig;
  private environment: string;
  private configPath: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.configPath = process.env.CONFIG_PATH || './config';
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): FullConfig {
    // Load base config
    const baseConfig = this.loadConfigFile('base');
    
    // Load environment-specific config
    const envConfig = this.loadConfigFile(this.environment);
    
    // Load local overrides (gitignored)
    const localConfig = this.loadConfigFile('local');
    
    // Merge configurations with priority: local > env > base
    return this.mergeConfigs(baseConfig, envConfig, localConfig);
  }

  private loadConfigFile(name: string): Partial<FullConfig> {
    try {
      // In a real implementation, you might load from files, environment variables, or remote sources
      // For now, we'll use environment variables and defaults
      return this.loadFromEnvironment();
    } catch (error) {
      console.warn(`Failed to load config file: ${name}`, error);
      return {};
    }
  }

  private loadFromEnvironment(): Partial<FullConfig> {
    return {
      app: {
        environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        apiVersion: process.env.API_VERSION || 'v1',
        enableSwagger: process.env.ENABLE_SWAGGER === 'true',
        logLevel: process.env.LOG_LEVEL || 'info',
        timezone: process.env.TZ || 'UTC',
        locale: process.env.LOCALE || 'en-US',
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'risk_monitor',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'risk_monitor:',
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      },
      websocket: {
        port: parseInt(process.env.WS_PORT || '3001'),
        path: process.env.WS_PATH || '/ws',
        heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
        maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '1000'),
        enableCompression: process.env.WS_ENABLE_COMPRESSION === 'true',
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        enableHttps: process.env.ENABLE_HTTPS === 'true',
        enableHsts: process.env.ENABLE_HSTS === 'true',
      },
      monitoring: {
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
        enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS === 'true',
        healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
        enableTracing: process.env.ENABLE_TRACING === 'true',
        tracingSampleRate: parseFloat(process.env.TRACING_SAMPLE_RATE || '0.1'),
      },
      features: {
        enableCreditVaults: process.env.ENABLE_CREDIT_VAULTS !== 'false',
        enableRiskMonitoring: process.env.ENABLE_RISK_MONITORING !== 'false',
        enableLiquidationProtection: process.env.ENABLE_LIQUIDATION_PROTECTION !== 'false',
        enableMultiChain: process.env.ENABLE_MULTI_CHAIN !== 'false',
        enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES !== 'false',
        enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
      },
      blockchain: {
        ethereum: {
          rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
          chainId: parseInt(process.env.ETH_CHAIN_ID || '1'),
          blockTime: parseInt(process.env.ETH_BLOCK_TIME || '12000'),
          confirmations: parseInt(process.env.ETH_CONFIRMATIONS || '12'),
        },
        arbitrum: {
          rpcUrl: process.env.ARB_RPC_URL || 'https://arb1.arbitrum.io/rpc',
          chainId: parseInt(process.env.ARB_CHAIN_ID || '42161'),
          blockTime: parseInt(process.env.ARB_BLOCK_TIME || '250'),
          confirmations: parseInt(process.env.ARB_CONFIRMATIONS || '1'),
        },
        polygon: {
          rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
          chainId: parseInt(process.env.POLYGON_CHAIN_ID || '137'),
          blockTime: parseInt(process.env.POLYGON_BLOCK_TIME || '2000'),
          confirmations: parseInt(process.env.POLYGON_CONFIRMATIONS || '200'),
        },
      },
      externalServices: {
        riskOracle: {
          url: process.env.RISK_ORACLE_URL || 'https://api.riskoracle.com',
          apiKey: process.env.RISK_ORACLE_API_KEY || '',
          timeout: parseInt(process.env.RISK_ORACLE_TIMEOUT || '5000'),
        },
        priceFeed: {
          url: process.env.PRICE_FEED_URL || 'https://api.coingecko.com/api/v3',
          apiKey: process.env.PRICE_FEED_API_KEY || '',
          updateInterval: parseInt(process.env.PRICE_FEED_UPDATE_INTERVAL || '60000'),
        },
        notificationService: {
          url: process.env.NOTIFICATION_SERVICE_URL || 'https://api.notifications.com',
          apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || '',
          webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL,
        },
      },
    };
  }

  private mergeConfigs(...configs: Partial<FullConfig>[]): FullConfig {
    const merged: Record<string, unknown> = {};
    
    for (const config of configs) {
      this.deepMerge(merged, config);
    }
    
    return merged as unknown as FullConfig;
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        this.deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        target[key] = source[key];
      }
    }
  }

  // Getter methods for different config sections
  getAppConfig(): AppConfig {
    return this.config.app;
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  getRedisConfig(): RedisConfig {
    return this.config.redis;
  }

  getWebSocketConfig(): WebSocketConfig {
    return this.config.websocket;
  }

  getSecurityConfig(): SecurityConfig {
    return this.config.security;
  }

  getMonitoringConfig(): MonitoringConfig {
    return this.config.monitoring;
  }

  getFeatureFlags(): FeatureFlags {
    return this.config.features;
  }

  getBlockchainConfig(): BlockchainConfig {
    return this.config.blockchain;
  }

  getExternalServicesConfig(): ExternalServicesConfig {
    return this.config.externalServices;
  }

  // Get full config
  getFullConfig(): FullConfig {
    return { ...this.config };
  }

  // Get specific config value
  get<T>(path: string): T | undefined {
    const keys = path.split('.');
    let value: Record<string, unknown> | unknown = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    
    return value as T;
  }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature];
  }

  // Check if environment matches
  isEnvironment(env: string): boolean {
    return this.config.app.environment === env;
  }

  // Check if in production
  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  // Check if in development
  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  // Reload configuration
  reload(): void {
    this.config = this.loadConfig();
  }

  // Validate configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Add validation logic here
    if (!this.config.security.jwtSecret || this.config.security.jwtSecret === 'your-secret-key') {
      errors.push('JWT_SECRET must be set to a secure value');
    }
    
    if (this.config.database.password === 'password') {
      errors.push('Database password should not be the default value');
    }
    
    if (this.config.app.environment === 'production' && !this.config.security.enableHttps) {
      errors.push('HTTPS must be enabled in production');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();

// Convenience functions
export const getConfig = <T>(path: string): T | undefined => configManager.get<T>(path);
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => configManager.isFeatureEnabled(feature);
export const isProduction = (): boolean => configManager.isProduction();
export const isDevelopment = (): boolean => configManager.isDevelopment();
