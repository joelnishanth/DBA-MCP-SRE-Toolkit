import requests
import json
import time

# Test queries
test_queries = [
    "Find all employees in the Engineering department",
    "Show me customers from New York", 
    "List all active admin users",
    "Get employees with salary above 100000",
    "Find customers who registered in 2023",
    "Show me all managers and contractors"
]

def test_query(query):
    print(f"\n🔍 Testing: '{query}'")
    print("-" * 60)
    
    try:
        response = requests.post(
            "http://localhost:6000/nlp-query",
            json={"query": query},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Query executed successfully!")
            print(f"📝 Explanation: {result.get('explanation', 'N/A')}")
            
            # Show generated queries
            queries = result.get("generated_queries", {})
            print("\n🔧 Generated SQL Queries:")
            
            if queries.get("postgres_query"):
                print(f"  PostgreSQL: {queries['postgres_query']}")
            if queries.get("mysql_query"):
                print(f"  MySQL: {queries['mysql_query']}")
            if queries.get("sqlite_query"):
                print(f"  SQLite: {queries['sqlite_query']}")
            
            # Show results count
            db_results = result.get("database_results", {})
            print("\n📊 Results:")
            
            for db_name, db_result in db_results.items():
                if db_result.get("success"):
                    data_count = len(db_result.get("data", []))
                    print(f"  {db_name.upper()}: {data_count} records")
                else:
                    print(f"  {db_name.upper()}: ERROR - {db_result.get('error', 'Unknown')}")
            
            return True
            
        else:
            print(f"❌ Query failed: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 Starting NLP Query Tests")
    print("=" * 60)
    
    # Wait for services to be ready
    print("⏳ Waiting for services to be ready...")
    time.sleep(10)
    
    success_count = 0
    total_count = len(test_queries)
    
    for query in test_queries:
        if test_query(query):
            success_count += 1
        time.sleep(2)  # Brief pause between tests
    
    print("\n" + "=" * 60)
    print(f"📈 Test Results: {success_count}/{total_count} queries successful")
    
    if success_count == total_count:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed - check logs above")

if __name__ == "__main__":
    main()