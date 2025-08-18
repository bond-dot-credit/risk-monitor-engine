import assert from 'node:assert';
import test from 'node:test';
import { calculateAgentScore, determineCredibilityTier, calculateRiskMetrics } from '../lib/scoring';
import { Agent, AgentStatus, CredibilityTier } from '../types/agent';

test('calculates weighted overall score and confidence', () => {
  const score = calculateAgentScore(90, 80, 70);
  assert.equal(score.overall, 82);
  assert.ok(score.confidence > 0);
  assert.ok(score.lastUpdated instanceof Date);
});

test('determines credibility tiers correctly', () => {
  assert.equal(determineCredibilityTier(95), CredibilityTier.DIAMOND);
  assert.equal(determineCredibilityTier(85), CredibilityTier.PLATINUM);
  assert.equal(determineCredibilityTier(75), CredibilityTier.GOLD);
  assert.equal(determineCredibilityTier(65), CredibilityTier.SILVER);
  assert.equal(determineCredibilityTier(55), CredibilityTier.BRONZE);
});

test('calculates risk metrics from agent scores', () => {
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
  assert.ok(risk.volatility >= 0);
  assert.equal(risk.liquidationRisk, 20);
  assert.ok(risk.marketExposure > 0);
});


