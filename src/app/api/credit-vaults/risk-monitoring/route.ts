import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '@/lib/seed';
import { riskMonitor } from '@/lib/risk-monitor';
import { ChainId } from '@/types/credit-vault';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    
    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: riskMonitor.getStatus()
        });
        
      case 'alerts':
        const vaultId = searchParams.get('vaultId');
        if (vaultId) {
          return NextResponse.json({
            success: true,
            data: riskMonitor.getVaultAlerts(vaultId)
          });
        } else {
          return NextResponse.json({
            success: true,
            data: riskMonitor.getActiveAlerts()
          });
        }
        
      case 'summary':
        return NextResponse.json({
          success: true,
          data: riskMonitor.getRiskSummary()
        });
        
      case 'market-data':
        const chainId = searchParams.get('chainId');
        if (chainId) {
          const marketData = riskMonitor.getMarketData(parseInt(chainId) as ChainId);
          return NextResponse.json({
            success: true,
            data: marketData
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'chainId is required for market data'
          }, { status: 400 });
        }
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: status, alerts, summary, market-data'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in risk monitoring API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    
    const { action, ...params } = body;
    
    switch (action) {
      case 'start-monitoring':
        riskMonitor.start();
        return NextResponse.json({
          success: true,
          message: 'Risk monitoring started'
        });
        
      case 'stop-monitoring':
        riskMonitor.stop();
        return NextResponse.json({
          success: true,
          message: 'Risk monitoring stopped'
        });
        
      case 'update-market-data':
        const { chainId, volatility, gasPrice, blockNumber, priceFeeds } = params;
        if (!chainId) {
          return NextResponse.json({
            success: false,
            error: 'chainId is required'
          }, { status: 400 });
        }
        
        riskMonitor.updateMarketData(chainId, {
          volatility,
          gasPrice,
          blockNumber,
          priceFeeds
        });
        
        return NextResponse.json({
          success: true,
          message: 'Market data updated'
        });
        
      case 'acknowledge-alert':
        const { alertId, acknowledgedBy } = params;
        if (!alertId || !acknowledgedBy) {
          return NextResponse.json({
            success: false,
            error: 'alertId and acknowledgedBy are required'
          }, { status: 400 });
        }
        
        const success = riskMonitor.acknowledgeAlert(alertId, acknowledgedBy);
        if (success) {
          return NextResponse.json({
            success: true,
            message: 'Alert acknowledged'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Alert not found'
          }, { status: 404 });
        }
        
      case 'simulate-volatility':
        const { chainId: simChainId, volatility: simVolatility } = params;
        if (!simChainId || simVolatility === undefined) {
          return NextResponse.json({
            success: false,
            error: 'chainId and volatility are required'
          }, { status: 400 });
        }
        
        riskMonitor.simulateMarketVolatility(simChainId, simVolatility);
        return NextResponse.json({
          success: true,
          message: 'Market volatility simulated'
        });
        
      case 'simulate-price-update':
        const { chainId: priceChainId, token, price } = params;
        if (!priceChainId || !token || price === undefined) {
          return NextResponse.json({
            success: false,
            error: 'chainId, token, and price are required'
          }, { status: 400 });
        }
        
        riskMonitor.simulatePriceUpdate(priceChainId, token, price);
        return NextResponse.json({
          success: true,
          message: 'Price update simulated'
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start-monitoring, stop-monitoring, update-market-data, acknowledge-alert, simulate-volatility, simulate-price-update'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in risk monitoring API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
