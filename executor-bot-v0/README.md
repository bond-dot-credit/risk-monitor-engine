# Bond.Credit Executor Bot v0

## Overview

The Executor Bot is the fourth core component of the Bond.Credit system that provides:
- **Deposit Monitoring**: Watch deposits from Vault contract
- **Intent Execution**: Execute NEAR Intents to move capital into chosen opportunities
- **Withdrawal Handling**: Pull funds back for withdrawals
- **Event Emission**: Emit IntentExecuted(success, gasUsed, latencyMs) events

## Features

### ✅ Core Functionality
- **Real-time Monitoring**: Continuous blockchain monitoring for deposit/withdrawal events
- **Automated Allocation**: Execute NEAR intents to allocate capital to opportunities
- **Automated Withdrawal**: Pull funds back from opportunities on user withdrawal
- **Performance Tracking**: Monitor gas usage, latency, and success rates
- **Event Emission**: Emit IntentExecuted events with detailed metrics

### 🔧 Technical Details
- **Node.js + near-api-js**: Built with latest NEAR protocol features
- **Real-time Monitoring**: Poll-based blockchain event monitoring
- **Multi-strategy Support**: Staking, Lending, Liquidity provision
- **Performance Metrics**: Comprehensive monitoring and logging
- **Web API**: Health checks and metrics endpoint

## Architecture

### Components
```
ExecutorBot
├── DepositMonitor      # Watches vault deposit events
├── WithdrawalMonitor   # Watches vault withdrawal events
├── IntentExecutor      # Executes NEAR intents
└── WebServer          # Health checks and metrics
```

### Data Flow
```
1. User deposits → Vault Contract → Deposit Event
2. DepositMonitor detects event → IntentExecutor
3. IntentExecutor allocates to opportunity → IntentExecuted Event
4. User withdraws → Vault Contract → Withdrawal Event
5. WithdrawalMonitor detects event → IntentExecutor
6. IntentExecutor deallocates from opportunity → IntentExecuted Event
```

## Configuration

### Environment Variables
```bash
# NEAR Configuration
NEAR_NETWORK_ID=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org
NEAR_HELPER_URL=https://helper.testnet.near.org

# Executor Bot Configuration
EXECUTOR_ACCOUNT_ID=executor-bot.testnet
EXECUTOR_PRIVATE_KEY=your_private_key_here
EXECUTOR_MASTER_ACCOUNT=your_master_account.testnet

# Contract Addresses
VAULT_CONTRACT_ID=vault-contract-v0.your-account.testnet
REGISTRY_CONTRACT_ID=registry-contract-v0.your-account.testnet

# Monitoring Configuration
POLL_INTERVAL_MS=5000
MAX_RETRIES=3
RETRY_DELAY_MS=2000

# Performance Configuration
MAX_CONCURRENT_INTENTS=10
INTENT_TIMEOUT_MS=30000
GAS_LIMIT=300000000000000
```

## Installation

### Prerequisites
1. **Node.js 18+**: Latest LTS version
2. **NEAR Account**: With testnet NEAR tokens
3. **Deployed Contracts**: Vault and Registry contracts

### Quick Setup
```bash
# Clone and navigate to executor bot
cd executor-bot-v0

# Copy environment template
cp env.example .env

# Edit configuration
nano .env

# Install dependencies
npm install

# Start the bot
./start.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Create logs directory
mkdir -p logs

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Start the bot
npm start
```

## Usage

### Starting the Bot
```bash
# Using start script (recommended)
./start.sh

# Or directly with npm
npm start

# Development mode with auto-restart
npm run dev
```

### Monitoring the Bot
The bot provides several monitoring endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Performance metrics
curl http://localhost:3000/metrics

