#!/bin/bash

# Bond.Credit Registry Contract v0 - Deployment Script
# Deploys the registry contract for opportunity management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bond.Credit Registry Contract v0 - Deployment Script${NC}"
echo "============================================================="

# Configuration
CONTRACT_NAME="registry-contract-v0"
NETWORK="testnet"
OWNER_ID="bond-credit.testnet"  # Change this to your account

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
    '{"owner_id": "'$OWNER_ID'"}' \
    --accountId $OWNER_ID \
    --networkId $NETWORK

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract initialization failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract initialized successfully${NC}"

# Add sample opportunities
echo -e "${YELLOW}📝 Adding sample opportunities...${NC}"

# Add Staking Opportunity
echo -e "${BLUE}Adding Staking Opportunity...${NC}"
STAKING_ID=$(near call $CONTRACT_ACCOUNT add_opportunity \
    '{
        "name": "NEAR Staking Pool",
        "description": "Stake wNEAR to earn NEAR rewards with 12% APY",
        "category": "Staking",
        "apy": 1200,
        "contract_address": "staking-opportunity-contract-v0.'$OWNER_ID'",
        "token_address": "wrap.testnet",
        "min_deposit": "1000000000000000000000000",
        "max_deposit": "10000000000000000000000000",
        "total_capacity": "50000000000000000000000000"
    }' \
    --accountId $OWNER_ID \
    --networkId $NETWORK \
    --query)

echo "Staking opportunity added with ID: $STAKING_ID"

# Add Lending Opportunity
echo -e "${BLUE}Adding Lending Opportunity...${NC}"
LENDING_ID=$(near call $CONTRACT_ACCOUNT add_opportunity \
    '{
        "name": "USDC Lending Pool",
        "description": "Lend USDC to earn interest with 8% APY",
        "category": "Lending",
        "apy": 800,
        "contract_address": "lending-opportunity-contract-v0.'$OWNER_ID'",
        "token_address": "usdc.testnet",
        "min_deposit": "500000000000000000000000",
        "max_deposit": "5000000000000000000000000",
        "total_capacity": "25000000000000000000000000"
    }' \
    --accountId $OWNER_ID \
    --networkId $NETWORK \
    --query)

echo "Lending opportunity added with ID: $LENDING_ID"

# Add Liquidity Opportunity
echo -e "${BLUE}Adding Liquidity Opportunity...${NC}"
LIQUIDITY_ID=$(near call $CONTRACT_ACCOUNT add_opportunity \
    '{
        "name": "Liquidity Provision Pool",
        "description": "Provide liquidity for trading fees with 15% APY",
        "category": "Liquidity",
        "apy": 1500,
        "contract_address": "liquidity-opportunity-contract-v0.'$OWNER_ID'",
        "token_address": null,
        "min_deposit": "1000000000000000000000000",
        "max_deposit": "20000000000000000000000000",
        "total_capacity": "100000000000000000000000000"
    }' \
    --accountId $OWNER_ID \
    --networkId $NETWORK \
    --query)

echo "Liquidity opportunity added with ID: $LIQUIDITY_ID"

# Update scores for demonstration
echo -e "${YELLOW}📊 Updating opportunity scores...${NC}"

near call $CONTRACT_ACCOUNT update_opportunity_score \
    '{"opportunity_id": '$STAKING_ID', "new_score": 92}' \
    --accountId $OWNER_ID \
    --networkId $NETWORK

near call $CONTRACT_ACCOUNT update_opportunity_score \
    '{"opportunity_id": '$LENDING_ID', "new_score": 85}' \
    --accountId $OWNER_ID \
    --networkId $NETWORK

near call $CONTRACT_ACCOUNT update_opportunity_score \
    '{"opportunity_id": '$LIQUIDITY_ID', "new_score": 88}' \
    --accountId $OWNER_ID \
    --networkId $NETWORK

echo -e "${GREEN}✅ Sample opportunities added and scored${NC}"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check registry configuration
CONFIG=$(near view $CONTRACT_ACCOUNT get_config --networkId $NETWORK)
echo -e "${BLUE}📋 Registry Configuration:${NC}"
echo "$CONFIG"

# Check total opportunities
TOTAL=$(near view $CONTRACT_ACCOUNT get_total_opportunities --networkId $NETWORK)
echo -e "${BLUE}📊 Total Opportunities:${NC}"
echo "$TOTAL"

# Check active opportunities
ACTIVE=$(near view $CONTRACT_ACCOUNT get_active_opportunities_count --networkId $NETWORK)
echo -e "${BLUE}✅ Active Opportunities:${NC}"
echo "$ACTIVE"

# List all opportunities
OPPORTUNITIES=$(near view $CONTRACT_ACCOUNT get_opportunities --networkId $NETWORK)
echo -e "${BLUE}📋 All Opportunities:${NC}"
echo "$OPPORTUNITIES"

# List top opportunities
TOP=$(near view $CONTRACT_ACCOUNT get_top_opportunities --networkId $NETWORK)
echo -e "${BLUE}🏆 Top Opportunities by Score:${NC}"
echo "$TOP"

echo ""
echo -e "${GREEN}🎉 Registry Contract v0 deployed successfully!${NC}"
echo "============================================================="
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  Contract Account: $CONTRACT_ACCOUNT"
echo "  Network: $NETWORK"
echo "  Owner: $OWNER_ID"
echo "  Sample Opportunities: 3 (Staking, Lending, Liquidity)"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "  View all opportunities: near view $CONTRACT_ACCOUNT get_opportunities --networkId $NETWORK"
echo "  View active opportunities: near view $CONTRACT_ACCOUNT get_active_opportunities --networkId $NETWORK"
echo "  View top opportunities: near view $CONTRACT_ACCOUNT get_top_opportunities --networkId $NETWORK"
echo "  View specific opportunity: near view $CONTRACT_ACCOUNT get_opportunity '{\"opportunity_id\":1}' --networkId $NETWORK"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "  # Add new opportunity"
echo "  near call $CONTRACT_ACCOUNT add_opportunity \\"
echo "    '{\"name\":\"Test Opportunity\",\"description\":\"Test description\",\"category\":\"Other\",\"apy\":1000,\"contract_address\":\"test.testnet\",\"token_address\":null,\"min_deposit\":\"1000000000000000000000000\",\"max_deposit\":\"10000000000000000000000000\",\"total_capacity\":\"100000000000000000000000000\"}' \\"
echo "    --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo "  # Update opportunity score"
echo "  near call $CONTRACT_ACCOUNT update_opportunity_score '{\"opportunity_id\":1,\"new_score\":95}' --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo "  # Update opportunity status"
echo "  near call $CONTRACT_ACCOUNT update_opportunity_status '{\"opportunity_id\":1,\"status\":\"Paused\"}' --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo "  # View opportunity events"
echo "  near view $CONTRACT_ACCOUNT get_opportunity_events --networkId $NETWORK"
echo ""
echo "  # View score update events"
echo "  near view $CONTRACT_ACCOUNT get_score_events --networkId $NETWORK"
echo ""
echo -e "${BLUE}🎯 Integration:${NC}"
echo "  This registry can now be integrated with:"
echo "  - Frontend dashboard for opportunity discovery"
echo "  - Executor bot for automated opportunity management"
echo "  - Scoring system for trust score calculation"
echo ""
echo -e "${GREEN}✅ Ready for testing and integration!${NC}"
