import { Agent, AgentScore, CredibilityTier } from '@/types/agent';
import { LTVCalculation, LTVAdjustment, RiskMetrics } from '@/types/credit';

/**
 * Calculate overall agent score based on provenance, performance, and perception
 */
export function calculateAgentScore(
  provenance: number,
  performance: number,
  perception: number
): AgentScore {
  // Weighted scoring: provenance (40%), performance (40%), perception (20%)
  const overall = Math.round(
    provenance * 0.4 + performance * 0.4 + perception * 0.2
  );
  
  // Confidence based on data consistency and completeness
  const confidence = calculateConfidence(provenance, performance, perception);
  
  return {
    overall,
    provenance,
    performance,
    perception,
    confidence,
    lastUpdated: new Date()
  };
}

/**
 * Calculate confidence score based on score consistency
 */
function calculateConfidence(
  provenance: number,
  performance: number,
  perception: number
): number {
  const scores = [provenance, performance, perception];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower variance = higher confidence (inverse relationship)
  const confidenceFromVariance = Math.max(0, 100 - (standardDeviation * 2));
  
  // Factor in absolute score levels (higher scores = more confidence in general)
  const confidenceFromLevel = mean * 0.8;
  
  return Math.round((confidenceFromVariance + confidenceFromLevel) / 2);
}

/**
 * Determine credibility tier based on overall score
 */
export function determineCredibilityTier(score: number): CredibilityTier {
  if (score >= 90) return CredibilityTier.DIAMOND;
  if (score >= 80) return CredibilityTier.PLATINUM;
  if (score >= 70) return CredibilityTier.GOLD;
  if (score >= 60) return CredibilityTier.SILVER;
  return CredibilityTier.BRONZE;
}

/**
 * Calculate LTV (Loan-to-Value) ratio based on agent score and tier
 */
export function calculateLTV(agent: Agent): LTVCalculation {
  const baseLTV = getBaseLTVForTier(agent.credibilityTier);
  const adjustments: LTVAdjustment[] = [];
  
  // Score-based adjustment
  if (agent.score.overall > 85) {
    adjustments.push({
      factor: 'high_score',
      description: 'High overall score bonus',
      impact: 5,
      reason: `Score of ${agent.score.overall} exceeds 85`
    });
  }
  
  // Confidence adjustment
  if (agent.score.confidence > 80) {
    adjustments.push({
      factor: 'high_confidence',
      description: 'High confidence bonus',
      impact: 3,
      reason: `Confidence of ${agent.score.confidence}% exceeds 80%`
    });
  }
  
  // Performance consistency
  if (agent.score.performance > agent.score.overall + 10) {
    adjustments.push({
      factor: 'performance_premium',
      description: 'Performance exceeds overall score',
      impact: 2,
      reason: 'Strong performance track record'
    });
  }
  
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.impact, 0);
  const finalLTV = Math.min(baseLTV + totalAdjustment, 95); // Cap at 95%
  
  return {
    agentScore: agent.score.overall,
    tier: agent.credibilityTier,
    baseLTV,
    adjustments,
    finalLTV,
    confidence: agent.score.confidence
  };
}

/**
 * Get base LTV for credibility tier
 */
function getBaseLTVForTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 80;
    case CredibilityTier.PLATINUM: return 70;
    case CredibilityTier.GOLD: return 60;
    case CredibilityTier.SILVER: return 50;
    case CredibilityTier.BRONZE: return 40;
    default: return 30;
  }
}

/**
 * Calculate risk metrics for an agent
 */
export function calculateRiskMetrics(agent: Agent): RiskMetrics {
  const scoreDelta = Math.abs(agent.score.performance - agent.score.overall);
  
  return {
    volatility: Math.min(scoreDelta * 2, 100),
    liquidationRisk: Math.max(0, 100 - agent.score.overall),
    performanceVariance: scoreDelta,
    tierStability: agent.score.confidence,
    marketExposure: getMarketExposureByTier(agent.credibilityTier)
  };
}

/**
 * Get market exposure level by tier
 */
function getMarketExposureByTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 20;
    case CredibilityTier.PLATINUM: return 30;
    case CredibilityTier.GOLD: return 40;
    case CredibilityTier.SILVER: return 60;
    case CredibilityTier.BRONZE: return 80;
    default: return 100;
  }
}
