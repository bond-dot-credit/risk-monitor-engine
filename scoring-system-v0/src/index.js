#!/usr/bin/env node

import { ScoringSystem } from './scorer.js';
import winston from 'winston';
import fs from 'fs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * v0 Scoring System Demo
 */
async function main() {
  logger.info('🚀 Bond.Credit v0 Scoring System');
  
  const scorer = new ScoringSystem();
  
  // Sample opportunity data
  const opportunities = [
    {
      id: 1,
      name: 'NEAR Staking Pool',
      performance: {
        apy7d: 12.5,
        apy30d: 12.2,
        targetApy: 12.0
      },
      reliability: {
        successRate: 95.5,
        avgGasUsed: 45000000000000,
        avgLatency: 1800,
        totalIntents: 150
      },
      safety: {
        isAudited: true,
        hasIncidents: false,
        auditDate: '2024-01-15',
        lastIncident: null
      }
    },
    {
      id: 2,
      name: 'USDC Lending Pool',
      performance: {
        apy7d: 8.2,
        apy30d: 8.1,
        targetApy: 8.0
      },
      reliability: {
        successRate: 92.3,
        avgGasUsed: 35000000000000,
        avgLatency: 2200,
        totalIntents: 89
      },
      safety: {
        isAudited: true,
        hasIncidents: true,
        auditDate: '2023-06-10',
        lastIncident: '2024-02-01'
      }
    },
    {
      id: 3,
      name: 'Liquidity Provision Pool',
      performance: {
        apy7d: 15.8,
        apy30d: 14.9,
        targetApy: 15.0
      },
      reliability: {
        successRate: 88.7,
        avgGasUsed: 60000000000000,
        avgLatency: 3200,
        totalIntents: 45
      },
      safety: {
        isAudited: false,
        hasIncidents: false,
        auditDate: null,
        lastIncident: null
      }
    }
  ];

  logger.info('📊 Calculating trust scores...\n');

  // Calculate scores for all opportunities
  const scoredOpportunities = scorer.calculateBatchScores(opportunities);

  // Display results
  scoredOpportunities.forEach(opp => {
    const score = opp.score;
    logger.info(`${opp.name}:`);
    logger.info(`  Total Score: ${score.totalScore}/100 ${score.riskLevel.emoji}`);
    logger.info(`  Risk Level: ${score.riskLevel.level} (${score.riskLevel.description})`);
    logger.info(`  Performance: ${score.performanceScore}/40`);
    logger.info(`  Reliability: ${score.reliabilityScore}/40`);
    logger.info(`  Safety: ${score.safetyScore}/20\n`);
  });

  // Show scoring explanation
  logger.info('📋 Scoring System Explanation:');
  const explanation = scorer.getScoringExplanation();
  logger.info(`Total Max Score: ${explanation.totalMaxScore}`);
  logger.info(`Performance (${explanation.breakdown.performance.maxScore} pts): ${explanation.breakdown.performance.description}`);
  logger.info(`Reliability (${explanation.breakdown.reliability.maxScore} pts): ${explanation.breakdown.reliability.description}`);
  logger.info(`Safety (${explanation.breakdown.safety.maxScore} pts): ${explanation.breakdown.safety.description}\n`);

  logger.info('🎯 Risk Levels:');
  Object.entries(explanation.riskLevels).forEach(([level, data]) => {
    logger.info(`${data.emoji} ${level.toUpperCase()}: ${data.min}-${data.max} points (${data.description})`);
  });

  logger.info('\n✅ Scoring system demo completed!');
}

// Create logs directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Run the demo
main().catch(error => {
  logger.error('Error running scoring system:', error);
  process.exit(1);
});
