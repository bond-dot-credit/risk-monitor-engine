#!/usr/bin/env node

import { connect, keyStores, utils } from 'near-api-js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import winston from 'winston';

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
    }),
    new winston.transports.File({ filename: 'logs/scoring-updates.log' })
  ]
});

/**
 * Bond.Credit v0 Scoring Updater
 * Manual inputs + intent success rate calculation
 */
class ScoringUpdater {
  constructor() {
    this.nearConnection = null;
    this.account = null;
    this.registryContract = null;
  }

  async initialize() {
    // Initialize NEAR connection
    const config = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      walletUrl: 'https://testnet.mynearwallet.com/',
      helperUrl: 'https://helper.testnet.near.org',
    };

    this.nearConnection = await connect(config);
    this.account = await this.nearConnection.account(process.env.NEAR_ACCOUNT_ID || '');
    
    // Initialize registry contract
    this.registryContract = new utils.Contract(
      this.account,
      process.env.REGISTRY_CONTRACT_ID || '',
      {
        viewMethods: ['get_opportunities', 'get_opportunity'],
        changeMethods: ['update_opportunity_score']
      }
    );

    logger.info('✅ Scoring updater initialized');
  }

  async getManualInputs() {
    console.log(chalk.blue.bold('\n📊 Bond.Credit v0 Scoring Updater'));
    console.log(chalk.gray('Manual score inputs + intent success rate calculation\n'));

    // Get opportunities from registry
    const opportunities = await this.registryContract.get_opportunities({ limit: 10, from_index: 0 });
    
    const manualInputs = [];

    for (const opp of opportunities) {
      console.log(chalk.yellow(`\n=== ${opp.name} (Current Score: ${opp.trust_score}/100) ===`));

      const inputs = await inquirer.prompt([
        {
          type: 'input',
          name: 'apy7d',
          message: '7-day APY (%):',
          default: '0',
          validate: (input) => !isNaN(input) || 'Please enter a valid number'
        },
        {
          type: 'input',
          name: 'apy30d',
          message: '30-day APY (%):',
          default: '0',
          validate: (input) => !isNaN(input) || 'Please enter a valid number'
        },
        {
          type: 'input',
          name: 'successRate',
          message: 'Intent success rate (%):',
          default: '95',
          validate: (input) => {
            const num = parseFloat(input);
            return (num >= 0 && num <= 100) || 'Please enter a percentage between 0-100';
          }
        },
        {
          type: 'input',
          name: 'avgGasUsed',
          message: 'Average gas used (TGas):',
          default: '40',
          validate: (input) => !isNaN(input) || 'Please enter a valid number'
        },
        {
          type: 'input',
          name: 'avgLatency',
          message: 'Average latency (ms):',
          default: '2000',
          validate: (input) => !isNaN(input) || 'Please enter a valid number'
        },
        {
          type: 'confirm',
          name: 'isAudited',
          message: 'Is this protocol audited?',
          default: true
        },
        {
          type: 'confirm',
          name: 'hasIncidents',
          message: 'Any recent incidents?',
          default: false
        }
      ]);

      manualInputs.push({
        opportunityId: opp.id,
        name: opp.name,
        ...inputs
      });
    }

    return manualInputs;
  }

  calculateScore(inputs) {
    // Performance Score (0-40 pts)
    const apy = parseFloat(inputs.apy30d || inputs.apy7d || '0');
    let performanceScore = 0;
    
    if (apy < 5) {
      performanceScore = Math.floor((apy / 5) * 10);
    } else if (apy < 10) {
      performanceScore = 10 + Math.floor(((apy - 5) / 5) * 10);
    } else if (apy < 15) {
      performanceScore = 20 + Math.floor(((apy - 10) / 5) * 10);
    } else {
      performanceScore = 30 + Math.min(10, Math.floor((apy - 15) / 5) * 10);
    }

    // Reliability Score (0-40 pts)
    const successRate = parseFloat(inputs.successRate);
    const avgGasUsed = parseFloat(inputs.avgGasUsed) * 1e12; // Convert to yoctoNEAR
    const avgLatency = parseFloat(inputs.avgLatency);

    const successScore = Math.floor((successRate / 100) * 25);
    
    let gasScore = 0;
    if (avgGasUsed < 20e12) gasScore = 10;
    else if (avgGasUsed < 40e12) gasScore = 8;
    else if (avgGasUsed < 60e12) gasScore = 6;
    else if (avgGasUsed < 80e12) gasScore = 4;
    else if (avgGasUsed < 100e12) gasScore = 2;

    let latencyScore = 0;
    if (avgLatency < 1000) latencyScore = 5;
    else if (avgLatency < 2000) latencyScore = 4;
    else if (avgLatency < 3000) latencyScore = 3;
    else if (avgLatency < 5000) latencyScore = 2;
    else if (avgLatency < 10000) latencyScore = 1;

    const reliabilityScore = Math.min(40, successScore + gasScore + latencyScore);

    // Safety Score (0-20 pts)
    let safetyScore = 0;
    if (inputs.isAudited) {
      safetyScore = 15;
      safetyScore += 3; // Recent audit bonus (simplified)
    }
    if (inputs.hasIncidents) {
      safetyScore -= 5; // Incident penalty
    }
    safetyScore = Math.max(0, Math.min(20, safetyScore));

    const totalScore = performanceScore + reliabilityScore + safetyScore;

    return {
      totalScore,
      performanceScore,
      reliabilityScore,
      safetyScore,
      breakdown: {
        performance: { score: performanceScore, max: 40 },
        reliability: { score: reliabilityScore, max: 40 },
        safety: { score: safetyScore, max: 20 }
      }
    };
  }

  getRiskLevel(score) {
    if (score < 50) return { level: 'Caution', emoji: '🚨', color: 'red' };
    if (score < 80) return { level: 'Moderate', emoji: '✅', color: 'yellow' };
    return { level: 'Preferred', emoji: '⭐', color: 'green' };
  }

  async updateRegistryScores(scoreData) {
    console.log(chalk.blue.bold('\n🔄 Updating Registry Scores...\n'));

    for (const data of scoreData) {
      const { opportunityId, name, oldScore, newScore } = data;
      
      try {
        // Update score in registry contract
        await this.registryContract.update_opportunity_score({
          opportunity_id: opportunityId,
          new_score: newScore
        });

        const risk = this.getRiskLevel(newScore);
        const change = newScore - oldScore;
        const changeStr = change > 0 ? `+${change}` : change.toString();

        console.log(chalk[risk.color](`${risk.emoji} ${name}: ${oldScore} → ${newScore} (${changeStr})`));
        
        logger.info('Score updated', {
          opportunityId,
          name,
          oldScore,
          newScore,
          change
        });

      } catch (error) {
        console.log(chalk.red(`❌ Failed to update ${name}: ${error.message}`));
        logger.error('Score update failed', { opportunityId, name, error: error.message });
      }
    }

    console.log(chalk.green.bold('\n✅ All scores updated successfully!'));
  }

  async run() {
    try {
      await this.initialize();

      // Get manual inputs
      const manualInputs = await this.getManualInputs();

      // Calculate new scores
      console.log(chalk.blue.bold('\n📊 Calculating New Scores...\n'));

      const scoreUpdates = [];

      for (const inputs of manualInputs) {
        const scoreData = this.calculateScore(inputs);
        const risk = this.getRiskLevel(scoreData.totalScore);

        console.log(chalk.cyan(`\n${inputs.name}:`));
        console.log(`  Performance: ${scoreData.performanceScore}/40`);
        console.log(`  Reliability: ${scoreData.reliabilityScore}/40`);
        console.log(`  Safety: ${scoreData.safetyScore}/20`);
        console.log(chalk[risk.color](`  Total: ${scoreData.totalScore}/100 ${risk.emoji} ${risk.level}`));

        scoreUpdates.push({
          opportunityId: inputs.opportunityId,
          name: inputs.name,
          oldScore: inputs.currentScore || 0,
          newScore: scoreData.totalScore
        });
      }

      // Confirm updates
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: '\nProceed with score updates?',
        default: true
      }]);

      if (confirm) {
        await this.updateRegistryScores(scoreUpdates);
      } else {
        console.log(chalk.yellow('Score updates cancelled.'));
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      logger.error('Scoring updater failed', { error: error.message });
      process.exit(1);
    }
  }
}

// Create logs directory
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Run the updater
const updater = new ScoringUpdater();
updater.run();
