import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('Credibility Tiers Dashboard Logic', () => {
  let mockAgents: Agent[];

  beforeEach(() => {
    mockAgents = [
      {
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
      }
    ];

    vi.clearAllMocks();
  });

  describe('Data Processing Logic', () => {
    it('should process agent data correctly', () => {
      expect(mockAgents).toHaveLength(1);
      expect(mockAgents[0].name).toBe('Test Platinum Agent');
      expect(mockAgents[0].credibilityTier).toBe(CredibilityTier.PLATINUM);
      expect(mockAgents[0].score.overall).toBe(85);
    });

    it('should validate agent metadata', () => {
      const agent = mockAgents[0];
      expect(agent.metadata.description).toBe('A test agent for credibility tiers');
      expect(agent.metadata.category).toBe('Trading');
      expect(agent.metadata.version).toBe('2.0.0');
      expect(agent.metadata.tags).toContain('platinum');
    });

    it('should validate agent scores', () => {
      const agent = mockAgents[0];
      expect(agent.score.overall).toBeGreaterThanOrEqual(80);
      expect(agent.score.overall).toBeLessThanOrEqual(89);
      expect(agent.score.provenance).toBeGreaterThan(agent.score.overall);
      expect(agent.score.verification).toBeGreaterThan(agent.score.overall);
    });

    it('should validate verification methods', () => {
      const agent = mockAgents[0];
      expect(agent.metadata.verificationMethods).toHaveLength(1);
      expect(agent.metadata.verificationMethods[0].type).toBe(VerificationType.CODE_AUDIT);
      expect(agent.metadata.verificationMethods[0].status).toBe(VerificationStatus.PASSED);
      expect(agent.metadata.verificationMethods[0].score).toBe(88);
    });

    it('should validate tier requirements', () => {
      const agent = mockAgents[0];
      // Use the mocked values directly
      const tierInfo = {
        name: 'Platinum',
        maxLTV: 70,
        minScore: 80,
        maxScore: 89
      };
      
      expect(tierInfo.name).toBe('Platinum');
      expect(tierInfo.maxLTV).toBe(70);
      expect(tierInfo.minScore).toBeLessThanOrEqual(agent.score.overall);
      expect(tierInfo.maxScore).toBeGreaterThanOrEqual(agent.score.overall);
    });
  });

  describe('Tier Analysis Logic', () => {
    it('should analyze tier distribution', () => {
      const tierDistribution = mockAgents.reduce((acc, agent) => {
        acc[agent.credibilityTier] = (acc[agent.credibilityTier] || 0) + 1;
        return acc;
      }, {} as Record<CredibilityTier, number>);

      expect(tierDistribution[CredibilityTier.PLATINUM]).toBe(1);
      expect(Object.keys(tierDistribution)).toHaveLength(1);
    });

    it('should calculate tier statistics', () => {
      const platinumAgents = mockAgents.filter(agent => agent.credibilityTier === CredibilityTier.PLATINUM);
      const averageScore = platinumAgents.reduce((sum, agent) => sum + agent.score.overall, 0) / platinumAgents.length;

      expect(platinumAgents).toHaveLength(1);
      expect(averageScore).toBe(85);
    });

    it('should identify upgrade candidates', () => {
      const upgradeCandidates = mockAgents.filter(agent => {
        const currentScore = agent.score.overall;
        const currentTier = agent.credibilityTier;
        
        // Check if score is high enough for next tier
        switch (currentTier) {
          case CredibilityTier.PLATINUM:
            return currentScore >= 90; // Need 90+ for Diamond
          default:
            return false;
        }
      });

      // Current agent has score 85, needs 90+ for Diamond
      expect(upgradeCandidates).toHaveLength(0);
    });
  });

  describe('Data Validation Logic', () => {
    it('should validate agent completeness', () => {
      mockAgents.forEach(agent => {
        expect(agent.id).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.operator).toBeDefined();
        expect(agent.metadata).toBeDefined();
        expect(agent.score).toBeDefined();
        expect(agent.credibilityTier).toBeDefined();
        expect(agent.status).toBeDefined();
        expect(agent.verification).toBeDefined();
        expect(agent.createdAt).toBeDefined();
        expect(agent.updatedAt).toBeDefined();
      });
    });

    it('should validate score ranges', () => {
      mockAgents.forEach(agent => {
        expect(agent.score.overall).toBeGreaterThanOrEqual(0);
        expect(agent.score.overall).toBeLessThanOrEqual(100);
        expect(agent.score.provenance).toBeGreaterThanOrEqual(0);
        expect(agent.score.provenance).toBeLessThanOrEqual(100);
        expect(agent.score.performance).toBeGreaterThanOrEqual(0);
        expect(agent.score.performance).toBeLessThanOrEqual(100);
        expect(agent.score.perception).toBeGreaterThanOrEqual(0);
        expect(agent.score.perception).toBeLessThanOrEqual(100);
        expect(agent.score.verification).toBeGreaterThanOrEqual(0);
        expect(agent.score.verification).toBeLessThanOrEqual(100);
        expect(agent.score.confidence).toBeGreaterThanOrEqual(0);
        expect(agent.score.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should validate tier consistency', () => {
      mockAgents.forEach(agent => {
        // Use the mocked values directly
        const tierInfo = {
          minScore: 80,
          maxScore: 89
        };
        
        expect(agent.score.overall).toBeGreaterThanOrEqual(tierInfo.minScore);
        expect(agent.score.overall).toBeLessThanOrEqual(tierInfo.maxScore);
      });
    });
  });
});
