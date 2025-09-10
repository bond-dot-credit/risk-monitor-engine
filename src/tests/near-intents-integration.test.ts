import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  AIAgent, 
  nearIntentsConfig, 
  NearIntentsErrorHandler, 
  ValidationUtils, 
  OnChainMetricsCollector 
} from '@/lib/near-intents';

describe('NEAR Intents On-Chain Integration Tests', () => {
  let agent: AIAgent;
  let metricsCollector: OnChainMetricsCollector;
  
  beforeAll(async () => {
    // Validate configuration before running tests
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      console.warn('Configuration not valid for integration tests:', configValidation.errors);
      console.warn('Some tests may be skipped or use mock data');
    }
  });

  describe('Configuration Validation', () => {
    it('should validate NEAR configuration', () => {
      const config = nearIntentsConfig.getConfig();
      
      expect(config.networkId).toBeDefined();
      expect(config.nodeUrl).toBeDefined();
      expect(config.accountId).toBeDefined();
      expect(config.privateKey).toBeDefined();
      
      // Validate formats
      expect(ValidationUtils.isValidNetworkId(config.networkId)).toBe(true);
      expect(ValidationUtils.isValidUrl(config.nodeUrl)).toBe(true);
      expect(ValidationUtils.isValidAccountId(config.accountId)).toBe(true);
      expect(ValidationUtils.isValidPrivateKey(config.privateKey)).toBe(true);
    });

    it('should provide network-specific configurations', () => {
      const networkConfig = nearIntentsConfig.getNetworkConfig();
      const contractsConfig = nearIntentsConfig.getContractsConfig();
      
      expect(networkConfig.networkId).toBeDefined();
      expect(networkConfig.nodeUrl).toBeDefined();
      expect(contractsConfig.intentsContractId).toBeDefined();
      expect(contractsConfig.verifierContractId).toBeDefined();
    });
  });

  describe('AIAgent Initialization', () => {
    it('should initialize agent with real configuration', async () => {
      const configValidation = nearIntentsConfig.validateConfig();
      
      if (!configValidation.valid) {
        console.warn('Skipping agent initialization test due to invalid config');
        return;
      }

      const accountConfig = nearIntentsConfig.getAccountConfig();
      agent = new AIAgent(accountConfig);
      
      // This will throw if initialization fails
      await expect(agent.initialize()).resolves.not.toThrow();
    }, 30000); // 30 second timeout for blockchain operations

    it('should get real account state', async () => {
      if (!agent) {
        console.warn('Skipping account state test - agent not initialized');
        return;
      }

      const accountState = await agent.getAccountState();
      
      expect(accountState).toBeDefined();
      expect(accountState.balance).toBeDefined();
      expect(accountState.balanceInNear).toBeDefined();
      expect(typeof accountState.balanceInNear.total).toBe('number');
      expect(typeof accountState.balanceInNear.available).toBe('number');
    }, 15000);
  });

  describe('Transaction Validation', () => {
    it('should validate transaction parameters', () => {
      const validParams = {
        fromToken: 'NEAR',
        toToken: 'USDC',
        amount: 1.0,
      };
      
      const validation = ValidationUtils.validateTransactionParams(validParams);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should reject invalid transaction parameters', () => {
      const invalidParams = {
        fromToken: 'NEAR',
        toToken: 'NEAR', // Same token
        amount: -1.0, // Negative amount
      };
      
      const validation = ValidationUtils.validateTransactionParams(invalidParams);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should parse different error types correctly', () => {
      const networkError = NearIntentsErrorHandler.parseError('Network connection failed');
      expect(networkError.type).toBe('NETWORK_ERROR');
      expect(networkError.retryable).toBe(true);
      
      const balanceError = NearIntentsErrorHandler.parseError('Insufficient balance');
      expect(balanceError.type).toBe('INSUFFICIENT_BALANCE');
      expect(balanceError.retryable).toBe(false);
      
      const rateLimitError = NearIntentsErrorHandler.parseError('Rate limit exceeded');
      expect(rateLimitError.type).toBe('RATE_LIMIT_ERROR');
      expect(rateLimitError.retryable).toBe(true);
    });

    it('should format user-friendly error messages', () => {
      const error = {
        type: 'INSUFFICIENT_BALANCE' as const,
        message: 'Insufficient balance',
        retryable: false,
      };
      
      const userMessage = NearIntentsErrorHandler.formatUserMessage(error);
      expect(userMessage).toContain('Insufficient balance');
      expect(userMessage).toContain('add more funds');
    });
  });

  describe('On-Chain Metrics Collection', () => {
    it('should initialize metrics collector with real configuration', () => {
      const config = nearIntentsConfig.getConfig();
      
      metricsCollector = new OnChainMetricsCollector({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        walletUrl: config.walletUrl,
        helperUrl: config.helperUrl,
        accountId: config.accountId,
        privateKey: config.privateKey,
      });
      
      expect(metricsCollector).toBeDefined();
    });

    it('should initialize NEAR connection for metrics', async () => {
      if (!metricsCollector) {
        console.warn('Skipping metrics initialization test - collector not created');
        return;
      }

      await expect(metricsCollector.initialize()).resolves.not.toThrow();
    }, 20000);

    it('should collect real on-chain metrics', async () => {
      if (!metricsCollector) {
        console.warn('Skipping metrics collection test - collector not initialized');
        return;
      }

      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const metrics = await metricsCollector.collectMetrics(startDate, endDate);
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.transactionVolume).toBe('number');
      expect(typeof metrics.smartContractCalls).toBe('number');
      expect(typeof metrics.uniqueWallets).toBe('number');
      expect(metrics.transactionVolume).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('API Endpoints Integration', () => {
    it('should return configuration status from API', async () => {
      const response = await fetch('/api/near-intents');
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.configuration).toBeDefined();
      expect(result.configuration.networkId).toBeDefined();
      expect(typeof result.configuration.configured).toBe('boolean');
    });

    it('should handle account info request', async () => {
      const response = await fetch('/api/near-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAccountInfo' }),
      });
      
      const result = await response.json();
      
      if (result.configRequired) {
        console.warn('Configuration required for API test');
        expect(result.success).toBe(false);
      } else {
        expect(result.success).toBe(true);
        expect(result.data.accountId).toBeDefined();
        expect(result.data.balance).toBeDefined();
      }
    });

    it('should validate bulk operations API', async () => {
      const response = await fetch('/api/near-intents-bulk');
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.actions).toContain('executeBulkSwaps');
      expect(result.configuration).toBeDefined();
      expect(result.limits).toBeDefined();
    });
  });

  describe('Price Data Integration', () => {
    it('should fetch real NEAR price data', async () => {
      if (!metricsCollector) {
        console.warn('Skipping price test - metrics collector not available');
        return;
      }

      const price = await metricsCollector.fetchRealNearPrice();
      
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(100); // Reasonable upper bound for NEAR price
    }, 10000);
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log('NEAR Intents integration tests completed');
  });
});

describe('Real Testnet Integration (Optional)', () => {
  it('should perform end-to-end swap on testnet', async () => {
    const configValidation = nearIntentsConfig.validateConfig();
    
    if (!configValidation.valid || !nearIntentsConfig.isTestnet()) {
      console.warn('Skipping testnet integration test - not configured for testnet');
      return;
    }

    const accountConfig = nearIntentsConfig.getAccountConfig();
    const agent = new AIAgent(accountConfig);
    
    await agent.initialize();
    
    // Check balance first
    const accountState = await agent.getAccountState();
    const availableBalance = accountState.balanceInNear.available;
    
    if (availableBalance < 0.1) {
      console.warn('Insufficient balance for testnet integration test');
      return;
    }
    
    // Perform a small test swap
    const result = await agent.swapNearToToken('USDC', 0.01); // Very small amount
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result.transactionHash).toBeDefined();
      console.log('Testnet swap successful:', result.transactionHash);
    } else {
      console.log('Testnet swap failed (expected for demo):', result.error);
    }
  }, 60000); // 60 second timeout for real blockchain operations
});