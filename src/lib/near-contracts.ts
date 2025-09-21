import { connect, keyStores, WalletConnection, Contract, Account } from 'near-api-js';
import { getConfig } from './config/near-config';

// Contract interfaces
export interface VaultContract {
  get_config(): Promise<VaultConfig>;
  get_total_supply(): Promise<string>;
  get_token_reserves(args: { token_type: string }): Promise<string>;
  get_user_vault_shares(args: { account_id: string; token_type: string }): Promise<string>;
  get_user_total_shares(args: { account_id: string }): Promise<string>;
  deposit(args: { token_type: string; amount: string }): Promise<any>;
  withdraw(args: { token_type: string; vault_shares_amount: string }): Promise<any>;
  get_deposit_events(args: { limit?: number }): Promise<DepositEvent[]>;
  get_withdraw_events(args: { limit?: number }): Promise<WithdrawEvent[]>;
}

export interface RegistryContract {
  get_config(): Promise<RegistryConfig>;
  get_opportunities(args: { limit?: number; offset?: number }): Promise<Opportunity[]>;
  get_opportunity(args: { opportunity_id: number }): Promise<Opportunity>;
  get_opportunities_by_category(args: { category: string; limit?: number }): Promise<Opportunity[]>;
  get_categories(): Promise<string[]>;
  get_total_opportunities(): Promise<number>;
  get_active_opportunities_count(): Promise<number>;
}

export interface OpportunityContract {
  get_config(): Promise<OpportunityConfig>;
  get_total_allocated(): Promise<string>;
  get_available_capacity(): Promise<string>;
  get_allocation(args: { account_id: string }): Promise<Allocation>;
  get_total_participants(): Promise<number>;
  get_allocation_events(args: { limit?: number }): Promise<AllocationEvent[]>;
  get_withdrawal_events(args: { limit?: number }): Promise<WithdrawalEvent[]>;
  allocate(args: { amount: string }): Promise<any>;
  withdraw(args: { amount: string }): Promise<any>;
}

// Data types
export interface VaultConfig {
  owner_id: string;
  wnear_contract: string;
  usdc_contract: string;
  usdt_contract: string;
  fee_percentage: number;
  is_paused: boolean;
}

export interface RegistryConfig {
  owner_id: string;
  fee_percentage: number;
}

export interface OpportunityConfig {
  owner_id: string;
  name: string;
  description: string;
  apy: number;
  min_allocation: string;
  max_allocation: string;
  total_capacity: string;
  is_active: boolean;
  category: string;
}

export interface Opportunity {
  id: number;
  name: string;
  description: string;
  contract_id: string;
  apy: number;
  trust_score: number;
  performance: number;
  reliability: number;
  safety: number;
  total_score: number;
  risk_level: string;
  category: string;
  min_deposit: string;
  max_deposit: string;
  tvl: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface Allocation {
  account_id: string;
  amount: string;
  timestamp: number;
}

export interface DepositEvent {
  account_id: string;
  token_type: string;
  amount: string;
  vault_shares_minted: string;
  timestamp: number;
}

export interface WithdrawEvent {
  account_id: string;
  token_type: string;
  amount: string;
  vault_shares_burned: string;
  yield_earned: string;
  timestamp: number;
}

export interface AllocationEvent {
  account_id: string;
  amount: string;
  timestamp: number;
}

export interface WithdrawalEvent {
  account_id: string;
  amount: string;
  yield_earned: string;
  timestamp: number;
}

// Contract addresses (these will be set after deployment)
export const CONTRACT_ADDRESSES = {
  VAULT: 'vault-contract.testnet',
  REGISTRY: 'registry-contract.testnet',
  OPPORTUNITY: 'opportunity-contract.testnet',
};

class NearContractsService {
  private near: any = null;
  private wallet: WalletConnection | null = null;
  private account: Account | null = null;

  async initialize() {
    try {
      const config = getConfig();
      
      // Initialize NEAR connection
      this.near = await connect({
        ...config,
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      });

      // Initialize wallet
      this.wallet = new WalletConnection(this.near, 'bond-credit');
      
      if (this.wallet.isSignedIn()) {
        this.account = this.wallet.account();
      }

      console.log('NEAR Contracts Service initialized');
    } catch (error) {
      console.error('Failed to initialize NEAR Contracts Service:', error);
      throw error;
    }
  }

  // Wallet methods
  async signIn() {
    if (!this.wallet) throw new Error('Wallet not initialized');
    await this.wallet.requestSignIn();
    this.account = this.wallet.account();
  }

  async signOut() {
    if (!this.wallet) throw new Error('Wallet not initialized');
    this.wallet.signOut();
    this.account = null;
  }

  isSignedIn(): boolean {
    return this.wallet?.isSignedIn() ?? false;
  }

  getAccountId(): string | null {
    return this.wallet?.getAccountId() ?? null;
  }

  // Contract getters
  getVaultContract(): Contract & VaultContract {
    if (!this.account) throw new Error('User not signed in');
    
    return new Contract(
      this.account,
      CONTRACT_ADDRESSES.VAULT,
      {
        viewMethods: [
          'get_config',
          'get_total_supply',
          'get_token_reserves',
          'get_user_vault_shares',
          'get_user_total_shares',
          'get_deposit_events',
          'get_withdraw_events'
        ],
        changeMethods: [
          'deposit',
          'withdraw'
        ]
      }
    ) as Contract & VaultContract;
  }

  getRegistryContract(): Contract & RegistryContract {
    if (!this.account) throw new Error('User not signed in');
    
    return new Contract(
      this.account,
      CONTRACT_ADDRESSES.REGISTRY,
      {
        viewMethods: [
          'get_config',
          'get_opportunities',
          'get_opportunity',
          'get_opportunities_by_category',
          'get_categories',
          'get_total_opportunities',
          'get_active_opportunities_count'
        ],
        changeMethods: []
      }
    ) as Contract & RegistryContract;
  }

  getOpportunityContract(opportunityId?: number): Contract & OpportunityContract {
    if (!this.account) throw new Error('User not signed in');
    
    // For now, use the main opportunity contract
    // In the future, this could be dynamic based on opportunityId
    return new Contract(
      this.account,
      CONTRACT_ADDRESSES.OPPORTUNITY,
      {
        viewMethods: [
          'get_config',
          'get_total_allocated',
          'get_available_capacity',
          'get_allocation',
          'get_total_participants',
          'get_allocation_events',
          'get_withdrawal_events'
        ],
        changeMethods: [
          'allocate',
          'withdraw'
        ]
      }
    ) as Contract & OpportunityContract;
  }

  // Helper methods
  async getAccountBalance(accountId: string): Promise<string> {
    if (!this.near) throw new Error('NEAR not initialized');
    
    const account = await this.near.account(accountId);
    const balance = await account.getAccountBalance();
    return balance.total;
  }

  async getTokenBalance(accountId: string, tokenContract: string): Promise<string> {
    if (!this.near) throw new Error('NEAR not initialized');
    
    try {
      const account = await this.near.account(accountId);
      const result = await account.functionCall({
        contractId: tokenContract,
        methodName: 'ft_balance_of',
        args: { account_id: accountId }
      });
      
      // Parse the result (this might need adjustment based on the actual token contract)
      return result.toString();
    } catch (error) {
      console.error(`Failed to get token balance for ${tokenContract}:`, error);
      return '0';
    }
  }
}

// Export singleton instance
export const nearContractsService = new NearContractsService();
