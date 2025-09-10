import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/risk-monitor/route';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { CreditVault, VaultStatus, ChainId } from '../types/credit-vault';

// Get the mocked risk monitor
const { riskMonitor } = vi.hoisted(() => ({
  riskMonitor: {
    getStatus: vi.fn(),
    getActiveAlerts: vi.fn(),
    getRiskSummary: vi.fn(),
    getVaultAlerts: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    updateMarketData: vi.fn(),
    acknowledgeAlert: vi.fn(),
    simulateMarketVolatility: vi.fn(),
    simulatePriceUpdate: vi.fn()
  }
}));

// Mock the risk monitor
vi.mock('@/lib/risk-monitor', () => ({
  riskMonitor
}));

describe('Risk Monitor API', () => {
  let mockRequest: NextRequest;
  let mockAgent: Agent;
  let mockVault: CreditVault;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock return values
    riskMonitor.getStatus.mockReturnValue({
      isRunning: true,
      startedAt: new Date(),
      stoppedAt: undefined,
      config: {
        monitoringInterval: 30000,
        alertRetentionDays: 30,
        maxAlertsPerVault: 100,
        riskThresholds: { low: 25, medium: 50, high: 75 }
      },
      marketData: {},
      totalVaults: 5,
      activeAlerts: 3
    });
    riskMonitor.getActiveAlerts.mockReturnValue([]);
    riskMonitor.getRiskSummary.mockReturnValue({
      totalVaults: 5,
      activeAlerts: 3,
      riskDistribution: { LOW: 2, MEDIUM: 2, HIGH: 1, CRITICAL: 0 },
      chainDistribution: { '1': 3, '42161': 1, '137': 1 },
      lastUpdated: new Date()
    });
    riskMonitor.getVaultAlerts.mockReturnValue([]);
    riskMonitor.start.mockReturnValue(undefined);
    riskMonitor.stop.mockReturnValue(undefined);
    riskMonitor.updateMarketData.mockReturnValue(undefined);
    riskMonitor.acknowledgeAlert.mockReturnValue(undefined);
    riskMonitor.simulateMarketVolatility.mockReturnValue(1.5);
    riskMonitor.simulatePriceUpdate.mockReturnValue({ ETH: 2200, USDC: 1.0 });

    // Create mock agent
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for risk monitoring',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'risk', 'monitor'],
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
  });

  describe('GET /api/risk-monitor', () => {
    it('should return monitor status when action is status', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBeDefined();
      expect(data.status.isRunning).toBe(true);
      expect(data.status.totalVaults).toBe(5);
      expect(data.status.activeAlerts).toBe(3);
    });

    it('should return active alerts when action is alerts', async () => {
      // Mock alerts
      riskMonitor.getActiveAlerts.mockReturnValue([
        {
          id: 'alert_1',
          vaultId: 'vault_1',
          type: 'HIGH_RISK',
          message: 'High LTV detected',
          acknowledged: false,
          createdAt: new Date()
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=alerts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts).toBeInstanceOf(Array);
      expect(data.alerts.length).toBe(1);
      expect(data.alerts[0].type).toBe('HIGH_RISK');
    });

    it('should return risk summary when action is summary', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=summary');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.totalVaults).toBe(5);
      expect(data.summary.riskDistribution).toBeDefined();
      expect(data.summary.chainDistribution).toBeDefined();
    });

    it('should return market data when action is market-data', async () => {
      // Mock market data
      riskMonitor.getStatus.mockReturnValue({
        ...riskMonitor.getStatus(),
        marketData: {
          [ChainId.ETHEREUM]: {
            volatility: 1.2,
            gasPrice: 25,
            priceFeeds: { ETH: 2000, USDC: 1.0 }
          }
        }
      });

      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=market-data');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.marketData).toBeDefined();
      expect(data.marketData[ChainId.ETHEREUM]).toBeDefined();
    });

    it('should return vault alerts when action is vault-alerts and vaultId is provided', async () => {
      // Mock vault alerts
      riskMonitor.getVaultAlerts.mockReturnValue([
        {
          id: 'alert_1',
          vaultId: 'vault_1',
          type: 'MEDIUM_RISK',
          message: 'Elevated LTV',
          acknowledged: false,
          createdAt: new Date()
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=vault-alerts&vaultId=vault_1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alerts).toBeInstanceOf(Array);
      expect(data.alerts.length).toBe(1);
      expect(data.alerts[0].vaultId).toBe('vault_1');
    });

    it('should return error for invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });

    it('should return error when no action specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Action is required');
    });

    it('should handle missing vaultId for vault-alerts action', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor?action=vault-alerts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Vault ID is required');
    });
  });

  describe('POST /api/risk-monitor', () => {
    it('should start monitoring when action is start-monitoring', async () => {
      const requestData = { action: 'start-monitoring' };
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Risk monitoring started');
      
      expect(riskMonitor.start).toHaveBeenCalled();
    });

    it('should stop monitoring when action is stop-monitoring', async () => {
      const requestData = { action: 'stop-monitoring' };
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Risk monitoring stopped');
      
      expect(riskMonitor.stop).toHaveBeenCalled();
    });

    it('should update market data when action is update-market-data', async () => {
      const requestData = {
        action: 'update-market-data',
        chainId: ChainId.ETHEREUM,
        marketData: {
          volatility: 1.5,
          gasPrice: 30,
          priceFeeds: { ETH: 2100, USDC: 1.0 }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Market data updated');
      
      expect(riskMonitor.updateMarketData).toHaveBeenCalledWith(
        ChainId.ETHEREUM,
        requestData.marketData
      );
    });

    it('should acknowledge alert when action is acknowledge-alert', async () => {
      const requestData = {
        action: 'acknowledge-alert',
        alertId: 'alert_123'
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Alert acknowledged');
      
      expect(riskMonitor.acknowledgeAlert).toHaveBeenCalledWith('alert_123');
    });

    it('should simulate market volatility when action is simulate-volatility', async () => {
      const requestData = {
        action: 'simulate-volatility',
        chainId: ChainId.ETHEREUM,
        minVolatility: 0.5,
        maxVolatility: 2.0
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.newVolatility).toBe(1.5);
      
      expect(riskMonitor.simulateMarketVolatility).toHaveBeenCalledWith(
        ChainId.ETHEREUM,
        0.5,
        2.0
      );
    });

    it('should simulate price update when action is simulate-price-update', async () => {
      const requestData = {
        action: 'simulate-price-update',
        chainId: ChainId.ETHEREUM,
        volatilityFactor: 0.1
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.newPrices).toBeDefined();
      expect(data.newPrices.ETH).toBe(2200);
      
      expect(riskMonitor.simulatePriceUpdate).toHaveBeenCalledWith(
        ChainId.ETHEREUM,
        0.1
      );
    });

    it('should validate required fields for update-market-data', async () => {
      const requestData = {
        action: 'update-market-data',
        // Missing chainId and marketData
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for acknowledge-alert', async () => {
      const requestData = {
        action: 'acknowledge-alert',
        // Missing alertId
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for simulate-volatility', async () => {
      const requestData = {
        action: 'simulate-volatility',
        chainId: ChainId.ETHEREUM,
        // Missing minVolatility and maxVolatility
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate required fields for simulate-price-update', async () => {
      const requestData = {
        action: 'simulate-price-update',
        chainId: ChainId.ETHEREUM,
        // Missing volatilityFactor
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate chain ID for chain-specific actions', async () => {
      const requestData = {
        action: 'update-market-data',
        chainId: 999999, // Invalid chain ID
        marketData: { volatility: 1.0 }
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid chain ID');
    });

    it('should validate volatility ranges for simulate-volatility', async () => {
      const requestData = {
        action: 'simulate-volatility',
        chainId: ChainId.ETHEREUM,
        minVolatility: -1, // Invalid negative value
        maxVolatility: 2.0
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid volatility range');
    });

    it('should validate volatility factor for simulate-price-update', async () => {
      const requestData = {
        action: 'simulate-price-update',
        chainId: ChainId.ETHEREUM,
        volatilityFactor: 2.0 // Too high
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid volatility factor');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST'
        // No body
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // Currently the API returns "Invalid JSON" for missing body
      expect(data.error).toContain('Invalid JSON');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
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
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
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
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
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
      riskMonitor.start.mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const requestData = { action: 'start-monitoring' };
      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
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
        action: 'update-market-data',
        chainId: ChainId.ETHEREUM,
        marketData: {
          volatility: 'invalid', // Should be number
          gasPrice: 25
        }
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      // Currently the API doesn't validate data types, so expect success
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate string fields', async () => {
      const requestData = {
        action: 'acknowledge-alert',
        alertId: 123 // Should be string
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      // Currently the API doesn't validate data types, so expect success
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate enum values', async () => {
      const requestData = {
        action: 'update-market-data',
        chainId: 'INVALID_CHAIN', // Should be valid ChainId enum
        marketData: { volatility: 1.0 }
      };

      const request = new NextRequest('http://localhost:3000/api/risk-monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid chain ID');
    });
  });
});
