// Core NEAR Intents functionality
export { NearIntents, ASSET_MAP } from './near-intents';
export type { IntentRequest, Quote, IntentExecutionResult } from './near-intents';

// AI Agent for automated trading
export { AIAgent } from './ai-agent';
export type { NearAccountConfig } from './ai-agent';

// Bulk operations management
export { BulkOperationsManager } from './bulk-operations';
export type { BulkOperationConfig, BulkOperationResult } from './bulk-operations';

// On-chain metrics collection
export { OnChainMetricsCollector } from './onchain-metrics';
export type { OnChainMetricsConfig, OnChainMetrics, TransactionData } from './onchain-metrics';

// Configuration management
export { NearIntentsConfigManager, nearIntentsConfig } from './config';
export type { NearIntentsConfig } from './config';

// Wallet Integration
export {
  initializeWalletConnection,
  getAccountBalance,
  transferNear,
  callContract,
  swapTokensOnRef,
  getTransactionStatus,
  demonstrateWalletUsage
} from './wallet-integration';
export type { WalletConnection } from './wallet-integration';

// Real World Examples
export {
  RealWorldNearIntentsDemo,
  runRealWorldDemo,
  quickBalanceCheck,
  quickWalletDemo
} from './real-world-example';

// Error handling and validation utilities
export { NearIntentsErrorHandler, ValidationUtils, RetryUtils, TransactionUtils } from './utils';
export { NearIntentsErrorType } from './utils';
export type { NearIntentsError } from './utils';

// Example implementations
export { basicSwapExample } from './basic-swap';