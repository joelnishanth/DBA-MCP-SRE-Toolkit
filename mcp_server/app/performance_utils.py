import psycopg2
import mysql.connector
import sqlite3
import time
import json
import sys
import os

# Add parent directory to path to import unified client
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

try:
    from unified_claude_client import get_claude_operations
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False
    print("Warning: unified_claude_client not available, using fallback recommendations")

POSTGRES_CONFIG = {
    'host': 'postgres_db',
    'database': 'testdb',
    'user': 'postgres',
    'password': 'password'
}

MYSQL_CONFIG = {
    'host': 'mysql_db',
    'database': 'testdb',
    'user': 'root',
    'password': 'password'
}

def analyze_postgres_query(query):
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        cur = conn.cursor()
        
        start_time = time.time()
        cur.execute(query)
        results = cur.fetchall()
        execution_time = (time.time() - start_time) * 1000
        
        cur.execute(f"EXPLAIN (ANALYZE, FORMAT JSON) {query}")
        plan = cur.fetchone()[0][0]
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "execution_time_ms": round(execution_time, 2),
            "rows_returned": len(results),
            "execution_plan": plan,
            "database": "PostgreSQL"
        }
    except Exception as e:
        return {"success": False, "error": str(e), "database": "PostgreSQL"}

def analyze_mysql_query(query):
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cur = conn.cursor()
        
        start_time = time.time()
        cur.execute(query)
        results = cur.fetchall()
        execution_time = (time.time() - start_time) * 1000
        
        cur.execute(f"EXPLAIN FORMAT=JSON {query}")
        plan = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "execution_time_ms": round(execution_time, 2),
            "rows_returned": len(results),
            "execution_plan": json.loads(plan),
            "database": "MySQL"
        }
    except Exception as e:
        return {"success": False, "error": str(e), "database": "MySQL"}

def analyze_sqlite_query(query):
    try:
        conn = sqlite3.connect('/tmp/company.db')
        cur = conn.cursor()
        
        start_time = time.time()
        cur.execute(query)
        results = cur.fetchall()
        execution_time = (time.time() - start_time) * 1000
        
        cur.execute(f"EXPLAIN QUERY PLAN {query}")
        plan_rows = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "execution_time_ms": round(execution_time, 2),
            "rows_returned": len(results),
            "execution_plan": [{"detail": row[3]} for row in plan_rows],
            "database": "SQLite"
        }
    except Exception as e:
        return {"success": False, "error": str(e), "database": "SQLite"}

async def analyze_query_performance(postgres_query=None, mysql_query=None, sqlite_query=None):
    performance_results = {}
    queries_executed = {}
    
    if postgres_query:
        performance_results['postgres'] = analyze_postgres_query(postgres_query)
        queries_executed['postgres'] = postgres_query
    
    if mysql_query:
        performance_results['mysql'] = analyze_mysql_query(mysql_query)
        queries_executed['mysql'] = mysql_query
    
    if sqlite_query:
        performance_results['sqlite'] = analyze_sqlite_query(sqlite_query)
        queries_executed['sqlite'] = sqlite_query
    
    # Generate AI recommendations based on performance results and queries
    ai_recommendations = await generate_ai_recommendations(performance_results, queries_executed)
    
    return {
        "performance_results": performance_results,
        "ai_recommendations": ai_recommendations,
        "queries_analyzed": queries_executed
    }

