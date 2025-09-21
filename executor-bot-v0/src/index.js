#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import { DepositMonitor } from './monitors/depositMonitor.js';
import { WithdrawalMonitor } from './monitors/withdrawalMonitor.js';
import { IntentExecutor } from './executors/intentExecutor.js';
import { 
  initializeNear, 
  validateConfig, 
  EXECUTOR_CONFIG 
} from './config/index.js';
import logger, { 
  logPerformanceMetrics,
  intentLogger,
  depositLogger,
  withdrawalLogger 
} from './logger/index.js';

/**
 * Bond.Credit Executor Bot v0
 * Off-chain automation for NEAR intents
 */
class ExecutorBot {
  constructor() {
    this.nearConnection = null;
    this.depositMonitor = null;
    this.withdrawalMonitor = null;
    this.intentExecutor = null;
    this.isRunning = false;
    this.startTime = Date.now();
    this.performanceInterval = null;
    this.cleanupInterval = null;
  }

  /**
   * Initialize the executor bot
   */
  async initialize() {
    try {
      logger.info('Initializing Bond.Credit Executor Bot v0');

      // Validate configuration
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        throw new Error(`Configuration errors: ${configValidation.errors.join(', ')}`);
      }

      logger.info('Configuration validated successfully');

      // Initialize NEAR connection
      this.nearConnection = await initializeNear();
      logger.info('NEAR connection initialized', {
        accountId: EXECUTOR_CONFIG.accountId,
        networkId: this.nearConnection.config.networkId,
      });

      // Initialize components
      this.intentExecutor = new IntentExecutor(this.nearConnection);
      this.depositMonitor = new DepositMonitor(this.nearConnection, this.intentExecutor);
      this.withdrawalMonitor = new WithdrawalMonitor(this.nearConnection, this.intentExecutor);

      logger.info('Executor bot components initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize executor bot', error);
      throw error;
    }
  }

  /**
   * Start the executor bot
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Executor bot is already running');
      return;
    }

    try {
      logger.info('Starting Bond.Credit Executor Bot v0');

      // Start monitoring services
      await this.depositMonitor.startMonitoring();
      await this.withdrawalMonitor.startMonitoring();

      // Start performance monitoring
      this.startPerformanceMonitoring();

      // Start cleanup tasks
      this.startCleanupTasks();

      // Start web server
      await this.startWebServer();

      this.isRunning = true;
      this.startTime = Date.now();

      logger.info('Executor bot started successfully', {
        startTime: new Date(this.startTime).toISOString(),
      });

      // Log startup metrics
      this.logStartupMetrics();

    } catch (error) {
      logger.error('Failed to start executor bot', error);
      throw error;
    }
  }

  /**
   * Stop the executor bot
   */
  async stop() {
    if (!this.isRunning) {
      logger.warn('Executor bot is not running');
      return;
    }

    try {
      logger.info('Stopping Bond.Credit Executor Bot v0');

      // Stop monitoring services
      this.depositMonitor.stopMonitoring();
      this.withdrawalMonitor.stopMonitoring();

      // Stop performance monitoring
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      // Stop cleanup tasks
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      this.isRunning = false;

      logger.info('Executor bot stopped successfully', {
        uptime: Math.floor((Date.now() - this.startTime) / 1000) + 's',
      });

    } catch (error) {
      logger.error('Error stopping executor bot', error);
      throw error;
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Log performance metrics every 5 minutes
    this.performanceInterval = setInterval(() => {
      const metrics = this.intentExecutor.getPerformanceMetrics();
      logPerformanceMetrics(metrics);
    }, 5 * 60 * 1000);

    logger.info('Performance monitoring started');
  }

  /**
   * Start cleanup tasks
   */
  startCleanupTasks() {
    // Clean up completed intents every hour
    this.cleanupInterval = setInterval(() => {
      this.intentExecutor.cleanupCompletedIntents();
      logger.debug('Completed intents cleanup performed');
    }, 60 * 60 * 1000);

    logger.info('Cleanup tasks started');
  }

  /**
   * Start web server for monitoring and health checks
   */
  async startWebServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const metrics = this.intentExecutor.getPerformanceMetrics();
      
      res.json({
        status: 'healthy',
        uptime: uptime + 's',
        isRunning: this.isRunning,
        metrics: {
          totalIntents: metrics.totalIntents,
          successfulIntents: metrics.successfulIntents,
          failedIntents: metrics.failedIntents,
          successRate: metrics.totalIntents > 0 
            ? (metrics.successfulIntents / metrics.totalIntents * 100).toFixed(2) + '%'
            : '0%',
          averageLatency: metrics.averageLatency + 'ms',
        },
      });
    });

    // Metrics endpoint
    app.get('/metrics', (req, res) => {
      const metrics = this.intentExecutor.getPerformanceMetrics();
      res.json(metrics);
    });

    // Active intents endpoint
    app.get('/intents', (req, res) => {
      const activeIntents = this.intentExecutor.getActiveIntents();
      res.json(activeIntents);
    });

    // Start server
    app.listen(port, () => {
      logger.info('Web server started', {
        port,
        endpoints: ['/health', '/metrics', '/intents'],
      });
    });
  }

  /**
   * Log startup metrics
   */
  logStartupMetrics() {
    logger.info('Executor Bot v0 Startup Metrics', {
      version: '1.0.0',
      network: this.nearConnection.config.networkId,
      accountId: EXECUTOR_CONFIG.accountId,
      vaultContract: process.env.VAULT_CONTRACT_ID,
      registryContract: process.env.REGISTRY_CONTRACT_ID,
      pollInterval: EXECUTOR_CONFIG.pollInterval + 'ms',
      maxConcurrentIntents: EXECUTOR_CONFIG.maxConcurrentIntents,
      intentTimeout: EXECUTOR_CONFIG.intentTimeout + 'ms',
      gasLimit: EXECUTOR_CONFIG.gasLimit,
    });
  }

  /**
   * Handle graceful shutdown
   */
  setupGracefulShutdown() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully`);
        try {
          await this.stop();
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', { reason, promise });
      process.exit(1);
    });
  }
}

// Main execution
async function main() {
  const bot = new ExecutorBot();
  
  // Setup graceful shutdown
  bot.setupGracefulShutdown();

  try {
    // Initialize and start the bot
    await bot.initialize();
    await bot.start();
    
    logger.info('Bond.Credit Executor Bot v0 is running');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    logger.error('Failed to start executor bot', error);
    process.exit(1);
  }
}

// Start the bot if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Unhandled error in main', error);
    process.exit(1);
  });
}

export default ExecutorBot;
