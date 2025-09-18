import { AIAgent } from './ai-agent';
import { nearIntentsConfig, NearIntentsErrorHandler, RetryUtils, TransactionUtils } from './index';

/**
 * Basic example of using the NEAR Intents AI Agent for token swaps with real error handling
 */
async function basicSwapExample() {
  try {
    // Validate configuration first
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      console.error('Configuration errors:', configValidation.errors);
      console.error('Please set up your environment variables according to .env.example');
      return;
    }

    // Initialize agent with real configuration
    const accountConfig = nearIntentsConfig.getAccountConfig();
    const agent = new AIAgent(accountConfig);

    console.log(`Initializing NEAR Intents agent for account: ${accountConfig.accountId}`);
    console.log(`Network: ${accountConfig.networkId}`);

    // Initialize with retry logic
    await RetryUtils.withRetry(async () => {
      await agent.initialize();
    }, 3, 2000);

    console.log('Agent initialized successfully!');

    // Check account state with proper error handling
    const accountState = await RetryUtils.withRetry(async () => {
      return await agent.getAccountState();
    }, 2, 1000);

    const availableNear = (accountState.balanceInNear as { available: number }).available;
    console.log(`Account balance: ${TransactionUtils.formatNearAmount(availableNear)}`);
    console.log(`Total balance: ${TransactionUtils.formatNearAmount((accountState.balanceInNear as { total: number }).total)}`);
    console.log(`Staked: ${TransactionUtils.formatNearAmount((accountState.balanceInNear as { staked: number }).staked)}`);

    // Check if we have sufficient balance for operations
    const requiredAmount = 1.0;
    if (availableNear > requiredAmount + 0.1) { // Keep 0.1 NEAR for fees
      console.log(`\nAttempting to deposit ${requiredAmount} NEAR...`);
      
      // Deposit NEAR for operations with retry logic
      const depositSuccess = await RetryUtils.withRetry(async () => {
        return await agent.depositNear(requiredAmount);
      }, 3, 5000);
      
      if (depositSuccess) {
        console.log(`\u2705 Successfully deposited ${requiredAmount} NEAR`);
        
        console.log(`\nAttempting to swap ${requiredAmount} NEAR to USDC...`);
        
        // Swap NEAR to USDC with retry logic
        const result = await RetryUtils.withRetry(async () => {
          return await agent.swapNearToToken('USDC', requiredAmount);
        }, 3, 10000); // Longer delay for swap operations
        
        if (result.success) {
          console.log(`\u2705 Swap completed successfully!`);
          console.log(`Transaction hash: ${result.transactionHash}`);
          console.log(`Agent ID: ${result.agentId || 'N/A'}`);
        } else {
          const error = NearIntentsErrorHandler.parseError(result.error);
          console.error(`\u274c Swap failed: ${NearIntentsErrorHandler.formatUserMessage(error)}`);
          
          if (NearIntentsErrorHandler.isRetryable(error)) {
            console.log(`Error is retryable. You can try again in ${NearIntentsErrorHandler.getRetryDelay(error)} seconds.`);
          }
        }
      } else {
        console.error('\u274c Failed to deposit NEAR');
      }
    } else {
      console.log(`\u26a0\ufe0f Insufficient balance for swap operation`);
      console.log(`Required: ${TransactionUtils.formatNearAmount(requiredAmount + 0.1)} (including fees)`);
      console.log(`Available: ${TransactionUtils.formatNearAmount(availableNear)}`);
      console.log('Please add more NEAR to your account.');
    }
  } catch (error) {
    const nearError = NearIntentsErrorHandler.parseError(error);
    console.error('\u274c Error in basic swap example:');
    console.error(`Type: ${nearError.type}`);
    console.error(`Message: ${NearIntentsErrorHandler.formatUserMessage(nearError)}`);
    
    if (nearError.details) {
      console.error('Details:', nearError.details);
    }
    
    if (nearError.type === 'CONFIGURATION_ERROR') {
      console.error('\nPlease check your .env file and ensure all required variables are set.');
    }
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicSwapExample();
}

export { basicSwapExample };