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
  NEAR: 'near',
  USDC: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
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
      // In a real implementation, this would call the Solver Bus API
      // This is a mock implementation for demonstration
      const mockQuotes: Quote[] = [
        {
          intent: request,
          solver: 'solver1.near',
          amountOut: request.amountIn * 0.95, // 5% fee
          fee: 0.05,
        },
        {
          intent: request,
          solver: 'solver2.near',
          amountOut: request.amountIn * 0.97, // 3% fee
          fee: 0.03,
        },
      ];
      return mockQuotes;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw new Error('Failed to fetch quotes from Solver Bus');
    }
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
  ): Promise<any> {
    // In a real implementation, this would create and sign the quote
    // This is a simplified version for demonstration
    return {
      account_id: account.accountId,
      asset_in: assetIn,
      amount_in: amountIn,
      asset_out: assetOut,
      amount_out: amountOut,
      agent_id: agentId,
      timestamp: Date.now(),
    };
  }

  /**
   * Publishes the intent to the Solver Bus
   */
  async publishIntent(quote: any): Promise<IntentExecutionResult> {
    try {
      // In a real implementation, this would publish to the Solver Bus
      // and then interact with the Verifier Contract on NEAR
      console.log('Publishing intent to Solver Bus:', quote);
      
      // Mock successful execution
      return {
        success: true,
        transactionHash: 'mock-transaction-hash-' + Date.now(),
        agentId: quote.agent_id,
      };
    } catch (error) {
      console.error('Error publishing intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId: quote.agent_id,
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