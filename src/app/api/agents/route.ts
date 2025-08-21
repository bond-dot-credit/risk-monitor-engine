import { NextRequest, NextResponse } from 'next/server';
import { Agent, CredibilityTier, AgentStatus, VerificationStatus } from '@/types/agent';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { calculateAgentScore } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');

    let filteredAgents = store.getAgents();
    
    if (category && category !== 'all') {
      filteredAgents = filteredAgents.filter(
        agent => agent.metadata.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (tier && tier !== 'all') {
      filteredAgents = filteredAgents.filter(
        agent => String(agent.credibilityTier) === tier
      );
    }

    if (status && status !== 'all') {
      filteredAgents = filteredAgents.filter(
        agent => agent.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredAgents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, operator, metadata, scores } = body;

    if (!name || !operator || !metadata || !scores) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agentScore = calculateAgentScore(
      scores.provenance,
      scores.performance,
      scores.perception,
      0 // Default verification score
    );

    const credibilityTier = agentScore.overall >= 80 ? CredibilityTier.PLATINUM : agentScore.overall >= 60 ? CredibilityTier.GOLD : CredibilityTier.SILVER;

    const newAgent: Agent = {
      id: `agent_${Date.now()}`,
      name,
      operator,
      metadata,
      score: agentScore,
      credibilityTier,
      status: AgentStatus.UNDER_REVIEW,
      verification: VerificationStatus.UNDER_REVIEW,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.addAgent(newAgent);

    return NextResponse.json({
      success: true,
      data: newAgent
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
