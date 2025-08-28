@echo off
REM Batch script to execute NEAR Protocol Rewards transactions on Windows

title NEAR Protocol Rewards Executor

echo 🚀 NEAR Protocol Rewards Transaction Executor
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js (which includes npm) first.
    pause
    exit /b 1
)

echo ✅ npm is installed

REM Check if required environment variables are set
set MISSING_VARS=0

if "%NEAR_ACCOUNT_ID%"=="" (
    echo ❌ NEAR_ACCOUNT_ID environment variable is not set
    set MISSING_VARS=1
)

if "%NEAR_PRIVATE_KEY%"=="" (
    echo ❌ NEAR_PRIVATE_KEY environment variable is not set
    set MISSING_VARS=1
)

if %MISSING_VARS%==1 (
    echo.
    echo 📝 Please set these variables in your .env.local file or as system environment variables
    echo 📝 You can copy EXAMPLE.env to .env.local and update with your actual values
    pause
    exit /b 1
)

REM Check if .env.local file exists
if not exist ".env.local" (
    echo ⚠️  .env.local configuration file not found
    echo 📝 Please create a .env.local file with your NEAR account credentials
    echo 📝 You can copy EXAMPLE.env to .env.local and update with your actual values
    pause
    exit /b 1
)

echo ✅ Found .env.local configuration file

REM Install tsx if not already installed
npx tsx --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing tsx...
    npm install tsx --silent
    echo ✅ tsx installed successfully
)

REM Build the project
echo 🏗️  Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build the project
    pause
    exit /b 1
)

echo ✅ Project built successfully

REM Confirm execution
echo.
echo ⚠️  WARNING: This script will execute REAL transactions on the NEAR blockchain!
echo ⚠️  These transactions will cost NEAR tokens for gas fees!
echo.

set /p CONFIRM="Do you want to continue? Type 'YES' to proceed: "
if /i not "%CONFIRM%"=="YES" (
    echo ❌ Transaction execution cancelled by user.
    pause
    exit /b 0
)

REM Execute the real transaction executor
echo 🚀 Executing real transactions for NEAR Protocol Rewards...
echo ⏳ This may take several hours. Please be patient...
echo.

npx tsx real-transaction-executor.ts

if %errorlevel% equ 0 (
    echo 🎉 Transaction execution completed!
) else (
    echo ❌ Error executing transactions
)

pause