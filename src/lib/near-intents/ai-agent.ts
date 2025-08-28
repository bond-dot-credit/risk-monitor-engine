import { Account, connect, KeyPair, keyStores, Near } from 'near-api-js';
import { NearIntents, IntentRequest, Quote, IntentExecutionResult } from './near-intents';

export interface NearAccountConfig {
  accountId: string;
  privateKey: string;
  networkId?: string;
  nodeUrl?: string;
}

export class AIAgent {
  private account: Account;
  private nearIntents: NearIntents;
  private intentsContractId: string;
  private near: Near;

  constructor(accountConfig: NearAccountConfig) {
    this.intentsContractId = 'intents.near';
  }

  /**
   * Initializes the NEAR connection and account
   */
  async initialize(accountConfig: NearAccountConfig): Promise<void> {
    try {
      const networkId = accountConfig.networkId || 'mainnet';
      const nodeUrl = accountConfig.nodeUrl || (networkId === 'mainnet' 
        ? 'https://rpc.mainnet.near.org' 
        : 'https://rpc.testnet.near.org');

      // Create key store
      const keyStore = new keyStores.InMemoryKeyStore();
      const keyPair = KeyPair.fromString(accountConfig.privateKey);
      await keyStore.setKey(networkId, accountConfig.accountId, keyPair);

      // Configure NEAR connection
      const config = {
        networkId,
        nodeUrl,
        walletUrl: networkId === 'mainnet' 
          ? 'https://wallet.near.org' 
          : 'https://wallet.testnet.near.org',
        helperUrl: networkId === 'mainnet' 
          ? 'https://helper.mainnet.near.org' 
          : 'https://helper.testnet.near.org',
        keyStore,
      };

      // Connect to NEAR
      this.near = await connect(config);
      this.account = await this.near.account(accountConfig.accountId);
      
      // Initialize the NEAR Intents library
      this.nearIntents = new NearIntents(
        this.account,
        'https://solver-bus.near.org', // Mock Solver Bus URL
        'intents.verifier.near' // Mock Verifier Contract ID
      );
    } catch (error) {
      console.error('Error initializing NEAR connection:', error);
      throw new Error('Failed to initialize NEAR connection');
    }
  }

  /**
   * Deposits NEAR tokens for intent operations
   */
  async depositNear(amount: number): Promise<boolean> {
    try {
      if (!this.account) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      console.log(`Depositing ${amount} NEAR to intents contract`);
      // In a real implementation, this would interact with the NEAR blockchain
      // to deposit tokens to the intents contract
      // Example:
      // await this.account.functionCall({
      //   contractId: this.intentsContractId,
      //   methodName: 'deposit',
      //   args: {},
      //   attachedDeposit: amount.toString(),
      //   gas: '300000000000000'
      // });
      
      return true;
    } catch (error) {
      console.error('Error depositing NEAR:', error);
      return false;
    }
  }

  /**
   * Swaps NEAR to a specified token using the intent system
   */
  async swapNearToToken(targetToken: string, amount: number): Promise<IntentExecutionResult> {
    try {
      if (!this.account || !this.nearIntents) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      console.log(`Swapping ${amount} NEAR to ${targetToken}`);
      
      // 1. Create intent request
      const request: IntentRequest = this.nearIntents.createIntentRequest('NEAR', amount, targetToken);
      
      // 2. Fetch quotes from Solver Bus
      const quotes: Quote[] = await this.nearIntents.fetchQuotes(request);
      
      // 3. Select best quote
      const bestQuote: Quote = this.nearIntents.selectBestQuote(quotes);
      
      // 4. Create and sign quote
      const signedQuote = await this.nearIntents.createTokenDiffQuote(
        this.account,
        'NEAR',
        amount,
        targetToken,
        bestQuote.amountOut
      );
      
      // 5. Submit to Solver Bus
      const result: IntentExecutionResult = await this.nearIntents.publishIntent(signedQuote);
      
      return result;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gets the account state/balance
   */
  async getAccountState(): Promise<any> {
    try {
      if (!this.account) {
        throw new Error('Agent not initialized. Call initialize() first.');
      }
      
      return await this.account.state();
    } catch (error) {
      console.error('Error getting account state:', error);
      throw error;
    }
  }
}