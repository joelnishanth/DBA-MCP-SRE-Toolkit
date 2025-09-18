#!/bin/bash

# Simple deployment test for SRE GenAI
echo "🧪 Testing SRE GenAI Deployment"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Test if required files exist
print_status $BLUE "🔍 Checking required files..."

required_files=(
    "dev-local.sh"
    "aws-credentials-manager.sh"
    "refresh-aws-credentials.sh"
    "docker-compose.yml"
    "liquid-glass-ui/package.json"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status $GREEN "   ✅ $file"
    else
        print_status $RED "   ❌ $file (missing)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_status $RED "❌ Some required files are missing!"
    exit 1
fi

echo ""

# Test if scripts are executable
print_status $BLUE "🔍 Checking script permissions..."

scripts=(
    "dev-local.sh"
    "aws-credentials-manager.sh"
    "refresh-aws-credentials.sh"
)

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        print_status $GREEN "   ✅ $script is executable"
    else
        print_status $YELLOW "   ⚠️  $script is not executable (fixing...)"
        chmod +x "$script"
        print_status $GREEN "   ✅ $script made executable"
    fi
done

echo ""

# Test Docker
print_status $BLUE "🐳 Checking Docker..."
if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
        print_status $GREEN "   ✅ Docker is installed and running"
    else
        print_status $RED "   ❌ Docker is installed but not running"
        print_status $BLUE "   💡 Please start Docker and try again"
        exit 1
    fi
else
    print_status $RED "   ❌ Docker is not installed"
    print_status $BLUE "   💡 Please install Docker and try again"
    exit 1
fi

echo ""

# Test Node.js (for frontend)
print_status $BLUE "📦 Checking Node.js..."
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    print_status $GREEN "   ✅ Node.js is installed ($node_version)"
    
    if command -v npm >/dev/null 2>&1; then
        npm_version=$(npm --version)
        print_status $GREEN "   ✅ npm is installed ($npm_version)"
    else
        print_status $RED "   ❌ npm is not installed"
        exit 1
    fi
else
    print_status $RED "   ❌ Node.js is not installed"
    print_status $BLUE "   💡 Please install Node.js and try again"
    exit 1
fi

echo ""

# Test AWS credentials setup
print_status $BLUE "🔑 Checking AWS credentials setup..."
if [ -f ".env" ]; then
    if grep -q "AWS_ACCESS_KEY_ID" ".env" && grep -q "AWS_SECRET_ACCESS_KEY" ".env"; then
        print_status $GREEN "   ✅ .env file has AWS credentials configuration"
    else
        print_status $YELLOW "   ⚠️  .env file exists but may not have complete AWS credentials"
    fi
else
    print_status $YELLOW "   ⚠️  .env file not found"
    print_status $BLUE "   💡 Run ./refresh-aws-credentials.sh to set up AWS credentials"
fi

echo ""

# Summary
print_status $GREEN "🎉 Deployment Test Summary"
print_status $GREEN "=========================="
print_status $GREEN "✅ All required files are present"
print_status $GREEN "✅ All scripts have proper permissions"
print_status $GREEN "✅ Docker is ready"
print_status $GREEN "✅ Node.js and npm are ready"

echo ""
print_status $BLUE "🚀 Ready to deploy!"
print_status $BLUE "   Run: ./dev-local.sh"
print_status $BLUE ""
print_status $BLUE "📋 Deployment Process:"
print_status $BLUE "   1. Backend services start in Docker containers"
print_status $BLUE "   2. Frontend starts locally with hot reloading"
print_status $BLUE "   3. Access the application at http://localhost:3000"

echo ""
print_status $GREEN "🎯 Test completed successfully!"