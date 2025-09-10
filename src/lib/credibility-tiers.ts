import { Agent, CredibilityTier, AgentScore } from '@/types/agent';

// Credibility Tier Definitions with LTV Limits
export const CREDIBILITY_TIERS = {
  [CredibilityTier.BRONZE]: {
    name: 'Bronze',
    emoji: '🥉',
    maxLTV: 40,
    minScore: 0,
    maxScore: 59,
    description: 'Basic tier for new agents',
    requirements: ['New agent registration', 'Basic verification'],
    benefits: ['Access to basic lending', 'Standard rates'],
    upgradeRequirements: ['Score 60+', '30 days active', '2+ successful transactions']
  },
  [CredibilityTier.SILVER]: {
    name: 'Silver',
    emoji: '🥈',
    maxLTV: 50,
    minScore: 60,
    maxScore: 69,
    description: 'Established agents with proven track record',
    requirements: ['Score 60+', '30 days active', '2+ successful transactions'],
    benefits: ['Higher LTV limits', 'Better rates', 'Priority support'],
    upgradeRequirements: ['Score 70+', '90 days active', '10+ successful transactions', 'No critical alerts']
  },
  [CredibilityTier.GOLD]: {
    name: 'Gold',
    emoji: '🥇',
    maxLTV: 60,
    minScore: 70,
    maxScore: 79,
    description: 'High-performing agents with strong reputation',
    requirements: ['Score 70+', '90 days active', '10+ successful transactions', 'No critical alerts'],
    benefits: ['Premium LTV limits', 'Best rates', 'VIP support', 'Early access to new features'],
    upgradeRequirements: ['Score 80+', '180 days active', '25+ successful transactions', 'No alerts in 30 days']
  },
  [CredibilityTier.PLATINUM]: {
    name: 'Platinum',
    emoji: '🏆',
    maxLTV: 70,
    minScore: 80,
    maxScore: 89,
    description: 'Elite agents with exceptional scores',
    requirements: ['Score 80+', '180 days active', '25+ successful transactions', 'No alerts in 30 days'],
    benefits: ['Elite LTV limits', 'Premium rates', 'Dedicated support', 'Exclusive features', 'Governance rights'],
    upgradeRequirements: ['Score 90+', '365 days active', '50+ successful transactions', 'Perfect compliance record']
  },
  [CredibilityTier.DIAMOND]: {
    name: 'Diamond',
    emoji: '💎',
    maxLTV: 80,
    minScore: 90,
    maxScore: 100,
    description: 'Top-tier agents with maximum trust',
    requirements: ['Score 90+', '365 days active', '50+ successful transactions', 'Perfect compliance record'],
    benefits: ['Maximum LTV limits', 'Elite rates', '24/7 dedicated support', 'All features access', 'Governance voting', 'Revenue sharing'],
    upgradeRequirements: ['Maintain score 90+', 'Continue excellent performance']
  }
};

// Tier calculation based on agent scores
export function calculateCredibilityTier(agentScore: AgentScore): CredibilityTier {
  const overallScore = agentScore.overall;
  
  if (overallScore >= 90) return CredibilityTier.DIAMOND;
  if (overallScore >= 80) return CredibilityTier.PLATINUM;
  if (overallScore >= 70) return CredibilityTier.GOLD;
  if (overallScore >= 60) return CredibilityTier.SILVER;
  return CredibilityTier.BRONZE;
}

// LTV calculation based on tier and additional factors
export function calculateMaxLTV(agent: Agent, collateral: number = 0, marketConditions: string = 'normal'): number {
  const tier = agent.credibilityTier;
  const baseLTV = CREDIBILITY_TIERS[tier].maxLTV;
  
  let adjustedLTV = baseLTV;
  
  // Score bonus (up to +5%)
  const scoreBonus = Math.min(5, Math.floor(agent.score.overall / 20));
  adjustedLTV += scoreBonus;
  
  // Verification bonus (up to +3%)
  const verificationBonus = Math.min(3, Math.floor(agent.score.verification / 33));
  adjustedLTV += verificationBonus;
  
  // Performance bonus (up to +2%)
  const performanceBonus = Math.min(2, Math.floor(agent.score.performance / 50));
  adjustedLTV += performanceBonus;
  
  // Collateral quality bonus (up to +3%)
  if (collateral > 1000000) {
    adjustedLTV += 3;
  } else if (collateral > 500000) {
    adjustedLTV += 2;
  } else if (collateral > 100000) {
    adjustedLTV += 1;
  }
  
  // Market conditions adjustment
  switch (marketConditions) {
    case 'bull':
      adjustedLTV = Math.min(adjustedLTV + 2, 85);
      break;
    case 'bear':
      adjustedLTV = Math.max(adjustedLTV - 3, 20);
      break;
    case 'volatile':
      adjustedLTV = Math.max(adjustedLTV - 2, 25);
      break;
    default: // normal
      break;
  }
  
  // Ensure LTV stays within reasonable bounds
  return Math.max(20, Math.min(85, adjustedLTV));
}

