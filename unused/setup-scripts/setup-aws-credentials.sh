#!/bin/bash

echo "🔧 AWS Credentials Setup for n8n Workflow Testing"
echo "================================================"
echo ""

echo "This script will help you configure AWS credentials for Bedrock integration."
echo ""

# Check if AWS CLI is installed
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is installed"
    
    # Check if AWS credentials are configured
    if aws sts get-caller-identity &> /dev/null; then
        echo "✅ AWS credentials are configured"
        
        # Get current AWS identity
        aws_identity=$(aws sts get-caller-identity 2>/dev/null)
        echo "Current AWS Identity: $aws_identity"
        echo ""
        
        # Export credentials for Docker Compose
        echo "🔄 Exporting AWS credentials for Docker Compose..."
        export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
        export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
        export AWS_SESSION_TOKEN=$(aws configure get aws_session_token)
        export AWS_DEFAULT_REGION=$(aws configure get region || echo "us-east-1")
        
        echo "✅ Credentials exported to environment"
        echo ""
        
        # Restart MCP server with credentials
        echo "🔄 Restarting MCP server with AWS credentials..."
        docker-compose restart mcp_server
        
        echo ""
        echo "⏳ Waiting for MCP server to start..."
        sleep 5
        
        # Test Bedrock connection
        echo "🧪 Testing Bedrock connection..."
        bedrock_test=$(curl -s "http://localhost:5001/ai/bedrock/test")
        echo "Bedrock Test Result: $bedrock_test"
        
        if [[ $bedrock_test == *"success"* ]]; then
            echo ""
            echo "🎉 SUCCESS! AWS Bedrock is now configured and working!"
            echo ""
            echo "🚀 You can now:"
            echo "1. Import the updated n8n workflows"
            echo "2. Test real Claude AI analysis"
            echo "3. Run: ./test-real-ai.sh"
            echo ""
            echo "📋 To test the e-commerce workflow:"
            echo "curl -X POST \"http://localhost:5678/webhook/db-request-ecommerce\" \\"
            echo "  -H \"Content-Type: application/json\" \\"
            echo "  -d '{\"team\":\"E-commerce Platform\",\"application\":\"RetailHub\",\"requirements\":{\"data_type\":\"product_catalog\"}}'"
        else
            echo ""
            echo "⚠️  Bedrock connection still failing. Possible issues:"
            echo "1. Claude 3.5 Sonnet not enabled in Bedrock console"
            echo "2. Insufficient IAM permissions"
            echo "3. Region not supported"
            echo ""
            echo "📋 Check AWS_BEDROCK_SETUP.md for detailed setup instructions"
        fi
        
    else
        echo "❌ AWS credentials not configured"
        echo ""
        echo "🔧 To configure AWS credentials:"
        echo "1. Run: aws configure"
        echo "2. Enter your AWS Access Key ID"
        echo "3. Enter your AWS Secret Access Key"
        echo "4. Enter your default region (e.g., us-east-1)"
        echo "5. Run this script again"
    fi
    
else
    echo "❌ AWS CLI not installed"
    echo ""
    echo "🔧 To install AWS CLI:"
    echo "macOS: brew install awscli"
    echo "Linux: pip install awscli"
    echo ""
    echo "Then run: aws configure"
fi

echo ""
echo "📖 For detailed setup instructions, see: AWS_BEDROCK_SETUP.md"