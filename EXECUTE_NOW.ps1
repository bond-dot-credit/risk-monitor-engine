# Immediate Execution Guide for NEAR Protocol Rewards
Clear-Host

Write-Host "================================" -ForegroundColor Green
Write-Host "NEAR PROTOCOL REWARDS EXECUTOR" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your real NEAR account credentials" -ForegroundColor White
Write-Host "2. Run this script to execute transactions" -ForegroundColor White
Write-Host "3. Monitor progress in the console" -ForegroundColor White
Write-Host ""

Write-Host "STEP 1: VERIFYING ENVIRONMENT" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Install Node.js first." -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed ($npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found. Install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 2: CHECKING CONFIGURATION" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✓ Configuration file found" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env.local not found" -ForegroundColor Yellow
    Write-Host "Create it by copying EXAMPLE.env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 3: READY TO EXECUTE" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow
Write-Host "To execute real transactions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "METHOD 1 (Recommended):" -ForegroundColor White
Write-Host "  npm run execute-rewards" -ForegroundColor Gray
Write-Host ""
Write-Host "METHOD 2 (Direct):" -ForegroundColor White
Write-Host "  npx tsx real-transaction-executor.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "METHOD 3 (Interactive):" -ForegroundColor White
Write-Host "  .\run-rewards.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "WARNING: These transactions will spend REAL NEAR tokens!" -ForegroundColor Red
Write-Host "Ensure your account has sufficient funds before proceeding." -ForegroundColor Red
Write-Host ""

Write-Host "STEP 4: MONITORING" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow
Write-Host "Visit: http://localhost:3000/protocol-rewards" -ForegroundColor Gray
Write-Host "Or use the API endpoint: POST /api/near-protocol-rewards" -ForegroundColor Gray
Write-Host ""

Write-Host "EXECUTION COMPLETE" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "For issues, check the documentation files:" -ForegroundColor White
Write-Host "  - EXECUTION_GUIDE.md" -ForegroundColor Gray
Write-Host "  - HOW_TO_EXECUTE_REAL_TRANSACTIONS.md" -ForegroundColor Gray
Write-Host "  - READY_TO_EXECUTE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")