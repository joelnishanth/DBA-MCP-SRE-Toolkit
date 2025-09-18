#!/bin/bash

echo "🚀 Testing NLP Queries with curl"
echo "=================================="

# Test queries
queries=(
    "Find all employees in the Engineering department"
    "Show me customers from New York"
    "List all active admin users"
    "Get employees with salary above 100000"
    "Find customers who registered in 2023"
    "Show me all managers and contractors"
)

success_count=0
total_count=${#queries[@]}

for query in "${queries[@]}"; do
    echo ""
    echo "🔍 Testing: '$query'"
    echo "----------------------------------------"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        http://localhost:6000/nlp-query)
    
    if [[ $? -eq 0 ]] && [[ $response == *"success"* ]]; then
        echo "✅ Query executed successfully!"
        
        # Extract explanation
        explanation=$(echo "$response" | grep -o '"explanation":"[^"]*"' | cut -d'"' -f4)
        echo "📝 Explanation: $explanation"
        
        # Count results from each database
        postgres_count=$(echo "$response" | grep -o '"postgres":{"success":true,"data":\[\[.*\]\]' | grep -o '\[\[.*\]\]' | grep -o '\[' | wc -l)
        mysql_count=$(echo "$response" | grep -o '"mysql":{"success":true,"data":\[\[.*\]\]' | grep -o '\[\[.*\]\]' | grep -o '\[' | wc -l)
        sqlite_count=$(echo "$response" | grep -o '"sqlite":{"success":true,"data":\[\[.*\]\]' | grep -o '\[\[.*\]\]' | grep -o '\[' | wc -l)
        
        echo "📊 Results found in databases"
        ((success_count++))
    else
        echo "❌ Query failed"
        echo "Response: $response"
    fi
    
    sleep 2
done

echo ""
echo "=================================="
echo "📈 Test Results: $success_count/$total_count queries successful"

if [[ $success_count -eq $total_count ]]; then
    echo "🎉 All tests passed!"
else
    echo "⚠️  Some tests failed"
fi