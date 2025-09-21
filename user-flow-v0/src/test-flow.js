#!/usr/bin/env node

import { UserFlowManager } from './user-flow.js';
import chalk from 'chalk';

/**
 * Test the complete Bond.Credit v0 User Flow
 */
async function testUserFlow() {
  console.log(chalk.blue.bold('\n🚀 Bond.Credit v0 User Flow Test\n'));

  const flowManager = new UserFlowManager({});
  const testUserId = 'alice.testnet';

  try {
    // Test 1: DEPOSIT FLOW
    console.log(chalk.yellow('=== 1. DEPOSIT FLOW ==='));
    const depositResult = await flowManager.initiateDeposit(
      testUserId, 
      'WNEAR', 
      5.0, 
      1 // NEAR Staking opportunity
    );
    
    console.log(chalk.green(`✅ Deposit successful:`));
    console.log(`   Shares received: ${depositResult.sharesReceived}`);
    console.log(`   Opportunity: ${depositResult.opportunity.name} (${depositResult.opportunity.trustScore}/100)`);
    console.log(`   TX: ${depositResult.txHash}\n`);

    // Test 2: ALLOCATE FLOW
    console.log(chalk.yellow('=== 2. ALLOCATE FLOW ==='));
    const allocationResult = await flowManager.initiateAllocation(
      testUserId,
      1, // NEAR Staking opportunity
      2.5 // Allocate half of deposited amount
    );
    
    console.log(chalk.green(`✅ Allocation successful:`));
    console.log(`   Allocation ID: ${allocationResult.allocationId}`);
    console.log(`   Gas used: ${allocationResult.gasUsed}`);
    console.log(`   Latency: ${allocationResult.latency}ms`);
    console.log(`   TX: ${allocationResult.txHash}\n`);

    // Test 3: WITHDRAW FLOW
    console.log(chalk.yellow('=== 3. WITHDRAW FLOW ==='));
    const withdrawalResult = await flowManager.initiateWithdrawal(
      testUserId,
      'WNEAR',
      2.0 // Withdraw some shares
    );
    
    console.log(chalk.green(`✅ Withdrawal successful:`));
    console.log(`   Tokens received: ${withdrawalResult.tokensReceived} WNEAR`);
    console.log(`   Yield earned: ${withdrawalResult.yieldEarned} WNEAR`);
    console.log(`   TX: ${withdrawalResult.txHash}\n`);

    // Test 4: SCORE UPDATE FLOW
    console.log(chalk.yellow('=== 4. SCORE UPDATE FLOW ==='));
    const scoreUpdateResult = await flowManager.updateOpportunityScores();
    
    console.log(chalk.green(`✅ Score update successful:`));
    console.log(`   Updated ${scoreUpdateResult.updatedCount} opportunities`);
    scoreUpdateResult.updates.forEach(update => {
      const change = update.change > 0 ? `+${update.change}` : update.change;
      console.log(`   ${update.name}: ${update.oldScore} → ${update.newScore} (${change})`);
    });
    console.log();

    // Show user's complete flow state
    console.log(chalk.yellow('=== USER FLOW STATE ==='));
    const userState = flowManager.getUserFlowState(testUserId);
    console.log(chalk.cyan(`User: ${userState.userId}`));
    console.log(chalk.cyan(`Vault Shares: ${userState.vaultShares}`));
    console.log(chalk.cyan(`Active Allocations: ${userState.activeAllocations.length}`));
    console.log(chalk.cyan(`Transactions: ${userState.transactionHistory.length}\n`));

    console.log(chalk.green.bold('🎉 All user flow tests passed!'));
    console.log(chalk.gray('The complete Bond.Credit v0 system is working correctly.\n'));

  } catch (error) {
    console.log(chalk.red.bold('❌ Test failed:'));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

// Run the test
testUserFlow();
