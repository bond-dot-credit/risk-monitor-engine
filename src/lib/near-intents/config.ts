import { ConfigManager } from '../config/ConfigManager';

export interface NearIntentsConfig {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  accountId: string;
  privateKey: string;
  intentsContractId: string;
  verifierContractId: string;
  solverBusUrl: string;
  solverBusApiKey?: string;
  nearBlocksApiKey?: string;
  pagodaApiKey?: string;
  coinGeckoApiKey?: string;
}

export class NearIntentsConfigManager {
  private static instance: NearIntentsConfigManager;
  private config: NearIntentsConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): NearIntentsConfigManager {
    if (!NearIntentsConfigManager.instance) {
      NearIntentsConfigManager.instance = new NearIntentsConfigManager();
    }
    return NearIntentsConfigManager.instance;
  }

  private loadConfig(): NearIntentsConfig {
    const networkId = process.env.NEAR_NETWORK_ID || 'mainnet';
    
    // Use fastnear.com as suggested in the error message to avoid rate limiting
    const nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    
    return {
      networkId,
      nodeUrl,
      walletUrl: process.env.NEAR_WALLET_URL || this.getDefaultWalletUrl(networkId),
      helperUrl: process.env.NEAR_HELPER_URL || this.getDefaultHelperUrl(networkId),
      accountId: process.env.NEAR_ACCOUNT_ID || '',
      privateKey: process.env.NEAR_PRIVATE_KEY || '',
      intentsContractId: process.env.NEAR_INTENTS_CONTRACT_ID || this.getDefaultIntentsContract(networkId),
      verifierContractId: process.env.VERIFIER_CONTRACT_ID || this.getDefaultVerifierContract(networkId),
      solverBusUrl: process.env.SOLVER_BUS_URL || this.getDefaultSolverBusUrl(networkId),
      solverBusApiKey: process.env.SOLVER_BUS_API_KEY,
      nearBlocksApiKey: process.env.NEARBLOCKS_API_KEY,
      pagodaApiKey: process.env.PAGODA_API_KEY,
      coinGeckoApiKey: process.env.COINGECKO_API_KEY,
    };
  }

  private getDefaultNodeUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://rpc.mainnet.near.org';
      case 'testnet':
        return 'https://rpc.testnet.near.org';
      case 'localnet':
        return 'http://localhost:3030';
      default:
        return 'https://rpc.testnet.near.org';
    }
  }

  private getDefaultWalletUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://wallet.near.org';
      case 'testnet':
        return 'https://wallet.testnet.near.org';
      default:
        return 'https://wallet.testnet.near.org';
    }
  }

  private getDefaultHelperUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://helper.mainnet.near.org';
      case 'testnet':
        return 'https://helper.testnet.near.org';
      default:
        return 'https://helper.testnet.near.org';
    }
  }

  private getDefaultIntentsContract(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'intents.near';
      case 'testnet':
        return 'intents.testnet';
      default:
        return 'intents.testnet';
    }
  }

  private getDefaultVerifierContract(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'intents.verifier.near';
      case 'testnet':
        return 'intents.verifier.testnet';
      default:
        return 'intents.verifier.testnet';
    }
  }

  private getDefaultSolverBusUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://solver-bus.near.org';
      case 'testnet':
        return 'https://solver-bus.testnet.near.org';
      default:
        return 'https://solver-bus.testnet.near.org';
    }
  }

  public getConfig(): NearIntentsConfig {
    return { ...this.config };
  }

  public getNetworkConfig() {
    return {
      networkId: this.config.networkId,
      nodeUrl: this.config.nodeUrl,
      walletUrl: this.config.walletUrl,
      helperUrl: this.config.helperUrl,
    };
  }

  public getAccountConfig() {
    return {
      accountId: this.config.accountId,
      privateKey: this.config.privateKey,
      networkId: this.config.networkId,
      nodeUrl: this.config.nodeUrl,
    };
  }

  public getContractsConfig() {
    return {
      intentsContractId: this.config.intentsContractId,
      verifierContractId: this.config.verifierContractId,
      solverBusUrl: this.config.solverBusUrl,
    };
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.accountId) {
      errors.push('NEAR_ACCOUNT_ID is required');
    }

    if (!this.config.privateKey) {
      errors.push('NEAR_PRIVATE_KEY is required');
    }

    if (!this.config.nodeUrl) {
      errors.push('NEAR_NODE_URL is required');
    }

    if (!this.config.intentsContractId) {
      errors.push('NEAR_INTENTS_CONTRACT_ID is required');
    }

    if (!this.config.verifierContractId) {
      errors.push('VERIFIER_CONTRACT_ID is required');
    }

    if (!this.config.solverBusUrl) {
      errors.push('SOLVER_BUS_URL is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public isMainnet(): boolean {
    return this.config.networkId === 'mainnet';
  }

  public isTestnet(): boolean {
    return this.config.networkId === 'testnet';
  }

  public isLocalnet(): boolean {
    return this.config.networkId === 'localnet';
  }

  // Add a method to reload configuration
  public reloadConfig(): void {
    this.config = this.loadConfig();
  }
}

// Export singleton instance
export const nearIntentsConfig = NearIntentsConfigManager.getInstance();