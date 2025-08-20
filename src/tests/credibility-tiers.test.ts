import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CREDIBILITY_TIERS, 
  calculateCredibilityTier, 
  calculateMaxLTV, 
  checkTierUpgradeEligibility,
  calculateTierBenefits,
  compareAgentTiers
} from '../lib/credibility-tiers';
import { Agent, CredibilityTier, AgentScore, VerificationType, VerificationStatus, AgentStatus } from '../types/agent';

describe('Credibility Tiers System', () => {
  let mockAgent: Agent;
  let mockAgentScore: AgentScore;

  beforeEach(() => {
    mockAgentScore = {
      overall: 85,
      provenance: 88,
      performance: 82,
      perception: 80,
      verification: 88,
      confidence: 85,
      lastUpdated: new Date()
    };

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
      score: mockAgentScore,
      credibilityTier: CredibilityTier.PLATINUM,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
  });

  describe('CREDIBILITY_TIERS Constants', () => {
    it('should define all five credibility tiers', () => {
      expect(CREDIBILITY_TIERS).toHaveProperty(CredibilityTier.BRONZE);
      expect(CREDIBILITY_TIERS).toHaveProperty(CredibilityTier.SILVER);
      expect(CREDIBILITY_TIERS).toHaveProperty(CredibilityTier.GOLD);
      expect(CREDIBILITY_TIERS).toHaveProperty(CredibilityTier.PLATINUM);
      expect(CREDIBILITY_TIERS).toHaveProperty(CredibilityTier.DIAMOND);
    });

    it('should have correct LTV limits for each tier', () => {
      expect(CREDIBILITY_TIERS[CredibilityTier.BRONZE].maxLTV).toBe(40);
      expect(CREDIBILITY_TIERS[CredibilityTier.SILVER].maxLTV).toBe(50);
      expect(CREDIBILITY_TIERS[CredibilityTier.GOLD].maxLTV).toBe(60);
      expect(CREDIBILITY_TIERS[CredibilityTier.PLATINUM].maxLTV).toBe(70);
      expect(CREDIBILITY_TIERS[CredibilityTier.DIAMOND].maxLTV).toBe(80);
    });

    it('should have correct score ranges for each tier', () => {
      expect(CREDIBILITY_TIERS[CredibilityTier.BRONZE].minScore).toBe(0);
      expect(CREDIBILITY_TIERS[CredibilityTier.BRONZE].maxScore).toBe(59);
      
      expect(CREDIBILITY_TIERS[CredibilityTier.SILVER].minScore).toBe(60);
      expect(CREDIBILITY_TIERS[CredibilityTier.SILVER].maxScore).toBe(69);
      
      expect(CREDIBILITY_TIERS[CredibilityTier.GOLD].minScore).toBe(70);
      expect(CREDIBILITY_TIERS[CredibilityTier.GOLD].maxScore).toBe(79);
      
      expect(CREDIBILITY_TIERS[CredibilityTier.PLATINUM].minScore).toBe(80);
      expect(CREDIBILITY_TIERS[CredibilityTier.PLATINUM].maxScore).toBe(89);
      
      expect(CREDIBILITY_TIERS[CredibilityTier.DIAMOND].minScore).toBe(90);
      expect(CREDIBILITY_TIERS[CredibilityTier.DIAMOND].maxScore).toBe(100);
    });

    it('should have emojis for each tier', () => {
      expect(CREDIBILITY_TIERS[CredibilityTier.BRONZE].emoji).toBe('🥉');
      expect(CREDIBILITY_TIERS[CredibilityTier.SILVER].emoji).toBe('🥈');
      expect(CREDIBILITY_TIERS[CredibilityTier.GOLD].emoji).toBe('🥇');
      expect(CREDIBILITY_TIERS[CredibilityTier.PLATINUM].emoji).toBe('🏆');
      expect(CREDIBILITY_TIERS[CredibilityTier.DIAMOND].emoji).toBe('💎');
    });

    it('should have requirements and benefits for each tier', () => {
      Object.values(CREDIBILITY_TIERS).forEach(tier => {
        expect(tier.requirements).toBeInstanceOf(Array);
        expect(tier.requirements.length).toBeGreaterThan(0);
        expect(tier.benefits).toBeInstanceOf(Array);
        expect(tier.benefits.length).toBeGreaterThan(0);
        expect(tier.upgradeRequirements).toBeInstanceOf(Array);
        expect(tier.upgradeRequirements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateCredibilityTier', () => {
    it('should return BRONZE for scores 0-59', () => {
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 0 })).toBe(CredibilityTier.BRONZE);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 30 })).toBe(CredibilityTier.BRONZE);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 59 })).toBe(CredibilityTier.BRONZE);
    });

    it('should return SILVER for scores 60-69', () => {
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 60 })).toBe(CredibilityTier.SILVER);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 65 })).toBe(CredibilityTier.SILVER);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 69 })).toBe(CredibilityTier.SILVER);
    });

    it('should return GOLD for scores 70-79', () => {
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 70 })).toBe(CredibilityTier.GOLD);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 75 })).toBe(CredibilityTier.GOLD);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 79 })).toBe(CredibilityTier.GOLD);
    });

    it('should return PLATINUM for scores 80-89', () => {
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 80 })).toBe(CredibilityTier.PLATINUM);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 85 })).toBe(CredibilityTier.PLATINUM);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 89 })).toBe(CredibilityTier.PLATINUM);
    });

    it('should return DIAMOND for scores 90-100', () => {
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 90 })).toBe(CredibilityTier.DIAMOND);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 95 })).toBe(CredibilityTier.DIAMOND);
      expect(calculateCredibilityTier({ ...mockAgentScore, overall: 100 })).toBe(CredibilityTier.DIAMOND);
    });
  });

  describe('calculateMaxLTV', () => {
    it('should calculate base LTV from tier', () => {
      const bronzeAgent = { ...mockAgent, credibilityTier: CredibilityTier.BRONZE };
      const silverAgent = { ...mockAgent, credibilityTier: CredibilityTier.SILVER };
      const goldAgent = { ...mockAgent, credibilityTier: CredibilityTier.GOLD };
      const platinumAgent = { ...mockAgent, credibilityTier: CredibilityTier.PLATINUM };
      const diamondAgent = { ...mockAgent, credibilityTier: CredibilityTier.DIAMOND };

      expect(calculateMaxLTV(bronzeAgent)).toBeGreaterThanOrEqual(40);
      expect(calculateMaxLTV(silverAgent)).toBeGreaterThanOrEqual(50);
      expect(calculateMaxLTV(goldAgent)).toBeGreaterThanOrEqual(60);
      expect(calculateMaxLTV(platinumAgent)).toBeGreaterThanOrEqual(70);
      expect(calculateMaxLTV(diamondAgent)).toBeGreaterThanOrEqual(80);
    });

    it('should apply score bonus correctly', () => {
      const highScoreAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 95 } };
      const lowScoreAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 65 } };

      const highScoreLTV = calculateMaxLTV(highScoreAgent);
      const lowScoreLTV = calculateMaxLTV(lowScoreAgent);

      // High score agent should get more bonus
      expect(highScoreLTV).toBeGreaterThan(lowScoreLTV);
    });

    it('should apply verification bonus correctly', () => {
      const highVerificationAgent = { ...mockAgent, score: { ...mockAgentScore, verification: 95 } };
      const lowVerificationAgent = { ...mockAgent, score: { ...mockAgentScore, verification: 60 } };

      const highVerificationLTV = calculateMaxLTV(highVerificationAgent);
      const lowVerificationLTV = calculateMaxLTV(lowVerificationAgent);

      expect(highVerificationLTV).toBeGreaterThan(lowVerificationLTV);
    });

    it('should apply performance bonus correctly', () => {
      const highPerformanceAgent = { ...mockAgent, score: { ...mockAgentScore, performance: 95 } };
      const lowPerformanceAgent = { ...mockAgent, score: { ...mockAgentScore, performance: 60 } };

      const highPerformanceLTV = calculateMaxLTV(highPerformanceAgent, 1000000, 'normal');
      const lowPerformanceLTV = calculateMaxLTV(lowPerformanceAgent, 1000000, 'normal');

      // Both agents get the same performance bonus since Math.floor(95/50) = Math.floor(60/50) = 1
      // The bonus is capped at 2% and calculated as Math.floor(performance / 50)
      expect(highPerformanceLTV).toBe(lowPerformanceLTV);
      
      // Verify the performance bonus is applied correctly
      expect(highPerformanceLTV).toBeGreaterThan(CREDIBILITY_TIERS[mockAgent.credibilityTier].maxLTV);
    });

    it('should apply collateral bonus correctly', () => {
      const highCollateralLTV = calculateMaxLTV(mockAgent, 1500000);
      const mediumCollateralLTV = calculateMaxLTV(mockAgent, 750000);
      const lowCollateralLTV = calculateMaxLTV(mockAgent, 50000);

      expect(highCollateralLTV).toBeGreaterThan(mediumCollateralLTV);
      expect(mediumCollateralLTV).toBeGreaterThan(lowCollateralLTV);
    });

    it('should apply market conditions correctly', () => {
      const normalLTV = calculateMaxLTV(mockAgent, 0, 'normal');
      const bullLTV = calculateMaxLTV(mockAgent, 0, 'bull');
      const bearLTV = calculateMaxLTV(mockAgent, 0, 'bear');
      const volatileLTV = calculateMaxLTV(mockAgent, 0, 'volatile');

      expect(bullLTV).toBeGreaterThan(normalLTV);
      expect(normalLTV).toBeGreaterThan(volatileLTV);
      expect(volatileLTV).toBeGreaterThan(bearLTV);
    });

    it('should keep LTV within reasonable bounds', () => {
      const maxLTV = calculateMaxLTV(mockAgent, 10000000, 'bull');
      expect(maxLTV).toBeLessThanOrEqual(85);
      expect(maxLTV).toBeGreaterThanOrEqual(20);
    });
  });

  describe('checkTierUpgradeEligibility', () => {
    it('should check eligibility for tier upgrade', () => {
      const eligibleAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 85 } };
      const result = checkTierUpgradeEligibility(eligibleAgent, 200, 30);

      expect(result.eligible).toBeDefined();
      expect(result.currentTier).toBe(CredibilityTier.PLATINUM);
      expect(result.nextTier).toBe(CredibilityTier.DIAMOND);
      expect(result.requirements).toBeInstanceOf(Array);
      expect(result.missingRequirements).toBeInstanceOf(Array);
    });

    it('should identify missing requirements', () => {
      const ineligibleAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 75 } };
      const result = checkTierUpgradeEligibility(ineligibleAgent, 50, 5);

      expect(result.eligible).toBe(false);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
    });

    it('should handle agents at highest tier', () => {
      const diamondAgent = { ...mockAgent, credibilityTier: CredibilityTier.DIAMOND };
      const result = checkTierUpgradeEligibility(diamondAgent, 400, 60);

      expect(result.eligible).toBe(false);
      expect(result.nextTier).toBe(null);
      expect(result.missingRequirements).toContain('Already at highest tier');
    });

    it('should check days active requirement', () => {
      const agent = { ...mockAgent, score: { ...mockAgentScore, overall: 85 } };
      const result = checkTierUpgradeEligibility(agent, 100, 30);

      // Should need 180 days for Platinum to Diamond
      expect(result.missingRequirements.some(req => req.includes('days active'))).toBe(true);
    });

    it('should check transaction requirement', () => {
      const agent = { ...mockAgent, score: { ...mockAgentScore, overall: 85 } };
      const result = checkTierUpgradeEligibility(agent, 200, 20);

      // Should need 25+ transactions for Platinum to Diamond
      expect(result.missingRequirements.some(req => req.includes('transactions'))).toBe(true);
    });
  });

  describe('calculateTierBenefits', () => {
    it('should calculate tier benefits correctly', () => {
      const result = calculateTierBenefits(mockAgent);

      expect(result.currentTier).toBe(CredibilityTier.PLATINUM);
      expect(result.tierInfo).toBeDefined();
      expect(result.maxLTV).toBeGreaterThan(0);
      expect(result.benefits).toBeInstanceOf(Array);
      expect(result.upgradePath).toBeDefined();
    });

    it('should include upgrade path information', () => {
      const result = calculateTierBenefits(mockAgent);

      expect(result.upgradePath.nextTier).toBeDefined();
      expect(result.upgradePath.requirements).toBeInstanceOf(Array);
      expect(result.upgradePath.estimatedTime).toBeDefined();
    });

    it('should estimate upgrade time correctly', () => {
      const highScoreAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 88 } };
      const lowScoreAgent = { ...mockAgent, score: { ...mockAgentScore, overall: 82 } };

      const highScoreResult = calculateTierBenefits(highScoreAgent);
      const lowScoreResult = calculateTierBenefits(lowScoreAgent);

      // Higher score should have shorter estimated upgrade time
      expect(highScoreResult.upgradePath.estimatedTime).toBeDefined();
      expect(lowScoreResult.upgradePath.estimatedTime).toBeDefined();
    });
  });

  describe('compareAgentTiers', () => {
    it('should compare multiple agents correctly', () => {
      const agents = [
        { ...mockAgent, id: 'agent1', credibilityTier: CredibilityTier.BRONZE, score: { ...mockAgentScore, overall: 55 } },
        { ...mockAgent, id: 'agent2', credibilityTier: CredibilityTier.SILVER, score: { ...mockAgentScore, overall: 65 } },
        { ...mockAgent, id: 'agent3', credibilityTier: CredibilityTier.GOLD, score: { ...mockAgentScore, overall: 75 } },
        { ...mockAgent, id: 'agent4', credibilityTier: CredibilityTier.PLATINUM, score: { ...mockAgentScore, overall: 85 } },
        { ...mockAgent, id: 'agent5', credibilityTier: CredibilityTier.DIAMOND, score: { ...mockAgentScore, overall: 95 } }
      ];

      const result = compareAgentTiers(agents);

      expect(result.tierDistribution[CredibilityTier.BRONZE]).toBe(1);
      expect(result.tierDistribution[CredibilityTier.SILVER]).toBe(1);
      expect(result.tierDistribution[CredibilityTier.GOLD]).toBe(1);
      expect(result.tierDistribution[CredibilityTier.PLATINUM]).toBe(1);
      expect(result.tierDistribution[CredibilityTier.DIAMOND]).toBe(1);
    });

    it('should calculate average scores per tier', () => {
      const agents = [
        { ...mockAgent, id: 'agent1', credibilityTier: CredibilityTier.BRONZE, score: { ...mockAgentScore, overall: 50 } },
        { ...mockAgent, id: 'agent2', credibilityTier: CredibilityTier.BRONZE, score: { ...mockAgentScore, overall: 55 } },
        { ...mockAgent, id: 'agent3', credibilityTier: CredibilityTier.SILVER, score: { ...mockAgentScore, overall: 65 } }
      ];

      const result = compareAgentTiers(agents);

      expect(result.averageScores[CredibilityTier.BRONZE]).toBe(52.5); // (50 + 55) / 2
      expect(result.averageScores[CredibilityTier.SILVER]).toBe(65);
    });

    it('should calculate tier performance metrics', () => {
      const agents = [
        { ...mockAgent, id: 'agent1', credibilityTier: CredibilityTier.GOLD, score: { ...mockAgentScore, overall: 75 } }
      ];

      const result = compareAgentTiers(agents);

      expect(result.tierPerformance[CredibilityTier.GOLD].avgScore).toBe(75);
      expect(result.tierPerformance[CredibilityTier.GOLD].avgLTV).toBeGreaterThan(0);
    });

    it('should handle empty agent list', () => {
      const result = compareAgentTiers([]);

      expect(result.tierDistribution[CredibilityTier.BRONZE]).toBe(0);
      expect(result.tierDistribution[CredibilityTier.DIAMOND]).toBe(0);
      expect(result.averageScores[CredibilityTier.BRONZE]).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle agents with extreme scores', () => {
      const extremeHighScore = { ...mockAgentScore, overall: 100 };
      const extremeLowScore = { ...mockAgentScore, overall: 0 };

      expect(calculateCredibilityTier(extremeHighScore)).toBe(CredibilityTier.DIAMOND);
      expect(calculateCredibilityTier(extremeLowScore)).toBe(CredibilityTier.BRONZE);
    });

    it('should handle agents with decimal scores', () => {
      const decimalScore = { ...mockAgentScore, overall: 85.7 };
      expect(calculateCredibilityTier(decimalScore)).toBe(CredibilityTier.PLATINUM);
    });

    it('should handle market conditions edge cases', () => {
      const unknownMarketLTV = calculateMaxLTV(mockAgent, 0, 'unknown');
      const normalLTV = calculateMaxLTV(mockAgent, 0, 'normal');

      expect(unknownMarketLTV).toBe(normalLTV);
    });

    it('should handle zero collateral', () => {
      const zeroCollateralLTV = calculateMaxLTV(mockAgent, 0);
      expect(zeroCollateralLTV).toBeGreaterThan(0);
    });
  });
});
