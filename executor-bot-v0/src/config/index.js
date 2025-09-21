import dotenv from 'dotenv';
import { connect, keyStores } from 'near-api-js';

// Load environment variables
dotenv.config();

// NEAR Configuration
const NEAR_CONFIG = {
  networkId: process.env.NEAR_NETWORK_ID || 'testnet',
  nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: process.env.NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
  helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
  explorerUrl: process.env.NEAR_EXPLORER_URL || 'https://testnet.nearblocks.io',
  keyStore: new keyStores.InMemoryKeyStore(),
};

// Executor Bot Configuration
const EXECUTOR_CONFIG = {
  accountId: process.env.EXECUTOR_ACCOUNT_ID || 'executor-bot.testnet',
  privateKey: process.env.EXECUTOR_PRIVATE_KEY,
  masterAccount: process.env.EXECUTOR_MASTER_ACCOUNT,
  pollInterval: parseInt(process.env.POLL_INTERVAL_MS) || 5000,
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 2000,
  maxConcurrentIntents: parseInt(process.env.MAX_CONCURRENT_INTENTS) || 10,
  intentTimeout: parseInt(process.env.INTENT_TIMEOUT_MS) || 30000,
  gasLimit: parseInt(process.env.GAS_LIMIT) || 300000000000000,
};

// Contract Configuration
const CONTRACT_CONFIG = {
  vaultContractId: process.env.VAULT_CONTRACT_ID || 'vault-contract-v0.your-account.testnet',
  registryContractId: process.env.REGISTRY_CONTRACT_ID || 'registry-contract-v0.your-account.testnet',
};

// Logging Configuration
const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || 'logs/executor-bot.log',
};

// Webhook Configuration
const WEBHOOK_CONFIG = {
  url: process.env.WEBHOOK_URL,
  secret: process.env.WEBHOOK_SECRET,
};

// Strategy Configuration
const STRATEGY_CONFIG = {
  staking: {
    contractId: 'staking-pool.testnet',
    gasLimit: 50000000000000,
    timeout: 60000,
  },
  lending: {
    contractId: 'lending-protocol.testnet',
    gasLimit: 30000000000000,
    timeout: 45000,
  },
  liquidity: {
    contractId: 'liquidity-pool.testnet',
    gasLimit: 40000000000000,
    timeout: 50000,
  },
};

// Validation
function validateConfig() {
  const errors = [];

  if (!EXECUTOR_CONFIG.privateKey) {
    errors.push('EXECUTOR_PRIVATE_KEY is required');
  }

  if (!EXECUTOR_CONFIG.masterAccount) {
    errors.push('EXECUTOR_MASTER_ACCOUNT is required');
  }

  if (!CONTRACT_CONFIG.vaultContractId.includes('vault-contract')) {
    errors.push('VAULT_CONTRACT_ID must be a valid vault contract');
  }

  if (!CONTRACT_CONFIG.registryContractId.includes('registry-contract')) {
    errors.push('REGISTRY_CONTRACT_ID must be a valid registry contract');
  }

  if (EXECUTOR_CONFIG.pollInterval < 1000) {
    errors.push('POLL_INTERVAL_MS must be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Initialize NEAR connection
async function initializeNear() {
  try {
    const near = await connect(NEAR_CONFIG);
    const account = await near.account(EXECUTOR_CONFIG.accountId);
    
    return {
      near,
      account,
      config: NEAR_CONFIG,
    };
  } catch (error) {
    console.error('Failed to initialize NEAR connection:', error);
    throw error;
  }
}

export {
  NEAR_CONFIG,
  EXECUTOR_CONFIG,
  CONTRACT_CONFIG,
  LOGGING_CONFIG,
  WEBHOOK_CONFIG,
  STRATEGY_CONFIG,
  validateConfig,
  initializeNear,
};
