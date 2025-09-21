import { Account } from 'near-api-js';

// Contract addresses on NEAR testnet
export const CONTRACT_ADDRESSES = {
  VAULT: 'vault-contract.testnet',
  REGISTRY: 'registry-contract.testnet',
  OPPORTUNITY: 'opportunity-contract.testnet',
} as const;

// Helper function to get contract instance
export async function getContract(account: Account, contractId: string) {
  return new Account(account.connection, account.accountId);
}

// Vault Contract Interactions
export class VaultContract {
  private account: Account;
  private contractId: string;

  constructor(account: Account, contractId: string = CONTRACT_ADDRESSES.VAULT) {
    this.account = account;
    this.contractId = contractId;
  }

  // Get vault configuration
  async getConfig() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_config',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting vault config:', error);
      throw error;
    }
  }

  // Get total supply
  async getTotalSupply() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_total_supply',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  // Get token reserves
  async getTokenReserves() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_token_reserves',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting token reserves:', error);
      throw error;
    }
  }

  // Get user vault shares
  async getUserVaultShares(accountId: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_user_vault_shares',
        args: { account_id: accountId }
      });
      return result;
    } catch (error) {
      console.error('Error getting user vault shares:', error);
      throw error;
    }
  }

  // Deposit tokens
  async deposit(tokenType: 'WNEAR' | 'USDC' | 'USDT', amount: string) {
    try {
      const result = await this.account.functionCall({
        contractId: this.contractId,
        methodName: 'deposit',
        args: { token_type: tokenType, amount: amount },
        attachedDeposit: amount, // Attach NEAR if tokenType is WNEAR
      });
      return result;
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  }

  // Withdraw tokens
  async withdraw(tokenType: 'WNEAR' | 'USDC' | 'USDT', amount: string) {
    try {
      const result = await this.account.functionCall({
        contractId: this.contractId,
        methodName: 'withdraw',
        args: { token_type: tokenType, amount: amount }
      });
      return result;
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  }

  // Get deposit events
  async getDepositEvents(accountId?: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_deposit_events',
        args: accountId ? { account_id: accountId } : {}
      });
      return result;
    } catch (error) {
      console.error('Error getting deposit events:', error);
      throw error;
    }
  }

  // Get withdrawal events
  async getWithdrawEvents(accountId?: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_withdraw_events',
        args: accountId ? { account_id: accountId } : {}
      });
      return result;
    } catch (error) {
      console.error('Error getting withdrawal events:', error);
      throw error;
    }
  }
}

// Registry Contract Interactions
export class RegistryContract {
  private account: Account;
  private contractId: string;

  constructor(account: Account, contractId: string = CONTRACT_ADDRESSES.REGISTRY) {
    this.account = account;
    this.contractId = contractId;
  }

  // Get all opportunities
  async getOpportunities(limit?: number, offset?: number) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_opportunities',
        args: { limit: limit || 10, offset: offset || 0 }
      });
      return result;
    } catch (error) {
      console.error('Error getting opportunities:', error);
      throw error;
    }
  }

  // Get specific opportunity
  async getOpportunity(opportunityId: number) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_opportunity',
        args: { opportunity_id: opportunityId }
      });
      return result;
    } catch (error) {
      console.error('Error getting opportunity:', error);
      throw error;
    }
  }

  // Get total opportunities count
  async getTotalOpportunities() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_total_opportunities',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting total opportunities:', error);
      throw error;
    }
  }

  // Get active opportunities count
  async getActiveOpportunitiesCount() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_active_opportunities_count',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting active opportunities count:', error);
      throw error;
    }
  }

  // Add new opportunity (admin only)
  async addOpportunity(opportunity: any) {
    try {
      const result = await this.account.functionCall({
        contractId: this.contractId,
        methodName: 'add_opportunity',
        args: opportunity
      });
      return result;
    } catch (error) {
      console.error('Error adding opportunity:', error);
      throw error;
    }
  }
}

// Opportunity Contract Interactions
export class OpportunityContract {
  private account: Account;
  private contractId: string;

  constructor(account: Account, contractId: string) {
    this.account = account;
    this.contractId = contractId;
  }

  // Get opportunity configuration
  async getConfig() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_config',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting opportunity config:', error);
      throw error;
    }
  }

  // Get total allocated amount
  async getTotalAllocated() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_total_allocated',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting total allocated:', error);
      throw error;
    }
  }

  // Get available capacity
  async getAvailableCapacity() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_available_capacity',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting available capacity:', error);
      throw error;
    }
  }

  // Get user allocation
  async getAllocation(accountId: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_allocation',
        args: { account_id: accountId }
      });
      return result;
    } catch (error) {
      console.error('Error getting allocation:', error);
      throw error;
    }
  }

  // Get total participants
  async getTotalParticipants() {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_total_participants',
        args: {}
      });
      return result;
    } catch (error) {
      console.error('Error getting total participants:', error);
      throw error;
    }
  }

  // Allocate funds to opportunity
  async allocate(amount: string) {
    try {
      const result = await this.account.functionCall({
        contractId: this.contractId,
        methodName: 'allocate',
        args: { amount: amount },
        attachedDeposit: amount, // Attach NEAR
      });
      return result;
    } catch (error) {
      console.error('Error allocating:', error);
      throw error;
    }
  }

  // Withdraw from opportunity
  async withdraw(amount: string) {
    try {
      const result = await this.account.functionCall({
        contractId: this.contractId,
        methodName: 'withdraw',
        args: { amount: amount }
      });
      return result;
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  }

  // Get allocation events
  async getAllocationEvents(accountId?: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_allocation_events',
        args: accountId ? { account_id: accountId } : {}
      });
      return result;
    } catch (error) {
      console.error('Error getting allocation events:', error);
      throw error;
    }
  }

  // Get withdrawal events
  async getWithdrawalEvents(accountId?: string) {
    try {
      const result = await this.account.viewFunction({
        contractId: this.contractId,
        methodName: 'get_withdrawal_events',
        args: accountId ? { account_id: accountId } : {}
      });
      return result;
    } catch (error) {
      console.error('Error getting withdrawal events:', error);
      throw error;
    }
  }
}

// Utility functions
export function parseNearAmount(amount: string): string {
  // Convert human-readable amount to yoctoNEAR
  const nearAmount = parseFloat(amount);
  return (nearAmount * 1e24).toString();
}

export function formatNearAmount(amount: string): string {
  // Convert yoctoNEAR to human-readable amount
  const yoctoAmount = BigInt(amount);
  const nearAmount = Number(yoctoAmount) / 1e24;
  return nearAmount.toFixed(4);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
