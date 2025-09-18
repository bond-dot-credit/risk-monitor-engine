import { NextRequest, NextResponse } from 'next/server';
import { OnChainMetricsCollector, OnChainMetricsConfig } from '@/lib/near-intents/onchain-metrics';
import { ensureSeeded } from '@/lib/seed';

// Configuration from environment variables
const ACCOUNT_CONFIG: OnChainMetricsConfig = {
  networkId: process.env.NEAR_NETWORK_ID || 'mainnet',
  nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.mainnet.near.org',
  walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.near.org',
  helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.mainnet.near.org',
  accountId: process.env.NEAR_ACCOUNT_ID || 'user.near',
  privateKey: process.env.NEAR_PRIVATE_KEY || 'ed25519:mock-private-key',
};

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    
    // Better error handling for JSON parsing
    let body = {};
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { action, startDate, endDate, agentId, walletIds } = body as {
      action: string;
      startDate?: string;
      endDate?: string;
      agentId?: string;
      walletIds?: string[];
    };

    switch (action) {
      case 'collectMetrics':
        // Validate dates
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Missing startDate or endDate parameters' },
            { status: 400 }
          );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid date format. Use ISO format (YYYY-MM-DD)' },
            { status: 400 }
          );
        }

        if (start > end) {
          return NextResponse.json(
            { success: false, error: 'startDate must be before endDate' },
            { status: 400 }
          );
        }

        // Initialize the metrics collector
        const collector = new OnChainMetricsCollector(ACCOUNT_CONFIG);
        await collector.initialize();

        // Collect metrics - if walletIds are provided, collect metrics for those wallets
        // Otherwise, collect metrics for the main account
        const metrics = await collector.collectMetrics(start, end, walletIds);

        // Calculate reward tier based on NEAR Protocol Rewards scoring system
        const rewardTier = calculateRewardTier(metrics as unknown as Record<string, unknown>);
        const monetaryReward = calculateMonetaryReward(rewardTier);

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            rewardTier,
            monetaryReward,
            period: {
              startDate: start.toISOString(),
              endDate: end.toISOString()
            }
          }
        });

      case 'getAccountInfo':
        const accountCollector = new OnChainMetricsCollector(ACCOUNT_CONFIG);
        await accountCollector.initialize();
        
        const balance = await accountCollector.getAccountBalance();
        const state = await accountCollector.getAccountState();

        return NextResponse.json({
          success: true,
          data: {
            accountId: ACCOUNT_CONFIG.accountId,
            balance,
            state
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: collectMetrics, getAccountInfo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('NEAR Protocol Rewards API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'NEAR Protocol Rewards API endpoint',
    actions: ['collectMetrics', 'getAccountInfo'],
  });
}

/**
 * Calculate reward tier based on NEAR Protocol Rewards scoring system
 * 
 * On-Chain Metrics (20 points total):
 * - Transaction Volume: 8 points (max at $10,000+)
 * - Smart Contract Calls: 8 points (max at 500+ calls)
 * - Unique Wallets: 4 points (max at 100+ unique wallets)
 */
function calculateRewardTier(metrics: Record<string, unknown>): string {
  let score = 0;
  
  // Transaction Volume (8 points)
  const transactionVolume = typeof metrics.transactionVolume === 'number' ? metrics.transactionVolume : 0;
  if (transactionVolume >= 10000) {
    score += 8;
  } else if (transactionVolume >= 5000) {
    score += 6;
  } else if (transactionVolume >= 1000) {
    score += 4;
  } else if (transactionVolume >= 100) {
    score += 2;
  }
  
  // Smart Contract Calls (8 points)
  const smartContractCalls = typeof metrics.smartContractCalls === 'number' ? metrics.smartContractCalls : 0;
  if (smartContractCalls >= 500) {
    score += 8;
  } else if (smartContractCalls >= 250) {
    score += 6;
  } else if (smartContractCalls >= 100) {
    score += 4;
  } else if (smartContractCalls >= 50) {
    score += 2;
  }
  
  // Unique Wallets (4 points)
  const uniqueWallets = typeof metrics.uniqueWallets === 'number' ? metrics.uniqueWallets : 0;
  if (uniqueWallets >= 100) {
    score += 4;
  } else if (uniqueWallets >= 50) {
    score += 3;
  } else if (uniqueWallets >= 25) {
    score += 2;
  } else if (uniqueWallets >= 10) {
    score += 1;
  }
  
  // Determine tier based on total score (0-20 points for on-chain metrics)
  // For the full scoring system, this would be combined with off-chain metrics (80 points)
  if (score >= 17) return 'Diamond';
  if (score >= 14) return 'Gold';
  if (score >= 11) return 'Silver';
  if (score >= 8) return 'Bronze';
  if (score >= 4) return 'Contributor';
  if (score >= 1) return 'Explorer';
  return 'No Tier';
}

/**
 * Calculate monetary reward based on tier
 */
function calculateMonetaryReward(tier: string): number {
  switch (tier) {
    case 'Diamond': return 10000;
    case 'Gold': return 6000;
    case 'Silver': return 3000;
    case 'Bronze': return 1000;
    case 'Contributor': return 500;
    case 'Explorer': return 100;
    default: return 0;
  }
}