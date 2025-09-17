import { NearIntents, ASSET_MAP } from '../lib/near-intents/near-intents';
import { AIAgent } from '../lib/near-intents/ai-agent';
import { store } from '../lib/store';
import { Agent, CredibilityTier } from '../types/agent';

// Mock Account class
class MockAccount {
  accountId: string;
  
  constructor(accountId: string) {
    this.accountId = accountId;
  }
  
  state() {
    return Promise.resolve({
      amount: '1000000000000000000000000000', // 1000 NEAR in yoctoNEAR
      storage_usage: 1000,
    });
  }
}

// Mock agent data
const mockAgent: Agent = {
  id: 'agent_1',
  name: 'Test Agent',
  operator: 'test-operator',
  metadata: {
    category: 'defi',
    description: 'Test agent for NEAR Intents integration',
    version: '1.0.0',
    tags: ['defi', 'trading']
  },
  score: {
    overall: 85,
    provenance: 90,
    performance: 80,
    perception: 85
  },
  credibilityTier: CredibilityTier.PLATINUM,
  status: 'active',
  verification: 'verified',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('NEAR Intents Integration', () => {
  let nearIntents: NearIntents;
  let mockAccount: Record<string, unknown>;

  beforeEach(() => {
    mockAccount = new MockAccount('test-account.near');
    nearIntents = new NearIntents(
      mockAccount as Record<string, unknown>,
      'https://solver-bus.near.org',
      'intents.verifier.near'
    );
    
    // Add mock agent to store
    (store as Record<string, unknown>).agents = new Map();
    (store as Record<string, unknown>).agents.set('agent_1', mockAgent);
  });

  describe('NearIntents', () => {
    it('should create an intent request with agent ID', () => {
      const request = nearIntents.createIntentRequest('NEAR', 1.0, 'USDC', 'agent_1');
      expect(request).toEqual({
        assetIn: 'NEAR',
        assetOut: 'USDC',
        amountIn: 1.0,
        agentId: 'agent_1',
      });
    });

    it('should fetch quotes', async () => {
      const request = nearIntents.createIntentRequest('NEAR', 1.0, 'USDC', 'agent_1');
      const quotes = await nearIntents.fetchQuotes(request);
      
      expect(quotes).toHaveLength(2);
      expect(quotes[0].intent).toEqual(request);
      expect(quotes[1].intent).toEqual(request);
    });

    it('should select the best quote', () => {
      const quotes = [
        {
          intent: nearIntents.createIntentRequest('NEAR', 1.0, 'USDC', 'agent_1'),
          solver: 'solver1.near',
          amountOut: 0.95,
          fee: 0.05,
        },
        {
          intent: nearIntents.createIntentRequest('NEAR', 1.0, 'USDC', 'agent_1'),
          solver: 'solver2.near',
          amountOut: 0.97,
          fee: 0.03,
        },
      ];
      
      const bestQuote = nearIntents.selectBestQuote(quotes);
      expect(bestQuote.amountOut).toBe(0.97);
    });

    it('should validate supported assets', () => {
      expect(nearIntents.isAssetSupported('NEAR')).toBe(true);
      expect(nearIntents.isAssetSupported('USDC')).toBe(true);
      expect(nearIntents.isAssetSupported('ETH')).toBe(false);
    });

    it('should get asset contract IDs', () => {
      expect(nearIntents.getAssetContractId('NEAR')).toBe('near');
      expect(nearIntents.getAssetContractId('USDC')).toBe('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near');
      expect(nearIntents.getAssetContractId('ETH')).toBeNull();
    });

    it('should check agent risk for high-value transactions', async () => {
      // High-value transaction for Platinum agent should be allowed
      const result1 = await nearIntents.checkAgentRisk('agent_1', 150);
      expect(result1).toBe(true);
      
      // Low-value transaction should be allowed for any agent
      const result2 = await nearIntents.checkAgentRisk('agent_1', 50);
      expect(result2).toBe(true);
    });

    it('should publish intent with agent ID', async () => {
      const quote = {
        account_id: 'test-account.near',
        asset_in: 'NEAR',
        amount_in: 1.0,
        asset_out: 'USDC',
        amount_out: 0.97,
        agent_id: 'agent_1',
        timestamp: Date.now(),
      };
      
      const result = await nearIntents.publishIntent(quote);
      expect(result.success).toBe(true);
      expect(result.agentId).toBe('agent_1');
    });
  });

  describe('AIAgent', () => {
    it('should initialize correctly', () => {
      const agent = new AIAgent({
        accountId: 'test-account.near',
        privateKey: 'ed25519:test-key',
      });
      
      expect(agent).toBeInstanceOf(AIAgent);
    });

    it('should get agent info from store', async () => {
      const agent = new AIAgent({
        accountId: 'test-account.near',
        privateKey: 'ed25519:test-key',
      });
      
      const agentInfo = await (agent as Record<string, unknown>).getAgentInfo('agent_1');
      expect(agentInfo).toBeDefined();
      expect(agentInfo?.id).toBe('agent_1');
    });
  });
});