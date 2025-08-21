import { Agent, CredibilityTier } from '@/types/agent';
import { 
  CreditVault, 
  VaultStatus, 
  VaultRiskMetrics, 
  LiquidationEvent, 
  LiquidationTrigger,
  ChainId,
  ChainConfig,
  VaultProtectionRule
} from '@/types/credit-vault';
import { calculateMaxLTV } from './credibility-tiers';

// Default chain configurations
export const DEFAULT_CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    chainId: ChainId.ETHEREUM,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
    blockExplorer: 'https://etherscan.io',
    nativeToken: 'ETH',
    gasToken: 'ETH',
    ltvAdjustments: {
      baseMultiplier: 1.0,
      scoreMultiplier: 0.1,
      volatilityMultiplier: 0.95
    },
    liquidationSettings: {
      minHealthFactor: 1.1,
      liquidationPenalty: 0.05,
      gracePeriod: 3600 // 1 hour
    }
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeToken: 'ETH',
    gasToken: 'ETH',
    ltvAdjustments: {
      baseMultiplier: 0.95,
      scoreMultiplier: 0.1,
      volatilityMultiplier: 0.90
    },
    liquidationSettings: {
      minHealthFactor: 1.15,
      liquidationPenalty: 0.06,
      gracePeriod: 1800 // 30 minutes
    }
  },
  [ChainId.POLYGON]: {
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeToken: 'MATIC',
    gasToken: 'MATIC',
    ltvAdjustments: {
      baseMultiplier: 0.90,
      scoreMultiplier: 0.1,
      volatilityMultiplier: 0.85
    },
    liquidationSettings: {
      minHealthFactor: 1.2,
      liquidationPenalty: 0.07,
      gracePeriod: 1200 // 20 minutes
    }
  }
};

/**
 * Calculate dynamic LTV based on agent scores and chain-specific factors
 */
export function calculateDynamicLTV(
  agent: Agent, 
  chainId: ChainId, 
  collateralValue: number,
  marketVolatility: number = 1.0
): number {
  const chainConfig = DEFAULT_CHAIN_CONFIGS[chainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Get base LTV from credibility tiers
  const baseLTV = calculateMaxLTV(agent, collateralValue, 'normal');
  
  // Apply chain-specific adjustments
  let adjustedLTV = baseLTV * chainConfig.ltvAdjustments.baseMultiplier;
  
  // Apply score-based adjustments
  const scoreAdjustment = (agent.score.overall - 50) * chainConfig.ltvAdjustments.scoreMultiplier;
  adjustedLTV += scoreAdjustment;
  
  // Apply volatility adjustments
  adjustedLTV *= Math.pow(chainConfig.ltvAdjustments.volatilityMultiplier, marketVolatility);
  
  // Apply credibility tier bonuses
  const tierBonus = getTierBonus(agent.credibilityTier);
  adjustedLTV += tierBonus;
  
  // Ensure LTV is within valid bounds
  return Math.max(20, Math.min(85, Math.round(adjustedLTV * 100) / 100));
}

/**
 * Get LTV bonus based on credibility tier
 */
function getTierBonus(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND:
      return 3;
    case CredibilityTier.PLATINUM:
      return 2;
    case CredibilityTier.GOLD:
      return 1;
    case CredibilityTier.SILVER:
      return 0.5;
    case CredibilityTier.BRONZE:
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate health factor for a vault
 */
export function calculateHealthFactor(
  vault: CreditVault,
  agent: Agent,
  marketVolatility: number = 1.0
): number {
  if (vault.debt.valueUSD === 0) return Infinity;
  
  const dynamicLTV = calculateDynamicLTV(agent, vault.chainId, vault.collateral.valueUSD, marketVolatility);
  const maxDebtValue = (vault.collateral.valueUSD * dynamicLTV) / 100;
  
  if (vault.debt.valueUSD >= maxDebtValue) return 0;
  
  return vault.collateral.valueUSD / vault.debt.valueUSD;
}

/**
 * Calculate comprehensive risk metrics for a vault
 */
export function calculateVaultRiskMetrics(
  vault: CreditVault,
  agent: Agent,
  historicalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }> = []
): VaultRiskMetrics {
  const currentLTV = vault.ltv;
  const currentHealthFactor = vault.healthFactor;
  
  // Calculate risk score based on multiple factors
  const riskScore = calculateRiskScore(vault, agent, historicalData);
  
  // Determine risk level
  const riskLevel = determineRiskLevel(currentLTV, currentHealthFactor, riskScore);
  
  // Generate warnings and recommendations
  const warnings = generateWarnings(vault, agent, riskLevel);
  const recommendations = generateRecommendations(vault, agent, riskLevel);
  
  return {
    vaultId: vault.id,
    timestamp: new Date(),
    currentLTV,
    currentHealthFactor,
    riskScore,
    ltvHistory: historicalData.map(d => ({ timestamp: d.timestamp, value: d.ltv })),
    healthFactorHistory: historicalData.map(d => ({ timestamp: d.timestamp, value: d.healthFactor })),
    riskLevel,
    warnings,
    recommendations
  };
}

/**
 * Calculate comprehensive risk score (0-100, higher = more risky)
 */
function calculateRiskScore(
  vault: CreditVault,
  agent: Agent,
  historicalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }>
): number {
  let score = 0;
  
  // LTV risk (40% weight)
  const ltvRisk = Math.min(100, (vault.ltv / vault.maxLTV) * 100);
  score += ltvRisk * 0.4;
  
  // Health factor risk (30% weight)
  const healthFactorRisk = Math.max(0, 100 - (vault.healthFactor * 50));
  score += healthFactorRisk * 0.3;
  
  // Agent score risk (20% weight)
  const agentScoreRisk = Math.max(0, 100 - agent.score.overall);
  score += agentScoreRisk * 0.2;
  
  // Volatility risk (10% weight)
  if (historicalData.length > 1) {
    const ltvValues = historicalData.map(d => d.ltv);
    const ltvVariance = calculateVariance(ltvValues);
    const volatilityRisk = Math.min(100, ltvVariance * 100);
    score += volatilityRisk * 0.1;
  }
  
  return Math.round(score);
}

