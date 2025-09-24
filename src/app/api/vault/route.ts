import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Implement actual vault data fetching from NEAR contracts
    // For now, return mock data
    const config = {
      owner_id: 'vault-contract.testnet',
      wnear_contract: 'wrap.testnet',
      usdc_contract: 'usdc.testnet',
      usdt_contract: 'usdt.testnet',
      fee_percentage: 100,
      is_paused: false
    };

    const totalSupply = '1000000000000000000000000'; // 1M tokens
    const userShares = '0'; // Mock user shares

    const tokenReserves = {
      WNEAR: '500000000000000000000000',
      USDC: '250000000000000000000000',
      USDT: '250000000000000000000000'
    };

    const userVaultShares = {
      WNEAR: '0',
      USDC: '0',
      USDT: '0'
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
    const { action, tokenType, amount, accountId, signature } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'deposit':
        if (!tokenType || !amount) {
          return NextResponse.json(
            { success: false, error: 'Token type and amount are required for deposit' },
            { status: 400 }
          );
        }

        // For real blockchain transactions, we need to handle this differently
        // Since we can't directly sign transactions from the API route,
        // we'll return instructions for the frontend to handle the transaction
        console.log('Deposit request:', { tokenType, amount, accountId });
        
        // Return transaction instructions for the frontend to execute
        return NextResponse.json({
          success: true,
          message: 'Please confirm the deposit transaction in your wallet',
          transactionInstructions: {
            contractId: 'vault-contract.testnet',
            methodName: 'deposit',
            args: {
              token_type: tokenType,
              amount: amount,
            },
            gas: '300000000000000',
            deposit: '0'
          }
        });

      case 'withdraw':
        if (!tokenType || !amount) {
          return NextResponse.json(
            { success: false, error: 'Token type and amount are required for withdrawal' },
            { status: 400 }
          );
        }

        console.log('Withdrawal request:', { tokenType, amount, accountId });
        
        // Return transaction instructions for the frontend to execute
        return NextResponse.json({
          success: true,
          message: 'Please confirm the withdrawal transaction in your wallet',
          transactionInstructions: {
            contractId: 'vault-contract.testnet',
            methodName: 'withdraw',
            args: {
              token_type: tokenType,
              vault_shares_amount: amount,
            },
            gas: '300000000000000',
            deposit: '0'
          }
        });

      case 'get_events':
        // TODO: Implement actual events fetching from vault contract
        return NextResponse.json({
          success: true,
          data: {
            deposits: [],
            withdrawals: []
          }
        });

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
