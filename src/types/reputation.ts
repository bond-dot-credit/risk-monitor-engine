export enum ReputationEventType {
  PERFORMANCE = 'performance',
  INCIDENT = 'incident',
  VERIFICATION = 'verification',
  SECURITY_AUDIT = 'security_audit',
  PEER_FEEDBACK = 'peer_feedback',
  UPTIME = 'uptime',
  SLASH = 'slash',
  BUG_BOUNTY = 'bug_bounty',
  ONCHAIN_TX = 'onchain_tx'
}

export interface ReputationEvent {
  id: string;
  agentId: string;
  type: ReputationEventType;
  impact: number; // -100..+100 relative signal
  weight?: number; // optional multiplier, defaults to 1
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface ReputationSummaryBreakdown {
  provenance: number;
  performance: number;
  perception: number;
}

export interface ReputationSummary {
  agentId: string;
  currentOverall: number;
  trend24h: number; // delta of overall vs 24h ago if known
  lastUpdated: Date;
  breakdown: ReputationSummaryBreakdown;
  totalsByType: Record<string, number>;
  eventsCount: number;
}


