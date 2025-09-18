import httpx
from claude_api import get_claude_response

async def process_nlp_query(user_query: str):
    # Generate SQL queries using Claude
    prompt = f"""
    Convert this natural language query into SQL queries for three databases.

    Query: "{user_query}"

    Schemas:
    - PostgreSQL employees: id, first_name, last_name, email, department, salary, hire_date, manager_id
    - MySQL customers: id, first_name, last_name, email, phone, city, registration_date  
    - SQLite users: id, username, first_name, last_name, email, role, is_active

    Rules:
    - Use ILIKE for PostgreSQL case-insensitive search
    - Use LIKE for MySQL and SQLite
    - Limit results to 20 records
    - If query doesn't match a database, use null
    
    Return valid JSON only:
    {{
        "postgres_query": "SELECT * FROM employees WHERE department ILIKE '%Engineering%' LIMIT 20",
        "mysql_query": "SELECT * FROM customers WHERE city LIKE '%New York%' LIMIT 20", 
        "sqlite_query": "SELECT * FROM users WHERE role LIKE '%Admin%' AND is_active = 1 LIMIT 20",
        "explanation": "Searches for matching records across all databases"
    }}
    """
    
    claude_response = await get_claude_response(prompt)
    
    try:
        import json
        import re
        
        # Try to extract JSON from Claude's response
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', claude_response)
        if json_match:
            queries = json.loads(json_match.group())
        else:
            raise ValueError("No JSON found in response")
            
    except Exception as e:
        print(f"JSON parsing error: {e}")
        print(f"Claude response: {claude_response}")
        
        # Fallback queries based on common patterns
        queries = {
            "postgres_query": f"SELECT * FROM employees WHERE first_name ILIKE '%{user_query.split()[-1]}%' OR last_name ILIKE '%{user_query.split()[-1]}%' OR department ILIKE '%{user_query.split()[-1]}%' LIMIT 10" if any(word in user_query.lower() for word in ['employee', 'engineering', 'salary', 'department']) else None,
            "mysql_query": f"SELECT * FROM customers WHERE first_name LIKE '%{user_query.split()[-1]}%' OR last_name LIKE '%{user_query.split()[-1]}%' OR city LIKE '%{user_query.split()[-1]}%' LIMIT 10" if any(word in user_query.lower() for word in ['customer', 'city', 'phone', 'registered']) else None,
            "sqlite_query": f"SELECT * FROM users WHERE first_name LIKE '%{user_query.split()[-1]}%' OR last_name LIKE '%{user_query.split()[-1]}%' OR role LIKE '%{user_query.split()[-1]}%' LIMIT 10" if any(word in user_query.lower() for word in ['user', 'admin', 'manager', 'active']) else None,
            "explanation": f"Fallback queries generated for: {user_query}"
        }
    
    # Execute queries via MCP server
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://mcp_server:5000/query/multi-db",
            json=queries
        )
        db_results = response.json()
    
    return {
        "user_query": user_query,
        "generated_queries": queries,
        "database_results": db_results,
        "explanation": queries.get("explanation", "")
    }