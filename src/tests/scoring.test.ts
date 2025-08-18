import { describe, it, expect } from 'vitest';
import { calculateAgentScore, determineCredibilityTier, calculateRiskMetrics } from '@/lib/scoring';
import { Agent, AgentStatus, CredibilityTier } from '@/types/agent';

describe('scoring', () => {
  it('calculates weighted overall score and confidence', () => {
    const score = calculateAgentScore(90, 80, 70);
    expect(score.overall).toBe(82);
    expect(score.confidence).toBeGreaterThan(0);
    expect(score.lastUpdated).toBeInstanceOf(Date);
  });

  it('determines credibility tiers correctly', () => {
    expect(determineCredibilityTier(95)).toBe(CredibilityTier.DIAMOND);
    expect(determineCredibilityTier(85)).toBe(CredibilityTier.PLATINUM);
    expect(determineCredibilityTier(75)).toBe(CredibilityTier.GOLD);
    expect(determineCredibilityTier(65)).toBe(CredibilityTier.SILVER);
    expect(determineCredibilityTier(55)).toBe(CredibilityTier.BRONZE);
  });

  it('calculates risk metrics from agent scores', () => {
    const agent: Agent = {
      id: 't1',
      name: 'Test',
      operator: '0x0',
      metadata: {
        description: 'x',
        category: 'Test',
        version: '0',
        tags: [],
        provenance: { sourceCode: '', verificationHash: '', deploymentChain: 'local' }
      },
      score: {
        overall: 80,
        provenance: 85,
        performance: 70,
        perception: 75,
        confidence: 90,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const risk = calculateRiskMetrics(agent);
    expect(risk.volatility).toBeGreaterThanOrEqual(0);
    expect(risk.liquidationRisk).toBe(20);
    expect(risk.marketExposure).toBeGreaterThan(0);
  });
});
