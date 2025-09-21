#!/bin/bash

# Master Contract Deployment Script
set -e

echo "🚀 Deploying all contracts to NEAR Testnet..."
echo "================================================"

# Check if NEAR CLI is installed
if ! command -v near &> /dev/null; then
    echo "❌ NEAR CLI not found. Please install it first:"
    echo "npm install -g near-cli"
    exit 1
fi

# Check if user is logged in
if ! near whoami &> /dev/null; then
    echo "❌ Please login to NEAR first:"
    echo "near login"
    exit 1
fi

echo "✅ NEAR CLI configured. Current account: $(near whoami)"

# Build all contracts
echo ""
echo "🔨 Building all contracts..."
echo "============================"

# Build Vault Contract
echo "Building Vault Contract..."
cd contracts/vault-contract
cargo build --release --target wasm32-unknown-unknown
cd ../..

# Build Registry Contract
echo "Building Registry Contract..."
cd contracts/registry-contract
cargo build --release --target wasm32-unknown-unknown
cd ../..

# Build Opportunity Contract
echo "Building Opportunity Contract..."
cd contracts/opportunity-contract
cargo build --release --target wasm32-unknown-unknown
cd ../..

echo "✅ All contracts built successfully!"

# Deploy contracts
echo ""
echo "🚀 Deploying contracts..."
echo "========================"

# Deploy Vault Contract
echo ""
echo "1️⃣ Deploying Vault Contract..."
cd contracts/vault-contract
chmod +x deploy.sh
./deploy.sh
cd ../..

# Deploy Registry Contract
echo ""
echo "2️⃣ Deploying Registry Contract..."
cd contracts/registry-contract
chmod +x deploy.sh
./deploy.sh
cd ../..

# Deploy Opportunity Contract
echo ""
echo "3️⃣ Deploying Opportunity Contract..."
cd contracts/opportunity-contract
chmod +x deploy.sh
./deploy.sh
cd ../..

# Add opportunities to registry
echo ""
echo "📝 Adding opportunities to registry..."
echo "===================================="

# Add the deployed opportunity to registry
near call registry-contract.testnet add_opportunity \
    '{
        "name": "NEAR Staking Pool",
        "description": "High-yield staking pool with automated compounding and risk management strategies.",
        "contract_id": "opportunity-contract.testnet",
        "apy": 1250,
        "trust_score": 92,
        "performance": 37,
        "reliability": 35,
        "safety": 20,
        "risk_level": "LOW",
        "category": "staking",
        "min_deposit": "1000000000000000000000000",
        "max_deposit": "100000000000000000000000000",
        "tvl": "1000000000000000000000000000"
    }' \
    --accountId registry-contract.testnet

echo ""
echo "🎉 All contracts deployed successfully!"
echo "======================================"
echo ""
echo "📋 Contract Addresses:"
echo "  Vault:       vault-contract.testnet"
echo "  Registry:    registry-contract.testnet"
echo "  Opportunity: opportunity-contract.testnet"
echo ""
echo "🌐 View on NEAR Explorer:"
echo "  Vault:       https://explorer.testnet.near.org/accounts/vault-contract.testnet"
echo "  Registry:    https://explorer.testnet.near.org/accounts/registry-contract.testnet"
echo "  Opportunity: https://explorer.testnet.near.org/accounts/opportunity-contract.testnet"
echo ""
echo "✅ Ready for integration with the frontend!"
