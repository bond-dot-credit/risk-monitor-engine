import { NextRequest, NextResponse } from 'next/server';
import { CredibilityTier } from '@/types/agent';
import { calculateLTV } from '@/lib/scoring';
import { store } from '@/lib/store';
import { 
  CreditVault, 
  VaultStatus, 
  Collateral
} from '@/types/credit';

const mockVaults: CreditVault[] = [
  {
    id: 'vault_001',
    agentId: '1',
    balance: 500000,
    creditLimit: 1000000,
    currentLTV: 65,
    maxLTV: 75,
    utilization: 65,
    status: VaultStatus.ACTIVE,
    collateral: [
      {
        id: 'coll_001',
        assetType: 'ETH',
        amount: 25,
        value: 750000,
        ltvRatio: 70,
        liquidationThreshold: 80,
        lastUpdated: new Date()
      },
      {
        id: 'coll_002',
        assetType: 'USDC',
        amount: 250000,
        value: 250000,
        ltvRatio: 85,
        liquidationThreshold: 90,
        lastUpdated: new Date()
      }
    ],
    riskMetrics: {
      healthFactor: 1.85,
      liquidationRisk: 25,
      collateralQuality: 92,
      marketVolatility: 18,
      lastCalculated: new Date()
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'vault_002',
    agentId: '2',
    balance: 300000,
    creditLimit: 600000,
    currentLTV: 58,
    maxLTV: 70,
    utilization: 58,
    status: VaultStatus.ACTIVE,
    collateral: [
      {
        id: 'coll_003',
        assetType: 'MATIC',
        amount: 50000,
        value: 450000,
        ltvRatio: 65,
        liquidationThreshold: 75,
        lastUpdated: new Date()
      }
    ],
    riskMetrics: {
      healthFactor: 2.1,
      liquidationRisk: 15,
      collateralQuality: 88,
      marketVolatility: 22,
      lastCalculated: new Date()
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

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
    return NextResponse.json({ success: false, error: 'Failed to fetch vaults' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, balance, creditLimit, collateral } = body;

    if (!agentId || typeof balance !== 'number' || typeof creditLimit !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
      collateral: collateral || [],
      riskMetrics: {
        healthFactor: calculateHealthFactor(ltvCalculation.final, balance, creditLimit),
        liquidationRisk: calculateLiquidationRisk(ltvCalculation.final, balance, creditLimit),
        collateralQuality: calculateCollateralQuality(collateral || []),
        marketVolatility: 20,
        lastCalculated: new Date()
      },
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

function calculateHealthFactor(maxLTV: number, balance: number, creditLimit: number): number {
  const currentLTV = (balance / creditLimit) * 100;
  const utilization = currentLTV / maxLTV;
  return Math.max(0.1, 2 - utilization);
}

function calculateLiquidationRisk(maxLTV: number, balance: number, creditLimit: number): number {
  const currentLTV = (balance / creditLimit) * 100;
  const utilization = currentLTV / maxLTV;
  if (utilization >= 0.9) return 90;
  if (utilization >= 0.8) return 70;
  if (utilization >= 0.7) return 50;
  if (utilization >= 0.6) return 30;
  return 15;
}

function calculateCollateralQuality(collateral: Collateral[]): number {
  if (collateral.length === 0) return 0;
  
  const totalValue = collateral.reduce((sum, col) => sum + col.value, 0);
  const weightedQuality = collateral.reduce((sum, col) => {
    const weight = col.value / totalValue;
    return sum + (col.ltvRatio * weight);
  }, 0);
  
  return Math.round(weightedQuality);
}
