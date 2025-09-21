#!/bin/bash

# Bond.Credit Executor Bot v0 - Start Script
# Starts the off-chain executor bot for NEAR intents

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bond.Credit Executor Bot v0 - Start Script${NC}"
echo "====================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first:${NC}"
    echo "https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the executor-bot-v0 directory${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
        cp env.example .env
        echo -e "${YELLOW}📝 Please edit .env file with your configuration before running again${NC}"
        echo -e "${BLUE}Required configuration:${NC}"
        echo "  - EXECUTOR_PRIVATE_KEY: Your executor account private key"
        echo "  - EXECUTOR_MASTER_ACCOUNT: Your master account"
        echo "  - VAULT_CONTRACT_ID: Your deployed vault contract"
        echo "  - REGISTRY_CONTRACT_ID: Your deployed registry contract"
        exit 1
    else
        echo -e "${RED}❌ No .env file found. Please create one with required configuration${NC}"
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Create logs directory
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo -e "${GREEN}✅ Created logs directory${NC}"
fi

# Validate environment variables
echo -e "${YELLOW}🔍 Validating configuration...${NC}"

source .env

REQUIRED_VARS=(
    "EXECUTOR_PRIVATE_KEY"
    "EXECUTOR_MASTER_ACCOUNT"
    "VAULT_CONTRACT_ID"
    "REGISTRY_CONTRACT_ID"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo -e "${YELLOW}Please update your .env file and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration validated successfully${NC}"

# Display configuration
echo -e "${BLUE}📋 Bot Configuration:${NC}"
echo "  Network: ${NEAR_NETWORK_ID:-testnet}"
echo "  Executor Account: ${EXECUTOR_ACCOUNT_ID:-executor-bot.testnet}"
echo "  Vault Contract: $VAULT_CONTRACT_ID"
echo "  Registry Contract: $REGISTRY_CONTRACT_ID"
echo "  Poll Interval: ${POLL_INTERVAL_MS:-5000}ms"
echo "  Max Concurrent Intents: ${MAX_CONCURRENT_INTENTS:-10}"
echo ""

# Start the bot
echo -e "${YELLOW}🚀 Starting Executor Bot...${NC}"
echo -e "${BLUE}The bot will:${NC}"
echo "  - Monitor vault deposits and withdrawals"
echo "  - Execute NEAR intents for capital allocation"
echo "  - Pull funds back for withdrawals"
echo "  - Emit IntentExecuted events with metrics"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the bot${NC}"
echo ""

# Start the bot
npm start
