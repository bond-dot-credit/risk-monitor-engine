import { NextRequest, NextResponse } from 'next/server';
import { CreditVault, VaultStatus } from '@/types/credit';
import { Agent, CredibilityTier, AgentStatus } from '@/types/agent';
import { calculateLTV } from '@/lib/scoring';

const mockVaults: CreditVault[] = [
  {
    id: 'vault_1',
    agentId: '1',
    balance: 15000,
    creditLimit: 25000,
    currentLTV: 75,
    maxLTV: 80,
    utilization: 60,
    status: VaultStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'vault_2',
    agentId: '2',
    balance: 8500,
    creditLimit: 15000,
    currentLTV: 65,
    maxLTV: 70,
    utilization: 57,
    status: VaultStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

const mockAgent: Agent = {
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
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    let filteredVaults = [...mockVaults];

    if (agentId) {
      filteredVaults = filteredVaults.filter(vault => vault.agentId === agentId);
    }

    if (status && status !== 'all') {
      filteredVaults = filteredVaults.filter(vault => vault.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredVaults
    });
  } catch (error) {
    console.error('Error fetching credit vaults:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate risk' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, balance, creditLimit } = body;

    if (!agentId || typeof balance !== 'number' || typeof creditLimit !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agent = mockAgent;
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const baseLTV = getBaseLTVForTier(agent.credibilityTier);
    const ltvCalculation = calculateLTV(baseLTV, agent.score);

    const newVault: CreditVault = {
      id: `vault_${Date.now()}`,
      agentId,
      balance,
      creditLimit,
      currentLTV: Math.round(ltvCalculation.final * 0.7),
      maxLTV: ltvCalculation.final,
      utilization: Math.round((balance / creditLimit) * 100),
      status: VaultStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockVaults.push(newVault);

    return NextResponse.json({
      success: true,
      data: newVault
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating credit vault:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vault' },
      { status: 500 }
    );
  }
}

function getBaseLTVForTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 80;
    case CredibilityTier.PLATINUM: return 70;
    case CredibilityTier.GOLD: return 60;
    case CredibilityTier.SILVER: return 50;
    case CredibilityTier.BRONZE: return 40;
    default: return 30;
  }
}
