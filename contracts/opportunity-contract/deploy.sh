#!/bin/bash

# Opportunity Contract Deployment Script
set -e

echo "🚀 Deploying Opportunity Contract to NEAR Testnet..."

# Configuration
ACCOUNT_ID="opportunity-contract.testnet"
CONTRACT_PATH="./target/wasm32-unknown-unknown/release/opportunity_contract.wasm"

# Check if contract is built
if [ ! -f "$CONTRACT_PATH" ]; then
    echo "❌ Contract not found. Building contract first..."
    cargo build --release --target wasm32-unknown-unknown
fi

# Create account if it doesn't exist
echo "📝 Creating account: $ACCOUNT_ID"
near create-account $ACCOUNT_ID --masterAccount testnet --initialBalance 10

# Deploy contract
echo "📦 Deploying contract..."
near deploy $ACCOUNT_ID $CONTRACT_PATH

# Initialize contract
echo "🔧 Initializing contract..."
near call $ACCOUNT_ID new \
    '{
        "owner_id": "'$ACCOUNT_ID'",
        "name": "NEAR Staking Pool",
        "description": "High-yield staking pool with automated compounding and risk management strategies.",
        "apy": 1250,
        "min_allocation": "1000000000000000000000000",
        "max_allocation": "100000000000000000000000000",
        "total_capacity": "1000000000000000000000000000",
        "category": "staking"
    }' \
    --accountId $ACCOUNT_ID

echo "✅ Opportunity Contract deployed successfully!"
echo "📋 Contract ID: $ACCOUNT_ID"
echo "🌐 View on NEAR Explorer: https://explorer.testnet.near.org/accounts/$ACCOUNT_ID"
