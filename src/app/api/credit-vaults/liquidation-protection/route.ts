import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '@/lib/seed';
import { 
  shouldTriggerLiquidationProtection,
  executeProtectionRules,
  DEFAULT_CHAIN_CONFIGS
} from '@/lib/credit-vault';
import { ChainId, VaultProtectionRule } from '@/types/credit-vault';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    
    switch (action) {
      case 'chain-configs':
        return NextResponse.json({
          success: true,
          data: DEFAULT_CHAIN_CONFIGS
        });
        
      case 'protection-status':
        const vaultId = searchParams.get('vaultId');
        if (!vaultId) {
          return NextResponse.json({
            success: false,
            error: 'vaultId is required'
          }, { status: 400 });
        }
        
        // In a real implementation, you would fetch the vault and agent data
        // For now, we'll return mock data
        return NextResponse.json({
          success: true,
          data: {
            vaultId,
            protectionEnabled: true,
            lastTriggered: null,
            cooldownRemaining: 0,
            riskLevel: 'LOW'
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: chain-configs, protection-status'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in liquidation protection API:', error);
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
      case 'check-protection-trigger':
        const { vault, agent, marketVolatility = 1.0 } = params;
        if (!vault || !agent) {
          return NextResponse.json({
            success: false,
            error: 'vault and agent are required'
          }, { status: 400 });
        }
        
        const shouldTrigger = shouldTriggerLiquidationProtection(vault, agent, marketVolatility);
        return NextResponse.json({
          success: true,
          data: {
            shouldTrigger,
            reason: shouldTrigger ? 'Protection conditions met' : 'Protection conditions not met'
          }
        });
        
      case 'execute-protection-rules':
        const { vault: execVault, rules, agent: execAgent, marketVolatility: execVolatility = 1.0 } = params;
        if (!execVault || !rules || !execAgent) {
          return NextResponse.json({
            success: false,
            error: 'vault, rules, and agent are required'
          }, { status: 400 });
        }
        
        const results = executeProtectionRules(execVault, rules, execAgent, execVolatility);
        return NextResponse.json({
          success: true,
          data: results
        });
        
      case 'create-protection-rule':
        const { 
          vaultId, 
          name, 
          description, 
          conditions, 
          actions, 
          priority = 1, 
          cooldown = 3600 
        } = params;
        
        if (!vaultId || !name || !description || !conditions || !actions) {
          return NextResponse.json({
            success: false,
            error: 'vaultId, name, description, conditions, and actions are required'
          }, { status: 400 });
        }
        
        const newRule: VaultProtectionRule = {
          id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          vaultId,
          name,
          description,
          conditions,
          actions,
          enabled: true,
          priority,
          cooldown
        };
        
        // In a real implementation, you would save this rule to a database
        return NextResponse.json({
          success: true,
          data: newRule,
          message: 'Protection rule created successfully'
        }, { status: 201 });
        
      case 'update-protection-rule':
        const { ruleId, updates } = params;
        if (!ruleId || !updates) {
          return NextResponse.json({
            success: false,
            error: 'ruleId and updates are required'
          }, { status: 400 });
        }
        
        // In a real implementation, you would update the rule in a database
        return NextResponse.json({
          success: true,
          message: 'Protection rule updated successfully'
        });
        
      case 'enable-protection':
        const { vaultId: enableVaultId } = params;
        if (!enableVaultId) {
          return NextResponse.json({
            success: false,
            error: 'vaultId is required'
          }, { status: 400 });
        }
        
        // In a real implementation, you would enable protection for the vault
        return NextResponse.json({
          success: true,
          message: 'Liquidation protection enabled'
        });
        
      case 'disable-protection':
        const { vaultId: disableVaultId } = params;
        if (!disableVaultId) {
          return NextResponse.json({
            success: false,
            error: 'vaultId is required'
          }, { status: 400 });
        }
        
        // In a real implementation, you would disable protection for the vault
        return NextResponse.json({
          success: true,
          message: 'Liquidation protection disabled'
        });
        
      case 'simulate-liquidation':
        const { 
          vault: simVault, 
          agent: simAgent, 
          marketVolatility: simVolatility = 1.0,
          liquidationAmount = 0 
        } = params;
        
        if (!simVault || !simAgent) {
          return NextResponse.json({
            success: false,
            error: 'vault and agent are required'
          }, { status: 400 });
        }
        
        // Simulate liquidation event
        const liquidationEvent = {
          id: `liq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          vaultId: simVault.id,
          trigger: 'SIMULATION',
          timestamp: new Date(),
          preLTV: simVault.ltv,
          preHealthFactor: simVault.healthFactor,
          preCollateralValue: simVault.collateral.valueUSD,
          preDebtValue: simVault.debt.valueUSD,
          liquidatedAmount: liquidationAmount,
          liquidatedValue: liquidationAmount,
          penalty: liquidationAmount * 0.05,
          postLTV: simVault.ltv * 0.9, // Simulate reduction
          postHealthFactor: simVault.healthFactor * 1.1, // Simulate improvement
          metadata: { simulation: true }
        };
        
        return NextResponse.json({
          success: true,
          data: liquidationEvent,
          message: 'Liquidation simulation completed'
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: check-protection-trigger, execute-protection-rules, create-protection-rule, update-protection-rule, enable-protection, disable-protection, simulate-liquidation'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in liquidation protection API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
