import { NextRequest, NextResponse } from 'next/server';
import { nearContractsService, Opportunity } from '@/lib/near-contracts';

// Mock data as fallback
const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    name: 'NEAR Staking Pool',
    description: 'High-yield staking pool with automated compounding and risk management strategies.',
    apy: 12.5,
    trustScore: 92,
    performance: 37,
    reliability: 35,
    safety: 20,
    totalScore: 92,
    riskLevel: 'LOW',
    contractAddress: 'staking.near',
    tokenAddress: 'near',
    category: 'staking',
    minDeposit: 1,
    maxDeposit: 100000,
    tvl: 1250000
  },
  {
    id: 2,
    name: 'Liquidity Mining Farm',
    description: 'Automated liquidity provision with dynamic fee optimization and impermanent loss protection.',
    apy: 18.7,
    trustScore: 85,
    performance: 32,
    reliability: 33,
    safety: 20,
    totalScore: 85,
    riskLevel: 'MEDIUM',
    contractAddress: 'liquidity-farm.near',
    tokenAddress: 'usdc',
    category: 'liquidity',
    minDeposit: 100,
    maxDeposit: 50000,
    tvl: 850000
  },
  {
    id: 3,
    name: 'Cross-Chain Bridge Vault',
    description: 'Multi-chain yield farming with bridge rewards and cross-chain arbitrage opportunities.',
    apy: 15.2,
    trustScore: 78,
    performance: 30,
    reliability: 28,
    safety: 20,
    totalScore: 78,
    riskLevel: 'MEDIUM',
    contractAddress: 'bridge-vault.near',
    tokenAddress: 'weth',
    category: 'bridge',
    minDeposit: 0.1,
    maxDeposit: 10000,
    tvl: 420000
  },
  {
    id: 4,
    name: 'DeFi Index Fund',
    description: 'Diversified portfolio of top-performing DeFi protocols with automated rebalancing.',
    apy: 14.8,
    trustScore: 88,
    performance: 35,
    reliability: 33,
    safety: 20,
    totalScore: 88,
    riskLevel: 'LOW',
    contractAddress: 'defi-index.near',
    tokenAddress: 'usdt',
    category: 'index',
    minDeposit: 50,
    maxDeposit: 25000,
    tvl: 680000
  }
];

// Function to fetch opportunities from NEAR Registry contract
async function fetchOpportunitiesFromRegistry(): Promise<Opportunity[]> {
  try {
    // Initialize NEAR contracts service
    await nearContractsService.initialize();
    
    // Get registry contract
    const registryContract = nearContractsService.getRegistryContract();
    
    // Fetch opportunities from the registry
    const opportunities = await registryContract.get_opportunities({
      limit: 50,
      offset: 0
    });
    
    console.log('Fetched opportunities from NEAR Registry:', opportunities);
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities from registry:', error);
    // Return mock data as fallback
    return mockOpportunities;
  }
}

// Function to calculate trust score based on on-chain metrics
function calculateTrustScore(opportunity: any): number {
  // This would calculate based on:
  // - Historical performance
  // - Liquidity depth
  // - Security audits
  // - Community trust metrics
  // - Protocol governance
  return Math.floor(Math.random() * 40) + 60; // Mock calculation
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minApy = searchParams.get('minApy');
    const maxRisk = searchParams.get('maxRisk');

    // Fetch opportunities from registry
    let opportunities = await fetchOpportunitiesFromRegistry();

    // Apply filters
    if (category) {
      opportunities = opportunities.filter(opp => opp.category === category);
    }

    if (minApy) {
      const minApyNum = parseFloat(minApy);
      opportunities = opportunities.filter(opp => opp.apy >= minApyNum);
    }

    if (maxRisk) {
      opportunities = opportunities.filter(opp => {
        const riskMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
        const maxRiskNum = riskMap[maxRisk as keyof typeof riskMap] || 3;
        const currentRiskNum = riskMap[opp.riskLevel as keyof typeof riskMap] || 3;
        return currentRiskNum <= maxRiskNum;
      });
    }

    return NextResponse.json({
      success: true,
      data: opportunities,
      total: opportunities.length
    });
  } catch (error) {
    console.error('Error in opportunities API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch opportunities',
        data: mockOpportunities // Fallback to mock data
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, opportunityId, amount, accountId } = body;

    switch (action) {
      case 'deposit':
        // TODO: Implement deposit to vault first, then allocate to opportunity
        console.log('Deposit request:', { opportunityId, amount, accountId });
        return NextResponse.json({
          success: true,
          message: 'Deposit initiated',
          transactionHash: 'mock-tx-hash-' + Date.now()
        });

      case 'allocate':
        try {
          // Initialize NEAR contracts service
          await nearContractsService.initialize();
          
          // Get opportunity contract
          const opportunityContract = nearContractsService.getOpportunityContract(opportunityId);
          
          // Call allocate method
          const result = await opportunityContract.allocate({
            amount: amount.toString()
          });
          
          console.log('Allocation successful:', result);
          return NextResponse.json({
            success: true,
            message: 'Allocation successful',
            transactionHash: result.transaction?.hash || 'unknown'
          });
        } catch (error) {
          console.error('Allocation failed:', error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Allocation failed'
          }, { status: 500 });
        }

      case 'withdraw':
        try {
          // Initialize NEAR contracts service
          await nearContractsService.initialize();
          
          // Get opportunity contract
          const opportunityContract = nearContractsService.getOpportunityContract(opportunityId);
          
          // Call withdraw method
          const result = await opportunityContract.withdraw({
            amount: amount.toString()
          });
          
          console.log('Withdrawal successful:', result);
          return NextResponse.json({
            success: true,
            message: 'Withdrawal successful',
            transactionHash: result.transaction?.hash || 'unknown'
          });
        } catch (error) {
          console.error('Withdrawal failed:', error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Withdrawal failed'
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in opportunities POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
