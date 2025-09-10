# NEAR Protocol Rewards - Enhanced Executor (PowerShell Version)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   NEAR Protocol Rewards - Enhanced Executor" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will execute transactions to help you earn" -ForegroundColor Yellow
Write-Host "NEAR Protocol Rewards by meeting all three requirements:" -ForegroundColor Yellow
Write-Host "1. Transaction Volume (`$10,000+)" -ForegroundColor Yellow
Write-Host "2. Smart Contract Calls (500+)" -ForegroundColor Yellow
Write-Host "3. Unique Wallets (100+)" -ForegroundColor Yellow
Write-Host ""
Write-Host "WARNING: This will execute REAL transactions on the NEAR" -ForegroundColor Red
Write-Host "blockchain that cost NEAR tokens for gas fees!" -ForegroundColor Red
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "- Sufficient NEAR balance in your account" -ForegroundColor Yellow
Write-Host "- Configured your .env.local file correctly" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Starting enhanced protocol rewards execution..." -ForegroundColor Green
Write-Host ""

Set-Location -Path "D:\github\risk-monitor-engine"
npx tsx enhanced-protocol-rewards-executor.ts

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   NEAR Protocol Rewards Execution Completed" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the results above to see your progress toward" -ForegroundColor Yellow
Write-Host "meeting the requirements for NEAR Protocol Rewards." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")