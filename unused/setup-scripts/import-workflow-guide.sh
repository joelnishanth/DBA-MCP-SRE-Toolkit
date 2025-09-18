#!/bin/bash

echo "📋 n8n Workflow Import Guide"
echo "============================"
echo ""

echo "🎯 To test the REAL n8n workflow (not mock data), follow these steps:"
echo ""

echo "1. 📂 Open n8n Dashboard:"
echo "   → http://localhost:5678"
echo ""

echo "2. ➕ Import the E-commerce Workflow:"
echo "   → Click the '+' button (top left)"
echo "   → Select 'Import from File'"
echo "   → Choose: $(pwd)/n8n/workflows/dba-ecommerce-provisioning.json"
echo "   → Click 'Import'"
echo ""

echo "3. ⚡ Activate the Workflow:"
echo "   → Toggle the 'Active' switch (top right)"
echo "   → The workflow should show as 'Active'"
echo ""

echo "4. 🧪 Test the Real Webhook:"
echo "   → Run this command after importing:"
echo ""
echo "   curl -X POST \"http://localhost:5678/webhook/db-request-ecommerce\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{"
echo "       \"team\": \"E-commerce Platform\","
echo "       \"application\": \"RetailHub\","
echo "       \"requirements\": {"
echo "         \"data_type\": \"product_catalog\","
echo "         \"expected_records\": \"2M products\""
echo "       }"
echo "     }'"
echo ""

echo "5. 👀 Check Results:"
echo "   → n8n Executions tab (in n8n dashboard)"
echo "   → n8n Updates page: http://localhost:3000/n8n-updates"
echo ""

echo "🔍 Current Status Check:"
echo "   → n8n Dashboard: $(curl -s http://localhost:5678/healthz | grep -q 'ok' && echo '✅ Available' || echo '❌ Not accessible')"
echo "   → MCP Server: $(curl -s http://localhost:5001/health | grep -q 'healthy' && echo '✅ Running' || echo '❌ Not running')"
echo ""

echo "💡 Alternative: Use our test scripts for mock data:"
echo "   → ./quick-workflow-test.sh (single scenario)"
echo "   → ./test-all-scenarios.sh (all scenarios)"
echo ""

echo "🎯 The difference:"
echo "   • Test scripts = Mock data posted directly to MCP server"
echo "   • Real workflow = Actual n8n execution with webhook triggers"