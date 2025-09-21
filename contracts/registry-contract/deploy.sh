#!/bin/bash

# Registry Contract Deployment Script
set -e

echo "🚀 Deploying Registry Contract to NEAR Testnet..."

# Configuration
ACCOUNT_ID="registry-contract.testnet"
CONTRACT_PATH="./target/wasm32-unknown-unknown/release/registry_contract.wasm"

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
        "fee_percentage": 50
    }' \
    --accountId $ACCOUNT_ID

echo "✅ Registry Contract deployed successfully!"
echo "📋 Contract ID: $ACCOUNT_ID"
echo "🌐 View on NEAR Explorer: https://explorer.testnet.near.org/accounts/$ACCOUNT_ID"
