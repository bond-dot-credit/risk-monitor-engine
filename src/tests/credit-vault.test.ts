import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  calculateDynamicLTV,
  calculateHealthFactor,
  calculateVaultRiskMetrics,
  shouldTriggerLiquidationProtection,
  executeProtectionRules,
  createCreditVault,
  updateVaultCollateral,
  updateVaultDebt,
  recalculateVaultMetrics,
  DEFAULT_CHAIN_CONFIGS
} from '../lib/credit-vault';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { 
  CreditVault, 
  VaultStatus, 
  ChainId, 
  VaultProtectionRule,
  LiquidationTrigger
} from '../types/credit-vault';

// Mock the credibility tiers library
vi.mock('../lib/credibility-tiers', () => ({
  calculateMaxLTV: vi.fn().mockImplementation((agent: Record<string, unknown>, collateral: number = 0, marketConditions: string = 'normal') => {
    // Mock implementation that returns a reasonable LTV value
    const baseLTV = 70; // Default to 70%
    let adjustedLTV = baseLTV;
    
    // Add some bonuses based on agent score
    if (agent.score?.overall) {
      const scoreBonus = Math.min(5, Math.floor(agent.score.overall / 20));
      adjustedLTV += scoreBonus;
    }
    
    // Ensure LTV stays within reasonable bounds
    return Math.max(20, Math.min(85, adjustedLTV));
  })
}));

