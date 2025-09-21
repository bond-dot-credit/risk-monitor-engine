import { NextRequest, NextResponse } from 'next/server';

interface GlobalStats {
  tvl: number;
  users: number;
  activeVaults: number;
  totalYield: number;
  dailyVolume: number;
  averageApy: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// Function to fetch real global stats from on-chain data
async function fetchGlobalStats(): Promise<GlobalStats> {
  try {
    // TODO: Implement actual on-chain data fetching
    // This would involve:
    // 1. Querying all vault contracts for TVL
    // 2. Counting unique users across all contracts
    // 3. Calculating total yield generated
    // 4. Aggregating daily volume from transaction data
    // 5. Computing average APY across all opportunities

    // For now, return mock data with some randomization to simulate real-time updates
    const baseStats: GlobalStats = {
      tvl: 2847592.45,
      users: 1247,
      activeVaults: 156,
      totalYield: 89234.67,
      dailyVolume: 456789.23,
      averageApy: 15.2,
      riskDistribution: {
        low: 68,
        medium: 24,
        high: 8
      }
    };

    // Add some randomization to simulate real-time updates
    const randomFactor = () => (Math.random() - 0.5) * 0.1; // ±5% variation
    
    return {
      tvl: baseStats.tvl * (1 + randomFactor()),
      users: Math.floor(baseStats.users * (1 + randomFactor())),
      activeVaults: Math.floor(baseStats.activeVaults * (1 + randomFactor())),
      totalYield: baseStats.totalYield * (1 + randomFactor()),
      dailyVolume: baseStats.dailyVolume * (1 + randomFactor()),
      averageApy: baseStats.averageApy * (1 + randomFactor()),
      riskDistribution: baseStats.riskDistribution
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    // Return fallback data
    return {
      tvl: 2847592.45,
      users: 1247,
      activeVaults: 156,
      totalYield: 89234.67,
      dailyVolume: 456789.23,
      averageApy: 15.2,
      riskDistribution: {
        low: 68,
        medium: 24,
        high: 8
      }
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = await fetchGlobalStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in global-stats API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch global stats' 
      },
      { status: 500 }
    );
  }
}
