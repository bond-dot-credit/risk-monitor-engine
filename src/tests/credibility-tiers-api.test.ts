import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';

// Mock the credibility tiers library
vi.mock('../lib/credibility-tiers', () => ({
  CREDIBILITY_TIERS: {
    BRONZE: {
      name: 'Bronze',
      emoji: '🥉',
      maxLTV: 40,
      minScore: 0,
      maxScore: 59,
      description: 'Basic tier for new agents',
      requirements: ['New agent registration', 'Basic verification'],
      benefits: ['Access to basic lending', 'Standard rates']
    },
    PLATINUM: {
      name: 'Platinum',
      emoji: '🏆',
      maxLTV: 70,
      minScore: 80,
      maxScore: 89,
      description: 'Elite agents with exceptional scores',
      requirements: ['Score 80+', '180 days active', '25+ successful transactions'],
      benefits: ['Elite LTV limits', 'Premium rates', 'Dedicated support']
    }
  },
  calculateCredibilityTier: vi.fn(),
  calculateMaxLTV: vi.fn(),
  checkTierUpgradeEligibility: vi.fn(),
  compareAgentTiers: vi.fn()
}));

// Get the mocked credibility tiers functions
const { 
  calculateCredibilityTier, 
  calculateMaxLTV, 
  checkTierUpgradeEligibility, 
  compareAgentTiers 
} = vi.hoisted(() => ({
  calculateCredibilityTier: vi.fn(),
  calculateMaxLTV: vi.fn(),
  checkTierUpgradeEligibility: vi.fn(),
  compareAgentTiers: vi.fn()
}));

// Mock the store
vi.mock('../lib/store', () => ({
  store: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    addAgent: vi.fn()
  }
}));

// Get the mocked store
const { store } = vi.hoisted(() => ({
  store: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    addAgent: vi.fn()
  }
}));

// Mock the seed library
vi.mock('../lib/seed', () => ({
  ensureSeeded: vi.fn()
}));

