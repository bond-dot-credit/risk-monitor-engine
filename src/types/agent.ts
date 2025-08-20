export interface Agent {
  id: string;
  name: string;
  operator: string;
  metadata: AgentMetadata;
  score: AgentScore;
  credibilityTier: CredibilityTier;
  status: AgentStatus;
  verification: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetadata {
  description: string;
  category: string;
  version: string;
  tags: string[];
  provenance: ProvenanceInfo;
  verificationMethods: VerificationMethod[];
}

export interface ProvenanceInfo {
  sourceCode: string;
  verificationHash: string;
  deploymentChain: string;
  lastAudit: Date;
  auditScore?: number;
  auditReport?: string;
}

export interface VerificationMethod {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  score: number;
  lastVerified: Date;
  nextVerificationDue: Date;
  details: VerificationDetails;
}

export enum VerificationType {
  CODE_AUDIT = 'code_audit',
  PENETRATION_TEST = 'penetration_test',
  PERFORMANCE_BENCHMARK = 'performance_benchmark',
  SECURITY_ASSESSMENT = 'security_assessment',
  COMPLIANCE_CHECK = 'compliance_check',
  REPUTATION_VERIFICATION = 'reputation_verification',
  ON_CHAIN_ANALYSIS = 'on_chain_analysis',
  SOCIAL_PROOF = 'social_proof'
}

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  UNDER_REVIEW = 'under_review'
}

export interface VerificationDetails {
  auditor?: string;
  methodology?: string;
  findings?: string[];
  recommendations?: string[];
  riskLevel?: RiskLevel;
  complianceStandards?: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AgentScore {
  overall: number;
  provenance: number;
  performance: number;
  perception: number;
  confidence: number;
  verification: number;
  lastUpdated: Date;
}

export enum CredibilityTier {
  DIAMOND = 'DIAMOND',
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE'
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  UNDER_REVIEW = 'UNDER_REVIEW'
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
