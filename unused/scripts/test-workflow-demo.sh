#!/bin/bash

echo "🧪 Testing n8n Workflow Integration"
echo "=================================="
echo ""

# Test 1: Check if n8n is running
echo "1. Checking n8n status..."
n8n_status=$(curl -s http://localhost:5678/healthz | grep -o '"status":"ok"' || echo "failed")
if [[ $n8n_status == *"ok"* ]]; then
    echo "✅ n8n is running at http://localhost:5678"
else
    echo "❌ n8n is not accessible"
    exit 1
fi

# Test 2: Check MCP server n8n health endpoint
echo ""
echo "2. Checking MCP server n8n health endpoint..."
mcp_n8n_health=$(curl -s http://localhost:5001/n8n/health)
echo "MCP n8n health response: $mcp_n8n_health"

# Test 3: Post a test n8n update
echo ""
echo "3. Testing n8n updates endpoint..."
test_update=$(curl -s -X POST "http://localhost:5001/n8n/update" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "Test Workflow",
    "alert_type": "system_notification", 
    "message": "Testing n8n workflow integration",
    "severity": "low",
    "details": {"test": true, "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }')
echo "Test update response: $test_update"

# Test 4: Check if update appears in n8n updates
echo ""
echo "4. Checking n8n updates feed..."
updates=$(curl -s "http://localhost:5001/n8n/updates?limit=1")
echo "Recent updates: $updates"

echo ""
echo "🎯 Next Steps:"
echo "1. Open n8n dashboard: http://localhost:5678"
echo "2. Import a workflow from: sre-genai/n8n/workflows/"
echo "3. Execute the workflow in n8n"
echo "4. Check results at: http://localhost:3000/n8n-updates"
echo ""
echo "📋 Available workflows to import:"
echo "   - dba-ecommerce-provisioning.json (E-commerce database)"
echo "   - dba-analytics-provisioning.json (Analytics warehouse)"  
echo "   - dba-microservices-provisioning.json (Session store)"