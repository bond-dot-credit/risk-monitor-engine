import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_CHAIN_CONFIGS, shouldTriggerLiquidationProtection, executeProtectionRules } from '@/lib/credit-vault';
import { riskMonitor } from '@/lib/risk-monitor';
import { VaultProtectionRule } from '@/types/credit-vault';

// In-memory storage for protection rules (in production, this would be a database)
const protectionRules = new Map<string, VaultProtectionRule>();
const vaultProtectionSettings = new Map<string, { enabled: boolean; threshold: number; cooldown: number }>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'chain-configs':
        return NextResponse.json({ success: true, chainConfigs: DEFAULT_CHAIN_CONFIGS });

      case 'protection-status':
        const status = riskMonitor.getStatus();
        const alerts = riskMonitor.getActiveAlerts();
        return NextResponse.json({
          success: true,
          protectionStatus: {
            totalVaults: status.totalVaults,
            activeAlerts: status.activeAlerts,
            protectionRules: protectionRules.size,
            enabledVaults: Array.from(vaultProtectionSettings.values()).filter(s => s.enabled).length
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in liquidation protection API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body by trying to read it
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 400 });
      }
      // If it's not a syntax error, it might be missing body
      return NextResponse.json({ success: false, error: 'Request body is required' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Request body is required' }, { status: 400 });
    }

    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'check-protection-trigger':
        const { vaultId, agentId, marketVolatility } = params;
        if (!vaultId || !agentId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        
        // Mock vault and agent for testing (in production, these would be retrieved from store)
        const mockVault = { id: vaultId, ltv: 50, healthFactor: 2.0, liquidationProtection: { enabled: true } };
        const mockAgent = { id: agentId, score: { overall: 80 } };
        
        const shouldTrigger = shouldTriggerLiquidationProtection(mockVault, mockAgent, marketVolatility || 1.0);
        return NextResponse.json({ success: true, shouldTrigger });

      case 'execute-protection-rules':
        const { vaultId: execVaultId, agentId: execAgentId, rules, marketVolatility: execMarketVolatility } = params;
        if (!execVaultId || !execAgentId || !rules) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        
        // Mock vault and agent for testing
        const execMockVault = { id: execVaultId, ltv: 50, healthFactor: 2.0, liquidationProtection: { enabled: true } };
        const execMockAgent = { id: execAgentId, score: { overall: 80 } };
        
        const results = executeProtectionRules(execMockVault, rules, execMockAgent, execMarketVolatility || 1.0);
        return NextResponse.json({ success: true, results });

      case 'create-protection-rule':
        const { vaultId: ruleVaultId, name, description, conditions, actions, enabled, priority, cooldown } = params;
        if (!ruleVaultId || !name || !description || !conditions || !actions || enabled === undefined || !priority || !cooldown) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Type validation
        if (typeof ruleVaultId !== 'string') {
          return NextResponse.json({ success: false, error: 'vaultId must be a string' }, { status: 400 });
        }
        if (typeof name !== 'string') {
          return NextResponse.json({ success: false, error: 'name must be a string' }, { status: 400 });
        }
        if (typeof description !== 'string') {
          return NextResponse.json({ success: false, error: 'description must be a string' }, { status: 400 });
        }
        if (typeof enabled !== 'boolean') {
          return NextResponse.json({ success: false, error: 'enabled must be a boolean' }, { status: 400 });
        }
        if (typeof priority !== 'number') {
          return NextResponse.json({ success: false, error: 'priority must be a number' }, { status: 400 });
        }
        if (typeof cooldown !== 'number') {
          return NextResponse.json({ success: false, error: 'cooldown must be a number' }, { status: 400 });
        }

        // Validate rule conditions
        if (conditions.ltvThreshold !== undefined) {
          if (typeof conditions.ltvThreshold !== 'number') {
            return NextResponse.json({ success: false, error: 'ltvThreshold must be a number' }, { status: 400 });
          }
          if (conditions.ltvThreshold < 0 || conditions.ltvThreshold > 100) {
            return NextResponse.json({ success: false, error: 'Invalid rule conditions' }, { status: 400 });
          }
        }
        if (conditions.healthFactorThreshold !== undefined) {
          if (typeof conditions.healthFactorThreshold !== 'number') {
            return NextResponse.json({ success: false, error: 'healthFactorThreshold must be a number' }, { status: 400 });
          }
          if (conditions.healthFactorThreshold < 0) {
            return NextResponse.json({ success: false, error: 'Invalid rule conditions' }, { status: 400 });
          }
        }

        // Validate rule actions
        const validActionTypes = ['NOTIFY', 'AUTO_REPAY', 'COLLATERAL_INCREASE', 'DEBT_REDUCTION'];
        for (const action of actions) {
          if (!validActionTypes.includes(action.type)) {
            return NextResponse.json({ success: false, error: 'Invalid rule actions' }, { status: 400 });
          }
        }

        const rule: VaultProtectionRule = {
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          vaultId: ruleVaultId,
          name,
          description,
          conditions,
          actions,
          enabled,
          priority,
          cooldown,
          lastExecuted: undefined
        };

        protectionRules.set(rule.id, rule);
        return NextResponse.json({ success: true, rule }, { status: 201 });

      case 'update-protection-rule':
        const { ruleId, updates } = params;
        if (!ruleId || !updates) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const existingRule = protectionRules.get(ruleId);
        if (!existingRule) {
          return NextResponse.json({ success: false, error: 'Protection rule not found' }, { status: 404 });
        }

        const updatedRule = { ...existingRule, ...updates };
        protectionRules.set(ruleId, updatedRule);
        return NextResponse.json({ success: true, rule: updatedRule });

      case 'enable-protection':
        const { vaultId: enableVaultId, settings } = params;
        if (!enableVaultId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Validate protection settings
        if (settings) {
          if (settings.threshold !== undefined && (settings.threshold < 0 || settings.threshold > 100)) {
            return NextResponse.json({ success: false, error: 'Invalid protection settings' }, { status: 400 });
          }
          if (settings.cooldown !== undefined && settings.cooldown < 0) {
            return NextResponse.json({ success: false, error: 'Invalid protection settings' }, { status: 400 });
          }
        }

        const protectionSettings = {
          enabled: true,
          threshold: settings?.threshold || 85,
          cooldown: settings?.cooldown || 3600
        };

        vaultProtectionSettings.set(enableVaultId, protectionSettings);
        return NextResponse.json({ 
          success: true, 
          message: 'Protection enabled',
          settings: protectionSettings
        });

      case 'disable-protection':
        const { vaultId: disableVaultId } = params;
        if (!disableVaultId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const currentSettings = vaultProtectionSettings.get(disableVaultId);
        if (currentSettings) {
          currentSettings.enabled = false;
          vaultProtectionSettings.set(disableVaultId, currentSettings);
        }

        return NextResponse.json({ success: true, message: 'Protection disabled' });

      case 'simulate-liquidation':
        const { vaultId: simVaultId, scenario } = params;
        if (!simVaultId || !scenario) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Validate liquidation scenario
        if (scenario.ltv < 0 || scenario.ltv > 100) {
          return NextResponse.json({ success: false, error: 'Invalid liquidation scenario' }, { status: 400 });
        }
        if (scenario.healthFactor < 0) {
          return NextResponse.json({ success: false, error: 'Invalid liquidation scenario' }, { status: 400 });
        }
        if (scenario.marketVolatility <= 0) {
          return NextResponse.json({ success: false, error: 'Invalid liquidation scenario' }, { status: 400 });
        }

        // Simulate liquidation trigger
        const triggered = scenario.ltv > 80 || scenario.healthFactor < 1.1;
        const recommendations = triggered ? [
          'Immediate action required: LTV exceeds critical threshold',
          'Consider reducing debt or increasing collateral',
          'Monitor market conditions closely'
        ] : [
          'Vault is currently within safe parameters',
          'Continue monitoring for any changes'
        ];

        return NextResponse.json({
          success: true,
          simulation: {
            triggered,
            scenario,
            recommendations,
            timestamp: new Date()
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in liquidation protection API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
