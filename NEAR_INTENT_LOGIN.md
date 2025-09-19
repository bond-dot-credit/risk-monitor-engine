# NEAR Intent Login Implementation

## Overview

This document describes the implementation of **real NEAR Wallet Selector integration** for the Risk Monitor Engine. The system now uses actual NEAR blockchain authentication instead of mock implementations, allowing users to connect their real NEAR wallets and access personalized yield opportunities with trust scoring.

## Features Implemented

### 1. NEAR Wallet Selector Integration (`useNearWallet.ts`)

A React hook that integrates with the official NEAR Wallet Selector and provides methods for:
- Connecting to real NEAR wallets (MyNearWallet, Sender, Ledger)
- Real blockchain authentication and signing
- Live account balance fetching from NEAR blockchain
- Persistent session management

**Key Features:**
- **Real NEAR Integration**: Uses `@near-wallet-selector/core` for authentic blockchain connections
- **Multiple Wallet Support**: MyNearWallet, Sender, and Ledger hardware wallets
- **Live Balance**: Fetches real NEAR token balances from the blockchain
- **Message Signing**: Supports signing messages for authentication
- **Session Persistence**: Maintains login state across browser sessions
- **Error Handling**: Comprehensive error states and user feedback

### 2. NEAR Wallet Selector Configuration (`wallet-selector-config.ts`)

Configuration setup for NEAR Wallet Selector with support for:
- Multiple wallet providers (MyNearWallet, Sender, Ledger)
- Environment-based configuration
- Modal UI setup for wallet selection
- Network configuration (testnet/mainnet)

**Supported Wallets:**
- **MyNearWallet**: Web-based wallet for easy access
- **Sender**: Browser extension wallet
- **Ledger**: Hardware wallet integration

### 3. NEAR Login Button Component (`NearLoginButton.tsx`)

A reusable component that integrates with the real NEAR Wallet Selector:
- "Login with NEAR" button that opens wallet selector modal
- Real wallet selection interface
- Account dropdown with live balance display
- Sign out and disconnect functionality

**States:**
- **Disconnected**: Shows "Login with NEAR" button
- **Connected**: Shows account dropdown with real balance and options

### 4. User Dashboard (`UserDashboard.tsx`)

A comprehensive dashboard shown after successful login that includes:
- Account balance display (NEAR, USDC, Total Value)
- Yield opportunities with trust scores (0-100)
- Deposit functionality for yield opportunities
- Active positions tracking (placeholder for future implementation)

**Yield Opportunities:**
- **NEAR Staking**: 8.5% APY, 95 Trust Score, Low Risk
- **USDC Lending Pool**: 12.3% APY, 88 Trust Score, Medium Risk
- **Liquidity Provider**: 15.7% APY, 82 Trust Score, Medium Risk
- **DeFi Yield Farming**: 22.1% APY, 75 Trust Score, High Risk

### 5. Environment Configuration

Updated environment configuration for real NEAR integration:
- `NEXT_PUBLIC_NEAR_NETWORK_ID`: Network selection (testnet/mainnet)
- `NEXT_PUBLIC_NEAR_NODE_URL`: NEAR RPC endpoint
- `NEXT_PUBLIC_NEAR_WALLET_URL`: Wallet provider URL
- `NEXT_PUBLIC_NEAR_CONTRACT_ID`: Contract ID for wallet selector

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │ NEAR Wallet      │    │ NEAR Blockchain │
│   Components    │◄──►│ Selector         │◄──►│ (Testnet/Mainnet)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ useNearWallet   │    │ Wallet Providers │    │ Real Account    │
│ Hook            │    │ (MyNearWallet,   │    │ Data & Balances │
│                 │    │  Sender, Ledger) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## File Structure

