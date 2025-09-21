import { NextRequest, NextResponse } from 'next/server';
import { nearContractsService } from '@/lib/near-contracts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Initialize NEAR contracts service
    await nearContractsService.initialize();
    
    // Get vault contract
    const vaultContract = nearContractsService.getVaultContract();
    
    // Fetch vault data
    const [config, totalSupply, userShares] = await Promise.all([
      vaultContract.get_config(),
      vaultContract.get_total_supply(),
      vaultContract.get_user_total_shares({ account_id: accountId })
    ]);

    // Get token reserves
    const tokenReserves = {
      WNEAR: await vaultContract.get_token_reserves({ token_type: 'WNEAR' }),
      USDC: await vaultContract.get_token_reserves({ token_type: 'USDC' }),
      USDT: await vaultContract.get_token_reserves({ token_type: 'USDT' })
    };

    // Get user shares for each token
    const userVaultShares = {
      WNEAR: await vaultContract.get_user_vault_shares({ account_id: accountId, token_type: 'WNEAR' }),
      USDC: await vaultContract.get_user_vault_shares({ account_id: accountId, token_type: 'USDC' }),
      USDT: await vaultContract.get_user_vault_shares({ account_id: accountId, token_type: 'USDT' })
    };

    return NextResponse.json({
      success: true,
      data: {
        config,
        totalSupply,
        tokenReserves,
        userVaultShares,
        userTotalShares: userShares
      }
    });
  } catch (error) {
    console.error('Error fetching vault data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vault data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tokenType, amount, accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Initialize NEAR contracts service
    await nearContractsService.initialize();
    
    // Get vault contract
    const vaultContract = nearContractsService.getVaultContract();

    switch (action) {
      case 'deposit':
        if (!tokenType || !amount) {
          return NextResponse.json(
            { success: false, error: 'Token type and amount are required for deposit' },
            { status: 400 }
          );
        }

        try {
          const result = await vaultContract.deposit({
            token_type: tokenType,
            amount: amount.toString()
          });
          
          console.log('Deposit successful:', result);
          return NextResponse.json({
            success: true,
            message: 'Deposit initiated',
            transactionHash: result.transaction?.hash || 'unknown'
          });
        } catch (error) {
          console.error('Deposit failed:', error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Deposit failed'
          }, { status: 500 });
        }

      case 'withdraw':
        if (!tokenType || !amount) {
          return NextResponse.json(
            { success: false, error: 'Token type and amount are required for withdrawal' },
            { status: 400 }
          );
        }

        try {
          const result = await vaultContract.withdraw({
            token_type: tokenType,
            vault_shares_amount: amount.toString()
          });
          
          console.log('Withdrawal successful:', result);
          return NextResponse.json({
            success: true,
            message: 'Withdrawal initiated',
            transactionHash: result.transaction?.hash || 'unknown'
          });
        } catch (error) {
          console.error('Withdrawal failed:', error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Withdrawal failed'
          }, { status: 500 });
        }

      case 'get_events':
        try {
          const [depositEvents, withdrawEvents] = await Promise.all([
            vaultContract.get_deposit_events({ limit: 50 }),
            vaultContract.get_withdraw_events({ limit: 50 })
          ]);
          
          return NextResponse.json({
            success: true,
            data: {
              deposits: depositEvents,
              withdrawals: withdrawEvents
            }
          });
        } catch (error) {
          console.error('Failed to fetch events:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch events'
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in vault API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
