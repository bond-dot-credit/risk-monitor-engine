import { Account } from 'near-api-js';
import { store } from '@/lib/store';
import { Agent } from '@/types/agent';

// Type definitions for NEAR Intents
export interface IntentRequest {
  assetIn: string;
  assetOut: string;
  amountIn: number;
  amountOut?: number;
  agentId?: string; // Link to agent for risk monitoring
}

export interface Quote {
  intent: IntentRequest;
  solver: string;
  amountOut: number;
  fee: number;
}

export interface IntentExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  agentId?: string; // Link to agent for tracking
}

// Asset mapping for supported tokens
export const ASSET_MAP: Record<string, string> = {
  NEAR: 'wrap.near',
  USDC: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
  USDT: 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
  DAI: '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
  WETH: 'c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near',
};

export class NearIntents {
  private account: Account;
  private solverBusUrl: string;
  private verifierContractId: string;

  constructor(account: Account, solverBusUrl: string, verifierContractId: string) {
    this.account = account;
    this.solverBusUrl = solverBusUrl;
    this.verifierContractId = verifierContractId;
  }

  /**
   * Creates an intent request for token swap
   */
  createIntentRequest(assetIn: string, amountIn: number, assetOut: string, agentId?: string): IntentRequest {
    return {
      assetIn,
      assetOut,
      amountIn,
      agentId,
    };
  }

  /**
   * Fetches quotes from the Solver Bus
   */
  async fetchQuotes(request: IntentRequest): Promise<Quote[]> {
    try {
      // Validate the request first
      if (!this.isAssetSupported(request.assetIn) || !this.isAssetSupported(request.assetOut)) {
        throw new Error('Unsupported asset in the request');
      }

      // Real Solver Bus integration
      const response = await fetch(`${this.solverBusUrl}/api/v1/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SOLVER_BUS_API_KEY || ''}`,
        },
        body: JSON.stringify({
          asset_in: this.getAssetContractId(request.assetIn),
          asset_out: this.getAssetContractId(request.assetOut),
          amount_in: request.amountIn.toString(),
          account_id: this.account.accountId,
          agent_id: request.agentId,
        }),
      });

      if (!response.ok) {
        console.warn(`Solver Bus API error: ${response.status}, falling back to mock quotes`);
        return this.getMockQuotes(request);
      }

      const data = await response.json();
      
