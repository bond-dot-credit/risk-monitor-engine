export enum ReputationEventType {
  PERFORMANCE_IMPROVEMENT = 'performance_improvement',
  PERFORMANCE_DECLINE = 'performance_decline',
  CREDIT_LINE_INCREASE = 'credit_line_increase',
  CREDIT_LINE_DECREASE = 'credit_line_decrease',
  ASSET_UNDER_MANAGEMENT_CHANGE = 'aum_change',
  APR_IMPROVEMENT = 'apr_improvement',
  APR_DECLINE = 'apr_decline',
  LTV_OPTIMIZATION = 'ltv_optimization',
  RISK_MANAGEMENT = 'risk_management',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  COMPLIANCE_IMPROVEMENT = 'compliance_improvement'
}

export interface ReputationEvent {
  id: string;
  agentId: string;
  type: ReputationEventType;
  timestamp: Date;
  description: string;
  impact: number; // -100 to +100, negative for negative events
  metadata: {
    previousValue?: string | number;
    newValue?: string | number;
    changePercentage?: number;
    assetType?: string;
    creditLine?: number;
    apr?: number;
    ltv?: number;
    aum?: number;
  };
}

export interface ReputationSummaryBreakdown {
  performance: number;
  credit: number;
  risk: number;
  compliance: number;
  overall: number;
}

export interface ReputationSummary {
  agentId: string;
  lastUpdated: Date;
  totalEvents: number;
  positiveEvents: number;
  negativeEvents: number;
  breakdown: ReputationSummaryBreakdown;
  recentEvents: ReputationEvent[];
  trend: 'improving' | 'stable' | 'declining';
}
