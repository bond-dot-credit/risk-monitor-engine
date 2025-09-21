#!/bin/bash

# Bond.Credit Opportunity Contract v0 - Deployment Script
# Deploys opportunity contracts for yield strategies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bond.Credit Opportunity Contract v0 - Deployment Script${NC}"
echo "=========================================================="

# Configuration
CONTRACT_NAME="opportunity-contract-v0"
NETWORK="testnet"
OWNER_ID="bond-credit.testnet"  # Change this to your account

# Opportunity configurations
declare -A OPPORTUNITIES=(
    ["staking"]="NEAR Staking Pool:Stake wNEAR to earn NEAR rewards:Staking:1200:10000000000000000000000000:50000000000000000000000000:1000000000000000000000000"
    ["lending"]="USDC Lending Pool:Lend USDC to earn interest:Lending:800:5000000000000000000000000:25000000000000000000000000:500000000000000000000000"
    ["liquidity"]="Liquidity Provision Pool:Provide liquidity for trading fees:LiquidityProvision:1500:20000000000000000000000000:100000000000000000000000000:1000000000000000000000000"
)

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
echo "  Opportunities to deploy: ${#OPPORTUNITIES[@]}"
echo ""

# Compile the contract
echo -e "${YELLOW}🔨 Compiling contract...${NC}"
cargo build --target wasm32-unknown-unknown --release

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract compiled successfully${NC}"

# Deploy each opportunity
for opportunity_key in "${!OPPORTUNITIES[@]}"; do
    IFS=':' read -r name description strategy target_apy max_allocation total_capacity min_allocation <<< "${OPPORTUNITIES[$opportunity_key]}"
    
    CONTRACT_ACCOUNT="$opportunity_key-$CONTRACT_NAME.$OWNER_ID"
    
    echo -e "${BLUE}🚀 Deploying $opportunity_key opportunity...${NC}"
    echo "  Name: $name"
    echo "  Strategy: $strategy"
    echo "  Target APY: $((target_apy / 100))%"
    echo "  Contract Account: $CONTRACT_ACCOUNT"
    
    # Create contract account if it doesn't exist
    echo -e "${YELLOW}🔍 Checking if contract account exists...${NC}"
    
    if ! near account view-account-summary $CONTRACT_ACCOUNT --networkId $NETWORK &> /dev/null; then
        echo -e "${YELLOW}📝 Creating contract account: $CONTRACT_ACCOUNT${NC}"
        near create-account $CONTRACT_ACCOUNT --masterAccount $OWNER_ID --networkId $NETWORK
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to create contract account${NC}"
            continue
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
        continue
    fi
    
    echo -e "${GREEN}✅ Contract deployed successfully${NC}"
    
    # Initialize the contract
    echo -e "${YELLOW}🔧 Initializing contract...${NC}"
    near call $CONTRACT_ACCOUNT new \
        '{
            "owner_id": "'$OWNER_ID'",
            "name": "'$name'",
            "description": "'$description'",
            "strategy": "'$strategy'",
            "target_apy": '$target_apy',
            "max_allocation": "'$max_allocation'",
            "total_capacity": "'$total_capacity'",
            "min_allocation": "'$min_allocation'"
        }' \
        --accountId $OWNER_ID \
        --networkId $NETWORK
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Contract initialization failed${NC}"
        continue
    fi
    
    echo -e "${GREEN}✅ Contract initialized successfully${NC}"
    
    # Verify deployment
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    
    # Check contract configuration
    CONFIG=$(near view $CONTRACT_ACCOUNT get_config --networkId $NETWORK)
    echo -e "${BLUE}📋 Contract Configuration:${NC}"
    echo "$CONFIG"
    
    # Check total allocated
    ALLOCATED=$(near view $CONTRACT_ACCOUNT get_total_allocated --networkId $NETWORK)
    echo -e "${BLUE}📊 Total Allocated:${NC}"
    echo "$ALLOCATED"
    
    # Check available capacity
    CAPACITY=$(near view $CONTRACT_ACCOUNT get_available_capacity --networkId $NETWORK)
    echo -e "${BLUE}💰 Available Capacity:${NC}"
    echo "$CAPACITY"
    
    echo -e "${GREEN}🎉 $opportunity_key opportunity deployed successfully!${NC}"
    echo "=========================================================="
done

echo ""
echo -e "${GREEN}🎉 All Opportunity Contracts v0 deployed successfully!${NC}"
echo "=========================================================="
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  Network: $NETWORK"
echo "  Owner: $OWNER_ID"
echo "  Total Opportunities: ${#OPPORTUNITIES[@]}"
echo ""
echo -e "${BLUE}🔗 Deployed Contracts:${NC}"
for opportunity_key in "${!OPPORTUNITIES[@]}"; do
    CONTRACT_ACCOUNT="$opportunity_key-$CONTRACT_NAME.$OWNER_ID"
    echo "  $opportunity_key: $CONTRACT_ACCOUNT"
done
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "  # Test allocation to staking opportunity"
echo "  near call staking-$CONTRACT_NAME.$OWNER_ID allocate '{\"amount\":\"1000000000000000000000000\"}' --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo "  # Test yield claim"
echo "  near call staking-$CONTRACT_NAME.$OWNER_ID claim_yield --accountId $OWNER_ID --networkId $NETWORK"
echo ""
echo "  # Check allocation"
echo "  near view staking-$CONTRACT_NAME.$OWNER_ID get_allocation '{\"account_id\":\"$OWNER_ID\"}' --networkId $NETWORK"
echo ""
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo "  # View capital allocated events"
echo "  near view staking-$CONTRACT_NAME.$OWNER_ID get_capital_allocated_events --networkId $NETWORK"
echo ""
echo "  # View yield claimed events"
echo "  near view staking-$CONTRACT_NAME.$OWNER_ID get_yield_claimed_events --networkId $NETWORK"
echo ""
echo "  # View intent execution results"
echo "  near view staking-$CONTRACT_NAME.$OWNER_ID get_intent_execution_results --networkId $NETWORK"
echo ""
echo -e "${GREEN}✅ Ready for testing!${NC}"
