import { DatabaseConnection, DatabaseResult } from './connection';
import { CreditVault, VaultStatus, ChainId } from '@/types/credit-vault';
import { Agent, AgentStatus } from '@/types/agent';

// Base repository interface for common database operations
export interface BaseRepository<T> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Partial<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Partial<T>): Promise<number>;
}

// Abstract base repository implementation
export abstract class BaseRepositoryImpl<T> implements BaseRepository<T> {
  protected abstract tableName: string;
  protected abstract connection: DatabaseConnection;

  protected abstract mapToEntity(row: Record<string, unknown>): T;
  protected abstract mapToDatabase(entity: T): Record<string, unknown>;

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const entity = {
      ...data,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;

    const dbData = this.mapToDatabase(entity);
    const columns = Object.keys(dbData).join(', ');
    const placeholders = Object.keys(dbData).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(dbData);

    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.connection.query(sql, values);
    
    return this.mapToEntity(result.rows?.[0] || dbData);
  }

  async findById(id: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.connection.query(sql, [id]);
    
    if (result.rows && result.rows.length > 0) {
      return this.mapToEntity(result.rows[0]);
    }
    return null;
  }

  async findAll(filters?: Partial<T>): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramIndex++}`;
        });
      
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    sql += ' ORDER BY createdAt DESC';
    const result = await this.connection.query(sql, values);
    
    return (result.rows || []).map((row: Record<string, unknown>) => this.mapToEntity(row));
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const updateData = { ...data, updatedAt: new Date() };
    const dbData = this.mapToDatabase(updateData as T);
    
    const setClause = Object.keys(dbData)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(dbData).filter((_, index) => index !== 0)];
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const result = await this.connection.query(sql, values);
    
    if (result.rows && result.rows.length > 0) {
      return this.mapToEntity(result.rows[0]);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.connection.query(sql, [id]);
    return (result.rowCount || 0) > 0;
  }

  async count(filters?: Partial<T>): Promise<number> {
    let sql = `SELECT COUNT(*) FROM ${this.tableName}`;
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramIndex++}`;
        });
      
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    const result = await this.connection.query(sql, values);
    return parseInt(result.rows?.[0]?.count || '0', 10);
  }

  protected generateId(): string {
    return `${this.tableName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

// Credit Vault Repository
export class CreditVaultRepository extends BaseRepositoryImpl<CreditVault> {
  protected tableName = 'credit_vaults';
  protected connection: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    super();
    this.connection = connection;
  }

  protected mapToEntity(row: Record<string, unknown>): CreditVault {
    return {
      id: row.id,
      agentId: row.agent_id,
      chainId: row.chain_id as ChainId,
      status: row.status as VaultStatus,
      collateral: {
        token: row.collateral_token,
        amount: parseFloat(row.collateral_amount),
        valueUSD: parseFloat(row.collateral_value_usd),
        lastUpdated: new Date(row.collateral_last_updated),
      },
      debt: {
        token: row.debt_token,
        amount: parseFloat(row.debt_amount),
        valueUSD: parseFloat(row.debt_value_usd),
        lastUpdated: new Date(row.debt_last_updated),
      },
      ltv: parseFloat(row.ltv),
      healthFactor: parseFloat(row.health_factor),
      maxLTV: parseFloat(row.max_ltv),
      liquidationProtection: {
        enabled: row.liquidation_protection_enabled,
        threshold: parseFloat(row.liquidation_protection_threshold),
        cooldown: parseInt(row.liquidation_protection_cooldown),
        lastTriggered: row.liquidation_protection_last_triggered ? new Date(row.liquidation_protection_last_triggered) : undefined,
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastRiskCheck: new Date(row.last_risk_check),
    };
  }

  protected mapToDatabase(entity: CreditVault): Record<string, unknown> {
    return {
      id: entity.id,
      agent_id: entity.agentId,
      chain_id: entity.chainId,
      status: entity.status,
      collateral_token: entity.collateral.token,
      collateral_amount: entity.collateral.amount,
      collateral_value_usd: entity.collateral.valueUSD,
      collateral_last_updated: entity.collateral.lastUpdated,
      debt_token: entity.debt.token,
      debt_amount: entity.debt.amount,
      debt_value_usd: entity.debt.valueUSD,
      debt_last_updated: entity.debt.lastUpdated,
      ltv: entity.ltv,
      health_factor: entity.healthFactor,
      max_ltv: entity.maxLTV,
      liquidation_protection_enabled: entity.liquidationProtection.enabled,
      liquidation_protection_threshold: entity.liquidationProtection.threshold,
      liquidation_protection_cooldown: entity.liquidationProtection.cooldown,
      liquidation_protection_last_triggered: entity.liquidationProtection.lastTriggered,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      last_risk_check: entity.lastRiskCheck,
    };
  }

  // Custom methods for credit vaults
  async findByAgentId(agentId: string): Promise<CreditVault[]> {
    return this.findAll({ agentId } as Partial<CreditVault>);
  }

  async findByChainId(chainId: ChainId): Promise<CreditVault[]> {
    return this.findAll({ chainId } as Partial<CreditVault>);
  }

  async findByStatus(status: VaultStatus): Promise<CreditVault[]> {
    return this.findAll({ status } as Partial<CreditVault>);
  }

  async findHighRiskVaults(ltvThreshold: number): Promise<CreditVault[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE ltv >= $1 ORDER BY ltv DESC`;
    const result = await this.connection.query(sql, [ltvThreshold]);
    return (result.rows || []).map((row: Record<string, unknown>) => this.mapToEntity(row));
  }

  async updateVaultMetrics(id: string, ltv: number, healthFactor: number): Promise<CreditVault | null> {
    return this.update(id, { ltv, healthFactor } as Partial<CreditVault>);
  }
}

