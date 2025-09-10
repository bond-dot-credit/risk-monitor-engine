import { NextRequest, NextResponse } from 'next/server';
import { BulkOperationsManager, BulkOperationConfig, nearIntentsConfig } from '@/lib/near-intents';
import { deriveMultipleWallets } from '@/lib/near-intents/wallet-integration';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { action, config, agentId, useHdWallets = false, walletCount = 100 } = body;

    // Validate NEAR configuration first
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Configuration errors: ${configValidation.errors.join(', ')}`,
          configRequired: true 
        },
        { status: 400 }
      );
    }

    switch (action) {
      case 'executeBulkSwaps':
        // If useHdWallets is true, derive wallets from the seed phrase
        if (useHdWallets) {
          console.log(`Deriving ${walletCount} wallets from seed phrase for bulk operations...`);
          const derivedWallets = await deriveMultipleWallets(
            nearIntentsConfig.getConfig().networkId, 
            walletCount
          );
          
          // Update config with derived wallets
          config.wallets = derivedWallets.map(wallet => ({
            accountId: wallet.accountId,
            privateKey: wallet.privateKey,
            networkId: nearIntentsConfig.getConfig().networkId,
            nodeUrl: nearIntentsConfig.getConfig().nodeUrl,
          }));
        }

        if (!config) {
          return NextResponse.json(
            { success: false, error: 'Missing config parameter' },
            { status: 400 }
          );
        }

        // Validate config structure
        const validationResult = validateBulkConfig(config);
        if (!validationResult.valid) {
          return NextResponse.json(
            { success: false, error: validationResult.error },
            { status: 400 }
          );
        }

        // Check if all wallets have valid configuration
        const accountConfig = nearIntentsConfig.getAccountConfig();
        if (!config.wallets || config.wallets.length === 0) {
          // Use the default account from configuration if no wallets specified
          config.wallets = [accountConfig];
        }

        // Validate wallet configurations
        for (const wallet of config.wallets) {
          if (!wallet.accountId || !wallet.privateKey) {
            return NextResponse.json(
              { success: false, error: `Invalid wallet configuration: missing accountId or privateKey` },
              { status: 400 }
            );
          }
        }

        // For high-volume operations (10k+ transactions), use the high-volume processor
        const totalTransactions = config.wallets.length * config.transactionsPerWallet;
        const useHighVolumeProcessor = totalTransactions >= 10000;

        // Add safety limits for real operations
        if (totalTransactions > 100000) {
          return NextResponse.json(
            { success: false, error: 'Transaction limit exceeded. Maximum 100,000 transactions per request.' },
            { status: 400 }
          );
        }

        if (config.transactionsPerWallet > 1000) {
          return NextResponse.json(
            { success: false, error: 'Transactions per wallet limit exceeded. Maximum 1,000 transactions per wallet.' },
            { status: 400 }
          );
        }

        const bulkManager = new BulkOperationsManager();
        
        try {
          let result;
          if (useHighVolumeProcessor) {
            console.log(`Executing high-volume bulk operation: ${totalTransactions} transactions`);
            result = await bulkManager.executeHighVolumeTransactions({
              ...config,
              agentId: agentId || undefined
            });
          } else {
            console.log(`Executing standard bulk operation: ${totalTransactions} transactions`);
            result = await bulkManager.executeBulkSwaps({
              ...config,
              agentId: agentId || undefined
            });
          }

          return NextResponse.json({
            success: true,
            data: {
              ...result,
              useHighVolumeProcessor,
              networkId: nearIntentsConfig.getConfig().networkId,
              executionTime: new Date().toISOString()
            }
          });
        } catch (executionError) {
          console.error('Bulk operation execution error:', executionError);
          return NextResponse.json(
            { 
              success: false, 
              error: `Bulk operation failed: ${executionError instanceof Error ? executionError.message : 'Unknown error'}` 
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: executeBulkSwaps' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('NEAR Intents Bulk API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate bulk operation configuration
 */
function validateBulkConfig(config: any): { valid: boolean; error?: string } {
  if (!config.wallets || !Array.isArray(config.wallets)) {
    return { valid: false, error: 'Invalid wallets configuration' };
  }

  if (!config.transactionsPerWallet || config.transactionsPerWallet <= 0) {
    return { valid: false, error: 'Invalid transactionsPerWallet value' };
  }

  if (!config.tokens || !Array.isArray(config.tokens)) {
    return { valid: false, error: 'Invalid tokens configuration' };
  }

  if (!config.amountRange || !config.amountRange.min || !config.amountRange.max) {
    return { valid: false, error: 'Invalid amountRange configuration' };
  }

  if (config.amountRange.min <= 0 || config.amountRange.max <= 0) {
    return { valid: false, error: 'Amount range values must be positive' };
  }

  if (config.amountRange.min > config.amountRange.max) {
    return { valid: false, error: 'Invalid amount range: min cannot be greater than max' };
  }

  // Validate token pairs
  for (const tokenPair of config.tokens) {
    if (!tokenPair.from || !tokenPair.to) {
      return { valid: false, error: 'Invalid token pair: missing from or to token' };
    }
    if (tokenPair.from === tokenPair.to) {
      return { valid: false, error: 'Invalid token pair: from and to tokens cannot be the same' };
    }
  }

  return { valid: true };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'NEAR Intents Bulk Operations API endpoint',
    actions: ['executeBulkSwaps'],
    configuration: {
      networkId: nearIntentsConfig.getConfig().networkId,
      nodeUrl: nearIntentsConfig.getConfig().nodeUrl,
      configured: nearIntentsConfig.validateConfig().valid,
    },
    limits: {
      maxTransactionsPerRequest: 100000,
      maxTransactionsPerWallet: 1000,
    },
  });
}