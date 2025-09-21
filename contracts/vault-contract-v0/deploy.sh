#!/bin/bash

# Bond.Credit Vault Contract v0 - Deployment Script
# Deploys the vault contract to NEAR testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bond.Credit Vault Contract v0 - Deployment Script${NC}"
echo "=================================================="

# Configuration
CONTRACT_NAME="vault-contract-v0"
NETWORK="testnet"
OWNER_ID="bond-credit.testnet"  # Change this to your account
WNEAR_CONTRACT="wrap.testnet"
USDC_CONTRACT="usdc.testnet"

# Check if NEAR CLI is installed
if ! command -v near &> /dev/null; then
    echo -e "${RED}❌ NEAR CLI not found. Please install it first:${NC}"
    echo "npm install -g near-cli"
    exit 1
fi

# Check if user is logged in
if ! near account view-account-summary $OWNER_ID --networkId $NETWORK &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to NEAR first:${NC}"
    echo "near login"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Contract: $CONTRACT_NAME"
echo "  Network: $NETWORK"
echo "  Owner: $OWNER_ID"
echo "  WNEAR Contract: $WNEAR_CONTRACT"
echo "  USDC Contract: $USDC_CONTRACT"
echo ""

# Compile the contract
echo -e "${YELLOW}🔨 Compiling contract...${NC}"
cargo build --target wasm32-unknown-unknown --release

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract compiled successfully${NC}"

# Create contract account if it doesn't exist
CONTRACT_ACCOUNT="$CONTRACT_NAME.$OWNER_ID"
echo -e "${YELLOW}🔍 Checking if contract account exists...${NC}"

if ! near account view-account-summary $CONTRACT_ACCOUNT --networkId $NETWORK &> /dev/null; then
    echo -e "${YELLOW}📝 Creating contract account: $CONTRACT_ACCOUNT${NC}"
    near create-account $CONTRACT_ACCOUNT --masterAccount $OWNER_ID --networkId $NETWORK
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create contract account${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Contract account created${NC}"
else
    echo -e "${GREEN}✅ Contract account already exists${NC}"
fi

# Deploy the contract
echo -e "${YELLOW}🚀 Deploying contract...${NC}"
near deploy $CONTRACT_ACCOUNT target/wasm32-unknown-unknown/release/$CONTRACT_NAME.wasm --networkId $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed successfully${NC}"

# Initialize the contract
echo -e "${YELLOW}🔧 Initializing contract...${NC}"
near call $CONTRACT_ACCOUNT new \
    '{
        "owner_id": "'$OWNER_ID'",
        "wnear_contract": "'$WNEAR_CONTRACT'",
        "usdc_contract": "'$USDC_CONTRACT'"
    }' \
    --accountId $OWNER_ID \
    --networkId $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract initialization failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract initialized successfully${NC}"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check contract configuration
CONFIG=$(near view $CONTRACT_ACCOUNT get_config --networkId $NETWORK)
echo -e "${BLUE}📋 Contract Configuration:${NC}"
echo "$CONFIG"

# Check total supply
SUPPLY=$(near view $CONTRACT_ACCOUNT get_total_supply --networkId $NETWORK)
echo -e "${BLUE}📊 Total Supply:${NC}"
echo "$SUPPLY"

# Check token reserves
RESERVES=$(near view $CONTRACT_ACCOUNT get_token_reserves --networkId $NETWORK)
echo -e "${BLUE}💰 Token Reserves:${NC}"
echo "$RESERVES"

echo ""
echo -e "${GREEN}🎉 Vault Contract v0 deployed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  Contract Account: $CONTRACT_ACCOUNT"
echo "  Network: $NETWORK"
echo "  Owner: $OWNER_ID"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "  View config: near view $CONTRACT_ACCOUNT get_config --networkId $NETWORK"
echo "  View total supply: near view $CONTRACT_ACCOUNT get_total_supply --networkId $NETWORK"
echo "  View token reserves: near view $CONTRACT_ACCOUNT get_token_reserves --networkId $NETWORK"
echo "  View account: near view $CONTRACT_ACCOUNT get_account '{\"account_id\":\"$OWNER_ID\"}' --networkId $NETWORK"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "  # Test deposit (you need to have WNEAR tokens first)"
echo "  near call $CONTRACT_ACCOUNT deposit '{\"token_type\":\"WNEAR\",\"amount\":\"1000000000000000000000000\"}' --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo "  # Test withdraw"
echo "  near call $CONTRACT_ACCOUNT withdraw '{\"token_type\":\"WNEAR\",\"amount\":\"1000000000000000000000000\"}' --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo -e "${GREEN}✅ Ready for testing!${NC}"
