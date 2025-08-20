export enum ChainId {
  ETHEREUM = 1,
  ARBITRUM = 42161,
  POLYGON = 137,
  ETHEREUM_SEPOLIA = 11155111,
  ARBITRUM_SEPOLIA = 421614,
  POLYGON_MUMBAI = 80001
}

export enum VaultStatus {
  ACTIVE = 'ACTIVE',
  LIQUIDATED = 'LIQUIDATED',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED'
}

export enum LiquidationTrigger {
  LTV_EXCEEDED = 'LTV_EXCEEDED',
  HEALTH_FACTOR_LOW = 'HEALTH_FACTOR_LOW',
  SCORE_DROP = 'SCORE_DROP',
  MANUAL = 'MANUAL'
}

export interface CreditVault {
  id: string;
  agentId: string;
  chainId: ChainId;
  status: VaultStatus;
  
  // Collateral and debt
  collateral: {
    token: string;
    amount: number;
    valueUSD: number;
    lastUpdated: Date;
  };
  
  debt: {
    token: string;
    amount: number;
    valueUSD: number;
    lastUpdated: Date;
  };
  
  // Risk metrics
  ltv: number; // Loan-to-Value ratio
  healthFactor: number; // Risk health factor
  maxLTV: number; // Maximum allowed LTV
  
  // Protection settings
  liquidationProtection: {
    enabled: boolean;
    threshold: number; // LTV threshold for auto-protection
    cooldown: number; // Cooldown period in seconds
    lastTriggered?: Date;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastRiskCheck: Date;
}

export interface VaultRiskMetrics {
  vaultId: string;
  timestamp: Date;
  
  // Current metrics
  currentLTV: number;
  currentHealthFactor: number;
  riskScore: number;
  
  // Historical data
  ltvHistory: Array<{ timestamp: Date; value: number }>;
  healthFactorHistory: Array<{ timestamp: Date; value: number }>;
  
  // Risk indicators
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  recommendations: string[];
}

export interface LiquidationEvent {
  id: string;
  vaultId: string;
  trigger: LiquidationTrigger;
  timestamp: Date;
  
  // Pre-liquidation state
  preLTV: number;
  preHealthFactor: number;
  preCollateralValue: number;
  preDebtValue: number;
  
  // Liquidation details
  liquidatedAmount: number;
  liquidatedValue: number;
  penalty: number;
  
  // Post-liquidation state
  postLTV: number;
  postHealthFactor: number;
  
  metadata: Record<string, unknown>;
}

export interface ChainConfig {
  chainId: ChainId;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeToken: string;
  gasToken: string;
  
  // Chain-specific settings
  ltvAdjustments: {
    baseMultiplier: number;
    scoreMultiplier: number;
    volatilityMultiplier: number;
  };
  
  // Liquidation settings
  liquidationSettings: {
    minHealthFactor: number;
    liquidationPenalty: number;
    gracePeriod: number;
  };
}

export interface VaultProtectionRule {
  id: string;
  vaultId: string;
  name: string;
  description: string;
  
  // Trigger conditions
  conditions: {
    ltvThreshold?: number;
    healthFactorThreshold?: number;
    scoreThreshold?: number;
    timeWindow?: number; // in seconds
  };
  
  // Actions
  actions: Array<{
    type: 'NOTIFY' | 'AUTO_REPAY' | 'COLLATERAL_INCREASE' | 'DEBT_REDUCTION';
    parameters: Record<string, unknown>;
  }>;
  
  // Execution settings
  enabled: boolean;
  priority: number;
  cooldown: number;
  lastExecuted?: Date;
}