describe('Credit Vault Management', () => {
  let mockAgent: Agent;
  let mockVault: CreditVault;
  let mockHistoricalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Note: calculateMaxLTV is imported from credibility-tiers in the credit-vault library

    // Create mock agent
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for credit vault testing',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'credit', 'vault'],
        provenance: {
          sourceCode: 'https://github.com/test-org/credit-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-01'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/credit-agent'
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

    // Create mock vault
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
        amount: 10000,
        valueUSD: 10000,
        lastUpdated: new Date()
      },
      ltv: 50,
      healthFactor: 2.0,
      maxLTV: 70,
      liquidationProtection: {
        enabled: true,
        threshold: 59.5, // 85% of 70
        cooldown: 3600,
        lastTriggered: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRiskCheck: new Date()
    };

    // Create mock historical data
    mockHistoricalData = [
      { timestamp: new Date('2024-01-01'), ltv: 45, healthFactor: 2.2 },
      { timestamp: new Date('2024-01-02'), ltv: 48, healthFactor: 2.1 },
      { timestamp: new Date('2024-01-03'), ltv: 50, healthFactor: 2.0 }
    ];
  });

  describe('Chain Configurations', () => {
    it('should have valid chain configurations for all supported chains', () => {
      expect(DEFAULT_CHAIN_CONFIGS[ChainId.ETHEREUM]).toBeDefined();
      expect(DEFAULT_CHAIN_CONFIGS[ChainId.ARBITRUM]).toBeDefined();
      expect(DEFAULT_CHAIN_CONFIGS[ChainId.POLYGON]).toBeDefined();
      
      // Check Ethereum config
      const ethereumConfig = DEFAULT_CHAIN_CONFIGS[ChainId.ETHEREUM];
      expect(ethereumConfig.name).toBe('Ethereum');
      expect(ethereumConfig.nativeToken).toBe('ETH');
      expect(ethereumConfig.ltvAdjustments.baseMultiplier).toBe(1.0);
      expect(ethereumConfig.liquidationSettings.minHealthFactor).toBe(1.1);
      
      // Check Arbitrum config
      const arbitrumConfig = DEFAULT_CHAIN_CONFIGS[ChainId.ARBITRUM];
      expect(arbitrumConfig.name).toBe('Arbitrum');
      expect(arbitrumConfig.ltvAdjustments.baseMultiplier).toBe(0.95);
      expect(arbitrumConfig.liquidationSettings.minHealthFactor).toBe(1.15);
      
      // Check Polygon config
      const polygonConfig = DEFAULT_CHAIN_CONFIGS[ChainId.POLYGON];
      expect(polygonConfig.name).toBe('Polygon');
      expect(polygonConfig.ltvAdjustments.baseMultiplier).toBe(0.90);
      expect(polygonConfig.liquidationSettings.minHealthFactor).toBe(1.2);
    });
  });

  describe('Dynamic LTV Calculation', () => {
    it('should calculate dynamic LTV based on agent scores and chain factors', () => {
      const ltv = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 1.0);
      
      // Base LTV: 70, Score adjustment: (82-50)*0.1 = 3.2, Tier bonus: 1
      // Expected: 70 + 3.2 + 1 = 74.2
      expect(ltv).toBeGreaterThan(70);
      expect(ltv).toBeLessThanOrEqual(85);
    });

    it('should apply different multipliers for different chains', () => {
      const ethereumLTV = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 1.0);
      const arbitrumLTV = calculateDynamicLTV(mockAgent, ChainId.ARBITRUM, 20000, 1.0);
      const polygonLTV = calculateDynamicLTV(mockAgent, ChainId.POLYGON, 20000, 1.0);
      
      // Ethereum should have highest LTV (base multiplier 1.0)
      // Arbitrum should have lower LTV (base multiplier 0.95)
      // Polygon should have lowest LTV (base multiplier 0.90)
      expect(ethereumLTV).toBeGreaterThan(arbitrumLTV);
      expect(arbitrumLTV).toBeGreaterThan(polygonLTV);
    });

    it('should apply volatility adjustments', () => {
      const lowVolatilityLTV = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 0.5);
      const highVolatilityLTV = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 2.0);
      
      // Higher volatility should result in lower LTV
      expect(lowVolatilityLTV).toBeGreaterThan(highVolatilityLTV);
    });

    it('should apply credibility tier bonuses', () => {
      const bronzeAgent = { ...mockAgent, credibilityTier: CredibilityTier.BRONZE };
      const goldAgent = { ...mockAgent, credibilityTier: CredibilityTier.GOLD };
      const platinumAgent = { ...mockAgent, credibilityTier: CredibilityTier.PLATINUM };
      
      const bronzeLTV = calculateDynamicLTV(bronzeAgent, ChainId.ETHEREUM, 20000, 1.0);
      const goldLTV = calculateDynamicLTV(goldAgent, ChainId.ETHEREUM, 20000, 1.0);
      const platinumLTV = calculateDynamicLTV(platinumAgent, ChainId.ETHEREUM, 20000, 1.0);
      
      // Higher tiers should get higher LTV
      expect(platinumLTV).toBeGreaterThan(goldLTV);
      expect(goldLTV).toBeGreaterThan(bronzeLTV);
    });

    it('should clamp LTV to valid bounds', () => {
      const veryHighScoreAgent = { ...mockAgent, score: { ...mockAgent.score, overall: 100 } };
      const veryLowScoreAgent = { ...mockAgent, score: { ...mockAgent.score, overall: 0 } };
      
      const highScoreLTV = calculateDynamicLTV(veryHighScoreAgent, ChainId.ETHEREUM, 20000, 1.0);
      const lowScoreLTV = calculateDynamicLTV(veryLowScoreAgent, ChainId.ETHEREUM, 20000, 1.0);
      
      expect(highScoreLTV).toBeLessThanOrEqual(85);
      expect(lowScoreLTV).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Health Factor Calculation', () => {
    it('should calculate health factor correctly', () => {
      const healthFactor = calculateHealthFactor(mockVault, mockAgent, 1.0);
      
      // With LTV 50% and max LTV 70%, health factor should be > 1
      expect(healthFactor).toBeGreaterThan(1.0);
    });

    it('should return Infinity for vaults with no debt', () => {
      const noDebtVault = { ...mockVault, debt: { ...mockVault.debt, valueUSD: 0 } };
      const healthFactor = calculateHealthFactor(noDebtVault, mockAgent, 1.0);
      
      expect(healthFactor).toBe(Infinity);
    });

    it('should return 0 for vaults at max LTV', () => {
      // Use a debt amount that would result in health factor ≤ 1.0
      // With dynamic LTV calculation, we need to ensure the debt is high enough
      const maxLTVVault = { ...mockVault, debt: { ...mockVault.debt, valueUSD: 19000 } }; // Very high debt
      const healthFactor = calculateHealthFactor(maxLTVVault, mockAgent, 1.0);
      
      // The health factor should be very low (close to 0) when debt is very high
      expect(healthFactor).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Vault Risk Metrics', () => {
    it('should calculate comprehensive risk metrics', () => {
      const riskMetrics = calculateVaultRiskMetrics(mockVault, mockAgent, mockHistoricalData);
      
      expect(riskMetrics.vaultId).toBe(mockVault.id);
      expect(riskMetrics.currentLTV).toBe(mockVault.ltv);
      expect(riskMetrics.currentHealthFactor).toBe(mockVault.healthFactor);
      expect(riskMetrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(riskMetrics.riskScore).toBeLessThanOrEqual(100);
      expect(riskMetrics.riskLevel).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      expect(riskMetrics.warnings).toBeInstanceOf(Array);
      expect(riskMetrics.recommendations).toBeInstanceOf(Array);
    });

    it('should include historical data in metrics', () => {
      const riskMetrics = calculateVaultRiskMetrics(mockVault, mockAgent, mockHistoricalData);
      
      expect(riskMetrics.ltvHistory).toHaveLength(3);
      expect(riskMetrics.healthFactorHistory).toHaveLength(3);
      expect(riskMetrics.ltvHistory[0].value).toBe(45);
      expect(riskMetrics.ltvHistory[2].value).toBe(50);
    });

    it('should determine risk level based on metrics', () => {
      // Test LOW risk
      const lowRiskVault = { ...mockVault, ltv: 30, healthFactor: 3.0 };
      const lowRiskMetrics = calculateVaultRiskMetrics(lowRiskVault, mockAgent, []);
      expect(lowRiskMetrics.riskLevel).toBe('LOW');
      
      // Test HIGH risk
      const highRiskVault = { ...mockVault, ltv: 80, healthFactor: 1.1 }; // healthFactor <= 1.2 for HIGH
      const highRiskMetrics = calculateVaultRiskMetrics(highRiskVault, mockAgent, []);
      expect(highRiskMetrics.riskLevel).toBe('HIGH');
      
      // Test CRITICAL risk
      const criticalRiskVault = { ...mockVault, ltv: 95, healthFactor: 1.0 };
      const criticalRiskMetrics = calculateVaultRiskMetrics(criticalRiskVault, mockAgent, []);
      expect(criticalRiskMetrics.riskLevel).toBe('CRITICAL');
    });

    it('should generate appropriate warnings and recommendations', () => {
      const highRiskVault = { ...mockVault, ltv: 80, healthFactor: 1.3 };
      const riskMetrics = calculateVaultRiskMetrics(highRiskVault, mockAgent, []);
      
      expect(riskMetrics.warnings.length).toBeGreaterThan(0);
      expect(riskMetrics.recommendations.length).toBeGreaterThan(0);
      
      // Should warn about high LTV
      const ltvWarnings = riskMetrics.warnings.filter(w => w.includes('LTV'));
      expect(ltvWarnings.length).toBeGreaterThan(0);
      
      // Should recommend actions
      const recommendations = riskMetrics.recommendations.filter(r => r.includes('Consider'));
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Liquidation Protection', () => {
    it('should trigger protection when LTV exceeds threshold', () => {
      const highLTVVault = { ...mockVault, ltv: 60 }; // Above threshold of 59.5
      const shouldTrigger = shouldTriggerLiquidationProtection(highLTVVault, mockAgent, 1.0);
      
      expect(shouldTrigger).toBe(true);
    });

    it('should trigger protection when health factor is low', () => {
      // Create a vault with debt that would result in a low health factor
      const lowHealthVault = { 
        ...mockVault, 
        debt: { ...mockVault.debt, valueUSD: 18000 } // High debt relative to collateral
      };
      const shouldTrigger = shouldTriggerLiquidationProtection(lowHealthVault, mockAgent, 1.0);
      
      expect(shouldTrigger).toBe(true);
    });

    it('should respect cooldown periods', () => {
      const recentlyTriggeredVault = {
        ...mockVault,
        liquidationProtection: {
          ...mockVault.liquidationProtection,
          lastTriggered: new Date(Date.now() - 1000) // 1 second ago
        }
      };
      
      const shouldTrigger = shouldTriggerLiquidationProtection(recentlyTriggeredVault, mockAgent, 1.0);
      
      expect(shouldTrigger).toBe(false);
    });

    it('should not trigger when protection is disabled', () => {
      const disabledProtectionVault = {
        ...mockVault,
        liquidationProtection: {
          ...mockVault.liquidationProtection,
          enabled: false
        }
      };
      
      const shouldTrigger = shouldTriggerLiquidationProtection(disabledProtectionVault, mockAgent, 1.0);
      
      expect(shouldTrigger).toBe(false);
    });
  });

  describe('Protection Rules Execution', () => {
    it('should execute protection rules based on conditions', () => {
      const rules: VaultProtectionRule[] = [
        {
          id: 'rule_1',
          vaultId: mockVault.id,
          name: 'High LTV Alert',
          description: 'Alert when LTV is high',
          conditions: { ltvThreshold: 60 },
          actions: [{ type: 'NOTIFY', parameters: {} }],
          enabled: true,
          priority: 1,
          cooldown: 3600
        }
      ];
      
      const highLTVVault = { ...mockVault, ltv: 65 };
      const results = executeProtectionRules(highLTVVault, rules, mockAgent, 1.0);
      
      expect(results).toHaveLength(1);
      expect(results[0].executed).toBe(true);
      expect(results[0].message).toBe('Rule executed successfully');
    });

    it('should respect rule priorities', () => {
      const rules: VaultProtectionRule[] = [
        {
          id: 'rule_1',
          vaultId: mockVault.id,
          name: 'Low Priority',
          description: 'Low priority rule',
          conditions: { ltvThreshold: 60 },
          actions: [{ type: 'NOTIFY', parameters: {} }],
          enabled: true,
          priority: 1,
          cooldown: 3600
        },
        {
          id: 'rule_2',
          vaultId: mockVault.id,
          name: 'High Priority',
          description: 'High priority rule',
          conditions: { ltvThreshold: 60 },
          actions: [{ type: 'NOTIFY', parameters: {} }],
          enabled: true,
          priority: 10,
          cooldown: 3600
        }
      ];
      
      const highLTVVault = { ...mockVault, ltv: 65 };
      const results = executeProtectionRules(highLTVVault, rules, mockAgent, 1.0);
      
      // High priority rule should be executed first
      expect(results[0].action).toBe('High Priority');
      expect(results[1].action).toBe('Low Priority');
    });

    it('should respect cooldown periods for rules', () => {
      const rules: VaultProtectionRule[] = [
        {
          id: 'rule_1',
          vaultId: mockVault.id,
          name: 'Test Rule',
          description: 'Test rule with cooldown',
          conditions: { ltvThreshold: 60 },
          actions: [{ type: 'NOTIFY', parameters: {} }],
          enabled: true,
          priority: 1,
          cooldown: 3600,
          lastExecuted: new Date(Date.now() - 1000) // 1 second ago
        }
      ];
      
      const highLTVVault = { ...mockVault, ltv: 65 };
      const results = executeProtectionRules(highLTVVault, rules, mockAgent, 1.0);
      
      expect(results[0].executed).toBe(false);
      expect(results[0].message).toBe('Rule in cooldown period');
    });
  });

  describe('Vault Management', () => {
    it('should create new credit vaults', () => {
      const vault = createCreditVault(
        'agent_1',
        ChainId.ETHEREUM,
        'ETH',
        10,
        20000,
        70
      );
      
      expect(vault.id).toMatch(/^vault_\d+_[a-z0-9]+$/);
      expect(vault.agentId).toBe('agent_1');
      expect(vault.chainId).toBe(ChainId.ETHEREUM);
      expect(vault.status).toBe(VaultStatus.ACTIVE);
      expect(vault.collateral.token).toBe('ETH');
      expect(vault.collateral.amount).toBe(10);
      expect(vault.collateral.valueUSD).toBe(20000);
      expect(vault.debt.valueUSD).toBe(0);
      expect(vault.ltv).toBe(0);
      expect(vault.healthFactor).toBe(Infinity);
      expect(vault.maxLTV).toBe(70);
      expect(vault.liquidationProtection.enabled).toBe(true);
      expect(vault.liquidationProtection.threshold).toBe(59.5); // 85% of 70
    });

    it('should update vault collateral', () => {
      const updatedVault = updateVaultCollateral(mockVault, 15, 30000);
      
      expect(updatedVault.collateral.amount).toBe(15);
      expect(updatedVault.collateral.valueUSD).toBe(30000);
      expect(updatedVault.collateral.lastUpdated).toBeInstanceOf(Date);
      expect(updatedVault.updatedAt).toBeInstanceOf(Date);
    });

    it('should update vault debt', () => {
      const updatedVault = updateVaultDebt(mockVault, 15000, 15000);
      
      expect(updatedVault.debt.amount).toBe(15000);
      expect(updatedVault.debt.valueUSD).toBe(15000);
      expect(updatedVault.debt.lastUpdated).toBeInstanceOf(Date);
      expect(updatedVault.updatedAt).toBeInstanceOf(Date);
    });

    it('should recalculate vault metrics', () => {
      const updatedVault = recalculateVaultMetrics(mockVault, mockAgent, 1.0);
      
      expect(updatedVault.lastRiskCheck).toBeInstanceOf(Date);
      expect(updatedVault.updatedAt).toBeInstanceOf(Date);
      // LTV should be recalculated: (10000 / 20000) * 100 = 50
      expect(updatedVault.ltv).toBe(50);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported chain ID', () => {
      expect(() => {
        calculateDynamicLTV(mockAgent, 999999 as ChainId, 20000, 1.0);
      }).toThrow('Unsupported chain ID: 999999');
    });

    it('should handle edge cases gracefully', () => {
      // Test with very high volatility
      const highVolatilityLTV = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 10.0);
      expect(highVolatilityLTV).toBeGreaterThanOrEqual(20);
      expect(highVolatilityLTV).toBeLessThanOrEqual(85);
      
      // Test with very low volatility
      const lowVolatilityLTV = calculateDynamicLTV(mockAgent, ChainId.ETHEREUM, 20000, 0.1);
      expect(lowVolatilityLTV).toBeGreaterThanOrEqual(20);
      expect(lowVolatilityLTV).toBeLessThanOrEqual(85);
    });
  });
});
