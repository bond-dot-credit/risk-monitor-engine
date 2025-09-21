# Bond.Credit v0 User Flow

Complete user journey: Deposit → Allocate → Withdraw → Score Update

## User Flow Steps

### 1. 💰 Deposit Flow
- User deposits tokens (wNEAR/USDC) into Vault
- Chooses yield opportunity from Registry
- Receives vault shares (LP tokens)
- Trust score validation before deposit

### 2. 🔄 Allocate Flow  
- Executor bot moves funds into chosen strategy
- Uses NEAR Intents for seamless allocation
- Tracks gas usage and latency
- Updates allocation status

### 3. 📤 Withdraw Flow
- User burns vault shares
- Receives original deposit + earned yield
- Automatic yield calculation
- Full withdrawal tracking

### 4. 📊 Score Update Flow
- Daily score updates (manual for v0)
- Performance + Reliability + Safety metrics
- Registry contract score updates
- Risk level adjustments

## Usage

```bash
npm install
npm run test-flow
```

## Example Flow

```
1. DEPOSIT: alice.testnet deposits 5 WNEAR → gets 5M shares
2. ALLOCATE: 2.5M shares allocated to NEAR Staking (⭐ 87/100)
3. WITHDRAW: 2M shares → receives 2.3 WNEAR (0.3 yield)
4. SCORE UPDATE: All opportunities updated daily
```

## Integration Points

- **Vault Contract**: Deposit/withdraw operations
- **Registry Contract**: Opportunity listing and scoring  
- **Executor Bot**: Automatic fund allocation
- **Scoring System**: Trust score calculations
