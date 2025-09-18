#!/bin/bash

echo "🧪 Testing Simple n8n Workflow"
echo "==============================="
echo ""

echo "📋 Instructions:"
echo "1. Import simple-test-workflow.json into n8n"
echo "2. Activate the workflow"
echo "3. Run this script"
echo ""

echo "🚀 Attempting to trigger the simple workflow..."
echo ""

response=$(curl -s -X POST "http://localhost:5678/webhook/simple-db-test" \
  -H "Content-Type: application/json" \
  -d '{
    "team": "Test Team",
    "application": "Test Application",
    "database": "Test Database",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')

echo "📤 Webhook Response:"
echo "$response"
echo ""

if [[ $response == *"404"* ]] || [[ $response == *"not registered"* ]]; then
    echo "❌ Workflow not found or not active"
    echo ""
    echo "🔧 To fix this:"
    echo "1. Open http://localhost:5678"
    echo "2. Import: $(pwd)/simple-test-workflow.json"
    echo "3. Toggle 'Active' switch"
    echo "4. Run this script again"
else
    echo "✅ Webhook triggered successfully!"
    echo ""
    echo "🔍 Check results:"
    echo "   • n8n Dashboard: http://localhost:5678 (Executions tab)"
    echo "   • n8n Updates: http://localhost:3000/n8n-updates"
fi

echo ""
echo "💡 This tests a REAL n8n workflow execution (not mock data)"