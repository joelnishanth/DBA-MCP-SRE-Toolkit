#!/bin/bash

echo "🛑 Stopping development environment..."

# Stop all containers
docker-compose down

# Stop any local Vite dev server processes
echo "🔍 Checking for local Vite processes..."
VITE_PIDS=$(pgrep -f "npm run dev" || true)
if [ ! -z "$VITE_PIDS" ]; then
    echo "🛑 Stopping local Vite dev server..."
    kill $VITE_PIDS 2>/dev/null || true
    echo "✅ Vite dev server stopped!"
else
    echo "ℹ️  No local Vite processes found"
fi

# Stop any other Node processes running on port 3000
echo "🔍 Checking for processes on port 3000..."
if command -v lsof > /dev/null 2>&1; then
    PORT_3000_PIDS=$(lsof -ti :3000 2>/dev/null || true)
    if [ ! -z "$PORT_3000_PIDS" ]; then
        echo "🛑 Stopping processes on port 3000..."
        kill $PORT_3000_PIDS 2>/dev/null || true
        echo "✅ Port 3000 processes stopped!"
    fi
else
    echo "ℹ️  lsof not available, skipping port check"
fi

echo "✅ All development services stopped!"
echo "💡 Run ./dev.sh or ./dev-local.sh to start development again"