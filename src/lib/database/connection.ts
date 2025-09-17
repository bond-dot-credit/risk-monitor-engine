// Database connection abstraction layer
// Note: Actual database drivers will be installed separately

export interface DatabaseConfig {
  type: 'postgresql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionString?: string;
}

export interface DatabaseConnection {
  query: (sql: string, params?: unknown[]) => Promise<DatabaseResult>;
  close: () => Promise<void>;
  isConnected: () => boolean;
}

export interface DatabaseResult {
  rows?: Record<string, unknown>[];
  rowCount?: number;
  insertId?: string;
  affectedRows?: number;
}

// Abstract base class for database connections
abstract class BaseDatabaseConnection implements DatabaseConnection {
  protected connected: boolean = false;

  abstract query(sql: string, params?: unknown[]): Promise<DatabaseResult>;
  abstract close(): Promise<void>;
  
  isConnected(): boolean {
    return this.connected;
  }

  protected setConnected(status: boolean): void {
    this.connected = status;
  }
}

// PostgreSQL connection implementation
class PostgreSQLConnection extends BaseDatabaseConnection {
  private pool: unknown; // Will be properly typed when pg is installed

  constructor(config: DatabaseConfig) {
    super();
    // Initialize PostgreSQL connection pool
    // This will be implemented when pg package is installed
    console.log('PostgreSQL connection initialized for:', config.host);
  }

  async query(sql: string, params: unknown[] = []): Promise<DatabaseResult> {
    try {
      // Placeholder implementation
      console.log('PostgreSQL query:', sql, params);
      return { rows: [], rowCount: 0 };
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.setConnected(false);
    console.log('PostgreSQL connection closed');
  }
}

// MongoDB connection implementation
class MongoDBConnection extends BaseDatabaseConnection {
  private client: unknown; // Will be properly typed when mongodb is installed
  private db: unknown;

  constructor(config: DatabaseConfig) {
    super();
    // Initialize MongoDB connection
    // This will be implemented when mongodb package is installed
    console.log('MongoDB connection initialized for:', config.host);
  }

  async query(sql: string, params: unknown[] = []): Promise<DatabaseResult> {
    try {
      // Parse SQL-like query for MongoDB operations
      // This is a simplified approach - in production, use proper MongoDB query builder
      const parts = sql.split(' ');
      const operation = parts[0].toLowerCase();
      const collection = parts[1];
      
      // Placeholder implementation
      console.log('MongoDB operation:', operation, 'on collection:', collection, params);
      return { rows: [], rowCount: 0 };
    } catch (error) {
      console.error('MongoDB operation error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.setConnected(false);
    console.log('MongoDB connection closed');
  }
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: DatabaseConnection | null = null;
  private config: DatabaseConfig;

  private constructor(config: DatabaseConfig) {
    this.config = config;
  }

  static getInstance(config: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<DatabaseConnection> {
    if (this.connection && this.connection.isConnected()) {
      return this.connection;
    }

    try {
      if (this.config.type === 'postgresql') {
        this.connection = new PostgreSQLConnection(this.config);
      } else if (this.config.type === 'mongodb') {
        this.connection = new MongoDBConnection(this.config);
      } else {
        throw new Error(`Unsupported database type: ${this.config.type}`);
      }

      // Test connection
      if (this.connection) {
        await this.connection.query('SELECT 1');
        console.log(`Connected to ${this.config.type} database`);
      }

      return this.connection!;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  getConnection(): DatabaseConnection | null {
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

// Environment-based configuration
export const getDatabaseConfig = (): DatabaseConfig => {
  const dbType = process.env.DATABASE_TYPE || 'postgresql';
  
  if (dbType === 'postgresql') {
    return {
      type: 'postgresql',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'risk_monitor',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.POSTGRES_SSL === 'true',
    };
  } else if (dbType === 'mongodb') {
    return {
      type: 'mongodb',
      host: process.env.MONGO_HOST || 'localhost',
      port: parseInt(process.env.MONGO_PORT || '27017'),
      database: process.env.MONGO_DB || 'risk_monitor',
      username: process.env.MONGO_USER || '',
      password: process.env.MONGO_PASSWORD || '',
      connectionString: process.env.MONGO_URI,
    };
  }
  
  throw new Error(`Unsupported database type: ${dbType}`);
};
