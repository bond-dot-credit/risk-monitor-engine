import { Agent, AgentScore, CredibilityTier } from '@/types/agent';
import { LTVCalculation, LTVAdjustment, RiskMetrics } from '@/types/credit';
import { ReputationEvent, ReputationSummary, ReputationSummaryBreakdown } from '@/types/reputation';

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

/**
 * Process reputation events and build reputation summary
 */
export function buildReputationSummary(
  agentId: string,
  events: ReputationEvent[]
): ReputationSummary {
  if (events.length === 0) {
    return {
      agentId,
      lastUpdated: new Date(),
      totalEvents: 0,
      positiveEvents: 0,
      negativeEvents: 0,
      breakdown: {
        performance: 50,
        credit: 50,
        risk: 50,
        compliance: 50,
        overall: 50
      },
      recentEvents: [],
      trend: 'stable'
    };
  }

  const positiveEvents = events.filter(e => e.impact > 0);
  const negativeEvents = events.filter(e => e.impact < 0);
  
  // Calculate breakdown scores based on event types
  const breakdown = calculateReputationBreakdown(events);
  
  // Determine trend based on recent events
  const recentEvents = events.slice(0, 10); // Last 10 events
  const trend = determineReputationTrend(recentEvents);
  
  return {
    agentId,
    lastUpdated: new Date(),
    totalEvents: events.length,
    positiveEvents: positiveEvents.length,
    negativeEvents: negativeEvents.length,
    breakdown,
    recentEvents,
    trend
  };
}

/**
 * Calculate reputation breakdown scores
 */
function calculateReputationBreakdown(events: ReputationEvent[]): ReputationSummaryBreakdown {
  const scores = {
    performance: 0,
    credit: 0,
    risk: 0,
    compliance: 0
  };
  
  let totalImpact = 0;
  
  events.forEach(event => {
    const impact = event.impact;
    totalImpact += impact;
    
    // Categorize events and accumulate scores
    switch (event.type) {
      case 'performance_improvement':
      case 'performance_decline':
        scores.performance += impact;
        break;
      case 'credit_line_increase':
      case 'credit_line_decrease':
      case 'apr_improvement':
      case 'apr_decline':
      case 'ltv_optimization':
        scores.credit += impact;
        break;
      case 'risk_management':
        scores.risk += impact;
        break;
      case 'compliance_violation':
      case 'compliance_improvement':
        scores.compliance += impact;
        break;
      case 'aum_change':
        // AUM changes affect multiple categories
        scores.performance += impact * 0.5;
        scores.risk += impact * 0.5;
        break;
    }
  });
  
  // Normalize scores to 0-100 range
  const normalizeScore = (score: number) => {
    const normalized = 50 + (score / Math.max(1, Math.abs(totalImpact))) * 50;
    return Math.max(0, Math.min(100, normalized));
  };
  
  return {
    performance: normalizeScore(scores.performance),
    credit: normalizeScore(scores.credit),
    risk: normalizeScore(scores.risk),
    compliance: normalizeScore(scores.compliance),
    overall: normalizeScore(totalImpact)
  };
}

/**
 * Determine reputation trend based on recent events
 */
function determineReputationTrend(events: ReputationEvent[]): 'improving' | 'stable' | 'declining' {
  if (events.length === 0) return 'stable';
  
  const recentImpact = events
    .slice(0, 5) // Last 5 events
    .reduce((sum, event) => sum + event.impact, 0);
  
  if (recentImpact > 10) return 'improving';
  if (recentImpact < -10) return 'declining';
  return 'stable';
}