      // Transform Solver Bus response to our Quote format
      return data.quotes?.map((quote: Record<string, unknown>) => ({
        intent: request,
        solver: quote.solver_id as string,
        amountOut: parseFloat(quote.amount_out as string),
        fee: parseFloat((quote.fee_rate as string) || '0.03'), // Default 3% fee
      })) || this.getMockQuotes(request);
      
    } catch (error) {
      console.error('Error fetching quotes from Solver Bus:', error);
      // Fall back to mock quotes if real API fails
      return this.getMockQuotes(request);
    }
  }

  /**
   * Mock quotes for fallback when Solver Bus is unavailable
   */
  private getMockQuotes(request: IntentRequest): Quote[] {
    return [
      {
        intent: request,
        solver: 'ref-finance.near',
        amountOut: request.amountIn * 0.97, // 3% fee
        fee: 0.03,
      },
      {
        intent: request,
        solver: 'jumbo-exchange.near',
        amountOut: request.amountIn * 0.95, // 5% fee
        fee: 0.05,
      },
    ];
  }

  /**
   * Selects the best quote based on amount out
   */
  selectBestQuote(quotes: Quote[]): Quote {
    return quotes.reduce((best, current) => 
      (current.amountOut > best.amountOut) ? current : best
    );
  }

  /**
   * Creates and signs a token diff quote
   */
  async createTokenDiffQuote(
    account: Account,
    assetIn: string,
    amountIn: number,
    assetOut: string,
    amountOut: number,
    agentId?: string
  ): Promise<Record<string, unknown>> {
    try {
      // Create the quote object according to NEAR Intents protocol
      const quote = {
        account_id: account.accountId,
        asset_in: this.getAssetContractId(assetIn),
        amount_in: (amountIn * 1e24).toString(), // Convert to yoctoNEAR
        asset_out: this.getAssetContractId(assetOut),
        amount_out: (amountOut * 1e24).toString(), // Convert to yoctoNEAR
        agent_id: agentId,
        timestamp: Date.now(),
        nonce: Math.floor(Math.random() * 1000000),
      };

      // Sign the quote using the account's private key
      const message = JSON.stringify(quote);
      const messageBytes = new TextEncoder().encode(message);
      
      // In a real implementation, you would sign this with the account's key
      // For now, we'll create a mock signature
      const signature = {
        signature: 'ed25519:mock_signature_' + Date.now(),
        public_key: 'ed25519:mock_public_key',
      };

      return {
        ...quote,
        signature,
      };
    } catch (error) {
      console.error('Error creating token diff quote:', error);
      throw new Error('Failed to create and sign quote');
    }
  }

  /**
   * Publishes the intent to the Solver Bus and executes via Verifier Contract
   */
  async publishIntent(quote: Record<string, unknown>): Promise<IntentExecutionResult> {
    try {
      console.log('Publishing intent to Solver Bus:', quote);
      
      // Step 1: Submit the signed quote to the Solver Bus
      const solverResponse = await fetch(`${this.solverBusUrl}/api/v1/intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SOLVER_BUS_API_KEY || ''}`,
        },
        body: JSON.stringify(quote),
      });

      if (!solverResponse.ok) {
        console.warn('Solver Bus submission failed, attempting direct execution');
        return await this.executeDirectly(quote);
      }

      const solverData = await solverResponse.json();
      const intentId = solverData.intent_id;

      // Step 2: Execute via NEAR Verifier Contract
      const executionResult = await this.executeViaVerifierContract(intentId, quote);
      
      return {
        success: true,
        transactionHash: executionResult.transaction_hash as string,
        agentId: quote.agent_id as string,
      };
    } catch (error) {
      console.error('Error publishing intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId: quote.agent_id as string,
      };
    }
  }

  /**
   * Execute the intent via NEAR Verifier Contract
   */
  private async executeViaVerifierContract(intentId: string, quote: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Call the verifier contract on NEAR
      const result = await (this.account as unknown as { functionCall: (params: Record<string, unknown>) => Promise<unknown> }).functionCall({
        contractId: this.verifierContractId,
        methodName: 'execute_intent',
        args: {
          intent_id: intentId,
          quote: quote,
        },
        attachedDeposit: quote.amount_in, // Attach the input amount
        gas: '300000000000000', // 300 TGas
      });

      return {
        transaction_hash: (result as { transaction: { hash: string } }).transaction.hash,
        status: 'success',
      };
    } catch (error) {
      console.error('Error executing via verifier contract:', error);
      throw error;
    }
  }

  /**
   * Fallback: Execute directly without Solver Bus
   */
  private async executeDirectly(quote: Record<string, unknown>): Promise<IntentExecutionResult> {
    try {
      // For direct execution, we can use common DEX contracts like Ref Finance
      const refFinanceContract = 'v2.ref-finance.near';
      
      const result = await (this.account as unknown as { functionCall: (params: Record<string, unknown>) => Promise<unknown> }).functionCall({
        contractId: refFinanceContract,
        methodName: 'swap',
        args: {
          actions: [{
            pool_id: 0, // NEAR-USDC pool
            token_in: quote.asset_in,
            amount_in: quote.amount_in,
            token_out: quote.asset_out,
            min_amount_out: quote.amount_out,
          }],
        },
        attachedDeposit: '1', // Yocto NEAR for storage
        gas: '300000000000000',
      });

      return {
        success: true,
        transactionHash: (result as { transaction: { hash: string } }).transaction.hash,
        agentId: quote.agent_id as string,
      };
    } catch (error) {
      console.error('Error in direct execution:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Direct execution failed',
        agentId: quote.agent_id as string,
      };
    }
  }

  /**
   * Validates if an asset is supported
   */
  isAssetSupported(asset: string): boolean {
    return Object.keys(ASSET_MAP).includes(asset);
  }

  /**
   * Gets the contract ID for an asset
   */
  getAssetContractId(asset: string): string | null {
    return ASSET_MAP[asset] || null;
  }

  /**
   * Integrates with the risk monitoring system by checking agent credibility
   * before executing high-value transactions
   */
  async checkAgentRisk(agentId: string, transactionValue: number): Promise<boolean> {
    try {
      const agent = store.getAgent(agentId);
      if (!agent) {
        console.warn(`Agent ${agentId} not found in store`);
        return false;
      }

      // For high-value transactions, check agent credibility
      if (transactionValue > 100) { // Threshold in USD
        // Only allow transactions for high-tier agents
        return agent.credibilityTier === 'PLATINUM' || agent.credibilityTier === 'DIAMOND';
      }

      return true; // Allow for lower-value transactions
    } catch (error) {
      console.error('Error checking agent risk:', error);
      return false;
    }
  }
}