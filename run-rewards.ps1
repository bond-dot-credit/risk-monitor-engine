# PowerShell Script to Run NEAR Protocol Rewards Demo
Write-Host "==========================================" -ForegroundColor Green
Write-Host "NEAR Protocol Rewards Execution Demo" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    pause
    exit 1
}

# Check if npm is installed
Write-Host "Checking if npm is installed..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm is not installed. Please install Node.js (which includes npm) first." -ForegroundColor Red
    pause
    exit 1
}

# Check environment variables
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
$accountId = $env:NEAR_ACCOUNT_ID
$privateKey = $env:NEAR_PRIVATE_KEY

if ([string]::IsNullOrEmpty($accountId)) {
    Write-Host "Warning: NEAR_ACCOUNT_ID environment variable is not set" -ForegroundColor Yellow
} else {
    Write-Host "✓ NEAR_ACCOUNT_ID is set to: $accountId" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($privateKey)) {
    Write-Host "Warning: NEAR_PRIVATE_KEY environment variable is not set" -ForegroundColor Yellow
} else {
    Write-Host "✓ NEAR_PRIVATE_KEY is set" -ForegroundColor Green
}

Write-Host ""
Write-Host "Available actions:" -ForegroundColor Cyan
Write-Host "1. Run configuration verification (recommended first)" -ForegroundColor White
Write-Host "2. Run transaction execution demo (no real tokens)" -ForegroundColor White
Write-Host "3. Run real transaction executor (WARNING: spends real tokens)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

do {
    $choice = Read-Host "Select an option (1-4)"
    switch ($choice) {
        1 {
            Write-Host ""
            Write-Host "Running configuration verification..." -ForegroundColor Yellow
            Write-Host "This will check if your environment is properly set up." -ForegroundColor Yellow
            Write-Host ""
            npm run verify-config
            break
        }
        2 {
            Write-Host ""
            Write-Host "Running transaction execution demo..." -ForegroundColor Yellow
            Write-Host "This demonstrates the process without spending real tokens." -ForegroundColor Yellow
            Write-Host ""
            npx tsx test-transaction-execution.ts
            break
        }
        3 {
            Write-Host ""
            Write-Host "WARNING: This will execute REAL transactions on the NEAR blockchain!" -ForegroundColor Red
            Write-Host "These transactions will cost NEAR tokens for gas fees!" -ForegroundColor Red
            Write-Host ""
            $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
            if ($confirm -eq "yes") {
                Write-Host ""
                Write-Host "Executing real transactions..." -ForegroundColor Yellow
                npx tsx real-transaction-executor.ts
            } else {
                Write-Host "Cancelled." -ForegroundColor Yellow
            }
            break
        }
        4 {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Invalid option. Please select 1, 2, 3, or 4." -ForegroundColor Red
        }
    }
} while ($choice -ne 4)

Write-Host ""
Write-Host "Script completed." -ForegroundColor Green
pause