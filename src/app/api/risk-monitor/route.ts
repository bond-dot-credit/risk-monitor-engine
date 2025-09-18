import { NextRequest, NextResponse } from 'next/server';
import { riskMonitor } from '@/lib/risk-monitor';
import { ChainId } from '@/types/credit-vault';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const vaultId = searchParams.get('vaultId');

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'status':
        const status = riskMonitor.getStatus();
        return NextResponse.json({ success: true, status });

      case 'alerts':
        const alerts = riskMonitor.getActiveAlerts();
        return NextResponse.json({ success: true, alerts });

      case 'summary':
        const summary = riskMonitor.getRiskSummary();
        return NextResponse.json({ success: true, summary });

      case 'market-data':
        // Mock market data since getStatus() doesn't return marketData
        const marketData = {
          volatility: 0.15,
          liquidity: 0.85,
          correlation: 0.3,
          lastUpdated: new Date().toISOString()
        };
        return NextResponse.json({ success: true, marketData });

      case 'vault-alerts':
        if (!vaultId) {
          return NextResponse.json({ success: false, error: 'Vault ID is required' }, { status: 400 });
        }
        const vaultAlerts = riskMonitor.getVaultAlerts(vaultId);
        return NextResponse.json({ success: true, alerts: vaultAlerts });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in risk monitor API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'start-monitoring':
        riskMonitor.start();
        return NextResponse.json({ success: true, message: 'Risk monitoring started' });

      case 'stop-monitoring':
        riskMonitor.stop();
        return NextResponse.json({ success: true, message: 'Risk monitoring stopped' });

      case 'update-market-data':
        const { chainId, marketData } = params;
        if (!chainId || !marketData) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        if (!Object.values(ChainId).includes(chainId)) {
          return NextResponse.json({ success: false, error: 'Invalid chain ID' }, { status: 400 });
        }
        riskMonitor.updateMarketData(chainId, marketData);
        return NextResponse.json({ success: true, message: 'Market data updated' });

      case 'acknowledge-alert':
        const { alertId } = params;
        if (!alertId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        riskMonitor.acknowledgeAlert(alertId, 'User acknowledged');
        return NextResponse.json({ success: true, message: 'Alert acknowledged' });

      case 'simulate-volatility':
        const { chainId: volChainId, minVolatility, maxVolatility } = params;
        if (!volChainId || minVolatility === undefined || maxVolatility === undefined) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        if (!Object.values(ChainId).includes(volChainId)) {
          return NextResponse.json({ success: false, error: 'Invalid chain ID' }, { status: 400 });
        }
        if (minVolatility < 0 || maxVolatility < 0 || minVolatility >= maxVolatility) {
          return NextResponse.json({ success: false, error: 'Invalid volatility range' }, { status: 400 });
        }
        const newVolatility = riskMonitor.simulateMarketVolatility(volChainId, minVolatility);
        return NextResponse.json({ success: true, newVolatility });

      case 'simulate-price-update':
        const { chainId: priceChainId, volatilityFactor } = params;
        if (!priceChainId || volatilityFactor === undefined) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        if (!Object.values(ChainId).includes(priceChainId)) {
          return NextResponse.json({ success: false, error: 'Invalid chain ID' }, { status: 400 });
        }
        if (volatilityFactor < -1 || volatilityFactor > 1) {
          return NextResponse.json({ success: false, error: 'Invalid volatility factor' }, { status: 400 });
        }
        const newPrices = riskMonitor.simulatePriceUpdate(priceChainId, volatilityFactor, 1.0);
        return NextResponse.json({ success: true, newPrices });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }
    console.error('Error in risk monitor API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
