import { NextRequest, NextResponse } from 'next/server';
import { AIAgent, nearIntentsConfig } from '@/lib/near-intents';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { action, agentId, ...params } = body;

    // Validate configuration
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Configuration errors: ${configValidation.errors.join(', ')}`,
          configRequired: true 
        },
        { status: 400 }
      );
    }

    // Initialize the AI Agent with real configuration
    const accountConfig = nearIntentsConfig.getAccountConfig();
    const agent = new AIAgent(accountConfig);
    
    try {
      await agent.initialize();
    } catch (initError) {
      console.error('Failed to initialize NEAR agent:', initError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to initialize NEAR connection: ${initError instanceof Error ? initError.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

    switch (action) {
      case 'getAccountInfo':
        try {
          const accountState = await agent.getAccountState();
          const balanceInNear = accountState.balanceInNear as {
            total: number;
            available: number;
            staked: number;
            locked: number;
          };
          const accountInfo = {
            accountId: accountConfig.accountId,
            networkId: accountConfig.networkId,
            balance: {
              total: `${balanceInNear.total.toFixed(4)} NEAR`,
              available: `${balanceInNear.available.toFixed(4)} NEAR`,
              staked: `${balanceInNear.staked.toFixed(4)} NEAR`,
              locked: `${balanceInNear.locked.toFixed(4)} NEAR`,
            },
            storage: {
              used: accountState.storage_usage,
              paid: accountState.storage_paid_at,
            },
          };
          return NextResponse.json({ success: true, data: accountInfo });
        } catch (error) {
          console.error('Error getting account info:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch account information' },
            { status: 500 }
          );
        }

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
        
        // Validate token support
        if (fromToken !== 'NEAR') {
          return NextResponse.json(
            { success: false, error: 'Currently only NEAR to token swaps are supported' },
            { status: 400 }
          );
        }
        
        try {
          // Execute real token swap
          const swapResult = await agent.swapNearToToken(toToken, amountNum, agentId);
          
          if (swapResult.success) {
            return NextResponse.json({ 
              success: true, 
              data: {
                ...swapResult,
                amountIn: `${amount} ${fromToken}`,
                // Note: actual amountOut would be determined by the swap result
                message: 'Swap executed successfully'
              }
            });
          } else {
            return NextResponse.json(
              { success: false, error: swapResult.error },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error('Error executing swap:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to execute token swap' },
            { status: 500 }
          );
        }

      case 'depositNear':
        const { amount: depositAmount } = params;
        
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid deposit amount' },
            { status: 400 }
          );
        }
        
        try {
          const depositResult = await agent.depositNear(parseFloat(depositAmount), agentId);
          
          if (depositResult) {
            return NextResponse.json({ 
              success: true, 
              data: {
                message: `Successfully deposited ${depositAmount} NEAR`,
                amount: `${depositAmount} NEAR`,
                agentId: agentId || null
              }
            });
          } else {
            return NextResponse.json(
              { success: false, error: 'Failed to deposit NEAR' },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error('Error depositing NEAR:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to deposit NEAR' },
            { status: 500 }
          );
        }

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
          { 
            success: false, 
            error: 'Invalid action. Supported actions: getAccountInfo, swapTokens, depositNear, getAgentInfo' 
          },
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
    actions: ['getAccountInfo', 'swapTokens', 'depositNear', 'getAgentInfo'],
    configuration: {
      networkId: nearIntentsConfig.getConfig().networkId,
      nodeUrl: nearIntentsConfig.getConfig().nodeUrl,
      configured: nearIntentsConfig.validateConfig().valid,
    },
  });
}