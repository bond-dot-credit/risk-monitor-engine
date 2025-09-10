import { describe, it, expect } from 'vitest';
import { calculateAgentScore, determineCredibilityTier, calculateLTV, calculateRiskMetrics } from '../lib/scoring';
import { CredibilityTier, Agent, AgentStatus, VerificationStatus } from '../types/agent';

describe('scoring', () => {
  it('calculates weighted overall score and confidence', () => {
    const score = calculateAgentScore(90, 80, 70, 85);
    expect(score.overall).toBe(82); // (90*0.35 + 80*0.30 + 70*0.20 + 85*0.15) = 31.5 + 24 + 14 + 12.75 = 82.25 ≈ 82
    expect(score.confidence).toBeGreaterThan(0); // Confidence is calculated based on data quality, consistency, verification coverage, and stability
    expect(score.confidence).toBeLessThanOrEqual(100);
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
      id: 'test',
      name: 'Test Agent',
      operator: '0x123...',
      metadata: {
        description: 'Test agent',
        category: 'Test',
        version: '1.0.0',
        tags: ['test'],
        provenance: {
          sourceCode: 'https://test.com',
          verificationHash: '0x123...',
          deploymentChain: 'Testnet',
          lastAudit: new Date()
        },
        verificationMethods: []
      },
      score: {
        overall: 80,
        provenance: 85,
        performance: 75,
        perception: 80,
        confidence: 82,
        verification: 0,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const risk = calculateRiskMetrics(agent);
    expect(risk.ltv.current).toBeGreaterThanOrEqual(0);
    expect(risk.ltv.maximum).toBeGreaterThan(0);
    expect(risk.creditLine.total).toBeGreaterThan(0);
    expect(risk.assetManagement.aum).toBeGreaterThan(0);
    expect(risk.performanceVariance).toBeGreaterThanOrEqual(0);
    expect(risk.tierStability).toBeGreaterThan(0);
    expect(risk.marketExposure).toBeGreaterThan(0);
  });
});
