# Bond.Credit v0 - NEAR DeFi Yield Platform

Complete DeFi yield platform on NEAR Protocol with smart contracts, executor bot, scoring system, and user flow integration.

## 🚀 Quick Start

```bash
# 1. Install NEAR CLI
npm install -g near-cli

# 2. Login to NEAR testnet
near login

# 3. Deploy all contracts
chmod +x deploy-all.sh
./deploy-all.sh

# 4. Start executor bot
cd executor-bot-v0
npm install
npm start

# 5. Update scores manually
cd scoring-updater
npm install
npm run update-scores
```

## 📋 Month 1 Deliverables ✅

### ✅ Core Contracts on NEAR Testnet
- **Vault Contract**: Accept deposits (wNEAR, USDC), mint LP tokens, handle withdrawals
- **Registry Contract**: Lists available yield opportunities with trust scores
- **Opportunity Contracts**: Individual yield strategies (staking, lending, liquidity)

### ✅ 2-3 Sample Opportunities
- **NEAR Staking Pool**: Stake NEAR tokens (12.2% APY, ⭐ 87/100)
- **USDC Lending Pool**: Lend USDC tokens (8.1% APY, ✅ 72/100)  
- **Liquidity Provision Pool**: Provide liquidity (14.9% APY, ✅ 58/100)

### ✅ Executor Bot with Basic Allocation
- Watches deposit events from Vault contract
- Executes NEAR Intents to move capital into opportunities
- Pulls funds back for withdrawals
- Tracks gas usage and latency metrics

### ✅ Complete Event Logging System
- **Deposit Events**: User deposits, shares received, opportunity selection
- **Allocation Events**: Capital allocation, gas used, latency tracking
- **Withdrawal Events**: Share burning, yield earned, token returns
- **Score Events**: Trust score updates, performance tracking
- **Intent Events**: Executor bot actions, success/failure tracking

### ✅ Scoring Updater Script
- Manual APY inputs (7d/30d performance)
- Intent success rate calculation
- Gas efficiency and latency metrics
- Audit status and incident tracking
- Automatic registry score updates

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │  Vault Contract │    │ Registry Contract│
│                 │◄──►│                 │◄──►│                 │
│  Deposit/Withdraw│    │  LP Token Mint  │    │ Opportunity List │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Executor Bot    │    │ Event Logger    │    │ Scoring System  │
│                 │    │                 │    │                 │
│ NEAR Intents    │    │ SQLite Database │    │ Trust Scoring   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Opportunity     │    │ User Flow       │    │ Score Updater   │
│ Contracts       │    │ Manager         │    │                 │
│                 │    │                 │    │ Manual Updates  │
│ Staking/Lending │    │ End-to-End      │    │ Success Tracking│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 User Flow

### 1. 💰 Deposit Flow
```
User → Deposits tokens → Vault Contract → Receives LP shares → Chooses opportunity
```

### 2. 🔄 Allocate Flow  
```
Executor Bot → Watches deposits → Executes NEAR Intents → Moves funds to opportunity
```

### 3. 📤 Withdraw Flow
```
User → Burns LP shares → Vault Contract → Receives tokens + yield
```

### 4. 📊 Score Update Flow
```
Scoring Updater → Manual inputs → Calculates trust scores → Updates registry
```

## 🔧 Setup & Deployment

### Prerequisites
- Node.js 18+
- NEAR CLI (`npm install -g near-cli`)
- Rust toolchain (for smart contracts)
- NEAR testnet account

### 1. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd risk-monitor-engine

# Install dependencies
npm install

# Login to NEAR
near login
```

### 2. Deploy Contracts
```bash
# Deploy all contracts with one command
./deploy-all.sh
```

This script will:
- Deploy Vault contract to `vault-contract-v0.{account}.testnet`
- Deploy Registry contract to `registry-contract-v0.{account}.testnet`  
- Deploy 3 Opportunity contracts (staking, lending, liquidity)
- Add opportunities to registry with initial trust scores
- Verify all deployments

### 3. Start Executor Bot
```bash
cd executor-bot-v0
npm install

# Configure environment
cp env.example .env
# Edit .env with your contract addresses

