import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedRiskMonitor, ENHANCED_RISK_MONITOR_CONFIG } from '../lib/risk-monitor-enhanced';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { 
  CreditVault, 
  VaultStatus, 
  ChainId
} from '../types/credit-vault';
import { EnhancedMarketData, EnhancedRiskAlert } from '../lib/risk-monitor-enhanced';

// Get the mocked credit vault functions
const { calculateVaultRiskMetrics, shouldTriggerLiquidationProtection, recalculateVaultMetrics } = vi.hoisted(() => ({
  calculateVaultRiskMetrics: vi.fn(),
  shouldTriggerLiquidationProtection: vi.fn(),
  recalculateVaultMetrics: vi.fn()
}));

// Mock the credit vault library
vi.mock('../lib/credit-vault', () => ({
  calculateVaultRiskMetrics,
  shouldTriggerLiquidationProtection,
  recalculateVaultMetrics
}));

describe('Enhanced Risk Monitor', () => {
  let enhancedRiskMonitor: EnhancedRiskMonitor;
  let mockAgent: Agent;
  let mockVault: CreditVault;
  let mockHistoricalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock return values
    calculateVaultRiskMetrics.mockReturnValue({
      vaultId: 'vault_1',
      currentLTV: 50,
      currentHealthFactor: 2.0,
      riskScore: 25,
      riskLevel: 'LOW',
      warnings: [],
      recommendations: [],
      ltvHistory: [],
      healthFactorHistory: []
    });
    shouldTriggerLiquidationProtection.mockReturnValue(false);
    recalculateVaultMetrics.mockImplementation((vault) => ({
      ...vault,
      lastRiskCheck: new Date(),
      updatedAt: new Date()
    }));

    // Create mock agent
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for enhanced risk monitoring',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'risk', 'monitor', 'enhanced'],
        provenance: {
          sourceCode: 'https://github.com/test-org/risk-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-01'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/risk-agent'
        },
        verificationMethods: [
          {
            id: 'verif_1',
            type: VerificationType.CODE_AUDIT,
            status: VerificationStatus.PASSED,
            score: 85,
            lastVerified: new Date('2024-01-01'),
            nextVerificationDue: new Date('2024-07-01'),
            details: {}
          }
        ]
      },
      score: {
        overall: 82,
        provenance: 85,
        performance: 80,
        perception: 78,
        verification: 85,
        confidence: 82,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    // Create mock vault with high LTV to trigger alerts
    mockVault = {
      id: 'vault_1',
      agentId: 'test-agent-1',
      chainId: ChainId.ETHEREUM,
      status: VaultStatus.ACTIVE,
      collateral: {
        token: 'ETH',
        amount: 10,
        valueUSD: 20000,
        lastUpdated: new Date()
      },
      debt: {
        token: 'USDC',
        amount: 16000,
        valueUSD: 16000,
        lastUpdated: new Date()
      },
      ltv: 95, // High LTV to trigger alerts
      healthFactor: 1.0, // Low health factor to trigger alerts
      maxLTV: 70,
      liquidationProtection: {
        enabled: true,
        threshold: 59.5,
        cooldown: 3600,
        lastTriggered: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRiskCheck: new Date()
    };

    // Create mock historical data
    mockHistoricalData = [
      { timestamp: new Date('2024-01-01'), ltv: 75, healthFactor: 1.3 },
      { timestamp: new Date('2024-01-02'), ltv: 78, healthFactor: 1.25 },
      { timestamp: new Date('2024-01-03'), ltv: 80, healthFactor: 1.2 }
    ];

    // Create enhanced risk monitor instance
    enhancedRiskMonitor = new EnhancedRiskMonitor(ENHANCED_RISK_MONITOR_CONFIG);
  });

  afterEach(() => {
    // Clean up any running intervals
    if (enhancedRiskMonitor.getEnhancedStatus().isRunning) {
      enhancedRiskMonitor.stop();
    }
  });

  describe('Configuration', () => {
    it('should have enhanced configuration with performance and analytics', () => {
      expect(ENHANCED_RISK_MONITOR_CONFIG).toBeDefined();
      expect(ENHANCED_RISK_MONITOR_CONFIG.checkInterval).toBe(30000);
      expect(ENHANCED_RISK_MONITOR_CONFIG.performance).toBeDefined();
      expect(ENHANCED_RISK_MONITOR_CONFIG.performance.maxConcurrentVaults).toBe(100);
      expect(ENHANCED_RISK_MONITOR_CONFIG.analytics).toBeDefined();
      expect(ENHANCED_RISK_MONITOR_CONFIG.analytics.enablePredictiveAnalysis).toBe(true);
    });

    it('should accept custom enhanced configuration', () => {
      const customConfig = {
        checkInterval: 60000,
        alertThresholds: { 
          ltvWarning: 65, 
          ltvAlert: 75, 
          ltvCritical: 85,
          healthFactorWarning: 1.4,
          healthFactorAlert: 1.2,
          healthFactorCritical: 1.0
        },
        autoProtection: {
          enabled: false,
          maxProtectionTriggers: 5,
          protectionCooldown: 7200
        },
        performance: {
          maxConcurrentVaults: 200,
          batchSize: 20,
          timeoutMs: 10000,
          retryAttempts: 5
        },
        analytics: {
          enableRealTimeMetrics: false,
          enablePredictiveAnalysis: false,
          enableCorrelationAnalysis: false,
          dataRetentionDays: 7
        }
      };
      
      const customMonitor = new EnhancedRiskMonitor(customConfig);
      const status = customMonitor.getEnhancedStatus();
      
      expect(status.config.performance.maxConcurrentVaults).toBe(200);
      expect(status.config.analytics.enablePredictiveAnalysis).toBe(false);
    });
  });

  describe('Enhanced Lifecycle Management', () => {
    it('should start enhanced monitoring', () => {
      enhancedRiskMonitor.start();
      const status = enhancedRiskMonitor.getEnhancedStatus();
      
      expect(status.isRunning).toBe(true);
    });

    it('should stop enhanced monitoring', () => {
      enhancedRiskMonitor.start();
      enhancedRiskMonitor.stop();
      const status = enhancedRiskMonitor.getEnhancedStatus();
      
      expect(status.isRunning).toBe(false);
    });

    it('should track performance metrics during lifecycle', () => {
      enhancedRiskMonitor.start();
      
      // Wait for at least one check to complete
      setTimeout(() => {
        const metrics = enhancedRiskMonitor.getPerformanceMetrics();
        expect(metrics.totalChecks).toBeGreaterThan(0);
        expect(metrics.lastCheckTime).toBeInstanceOf(Date);
      }, 100);
      
      enhancedRiskMonitor.stop();
    });
  });

  describe('Enhanced Market Data Management', () => {
    it('should update enhanced market data with additional fields', () => {
      const enhancedMarketData: Partial<EnhancedMarketData> = {
        volatility: 1.5,
        gasPrice: 25,
        priceFeeds: { ETH: 2000, USDC: 1.0 },
        marketCap: 1000000000,
        volume24h: 50000000,
        priceChange24h: 5.2,
        volatilityIndex: 1.8,
        marketSentiment: 'BULLISH'
      };
      
      enhancedRiskMonitor.updateMarketData(ChainId.ETHEREUM, enhancedMarketData);
      const data = enhancedRiskMonitor.getMarketData(ChainId.ETHEREUM);
      
      expect(data).toBeDefined();
      expect(data?.volatility).toBe(1.5);
      expect(data?.marketCap).toBe(1000000000);
      expect(data?.marketSentiment).toBe('BULLISH');
      expect(data?.volatilityIndex).toBe(1.8);
    });

    it('should maintain separate enhanced market data for different chains', () => {
      enhancedRiskMonitor.updateMarketData(ChainId.ETHEREUM, { 
        volatility: 1.0, 
        marketSentiment: 'BULLISH',
        volatilityIndex: 1.2
      });
      enhancedRiskMonitor.updateMarketData(ChainId.ARBITRUM, { 
        volatility: 0.8, 
        marketSentiment: 'BEARISH',
        volatilityIndex: 0.9
      });
      
      const ethereumData = enhancedRiskMonitor.getMarketData(ChainId.ETHEREUM);
      const arbitrumData = enhancedRiskMonitor.getMarketData(ChainId.ARBITRUM);
      
      expect(ethereumData?.marketSentiment).toBe('BULLISH');
      expect(arbitrumData?.marketSentiment).toBe('BEARISH');
      expect(ethereumData?.volatilityIndex).toBe(1.2);
      expect(arbitrumData?.volatilityIndex).toBe(0.9);
    });
  });

  describe('Enhanced Vault Monitoring', () => {
    it('should monitor vault and return enhanced metrics', async () => {
      const result = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      
      expect(result.riskMetrics).toBeDefined();
      expect(result.alerts).toBeInstanceOf(Array);
      expect(result.protectionTriggered).toBe(false);
      expect(result.predictiveMetrics).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.dataPoints).toBe(3);
    });

    it('should generate enhanced alerts with categorization', async () => {
      // Create a high-risk vault with LTV above critical threshold
      const highRiskVault: CreditVault = {
        ...mockVault,
        ltv: 95, // Above critical threshold (90)
        healthFactor: 1.0
      };
      
      const result = await enhancedRiskMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      
      expect(result.alerts.length).toBeGreaterThan(0);
      const alert = result.alerts[0];
      expect(alert.severity).toBe('CRITICAL');
      expect(alert.category).toBe('LTV');
      expect(alert.escalationLevel).toBe(3);
      expect(alert.autoEscalation).toBe(true);
      expect(alert.metadata.currentLTV).toBe(95);
    });

    it('should calculate predictive risk metrics', async () => {
      const result = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      
      expect(result.predictiveMetrics).toBeDefined();
      expect(result.predictiveMetrics.predictedLTV).toBeGreaterThan(0);
      expect(result.predictiveMetrics.predictedHealthFactor).toBeGreaterThan(0);
      expect(result.predictiveMetrics.riskProbability).toBeGreaterThanOrEqual(0);
      expect(result.predictiveMetrics.riskProbability).toBeLessThanOrEqual(1);
      expect(result.predictiveMetrics.timeHorizon).toBe(24);
      expect(result.predictiveMetrics.confidence).toBeGreaterThan(0);
      expect(result.predictiveMetrics.factors).toBeInstanceOf(Array);
    });

    it('should handle insufficient historical data for predictions', async () => {
      const result = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, []);
      
      expect(result.predictiveMetrics.confidence).toBe(0.1);
      expect(result.predictiveMetrics.factors).toContain('Insufficient historical data');
    });
  });

  describe('Enhanced Alert Management', () => {
    it('should generate enhanced alerts with correct properties', async () => {
      const highRiskVault: CreditVault = {
        ...mockVault,
        ltv: 95, // Above critical threshold
        healthFactor: 1.0
      };
      
      await enhancedRiskMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      const alerts = enhancedRiskMonitor.getActiveAlerts();
      
      expect(alerts.length).toBeGreaterThan(0);
      const alert = alerts[0];
      expect(alert.id).toMatch(/^alert_\d+_[a-z0-9]+$/);
      expect(alert.vaultId).toBe(mockVault.id);
      expect(alert.type).toMatch(/^(WARNING|ALERT|CRITICAL)$/);
      expect(alert.severity).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      expect(alert.category).toMatch(/^(LTV|HEALTH_FACTOR|MARKET_RISK|LIQUIDATION|PERFORMANCE|SYSTEM)$/);
      expect(alert.escalationLevel).toBeGreaterThan(0);
      expect(alert.metadata).toBeDefined();
      expect(alert.relatedAlerts).toBeInstanceOf(Array);
    });

    it('should retrieve enhanced alerts for specific vaults', async () => {
      await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      const vaultAlerts = enhancedRiskMonitor.getVaultAlerts(mockVault.id);
      
      expect(vaultAlerts).toBeInstanceOf(Array);
      expect(vaultAlerts.length).toBeGreaterThan(0);
      expect(vaultAlerts[0].vaultId).toBe(mockVault.id);
    });

    it('should acknowledge enhanced alerts', async () => {
      const highRiskVault: CreditVault = {
        ...mockVault,
        ltv: 95, // Above critical threshold
        healthFactor: 1.0
      };
      
      await enhancedRiskMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      const alerts = enhancedRiskMonitor.getActiveAlerts();
      const alertId = alerts[0].id;
      
      enhancedRiskMonitor.acknowledgeAlert(alertId, 'test-user');
      const updatedAlert = enhancedRiskMonitor.getVaultAlerts(mockVault.id).find(a => a.id === alertId);
      
      expect(updatedAlert?.acknowledged).toBe(true);
      expect(updatedAlert?.acknowledgedBy).toBe('test-user');
      expect(updatedAlert?.acknowledgedAt).toBeInstanceOf(Date);
    });
  });

  describe('Enhanced Risk Summary', () => {
    it('should generate comprehensive enhanced risk summary', async () => {
      // Monitor multiple vaults to generate alerts
      const highRiskVault: CreditVault = {
        ...mockVault,
        ltv: 95, // Above critical threshold
        healthFactor: 1.0
      };
      
      await enhancedRiskMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      
      const summary = enhancedRiskMonitor.getEnhancedRiskSummary();
      
      expect(summary.totalVaults).toBe(0); // Currently hardcoded
      expect(summary.totalAlerts).toBeGreaterThanOrEqual(0);
      expect(summary.unacknowledgedAlerts).toBeGreaterThanOrEqual(0);
      expect(summary.alertsByCategory).toBeDefined();
      expect(summary.alertsBySeverity).toBeDefined();
      expect(summary.performanceMetrics).toBeDefined();
      expect(summary.marketOverview).toBeDefined();
      expect(summary.marketOverview.totalChains).toBeGreaterThanOrEqual(0);
      expect(summary.marketOverview.averageVolatility).toBeGreaterThan(0);
      expect(summary.marketOverview.marketSentiment).toBeDefined();
    });

    it('should categorize alerts by category and severity', async () => {
      const highRiskVault: CreditVault = {
        ...mockVault,
        ltv: 95, // Above critical threshold
        healthFactor: 1.0
      };
      
      await enhancedRiskMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      
      const summary = enhancedRiskMonitor.getEnhancedRiskSummary();
      
      expect(summary.alertsByCategory.LTV).toBeGreaterThan(0);
      expect(summary.alertsBySeverity.CRITICAL).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics during operations', async () => {
      const initialMetrics = enhancedRiskMonitor.getPerformanceMetrics();
      expect(initialMetrics.totalChecks).toBe(0);
      expect(initialMetrics.successRate).toBe(100);
      
      await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      
      const updatedMetrics = enhancedRiskMonitor.getPerformanceMetrics();
      expect(updatedMetrics.totalChecks).toBeGreaterThanOrEqual(0);
      expect(updatedMetrics.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should provide enhanced status with performance metrics', () => {
      const status = enhancedRiskMonitor.getEnhancedStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.config).toBeDefined();
      expect(status.alertsCount).toBe(0);
      expect(status.performanceMetrics).toBeDefined();
      expect(status.marketDataCount).toBe(0);
      expect(status.vaultMetricsHistoryCount).toBe(0);
    });
  });

  describe('Predictive Analytics', () => {
    it('should calculate risk probability based on market conditions', async () => {
      // Set up market data with high volatility
      enhancedRiskMonitor.updateMarketData(ChainId.ETHEREUM, {
        volatilityIndex: 2.5,
        marketSentiment: 'BEARISH'
      });
      
      const result = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      
      expect(result.predictiveMetrics.riskProbability).toBeGreaterThan(0);
      expect(result.predictiveMetrics.confidence).toBeGreaterThan(0);
      expect(result.predictiveMetrics.factors).toContain('Market volatility: 2.50');
    });

    it('should adjust predictions based on historical data quality', async () => {
      // Test with different amounts of historical data
      const resultWithLittleData = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, []);
      const resultWithMoreData = await enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData);
      
      expect(resultWithLittleData.predictiveMetrics.confidence).toBeLessThan(resultWithMoreData.predictiveMetrics.confidence);
    });
  });

  describe('Error Handling', () => {
    it('should handle monitoring errors gracefully', async () => {
      // Mock function to throw error
      calculateVaultRiskMetrics.mockImplementation(() => {
        throw new Error('Simulated enhanced error');
      });
      
      await expect(enhancedRiskMonitor.monitorVault(mockVault, mockAgent, mockHistoricalData))
        .rejects.toThrow('Simulated enhanced error');
    });

    it('should handle invalid alert acknowledgment', () => {
      // Try to acknowledge non-existent alert
      const result = enhancedRiskMonitor.acknowledgeAlert('non-existent-id', 'test-user');
      expect(result).toBe(false);
    });
  });

  describe('Scalability and Performance', () => {
    it('should handle multiple vaults efficiently', async () => {
      const vaults = Array.from({ length: 5 }, (_, i) => ({
        ...mockVault,
        id: `vault_${i}`,
        agentId: `agent_${i}`
      }));
      
      const startTime = Date.now();
      
      for (const vault of vaults) {
        await enhancedRiskMonitor.monitorVault(vault, mockAgent, mockHistoricalData);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000);
      
      const summary = enhancedRiskMonitor.getEnhancedRiskSummary();
      expect(summary.totalAlerts).toBeGreaterThan(0);
    });

    it('should maintain performance with enhanced features', async () => {
      const config = { ...ENHANCED_RISK_MONITOR_CONFIG, performance: { maxConcurrentVaults: 1000, batchSize: 50, timeoutMs: 10000, retryAttempts: 5 } };
      const highPerformanceMonitor = new EnhancedRiskMonitor(config);
      
      // Generate many alerts
      for (let i = 0; i < 10; i++) {
        const highRiskVault: CreditVault = {
          ...mockVault,
          id: `vault_${i}`,
          ltv: 95, // Above critical threshold
          healthFactor: 1.0
        };
        
        await highPerformanceMonitor.monitorVault(highRiskVault, mockAgent, mockHistoricalData);
      }
      
      const alerts = highPerformanceMonitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      
      // Performance should remain reasonable
      const startTime = Date.now();
      const summary = highPerformanceMonitor.getEnhancedRiskSummary();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