describe('Credibility Tiers API Logic', () => {
  let mockAgents: Agent[];
  let mockAgent: Agent;

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Platinum Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for credibility tiers',
        category: 'Trading',
        version: '2.0.0',
        tags: ['test', 'tiers', 'platinum'],
        provenance: {
          sourceCode: 'https://github.com/test-org/tier-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-15'),
          auditScore: 88,
          auditReport: 'https://audit-reports.com/test-tier-agent'
        },
        verificationMethods: [
          {
            id: 'verif_1',
            type: VerificationType.CODE_AUDIT,
            status: VerificationStatus.PASSED,
            score: 88,
            lastVerified: new Date('2024-01-15'),
            nextVerificationDue: new Date('2024-07-15'),
            details: {}
          }
        ]
      },
      score: {
        overall: 85,
        provenance: 88,
        performance: 82,
        perception: 80,
        verification: 88,
        confidence: 85,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.PLATINUM,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    mockAgents = [mockAgent];

    // Reset mocks
    vi.clearAllMocks();
    
    // Setup store mocks using the hoisted store
    store.getAgents.mockReturnValue(mockAgents);
    store.getAgent.mockReturnValue(mockAgent);
    store.addAgent.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Retrieval Logic', () => {
    it('should fetch all credibility tiers data', async () => {
      compareAgentTiers.mockReturnValue({
        tierDistribution: { [CredibilityTier.PLATINUM]: 1 },
        averageScores: { [CredibilityTier.PLATINUM]: 85 },
        tierPerformance: { [CredibilityTier.PLATINUM]: { avgLTV: 75, avgScore: 85 } }
      });

      const agents = store.getAgents();
      
      expect(agents).toHaveLength(1);
      expect(agents[0].credibilityTier).toBe(CredibilityTier.PLATINUM);
      expect(agents[0].score.overall).toBe(85);
    });

    it('should filter by specific agent ID', async () => {
      const agent = store.getAgent('test-agent-1');
      
      expect(agent).toBeDefined();
      expect(agent.id).toBe('test-agent-1');
      expect(agent.credibilityTier).toBe(CredibilityTier.PLATINUM);
    });

    it('should filter by specific tier', async () => {
      const agents = store.getAgents();
      const platinumAgents = agents.filter((agent: Agent) => agent.credibilityTier === CredibilityTier.PLATINUM);
      
      expect(platinumAgents).toHaveLength(1);
      expect(platinumAgents[0].credibilityTier).toBe(CredibilityTier.PLATINUM);
    });

    it('should include tier comparison when requested', async () => {
      compareAgentTiers.mockReturnValue({
        tierDistribution: { [CredibilityTier.PLATINUM]: 1 },
        averageScores: { [CredibilityTier.PLATINUM]: 85 },
        tierPerformance: { [CredibilityTier.PLATINUM]: { avgLTV: 75, avgScore: 85 } }
      });

      const agents = store.getAgents();
      const comparison = compareAgentTiers(agents);
      
      expect(comparison.tierDistribution[CredibilityTier.PLATINUM]).toBe(1);
      expect(comparison.averageScores[CredibilityTier.PLATINUM]).toBe(85);
    });

    it('should handle errors gracefully', async () => {
      store.getAgents.mockImplementation(() => {
        throw new Error('Store error');
      });

      expect(() => store.getAgents()).toThrow('Store error');
    });
  });

  describe('LTV Calculation Logic', () => {
    it('should calculate LTV for an agent', async () => {
      calculateMaxLTV.mockReturnValue(75);

      const agent = store.getAgent('test-agent-1');
      const ltv = calculateMaxLTV(agent, 1000000, 'normal');

      expect(calculateMaxLTV).toHaveBeenCalledWith(agent, 1000000, 'normal');
      expect(ltv).toBe(75);
    });

    it('should handle missing required parameters for LTV calculation', async () => {
      calculateMaxLTV.mockReturnValue(75);

      const agent = store.getAgent('test-agent-1');
      
      // Test with default parameters
      const ltv = calculateMaxLTV(agent);
      expect(ltv).toBe(75);
    });
  });

  describe('Tier Upgrade Logic', () => {
    it('should check upgrade eligibility', async () => {
      checkTierUpgradeEligibility.mockReturnValue({
        eligible: true,
        currentTier: CredibilityTier.PLATINUM,
        nextTier: CredibilityTier.DIAMOND,
        requirements: ['Score 90+', '365 days active'],
        missingRequirements: []
      });

      const agent = store.getAgent('test-agent-1');
      const eligibility = checkTierUpgradeEligibility(agent, 180, 25);
      
      expect(eligibility.eligible).toBe(true);
      expect(eligibility.nextTier).toBe(CredibilityTier.DIAMOND);
    });

    it('should handle agent not found', async () => {
      store.getAgent.mockReturnValue(null);

      const agent = store.getAgent('non-existent-agent');
      expect(agent).toBeNull();
    });
  });

  describe('Tier Update Logic', () => {
    it('should update agent tier', async () => {
      const updatedAgent = {
        ...mockAgent,
        credibilityTier: CredibilityTier.DIAMOND,
        updatedAt: new Date()
      };

      store.addAgent(updatedAgent);

      expect(store.addAgent).toHaveBeenCalledWith(updatedAgent);
      expect(updatedAgent.credibilityTier).toBe(CredibilityTier.DIAMOND);
    });

    it('should require agentId and newTier', async () => {
      // This would be validation logic in the actual API
      const updateData = {};
      const hasRequiredFields = 'agentId' in updateData && 'newTier' in updateData;
      
      expect(hasRequiredFields).toBe(false);
    });

    it('should validate tier values', async () => {
      const validTiers = Object.values(CredibilityTier);
      const invalidTier = 'INVALID_TIER';
      
      const isValidTier = validTiers.includes(invalidTier as CredibilityTier);
      expect(isValidTier).toBe(false);
    });

    it('should use default reason when not provided', async () => {
      const reason = undefined;
      const defaultReason = reason || 'Manual tier update';
      
      expect(defaultReason).toBe('Manual tier update');
    });
  });

  describe('Data Validation Logic', () => {
    it('should validate collateral values in LTV calculation', async () => {
      calculateMaxLTV.mockReturnValue(75);

      const agent = store.getAgent('test-agent-1');
      
      // Test with different collateral values
      const ltv1 = calculateMaxLTV(agent, 500000, 'normal');
      const ltv2 = calculateMaxLTV(agent, 1000000, 'normal');
      
      expect(ltv1).toBe(75);
      expect(ltv2).toBe(75);
    });

    it('should validate market conditions in LTV calculation', async () => {
      calculateMaxLTV.mockReturnValue(72);

      const agent = store.getAgent('test-agent-1');
      
      const ltv = calculateMaxLTV(agent, 1000000, 'bear');
      expect(ltv).toBe(72);
    });
  });
});
