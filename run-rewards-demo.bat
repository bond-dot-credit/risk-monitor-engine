@echo off
CLS
echo ==========================================
echo NEAR Protocol Rewards Execution Demo
echo ==========================================
echo This script will demonstrate how to execute transactions for NEAR Protocol Rewards.
echo.

REM Check if Node.js is installed
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is installed
echo Checking if npm is installed...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install Node.js (which includes npm) first.
    pause
    exit /b 1
)
echo ✓ npm is installed

REM Check if required environment variables are set
echo Checking environment configuration...
if "%NEAR_ACCOUNT_ID%"=="" (
    echo Warning: NEAR_ACCOUNT_ID environment variable is not set
) else (
    echo ✓ NEAR_ACCOUNT_ID is set to: %NEAR_ACCOUNT_ID%
)

if "%NEAR_PRIVATE_KEY%"=="" (
    echo Warning: NEAR_PRIVATE_KEY environment variable is not set
) else (
    echo ✓ NEAR_PRIVATE_KEY is set
)

echo.
echo Available actions:
echo 1. Run configuration verification (recommended first)
echo 2. Run transaction execution demo (no real tokens)
echo 3. Run real transaction executor (WARNING: spends real tokens)
echo 4. Exit
echo.

choice /c 1234 /m "Select an option"
if errorlevel 4 goto :exit
if errorlevel 3 goto :execute_real
if errorlevel 2 goto :demo
if errorlevel 1 goto :verify

:verify
echo.
echo Running configuration verification...
echo This will check if your environment is properly set up.
echo.
npm run verify-config
goto :end

:demo
echo.
echo Running transaction execution demo...
echo This demonstrates the process without spending real tokens.
echo.
npx tsx test-transaction-execution.ts
goto :end

:execute_real
echo.
echo WARNING: This will execute REAL transactions on the NEAR blockchain!
echo These transactions will cost NEAR tokens for gas fees!
echo.
choice /m "Are you sure you want to continue"
if errorlevel 2 goto :end
echo.
echo Executing real transactions...
npx tsx real-transaction-executor.ts
goto :end

:exit
echo.
echo Exiting...
goto :end

:end
echo.
echo Script completed.
pause