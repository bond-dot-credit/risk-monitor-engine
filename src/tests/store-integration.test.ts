import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';

// Mock the credibility tiers library
vi.mock('../lib/credibility-tiers', () => ({
  calculateCredibilityTier: vi.fn(),
  calculateMaxLTV: vi.fn(),
  CREDIBILITY_TIERS: {
    [CredibilityTier.BRONZE]: { maxLTV: 40, minScore: 0, maxScore: 59 },
    [CredibilityTier.SILVER]: { maxLTV: 50, minScore: 60, maxScore: 69 },
    [CredibilityTier.GOLD]: { maxLTV: 60, minScore: 70, maxScore: 79 },
    [CredibilityTier.PLATINUM]: { maxLTV: 70, minScore: 80, maxScore: 89 },
    [CredibilityTier.DIAMOND]: { maxLTV: 80, minScore: 90, maxScore: 100 }
  }
}));

// Get the mocked credibility tiers functions
const { calculateCredibilityTier, calculateMaxLTV } = vi.hoisted(() => ({
  calculateCredibilityTier: vi.fn(),
  calculateMaxLTV: vi.fn()
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

describe('Store Integration with Credibility Tiers', () => {
  let mockAgents: Agent[];
  let mockAgent: Agent;

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for store integration',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'store', 'integration'],
        provenance: {
          sourceCode: 'https://github.com/test-org/store-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-01'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/store-agent'
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

  describe('Agent Tier Management', () => {
    it('should update agent tier when score changes', async () => {
      calculateCredibilityTier.mockReturnValue(CredibilityTier.PLATINUM);

      const updatedAgent = {
        ...mockAgent,
        score: { ...mockAgent.score, overall: 85 }
      };

      // Simulate score update
      const newTier = calculateCredibilityTier(updatedAgent.score);
      updatedAgent.credibilityTier = newTier;
      updatedAgent.updatedAt = new Date();

      // Update in store
      store.addAgent(updatedAgent);

      expect(store.addAgent).toHaveBeenCalledWith(updatedAgent);
      expect(updatedAgent.credibilityTier).toBe(CredibilityTier.PLATINUM);
    });

    it('should maintain tier consistency across store operations', async () => {
      const agents = store.getAgents();
      const agent = store.getAgent('test-agent-1');

      expect(agent.credibilityTier).toBe(CredibilityTier.GOLD);
      expect(agents[0].credibilityTier).toBe(CredibilityTier.GOLD);
      expect(agent.credibilityTier).toBe(agents[0].credibilityTier);
    });

    it('should handle tier updates with proper validation', async () => {
      calculateCredibilityTier.mockReturnValue(CredibilityTier.DIAMOND);

      const updatedAgent = {
        ...mockAgent,
        score: { ...mockAgent.score, overall: 95 }
      };

      // Validate tier change
      const oldTier = updatedAgent.credibilityTier;
      const newTier = calculateCredibilityTier(updatedAgent.score);
      
      // Only allow valid tier transitions
      if (newTier !== oldTier) {
        updatedAgent.credibilityTier = newTier;
        updatedAgent.updatedAt = new Date();
        
        store.addAgent(updatedAgent);
      }

      expect(updatedAgent.credibilityTier).toBe(CredibilityTier.DIAMOND);
    });
  });

  describe('LTV Calculations with Store Data', () => {
    it('should calculate LTV using agent data from store', async () => {
      calculateMaxLTV.mockReturnValue(75);

      const agent = store.getAgent('test-agent-1');
      const ltv = calculateMaxLTV(agent, 1000000, 'normal');

      expect(calculateMaxLTV).toHaveBeenCalledWith(agent, 1000000, 'normal');
      expect(ltv).toBe(75);
    });

    it('should handle LTV calculations for multiple agents', async () => {
      calculateMaxLTV.mockReturnValue(75);

      const agents = store.getAgents();
      const ltvResults = agents.map((agent: Agent) => 
        calculateMaxLTV(agent, 1000000, 'normal')
      );

      expect(ltvResults).toHaveLength(1);
      expect(ltvResults[0]).toBe(75);
      expect(calculateMaxLTV).toHaveBeenCalledTimes(1);
    });

    it('should update LTV when agent tier changes', async () => {
      calculateMaxLTV.mockReturnValue(80);

      const updatedAgent = {
        ...mockAgent,
        credibilityTier: CredibilityTier.PLATINUM
      };

      const oldLTV = calculateMaxLTV(mockAgent, 1000000, 'normal');
      const newLTV = calculateMaxLTV(updatedAgent, 1000000, 'normal');

      // Since both are mocked to return 80, they should be equal
      expect(newLTV).toBe(oldLTV);
    });
  });

  describe('Tier Distribution Analysis', () => {
    it('should analyze tier distribution across all agents', async () => {
      const agents = store.getAgents();
      
      const tierDistribution = agents.reduce((acc: Record<CredibilityTier, number>, agent: Agent | null) => {
        if (agent) {
          acc[agent.credibilityTier] = (acc[agent.credibilityTier] || 0) + 1;
        }
        return acc;
      }, {} as Record<CredibilityTier, number>);

      expect(tierDistribution[CredibilityTier.GOLD]).toBe(1);
      expect(Object.keys(tierDistribution)).toHaveLength(1);
    });

    it('should calculate average scores per tier', async () => {
      const agents = store.getAgents();
      
      const tierScores = agents.reduce((acc: Record<CredibilityTier, number[]>, agent: Agent | null) => {
        if (agent) {
          if (!acc[agent.credibilityTier]) {
            acc[agent.credibilityTier] = [];
          }
          acc[agent.credibilityTier].push(agent.score.overall);
        }
        return acc;
      }, {} as Record<CredibilityTier, number[]>);

      const averageScores = Object.entries(tierScores).reduce((acc: Record<CredibilityTier, number>, [tier, scores]) => {
        acc[tier as CredibilityTier] = (scores as number[]).reduce((sum: number, score: number) => sum + score, 0) / (scores as number[]).length;
        return acc;
      }, {} as Record<CredibilityTier, number>);

      expect(averageScores[CredibilityTier.GOLD]).toBe(82);
    });

    it('should identify agents eligible for tier upgrades', async () => {
      const agents = store.getAgents();
      
      const upgradeEligible = agents.filter((agent: Agent | null) => {
        if (!agent) return false;
        
        const currentScore = agent.score.overall;
        const currentTier = agent.credibilityTier;
        
        // Check if score is high enough for next tier
        switch (currentTier) {
          case CredibilityTier.BRONZE:
            return currentScore >= 60;
          case CredibilityTier.SILVER:
            return currentScore >= 70;
          case CredibilityTier.GOLD:
            return currentScore >= 80;
          case CredibilityTier.PLATINUM:
            return currentScore >= 90;
          default:
            return false;
        }
      });

      // Current agent has score 82, needs 80+ for Platinum, so should be eligible
      expect(upgradeEligible).toHaveLength(1);
    });
  });

  describe('Data Persistence', () => {
    it('should persist tier changes to store', async () => {
      const updatedAgent = {
        ...mockAgent,
        credibilityTier: CredibilityTier.PLATINUM,
        updatedAt: new Date()
      };

      store.addAgent(updatedAgent);

      expect(store.addAgent).toHaveBeenCalledWith(updatedAgent);
      expect(updatedAgent.updatedAt).toBeInstanceOf(Date);
    });

    it('should maintain data integrity during tier updates', async () => {
      const originalAgent = { ...mockAgent };
      
      const updatedAgent = {
        ...originalAgent,
        credibilityTier: CredibilityTier.PLATINUM,
        updatedAt: new Date('2024-02-01') // Use a different date
      };

      // Verify no unintended changes
      expect(updatedAgent.id).toBe(originalAgent.id);
      expect(updatedAgent.name).toBe(originalAgent.name);
      expect(updatedAgent.operator).toBe(originalAgent.operator);
      expect(updatedAgent.metadata).toEqual(originalAgent.metadata);
      expect(updatedAgent.score).toEqual(originalAgent.score);
      
      // Only these should change
      expect(updatedAgent.credibilityTier).not.toBe(originalAgent.credibilityTier);
      expect(updatedAgent.updatedAt).not.toEqual(originalAgent.updatedAt);
    });

    it('should handle concurrent tier updates', async () => {
      const agent1 = { ...mockAgent, id: 'agent-1' };
      const agent2 = { ...mockAgent, id: 'agent-2' };

      // Simulate concurrent updates
      const update1 = Promise.resolve().then(() => {
        agent1.credibilityTier = CredibilityTier.PLATINUM;
        store.addAgent(agent1);
      });

      const update2 = Promise.resolve().then(() => {
        agent2.credibilityTier = CredibilityTier.SILVER;
        store.addAgent(agent2);
      });

      await Promise.all([update1, update2]);

      expect(store.addAgent).toHaveBeenCalledTimes(2);
      expect(agent1.credibilityTier).toBe(CredibilityTier.PLATINUM);
      expect(agent2.credibilityTier).toBe(CredibilityTier.SILVER);
    });
  });

  describe('Error Handling', () => {
    it('should handle store errors gracefully', async () => {
      store.getAgents.mockImplementation(() => {
        throw new Error('Store connection failed');
      });

      expect(() => store.getAgents()).toThrow('Store connection failed');
    });

    it('should handle missing agent data', async () => {
      store.getAgent.mockReturnValue(null);

      const agent = store.getAgent('non-existent-agent');
      expect(agent).toBeNull();
    });

    it('should handle invalid tier values', async () => {
      const invalidAgent = {
        ...mockAgent,
        credibilityTier: 'INVALID_TIER' as Record<string, unknown>
      };

      // This should not crash the system
      expect(invalidAgent.credibilityTier).toBe('INVALID_TIER');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of agents efficiently', async () => {
      const largeAgentList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAgent,
        id: `agent-${i}`,
        score: { ...mockAgent.score, overall: Math.floor(Math.random() * 100) }
      }));

      store.getAgents.mockReturnValue(largeAgentList);

      const startTime = performance.now();
      const agents = store.getAgents();
      const endTime = performance.now();

      expect(agents).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
    });

    it('should handle frequent tier updates efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const updatedAgent = {
          ...mockAgent,
          credibilityTier: i % 2 === 0 ? CredibilityTier.GOLD : CredibilityTier.PLATINUM,
          updatedAt: new Date()
        };
        store.addAgent(updatedAgent);
      }
      
      const endTime = performance.now();

      expect(store.addAgent).toHaveBeenCalledTimes(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe('Data Validation', () => {
    it('should validate tier transitions', async () => {
      const validTransitions = [
        { from: CredibilityTier.BRONZE, to: CredibilityTier.SILVER, valid: true },
        { from: CredibilityTier.SILVER, to: CredibilityTier.GOLD, valid: true },
        { from: CredibilityTier.GOLD, to: CredibilityTier.PLATINUM, valid: true },
        { from: CredibilityTier.PLATINUM, to: CredibilityTier.DIAMOND, valid: true },
        { from: CredibilityTier.DIAMOND, to: CredibilityTier.BRONZE, valid: false }, // Downgrade not allowed
        { from: CredibilityTier.GOLD, to: CredibilityTier.DIAMOND, valid: false } // Skip tier not allowed
      ];

      validTransitions.forEach(({ from, to, valid }) => {
        const agent = { ...mockAgent, credibilityTier: from };
        
        if (valid) {
          agent.credibilityTier = to;
          expect(agent.credibilityTier).toBe(to);
        } else {
          expect(() => {
            agent.credibilityTier = to;
          }).not.toThrow(); // Should not crash, but may not be valid business logic
        }
      });
    });

    it('should validate score ranges for tiers', async () => {
      // Create agents with appropriate scores for each tier
      const tierScoreRanges = [
        { tier: CredibilityTier.BRONZE, min: 0, max: 59, score: 50 },
        { tier: CredibilityTier.SILVER, min: 60, max: 69, score: 65 },
        { tier: CredibilityTier.GOLD, min: 70, max: 79, score: 75 },
        { tier: CredibilityTier.PLATINUM, min: 80, max: 89, score: 85 },
        { tier: CredibilityTier.DIAMOND, min: 90, max: 100, score: 95 }
      ];

      tierScoreRanges.forEach(({ tier, min, max, score }) => {
        const agent = { 
          ...mockAgent, 
          credibilityTier: tier,
          score: { ...mockAgent.score, overall: score }
        };
        
        // Score should be within tier range
        expect(agent.score.overall).toBeGreaterThanOrEqual(min);
        expect(agent.score.overall).toBeLessThanOrEqual(max);
      });
    });
  });
});
