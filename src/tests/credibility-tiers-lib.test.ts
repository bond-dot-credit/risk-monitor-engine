import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CREDIBILITY_TIERS,
  calculateCredibilityTier,
  calculateMaxLTV,
  checkTierUpgradeEligibility,
  compareAgentTiers,
  calculateTierBenefits
} from '../lib/credibility-tiers';
import { Agent, CredibilityTier, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';

describe('Credibility Tiers Library', () => {
  let mockAgent: Agent;
  let mockAgents: Agent[];

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test'],
        provenance: {
          sourceCode: 'https://github.com/test-org/test-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-01'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/test-agent'
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
  });

  describe('CREDIBILITY_TIERS constant', () => {
    it('should have all required tiers defined', () => {
      expect(CREDIBILITY_TIERS[CredibilityTier.BRONZE]).toBeDefined();
      expect(CREDIBILITY_TIERS[CredibilityTier.SILVER]).toBeDefined();
      expect(CREDIBILITY_TIERS[CredibilityTier.GOLD]).toBeDefined();
      expect(CREDIBILITY_TIERS[CredibilityTier.PLATINUM]).toBeDefined();
      expect(CREDIBILITY_TIERS[CredibilityTier.DIAMOND]).toBeDefined();
    });

    it('should have correct tier properties', () => {
      const bronzeTier = CREDIBILITY_TIERS[CredibilityTier.BRONZE];
      expect(bronzeTier.name).toBe('Bronze');
      expect(bronzeTier.emoji).toBe('🥉');
      expect(bronzeTier.maxLTV).toBe(40);
      expect(bronzeTier.minScore).toBe(0);
      expect(bronzeTier.maxScore).toBe(59);
      expect(bronzeTier.requirements).toBeInstanceOf(Array);
      expect(bronzeTier.benefits).toBeInstanceOf(Array);
    });

    it('should have ascending LTV values', () => {
      const tiers = Object.values(CREDIBILITY_TIERS);
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i].maxLTV).toBeGreaterThan(tiers[i - 1].maxLTV);
      }
    });

    it('should have non-overlapping score ranges', () => {
      const tiers = Object.values(CREDIBILITY_TIERS);
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i].minScore).toBeGreaterThan(tiers[i - 1].maxScore);
      }
    });
  });

  describe('calculateCredibilityTier', () => {
    it('should calculate correct tier based on overall score', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 45 } };
      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.BRONZE);
    });

    it('should handle edge case scores', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 59 } };
      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.BRONZE);
    });

    it('should handle maximum score', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 100 } };
      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.DIAMOND);
    });

    it('should handle zero score', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 0 } };
      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.BRONZE);
    });
  });

  describe('calculateMaxLTV', () => {
    it('should calculate base LTV from tier', () => {
      const ltv = calculateMaxLTV(mockAgent, 1000000, 'normal');
      expect(ltv).toBeGreaterThanOrEqual(CREDIBILITY_TIERS[CredibilityTier.GOLD].maxLTV);
    });

    it('should apply collateral bonus for high collateral', () => {
      const ltv = calculateMaxLTV(mockAgent, 5000000, 'normal');
      expect(ltv).toBeGreaterThan(CREDIBILITY_TIERS[CredibilityTier.GOLD].maxLTV);
    });

    it('should apply market condition adjustments', () => {
      const normalLTV = calculateMaxLTV(mockAgent, 1000000, 'normal');
      const bearLTV = calculateMaxLTV(mockAgent, 1000000, 'bear');
      const bullLTV = calculateMaxLTV(mockAgent, 1000000, 'bull');

      expect(bearLTV).toBeLessThan(normalLTV);
      expect(bullLTV).toBeGreaterThan(normalLTV);
    });

    it('should apply verification bonus', () => {
      const agentWithVerification = {
        ...mockAgent,
        verification: VerificationStatus.PASSED,
        metadata: {
          ...mockAgent.metadata,
          verificationMethods: [
            {
              id: 'verif_1',
              type: VerificationType.CODE_AUDIT,
              status: VerificationStatus.PASSED,
              score: 95,
              lastVerified: new Date(),
              nextVerificationDue: new Date(Date.now() + 86400000 * 180),
              details: {}
            }
          ]
        }
      };

      const ltv = calculateMaxLTV(agentWithVerification, 1000000, 'normal');
      expect(ltv).toBeGreaterThan(CREDIBILITY_TIERS[CredibilityTier.GOLD].maxLTV);
    });

    it('should cap LTV at maximum allowed', () => {
      const ltv = calculateMaxLTV(mockAgent, 10000000, 'bull');
      expect(ltv).toBeLessThanOrEqual(85); // Maximum LTV should be capped
    });
  });

  describe('checkTierUpgradeEligibility', () => {
    it('should check if agent is eligible for upgrade', () => {
      const eligibility = checkTierUpgradeEligibility(mockAgent, 180, 25);
      expect(eligibility).toHaveProperty('eligible');
      expect(eligibility).toHaveProperty('currentTier');
      expect(eligibility).toHaveProperty('nextTier');
      expect(eligibility).toHaveProperty('requirements');
      expect(eligibility).toHaveProperty('missingRequirements');
    });

    it('should identify missing requirements', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 75 } };
      const eligibility = checkTierUpgradeEligibility(agent, 30, 5);
      
      if (eligibility.eligible) {
        expect(eligibility.missingRequirements).toHaveLength(0);
      } else {
        expect(eligibility.missingRequirements.length).toBeGreaterThan(0);
      }
    });

    it('should check time-based requirements', () => {
      const newAgent = {
        ...mockAgent,
        createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
        credibilityTier: CredibilityTier.BRONZE
      };
      
      const eligibility = checkTierUpgradeEligibility(newAgent, 30, 5);
      expect(eligibility.requirements).toContain('Score 60+');
    });

    it('should check score requirements', () => {
      const agent = { ...mockAgent, score: { ...mockAgent.score, overall: 65 } };
      const eligibility = checkTierUpgradeEligibility(agent, 90, 10);
      
      if (eligibility.nextTier === CredibilityTier.PLATINUM) {
        expect(eligibility.requirements).toContain('Score 80+');
      }
    });
  });

  describe('compareAgentTiers', () => {
    it('should compare tiers across multiple agents', () => {
      const agents = [
        { ...mockAgent, credibilityTier: CredibilityTier.BRONZE, score: { ...mockAgent.score, overall: 45 } },
        { ...mockAgent, id: 'agent-2', credibilityTier: CredibilityTier.GOLD, score: { ...mockAgent.score, overall: 75 } },
        { ...mockAgent, id: 'agent-3', credibilityTier: CredibilityTier.PLATINUM, score: { ...mockAgent.score, overall: 85 } }
      ];

      const comparison = compareAgentTiers(agents);
      
      expect(comparison).toHaveProperty('tierDistribution');
      expect(comparison).toHaveProperty('averageScores');
      expect(comparison).toHaveProperty('tierPerformance');
    });

    it('should calculate tier distribution correctly', () => {
      const agents = [
        { ...mockAgent, credibilityTier: CredibilityTier.BRONZE },
        { ...mockAgent, id: 'agent-2', credibilityTier: CredibilityTier.BRONZE },
        { ...mockAgent, id: 'agent-3', credibilityTier: CredibilityTier.GOLD }
      ];

      const comparison = compareAgentTiers(agents);
      expect(comparison.tierDistribution[CredibilityTier.BRONZE]).toBe(2);
      expect(comparison.tierDistribution[CredibilityTier.GOLD]).toBe(1);
    });

    it('should calculate average scores per tier', () => {
      const agents = [
        { ...mockAgent, id: 'agent-1', score: { ...mockAgent.score, overall: 50 }, credibilityTier: CredibilityTier.BRONZE },
        { ...mockAgent, id: 'agent-2', score: { ...mockAgent.score, overall: 70 }, credibilityTier: CredibilityTier.GOLD }
      ];

      const comparison = compareAgentTiers(agents);
      expect(comparison.averageScores[CredibilityTier.BRONZE]).toBe(50);
      expect(comparison.averageScores[CredibilityTier.GOLD]).toBe(70);
    });
  });

  describe('calculateTierBenefits', () => {
    it('should calculate tier benefits for an agent', () => {
      const benefits = calculateTierBenefits(mockAgent);
      
      expect(benefits).toHaveProperty('currentTier');
      expect(benefits).toHaveProperty('tierInfo');
      expect(benefits).toHaveProperty('maxLTV');
      expect(benefits).toHaveProperty('benefits');
      expect(benefits).toHaveProperty('upgradePath');
    });

    it('should include current tier information', () => {
      const benefits = calculateTierBenefits(mockAgent);
      expect(benefits.currentTier).toBe(CredibilityTier.GOLD);
      expect(benefits.tierInfo.name).toBe('Gold');
    });

    it('should calculate max LTV', () => {
      const benefits = calculateTierBenefits(mockAgent);
      expect(benefits.maxLTV).toBeGreaterThan(0);
      expect(benefits.maxLTV).toBeLessThanOrEqual(85);
    });

    it('should provide upgrade path information', () => {
      const benefits = calculateTierBenefits(mockAgent);
      expect(benefits.upgradePath).toHaveProperty('nextTier');
      expect(benefits.upgradePath).toHaveProperty('requirements');
      expect(benefits.upgradePath).toHaveProperty('estimatedTime');
    });
  });

  describe('Edge Cases', () => {
    it('should handle agents with no verification methods', () => {
      const agent = {
        ...mockAgent,
        metadata: {
          ...mockAgent.metadata,
          verificationMethods: []
        }
      };

      const ltv = calculateMaxLTV(agent, 1000000, 'normal');
      expect(ltv).toBeDefined();
      expect(ltv).toBeGreaterThan(0);
    });

    it('should handle agents with missing scores', () => {
      const agent = {
        ...mockAgent,
        score: undefined
      };

      // This should throw an error since calculateCredibilityTier expects a score
      expect(() => calculateCredibilityTier(agent.score as Record<string, unknown>)).toThrow();
    });

    it('should handle very high scores', () => {
      const agent = {
        ...mockAgent,
        score: { ...mockAgent.score, overall: 150 }
      };

      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.DIAMOND);
    });

    it('should handle negative scores', () => {
      const agent = {
        ...mockAgent,
        score: { ...mockAgent.score, overall: -10 }
      };

      const tier = calculateCredibilityTier(agent.score);
      expect(tier).toBe(CredibilityTier.BRONZE);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large numbers of agents efficiently', () => {
      const largeAgentList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAgent,
        id: `agent-${i}`,
        score: { ...mockAgent.score, overall: Math.floor(Math.random() * 100) }
      }));

      const startTime = performance.now();
      const comparison = compareAgentTiers(largeAgentList);
      const endTime = performance.now();

      expect(comparison).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle multiple LTV calculations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        calculateMaxLTV(mockAgent, 1000000 + i * 10000, 'normal');
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});
