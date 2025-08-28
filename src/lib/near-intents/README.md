# NEAR Intents Integration

This module provides integration with the NEAR Intents protocol for executing multichain transactions within the Risk Monitor Engine.

## Overview

NEAR Intents is a system for executing multichain transactions. An intent represents a user's desired state change (e.g., "I want to swap X NEAR for Y USDC") rather than a specific execution path. This allows for more flexible and efficient execution of financial operations.

## Architecture

```
near-intents/
├── near-intents.ts    # Core protocol interactions
├── ai-agent.ts        # High-level interface
├── basic-swap.ts      # Usage example
└── index.ts           # Module exports
```

## Components

### NearIntents (near-intents.ts)

The core library implementing the NEAR Intents protocol:

1. **Intent Creation**: Creates intent requests for token swaps
2. **Quote Management**: Fetches and compares quotes from the Solver Bus
3. **Intent Execution**: Signs and publishes intents to the Solver Bus

### AIAgent (ai-agent.ts)

The AI Agent serves as a high-level interface for executing intents on NEAR mainnet. It handles:

1. **Account Management**: Loading NEAR accounts and managing credentials
2. **Token Operations**: Depositing tokens and executing swaps
3. **Error Handling**: Managing errors and providing feedback

## Usage

```typescript
import { AIAgent } from './near-intents';

// Initialize agent
const agent = new AIAgent({
  accountId: 'your-account.near',
  privateKey: 'ed25519:your-private-key'
});

// Deposit NEAR for operations
await agent.depositNear(1.0);

// Swap NEAR to USDC
const result = await agent.swapNearToToken('USDC', 1.0);
```

## Supported Assets

Currently supported tokens:
- NEAR (Native token)
- USDC (a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near)

## Integration with Risk Monitor Engine

This integration allows the Risk Monitor Engine to:
1. Execute cross-chain transactions for credit operations
2. Automate token swaps for liquidity management
3. Interact with the broader NEAR ecosystem for enhanced functionality

## Setup

1. Install dependencies:
```bash
npm install near-api-js
```

2. Configure your NEAR account credentials in environment variables or config files

3. Use the modules in your components or services as needed