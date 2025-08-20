import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { buildReputationSummary } from '@/lib/scoring';
import { ReputationEvent, ReputationEventType } from '@/types/reputation';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 });
    }

    const events = store.getReputationEvents(agentId);
    const summary = buildReputationSummary(agentId, events);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error building reputation summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to build summary' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { agentId, type, impact, metadata, timestamp } = body as {
      agentId: string;
      type: ReputationEventType | string;
      impact: number;
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

    const normalizedType = (typeof type === 'string' ? type : String(type)) as ReputationEventType;

    const event: ReputationEvent = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      type: normalizedType,
      description: `Reputation event: ${type}`,
      impact: Math.max(-100, Math.min(100, impact)),
      metadata: metadata || {},
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };

    store.addReputationEvent(event);

    const events = store.getReputationEvents(agentId);
    const summary = buildReputationSummary(agentId, events);
    return NextResponse.json({ success: true, data: { event, summary } }, { status: 201 });
  } catch (error) {
    console.error('Error ingesting reputation event:', error);
    return NextResponse.json({ success: false, error: 'Failed to ingest event' }, { status: 500 });
  }
}


