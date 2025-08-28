# PowerShell Script to Execute NEAR Protocol Rewards Transactions
# This script helps Windows users execute real transactions for NEAR Protocol Rewards

Write-Host "🚀 NEAR Protocol Rewards Transaction Executor" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install Node.js (which includes npm) first." -ForegroundColor Red
    exit 1
}

# Check if required environment variables are set
$requiredEnvVars = @("NEAR_ACCOUNT_ID", "NEAR_PRIVATE_KEY")
$missingEnvVars = @()

foreach ($envVar in $requiredEnvVars) {
    if (-not (Test-Path env:$envVar)) {
        $missingEnvVars += $envVar
    }
}

if ($missingEnvVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    foreach ($envVar in $missingEnvVars) {
        Write-Host "   - $envVar" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "📝 Please set these variables in your .env.local file or as system environment variables" -ForegroundColor Yellow
    Write-Host "📝 You can copy EXAMPLE.env to .env.local and update with your actual values" -ForegroundColor Yellow
    exit 1
}

# Check if .env.local file exists
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local configuration file" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local configuration file not found" -ForegroundColor Yellow
    Write-Host "📝 Please create a .env.local file with your NEAR account credentials" -ForegroundColor Yellow
    Write-Host "📝 You can copy EXAMPLE.env to .env.local and update with your actual values" -ForegroundColor Yellow
    exit 1
}

# Install tsx if not already installed
try {
    npx tsx --version > $null 2>&1
    Write-Host "✅ tsx is available" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing tsx..." -ForegroundColor Yellow
    npm install tsx --silent
    Write-Host "✅ tsx installed successfully" -ForegroundColor Green
}

# Build the project
Write-Host "🏗️  Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Project built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build the project" -ForegroundColor Red
    exit 1
}

# Confirm execution
Write-Host ""
Write-Host "⚠️  WARNING: This script will execute REAL transactions on the NEAR blockchain!" -ForegroundColor Red
Write-Host "⚠️  These transactions will cost NEAR tokens for gas fees!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Do you want to continue? Type 'YES' to proceed"

if ($confirmation -ne "YES") {
    Write-Host "❌ Transaction execution cancelled by user." -ForegroundColor Red
    exit 0
}

# Execute the real transaction executor
Write-Host "🚀 Executing real transactions for NEAR Protocol Rewards..." -ForegroundColor Green
Write-Host "⏳ This may take several hours. Please be patient..." -ForegroundColor Yellow
Write-Host ""

try {
    npx tsx real-transaction-executor.ts
    Write-Host "🎉 Transaction execution completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error executing transactions: $_" -ForegroundColor Red
    exit 1
}