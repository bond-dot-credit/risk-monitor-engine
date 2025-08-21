import { NextRequest, NextResponse } from 'next/server';
import { enhancedRiskMonitor } from '@/lib/risk-monitor-enhanced';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
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
          data: enhancedRiskMonitor.getEnhancedStatus()
        });

      case 'summary':
        return NextResponse.json({
          success: true,
          data: enhancedRiskMonitor.getEnhancedRiskSummary()
        });

      case 'performance':
        return NextResponse.json({
          success: true,
          data: enhancedRiskMonitor.getPerformanceMetrics()
        });

      case 'alerts':
        const alertType = searchParams.get('type'); // 'active', 'all', 'category', 'severity'
        const vaultId = searchParams.get('vaultId');
        const category = searchParams.get('category');
        const severity = searchParams.get('severity');

        if (vaultId) {
          return NextResponse.json({
            success: true,
            data: enhancedRiskMonitor.getVaultAlerts(vaultId)
          });
        }

        if (category) {
          return NextResponse.json({
            success: true,
            data: enhancedRiskMonitor.getAlertsByCategory(category)
          });
        }

        if (severity) {
          return NextResponse.json({
            success: true,
            data: enhancedRiskMonitor.getAlertsBySeverity(severity)
          });
        }

        if (alertType === 'all') {
          // Get all alerts (both active and acknowledged)
          const allAlerts = enhancedRiskMonitor.getVaultAlerts(''); // This would need to be implemented
          return NextResponse.json({
            success: true,
            data: allAlerts
          });
        }

        // Default: return active alerts
        return NextResponse.json({
          success: true,
          data: enhancedRiskMonitor.getActiveAlerts()
        });

      case 'market-data':
        const chainId = searchParams.get('chainId');
        if (chainId) {
          const parsedChainId = parseInt(chainId) as ChainId;
          const marketData = enhancedRiskMonitor.getMarketData(parsedChainId);
          return NextResponse.json({
            success: true,
            data: marketData
          });
        }
        
        // Return market data for all chains
        const allMarketData = {
          ethereum: enhancedRiskMonitor.getMarketData(ChainId.ETHEREUM),
          arbitrum: enhancedRiskMonitor.getMarketData(ChainId.ARBITRUM),
          polygon: enhancedRiskMonitor.getMarketData(ChainId.POLYGON)
        };
        
        return NextResponse.json({
          success: true,
          data: allMarketData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: status, summary, performance, alerts, market-data'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in enhanced risk monitor GET:', error);
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
    const { action, ...data } = body;

    switch (action) {
      case 'start':
        enhancedRiskMonitor.start();
        return NextResponse.json({
          success: true,
          message: 'Enhanced risk monitoring started',
          data: enhancedRiskMonitor.getEnhancedStatus()
        });

      case 'stop':
        enhancedRiskMonitor.stop();
        return NextResponse.json({
          success: true,
          message: 'Enhanced risk monitoring stopped',
          data: enhancedRiskMonitor.getEnhancedStatus()
        });

      case 'monitor-vault':
        const { vaultId, agentId, historicalData } = data;
        
        if (!vaultId || !agentId) {
          return NextResponse.json(
            { success: false, error: 'vaultId and agentId are required' },
            { status: 400 }
          );
        }

        // Get vault and agent from store (in a real implementation, this would come from database)
        const vault = store.getCreditVault?.(vaultId) || {
          id: vaultId,
          agentId,
          chainId: ChainId.ETHEREUM,
          status: 'ACTIVE',
          collateral: { token: 'ETH', amount: 10, valueUSD: 20000, lastUpdated: new Date() },
          debt: { token: 'USDC', amount: 16000, valueUSD: 16000, lastUpdated: new Date() },
          ltv: 80,
          healthFactor: 1.2,
          maxLTV: 70,
          liquidationProtection: { enabled: true, threshold: 59.5, cooldown: 3600 },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastRiskCheck: new Date()
        };

        const agent = store.getAgent(agentId);
        if (!agent) {
          return NextResponse.json(
            { success: false, error: 'Agent not found' },
            { status: 404 }
          );
        }

        const monitoringResult = await enhancedRiskMonitor.monitorVault(
          vault as any,
          agent,
          historicalData || []
        );

        return NextResponse.json({
          success: true,
          data: monitoringResult
        });

      case 'update-market-data':
        const { chainId, marketData } = data;
        
        if (!chainId || !marketData) {
          return NextResponse.json(
            { success: false, error: 'chainId and marketData are required' },
            { status: 400 }
          );
        }

        enhancedRiskMonitor.updateMarketData(chainId, marketData);
        
        return NextResponse.json({
          success: true,
          message: 'Market data updated successfully',
          data: enhancedRiskMonitor.getMarketData(chainId)
        });

      case 'acknowledge-alert':
        const { alertId, acknowledgedBy } = data;
        
        if (!alertId || !acknowledgedBy) {
          return NextResponse.json(
            { success: false, error: 'alertId and acknowledgedBy are required' },
            { status: 400 }
          );
        }

        const acknowledged = enhancedRiskMonitor.acknowledgeAlert(alertId, acknowledgedBy);
        
        if (!acknowledged) {
          return NextResponse.json(
            { success: false, error: 'Alert not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully'
        });

      case 'simulate-market-volatility':
        const { chainId: simChainId, volatility } = data;
        
        if (!simChainId || typeof volatility !== 'number') {
          return NextResponse.json(
            { success: false, error: 'chainId and volatility are required' },
            { status: 400 }
          );
        }

        enhancedRiskMonitor.simulateMarketVolatility(simChainId, volatility);
        
        return NextResponse.json({
          success: true,
          message: 'Market volatility simulated successfully',
          data: enhancedRiskMonitor.getMarketData(simChainId)
        });

      case 'simulate-price-update':
        const { chainId: priceChainId, token, price } = data;
        
        if (!priceChainId || !token || typeof price !== 'number') {
          return NextResponse.json(
            { success: false, error: 'chainId, token, and price are required' },
            { status: 400 }
          );
        }

        enhancedRiskMonitor.simulatePriceUpdate(priceChainId, token, price);
        
        return NextResponse.json({
          success: true,
          message: 'Price update simulated successfully',
          data: enhancedRiskMonitor.getMarketData(priceChainId)
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start, stop, monitor-vault, update-market-data, acknowledge-alert, simulate-market-volatility, simulate-price-update'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in enhanced risk monitor POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
