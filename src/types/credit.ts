export interface CreditVault {
  id: string;
  agentId: string;
  balance: number;
  creditLimit: number;
  currentLTV: number;
  maxLTV: number;
  utilization: number;
  status: VaultStatus;
  collateral: Collateral[];
  riskMetrics: VaultRiskMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export enum VaultStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  LIQUIDATING = 'liquidating',
  CLOSED = 'closed',
  UNDER_REVIEW = 'under_review'
}

export interface Collateral {
  id: string;
  assetType: string;
  amount: number;
  value: number;
  ltvRatio: number;
  liquidationThreshold: number;
  lastUpdated: Date;
}

export interface VaultRiskMetrics {
  healthFactor: number;
  liquidationRisk: number;
  collateralQuality: number;
  marketVolatility: number;
  lastCalculated: Date;
}

export interface LTVCalculation {
  base: number;
  adjustments: LTVAdjustment[];
  final: number;
  maxAllowed: number;
  confidence: number;
  riskScore: number;
}

export interface LTVAdjustment {
  type: 'score_bonus' | 'confidence_bonus' | 'performance_bonus' | 'provenance_bonus' | 'collateral_bonus' | 'market_bonus';
  factor: string;
  description: string;
  impact: number;
  reason: string;
  expiresAt?: Date;
}

export interface RiskMetrics {
  ltv: {
    current: number;
    maximum: number;
    utilization: number;
  };
  creditLine: {
    total: number;
    used: number;
    available: number;
    apr: number;
  };
  assetManagement: {
    aum: number;
    diversityScore: number;
    liquidationRisk: number;
  };
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

export interface CreditLineRequest {
  agentId: string;
  requestedAmount: number;
  collateral: Collateral[];
  purpose: string;
  duration: number;
}

export interface CreditLineApproval {
  requestId: string;
  approvedAmount: number;
  approvedLTV: number;
  conditions: string[];
  expiresAt: Date;
}
