export interface Agent {
  id: string;
  name: string;
  operator: string;
  metadata: AgentMetadata;
  score: AgentScore;
  credibilityTier: CredibilityTier;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetadata {
  description: string;
  category: string;
  version: string;
  tags: string[];
  provenance: ProvenanceData;
}

export interface ProvenanceData {
  sourceCode: string;
  verificationHash: string;
  deploymentChain: string;
  lastAudit?: Date;
}

export interface AgentScore {
  overall: number; // 0-100
  provenance: number; // 0-100
  performance: number; // 0-100
  perception: number; // 0-100
  confidence: number; // 0-100
  lastUpdated: Date;
}

export enum CredibilityTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review'
}

export interface PerformanceLog {
  id: string;
  agentId: string;
  taskId: string;
  performance: number;
  metrics: Record<string, number>;
  timestamp: Date;
  encrypted: boolean;
}
