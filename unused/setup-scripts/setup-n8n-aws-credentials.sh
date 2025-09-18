#!/bin/bash

# Setup AWS Credentials in n8n
# This script helps configure AWS credentials for n8n to access Bedrock

echo "🔧 Setting up AWS Credentials for n8n Bedrock Integration"
echo "=================================================="

# Check if AWS credentials are available
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found in environment variables"
    echo "Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set"
    exit 1
fi

echo "✅ AWS credentials found in environment"
echo "   Access Key ID: ${AWS_ACCESS_KEY_ID:0:10}..."
echo "   Region: ${AWS_DEFAULT_REGION:-us-east-1}"

# Check if n8n is running
if ! curl -s http://localhost:5678/healthz > /dev/null; then
    echo "❌ n8n is not running or not accessible"
    echo "Please ensure n8n is running on http://localhost:5678"
    exit 1
fi

echo "✅ n8n is running and accessible"

# Test Bedrock access
echo ""
echo "🧪 Testing AWS Bedrock access..."

# Test via MCP server first (which has the same credentials)
BEDROCK_TEST=$(curl -s http://localhost:5001/ai/bedrock/test)
if echo "$BEDROCK_TEST" | grep -q '"status":"success"'; then
    echo "✅ AWS Bedrock access confirmed via MCP server"
    echo "   Model: $(echo "$BEDROCK_TEST" | grep -o '"model_id":"[^"]*"' | cut -d'"' -f4)"
    echo "   Region: $(echo "$BEDROCK_TEST" | grep -o '"region":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ AWS Bedrock access test failed"
    echo "Response: $BEDROCK_TEST"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open n8n in your browser: http://localhost:5678"
echo "2. Go to Settings → Credentials → Add Credential"
echo "3. Select 'AWS' credential type"
echo "4. Configure with these values:"
echo "   - Name: 'AWS Bedrock'"
echo "   - Access Key ID: $AWS_ACCESS_KEY_ID"
echo "   - Secret Access Key: $AWS_SECRET_ACCESS_KEY"
echo "   - Region: ${AWS_DEFAULT_REGION:-us-east-1}"
echo ""
echo "5. Import and activate the DBA workflows:"
echo "   - dba-ecommerce-provisioning.json"
echo "   - dba-analytics-provisioning.json"
echo "   - dba-microservices-provisioning.json"
echo ""
echo "6. Test a workflow:"
echo "   curl -X POST 'http://localhost:5678/webhook/db-request-ecommerce' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"team\":\"Test Team\",\"application\":\"Test App\",\"requirements\":{}}'"
echo ""
echo "🎉 Setup complete! Your n8n workflows can now call AWS Bedrock directly."