# Start monitoring
npm start
```

### 4. Update Trust Scores
```bash
cd scoring-updater
npm install

# Run interactive score updater
npm run update-scores
```

Follow prompts to:
- Enter 7d/30d APY data
- Input intent success rates
- Set gas efficiency metrics
- Update audit status
- Track incident history

### 5. Monitor Events
```bash
cd event-logger
npm install
npm start
```

## 📊 Trust Scoring System

### 3 Metrics Only (100 points total)

**Performance (0-40 pts)**
- Based on actual 7d/30d APY performance
- Higher APY = higher score

**Reliability (0-40 pts)**
- Intent success rate (25 pts)
- Gas efficiency bonus (10 pts)  
- Latency efficiency bonus (5 pts)

**Safety (0-20 pts)**
- Audit status (15 pts)
- Recent audit bonus (3 pts)
- Incident penalties (-5 to -8 pts)

### Risk Levels
- **🚨 Caution**: 0-49 points (High risk)
- **✅ Moderate**: 50-79 points (Medium risk)
- **⭐ Preferred**: 80-100 points (Low risk)

## 🔍 Testing

### Test Complete User Flow
```bash
cd user-flow-v0
npm install
npm run test-flow
```

### Test Scoring System
```bash
cd scoring-system-v0
npm install
npm start
```

### Test Individual Components
```bash
# Test vault contract
cd contracts/vault-contract-v0
./deploy.sh

# Test registry contract  
cd contracts/registry-contract-v0
./deploy.sh

# Test opportunity contracts
cd contracts/opportunity-contract-v0
./deploy.sh
```

## 📁 Project Structure

```
risk-monitor-engine/
├── contracts/                    # NEAR smart contracts
│   ├── vault-contract-v0/       # Vault contract (Rust)
│   ├── registry-contract-v0/    # Registry contract (Rust)
│   └── opportunity-contract-v0/ # Opportunity contracts (Rust)
├── executor-bot-v0/             # Off-chain executor bot (Node.js)
├── scoring-system-v0/           # Trust scoring system (Node.js)
├── scoring-updater/             # Manual score updater (Node.js)
├── event-logger/                # Complete event logging (Node.js)
├── user-flow-v0/                # End-to-end user flow (Node.js)
├── deploy-all.sh               # One-click deployment script
└── README.md                   # This file
```

## 🔗 Contract Addresses (Testnet)

After deployment, your contracts will be available at:
- Vault: `vault-contract-v0.{account}.testnet`
- Registry: `registry-contract-v0.{account}.testnet`
- Staking: `staking-opportunity-v0.{account}.testnet`
- Lending: `lending-opportunity-v0.{account}.testnet`
- Liquidity: `liquidity-opportunity-v0.{account}.testnet`

## 🌐 Explorer Links

- **NEAR Testnet Explorer**: https://testnet.nearblocks.io
- **MyNearWallet**: https://testnet.mynearwallet.com
- **NEAR Testnet RPC**: https://rpc.testnet.near.org

## 📈 Monitoring & Analytics

### Event Dashboard
Access complete event logs via SQLite database:
```bash
cd event-logger
sqlite3 events.db
```

### Key Metrics Tracked
- Total deposits/withdrawals
- Allocation success rates
- Gas usage efficiency
- Intent execution latency
- Trust score changes
- User activity patterns

## 🚨 Troubleshooting

### Common Issues

**Contract deployment fails**
```bash
# Check NEAR CLI login
near whoami

# Verify account balance
near state {account}.testnet
```

**Executor bot not monitoring**
```bash
# Check environment variables
cat executor-bot-v0/.env

# Verify contract addresses
near view {vault-contract} get_config
```

**Score updater errors**
```bash
# Check registry contract access
near view {registry-contract} get_opportunities
```

## 🔄 Next Steps (Future Development)

- [ ] Automated score updates based on on-chain data
- [ ] Multi-token support (USDT, additional tokens)
- [ ] Advanced risk metrics and ML-based scoring
- [ ] Cross-chain integration
- [ ] Governance token and DAO features
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review contract deployment logs
3. Verify NEAR testnet connectivity
4. Check executor bot and event logger status

---

**Bond.Credit v0** - Complete DeFi yield platform on NEAR Protocol ✅