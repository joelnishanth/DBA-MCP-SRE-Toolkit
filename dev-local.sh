#!/bin/bash

# SRE GenAI Development Environment
# Runs backend services in Docker, frontend locally with hot reloading
echo "🚀 Starting SRE GenAI Development Environment..."
echo "   Backend services: Docker containers"
echo "   Frontend: Local Vite dev server with hot reloading"
echo ""

# Check if Docker is running first
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "liquid-glass-ui/package.json" ]; then
    echo "❌ Please run this script from the sre-genai directory"
    exit 1
fi

# Check AWS credentials before starting services
echo "🔑 Validating AWS credentials..."
if ! ./aws-credentials-manager.sh check; then
    echo ""
    echo "🛑 Cannot start development environment without valid AWS credentials."
    echo "   AI features require AWS Bedrock access."
    echo ""
    echo "🔧 To fix this:"
    echo "   1. Run: ./refresh-aws-credentials.sh"
    echo "   2. Run: ./aws-credentials-manager.sh help"
    echo "   3. Or manually update .env file"
    exit 1
fi

echo ""

# Start backend services only
echo "🐳 Starting backend services in Docker..."
docker-compose up -d postgres_db mysql_db sqlite_db mcp_server bot_core aws_inventory_service unified_claude slow_query_app connection_leak_app lock_contention_app memory_bloat_app data_seeder

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services started successfully
echo "🔍 Checking service health..."
sleep 10

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready"
            return 0
        fi
        echo "⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Check critical services
check_service "MCP Server" "http://localhost:5001/health"
check_service "Bot Core API" "http://localhost:6000/health"
check_service "AWS Inventory Service" "http://localhost:5002/health"
check_service "Unified Claude Service" "http://localhost:7000/health"

# Verify AWS credentials are working with services
echo "🔍 Verifying AWS credentials with services..."
sleep 5

# Check AWS credentials status via MCP server
aws_status=$(curl -s http://localhost:5001/aws-credentials-status 2>/dev/null)
if echo "$aws_status" | grep -q '"available":true'; then
    echo "✅ AWS credentials are working with MCP server"
else
    echo "⚠️  AWS credentials may not be working with MCP server"
    echo "   Status: $(echo "$aws_status" | jq -r '.status // "Unknown"' 2>/dev/null || echo "Unknown")"
fi

# Check Unified Claude service Bedrock status
bedrock_status=$(curl -s http://localhost:7000/bedrockclaude/status 2>/dev/null)
if echo "$bedrock_status" | grep -q '"bedrock_configured":true'; then
    echo "✅ AWS Bedrock is configured and ready"
else
    echo "⚠️  AWS Bedrock may not be configured properly"
    echo "   This may affect NoSQL onboarding and SQL provisioning features"
fi

# Install dependencies if needed
if [ ! -d "liquid-glass-ui/node_modules" ]; then
    echo "📦 Installing dependencies..."
    if ! (cd liquid-glass-ui && npm install); then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Backend services started successfully!"
echo ""
echo "🌐 Backend Services:"
echo "   - PostgreSQL Database: localhost:5432"
echo "   - MySQL Database: localhost:3306"
echo "   - MCP Server API: http://localhost:5001"
echo "   - Bot Core API: http://localhost:6000"
echo "   - AWS Inventory Service: http://localhost:5002"
echo "   - Unified Claude Service: http://localhost:7000"
echo ""
echo "🔥 Starting Frontend Development Server..."
echo "💡 Frontend will run locally with instant hot reloading!"
echo "🌐 Frontend will be available at: http://localhost:3000"
echo ""

# Start Vite dev server locally in background
echo "🚀 Starting Vite dev server in background..."
(cd liquid-glass-ui && npm run dev > /dev/null 2>&1 &)

# Give it a moment to start
sleep 3

# Check if Vite server started successfully
if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
    echo "✅ Frontend development server started successfully!"
else
    echo "⏳ Frontend server is starting up..."
    echo "💡 It may take a few moments to be ready at http://localhost:3000"
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Quick Commands:"
echo "   - View logs: docker-compose logs -f [service_name]"
echo "   - Stop services: docker-compose down"
echo "   - Restart service: docker-compose restart [service_name]"
echo "   - Check status: docker-compose ps"
echo ""
echo "🌐 Access Points:"
echo "   - Frontend UI: http://localhost:3000"
echo "   - MCP Server: http://localhost:5001"
echo "   - Bot Core API: http://localhost:6000"
echo "   - AWS Inventory: http://localhost:5002"
echo "   - Unified Claude: http://localhost:7000"
echo ""
echo "💡 The frontend runs with hot reloading - changes will update automatically!"
echo "🛑 To stop everything: ./stop-dev.sh"