import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { 
  createCreditVault, 
  calculateDynamicLTV,
  recalculateVaultMetrics,
  DEFAULT_CHAIN_CONFIGS
} from '@/lib/credit-vault';
import { ChainId, VaultStatus } from '@/types/credit-vault';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    
    const chainId = searchParams.get('chainId');
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    
    // Get vaults from store (in a real implementation, this would be from a database)
    // For now, we'll return an empty array since the store doesn't have vaults yet
    let vaults: Record<string, unknown>[] = [];
    
    // Apply filters
    if (chainId) {
      vaults = vaults.filter(v => v.chainId === parseInt(chainId));
    }
    
    if (status) {
      vaults = vaults.filter(v => v.status === status);
    }
    
    if (agentId) {
      vaults = vaults.filter(v => v.agentId === agentId);
    }
    
    return NextResponse.json(vaults);
    
  } catch (error) {
    console.error('Error fetching credit vaults:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit vaults' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    
    const { 
      agentId, 
      chainId, 
      collateralToken, 
      collateralAmount, 
      collateralValueUSD 
    } = body;
    
    // Validate required fields
    if (!agentId || !chainId || !collateralToken || !collateralAmount || !collateralValueUSD) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate chain ID
    if (!Object.values(ChainId).includes(chainId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid chain ID' },
        { status: 400 }
      );
    }
    
    // Get agent to calculate max LTV
    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Calculate dynamic max LTV
    const maxLTV = calculateDynamicLTV(agent, chainId, collateralValueUSD);
    
    // Create the credit vault
    const vault = createCreditVault(
      agentId,
      chainId,
      collateralToken,
      collateralAmount,
      collateralValueUSD,
      maxLTV
    );
    
    // In a real implementation, you would save the vault to a database
    // For now, we'll just return the created vault
    
    return NextResponse.json({
      success: true,
      vault: vault,
      message: 'Credit vault created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating credit vault:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create credit vault' },
      { status: 500 }
    );
  }
}
