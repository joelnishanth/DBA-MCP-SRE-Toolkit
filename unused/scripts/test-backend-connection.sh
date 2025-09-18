#!/bin/bash

echo "Testing backend connections..."

# Test MCP Server
echo "Testing MCP Server (port 5001)..."
curl -f http://localhost:5001/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ MCP Server is responding"
else
    echo "❌ MCP Server is not responding"
fi

# Test Bot Core
echo "Testing Bot Core (port 6000)..."
curl -f http://localhost:6000/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Bot Core is responding"
else
    echo "❌ Bot Core is not responding"
fi

# Test container list endpoint
echo "Testing container list endpoint..."
curl -f http://localhost:5001/containers 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Container list endpoint is working"
else
    echo "❌ Container list endpoint is not working"
fi

echo "Backend connection test completed."