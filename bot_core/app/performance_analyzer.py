import httpx
from claude_api import get_claude_response

async def analyze_query_performance_with_ai(queries_data):
    # Execute performance analysis via MCP server
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://mcp_server:5000/analyze/performance",
            json=queries_data
        )
        performance_results = response.json()
    
    # Format performance data for Claude
    import json
    formatted_results = json.dumps(performance_results, indent=2)
    
    # Generate AI recommendations
    # If no performance results, use fallback
    if not performance_results:
        return {
            "performance_results": {},
            "ai_recommendations": generate_fallback_recommendations({})
        }
    
    prompt = f"""
    As a database performance expert, analyze these query performance results and provide optimization recommendations:

    Performance Results:
    {formatted_results}

    Analyze each database result and provide:
    1. Performance assessment (Good/Fair/Poor based on execution time: <5ms=Good, 5-50ms=Fair, >50ms=Poor)
    2. Specific optimization recommendations
    3. Index suggestions if applicable
    4. Query rewrite suggestions if needed

    Return ONLY valid JSON in this exact format:
    {{
        "overall_assessment": "Brief summary of findings",
        "database_recommendations": {{
            "postgres": {{"assessment": "Good", "recommendations": ["recommendation 1", "recommendation 2"]}},
            "mysql": {{"assessment": "Fair", "recommendations": ["recommendation 1"]}},
            "sqlite": {{"assessment": "Poor", "recommendations": ["recommendation 1"]}}
        }}
    }}
    """
    
    ai_response = await get_claude_response(prompt)
    
    try:
        # Try to parse the entire response as JSON first
        ai_recommendations = json.loads(ai_response)
    except:
        try:
            # Fallback: extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                ai_recommendations = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found")
        except Exception as e:
            # Generate fallback recommendations based on performance data
            ai_recommendations = generate_fallback_recommendations(performance_results)
    
    return {
        "performance_results": performance_results,
        "ai_recommendations": ai_recommendations
    }

def generate_fallback_recommendations(performance_results):
    recommendations = {
        "overall_assessment": "Performance analysis completed with basic recommendations",
        "database_recommendations": {}
    }
    
    for db_name, result in performance_results.items():
        if result.get("success"):
            exec_time = result.get("execution_time_ms", 0)
            if exec_time < 5:
                assessment = "Good"
                recs = ["Query performance is excellent", "Monitor for consistency"]
            elif exec_time < 50:
                assessment = "Fair"
                recs = ["Consider adding indexes", "Review query structure"]
            else:
                assessment = "Poor"
                recs = ["Optimize query immediately", "Add appropriate indexes", "Consider query rewrite"]
        else:
            assessment = "Error"
            recs = [f"Fix error: {result.get('error', 'Unknown error')}", "Check database connectivity"]
        
        recommendations["database_recommendations"][db_name] = {
            "assessment": assessment,
            "recommendations": recs
        }
    
    return recommendations