```
src/
├── hooks/
│   └── useNearWallet.ts          # NEAR Wallet Selector integration hook
├── lib/
│   └── wallet-selector-config.ts # Wallet Selector configuration
├── components/
│   ├── NearLoginButton.tsx       # Login button with wallet selector
│   └── UserDashboard.tsx         # User dashboard after login
├── app/
│   └── page.tsx                  # Updated main page with login
└── NEAR_INTENT_LOGIN.md          # This documentation
```

## Usage

### 1. User Login Flow

1. User visits the application
2. Clicks "Login with NEAR" button
3. NEAR Wallet Selector modal opens with available wallets
4. User selects their preferred wallet (MyNearWallet, Sender, Ledger)
5. User authenticates with their wallet
6. Real account data and balance are fetched from NEAR blockchain
7. Dashboard is displayed with yield opportunities and real balance

### 2. Yield Opportunity Selection

1. User views available yield opportunities
2. Each opportunity shows:
   - APY percentage
   - Trust score (0-100)
   - Risk level (Low/Medium/High)
   - Minimum deposit amount
3. User selects an opportunity and enters deposit amount
4. Deposit is processed (currently mocked)

### 3. Account Management

1. User can view their account balance
2. Sign out while keeping wallet connected
3. Completely disconnect wallet
4. View active positions (future feature)

## Trust Scoring System

The system includes a trust scoring mechanism (0-100) for yield opportunities:

- **90-100**: Excellent trust score, very low risk
- **80-89**: Good trust score, low risk
- **70-79**: Fair trust score, medium risk
- **60-69**: Poor trust score, high risk
- **0-59**: Very poor trust score, very high risk

Trust scores are calculated based on:
- Protocol security audits
- Historical performance
- Community reputation
- Liquidity depth
- Smart contract verification

## Future Enhancements

### 1. Real NEAR Integration

- Replace mock wallet connection with real NEAR Wallet Selector
- Integrate with NEAR blockchain for actual transactions
- Implement real signature verification
- Add support for multiple wallet types

### 2. Enhanced Security

- Implement proper signature verification
- Add message signing for authentication
- Include nonce-based authentication
- Add rate limiting and security headers

### 3. Advanced Features

- Real-time balance updates
- Transaction history tracking
- Yield calculation and tracking
- Automated rebalancing
- Multi-token support

### 4. Analytics and Monitoring

- User activity tracking
- Yield performance analytics
- Risk monitoring and alerts
- Portfolio optimization suggestions

## Development Notes

### Current Implementation

- Uses mock data for wallet connections and balances
- Simulates transaction processing with delays
- Stores wallet state in localStorage for persistence
- Includes comprehensive error handling

### Testing

- All components include proper TypeScript typing
- Responsive design works on mobile and desktop
- Error states are handled gracefully
- Loading states provide good user feedback

### Dependencies

- React 19.1.0
- Next.js 15.4.6
- Tailwind CSS for styling
- TypeScript for type safety

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Test login flow:**
   - Click "Login with NEAR"
   - Wait for connection simulation
   - Sign in to see the dashboard
   - Explore yield opportunities

## API Endpoints

### Authentication API

**Base URL:** `/api/near-auth`

#### POST /api/near-auth

Handle authentication actions.

**Request Body:**
```json
{
  "action": "login" | "logout" | "verify",
  "accountId": "user.near",
  "signature": "ed25519:...",
  "message": "authentication message"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accountId": "user.near",
  "isAuthenticated": true
}
```

## Security Considerations

1. **Signature Verification**: Currently mocked, should implement real NEAR signature verification
2. **Message Signing**: Should use proper message signing with nonces
3. **Session Management**: Should implement proper session tokens
4. **Rate Limiting**: Should add rate limiting to prevent abuse
5. **Input Validation**: All inputs should be properly validated

## Contributing

When extending this implementation:

1. Follow the existing TypeScript patterns
2. Maintain responsive design principles
3. Include proper error handling
4. Add appropriate loading states
5. Update this documentation

## License

This implementation is part of the Risk Monitor Engine project and follows the same licensing terms.
