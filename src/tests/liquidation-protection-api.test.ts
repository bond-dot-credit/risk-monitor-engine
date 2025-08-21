import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/liquidation-protection/route';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { CreditVault, VaultStatus, ChainId, VaultProtectionRule } from '../types/credit-vault';

// Get the mocked functions
const { shouldTriggerLiquidationProtection, executeProtectionRules } = vi.hoisted(() => ({
  shouldTriggerLiquidationProtection: vi.fn(),
  executeProtectionRules: vi.fn()
}));

const { riskMonitor } = vi.hoisted(() => ({
  riskMonitor: {
    getStatus: vi.fn(),
    getActiveAlerts: vi.fn()
  }
}));

// Mock the credit vault library
vi.mock('../lib/credit-vault', () => ({
  DEFAULT_CHAIN_CONFIGS: {
    1: {
      name: 'Ethereum',
      nativeToken: 'ETH',
      ltvAdjustments: { baseMultiplier: 1.0, scoreMultiplier: 0.1, volatilityMultiplier: 0.05 },
      liquidationSettings: { minHealthFactor: 1.1, liquidationPenalty: 0.05, gracePeriod: 3600 }
    },
    42161: {
      name: 'Arbitrum',
      nativeToken: 'ARB',
      ltvAdjustments: { baseMultiplier: 0.95, scoreMultiplier: 0.1, volatilityMultiplier: 0.05 },
      liquidationSettings: { minHealthFactor: 1.15, liquidationPenalty: 0.05, gracePeriod: 3600 }
    },
    137: {
      name: 'Polygon',
      nativeToken: 'MATIC',
      ltvAdjustments: { baseMultiplier: 0.90, scoreMultiplier: 0.1, volatilityMultiplier: 0.05 },
      liquidationSettings: { minHealthFactor: 1.2, liquidationPenalty: 0.05, gracePeriod: 3600 }
    }
  },
  shouldTriggerLiquidationProtection,
  executeProtectionRules
}));

// Mock the risk monitor
vi.mock('../lib/risk-monitor', () => ({
  riskMonitor
}));

