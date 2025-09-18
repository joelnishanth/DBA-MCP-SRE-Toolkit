from fastapi import APIRouter, Request
from mcp_client import fetch_logs_and_status
from prompt_builder import build_prompt
from claude_api import get_claude_response
from nlp_query_handler import process_nlp_query
from performance_analyzer import analyze_query_performance_with_ai
from infrastructure_ai_handler import infrastructure_ai

router = APIRouter()

@router.post("/diagnose")
async def diagnose_container(data: dict):
    container_name = data.get("container_name", "")

    logs, status = await fetch_logs_and_status(container_name)
    print(f"Logs: {type(logs)} - {logs[:2]}")
    print(f"Status: {type(status)} - {status}")

    prompt = build_prompt(container_name, logs, status, prompt_type="diagnose")
    print(f"Prompt generated: {prompt[:100]}...")

    # Add 'await' here
    response = await get_claude_response(prompt)
    print(f"Claude Response: {type(response)} - {response[:100]}...")

    return {
        "prompt": str(prompt),
        "claude_response": str(response)
    }

@router.post("/fix/preview")
async def preview_fix(data: dict):
    container_name = data.get("container_name", "")

    logs, status = await fetch_logs_and_status(container_name)
    print(f"Logs: {type(logs)} - {logs[:2]}")
    print(f"Status: {type(status)} - {status}")

    prompt = build_prompt(container_name, logs, status, prompt_type="fix_preview")
    print(f"Prompt generated: {prompt[:100]}...")

    response = await get_claude_response(prompt)
    print(f"Claude Response: {type(response)} - {response[:100]}...")

    return {
        "prompt": str(prompt),
        "fix_plan": str(response)
    }

@router.post("/fix/execute")
async def fix_container(data: dict):
    container_name = data.get("container_name", "")
    confirmed = data.get("confirmed", False)

    if not confirmed:
        return {
            "error": "Fix execution requires explicit confirmation. Please use /fix/preview first to review the steps, then set confirmed=true to execute."
        }

    logs, status = await fetch_logs_and_status(container_name)
    print(f"Logs: {type(logs)} - {logs[:2]}")
    print(f"Status: {type(status)} - {status}")

    prompt = build_prompt(container_name, logs, status, prompt_type="fix")
    print(f"Prompt generated: {prompt[:100]}...")

    response = await get_claude_response(prompt)
    print(f"Claude Response: {type(response)} - {response[:100]}...")

    return {
        "prompt": str(prompt),
        "claude_response": str(response),
        "commands": str(response).strip().split("\n")  # Return commands as a list for easy parsing
    }

@router.post("/nlp-query")
async def nlp_query(data: dict):
    user_query = data.get("query", "")
    context = data.get("context", "")
    context_data = data.get("data", {})
    
    # Handle AWS inventory context specifically
    if context == "aws_inventory":
        return await infrastructure_ai.process_query(user_query, "inventory", context_data)
    
    # If context is provided, use infrastructure AI handler
    if context in ["executive", "inventory", "cost", "chargeback", "optimization"]:
        return await infrastructure_ai.process_query(user_query, context, context_data)
    
    # Otherwise use standard NLP processing
    return await process_nlp_query(user_query)

@router.post("/infrastructure-ai")
async def infrastructure_ai_query(data: dict):
    """Dedicated endpoint for infrastructure AI assistant with Claude integration"""
    user_query = data.get("query", "")
    context = data.get("context", "inventory")  # Default to inventory context
    context_data = data.get("data", {})
    
    if not user_query:
        return {"error": "Query is required"}
    
    # Enhance context data with comprehensive MCP data
    enhanced_context_data = await enhance_context_with_mcp_data(context_data, context)
    
    # Always use infrastructure AI handler for this endpoint
    return await infrastructure_ai.process_query(user_query, context, enhanced_context_data)

async def enhance_context_with_mcp_data(context_data: dict, context: str) -> dict:
    """Enhance context data with comprehensive information from MCP services"""
    enhanced_data = context_data.copy()
    
    try:
        # Get comprehensive AWS inventory data via MCP
        import httpx
        async with httpx.AsyncClient() as client:
            # Get detailed inventory data from MCP server
            inventory_response = await client.get(
                "http://mcp_server:5000/inventory/analytics",
                timeout=10.0
            )
            
            if inventory_response.status_code == 200:
                inventory_data = inventory_response.json()
                enhanced_data["mcp_inventory"] = inventory_data
            
            # Get cost summary from MCP server
            cost_response = await client.get(
                "http://mcp_server:5000/cost/summary?days=30",
                timeout=10.0
            )
            
            if cost_response.status_code == 200:
                cost_data = cost_response.json()
                enhanced_data["mcp_cost_summary"] = cost_data
            
            # Get executive summary for comprehensive metrics
            exec_response = await client.get(
                "http://mcp_server:5000/reports/executive-summary",
                timeout=10.0
            )
            
            if exec_response.status_code == 200:
                exec_data = exec_response.json()
                enhanced_data["mcp_executive_summary"] = exec_data
                
    except Exception as e:
        print(f"Warning: Could not enhance context with MCP data: {e}")
        # Continue with original data if MCP enhancement fails
    
    return enhanced_data

@router.post("/analyze-performance")
async def analyze_performance(data: dict):
    return await analyze_query_performance_with_ai(data)

@router.post("/desensitize-data")
async def desensitize_data(data: dict):
    dataset = data.get("data", [])
    context = data.get("context", "general")
    preserve_fields = data.get("preserve_fields", [])
    
    if not dataset:
        return {"error": "No data provided"}
    
    # Build prompt for Claude to desensitize data
    prompt = f"""
You are a data privacy expert. Desensitize the following {context} dataset while preserving data utility.

Rules:
1. Replace names with generic identifiers (Patient_001, etc.)
2. Mask SSNs but keep last 4 digits for reference
3. Anonymize emails and phone numbers
4. Redact addresses but keep state/region
5. Preserve these fields for research: {preserve_fields}
6. Maintain data relationships and structure

Original Data:
{dataset}

Return ONLY a valid JSON array of desensitized records with the same structure. Use double quotes for all strings.
"""
    
    try:
        response = await get_claude_response(prompt)
        print(f"Raw Claude response: {response}")
        
        # Clean up the response - remove any markdown formatting
        cleaned_response = response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        # Try to fix single quotes to double quotes for JSON parsing
        import re
        # Replace single quotes with double quotes, but be careful with apostrophes
        cleaned_response = re.sub(r"'([^']*)':", r'"\1":', cleaned_response)  # Keys
        cleaned_response = re.sub(r":\s*'([^']*)'", r': "\1"', cleaned_response)  # Values
        
        print(f"Cleaned response: {cleaned_response}")
        
        # Try to parse Claude's response as JSON
        import json
        desensitized_data = json.loads(cleaned_response)
        
        return {
            "desensitized_data": desensitized_data,
            "original_count": len(dataset),
            "desensitized_count": len(desensitized_data),
            "context": context
        }
    except Exception as e:
        print(f"Desensitization error: {str(e)}")
        print(f"Raw response was: {response}")
        return {"error": f"Desensitization failed: {str(e)}", "raw_response": response}

@router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": "2023-06-20T12:00:00Z"}
