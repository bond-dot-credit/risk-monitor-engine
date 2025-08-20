import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'agentId is required' },
        { status: 400 }
      );
    }

    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Mock performance metrics based on agent data
    const performanceMetrics = {
      apr: Math.round(8 + (agent.score.performance / 100) * 12), // 8-20% APR based on performance
      ltv: Math.round(50 + (agent.score.overall / 100) * 30), // 50-80% LTV based on overall score
      aum: Math.round(100000 + (agent.score.performance / 100) * 900000), // $100K-$1M AUM
      volatility: Math.round(20 - (agent.score.overall / 100) * 15), // 5-20% volatility
      sharpeRatio: Math.round((agent.score.performance / 100) * 2 + 0.5), // 0.5-2.5 Sharpe ratio
      maxDrawdown: Math.round(30 - (agent.score.overall / 100) * 20), // 10-30% max drawdown
      lastUpdated: new Date()
    };

    return NextResponse.json({
      success: true,
      data: performanceMetrics
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