// Agent Repository
export class AgentRepository extends BaseRepositoryImpl<Agent> {
  protected tableName = 'agents';
  protected connection: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    super();
    this.connection = connection;
  }

  protected mapToEntity(row: Record<string, unknown>): Agent {
    return {
      id: row.id,
      name: row.name,
      operator: row.operator,
      metadata: {
        description: row.metadata_description,
        category: row.metadata_category,
        version: row.metadata_version,
        tags: row.metadata_tags ? JSON.parse(row.metadata_tags) : [],
        provenance: {
          sourceCode: row.provenance_source_code,
          verificationHash: row.provenance_verification_hash,
          deploymentChain: row.provenance_deployment_chain,
          lastAudit: new Date(row.provenance_last_audit),
          auditScore: parseInt(row.provenance_audit_score),
          auditReport: row.provenance_audit_report,
        },
        verificationMethods: row.verification_methods ? JSON.parse(row.verification_methods) : [],
      },
      score: row.score ? JSON.parse(row.score) : {},
      credibilityTier: row.credibility_tier,
      status: row.status as AgentStatus,
      verification: row.verification,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  protected mapToDatabase(entity: Agent): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      operator: entity.operator,
      metadata_description: entity.metadata.description,
      metadata_category: entity.metadata.category,
      metadata_version: entity.metadata.version,
      metadata_tags: JSON.stringify(entity.metadata.tags),
      provenance_source_code: entity.metadata.provenance.sourceCode,
      provenance_verification_hash: entity.metadata.provenance.verificationHash,
      provenance_deployment_chain: entity.metadata.provenance.deploymentChain,
      provenance_last_audit: entity.metadata.provenance.lastAudit,
      provenance_audit_score: entity.metadata.provenance.auditScore,
      provenance_audit_report: entity.metadata.provenance.auditReport,
      verification_methods: JSON.stringify(entity.metadata.verificationMethods),
      score: JSON.stringify(entity.score),
      credibility_tier: entity.credibilityTier,
      status: entity.status,
      verification: entity.verification,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  // Custom methods for agents
  async findByCredibilityTier(tier: string): Promise<Agent[]> {
    return this.findAll({ credibilityTier: tier } as Partial<Agent>);
  }

  async findHighScoreAgents(minScore: number): Promise<Agent[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE score->>'overall' >= $1 ORDER BY (score->>'overall')::int DESC`;
    const result = await this.connection.query(sql, [minScore.toString()]);
    return (result.rows || []).map((row: Record<string, unknown>) => this.mapToEntity(row));
  }

  async updateAgentScore(id: string, score: Record<string, unknown>): Promise<Agent | null> {
    return this.update(id, { score } as Partial<Agent>);
  }
}

// Repository factory for easy access
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private connection: DatabaseConnection | null = null;
  private vaultRepo: CreditVaultRepository | null = null;
  private agentRepo: AgentRepository | null = null;

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  setConnection(connection: DatabaseConnection): void {
    this.connection = connection;
  }

  getCreditVaultRepository(): CreditVaultRepository {
    if (!this.connection) {
      throw new Error('Database connection not set');
    }
    if (!this.vaultRepo) {
      this.vaultRepo = new CreditVaultRepository(this.connection);
    }
    return this.vaultRepo;
  }

  getAgentRepository(): AgentRepository {
    if (!this.connection) {
      throw new Error('Database connection not set');
    }
    if (!this.agentRepo) {
      this.agentRepo = new AgentRepository(this.connection);
    }
    return this.agentRepo;
  }
}
