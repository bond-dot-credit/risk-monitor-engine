import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { buildReputationSummary } from '@/lib/scoring';
import { ReputationEvent, ReputationEventType } from '@/types/reputation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 });
    }

    const summary = buildReputationSummary(agentId);
    if (!summary) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error building reputation summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to build summary' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, type, impact, weight, metadata, timestamp } = body as {
      agentId: string;
      type: ReputationEventType | string;
      impact: number;
      weight?: number;
      metadata?: Record<string, unknown>;
      timestamp?: string | number | Date;
    };

    if (!agentId || typeof impact !== 'number' || !type) {
      return NextResponse.json(
        { success: false, error: 'agentId, type and impact are required' },
        { status: 400 }
      );
    }

    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Normalize type
    const normalizedType = (typeof type === 'string' ? type : String(type)) as ReputationEventType;

    const event: ReputationEvent = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      type: normalizedType,
      impact: Math.max(-100, Math.min(100, impact)),
      weight,
      metadata,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };

    store.addReputationEvent(event);

    const summary = buildReputationSummary(agentId);
    return NextResponse.json({ success: true, data: { event, summary } }, { status: 201 });
  } catch (error) {
    console.error('Error ingesting reputation event:', error);
    return NextResponse.json({ success: false, error: 'Failed to ingest event' }, { status: 500 });
  }
}


