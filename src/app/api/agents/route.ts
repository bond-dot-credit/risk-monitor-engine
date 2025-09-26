import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// Mock data for static export
interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  metadata: {
    category: string;
    riskLevel: string;
  };
  score: number;
  lastUpdated: string;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sample Agent',
    description: 'This is a sample agent for static export',
    status: 'active',
    metadata: {
      category: 'defi',
      riskLevel: 'low',
    },
    score: 85,
    lastUpdated: new Date().toISOString()
  }
];

export async function GET() {
  try {
    // Return mock data for static export
    return NextResponse.json({ agents: mockAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Return 405 Method Not Allowed for static export
  return NextResponse.json(
    { error: 'Method not allowed in static export' },
    { status: 405 }
  );
}