/**
 * Calculate variance of a number array
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

/**
 * Determine risk level based on metrics
 */
function determineRiskLevel(ltv: number, healthFactor: number, riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (healthFactor <= 1.0 || ltv >= 95 || riskScore >= 80) return 'CRITICAL';
  if (healthFactor <= 1.2 || ltv >= 85 || riskScore >= 60) return 'HIGH';
  if (healthFactor <= 1.5 || ltv >= 75 || riskScore >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate warnings based on risk level
 */
function generateWarnings(vault: CreditVault, agent: Agent, riskLevel: string): string[] {
  const warnings: string[] = [];
  
  if (vault.ltv >= vault.maxLTV * 0.9) {
    warnings.push('LTV approaching maximum limit');
  }
  
  if (vault.healthFactor <= 1.2) {
    warnings.push('Health factor below safe threshold');
  }
  
  if (agent.score.overall < 50) {
    warnings.push('Agent credibility score is low');
  }
  
  if (riskLevel === 'CRITICAL') {
    warnings.push('Vault at risk of liquidation');
  }
  
  return warnings;
}

/**
 * Generate recommendations based on risk level
 */
function generateRecommendations(vault: CreditVault, agent: Agent, riskLevel: string): string[] {
  const recommendations: string[] = [];
  
  if (vault.ltv >= vault.maxLTV * 0.8) {
    recommendations.push('Consider reducing debt or increasing collateral');
  }
  
  if (vault.healthFactor <= 1.3) {
    recommendations.push('Monitor health factor closely and take preventive action');
  }
  
  if (agent.score.overall < 60) {
    recommendations.push('Improve agent credibility score through better performance');
  }
  
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    recommendations.push('Enable liquidation protection immediately');
    recommendations.push('Contact support for risk mitigation strategies');
  }
  
  return recommendations;
}

/**
 * Check if vault should trigger liquidation protection
 */
export function shouldTriggerLiquidationProtection(
  vault: CreditVault,
  agent: Agent,
  marketVolatility: number = 1.0
): boolean {
  if (!vault.liquidationProtection.enabled) return false;
  
  // Check cooldown
  if (vault.liquidationProtection.lastTriggered) {
    const timeSinceLastTrigger = Date.now() - vault.liquidationProtection.lastTriggered.getTime();
    if (timeSinceLastTrigger < vault.liquidationProtection.cooldown * 1000) {
      return false;
    }
  }
  
  // Check LTV threshold
  if (vault.ltv >= vault.liquidationProtection.threshold) {
    return true;
  }
  
  // Check health factor
  const healthFactor = calculateHealthFactor(vault, agent, marketVolatility);
  const chainConfig = DEFAULT_CHAIN_CONFIGS[vault.chainId];
  if (healthFactor <= chainConfig.liquidationSettings.minHealthFactor) {
    return true;
  }
  
  return false;
}

/**
 * Execute vault protection rules
 */
export function executeProtectionRules(
  vault: CreditVault,
  rules: VaultProtectionRule[],
  agent: Agent,
  marketVolatility: number = 1.0
): Array<{ ruleId: string; action: string; executed: boolean; message: string }> {
  const results: Array<{ ruleId: string; action: string; executed: boolean; message: string }> = [];
  
  // Sort rules by priority (higher priority first)
  const sortedRules = rules
    .filter(rule => rule.enabled)
    .sort((a, b) => b.priority - a.priority);
  
  for (const rule of sortedRules) {
    // Check cooldown
    if (rule.lastExecuted) {
      const timeSinceLastExecution = Date.now() - rule.lastExecuted.getTime();
      if (timeSinceLastExecution < rule.cooldown * 1000) {
        results.push({
          ruleId: rule.id,
          action: rule.name,
          executed: false,
          message: 'Rule in cooldown period'
        });
        continue;
      }
    }
    
    // Check conditions
    if (shouldExecuteRule(vault, agent, rule, marketVolatility)) {
      const executionResult = executeRule(vault, rule);
      results.push({
        ruleId: rule.id,
        action: rule.name,
        executed: executionResult.success,
        message: executionResult.message
      });
    } else {
      results.push({
        ruleId: rule.id,
        action: rule.name,
        executed: false,
        message: 'Conditions not met'
      });
    }
  }
  
  return results;
}

/**
 * Check if a protection rule should execute
 */
function shouldExecuteRule(
  vault: CreditVault,
  agent: Agent,
  rule: VaultProtectionRule,
  marketVolatility: number
): boolean {
  const { conditions } = rule;
  
  if (conditions.ltvThreshold && vault.ltv >= conditions.ltvThreshold) {
    return true;
  }
  
  if (conditions.healthFactorThreshold) {
    const healthFactor = calculateHealthFactor(vault, agent, marketVolatility);
    if (healthFactor <= conditions.healthFactorThreshold) {
      return true;
    }
  }
  
  if (conditions.scoreThreshold && agent.score.overall <= conditions.scoreThreshold) {
    return true;
  }
  
  return false;
}

/**
 * Execute a protection rule
 */
function executeRule(vault: CreditVault, rule: VaultProtectionRule): { success: boolean; message: string } {
  try {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'NOTIFY':
          // In a real implementation, this would send notifications
          console.log(`Notification sent for vault ${vault.id}: ${rule.description}`);
          break;
          
        case 'AUTO_REPAY':
          // In a real implementation, this would execute auto-repayment
          console.log(`Auto-repayment triggered for vault ${vault.id}`);
          break;
          
        case 'COLLATERAL_INCREASE':
          // In a real implementation, this would suggest collateral increase
          console.log(`Collateral increase recommended for vault ${vault.id}`);
          break;
          
        case 'DEBT_REDUCTION':
          // In a real implementation, this would suggest debt reduction
          console.log(`Debt reduction recommended for vault ${vault.id}`);
          break;
      }
    }
    
    // Update rule execution timestamp
    rule.lastExecuted = new Date();
    
    return { success: true, message: 'Rule executed successfully' };
  } catch (error) {
    return { success: false, message: `Rule execution failed: ${error}` };
  }
}

