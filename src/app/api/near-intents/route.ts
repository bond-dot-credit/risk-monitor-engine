import { NextRequest, NextResponse } from 'next/server';
import { AIAgent } from '@/lib/near-intents';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

// Mock configuration - in a real implementation, this would come from environment variables
const MOCK_ACCOUNT_CONFIG = {
  accountId: 'user.near',
  privateKey: 'ed25519:mock-private-key',
  networkId: 'testnet',
};

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { action, agentId, ...params } = body;

    // Initialize the AI Agent
    const agent = new AIAgent(MOCK_ACCOUNT_CONFIG);
    
    // In a real implementation, you would call await agent.initialize(MOCK_ACCOUNT_CONFIG)
    // For this demo, we'll simulate the initialization

    switch (action) {
      case 'getAccountInfo':
        // Simulate getting account info
        const accountInfo = {
          accountId: MOCK_ACCOUNT_CONFIG.accountId,
          balance: '100.5 NEAR',
        };
        return NextResponse.json({ success: true, data: accountInfo });

      case 'swapTokens':
        const { fromToken, toToken, amount } = params;
        
        // Validate required fields
        if (!fromToken || !toToken || !amount) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: fromToken, toToken, amount' },
            { status: 400 }
          );
        }
        
        // Validate amount is a positive number
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          return NextResponse.json(
            { success: false, error: 'Amount must be a positive number' },
            { status: 400 }
          );
        }
        
        // Simulate token swap
        const swapResult = {
          success: true,
          transactionHash: 'NEARtx...' + Math.random().toString(36).substr(2, 9),
          amountIn: `${amount} ${fromToken}`,
          amountOut: `${(amountNum * 0.97).toFixed(2)} ${toToken}`, // 3% fee
          agentId: agentId || null,
        };
        return NextResponse.json({ success: true, data: swapResult });

      case 'getAgentInfo':
        if (!agentId) {
          return NextResponse.json(
            { success: false, error: 'Missing agentId parameter' },
            { status: 400 }
          );
        }
        
        const agentInfo = store.getAgent(agentId);
        if (!agentInfo) {
          return NextResponse.json(
            { success: false, error: 'Agent not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ success: true, data: agentInfo });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: getAccountInfo, swapTokens, getAgentInfo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('NEAR Intents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'NEAR Intents API endpoint',
    actions: ['getAccountInfo', 'swapTokens', 'getAgentInfo'],
  });
}