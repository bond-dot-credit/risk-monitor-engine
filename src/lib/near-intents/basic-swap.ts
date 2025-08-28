import { AIAgent } from './ai-agent';

/**
 * Basic example of using the NEAR Intents AI Agent for token swaps
 */
async function basicSwapExample() {
  try {
    // Initialize agent with account configuration
    const agent = new AIAgent({
      accountId: 'your-account.near',
      privateKey: 'ed25519:your-private-key-here',
    });

    // Check account state
    const accountState = await agent.getAccountState();
    const balanceNear = parseFloat(accountState.amount) / 10 ** 24;

    console.log(`Account balance: ${balanceNear} NEAR`);

    if (balanceNear > 1.0) {
      // Deposit NEAR for operations
      const depositSuccess = await agent.depositNear(1.0);
      if (depositSuccess) {
        console.log('Successfully deposited 1.0 NEAR');
        
        // Swap NEAR to USDC
        const result = await agent.swapNearToToken('USDC', 1.0);
        
        if (result.success) {
          console.log(`Swap completed successfully! Transaction hash: ${result.transactionHash}`);
        } else {
          console.error(`Swap failed: ${result.error}`);
        }
      } else {
        console.error('Failed to deposit NEAR');
      }
    } else {
      console.log('Insufficient balance for swap operation');
    }
  } catch (error) {
    console.error('Error in basic swap example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicSwapExample();
}

export { basicSwapExample };