#!/bin/bash

# AWS Credentials Manager for SRE GenAI
# Centralized AWS credentials validation and management

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

# Function to check if .env file exists and create from template if needed
ensure_env_file() {
    if [ ! -f ".env" ]; then
        print_status $YELLOW "⚠️  .env file not found!"
        
        if [ -f ".env.example" ]; then
            print_status $BLUE "📋 Creating .env from template..."
            cp .env.example .env
            print_status $GREEN "✅ .env file created from template"
            print_status $YELLOW "💡 Please update .env with your AWS credentials"
            return 1
        else
            print_status $RED "❌ No .env.example template found!"
            print_status $BLUE "📋 Creating basic .env template..."
            cat > .env << EOF
# AWS Credentials for Bedrock
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_SESSION_TOKEN=your-session-token-here
AWS_REGION=us-east-1

# Note: Never commit your actual .env file to version control
EOF
            print_status $GREEN "✅ Basic .env template created"
            print_status $YELLOW "💡 Please update .env with your AWS credentials"
            return 1
        fi
    fi
    return 0
}

# Function to validate AWS credentials format
validate_credential_format() {
    local access_key="$1"
    local secret_key="$2"
    local session_token="$3"
    
    local format_valid=true
    
    # Validate access key format
    if [[ ! "$access_key" =~ ^ASIA[A-Z0-9]{16}$ ]] && [[ ! "$access_key" =~ ^AKIA[A-Z0-9]{16}$ ]]; then
        if [[ "$access_key" != "your-access-key-here" ]]; then
            print_status $YELLOW "⚠️  AWS_ACCESS_KEY_ID format unusual (expected ASIA... or AKIA...)"
            print_status $YELLOW "   Current: ${access_key:0:10}..."
        fi
        format_valid=false
    fi
    
    # Validate secret key length
    if [ ${#secret_key} -lt 20 ]; then
        if [[ "$secret_key" != "your-secret-key-here" ]]; then
            print_status $YELLOW "⚠️  AWS_SECRET_ACCESS_KEY seems too short (expected 40+ characters)"
        fi
        format_valid=false
    fi
    
    # Validate session token length (for temporary credentials)
    if [ ${#session_token} -lt 100 ]; then
        if [[ "$session_token" != "your-session-token-here" ]]; then
            print_status $YELLOW "⚠️  AWS_SESSION_TOKEN seems too short (expected 200+ characters)"
        fi
        format_valid=false
    fi
    
    return $([ "$format_valid" = true ] && echo 0 || echo 1)
}

# Function to load and validate AWS credentials from .env
load_aws_credentials() {
    # Ensure .env file exists
    if ! ensure_env_file; then
        return 1
    fi
    
    # Source the .env file
    set -a
    source .env 2>/dev/null
    set +a
    
    # Check for required credentials
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_SESSION_TOKEN" ]; then
        print_status $RED "❌ Missing required AWS credentials in .env file!"
        print_status $BLUE "💡 Required variables:"
        print_status $BLUE "   - AWS_ACCESS_KEY_ID"
        print_status $BLUE "   - AWS_SECRET_ACCESS_KEY"
        print_status $BLUE "   - AWS_SESSION_TOKEN"
        print_status $BLUE "   - AWS_REGION"
        return 1
    fi
    
    # Check for placeholder values
    if [[ "$AWS_ACCESS_KEY_ID" == "your-access-key-here" ]] || 
       [[ "$AWS_SECRET_ACCESS_KEY" == "your-secret-key-here" ]] || 
       [[ "$AWS_SESSION_TOKEN" == "your-session-token-here" ]]; then
        print_status $RED "❌ .env file contains placeholder values!"
        print_status $BLUE "💡 Please update .env with actual AWS credentials"
        return 1
    fi
    
    # Validate credential format
    validate_credential_format "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" "$AWS_SESSION_TOKEN"
    
    print_status $GREEN "✅ AWS credentials loaded from .env file:"
    print_status $GREEN "   AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:20}..."
    print_status $GREEN "   AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:0:20}..."
    print_status $GREEN "   AWS_SESSION_TOKEN: ${AWS_SESSION_TOKEN:0:50}..."
    print_status $GREEN "   AWS_REGION: ${AWS_REGION:-us-east-1}"
    
    return 0
}

# Function to test AWS credentials
test_aws_credentials() {
    print_status $BLUE "🧪 Testing AWS credentials..."
    
    # Check if AWS CLI is available
    if ! command -v aws >/dev/null 2>&1; then
        print_status $YELLOW "⚠️  AWS CLI not found - skipping credential test"
        print_status $BLUE "💡 Install AWS CLI for credential validation"
        return 0
    fi
    
    # Test credentials
    if aws sts get-caller-identity >/dev/null 2>&1; then
        local account_id=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
        local user_arn=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
        print_status $GREEN "✅ AWS credentials are valid!"
        print_status $GREEN "   Account: $account_id"
        print_status $GREEN "   User: $user_arn"
        return 0
    else
        print_status $RED "❌ AWS credentials are invalid or expired!"
        print_status $BLUE "💡 Common issues:"
        print_status $BLUE "   - Credentials have expired (common with temporary credentials)"
        print_status $BLUE "   - Incorrect credentials in .env file"
        print_status $BLUE "   - Network connectivity issues"
        return 1
    fi
}

# Function to test Bedrock access specifically
test_bedrock_access() {
    print_status $BLUE "🔍 Testing AWS Bedrock access..."
    
    if ! command -v aws >/dev/null 2>&1; then
        print_status $YELLOW "⚠️  AWS CLI not found - skipping Bedrock test"
        return 0
    fi
    
    # Test Bedrock access by listing foundation models
    if aws bedrock list-foundation-models --region "${AWS_REGION:-us-east-1}" >/dev/null 2>&1; then
        print_status $GREEN "✅ AWS Bedrock access confirmed!"
        return 0
    else
        print_status $YELLOW "⚠️  AWS Bedrock access test failed"
        print_status $BLUE "💡 This might be due to:"
        print_status $BLUE "   - Bedrock not enabled in your AWS account"
        print_status $BLUE "   - Insufficient permissions"
        print_status $BLUE "   - Region not supporting Bedrock"
        print_status $BLUE "   - AI features will use fallback responses"
        return 1
    fi
}

# Function to restart unified Claude service with new credentials
restart_claude_service() {
    print_status $BLUE "🔄 Restarting unified Claude service with new credentials..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_status $YELLOW "⚠️  Docker not running - cannot restart Claude service"
        return 1
    fi
    
    # Check if unified_claude container exists
    if docker ps -a --format "table {{.Names}}" | grep -q "unified_claude"; then
        print_status $BLUE "🛑 Stopping unified Claude service..."
        docker-compose stop unified_claude >/dev/null 2>&1
        
        print_status $BLUE "🚀 Starting unified Claude service with new credentials..."
        docker-compose up -d unified_claude >/dev/null 2>&1
        
        # Wait for service to be ready
        print_status $BLUE "⏳ Waiting for service to be ready..."
        sleep 10
        
        # Test the service
        if curl -s -f http://localhost:7000/health >/dev/null 2>&1; then
            print_status $GREEN "✅ Unified Claude service restarted successfully!"
            
            # Test Bedrock connection
            local bedrock_test=$(curl -s http://localhost:7000/bedrockclaude/test 2>/dev/null)
            if echo "$bedrock_test" | grep -q '"status":"success"'; then
                print_status $GREEN "✅ Bedrock connection test successful!"
            else
                print_status $YELLOW "⚠️  Bedrock connection test failed"
                print_status $BLUE "   Service is running but may not have valid credentials"
            fi
            return 0
        else
            print_status $RED "❌ Failed to restart unified Claude service"
            return 1
        fi
    else
        print_status $YELLOW "⚠️  unified_claude container not found"
        print_status $BLUE "💡 Start the development environment first"
        return 1
    fi
}

# Main function to check and validate all AWS credentials
check_aws_credentials() {
    print_status $BLUE "🔑 AWS Credentials Manager - Checking credentials..."
    echo ""
    
    # Load credentials from .env
    if ! load_aws_credentials; then
        print_status $RED "❌ Failed to load AWS credentials"
        return 1
    fi
    
    echo ""
    
    # Test credentials
    if ! test_aws_credentials; then
        print_status $RED "❌ AWS credentials validation failed"
        return 1
    fi
    
    echo ""
    
    # Test Bedrock access (optional)
    test_bedrock_access
    
    echo ""
    print_status $GREEN "✅ AWS credentials check completed successfully!"
    return 0
}

# Function to provide help and troubleshooting
show_help() {
    echo "AWS Credentials Manager for SRE GenAI"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check          Check and validate AWS credentials (default)"
    echo "  load           Load credentials from .env file"
    echo "  test           Test AWS credentials"
    echo "  bedrock        Test AWS Bedrock access"
    echo "  restart        Restart unified Claude service"
    echo "  help           Show this help message"
    echo ""
    echo "Troubleshooting:"
    echo "  - If credentials are expired: ./refresh-aws-credentials.sh"
    echo "  - If .env is missing: This script will create a template"
    echo "  - If Bedrock fails: Check account permissions and region"
    echo ""
}

# Main script logic
case "${1:-check}" in
    "check")
        check_aws_credentials
        ;;
    "load")
        load_aws_credentials
        ;;
    "test")
        if load_aws_credentials; then
            test_aws_credentials
        fi
        ;;
    "bedrock")
        if load_aws_credentials; then
            test_bedrock_access
        fi
        ;;
    "restart")
        if load_aws_credentials; then
            restart_claude_service
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_status $RED "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac