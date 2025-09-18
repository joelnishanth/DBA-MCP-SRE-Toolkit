#!/usr/bin/env python3
"""
Test script to verify Claude integration is working
"""
import asyncio
import json
import httpx

async def test_claude_integration():
    """Test the Claude AI integration with infrastructure queries"""
    
    test_queries = [
        {
            "query": "What are our top cost drivers?",
            "context": "executive",
            "data": {
                "key_metrics": {
                    "total_databases": 235,
                    "total_applications": 10,
                    "monthly_cost": 57605.14,
                    "annual_projection": 691261.68
                },
                "cost_breakdown": {
                    "by_application": {
                        "PaymentProcessor": 11877.77,
                        "AnalyticsPlatform": 9142.67,
                        "LoggingService": 7363.75
                    }
                }
            }
        },
        {
            "query": "Show me EC2 instances that might be underutilized",
            "context": "inventory",
            "data": {
                "resources": [
                    {"type": "EC2", "application": "TestApp", "cost_monthly": 150, "specifications": {"instance_type": "t3.large"}},
                    {"type": "RDS", "application": "Database", "cost_monthly": 300, "specifications": {"engine": "PostgreSQL"}}
                ],
                "totalCost": 450,
                "resourceCounts": {"ec2": 1, "rds": 1, "s3": 0}
            }
        }
    ]
    
    print("🧪 Testing Claude AI Integration...")
    print("=" * 50)
    
    async with httpx.AsyncClient() as client:
        for i, test in enumerate(test_queries, 1):
            print(f"\n🔍 Test {i}: {test['context'].title()} Context")
            print(f"Query: {test['query']}")
            
            try:
                response = await client.post(
                    "http://localhost:6000/nlp-query",
                    json=test,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Success!")
                    print(f"Response: {result.get('response', 'No response')[:200]}...")
                    if result.get('actions'):
                        print(f"Actions: {result['actions']}")
                else:
                    print(f"❌ HTTP Error: {response.status_code}")
                    print(f"Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    asyncio.run(test_claude_integration())