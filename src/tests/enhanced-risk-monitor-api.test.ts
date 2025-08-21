import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/enhanced-risk-monitor/route';
import { store } from '../lib/store';
import { ensureSeeded } from '../lib/seed';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { ChainId } from '../types/credit-vault';

// Mock the store and seed functions
const { getAgent, getCreditVault } = vi.hoisted(() => ({
  getAgent: vi.fn(),
  getCreditVault: vi.fn()
}));

const { ensureSeeded: mockEnsureSeeded } = vi.hoisted(() => ({
  ensureSeeded: vi.fn()
}));

vi.mock('../lib/store', () => ({
  store: { getAgent, getCreditVault }
}));

vi.mock('../lib/seed', () => ({
  ensureSeeded: mockEnsureSeeded
}));

describe('Enhanced Risk Monitor API', () => {
  let mockAgent: Agent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureSeeded.mockImplementation(() => {});
    
    // Setup mock agent
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

    getAgent.mockReturnValue(mockAgent);
    getCreditVault.mockReturnValue(null); // Will use fallback vault
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/enhanced-risk-monitor', () => {
    it('should return enhanced risk monitor status', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.isRunning).toBeDefined();
      expect(data.data.config).toBeDefined();
      expect(data.data.performanceMetrics).toBeDefined();
    });

    it('should return enhanced risk summary', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=summary');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.totalVaults).toBeDefined();
      expect(data.data.totalAlerts).toBeDefined();
      expect(data.data.alertsByCategory).toBeDefined();
      expect(data.data.alertsBySeverity).toBeDefined();
      expect(data.data.performanceMetrics).toBeDefined();
      expect(data.data.marketOverview).toBeDefined();
    });

    it('should return performance metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.totalChecks).toBeDefined();
      expect(data.data.averageResponseTime).toBeDefined();
      expect(data.data.successRate).toBeDefined();
    });

    it('should return active alerts by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=alerts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should return alerts for specific vault', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=alerts&vaultId=vault_1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should return alerts by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=alerts&category=LTV');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should return alerts by severity', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=alerts&severity=CRITICAL');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should return market data for specific chain', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=market-data&chainId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Market data might be undefined initially if no data has been set
      expect(data.data).toBeDefined();
    });

    it('should return market data for all chains', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=market-data');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      // Market data might be undefined initially if no data has been set
      expect(data.data.ethereum).toBeDefined();
      expect(data.data.arbitrum).toBeDefined();
      expect(data.data.polygon).toBeDefined();
    });

    it('should handle invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor?action=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });
  });

  describe('POST /api/enhanced-risk-monitor', () => {
    it('should start enhanced risk monitoring', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({ action: 'start' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('started');
      expect(data.data).toBeDefined();
    });

    it('should stop enhanced risk monitoring', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({ action: 'stop' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('stopped');
      expect(data.data).toBeDefined();
    });

    it('should monitor vault with enhanced features', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'monitor-vault',
          vaultId: 'vault_1',
          agentId: 'test-agent-1',
          historicalData: [
            { timestamp: new Date('2024-01-01'), ltv: 75, healthFactor: 1.3 },
            { timestamp: new Date('2024-01-02'), ltv: 78, healthFactor: 1.25 }
          ]
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.riskMetrics).toBeDefined();
      expect(data.data.alerts).toBeInstanceOf(Array);
      expect(data.data.predictiveMetrics).toBeDefined();
      expect(data.data.performanceMetrics).toBeDefined();
    });

    it('should validate required fields for vault monitoring', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'monitor-vault',
          vaultId: 'vault_1'
          // Missing agentId
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('vaultId and agentId are required');
    });

    it('should handle agent not found', async () => {
      getAgent.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'monitor-vault',
          vaultId: 'vault_1',
          agentId: 'non-existent-agent'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Agent not found');
    });

    it('should update market data', async () => {
      const marketData = {
        volatility: 1.5,
        gasPrice: 25,
        priceFeeds: { ETH: 2000, USDC: 1.0 },
        marketCap: 1000000000,
        volume24h: 50000000,
        priceChange24h: 5.2,
        volatilityIndex: 1.8,
        marketSentiment: 'BULLISH'
      };

      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-market-data',
          chainId: ChainId.ETHEREUM,
          marketData
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('updated successfully');
      expect(data.data).toBeDefined();
    });

    it('should validate market data update fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-market-data',
          chainId: ChainId.ETHEREUM
          // Missing marketData
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('chainId and marketData are required');
    });

    it('should acknowledge alerts', async () => {
      // First, create an alert by monitoring a high-risk vault
      const monitorRequest = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'monitor-vault',
          vaultId: 'vault_1',
          agentId: 'test-agent-1',
          historicalData: []
        })
      });

      await POST(monitorRequest);

      // Now try to acknowledge an alert
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId: 'alert_123',
          acknowledgedBy: 'test-user'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return 404 since the specific alert ID doesn't exist
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Alert not found');
    });

    it('should validate alert acknowledgment fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId: 'alert_123'
          // Missing acknowledgedBy
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('alertId and acknowledgedBy are required');
    });

    it('should simulate market volatility', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'simulate-market-volatility',
          chainId: ChainId.ETHEREUM,
          volatility: 2.5
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('simulated successfully');
      expect(data.data).toBeDefined();
    });

    it('should validate market volatility simulation fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'simulate-market-volatility',
          chainId: ChainId.ETHEREUM
          // Missing volatility
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('chainId and volatility are required');
    });

    it('should simulate price updates', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'simulate-price-update',
          chainId: ChainId.ETHEREUM,
          token: 'ETH',
          price: 2200
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('simulated successfully');
      expect(data.data).toBeDefined();
    });

    it('should validate price update simulation fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'simulate-price-update',
          chainId: ChainId.ETHEREUM,
          token: 'ETH'
          // Missing price
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('chainId, token, and price are required');
    });

    it('should handle invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'invalid-action'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action');
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/enhanced-risk-monitor', {
        method: 'POST'
        // No body
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to process request');
    });
  });
});
