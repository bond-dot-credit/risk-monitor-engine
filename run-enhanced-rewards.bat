@echo off
title NEAR Protocol Rewards Executor

echo =====================================================
echo    NEAR Protocol Rewards - Enhanced Executor
echo =====================================================
echo.
echo This script will execute transactions to help you earn 
echo NEAR Protocol Rewards by meeting all three requirements:
echo 1. Transaction Volume ^($10,000+^)
echo 2. Smart Contract Calls ^(500+^)
echo 3. Unique Wallets ^(100+^)
echo.
echo WARNING: This will execute REAL transactions on the NEAR
echo blockchain that cost NEAR tokens for gas fees!
echo.
echo Make sure you have:
echo - Sufficient NEAR balance in your account
echo - Configured your .env.local file correctly
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Starting enhanced protocol rewards execution...
echo.

cd /d D:\github\risk-monitor-engine
npx tsx enhanced-protocol-rewards-executor.ts

echo.
echo =====================================================
echo    NEAR Protocol Rewards Execution Completed
echo =====================================================
echo.
echo Check the results above to see your progress toward
echo meeting the requirements for NEAR Protocol Rewards.
echo.
echo Press any key to exit...
pause >nul