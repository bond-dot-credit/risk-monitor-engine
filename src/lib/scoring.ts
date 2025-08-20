import { Agent, AgentScore, CredibilityTier, VerificationType, VerificationStatus } from '@/types/agent';
import { LTVCalculation, LTVAdjustment, RiskMetrics } from '@/types/credit';
import { ReputationEvent, ReputationSummary, ReputationSummaryBreakdown } from '@/types/reputation';
import { Collateral } from '@/types/credit';

export function calculateAgentScore(
  provenance: number,
  performance: number,
  perception: number,
  verification: number = 0
): AgentScore {
  const overall = Math.round((provenance * 0.3) + (performance * 0.3) + (perception * 0.2) + (verification * 0.2));
  const confidence = Math.round((provenance + performance + perception + verification) / 4);
  
  return {
    overall: Math.max(0, Math.min(100, overall)),
    provenance: Math.max(0, Math.min(100, provenance)),
    performance: Math.max(0, Math.min(100, performance)),
    perception: Math.max(0, Math.min(100, perception)),
    verification: Math.max(0, Math.min(100, verification)),
    confidence: Math.max(0, Math.min(100, confidence)),
    lastUpdated: new Date()
  };
}

export function determineCredibilityTier(score: number): CredibilityTier {
  if (score >= 90) return CredibilityTier.DIAMOND;
  if (score >= 80) return CredibilityTier.PLATINUM;
  if (score >= 70) return CredibilityTier.GOLD;
  if (score >= 60) return CredibilityTier.SILVER;
  return CredibilityTier.BRONZE;
}

export function calculateVerificationScore(verificationMethods: { type: VerificationType; status: VerificationStatus; score: number }[]): number {
  if (!verificationMethods || verificationMethods.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let totalWeight = 0;

  verificationMethods.forEach(method => {
    let weight = 1;
    let score = method.score || 0;

    switch (method.type) {
      case VerificationType.CODE_AUDIT:
        weight = 3;
        break;
      case VerificationType.SECURITY_ASSESSMENT:
        weight = 2.5;
        break;
      case VerificationType.PENETRATION_TEST:
        weight = 2.5;
        break;
      case VerificationType.COMPLIANCE_CHECK:
        weight = 2;
        break;
      case VerificationType.PERFORMANCE_BENCHMARK:
        weight = 1.5;
        break;
      case VerificationType.ON_CHAIN_ANALYSIS:
        weight = 1.5;
        break;
      case VerificationType.REPUTATION_VERIFICATION:
        weight = 1;
        break;
      case VerificationType.SOCIAL_PROOF:
        weight = 0.5;
        break;
    }

    if (method.status === VerificationStatus.PASSED) {
      score = Math.min(100, score + 10);
    } else if (method.status === VerificationStatus.FAILED) {
      score = Math.max(0, score - 20);
    } else if (method.status === VerificationStatus.EXPIRED) {
      score = Math.max(0, score - 15);
    }

    totalScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

export function calculateLTV(
  baseLTV: number,
  agentScore: AgentScore,
  adjustments: LTVAdjustment[] = [],
  collateral?: Collateral[],
  marketConditions?: { volatility: number; trend: 'bull' | 'bear' | 'neutral' }
): LTVCalculation {
  let finalLTV = baseLTV;
  let confidence = 0.8;
  let riskScore = 0;
  
  adjustments.forEach(adjustment => {
    switch (adjustment.type) {
      case 'score_bonus':
        if (agentScore.overall >= 90) {
          finalLTV += 5;
          confidence += 0.1;
        } else if (agentScore.overall >= 80) {
          finalLTV += 3;
          confidence += 0.05;
        } else if (agentScore.overall >= 70) {
          finalLTV += 1;
        }
        break;
      case 'confidence_bonus':
        if (agentScore.confidence >= 90) {
          finalLTV += 2;
          confidence += 0.08;
        }
        break;
      case 'performance_bonus':
        if (agentScore.performance >= 85) {
          finalLTV += 2;
          confidence += 0.06;
        }
        break;
      case 'provenance_bonus':
        if (agentScore.provenance >= 90) {
          finalLTV += 1;
          confidence += 0.04;
        }
        break;
      case 'verification_bonus':
        if (agentScore.verification >= 85) {
          finalLTV += 3;
          confidence += 0.07;
        } else if (agentScore.verification >= 70) {
          finalLTV += 1;
          confidence += 0.03;
        }
        break;
      case 'collateral_bonus':
        if (collateral && collateral.length > 0) {
          const totalValue = collateral.reduce((sum, col) => sum + col.value, 0);
          const avgLTVRatio = collateral.reduce((sum, col) => sum + col.ltvRatio, 0) / collateral.length;
          
          if (totalValue > 1000000) {
            finalLTV += 3;
            confidence += 0.05;
          } else if (totalValue > 500000) {
            finalLTV += 2;
            confidence += 0.03;
          }
          
          if (avgLTVRatio > 80) {
            finalLTV += 1;
            confidence += 0.02;
          }
        }
        break;
      case 'market_bonus':
        if (marketConditions) {
          if (marketConditions.trend === 'bull' && marketConditions.volatility < 30) {
            finalLTV += 2;
            confidence += 0.03;
          } else if (marketConditions.trend === 'bear' || marketConditions.volatility > 50) {
            finalLTV -= 3;
            confidence -= 0.1;
            riskScore += 20;
          }
        }
        break;
    }
  });
  
  confidence = Math.min(1, Math.max(0.1, confidence));
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  return {
    base: baseLTV,
    adjustments: adjustments,
    final: Math.min(95, Math.max(0, finalLTV)),
    maxAllowed: 95,
    confidence: confidence,
    riskScore: riskScore
  };
}

export function calculateRiskMetrics(agent: Agent): RiskMetrics {
  const baseLTV = getBaseLTVForTier(agent.credibilityTier);
  const ltvCalculation = calculateLTV(baseLTV, agent.score);
  
  return {
    ltv: {
      current: Math.round(ltvCalculation.final * 0.8),
      maximum: ltvCalculation.final,
      utilization: Math.round((ltvCalculation.final * 0.8 / ltvCalculation.final) * 100)
    },
    creditLine: {
      total: 1000000,
      used: 800000,
      available: 200000,
      apr: 8.5
    },
    assetManagement: {
      aum: 2500000,
      diversityScore: 85,
      liquidationRisk: 35
    },
    performanceVariance: 12.5,
    tierStability: 92,
    marketExposure: 45
  };
}

function getBaseLTVForTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 80;
    case CredibilityTier.PLATINUM: return 70;
    case CredibilityTier.GOLD: return 60;
    case CredibilityTier.SILVER: return 50;
    case CredibilityTier.BRONZE: return 40;
    default: return 100;
  }
}

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
  
  const breakdown = calculateReputationBreakdown(events);
  const recentEvents = events.slice(0, 10);
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
        scores.performance += impact * 0.5;
        scores.risk += impact * 0.5;
        break;
    }
  });
  
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

function determineReputationTrend(events: ReputationEvent[]): 'improving' | 'stable' | 'declining' {
  if (events.length === 0) return 'stable';
  
  const recentImpact = events
    .slice(0, 5)
    .reduce((sum, event) => sum + event.impact, 0);
  
  if (recentImpact > 10) return 'improving';
  if (recentImpact < -10) return 'declining';
  return 'stable';
}
