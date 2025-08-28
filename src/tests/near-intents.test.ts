import { NearIntents, ASSET_MAP } from '../lib/near-intents/near-intents';
import { AIAgent } from '../lib/near-intents/ai-agent';

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

describe('NEAR Intents Integration', () => {
  let nearIntents: NearIntents;
  let mockAccount: any;

  beforeEach(() => {
    mockAccount = new MockAccount('test-account.near');
    nearIntents = new NearIntents(
      mockAccount as any,
      'https://solver-bus.near.org',
      'intents.verifier.near'
    );
  });

  describe('NearIntents', () => {
    it('should create an intent request', () => {
      const request = nearIntents.createIntentRequest('NEAR', 1.0, 'USDC');
      expect(request).toEqual({
        assetIn: 'NEAR',
        assetOut: 'USDC',
        amountIn: 1.0,
      });
    });

    it('should fetch quotes', async () => {
      const request = nearIntents.createIntentRequest('NEAR', 1.0, 'USDC');
      const quotes = await nearIntents.fetchQuotes(request);
      
      expect(quotes).toHaveLength(2);
      expect(quotes[0].intent).toEqual(request);
      expect(quotes[1].intent).toEqual(request);
    });

    it('should select the best quote', () => {
      const quotes = [
        {
          intent: nearIntents.createIntentRequest('NEAR', 1.0, 'USDC'),
          solver: 'solver1.near',
          amountOut: 0.95,
          fee: 0.05,
        },
        {
          intent: nearIntents.createIntentRequest('NEAR', 1.0, 'USDC'),
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
  });

  describe('AIAgent', () => {
    it('should initialize correctly', () => {
      const agent = new AIAgent({
        accountId: 'test-account.near',
        privateKey: 'ed25519:test-key',
      });
      
      expect(agent).toBeInstanceOf(AIAgent);
    });
  });
});