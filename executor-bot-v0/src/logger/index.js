import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOGGING_CONFIG } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.dirname(LOGGING_CONFIG.file);
import fs from 'fs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: LOGGING_CONFIG.level,
  format: logFormat,
  defaultMeta: { service: 'executor-bot' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File transport
    new winston.transports.File({
      filename: LOGGING_CONFIG.file,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    
    // Error file transport
    new winston.transports.File({
      filename: path.join(path.dirname(LOGGING_CONFIG.file), 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

// Add specific loggers for different components
export const intentLogger = logger.child({ component: 'intent-executor' });
export const depositLogger = logger.child({ component: 'deposit-monitor' });
export const withdrawalLogger = logger.child({ component: 'withdrawal-handler' });
export const registryLogger = logger.child({ component: 'registry-monitor' });

// Log execution metrics
export function logIntentExecution(intentData) {
  const {
    intentHash,
    success,
    gasUsed,
    latencyMs,
    errorMessage,
    opportunityId,
    accountId,
    amount,
    strategy,
  } = intentData;

  const logData = {
    intentHash,
    success,
    gasUsed: gasUsed.toString(),
    latencyMs,
    opportunityId,
    accountId,
    amount: amount.toString(),
    strategy,
  };

  if (success) {
    intentLogger.info('Intent executed successfully', logData);
  } else {
    intentLogger.error('Intent execution failed', {
      ...logData,
      errorMessage,
    });
  }
}

// Log deposit monitoring
export function logDepositEvent(depositData) {
  const {
    accountId,
    tokenType,
    amount,
    vaultSharesMinted,
    timestamp,
    txHash,
  } = depositData;

  depositLogger.info('Deposit detected', {
    accountId,
    tokenType,
    amount: amount.toString(),
    vaultSharesMinted: vaultSharesMinted.toString(),
    timestamp,
    txHash,
  });
}

// Log withdrawal monitoring
export function logWithdrawalEvent(withdrawalData) {
  const {
    accountId,
    tokenType,
    amount,
    vaultSharesBurned,
    timestamp,
    txHash,
  } = withdrawalData;

  withdrawalLogger.info('Withdrawal detected', {
    accountId,
    tokenType,
    amount: amount.toString(),
    vaultSharesBurned: vaultSharesBurned.toString(),
    timestamp,
    txHash,
  });
}

// Log registry updates
export function logRegistryEvent(registryData) {
  const {
    eventType,
    opportunityId,
    opportunityName,
    timestamp,
    txHash,
  } = registryData;

  registryLogger.info('Registry event detected', {
    eventType,
    opportunityId,
    opportunityName,
    timestamp,
    txHash,
  });
}

// Performance metrics logging
export function logPerformanceMetrics(metrics) {
  const {
    totalIntents,
    successfulIntents,
    failedIntents,
    averageLatency,
    averageGasUsed,
    uptime,
  } = metrics;

  logger.info('Performance metrics', {
    totalIntents,
    successfulIntents,
    failedIntents,
    successRate: totalIntents > 0 ? (successfulIntents / totalIntents * 100).toFixed(2) + '%' : '0%',
    averageLatency: averageLatency + 'ms',
    averageGasUsed: averageGasUsed.toString(),
    uptime: uptime + 's',
  });
}

export default logger;
