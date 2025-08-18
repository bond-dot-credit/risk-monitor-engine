import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { calculateRiskMetrics } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 });
    }
    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    const risk = calculateRiskMetrics(agent);
    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error('Error calculating risk:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate risk' }, { status: 500 });
  }
}


