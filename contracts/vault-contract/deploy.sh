#!/bin/bash

# Bond.Credit Vault Contract Deployment Script
# This script deploys the vault contract to NEAR testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bond.Credit Vault Contract Deployment${NC}"
echo "=============================================="

# Check if near-cli is installed
if ! command -v near &> /dev/null; then
    echo -e "${RED}❌ near-cli is not installed. Please install it first:${NC}"
    echo "npm install -g near-cli"
    exit 1
fi

# Load configuration
CONFIG_FILE="near-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file $CONFIG_FILE not found${NC}"
    exit 1
fi

# Parse configuration
NETWORK_ID=$(jq -r '.networkId' $CONFIG_FILE)
NODE_URL=$(jq -r '.nodeUrl' $CONFIG_FILE)
WALLET_URL=$(jq -r '.walletUrl' $CONFIG_FILE)
CONTRACT_NAME=$(jq -r '.contractName' $CONFIG_FILE)
OWNER_ACCOUNT=$(jq -r '.ownerAccount' $CONFIG_FILE)
WNEAR_CONTRACT=$(jq -r '.wnearContract' $CONFIG_FILE)
USDC_CONTRACT=$(jq -r '.usdcContract' $CONFIG_FILE)
USDT_CONTRACT=$(jq -r '.usdtContract' $CONFIG_FILE)
FEE_PERCENTAGE=$(jq -r '.feePercentage' $CONFIG_FILE)

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Network: $NETWORK_ID"
echo "Contract: $CONTRACT_NAME"
echo "Owner: $OWNER_ACCOUNT"
echo "wNEAR Contract: $WNEAR_CONTRACT"
echo "USDC Contract: $USDC_CONTRACT"
echo "USDT Contract: $USDT_CONTRACT"
echo "Fee Percentage: $FEE_PERCENTAGE"
echo ""

# Check if user is logged in
if ! near account view-account-summary --accountId $OWNER_ACCOUNT &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to NEAR first:${NC}"
    echo "near login"
    exit 1
fi

# Build the contract
echo -e "${BLUE}🔨 Building contract...${NC}"
cd "$(dirname "$0")"
cargo build --target wasm32-unknown-unknown --release

# Check if build was successful
if [ ! -f "target/wasm32-unknown-unknown/release/vault_contract.wasm" ]; then
    echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract built successfully${NC}"

# Deploy the contract
echo -e "${BLUE}🚀 Deploying contract...${NC}"
near deploy --accountId $CONTRACT_NAME --wasmFile target/wasm32-unknown-unknown/release/vault_contract.wasm

# Initialize the contract
echo -e "${BLUE}🔧 Initializing contract...${NC}"
near call $CONTRACT_NAME new \
    --accountId $OWNER_ACCOUNT \
    --args '{
        "owner_id": "'$OWNER_ACCOUNT'",
        "wnear_contract": "'$WNEAR_CONTRACT'",
        "usdc_contract": "'$USDC_CONTRACT'",
        "usdt_contract": "'$USDT_CONTRACT'",
        "fee_percentage": '$FEE_PERCENTAGE'
    }'

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
near call $CONTRACT_NAME get_config --accountId $OWNER_ACCOUNT

echo ""
echo -e "${GREEN}🎉 Vault Contract deployed successfully!${NC}"
echo "=============================================="
echo -e "${YELLOW}Contract Address:${NC} $CONTRACT_NAME"
echo -e "${YELLOW}Owner Account:${NC} $OWNER_ACCOUNT"
echo -e "${YELLOW}Network:${NC} $NETWORK_ID"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Test the contract with deposit/withdraw functions"
echo "2. Deploy Opportunity Registry contract"
echo "3. Deploy Executor Bot"
echo "4. Create UI for vault interactions"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "View config: near call $CONTRACT_NAME get_config --accountId $OWNER_ACCOUNT"
echo "Check reserves: near call $CONTRACT_NAME get_token_reserves '{\"token_type\":\"WNEAR\"}' --accountId $OWNER_ACCOUNT"
echo "View events: near call $CONTRACT_NAME get_deposit_events --accountId $OWNER_ACCOUNT"

