import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// Mock data for static export
interface ReputationEvent {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  metadata: { [key: string]: any };
}

interface ReputationSummary {
  agentId: string;
  totalScore: number;
  eventCount: number;
  lastUpdated: string;
  events: ReputationEvent[];
}

const mockReputationSummary: ReputationSummary = {
  agentId: '1',
  totalScore: 85,
  eventCount: 1,
  lastUpdated: new Date().toISOString(),
  events: [
    {
      id: '1',
      type: 'SCORE_UPDATE',
      value: 85,
      timestamp: new Date().toISOString(),
      metadata: { reason: 'Initial score' }
    }
  ]
};

export async function GET() {
  try {
    // Return mock data for static export
    return NextResponse.json(mockReputationSummary);
  } catch (error) {
    console.error('Error building reputation summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to build reputation summary' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Return 405 Method Not Allowed for static export
  return NextResponse.json(
    { success: false, error: 'Method not allowed in static export' },
    { status: 405 }
  );
}


