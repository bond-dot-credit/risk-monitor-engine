import { Account, connect, KeyPair, keyStores, Near } from 'near-api-js';
import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { NearIntents, IntentRequest, Quote, IntentExecutionResult } from './near-intents';
import { store } from '@/lib/store';
import { Agent } from '@/types/agent';
import { nearIntentsConfig } from './config';

export interface NearAccountConfig {
  accountId: string;
  privateKey: string;
  networkId?: string;
  nodeUrl?: string;
}

export class AIAgent {
  private account: Account | null = null;
  private nearIntents: NearIntents | null = null;
  private intentsContractId: string;
  private config: NearAccountConfig;

  constructor(accountConfig: NearAccountConfig) {
    this.config = accountConfig;
    this.intentsContractId = process.env.NEAR_INTENTS_CONTRACT_ID || 'intents.near';
  }

  /**
   * Initializes the NEAR connection and account
   */
  async initialize(): Promise<void> {
    try {
      const networkId = this.config.networkId || 'mainnet';
      
      // Use the configured node URL to avoid rate limiting
      const nodeUrl = this.config.nodeUrl || nearIntentsConfig.getConfig().nodeUrl || this.getDefaultNodeUrl(networkId);

      // Create key store
      const keyStore = new InMemoryKeyStore();
      const keyPair = KeyPair.fromString(this.config.privateKey);
      await keyStore.setKey(networkId, this.config.accountId, keyPair);

      // Create provider and signer
      const provider = new JsonRpcProvider({ url: nodeUrl });
      const signer = new KeyPairSigner(keyPair);

      // Create account instance
      this.account = new Account(this.config.accountId, provider, signer);
      
      // Verify account exists
      await this.account.state();
      
      // Initialize the NEAR Intents library
      this.nearIntents = new NearIntents(
        this.account,
        process.env.SOLVER_BUS_URL || 'https://solver-bus.near.org',
        process.env.VERIFIER_CONTRACT_ID || 'intents.verifier.near'
      );
      
      console.log(`Successfully initialized AIAgent for account: ${this.config.accountId}`);
    } catch (error) {
      console.error('Error initializing NEAR connection:', error);
      throw new Error(`Failed to initialize NEAR connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default node URL based on network
   */
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

  /**
   * Get wallet URL based on network
   */
  private getWalletUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://wallet.near.org';
      case 'testnet':
        return 'https://wallet.testnet.near.org';
      default:
        return 'https://wallet.testnet.near.org';
    }
  }

  /**
   * Get helper URL based on network
   */
  private getHelperUrl(networkId: string): string {
    switch (networkId) {
      case 'mainnet':
        return 'https://helper.mainnet.near.org';
      case 'testnet':
        return 'https://helper.testnet.near.org';
      default:
        return 'https://helper.testnet.near.org';
    }
  }

  /**
   * Deposits NEAR tokens for intent operations
   */
  async depositNear(amount: number, agentId?: string): Promise<boolean> {
    try {
      if (!this.account) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      console.log(`Depositing ${amount} NEAR to intents contract for agent ${agentId || 'unknown'}`);
      
      // Convert amount to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
      const yoctoAmount = (amount * 1e24).toString();
      
      // Call the deposit function on the intents contract
      const result = await (this.account as any).functionCall({
        contractId: this.intentsContractId,
        methodName: 'deposit',
        args: {
          agent_id: agentId,
        },
        attachedDeposit: yoctoAmount,
        gas: '300000000000000', // 300 TGas
      });
      
      console.log(`Deposit successful. Transaction hash: ${result.transaction.hash}`);
      return true;
    } catch (error) {
      console.error('Error depositing NEAR:', error);
      return false;
    }
  }

  /**
   * Swaps NEAR to a specified token using the intent system
   */
  async swapNearToToken(targetToken: string, amount: number, agentId?: string): Promise<IntentExecutionResult> {
    try {
      if (!this.account || !this.nearIntents) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      // Validate inputs
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      if (!this.nearIntents.isAssetSupported(targetToken)) {
        throw new Error(`Unsupported target token: ${targetToken}`);
      }
      
      // Check account balance
      const balance = await (this.account as any).getAccountBalance();
      const availableNear = parseFloat(balance.available) / 1e24;
      
      if (availableNear < amount) {
        throw new Error(`Insufficient balance. Available: ${availableNear} NEAR, Required: ${amount} NEAR`);
      }
      
      // Check if the agent has sufficient credibility for this transaction
      if (agentId) {
        const canProceed = await this.nearIntents.checkAgentRisk(agentId, amount);
        if (!canProceed) {
          return {
            success: false,
            error: 'Agent does not have sufficient credibility for this transaction',
            agentId,
          };
        }
      }
      
      console.log(`Swapping ${amount} NEAR to ${targetToken} for agent ${agentId || 'unknown'}`);
      
      // 1. Create intent request
      const request: IntentRequest = this.nearIntents.createIntentRequest('NEAR', amount, targetToken, agentId);
      
      // 2. Fetch quotes from Solver Bus
      const quotes: Quote[] = await this.nearIntents.fetchQuotes(request);
      
      if (quotes.length === 0) {
        throw new Error('No quotes available for this swap');
      }
      
      // 3. Select best quote
      const bestQuote: Quote = this.nearIntents.selectBestQuote(quotes);
      
      console.log(`Best quote: ${bestQuote.amountOut} ${targetToken} from solver ${bestQuote.solver}`);
      
      // 4. Create and sign quote
      const signedQuote = await this.nearIntents.createTokenDiffQuote(
        this.account,
        'NEAR',
        amount,
        targetToken,
        bestQuote.amountOut,
        agentId
      );
      
      // 5. Submit to Solver Bus and execute
      const result: IntentExecutionResult = await this.nearIntents.publishIntent(signedQuote);
      
      if (result.success) {
        console.log(`Swap completed successfully! Transaction hash: ${result.transactionHash}`);
      } else {
        console.error(`Swap failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId,
      };
    }
  }

  /**
   * Gets the account state/balance with comprehensive information
   */
  async getAccountState(): Promise<any> {
    try {
      if (!this.account) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      const [state, balance] = await Promise.all([
        this.account.state(),
        (this.account as any).getAccountBalance()
      ]);
      
      return {
        ...state,
        balance: {
          total: balance.total,
          available: balance.available,
          staked: balance.staked,
          locked: balance.locked,
        },
        // Convert yoctoNEAR to NEAR for readability
        balanceInNear: {
          total: parseFloat(balance.total) / 1e24,
          available: parseFloat(balance.available) / 1e24,
          staked: parseFloat(balance.staked) / 1e24,
          locked: parseFloat(balance.locked) / 1e24,
        },
      };
    } catch (error) {
      console.error('Error getting account state:', error);
      throw error;
    }
  }

  /**
   * Gets agent information if linked to an agent
   */
  async getAgentInfo(agentId: string): Promise<Agent | undefined> {
    try {
      return store.getAgent(agentId);
    } catch (error) {
      console.error('Error getting agent info:', error);
      return undefined;
    }
  }
}