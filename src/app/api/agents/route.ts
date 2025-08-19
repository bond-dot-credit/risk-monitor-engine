import { NextRequest, NextResponse } from 'next/server';
import { Agent, CredibilityTier, AgentStatus } from '@/types/agent';
import { calculateAgentScore, determineCredibilityTier } from '@/lib/scoring';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'TradingBot Alpha',
    operator: '0x742d35Cc6640C178fFfbDD5B5e3d6480',
    metadata: {
      description: 'High-frequency trading bot for DeFi protocols',
      category: 'Trading',
      version: '2.1.0',
      tags: ['defi', 'trading', 'arbitrage'],
      provenance: {
        sourceCode: 'https://github.com/agent-dev/trading-alpha',
        verificationHash: '0x1234567890abcdef...',
        deploymentChain: 'Ethereum',
        lastAudit: new Date('2024-01-15')
      }
    },
    score: {
      overall: 87,
      provenance: 92,
      performance: 85,
      perception: 83,
      confidence: 89,
      lastUpdated: new Date()
    },
    credibilityTier: CredibilityTier.PLATINUM,
    status: AgentStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Oracle Sentinel',
    operator: '0x123e4567e89b12d3a456426614174000',
    metadata: {
      description: 'Real-time price oracle with ML predictions',
      category: 'Oracle',
      version: '1.8.2',
      tags: ['oracle', 'price-feed', 'ml'],
      provenance: {
        sourceCode: 'https://github.com/oracle-labs/sentinel',
        verificationHash: '0xabcdef1234567890...',
        deploymentChain: 'Arbitrum',
        lastAudit: new Date('2024-02-01')
      }
    },
    score: {
      overall: 76,
      provenance: 88,
      performance: 72,
      perception: 68,
      confidence: 78,
      lastUpdated: new Date()
    },
    credibilityTier: CredibilityTier.GOLD,
    status: AgentStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

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
        agent => agent.credibilityTier === tier
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
      scores.perception
    );

    const credibilityTier = determineCredibilityTier(agentScore.overall);

    const newAgent: Agent = {
      id: `agent_${Date.now()}`,
      name,
      operator,
      metadata,
      score: agentScore,
      credibilityTier,
      status: AgentStatus.UNDER_REVIEW,
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
