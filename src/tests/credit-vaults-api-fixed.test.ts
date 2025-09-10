import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';
import { CreditVault, VaultStatus, ChainId } from '../types/credit-vault';

// Mock the dependencies using vi.hoisted
const { mockCreateCreditVault, mockCalculateDynamicLTV, mockRecalculateVaultMetrics, mockStore } = vi.hoisted(() => ({
  mockCreateCreditVault: vi.fn(),
  mockCalculateDynamicLTV: vi.fn(),
  mockRecalculateVaultMetrics: vi.fn(),
  mockStore: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    addAgent: vi.fn()
  }
}));

// Mock the modules
vi.mock('@/lib/credit-vault', () => ({
  createCreditVault: mockCreateCreditVault,
  calculateDynamicLTV: mockCalculateDynamicLTV,
  recalculateVaultMetrics: mockRecalculateVaultMetrics
}));

vi.mock('@/lib/store', () => ({
  store: mockStore
}));

// Mock the seed function
vi.mock('@/lib/seed', () => ({
  ensureSeeded: vi.fn()
}));

// Now import the API route after mocking
import { GET, POST } from '../app/api/credit-vaults/route';

describe('Credit Vaults API (Fixed)', () => {
  let mockRequest: NextRequest;
  let mockAgent: Agent;
  let mockVault: CreditVault;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock return values
    mockCreateCreditVault.mockReturnValue({
      id: 'vault_123',
      agentId: 'agent_1',
      chainId: ChainId.ETHEREUM,
      status: VaultStatus.ACTIVE,
      collateral: { token: 'ETH', amount: 10, valueUSD: 20000, lastUpdated: new Date() },
      debt: { token: 'USDC', amount: 0, valueUSD: 0, lastUpdated: new Date() },
      ltv: 0,
      healthFactor: Infinity,
      maxLTV: 70,
      liquidationProtection: { enabled: true, threshold: 59.5, cooldown: 3600 },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRiskCheck: new Date()
    });
    
    mockCalculateDynamicLTV.mockReturnValue(70);
    mockRecalculateVaultMetrics.mockReturnValue({
      id: 'vault_123',
      ltv: 0,
      healthFactor: Infinity,
      lastRiskCheck: new Date(),
      updatedAt: new Date()
    });

    // Setup store mock return values
    mockStore.getAgents.mockReturnValue([]);
    mockStore.getAgent.mockReturnValue(null);
    mockStore.addAgent.mockReturnValue({ success: true });

    // Create mock agent
    mockAgent = {
      id: 'agent_1',
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
      score: { overall: 85, performance: 90, reliability: 80, security: 85, confidence: 0.8 },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    // Create mock vault
    mockVault = {
      id: 'vault_1',
      agentId: 'agent_1',
      chainId: ChainId.ETHEREUM,
      status: VaultStatus.ACTIVE,
      collateral: { token: 'ETH', amount: 10, valueUSD: 20000, lastUpdated: new Date() },
      debt: { token: 'USDC', amount: 10000, valueUSD: 10000, lastUpdated: new Date() },
      ltv: 50,
      healthFactor: 2.0,
      maxLTV: 70,
      liquidationProtection: { enabled: true, threshold: 59.5, cooldown: 3600 },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRiskCheck: new Date()
    };
  });

  describe('GET /api/credit-vaults', () => {
    it('should return empty array when no vaults exist', async () => {
      // Mock the store to return empty array
      mockStore.getAgents.mockReturnValue([]);
      
      const request = new NextRequest('http://localhost:3000/api/credit-vaults');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should filter vaults by chain ID', async () => {
      // Mock the store to return vaults
      mockStore.getAgents.mockReturnValue([mockVault]);
      
      const request = new NextRequest('http://localhost:3000/api/credit-vaults?chainId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeInstanceOf(Array);
      // Should only return Ethereum vaults
      expect(data.every(v => v.chainId === ChainId.ETHEREUM)).toBe(true);
    });
  });

  describe('POST /api/credit-vaults', () => {
    it('should create a new credit vault successfully', async () => {
      // Mock the store to return an agent
      mockStore.getAgent.mockReturnValue(mockAgent);
      
      const request = new NextRequest('http://localhost:3000/api/credit-vaults', {
        method: 'POST',
        body: JSON.stringify({
          agentId: 'agent_1',
          chainId: ChainId.ETHEREUM,
          collateralToken: 'ETH',
          collateralAmount: 10,
          collateralValueUSD: 20000
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.vault).toBeDefined();
      expect(mockCreateCreditVault).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/credit-vaults', {
        method: 'POST',
        body: JSON.stringify({
          agentId: 'agent_1',
          // Missing required fields
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should handle agent not found', async () => {
      // Mock the store to return no agent
      mockStore.getAgent.mockReturnValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/credit-vaults', {
        method: 'POST',
        body: JSON.stringify({
          agentId: 'nonexistent_agent',
          chainId: ChainId.ETHEREUM,
          collateralToken: 'ETH',
          collateralAmount: 10,
          collateralValueUSD: 20000
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Agent not found');
    });
  });
});
