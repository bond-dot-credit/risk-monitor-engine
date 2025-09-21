/**
 * Transaction Service
 * Handles all blockchain transactions with proper error handling and user feedback
 */

import { Account, connect, keyStores, utils } from 'near-api-js';

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  latency?: number;
}

export interface TransactionOptions {
  gas?: string;
  deposit?: string;
  timeout?: number;
}

export class TransactionService {
  private connection: any = null;

  constructor() {
    // Initialize connection in the constructor
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    const config = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    };

    try {
      this.connection = await connect(config);
    } catch (error) {
      console.error('Failed to initialize NEAR connection:', error);
    }
  }

  /**
   * Execute a contract method call with proper error handling
   */
  async callContract(
    accountId: string,
    contractId: string,
    methodName: string,
    args: any = {},
    options: TransactionOptions = {}
  ): Promise<TransactionResult> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        await this.initializeConnection();
      }

      const account = await this.connection.account(accountId);
      
      // Prepare transaction parameters
      const gas = options.gas || '300000000000000'; // 300 TGas
      const deposit = options.deposit || '0';

      // Execute the contract call
      const result = await account.functionCall({
        contractId,
        methodName,
        args,
        gas,
        attachedDeposit: deposit
      });

      const latency = Date.now() - startTime;

      return {
        success: true,
        txHash: result.transaction.hash,
        gasUsed: gas,
        latency
      };

    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.type) {
        errorMessage = `Transaction failed: ${error.type}`;
      }

      return {
        success: false,
        error: errorMessage,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Deposit tokens to vault
   */
  async depositToVault(
    accountId: string,
    tokenType: 'WNEAR' | 'USDC',
    amount: string
  ): Promise<TransactionResult> {
    const contractId = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || 'vault-contract-v0.testnet';
    
    try {
      // Parse amount to yoctoNEAR for WNEAR
      const depositAmount = tokenType === 'WNEAR' 
        ? utils.format.parseNearAmount(amount)
        : amount; // For USDC, amount might be in different format

      return await this.callContract(
        accountId,
        contractId,
        'deposit',
        {
          token_type: tokenType,
          amount: depositAmount
        },
        {
          gas: '300000000000000',
          deposit: tokenType === 'WNEAR' ? depositAmount : '0'
        }
      );

    } catch (error: any) {
      return {
        success: false,
        error: `Deposit failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Withdraw tokens from vault
   */
  async withdrawFromVault(
    accountId: string,
    tokenType: 'WNEAR' | 'USDC',
    shares: string
  ): Promise<TransactionResult> {
    const contractId = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || 'vault-contract-v0.testnet';
    
    try {
      return await this.callContract(
        accountId,
        contractId,
        'withdraw',
        {
          token_type: tokenType,
          shares: shares
        },
        {
          gas: '300000000000000'
        }
      );

    } catch (error: any) {
      return {
        success: false,
        error: `Withdrawal failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Allocate funds to an opportunity
   */
  async allocateToOpportunity(
    accountId: string,
    opportunityContractId: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const depositAmount = utils.format.parseNearAmount(amount);

      return await this.callContract(
        accountId,
        opportunityContractId,
        'allocate',
        {
          amount: depositAmount
        },
        {
          gas: '300000000000000',
          deposit: depositAmount
        }
      );

    } catch (error: any) {
      return {
        success: false,
        error: `Allocation failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Withdraw from an opportunity
   */
  async withdrawFromOpportunity(
    accountId: string,
    opportunityContractId: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const withdrawalAmount = utils.format.parseNearAmount(amount);

      return await this.callContract(
        accountId,
        opportunityContractId,
        'withdraw',
        {
          amount: withdrawalAmount
        },
        {
          gas: '300000000000000'
        }
      );

    } catch (error: any) {
      return {
        success: false,
        error: `Opportunity withdrawal failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'success' | 'failure';
    receipt?: any;
    error?: string;
  }> {
    try {
      if (!this.connection) {
        await this.initializeConnection();
      }

      const result = await this.connection.provider.txStatus(txHash, '');
      
      if (result.status?.SuccessValue) {
        return { status: 'success', receipt: result };
      } else if (result.status?.Failure) {
        return { status: 'failure', error: result.status.Failure };
      } else {
        return { status: 'pending' };
      }

    } catch (error: any) {
      return {
        status: 'failure',
        error: error.message || 'Failed to check transaction status'
      };
    }
  }

  /**
   * Wait for transaction completion
   */
  async waitForTransaction(
    txHash: string,
    timeout: number = 60000
  ): Promise<TransactionResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.getTransactionStatus(txHash);
      
      if (status.status === 'success') {
        return {
          success: true,
          txHash
        };
      } else if (status.status === 'failure') {
        return {
          success: false,
          error: status.error || 'Transaction failed'
        };
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return {
      success: false,
      error: 'Transaction timeout'
    };
  }
}

// Export singleton instance
export const transactionService = new TransactionService();