async def generate_ai_recommendations(performance_results, queries_executed=None):
    """Generate AI-powered recommendations using Claude AI for query performance analysis"""
    
    # Check if Claude is available
    if not CLAUDE_AVAILABLE:
        return {
            "overall_assessment": "AI analysis service unavailable - using fallback analysis",
            "database_recommendations": generate_fallback_recommendations(performance_results),
            "ai_metadata": {
                "service_status": "unavailable",
                "error": "unified_claude_client not available",
                "fallback_used": True
            }
        }
    
    try:
        # Import requests for direct HTTP calls since async client may have issues
        import requests
        
        # Prepare performance data for AI analysis
        analysis_prompt = f"""
You are a Database Performance Analysis Agent with expertise in PostgreSQL, MySQL, and SQLite optimization. 

Analyze the following query performance results and provide detailed, actionable recommendations:

PERFORMANCE DATA:
{json.dumps(performance_results, indent=2)}

QUERIES EXECUTED:
{json.dumps(queries_executed, indent=2) if queries_executed else "Not provided"}

Please provide your analysis in the following JSON format:
{{
    "overall_assessment": "Comprehensive assessment of overall query performance across all databases",
    "database_recommendations": {{
        "postgres": {{
            "assessment": "Brief performance assessment",
            "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
        }},
        "mysql": {{
            "assessment": "Brief performance assessment", 
            "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
        }},
        "sqlite": {{
            "assessment": "Brief performance assessment",
            "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
        }}
    }},
    "performance_insights": {{
        "execution_time_analysis": "Analysis of execution times and patterns",
        "query_plan_insights": "Insights from execution plans where available",
        "optimization_priorities": ["Priority 1", "Priority 2", "Priority 3"],
        "database_comparison": "Comparative analysis between database performance"
    }},
    "advanced_recommendations": {{
        "indexing_strategy": "Specific indexing recommendations",
        "query_rewriting": "Query optimization suggestions",
        "architecture_considerations": "Infrastructure and configuration recommendations"
    }}
}}

Focus on:
1. Analyzing execution times in context of query complexity
2. Interpreting execution plans for optimization opportunities
3. Identifying performance bottlenecks and root causes
4. Providing database-specific optimization strategies
5. Comparing performance across different database engines
6. Suggesting architectural improvements

Be specific and actionable in your recommendations. Consider the actual execution plans, timing data, and row counts in your analysis.
"""

        # Call unified Claude service directly via HTTP
        try:
            response = requests.post(
                "http://unified_claude:7000/bedrockclaude",
                json={
                    "operation": "performance-analysis",
                    "prompt": analysis_prompt,
                    "model": "haiku",
                    "max_tokens": 4000,
                    "temperature": 0.1
                },
                timeout=30
            )
            
            if response.status_code == 200:
                ai_result = response.json()
                ai_response = ai_result.get("response", "")
                
                # Try to extract JSON from the response
                if "{" in ai_response and "}" in ai_response:
                    json_start = ai_response.find('{')
                    json_end = ai_response.rfind('}') + 1
                    json_str = ai_response[json_start:json_end]
                    
                    try:
                        parsed_recommendations = json.loads(json_str)
                        
                        # Add AI metadata
                        parsed_recommendations["ai_metadata"] = {
                            "model_used": ai_result.get("model_used", "claude-haiku"),
                            "confidence": 0.92,
                            "execution_time_ms": ai_result.get("execution_time_ms", 0),
                            "analysis_timestamp": ai_result.get("timestamp"),
                            "ai_provider": "Unified Claude Service"
                        }
                        
                        return parsed_recommendations
                        
                    except json.JSONDecodeError:
                        # JSON parsing failed, structure the raw response
                        return {
                            "overall_assessment": ai_response,
                            "database_recommendations": generate_fallback_recommendations(performance_results),
                            "ai_metadata": {
                                "model_used": "claude-haiku",
                                "confidence": 0.85,
                                "raw_response": ai_response,
                                "parsing_status": "json_parse_failed"
                            }
                        }
                else:
                    # No JSON structure found, use raw response
                    return {
                        "overall_assessment": ai_response,
                        "database_recommendations": generate_fallback_recommendations(performance_results),
                        "ai_metadata": {
                            "model_used": "claude-haiku",
                            "confidence": 0.85,
                            "raw_response": ai_response,
                            "parsing_status": "no_json_structure"
                        }
                    }
            else:
                raise Exception(f"HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request to unified Claude service failed: {str(e)}")
            
    except Exception as e:
        # Complete fallback in case of any errors
        return {
            "overall_assessment": f"AI analysis encountered an error: {str(e)} - using fallback analysis",
            "database_recommendations": generate_fallback_recommendations(performance_results),
            "ai_metadata": {
                "error": str(e),
                "fallback_used": True,
                "service_status": "error"
            }
        }

def generate_fallback_recommendations(performance_results):
    """Fallback recommendations when AI service is unavailable"""
    database_recommendations = {}
    
    for db_name, result in performance_results.items():
        if not result.get('success'):
            database_recommendations[db_name] = {
                "assessment": "Query Failed",
                "recommendations": [
                    f"Query execution failed: {result.get('error', 'Unknown error')}",
                    "Check database connection and query syntax",
                    "Verify table and column names exist in the database"
                ]
            }
        else:
            execution_time = result.get('execution_time_ms', 0)
            rows_returned = result.get('rows_returned', 0)
            
            if execution_time < 10:
                assessment = "Good Performance"
                recommendations = ["Query executed efficiently", "No immediate optimization needed"]
            elif execution_time < 100:
                assessment = "Moderate Performance"
                recommendations = ["Consider adding indexes", "Review query structure"]
            else:
                assessment = "Needs Optimization"
                recommendations = ["High execution time detected", "Optimization recommended"]
            
            database_recommendations[db_name] = {
                "assessment": assessment,
                "recommendations": recommendations
            }
    
    return database_recommendations