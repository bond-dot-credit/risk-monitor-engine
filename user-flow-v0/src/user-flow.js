import winston from 'winston';
import chalk from 'chalk';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Bond.Credit v0 User Flow Manager
 * Orchestrates: Deposit → Allocate → Withdraw → Score Update
 */
export class UserFlowManager {
  constructor(config) {
    this.config = config;
    this.flowState = {
      currentUser: null,
      selectedOpportunity: null,
      userVaultBalance: 0,
      userShares: 0,
      activeAllocations: new Map(),
      transactionHistory: []
    };
  }

  /**
   * 1. DEPOSIT FLOW
   * User deposits into Vault and chooses an opportunity
   */
  async initiateDeposit(userId, tokenType, amount, opportunityId) {
    logger.info(`💰 User ${userId} initiating deposit: ${amount} ${tokenType} to opportunity ${opportunityId}`);
    
    try {
      // Step 1: Validate opportunity exists and get trust score
      const opportunity = await this.getOpportunityDetails(opportunityId);
      if (!opportunity) {
        throw new Error(`Opportunity ${opportunityId} not found`);
      }

      logger.info(`📊 Opportunity trust score: ${opportunity.trustScore}/100 ${this.getRiskEmoji(opportunity.trustScore)}`);

      // Step 2: Call vault contract to deposit
      const depositResult = await this.executeVaultDeposit(userId, tokenType, amount);
      
      // Step 3: Update user's vault balance and shares
      await this.updateUserVaultState(userId, depositResult);
      
      // Step 4: Log transaction
      this.logTransaction('deposit', {
        userId,
        tokenType,
        amount,
        opportunityId,
        sharesReceived: depositResult.sharesReceived,
        txHash: depositResult.txHash,
        timestamp: Date.now()
      });

      logger.info(chalk.green(`✅ Deposit successful! Received ${depositResult.sharesReceived} vault shares`));
      
      return {
        success: true,
        sharesReceived: depositResult.sharesReceived,
        opportunity: opportunity,
        txHash: depositResult.txHash
      };

    } catch (error) {
      logger.error(chalk.red(`❌ Deposit failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * 2. ALLOCATE FLOW  
   * Executor moves funds into the strategy via NEAR Intents
   */
  async initiateAllocation(userId, opportunityId, amount) {
    logger.info(`🔄 User ${userId} requesting allocation: ${amount} to opportunity ${opportunityId}`);
    
    try {
      // Step 1: Verify user has sufficient vault shares
      const userShares = await this.getUserVaultShares(userId);
      if (userShares < amount) {
        throw new Error(`Insufficient vault shares. Available: ${userShares}, Requested: ${amount}`);
      }

      // Step 2: Check opportunity capacity and trust score
      const opportunity = await this.getOpportunityDetails(opportunityId);
      if (!opportunity || opportunity.trustScore < 50) {
        throw new Error(`Opportunity ${opportunityId} not available or below minimum trust score`);
      }

      // Step 3: Trigger executor bot to move funds
      const allocationResult = await this.executeAllocationIntent(userId, opportunityId, amount);
      
      // Step 4: Update allocation tracking
      this.flowState.activeAllocations.set(`${userId}-${opportunityId}`, {
        amount,
        opportunityId,
        allocatedAt: Date.now(),
        status: 'active',
        txHash: allocationResult.txHash
      });

      // Step 5: Log transaction
      this.logTransaction('allocation', {
        userId,
        opportunityId,
        amount,
        txHash: allocationResult.txHash,
        gasUsed: allocationResult.gasUsed,
        latency: allocationResult.latency,
        timestamp: Date.now()
      });

      logger.info(chalk.green(`✅ Allocation successful! Gas used: ${allocationResult.gasUsed}, Latency: ${allocationResult.latency}ms`));
      
      return {
        success: true,
        allocationId: `${userId}-${opportunityId}`,
        txHash: allocationResult.txHash,
        gasUsed: allocationResult.gasUsed,
        latency: allocationResult.latency
      };

    } catch (error) {
      logger.error(chalk.red(`❌ Allocation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * 3. WITHDRAW FLOW
   * User burns LP tokens → receives deposit + yield
   */
  async initiateWithdrawal(userId, tokenType, sharesToBurn) {
    logger.info(`📤 User ${userId} initiating withdrawal: ${sharesToBurn} shares for ${tokenType}`);
    
    try {
      // Step 1: Verify user has sufficient shares
      const userShares = await this.getUserVaultShares(userId);
      if (userShares < sharesToBurn) {
        throw new Error(`Insufficient shares. Available: ${userShares}, Requested: ${sharesToBurn}`);
      }

      // Step 2: Calculate withdrawal amount including yield
      const withdrawalCalculation = await this.calculateWithdrawalAmount(sharesToBurn);
      
      // Step 3: Execute withdrawal from vault
      const withdrawalResult = await this.executeVaultWithdrawal(userId, tokenType, sharesToBurn);
      
      // Step 4: Update user state
      await this.updateUserVaultState(userId, {
        sharesBurned: sharesToBurn,
        tokensReceived: withdrawalCalculation.tokensReceived
      });

      // Step 5: Log transaction
      this.logTransaction('withdrawal', {
        userId,
        tokenType,
        sharesBurned: sharesToBurn,
        tokensReceived: withdrawalCalculation.tokensReceived,
        yieldEarned: withdrawalCalculation.yieldEarned,
        txHash: withdrawalResult.txHash,
        timestamp: Date.now()
      });

      logger.info(chalk.green(`✅ Withdrawal successful! Received ${withdrawalCalculation.tokensReceived} ${tokenType} (Yield: ${withdrawalCalculation.yieldEarned})`));
      
      return {
        success: true,
        tokensReceived: withdrawalCalculation.tokensReceived,
        yieldEarned: withdrawalCalculation.yieldEarned,
        txHash: withdrawalResult.txHash
      };

    } catch (error) {
      logger.error(chalk.red(`❌ Withdrawal failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * 4. SCORE UPDATE FLOW
   * Registry updates scores daily (manual for v0)
   */
  async updateOpportunityScores() {
    logger.info(`📊 Updating opportunity scores...`);
    
    try {
      const opportunities = await this.getAllOpportunities();
      const updatedScores = [];

      for (const opportunity of opportunities) {
        // Calculate new score based on recent performance
        const newScore = await this.calculateOpportunityScore(opportunity.id);
        
        // Update registry with new score
        await this.updateRegistryScore(opportunity.id, newScore);
        
        updatedScores.push({
          id: opportunity.id,
          name: opportunity.name,
          oldScore: opportunity.trustScore,
          newScore: newScore,
          change: newScore - opportunity.trustScore
        });

        logger.info(`📈 ${opportunity.name}: ${opportunity.trustScore} → ${newScore} (${newScore > opportunity.trustScore ? '+' : ''}${newScore - opportunity.trustScore})`);
      }

      logger.info(chalk.green(`✅ Updated ${updatedScores.length} opportunity scores`));
      
      return {
        success: true,
        updatedCount: updatedScores.length,
        updates: updatedScores
      };

    } catch (error) {
      logger.error(chalk.red(`❌ Score update failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * HELPER METHODS
   */
  
  async getOpportunityDetails(opportunityId) {
    // Mock implementation - would call registry contract
    const mockOpportunities = {
      1: { id: 1, name: 'NEAR Staking', trustScore: 87, category: 'staking', apy: 12.2 },
      2: { id: 2, name: 'USDC Lending', trustScore: 72, category: 'lending', apy: 8.1 },
      3: { id: 3, name: 'Liquidity Pool', trustScore: 58, category: 'liquidity', apy: 14.9 }
    };
    return mockOpportunities[opportunityId] || null;
  }

  async executeVaultDeposit(userId, tokenType, amount) {
    // Mock implementation - would call vault contract
    return {
      sharesReceived: Math.floor(amount * 1000000), // 1:1 ratio for simplicity
      txHash: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async executeVaultWithdrawal(userId, tokenType, sharesToBurn) {
    // Mock implementation - would call vault contract
    return {
      txHash: `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async executeAllocationIntent(userId, opportunityId, amount) {
    // Mock implementation - would trigger executor bot
    return {
      txHash: `allocate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gasUsed: Math.floor(Math.random() * 50000000000000) + 20000000000000,
      latency: Math.floor(Math.random() * 3000) + 1000
    };
  }

  async getUserVaultShares(userId) {
    // Mock implementation - would query vault contract
    return this.flowState.userShares || 0;
  }

  async calculateWithdrawalAmount(sharesToBurn) {
    // Mock implementation - would calculate based on vault reserves
    const baseAmount = sharesToBurn / 1000000;
    const yieldRate = 0.15; // 15% APY
    const yieldEarned = baseAmount * yieldRate;
    
    return {
      tokensReceived: baseAmount + yieldEarned,
      yieldEarned: yieldEarned
    };
  }

  async updateUserVaultState(userId, update) {
    if (update.sharesReceived) {
      this.flowState.userShares += update.sharesReceived;
    }
    if (update.sharesBurned) {
      this.flowState.userShares -= update.sharesBurned;
    }
  }

  async getAllOpportunities() {
    // Mock implementation - would call registry contract
    return [
      { id: 1, name: 'NEAR Staking', trustScore: 87, category: 'staking' },
      { id: 2, name: 'USDC Lending', trustScore: 72, category: 'lending' },
      { id: 3, name: 'Liquidity Pool', trustScore: 58, category: 'liquidity' }
    ];
  }

  async calculateOpportunityScore(opportunityId) {
    // Mock implementation - would use scoring system
    const baseScore = 60 + Math.floor(Math.random() * 40);
    return Math.min(100, Math.max(0, baseScore));
  }

  async updateRegistryScore(opportunityId, newScore) {
    // Mock implementation - would call registry contract
    logger.info(`Updating registry: Opportunity ${opportunityId} → Score ${newScore}`);
  }

  getRiskEmoji(score) {
    if (score < 50) return '🚨';
    if (score < 80) return '✅';
    return '⭐';
  }

  logTransaction(type, data) {
    this.flowState.transactionHistory.push({ type, ...data });
    logger.info(`📝 Transaction logged: ${type}`, data);
  }

  /**
   * Get user's complete flow state
   */
  getUserFlowState(userId) {
    return {
      userId,
      vaultShares: this.flowState.userShares,
      activeAllocations: Array.from(this.flowState.activeAllocations.entries())
        .filter(([key]) => key.startsWith(userId))
        .map(([key, value]) => value),
      transactionHistory: this.flowState.transactionHistory
        .filter(tx => tx.userId === userId)
    };
  }
}
