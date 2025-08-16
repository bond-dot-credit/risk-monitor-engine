export interface CreditVault {
  id: string;
  agentId: string;
  balance: number;
  creditLimit: number;
  currentLTV: number;
  maxLTV: number;
  utilization: number;
  status: VaultStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum VaultStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  LIQUIDATING = 'liquidating',
  CLOSED = 'closed'
}

export interface LTVCalculation {
  agentScore: number;
  tier: string;
  baseLTV: number;
  adjustments: LTVAdjustment[];
  finalLTV: number;
  confidence: number;
}

export interface LTVAdjustment {
  factor: string;
  description: string;
  impact: number; // percentage change
  reason: string;
}

export interface RiskMetrics {
  volatility: number;
  liquidationRisk: number;
  performanceVariance: number;
  tierStability: number;
  marketExposure: number;
}

export interface CreditPosition {
  vaultId: string;
  amount: number;
  apr: number;
  duration: number;
  collateralRatio: number;
  liquidationPrice: number;
  healthFactor: number;
  createdAt: Date;
}

export interface RestakePool {
  id: string;
  totalStaked: number;
  activePositions: number;
  apy: number;
  riskLevel: RiskLevel;
  maxExposure: number;
  currentExposure: number;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
