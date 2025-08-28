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

1. **Intent Creation**: Creates intent requests for token swaps with agent linking
2. **Quote Management**: Fetches and compares quotes from the Solver Bus
3. **Intent Execution**: Signs and publishes intents to the Solver Bus
4. **Risk Integration**: Integrates with the risk monitoring system to evaluate agent credibility before high-value transactions

### AIAgent (ai-agent.ts)

The AI Agent serves as a high-level interface for executing intents on NEAR mainnet. It handles:

1. **Account Management**: Loading NEAR accounts and managing credentials
2. **Token Operations**: Depositing tokens and executing swaps with agent linking
3. **Risk Integration**: Checks agent credibility before executing transactions
4. **Error Handling**: Managing errors and providing feedback

## Usage

```typescript
import { AIAgent } from './near-intents';

// Initialize agent
const agent = new AIAgent({
  accountId: 'your-account.near',
  privateKey: 'ed25519:your-private-key'
});

// Deposit NEAR for operations
await agent.depositNear(1.0, 'agent_1');

// Swap NEAR to USDC, linked to an agent for risk monitoring
const result = await agent.swapNearToToken('USDC', 1.0, 'agent_1');
```

## Supported Assets

Currently supported tokens:
- NEAR (Native token)
- USDC (a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near)

## Integration with Risk Monitor Engine

This integration enhances the Risk Monitor Engine by:

1. **Cross-chain Transactions**: Execute transactions across multiple blockchain networks
2. **Agent-Linked Operations**: All transactions are linked to specific agents for tracking and risk assessment
3. **Risk-Based Controls**: High-value transactions are evaluated based on agent credibility before execution
4. **Real-time Monitoring**: Transaction data can be integrated with the existing risk monitoring system

## API Endpoints

The integration provides the following API endpoints:

- `POST /api/near-intents`: Execute NEAR Intents operations
  - `getAccountInfo`: Get account information
  - `swapTokens`: Execute a token swap
  - `getAgentInfo`: Get agent information

## Setup

1. Install dependencies:
```bash
npm install near-api-js bn.js
```

2. Configure your NEAR account credentials in environment variables or config files

3. Use the modules in your components or services as needed

## Security Considerations

1. **Agent Risk Assessment**: High-value transactions are evaluated based on agent credibility
2. **Input Validation**: All API endpoints validate input parameters
3. **Error Handling**: Comprehensive error handling prevents information leakage
4. **Secure Storage**: Private keys should be stored securely and never exposed in client-side code