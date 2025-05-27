#!/bin/bash
# setup.sh - Project Kairos Setup Script

set -e

echo "🚀 Setting up Project Kairos..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 22+${NC}"
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        echo -e "${RED}❌ Yarn is not installed. Please install Yarn 1.22+${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed. Please install Git${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Install project dependencies
install_dependencies() {
    echo "📦 Installing project dependencies..."
    yarn install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Setup Husky git hooks
setup_git_hooks() {
    echo "🪝 Setting up Git hooks..."
    yarn husky
    chmod +x .husky/pre-commit
    chmod +x .husky/pre-push
    echo -e "${GREEN}✅ Git hooks configured${NC}"
}

# Create environment file if it doesn't exist
setup_environment() {
    if [ ! -f .env.local ]; then
        echo "🔧 Setting up environment variables..."
        cp .env.example .env.local
        echo -e "${YELLOW}⚠️  Please edit .env.local with your Firebase and database credentials${NC}"
    else
        echo "✅ Environment file already exists"
    fi
}

# Setup database
setup_database() {
    echo "🗄️  Setting up database..."
    
    # Check if database package exists
    if [ -d "packages/database" ]; then
        cd packages/database
        
        # Generate Prisma client
        echo "📄 Generating Prisma client..."
        yarn generate
        
        # Note about database setup
        echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
        echo "   1. Set up PostgreSQL database"
        echo "   2. Update DATABASE_URL in .env.local"
        echo "   3. Run 'yarn db:migrate' to create tables"
        echo "   4. Run 'yarn db:seed' to add sample data"
        
        cd ../..
    else
        echo -e "${YELLOW}⚠️  Database package not found - will be created later${NC}"
    fi
}

# Run initial build and tests
run_initial_checks() {
    echo "🧪 Running initial checks..."
    
    # Type checking
    echo "🔍 Running type checks..."
    yarn typecheck
    
    # Linting
    echo "🧹 Running linter..."
    yarn lint:check
    
    # Tests
    echo "🧪 Running tests..."
    yarn test --passWithNoTests
    
    echo -e "${GREEN}✅ All checks passed${NC}"
}

# Update FILE_TREE.md
update_file_tree() {
    if command -v tree &> /dev/null; then
        echo "🌳 Updating FILE_TREE.md..."
        yarn update-tree
    else
        echo -e "${YELLOW}⚠️  'tree' command not found - FILE_TREE.md won't auto-update${NC}"
        echo "   Install tree with: brew install tree (macOS) or apt install tree (Ubuntu)"
    fi
}

# Main setup function
main() {
    echo "====================================="
    echo "🎯 Project Kairos Development Setup"
    echo "====================================="
    
    check_dependencies
    install_dependencies
    setup_git_hooks  
    setup_environment
    setup_database
    run_initial_checks
    update_file_tree
    
    echo ""
    echo "====================================="
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo "====================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your credentials"
    echo "2. Set up PostgreSQL database"
    echo "3. Run 'yarn db:migrate' to create database tables"
    echo "4. Run 'yarn dev' to start development servers"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main