/**
 * Create a new credit vault
 */
export function createCreditVault(
  agentId: string,
  chainId: ChainId,
  collateralToken: string,
  collateralAmount: number,
  collateralValueUSD: number,
  maxLTV: number
): CreditVault {
  const vault: CreditVault = {
    id: `vault_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    chainId,
    status: VaultStatus.ACTIVE,
    collateral: {
      token: collateralToken,
      amount: collateralAmount,
      valueUSD: collateralValueUSD,
      lastUpdated: new Date()
    },
    debt: {
      token: 'USDC', // Default debt token
      amount: 0,
      valueUSD: 0,
      lastUpdated: new Date()
    },
    ltv: 0,
    healthFactor: Infinity,
    maxLTV,
    liquidationProtection: {
      enabled: true,
      threshold: maxLTV * 0.85, // 85% of max LTV
      cooldown: 3600 // 1 hour
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastRiskCheck: new Date()
  };
  
  return vault;
}

/**
 * Update vault collateral
 */
export function updateVaultCollateral(
  vault: CreditVault,
  newAmount: number,
  newValueUSD: number
): CreditVault {
  return {
    ...vault,
    collateral: {
      ...vault.collateral,
      amount: newAmount,
      valueUSD: newValueUSD,
      lastUpdated: new Date()
    },
    updatedAt: new Date()
  };
}

/**
 * Update vault debt
 */
export function updateVaultDebt(
  vault: CreditVault,
  newAmount: number,
  newValueUSD: number
): CreditVault {
  return {
    ...vault,
    debt: {
      ...vault.debt,
      amount: newAmount,
      valueUSD: newValueUSD,
      lastUpdated: new Date()
    },
    updatedAt: new Date()
  };
}

/**
 * Recalculate vault metrics
 */
export function recalculateVaultMetrics(
  vault: CreditVault,
  agent: Agent,
  marketVolatility: number = 1.0
): CreditVault {
  const newLTV = vault.debt.valueUSD > 0 ? (vault.debt.valueUSD / vault.collateral.valueUSD) * 100 : 0;
  const newHealthFactor = calculateHealthFactor(vault, agent, marketVolatility);
  const newMaxLTV = calculateDynamicLTV(agent, vault.chainId, vault.collateral.valueUSD, marketVolatility);
  
  return {
    ...vault,
    ltv: Math.round(newLTV * 100) / 100,
    healthFactor: Math.round(newHealthFactor * 100) / 100,
    maxLTV: Math.round(newMaxLTV * 100) / 100,
    lastRiskCheck: new Date(),
    updatedAt: new Date()
  };
}
