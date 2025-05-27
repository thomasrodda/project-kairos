@echo off
REM setup.bat - Project Kairos Setup Script for Windows/WSL

echo 🚀 Setting up Project Kairos...

REM Check if we're in WSL or Windows Command Prompt
if "%WSL_DISTRO_NAME%" neq "" (
    echo 🐧 Detected WSL environment
    goto :wsl_setup
) else (
    echo 🪟 Detected Windows environment
    goto :windows_setup
)

:wsl_setup
echo 🔄 Running setup via WSL...
bash ./setup.sh
goto :end

:windows_setup
echo 🔍 Checking dependencies...

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 22+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check for Yarn
yarn --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Yarn is not installed. Please install Yarn from https://yarnpkg.com
    pause
    exit /b 1
)

REM Check for Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git from https://git-scm.com
    pause
    exit /b 1
)

echo ✅ All dependencies found

echo 📦 Installing project dependencies...
yarn install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 🪝 Setting up Git hooks...
yarn husky
if errorlevel 1 (
    echo ❌ Failed to setup Git hooks
    pause
    exit /b 1
)

echo 🔧 Setting up environment variables...
if not exist .env.local (
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your Firebase and database credentials
) else (
    echo ✅ Environment file already exists
)

echo 🗄️  Setting up database...
if exist packages\database (
    cd packages\database
    echo 📄 Generating Prisma client...
    yarn generate
    cd ..\..
    echo ⚠️  Don't forget to:
    echo    1. Set up PostgreSQL database
    echo    2. Update DATABASE_URL in .env.local
    echo    3. Run 'yarn db:migrate' to create tables
    echo    4. Run 'yarn db:seed' to add sample data
) else (
    echo ⚠️  Database package not found - will be created later
)

echo 🧪 Running initial checks...
echo 🔍 Running type checks...
yarn typecheck
if errorlevel 1 (
    echo ❌ Type check failed
    pause
    exit /b 1
)

echo 🧹 Running linter...
yarn lint:check
if errorlevel 1 (
    echo ❌ Linting failed
    pause
    exit /b 1
)

echo 🧪 Running tests...
yarn test --passWithNoTests
if errorlevel 1 (
    echo ❌ Tests failed
    pause
    exit /b 1
)

echo =====================================
echo 🎉 Setup completed successfully!
echo =====================================
echo.
echo Next steps:
echo 1. Edit .env.local with your credentials
echo 2. Set up PostgreSQL database
echo 3. Run 'yarn db:migrate' to create database tables
echo 4. Run 'yarn dev' to start development servers
echo.
echo Happy coding! 🚀
pause

:end