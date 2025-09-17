import { BulkOperationsManager, BulkOperationConfig } from '../lib/near-intents/bulk-operations';

// Mock NearAccountConfig
const mockWallets = [
  {
    accountId: 'wallet1.near',
    privateKey: 'ed25519:test-key-1',
  },
  {
    accountId: 'wallet2.near',
    privateKey: 'ed25519:test-key-2',
  },
  {
    accountId: 'wallet3.near',
    privateKey: 'ed25519:test-key-3',
  },
];

const mockConfig: BulkOperationConfig = {
  wallets: mockWallets,
  transactionsPerWallet: 2,
  tokens: [
    { from: 'NEAR', to: 'USDC' },
    { from: 'USDC', to: 'NEAR' },
  ],
  amountRange: { min: 1, max: 10 },
  delayBetweenTransactions: 10,
};

describe('NEAR Intents Bulk Operations', () => {
  let bulkManager: BulkOperationsManager;

  beforeEach(() => {
    bulkManager = new BulkOperationsManager();
  });

  describe('BulkOperationsManager', () => {
    it('should initialize agents for all wallets', async () => {
      await bulkManager.initializeAgents(mockWallets);
      
      // Check that agents were initialized
      expect((bulkManager as Record<string, unknown>).agents.size).toBe(mockWallets.length);
      
      // Check that each wallet has an agent
      for (const wallet of mockWallets) {
        expect((bulkManager as Record<string, unknown>).agents.has(wallet.accountId)).toBe(true);
      }
    });

    it('should execute bulk swaps', async () => {
      const result = await bulkManager.executeBulkSwaps(mockConfig);
      
      // Check result structure
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('successfulTransactions');
      expect(result).toHaveProperty('failedTransactions');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('errors');
      
      // Check calculated values
      expect(result.totalTransactions).toBe(mockWallets.length * mockConfig.transactionsPerWallet);
      expect(result.results).toHaveLength(mockWallets.length * mockConfig.transactionsPerWallet);
      expect(result.successfulTransactions + result.failedTransactions).toBe(result.totalTransactions);
    });

    it('should execute high-volume transactions', async () => {
      // Create a config with more wallets to trigger high-volume processing
      const highVolumeConfig: BulkOperationConfig = {
        ...mockConfig,
        wallets: [...mockWallets, ...mockWallets, ...mockWallets, ...mockWallets], // 12 wallets
        transactionsPerWallet: 5, // 60 total transactions
      };
      
      const result = await bulkManager.executeHighVolumeTransactions(highVolumeConfig);
      
      // Check result structure
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('successfulTransactions');
      expect(result).toHaveProperty('failedTransactions');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('errors');
      
      // Check calculated values
      expect(result.totalTransactions).toBe(highVolumeConfig.wallets.length * highVolumeConfig.transactionsPerWallet);
      expect(result.successfulTransactions + result.failedTransactions).toBe(result.totalTransactions);
    });

    it('should handle errors gracefully', async () => {
      // Create a config with an invalid wallet to test error handling
      const errorConfig: BulkOperationConfig = {
        ...mockConfig,
        wallets: [
          ...mockWallets,
          {
            accountId: 'invalid-wallet.near',
            privateKey: 'invalid-key',
          },
        ],
      };
      
      const result = await bulkManager.executeBulkSwaps(errorConfig);
      
      // Should still return a result even with errors
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('errors');
    });
  });
});