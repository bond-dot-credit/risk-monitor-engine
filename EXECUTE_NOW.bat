@echo off
CLS
TITLE NEAR Protocol Rewards - Execute Now
COLOR 0A

echo ================================
echo NEAR PROTOCOL REWARDS EXECUTOR
echo ================================
echo.

echo INSTRUCTIONS:
echo 1. Edit .env.local with your real NEAR account credentials
echo 2. Run this script to execute transactions
echo 3. Monitor progress in the console
echo.

echo STEP 1: VERIFYING ENVIRONMENT
echo -------------------------------
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install Node.js first.
    pause
    exit /b 1
)
echo ✓ Node.js is installed

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Install Node.js first.
    pause
    exit /b 1
)
echo ✓ npm is installed
echo.

echo STEP 2: CHECKING CONFIGURATION
echo -------------------------------
if exist ".env.local" (
    echo ✓ Configuration file found
) else (
    echo WARNING: .env.local not found
    echo Create it by copying EXAMPLE.env
    echo.
    echo Press any key to continue anyway...
    pause >nul
)
echo.

echo STEP 3: READY TO EXECUTE
echo ------------------------
echo To execute real transactions:
echo.
echo METHOD 1 (Recommended):
echo 1. Open PowerShell as Administrator
echo 2. Navigate to this directory
echo 3. Run: npm run execute-rewards
echo.
echo METHOD 2 (Direct):
echo 1. Run: npx tsx real-transaction-executor.ts
echo.
echo METHOD 3 (Interactive):
echo 1. Run: run-rewards.ps1
echo.
echo WARNING: These transactions will spend REAL NEAR tokens!
echo Ensure your account has sufficient funds before proceeding.
echo.

echo STEP 4: MONITORING
echo ------------------
echo Visit: http://localhost:3000/protocol-rewards
echo Or use the API endpoint: POST /api/near-protocol-rewards
echo.

echo EXECUTION COMPLETE
echo =================
echo.
echo For issues, check the documentation files:
echo - EXECUTION_GUIDE.md
echo - HOW_TO_EXECUTE_REAL_TRANSACTIONS.md
echo - READY_TO_EXECUTE.md
echo.
pause