# Active intents
curl http://localhost:3000/intents
```

### Health Check Response
```json
{
  "status": "healthy",
  "uptime": "3600s",
  "isRunning": true,
  "metrics": {
    "totalIntents": 150,
    "successfulIntents": 142,
    "failedIntents": 8,
    "successRate": "94.67%",
    "averageLatency": "1250ms"
  }
}
```

## Monitoring and Logging

### Log Files
- **Main Log**: `logs/executor-bot.log`
- **Error Log**: `logs/error.log`

### Log Levels
- **INFO**: General operation information
- **WARN**: Warning messages
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information

### Performance Metrics
- **Total Intents**: Total number of intents executed
- **Success Rate**: Percentage of successful intents
- **Average Latency**: Average execution time in milliseconds
- **Average Gas Used**: Average gas consumption per intent
- **Uptime**: Bot running time in seconds

## Intent Execution

### Supported Strategies
1. **Staking**: Stake tokens for rewards
2. **Lending**: Lend tokens for interest
3. **Liquidity**: Provide liquidity for trading fees

### Intent Flow
```
1. Detect Event → Generate Intent Hash
2. Execute Strategy Contract Call
3. Track Performance Metrics
4. Emit IntentExecuted Event
5. Log Results
```

### Intent Hash Format
```
{accountId}-{opportunityId}-{amount}-{strategy}-{timestamp}-{nonce}
```

## Event Emission

### IntentExecuted Event Format
```json
{
  "intentHash": "user.testnet-1-1000000000000000000000000-Staking-1640995200000-abc123",
  "success": true,
  "gasUsed": "50000000000000",
  "latencyMs": 1250,
  "opportunityId": 1,
  "accountId": "user.testnet",
  "amount": "1000000000000000000000000",
  "strategy": "Staking",
  "timestamp": 1640995200000
}
```

## Testing

### Test Deposit Flow
1. **Deploy Contracts**: Ensure Vault and Registry contracts are deployed
2. **Start Bot**: Run the executor bot
3. **Make Deposit**: Deposit tokens to vault contract
4. **Monitor Logs**: Check bot logs for deposit detection and intent execution
5. **Verify Allocation**: Check opportunity contract for allocation

### Test Withdrawal Flow
1. **Ensure Allocation**: Have funds allocated to opportunities
2. **Make Withdrawal**: Withdraw tokens from vault contract
3. **Monitor Logs**: Check bot logs for withdrawal detection and deallocation
4. **Verify Deallocation**: Check opportunity contract for withdrawal

### Manual Testing
```bash
# Check bot health
curl http://localhost:3000/health

# View active intents
curl http://localhost:3000/intents

# Monitor logs
tail -f logs/executor-bot.log
```

## Troubleshooting

### Common Issues

#### Bot Not Starting
- **Check Configuration**: Verify all required environment variables
- **Check Dependencies**: Ensure all npm packages are installed
- **Check Logs**: Review error logs for specific issues

#### No Events Detected
- **Check Network**: Verify NEAR network connectivity
- **Check Contracts**: Ensure contracts are deployed and accessible
- **Check Polling**: Verify polling interval configuration

#### Intent Execution Failures
- **Check Gas Limits**: Ensure sufficient gas limits
- **Check Account Balance**: Verify executor account has enough NEAR
- **Check Strategy Contracts**: Ensure opportunity contracts are deployed

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# View detailed logs
tail -f logs/executor-bot.log | grep DEBUG
```

## Security Considerations

### v0 Limitations
- **Single Account**: Uses single executor account for all operations
- **No Authentication**: Web endpoints are not authenticated
- **Basic Validation**: Simple input validation only

### Future Improvements
- **Multi-signature**: Require multiple signatures for critical operations
- **Authentication**: Add API authentication for web endpoints
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Encryption**: Encrypt sensitive data in logs

## Performance Optimization

### Current Optimizations
- **Batch Processing**: Process multiple events in batches
- **Connection Pooling**: Reuse NEAR connections
- **Memory Management**: Clean up completed intents
- **Async Operations**: Non-blocking event processing

### Future Optimizations
- **Database Integration**: Store state in database for persistence
- **Message Queues**: Use Redis/RabbitMQ for event processing
- **Load Balancing**: Distribute load across multiple bot instances
- **Caching**: Cache frequently accessed data

## Integration

### With Frontend
The bot provides REST API endpoints for monitoring:
```javascript
// Health check
const health = await fetch('http://localhost:3000/health').then(r => r.json());

// Performance metrics
const metrics = await fetch('http://localhost:3000/metrics').then(r => r.json());
```

### With External Systems
The bot can be integrated with external monitoring systems:
- **Prometheus**: Export metrics for monitoring
- **Grafana**: Create dashboards for visualization
- **Webhooks**: Send notifications on events
- **Databases**: Store execution history

## Next Steps

This executor bot is the foundation for automated intent execution in the Bond.Credit system. Next components:

1. **Scoring System** - Automated trust score calculation
2. **Frontend Integration** - User interface for monitoring
3. **Advanced Strategies** - More sophisticated allocation algorithms

## Support

For issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main project README
- **Community**: Join our Discord/Telegram for support