// Tier upgrade eligibility check
export function checkTierUpgradeEligibility(agent: Agent, daysActive: number, successfulTransactions: number): {
  eligible: boolean;
  currentTier: CredibilityTier;
  nextTier: CredibilityTier | null;
  requirements: string[];
  missingRequirements: string[];
} {
  const currentTier = agent.credibilityTier;
  const currentTierInfo = CREDIBILITY_TIERS[currentTier];
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return {
      eligible: false,
      currentTier,
      nextTier: null,
      requirements: [],
      missingRequirements: ['Already at highest tier']
    };
  }
  
  const nextTierInfo = CREDIBILITY_TIERS[nextTier];
  const requirements = nextTierInfo.requirements;
  const missingRequirements: string[] = [];
  
  // Check score requirement
  if (agent.score.overall < nextTierInfo.minScore) {
    missingRequirements.push(`Score ${agent.score.overall}/${nextTierInfo.minScore}+ required`);
  }
  
  // Check days active requirement
  if (daysActive < getDaysRequired(nextTier)) {
    missingRequirements.push(`${daysActive}/${getDaysRequired(nextTier)} days active required`);
  }
  
  // Check successful transactions requirement
  if (successfulTransactions < getTransactionsRequired(nextTier)) {
    missingRequirements.push(`${successfulTransactions}/${getTransactionsRequired(nextTier)}+ successful transactions required`);
  }
  
  // Check for critical alerts (if required)
  if (nextTier === CredibilityTier.GOLD || nextTier === CredibilityTier.PLATINUM) {
    // This would need to be implemented based on actual alert system
    // For now, we'll assume no critical alerts
  }
  
  return {
    eligible: missingRequirements.length === 0,
    currentTier,
    nextTier,
    requirements,
    missingRequirements
  };
}

// Helper functions
function getNextTier(currentTier: CredibilityTier): CredibilityTier | null {
  const tierOrder = [
    CredibilityTier.BRONZE,
    CredibilityTier.SILVER,
    CredibilityTier.GOLD,
    CredibilityTier.PLATINUM,
    CredibilityTier.DIAMOND
  ];
  
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
}

function getDaysRequired(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.SILVER: return 30;
    case CredibilityTier.GOLD: return 90;
    case CredibilityTier.PLATINUM: return 180;
    case CredibilityTier.DIAMOND: return 365;
    default: return 0;
  }
}

function getTransactionsRequired(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.SILVER: return 2;
    case CredibilityTier.GOLD: return 10;
    case CredibilityTier.PLATINUM: return 25;
    case CredibilityTier.DIAMOND: return 50;
    default: return 0;
  }
}

// Tier benefits calculation
export function calculateTierBenefits(agent: Agent): {
  currentTier: CredibilityTier;
  tierInfo: any;
  maxLTV: number;
  benefits: string[];
  upgradePath: {
    nextTier: CredibilityTier | null;
    requirements: string[];
    estimatedTime: string;
  };
} {
  const currentTier = agent.credibilityTier;
  const tierInfo = CREDIBILITY_TIERS[currentTier];
  const maxLTV = calculateMaxLTV(agent);
  
  const upgradePath = checkTierUpgradeEligibility(agent, 30, 5); // Mock values
  
  return {
    currentTier,
    tierInfo,
    maxLTV,
    benefits: tierInfo.benefits,
    upgradePath: {
      nextTier: upgradePath.nextTier,
      requirements: upgradePath.requirements,
      estimatedTime: estimateUpgradeTime(agent, upgradePath.nextTier)
    }
  };
}

function estimateUpgradeTime(agent: Agent, nextTier: CredibilityTier | null): string {
  if (!nextTier) return 'Already at highest tier';
  
  const currentScore = agent.score.overall;
  const requiredScore = CREDIBILITY_TIERS[nextTier].minScore;
  const scoreGap = requiredScore - currentScore;
  
  if (scoreGap <= 0) return 'Score requirement met';
  if (scoreGap <= 5) return '1-2 weeks';
  if (scoreGap <= 10) return '2-4 weeks';
  if (scoreGap <= 15) return '1-2 months';
  return '3+ months';
}

// Tier comparison for multiple agents
export function compareAgentTiers(agents: Agent[]): {
  tierDistribution: { [key in CredibilityTier]: number };
  averageScores: { [key in CredibilityTier]: number };
  tierPerformance: { [key in CredibilityTier]: { avgLTV: number; avgScore: number } };
} {
  const tierDistribution: { [key in CredibilityTier]: number } = {
    [CredibilityTier.BRONZE]: 0,
    [CredibilityTier.SILVER]: 0,
    [CredibilityTier.GOLD]: 0,
    [CredibilityTier.PLATINUM]: 0,
    [CredibilityTier.DIAMOND]: 0
  };
  
  const tierScores: { [key in CredibilityTier]: number[] } = {
    [CredibilityTier.BRONZE]: [],
    [CredibilityTier.SILVER]: [],
    [CredibilityTier.GOLD]: [],
    [CredibilityTier.PLATINUM]: [],
    [CredibilityTier.DIAMOND]: []
  };
  
  const tierLTVs: { [key in CredibilityTier]: number[] } = {
    [CredibilityTier.BRONZE]: [],
    [CredibilityTier.SILVER]: [],
    [CredibilityTier.GOLD]: [],
    [CredibilityTier.PLATINUM]: [],
    [CredibilityTier.DIAMOND]: []
  };
  
  agents.forEach(agent => {
    tierDistribution[agent.credibilityTier]++;
    tierScores[agent.credibilityTier].push(agent.score.overall);
    tierLTVs[agent.credibilityTier].push(calculateMaxLTV(agent));
  });
  
  const averageScores: { [key in CredibilityTier]: number } = {} as any;
  const tierPerformance: { [key in CredibilityTier]: { avgLTV: number; avgScore: number } } = {} as any;
  
  Object.keys(tierDistribution).forEach(tier => {
    const tierKey = tier as CredibilityTier;
    const scores = tierScores[tierKey];
    const ltvValues = tierLTVs[tierKey];
    
    averageScores[tierKey] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    tierPerformance[tierKey] = {
      avgLTV: ltvValues.length > 0 ? ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length : 0,
      avgScore: averageScores[tierKey]
    };
  });
  
  return {
    tierDistribution,
    averageScores,
    tierPerformance
  };
}
