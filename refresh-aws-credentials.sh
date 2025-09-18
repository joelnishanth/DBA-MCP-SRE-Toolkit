#!/bin/bash

# AWS Credentials Refresh Script for SRE GenAI
# This script helps refresh expired AWS credentials and restart the unified Claude service

echo "🔄 AWS Credentials Refresh for SRE GenAI"
echo "========================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

echo "📋 Current credential status:"
echo "----------------------------"

# Test current AWS credentials
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "✅ AWS CLI credentials are valid"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    echo "   Account: $ACCOUNT_ID"
    echo "   User: $USER_ARN"
else
    echo "❌ AWS CLI credentials are invalid or expired"
    echo ""
    echo "🔧 To fix this:"
    echo "   1. Run 'aws configure' to set up permanent credentials"
    echo "   2. Or run 'aws sso login' if using AWS SSO"
    echo "   3. Or get fresh temporary credentials from AWS Console"
    echo ""
    echo "   Required permissions:"
    echo "   - bedrock:InvokeModel"
    echo "   - bedrock:InvokeModelWithResponseStream"
    echo ""
    read -p "Press Enter after updating your AWS credentials..."
fi

echo ""
echo "🔄 Updating .env file with current AWS credentials..."

# Get current AWS credentials from environment or AWS CLI
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "   Using environment variables"
    NEW_ACCESS_KEY="$AWS_ACCESS_KEY_ID"
    NEW_SECRET_KEY="$AWS_SECRET_ACCESS_KEY"
    NEW_SESSION_TOKEN="$AWS_SESSION_TOKEN"
    NEW_REGION="${AWS_REGION:-us-east-1}"
else
    echo "   Extracting from AWS CLI configuration"
    # Try to get credentials from AWS CLI
    if command -v aws > /dev/null 2>&1; then
        NEW_ACCESS_KEY=$(aws configure get aws_access_key_id)
        NEW_SECRET_KEY=$(aws configure get aws_secret_access_key)
        NEW_SESSION_TOKEN=$(aws configure get aws_session_token)
        NEW_REGION=$(aws configure get region)
        NEW_REGION="${NEW_REGION:-us-east-1}"
    else
        echo "❌ AWS CLI not found. Please install AWS CLI or set environment variables manually."
        exit 1
    fi
fi

# Update .env file
cat > .env << EOF
# AWS Credentials for Bedrock
# Updated: $(date)

AWS_ACCESS_KEY_ID=$NEW_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=$NEW_SECRET_KEY
AWS_SESSION_TOKEN=$NEW_SESSION_TOKEN
AWS_REGION=$NEW_REGION

# Note: Never commit your actual .env file to version control
# Add .env to your .gitignore file
EOF

echo "✅ .env file updated with fresh credentials"

echo ""
echo "🔄 Using AWS credentials manager to restart services..."

# Use the centralized credentials manager to restart services
if ./aws-credentials-manager.sh restart; then
    echo ""
    echo "🎉 AWS credentials refreshed and services restarted successfully!"
    echo ""
    echo "✅ You can now use:"
    echo "   - SQL Provisioning: http://localhost:3000/sql-provisioning"
    echo "   - Query Performance: http://localhost:3000/query-performance"
    echo "   - All other AI-powered features"
else
    echo ""
    echo "⚠️  Service restart had issues, but credentials are updated."
    echo ""
    echo "🔧 Manual restart options:"
    echo "   1. Restart development environment: ./dev.sh or ./dev-local.sh"
    echo "   2. Restart just Claude service: docker restart unified_claude"
    echo "   3. Check service status: ./aws-credentials-manager.sh check"
fi

echo ""
echo "📊 Final validation:"
./aws-credentials-manager.sh check