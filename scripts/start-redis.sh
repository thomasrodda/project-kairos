#!/bin/bash

# Start Redis for Project Kairos development

echo "🔧 Starting Redis for Project Kairos..."

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis first:"
    echo ""
    echo "On Ubuntu/WSL:"
    echo "  sudo apt update"
    echo "  sudo apt install redis-server"
    echo ""
    echo "On macOS:"
    echo "  brew install redis"
    echo ""
    echo "On Windows (native):"
    echo "  Download from: https://github.com/microsoftarchive/redis/releases"
    exit 1
fi

# Start Redis
echo "🚀 Starting Redis server..."
redis-server --daemonize yes

# Check if Redis started successfully
sleep 1
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running successfully!"
    echo "   You can now run 'yarn dev' in another terminal"
else
    echo "❌ Failed to start Redis"
    exit 1
fi