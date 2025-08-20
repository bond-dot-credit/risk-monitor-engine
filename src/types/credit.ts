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
  base: number;
  adjustments: LTVAdjustment[];
  final: number;
  maxAllowed: number;
}

export interface LTVAdjustment {
  type: 'score_bonus' | 'confidence_bonus' | 'performance_bonus' | 'provenance_bonus';
  factor: string;
  description: string;
  impact: number;
  reason: string;
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
