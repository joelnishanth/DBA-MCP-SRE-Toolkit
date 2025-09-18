#!/bin/bash

echo "Testing AWS Inventory Service..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:5002/health | jq .

echo -e "\n2. Testing database summary..."
curl -s http://localhost:5002/api/v1/analytics/database-summary | jq '.summary[0:3]'

echo -e "\n3. Testing top applications..."
curl -s http://localhost:5002/api/v1/analytics/top-applications?limit=3 | jq '.top_applications[0:3]'

echo -e "\n4. Testing cost summary..."
curl -s http://localhost:5002/api/v1/cost/summary?days=30 | jq '.total_cost, .average_daily_cost'

echo -e "\n5. Testing chat interface..."
curl -s -X POST http://localhost:5002/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me the top 3 applications"}' | jq '.response'

echo -e "\nInventory service test completed!"