describe('Liquidation Protection API', () => {
  let mockRequest: NextRequest;
  let mockAgent: Agent;
  let mockVault: CreditVault;
  let mockProtectionRule: VaultProtectionRule;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock return values
    shouldTriggerLiquidationProtection.mockReturnValue(false);
    executeProtectionRules.mockReturnValue([]);

    riskMonitor.getStatus.mockReturnValue({
      isRunning: true,
      totalVaults: 5,
      activeAlerts: 2
    });
    riskMonitor.getActiveAlerts.mockReturnValue([]);

    // Create mock agent
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for liquidation protection testing',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'liquidation', 'protection'],
        provenance: {
          sourceCode: 'https://github.com/test-org/protection-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-01'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/protection-agent'
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
        threshold: 59.5,
        cooldown: 3600,
        lastTriggered: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRiskCheck: new Date()
    };

    // Create mock protection rule
    mockProtectionRule = {
      id: 'rule_1',
      vaultId: 'vault_1',
      name: 'High LTV Protection',
      description: 'Protect against high LTV scenarios',
      conditions: {
        ltvThreshold: 60,
        healthFactorThreshold: 1.5,
        scoreThreshold: 70,
        timeWindow: 3600
      },
      actions: [
        {
          type: 'NOTIFY',
          parameters: { channel: 'email', recipients: ['admin@example.com'] }
        },
        {
          type: 'AUTO_REPAY',
          parameters: { maxAmount: 1000, priority: 'high' }
        }
      ],
      enabled: true,
      priority: 1,
      cooldown: 1800,
      lastExecuted: undefined
    };
  });

  describe('GET /api/liquidation-protection', () => {
    it('should return chain configurations when action is chain-configs', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection?action=chain-configs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.chainConfigs).toBeDefined();
      expect(data.chainConfigs[ChainId.ETHEREUM]).toBeDefined();
      expect(data.chainConfigs[ChainId.ARBITRUM]).toBeDefined();
      expect(data.chainConfigs[ChainId.POLYGON]).toBeDefined();
    });

    it('should return protection status when action is protection-status', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection?action=protection-status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.protectionStatus).toBeDefined();
      expect(data.protectionStatus.totalVaults).toBe(5);
      expect(data.protectionStatus.activeAlerts).toBe(2);
    });

    it('should return error for invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection?action=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });

    it('should return error when no action specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Action is required');
    });
  });

  describe('POST /api/liquidation-protection', () => {
    it('should check protection trigger when action is check-protection-trigger', async () => {
      const requestData = {
        action: 'check-protection-trigger',
        vaultId: 'vault_1',
        agentId: 'test-agent-1',
        marketVolatility: 1.0
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shouldTrigger).toBe(false);
      
      const { shouldTriggerLiquidationProtection } = require('../lib/credit-vault');
      expect(shouldTriggerLiquidationProtection).toHaveBeenCalled();
    });

    it('should execute protection rules when action is execute-protection-rules', async () => {
      const requestData = {
        action: 'execute-protection-rules',
        vaultId: 'vault_1',
        agentId: 'test-agent-1',
        rules: [mockProtectionRule],
        marketVolatility: 1.0
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeInstanceOf(Array);
      
      const { executeProtectionRules } = require('../lib/credit-vault');
      expect(executeProtectionRules).toHaveBeenCalled();
    });

    it('should create protection rule when action is create-protection-rule', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 'vault_1',
        name: 'New Protection Rule',
        description: 'A new protection rule for testing',
        conditions: {
          ltvThreshold: 65,
          healthFactorThreshold: 1.3
        },
        actions: [
          {
            type: 'NOTIFY',
            parameters: { channel: 'slack', channelId: '#alerts' }
          }
        ],
        enabled: true,
        priority: 2,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.rule).toBeDefined();
      expect(data.rule.name).toBe('New Protection Rule');
      expect(data.rule.vaultId).toBe('vault_1');
    });

    it('should update protection rule when action is update-protection-rule', async () => {
      const requestData = {
        action: 'update-protection-rule',
        ruleId: 'rule_1',
        updates: {
          name: 'Updated Protection Rule',
          conditions: {
            ltvThreshold: 70
          },
          enabled: false
        }
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.rule).toBeDefined();
      expect(data.rule.name).toBe('Updated Protection Rule');
      expect(data.rule.enabled).toBe(false);
    });

    it('should enable protection when action is enable-protection', async () => {
      const requestData = {
        action: 'enable-protection',
        vaultId: 'vault_1',
        settings: {
          threshold: 55,
          cooldown: 1800
        }
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Protection enabled');
      expect(data.settings).toBeDefined();
      expect(data.settings.threshold).toBe(55);
    });

    it('should disable protection when action is disable-protection', async () => {
      const requestData = {
        action: 'disable-protection',
        vaultId: 'vault_1'
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Protection disabled');
    });

    it('should simulate liquidation when action is simulate-liquidation', async () => {
      const requestData = {
        action: 'simulate-liquidation',
        vaultId: 'vault_1',
        scenario: {
          ltv: 85,
          healthFactor: 0.8,
          marketVolatility: 2.0
        }
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.simulation).toBeDefined();
      expect(data.simulation.triggered).toBe(true);
      expect(data.simulation.recommendations).toBeInstanceOf(Array);
    });

    it('should validate required fields for check-protection-trigger', async () => {
      const requestData = {
        action: 'check-protection-trigger',
        // Missing vaultId and agentId
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for execute-protection-rules', async () => {
      const requestData = {
        action: 'execute-protection-rules',
        vaultId: 'vault_1',
        // Missing agentId and rules
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for create-protection-rule', async () => {
      const requestData = {
        action: 'create-protection-rule',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for update-protection-rule', async () => {
      const requestData = {
        action: 'update-protection-rule',
        // Missing ruleId and updates
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for enable-protection', async () => {
      const requestData = {
        action: 'enable-protection',
        // Missing vaultId
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for disable-protection', async () => {
      const requestData = {
        action: 'disable-protection',
        // Missing vaultId
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for simulate-liquidation', async () => {
      const requestData = {
        action: 'simulate-liquidation',
        // Missing vaultId and scenario
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate rule conditions for create-protection-rule', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 'vault_1',
        name: 'Test Rule',
        description: 'Test description',
        conditions: {
          ltvThreshold: -10, // Invalid negative value
          healthFactorThreshold: 0.5 // Invalid low value
        },
        actions: [
          {
            type: 'NOTIFY',
            parameters: {}
          }
        ],
        enabled: true,
        priority: 1,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid rule conditions');
    });

    it('should validate rule actions for create-protection-rule', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 'vault_1',
        name: 'Test Rule',
        description: 'Test description',
        conditions: {
          ltvThreshold: 60
        },
        actions: [
          {
            type: 'INVALID_ACTION', // Invalid action type
            parameters: {}
          }
        ],
        enabled: true,
        priority: 1,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid rule actions');
    });

    it('should validate protection settings for enable-protection', async () => {
      const requestData = {
        action: 'enable-protection',
        vaultId: 'vault_1',
        settings: {
          threshold: 150, // Invalid threshold > 100
          cooldown: -100 // Invalid negative cooldown
        }
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid protection settings');
    });

    it('should validate liquidation scenario for simulate-liquidation', async () => {
      const requestData = {
        action: 'simulate-liquidation',
        vaultId: 'vault_1',
        scenario: {
          ltv: 150, // Invalid LTV > 100
          healthFactor: -1, // Invalid negative health factor
          marketVolatility: 0 // Invalid volatility
        }
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid liquidation scenario');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST'
        // No body
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Request body is required');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should handle missing action in request body', async () => {
      const requestData = { /* no action */ };
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Action is required');
    });

    it('should handle invalid action in request body', async () => {
      const requestData = { action: 'invalid-action' };
      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });

    it('should handle internal server errors gracefully', async () => {
      // Mock function to throw error
      const { shouldTriggerLiquidationProtection } = require('../lib/credit-vault');
      shouldTriggerLiquidationProtection.mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const requestData = {
        action: 'check-protection-trigger',
        vaultId: 'vault_1',
        agentId: 'test-agent-1',
        marketVolatility: 1.0
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('Data Validation', () => {
    it('should validate numeric fields', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 'vault_1',
        name: 'Test Rule',
        description: 'Test description',
        conditions: {
          ltvThreshold: 'invalid', // Should be number
          healthFactorThreshold: 1.5
        },
        actions: [
          {
            type: 'NOTIFY',
            parameters: {}
          }
        ],
        enabled: true,
        priority: 1,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid rule conditions');
    });

    it('should validate string fields', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 123, // Should be string
        name: 'Test Rule',
        description: 'Test description',
        conditions: { ltvThreshold: 60 },
        actions: [
          {
            type: 'NOTIFY',
            parameters: {}
          }
        ],
        enabled: true,
        priority: 1,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate boolean fields', async () => {
      const requestData = {
        action: 'create-protection-rule',
        vaultId: 'vault_1',
        name: 'Test Rule',
        description: 'Test description',
        conditions: { ltvThreshold: 60 },
        actions: [
          {
            type: 'NOTIFY',
            parameters: {}
          }
        ],
        enabled: 'invalid', // Should be boolean
        priority: 1,
        cooldown: 3600
      };

      const request = new NextRequest('http://localhost:3000/api/liquidation-protection', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid rule data');
    });
  });
});
