// Bond.Credit Vault Contract Types
// These types match the Rust contract structures

export enum TokenType {
  WNEAR = 'WNEAR',
  USDC = 'USDC',
  USDT = 'USDT',
}

export interface VaultConfig {
  owner_id: string;
  wnear_contract: string;
  usdc_contract: string;
  usdt_contract: string;
  fee_percentage: number;
  is_paused: boolean;
}

export interface VaultShare {
  account_id: string;
  amount: string;
  token_type: TokenType;
  deposited_at: number;
}

export interface DepositEvent {
  account_id: string;
  token_type: TokenType;
  amount: string;
  vault_shares_minted: string;
  timestamp: number;
}

export interface WithdrawEvent {
  account_id: string;
  token_type: TokenType;
  amount: string;
  vault_shares_burned: string;
  yield_earned: string;
  timestamp: number;
}

export interface VaultState {
  total_supply: string;
  token_reserves: Record<TokenType, string>;
  user_shares: Record<TokenType, string>;
  total_shares: string;
}

export interface VaultContractMethods {
  // View methods
  get_config(): Promise<VaultConfig>;
  get_total_supply(): Promise<string>;
  get_token_reserves(token_type: TokenType): Promise<string>;
  get_user_vault_shares(account_id: string, token_type: TokenType): Promise<string>;
  get_user_total_shares(account_id: string): Promise<string>;
  get_deposit_events(limit?: number): Promise<DepositEvent[]>;
  get_withdraw_events(limit?: number): Promise<WithdrawEvent[]>;

  // Change methods
  deposit(token_type: TokenType, amount: string): Promise<void>;
  withdraw(token_type: TokenType, vault_shares_amount: string): Promise<void>;
  
  // Admin methods
  update_config(new_config: VaultConfig): Promise<void>;
  pause_vault(): Promise<void>;
  unpause_vault(): Promise<void>;
}

// Token contract addresses for different networks
export const TOKEN_CONTRACTS = {
  testnet: {
    [TokenType.WNEAR]: 'wrap.testnet',
    [TokenType.USDC]: 'usdc.testnet',
    [TokenType.USDT]: 'usdt.testnet',
  },
  mainnet: {
    [TokenType.WNEAR]: 'wrap.near',
    [TokenType.USDC]: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
    [TokenType.USDT]: 'usdt.tether-token.near',
  },
};

// Vault contract configuration
export interface VaultContractConfig {
  contractId: string;
  networkId: 'testnet' | 'mainnet';
  ownerAccount: string;
  feePercentage: number;
}

// Deposit/Withdraw request types
export interface DepositRequest {
  tokenType: TokenType;
  amount: string;
  accountId: string;
}

export interface WithdrawRequest {
  tokenType: TokenType;
  vaultSharesAmount: string;
  accountId: string;
}

// Vault statistics
export interface VaultStats {
  totalValueLocked: string;
  totalUsers: number;
  totalDeposits: Record<TokenType, string>;
  totalWithdrawals: Record<TokenType, string>;
  averageYield: number;
  lastUpdated: number;
}

// Event types for real-time updates
export interface VaultEvent {
  type: 'deposit' | 'withdraw' | 'config_update' | 'pause' | 'unpause';
  data: DepositEvent | WithdrawEvent | VaultConfig;
  timestamp: number;
  transactionHash: string;
}

