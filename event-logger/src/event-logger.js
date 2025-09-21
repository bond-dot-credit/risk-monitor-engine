import winston from 'winston';
import sqlite3 from 'sqlite3';
import fs from 'fs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/events.log' })
  ]
});

/**
 * Bond.Credit v0 Event Logger
 * Complete event tracking: deposits, allocations, withdrawals, scores
 */
export class EventLogger {
  constructor(dbPath = 'events.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initialize() {
    // Create database connection
    this.db = new sqlite3.Database(this.dbPath);
    
    // Initialize tables
    await this.createTables();
    
    logger.info('✅ Event logger initialized');
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const sql = `
        -- Deposit events
        CREATE TABLE IF NOT EXISTS deposit_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          token_type TEXT NOT NULL,
          amount TEXT NOT NULL,
          shares_received TEXT NOT NULL,
          tx_hash TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          opportunity_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Withdrawal events
        CREATE TABLE IF NOT EXISTS withdrawal_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          token_type TEXT NOT NULL,
          shares_burned TEXT NOT NULL,
          tokens_received TEXT NOT NULL,
          yield_earned TEXT NOT NULL,
          tx_hash TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Allocation events
        CREATE TABLE IF NOT EXISTS allocation_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          opportunity_id INTEGER NOT NULL,
          amount TEXT NOT NULL,
          tx_hash TEXT NOT NULL,
          gas_used TEXT NOT NULL,
          latency_ms INTEGER NOT NULL,
          success BOOLEAN NOT NULL,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Intent execution events
        CREATE TABLE IF NOT EXISTS intent_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          intent_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          opportunity_id INTEGER NOT NULL,
          action_type TEXT NOT NULL,
          amount TEXT NOT NULL,
          success BOOLEAN NOT NULL,
          gas_used TEXT NOT NULL,
          latency_ms INTEGER NOT NULL,
          tx_hash TEXT NOT NULL,
          error_message TEXT,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Score update events
        CREATE TABLE IF NOT EXISTS score_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opportunity_id INTEGER NOT NULL,
          opportunity_name TEXT NOT NULL,
          old_score INTEGER NOT NULL,
          new_score INTEGER NOT NULL,
          score_change INTEGER NOT NULL,
          update_type TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- System events
        CREATE TABLE IF NOT EXISTS system_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          message TEXT NOT NULL,
          severity TEXT NOT NULL,
          metadata TEXT,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_deposit_user ON deposit_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_deposit_timestamp ON deposit_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_withdrawal_user ON withdrawal_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_allocation_user ON allocation_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_allocation_opportunity ON allocation_events(opportunity_id);
        CREATE INDEX IF NOT EXISTS idx_intent_user ON intent_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_score_opportunity ON score_events(opportunity_id);
      `;

      this.db.exec(sql, (err) => {
        if (err) {
          logger.error('Failed to create tables', { error: err.message });
          reject(err);
        } else {
          logger.info('✅ Database tables created');
          resolve();
        }
      });
    });
  }

  // Deposit event logging
  async logDeposit(userId, tokenType, amount, sharesReceived, txHash, opportunityId = null) {
    const event = {
      user_id: userId,
      token_type: tokenType,
      amount: amount.toString(),
      shares_received: sharesReceived.toString(),
      tx_hash: txHash,
      timestamp: Date.now(),
      opportunity_id: opportunityId
    };

    return this.insertEvent('deposit_events', event);
  }

  // Withdrawal event logging
  async logWithdrawal(userId, tokenType, sharesBurned, tokensReceived, yieldEarned, txHash) {
    const event = {
      user_id: userId,
      token_type: tokenType,
      shares_burned: sharesBurned.toString(),
      tokens_received: tokensReceived.toString(),
      yield_earned: yieldEarned.toString(),
      tx_hash: txHash,
      timestamp: Date.now()
    };

    return this.insertEvent('withdrawal_events', event);
  }

  // Allocation event logging
  async logAllocation(userId, opportunityId, amount, txHash, gasUsed, latency, success = true) {
    const event = {
      user_id: userId,
      opportunity_id: opportunityId,
      amount: amount.toString(),
      tx_hash: txHash,
      gas_used: gasUsed.toString(),
      latency_ms: latency,
      success: success,
      timestamp: Date.now()
    };

    return this.insertEvent('allocation_events', event);
  }

  // Intent execution event logging
  async logIntentExecution(intentId, userId, opportunityId, actionType, amount, success, gasUsed, latency, txHash, errorMessage = null) {
    const event = {
      intent_id: intentId,
      user_id: userId,
      opportunity_id: opportunityId,
      action_type: actionType,
      amount: amount.toString(),
      success: success,
      gas_used: gasUsed.toString(),
      latency_ms: latency,
      tx_hash: txHash,
      error_message: errorMessage,
      timestamp: Date.now()
    };

    return this.insertEvent('intent_events', event);
  }

  // Score update event logging
  async logScoreUpdate(opportunityId, opportunityName, oldScore, newScore, updateType = 'manual') {
    const event = {
      opportunity_id: opportunityId,
      opportunity_name: opportunityName,
      old_score: oldScore,
      new_score: newScore,
      score_change: newScore - oldScore,
      update_type: updateType,
      timestamp: Date.now()
    };

    return this.insertEvent('score_events', event);
  }

  // System event logging
  async logSystemEvent(eventType, message, severity = 'info', metadata = null) {
    const event = {
      event_type: eventType,
      message: message,
      severity: severity,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: Date.now()
    };

    return this.insertEvent('system_events', event);
  }

  // Generic event insertion
  async insertEvent(tableName, eventData) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(eventData).join(', ');
      const placeholders = Object.keys(eventData).map(() => '?').join(', ');
      const values = Object.values(eventData);

      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

      this.db.run(sql, values, function(err) {
        if (err) {
          logger.error(`Failed to insert ${tableName} event`, { error: err.message, eventData });
          reject(err);
        } else {
          logger.info(`${tableName} event logged`, { id: this.lastID, eventData });
          resolve(this.lastID);
        }
      });
    });
  }

  // Query methods
  async getDepositEvents(userId = null, limit = 100, offset = 0) {
    return this.queryEvents('deposit_events', userId, limit, offset);
  }

  async getWithdrawalEvents(userId = null, limit = 100, offset = 0) {
    return this.queryEvents('withdrawal_events', userId, limit, offset);
  }

  async getAllocationEvents(userId = null, opportunityId = null, limit = 100, offset = 0) {
    let sql = `SELECT * FROM allocation_events`;
    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (opportunityId) {
      conditions.push('opportunity_id = ?');
      params.push(opportunityId);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this.query(sql, params);
  }

  async getIntentEvents(userId = null, limit = 100, offset = 0) {
    return this.queryEvents('intent_events', userId, limit, offset);
  }

  async getScoreEvents(opportunityId = null, limit = 100, offset = 0) {
    return this.queryEvents('score_events', opportunityId, 'opportunity_id', limit, offset);
  }

  async getSystemEvents(limit = 100, offset = 0) {
    return this.query(`SELECT * FROM system_events ORDER BY timestamp DESC LIMIT ? OFFSET ?`, [limit, offset]);
  }

  // Generic query method
  async queryEvents(tableName, filterValue, filterColumn = 'user_id', limit = 100, offset = 0) {
    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    if (filterValue) {
      sql += ` WHERE ${filterColumn} = ?`;
      params.push(filterValue);
    }

    sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this.query(sql, params);
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Query failed', { sql, params, error: err.message });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Analytics methods
  async getEventStats() {
    const stats = {};

    // Count events by type
    const eventCounts = await Promise.all([
      this.query('SELECT COUNT(*) as count FROM deposit_events'),
      this.query('SELECT COUNT(*) as count FROM withdrawal_events'),
      this.query('SELECT COUNT(*) as count FROM allocation_events'),
      this.query('SELECT COUNT(*) as count FROM intent_events'),
      this.query('SELECT COUNT(*) as count FROM score_events')
    ]);

    stats.deposits = eventCounts[0][0].count;
    stats.withdrawals = eventCounts[1][0].count;
    stats.allocations = eventCounts[2][0].count;
    stats.intents = eventCounts[3][0].count;
    stats.scoreUpdates = eventCounts[4][0].count;

    // Get recent activity (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentActivity = await Promise.all([
      this.query('SELECT COUNT(*) as count FROM deposit_events WHERE timestamp > ?', [oneDayAgo]),
      this.query('SELECT COUNT(*) as count FROM withdrawal_events WHERE timestamp > ?', [oneDayAgo]),
      this.query('SELECT COUNT(*) as count FROM allocation_events WHERE timestamp > ?', [oneDayAgo])
    ]);

    stats.recentDeposits = recentActivity[0][0].count;
    stats.recentWithdrawals = recentActivity[1][0].count;
    stats.recentAllocations = recentActivity[2][0].count;

    return stats;
  }

  async close() {
    if (this.db) {
      this.db.close();
      logger.info('✅ Database connection closed');
    }
  }
}
