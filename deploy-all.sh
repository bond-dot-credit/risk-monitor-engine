#!/bin/bash

# Bond.Credit v0 - Complete Deployment Script
# Deploys all contracts to NEAR testnet with proper initialization

set -e

echo "🚀 Bond.Credit v0 - Complete Deployment to NEAR Testnet"
echo "=================================================="

# Check if near CLI is installed
if ! command -v near &> /dev/null; then
    echo "❌ NEAR CLI not found. Please install it first:"
    echo "npm install -g near-cli"
    exit 1
fi

# Check if logged in
if ! near whoami &> /dev/null; then
    echo "❌ Not logged in to NEAR. Please login first:"
    echo "near login"
    exit 1
fi

ACCOUNT_ID=$(near whoami)
echo "📝 Using account: $ACCOUNT_ID"
echo ""

# Create contract IDs
VAULT_CONTRACT_ID="vault-contract-v0.$ACCOUNT_ID"
REGISTRY_CONTRACT_ID="registry-contract-v0.$ACCOUNT_ID"
STAKING_CONTRACT_ID="staking-opportunity-v0.$ACCOUNT_ID"
LENDING_CONTRACT_ID="lending-opportunity-v0.$ACCOUNT_ID"
LIQUIDITY_CONTRACT_ID="liquidity-opportunity-v0.$ACCOUNT_ID"

echo "📋 Contract IDs:"
echo "  Vault: $VAULT_CONTRACT_ID"
echo "  Registry: $REGISTRY_CONTRACT_ID"
echo "  Staking: $STAKING_CONTRACT_ID"
echo "  Lending: $LENDING_CONTRACT_ID"
echo "  Liquidity: $LIQUIDITY_CONTRACT_ID"
echo ""

# Function to deploy contract
deploy_contract() {
    local contract_name=$1
    local contract_id=$2
    local init_method=$3
    local init_args=$4
    
    echo "🔨 Deploying $contract_name..."
    
    # Build contract
    cd "contracts/$contract_name"
    cargo build --target wasm32-unknown-unknown --release
    
    # Deploy contract
    near deploy --wasmFile target/wasm32-unknown-unknown/release/$contract_name.wasm \
                --accountId $contract_id \
                --initFunction $init_method \
                --initArgs $init_args
    
    echo "✅ $contract_name deployed to $contract_id"
    echo ""
    
    cd ../..
}

# 1. Deploy Vault Contract
echo "=== 1. VAULT CONTRACT ==="
deploy_contract "vault-contract-v0" $VAULT_CONTRACT_ID "new" "{\"owner_id\":\"$ACCOUNT_ID\",\"wnear_address\":\"wrap.testnet\",\"usdc_address\":\"usdc.testnet\"}"

# 2. Deploy Registry Contract  
echo "=== 2. REGISTRY CONTRACT ==="
deploy_contract "registry-contract-v0" $REGISTRY_CONTRACT_ID "new" "{\"owner_id\":\"$ACCOUNT_ID\"}"

# 3. Deploy Opportunity Contracts
echo "=== 3. OPPORTUNITY CONTRACTS ==="

# Staking Opportunity
deploy_contract "opportunity-contract-v0" $STAKING_CONTRACT_ID "new" "{\"owner_id\":\"$ACCOUNT_ID\",\"vault_id\":\"$VAULT_CONTRACT_ID\",\"token_address\":\"wrap.testnet\",\"apy_bps\":1220,\"max_capacity\":\"1000000000000000000000000000\"}"

# Lending Opportunity  
deploy_contract "opportunity-contract-v0" $LENDING_CONTRACT_ID "new" "{\"owner_id\":\"$ACCOUNT_ID\",\"vault_id\":\"$VAULT_CONTRACT_ID\",\"token_address\":\"usdc.testnet\",\"apy_bps\":810,\"max_capacity\":\"500000000000000000000000000\"}"

# Liquidity Opportunity
deploy_contract "opportunity-contract-v0" $LIQUIDITY_CONTRACT_ID "new" "{\"owner_id\":\"$ACCOUNT_ID\",\"vault_id\":\"$VAULT_CONTRACT_ID\",\"token_address\":\"wrap.testnet\",\"apy_bps\":1490,\"max_capacity\":\"2000000000000000000000000000\"}"

echo "=== 4. REGISTRY SETUP ==="
echo "📝 Adding opportunities to registry..."

# Add Staking Opportunity
near call $REGISTRY_CONTRACT_ID add_opportunity \
    --args "{\"opportunity\":{\"id\":1,\"name\":\"NEAR Staking Pool\",\"description\":\"Stake NEAR tokens to earn rewards from validators\",\"category\":\"staking\",\"apy_bps\":1220,\"contract_address\":\"$STAKING_CONTRACT_ID\",\"max_capacity\":\"1000000000000000000000000000\",\"current_tvl\":\"0\",\"trust_score\":87,\"status\":\"active\"}}" \
    --accountId $ACCOUNT_ID

# Add Lending Opportunity
near call $REGISTRY_CONTRACT_ID add_opportunity \
    --args "{\"opportunity\":{\"id\":2,\"name\":\"USDC Lending Pool\",\"description\":\"Lend USDC tokens to earn interest from borrowers\",\"category\":\"lending\",\"apy_bps\":810,\"contract_address\":\"$LENDING_CONTRACT_ID\",\"max_capacity\":\"500000000000000000000000000\",\"current_tvl\":\"0\",\"trust_score\":72,\"status\":\"active\"}}" \
    --accountId $ACCOUNT_ID

# Add Liquidity Opportunity
near call $REGISTRY_CONTRACT_ID add_opportunity \
    --args "{\"opportunity\":{\"id\":3,\"name\":\"Liquidity Provision Pool\",\"description\":\"Provide liquidity to earn trading fees and rewards\",\"category\":\"liquidity\",\"apy_bps\":1490,\"contract_address\":\"$LIQUIDITY_CONTRACT_ID\",\"max_capacity\":\"2000000000000000000000000000\",\"current_tvl\":\"0\",\"trust_score\":58,\"status\":\"active\"}}" \
    --accountId $ACCOUNT_ID

echo "✅ All opportunities added to registry"
echo ""

echo "=== 5. VERIFICATION ==="
echo "🔍 Verifying deployments..."

# Check vault contract
echo "Vault Contract:"
near view $VAULT_CONTRACT_ID get_config

# Check registry contract  
echo "Registry Contract:"
near view $REGISTRY_CONTRACT_ID get_opportunities '{"limit": 10, "from_index": 0}'

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "====================="
echo ""
echo "📋 Contract Addresses:"
echo "  Vault: $VAULT_CONTRACT_ID"
echo "  Registry: $REGISTRY_CONTRACT_ID"
echo "  Staking: $STAKING_CONTRACT_ID"
echo "  Lending: $LENDING_CONTRACT_ID"
echo "  Liquidity: $LIQUIDITY_CONTRACT_ID"
echo ""
echo "🔗 Testnet Explorer:"
echo "  https://testnet.nearblocks.io"
echo ""
echo "✅ Ready to use Bond.Credit v0 on NEAR testnet!"
