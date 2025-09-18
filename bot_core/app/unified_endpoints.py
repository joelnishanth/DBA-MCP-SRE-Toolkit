"""
Updated Bot Core endpoints using Unified Claude Service
Replaces direct Claude API calls with unified /bedrockclaude endpoint
"""

from fastapi import APIRouter, Request
from mcp_client import fetch_logs_and_status
from prompt_builder import build_prompt
from nlp_query_handler import process_nlp_query
from performance_analyzer import analyze_query_performance_with_ai
from infrastructure_ai_handler import infrastructure_ai
import sys
import os

# Import unified client (copied to container)
from unified_claude_client import get_claude_client, get_claude_operations

router = APIRouter()

# Initialize unified Claude client
claude_client = get_claude_client("http://unified_claude:7000")
claude_ops = get_claude_operations("http://unified_claude:7000")

@router.post("/diagnose")
async def diagnose_container(data: dict):
    """Container diagnostics using unified Claude service"""
    container_name = data.get("container_name", "")

    # Fetch container data
    logs, status = await fetch_logs_and_status(container_name)
    print(f"Logs: {type(logs)} - {logs[:2] if logs else 'No logs'}")
    print(f"Status: {type(status)} - {status}")

    # Use unified Claude operations for diagnosis
    try:
        result = await claude_ops.diagnose_container(container_name, logs, status)
        
        return {
            "success": result.get("success", False),
            "container_name": container_name,
            "claude_response": result.get("response", ""),
            "confidence": result.get("confidence", 0.0),
            "model_used": result.get("model_used", ""),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "service": "unified_claude",
            "error": result.get("error")
        }
    except Exception as e:
        return {
            "success": False,
            "container_name": container_name,
            "claude_response": f"Diagnosis failed: {str(e)}",
            "error": str(e),
            "service": "unified_claude"
        }

@router.post("/fix/preview")
async def preview_fix(data: dict):
    """Fix preview using unified Claude service"""
    container_name = data.get("container_name", "")

    # Fetch container data
    logs, status = await fetch_logs_and_status(container_name)
    
    # Build fix preview prompt
    prompt = build_prompt(container_name, logs, status, prompt_type="fix_preview")
    
    try:
        result = await claude_client.call_claude(
            operation="fix-preview",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex fix planning
            metadata={"container": container_name}
        )
        
        return {
            "success": result.get("success", False),
            "container_name": container_name,
            "fix_plan": result.get("response", ""),
            "confidence": result.get("confidence", 0.0),
            "model_used": result.get("model_used", ""),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "service": "unified_claude",
            "error": result.get("error")
        }
    except Exception as e:
        return {
            "success": False,
            "container_name": container_name,
            "fix_plan": f"Fix preview failed: {str(e)}",
            "error": str(e),
            "service": "unified_claude"
        }

@router.post("/fix/execute")
async def execute_fix(data: dict):
    """Execute container fix using unified Claude service"""
    container_name = data.get("container_name", "")
    confirmed = data.get("confirmed", False)
    
    if not confirmed:
        return {
            "success": False,
            "message": "Fix execution requires explicit confirmation",
            "container_name": container_name
        }

    # Fetch container data
    logs, status = await fetch_logs_and_status(container_name)
    
    # Build fix execution prompt
    prompt = build_prompt(container_name, logs, status, prompt_type="fix_execute")
    
    try:
        result = await claude_client.call_claude(
            operation="fix-execute",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex fix execution
            metadata={"container": container_name, "confirmed": confirmed}
        )
        
        return {
            "success": result.get("success", False),
            "container_name": container_name,
            "execution_result": result.get("response", ""),
            "confidence": result.get("confidence", 0.0),
            "model_used": result.get("model_used", ""),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "service": "unified_claude",
            "confirmed": confirmed,
            "error": result.get("error")
        }
    except Exception as e:
        return {
            "success": False,
            "container_name": container_name,
            "execution_result": f"Fix execution failed: {str(e)}",
            "error": str(e),
            "service": "unified_claude"
        }

@router.post("/nlp-query")
async def nlp_query(data: dict):
    """Natural language to SQL query with database execution"""
    query = data.get("query", "")
    
    if not query:
        return {"error": "Query is required"}
    
    try:
        # Use the original process_nlp_query function that actually executes queries
        result = await process_nlp_query(query)
        
        return {
            "success": True,
            "query": query,
            "generated_queries": result.get("generated_queries", {}),
            "database_results": result.get("database_results", {}),
            "explanation": result.get("explanation", ""),
            "service": "nlp_query_handler"
        }
        
    except Exception as e:
        return {
            "success": False,
            "query": query,
            "error": f"NLP query processing failed: {str(e)}",
            "service": "nlp_query_handler"
        }
            
    except Exception as e:
        return {
            "success": False,
            "query": query,
            "error": str(e),
            "service": "unified_claude"
        }

@router.post("/analyze-performance")
async def analyze_performance(data: dict):
    """Query performance analysis using original performance analyzer"""
    try:
        # Use the original performance analyzer that returns the correct structure
        result = await analyze_query_performance_with_ai(data)
        
        return {
            "success": True,
            "performance_results": result.get("performance_results", {}),
            "ai_recommendations": result.get("ai_recommendations", {}),
            "service": "performance_analyzer"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "service": "performance_analyzer"
        }

@router.post("/desensitize-data")
async def desensitize_data(data: dict):
    """Data desensitization using unified Claude service"""
    dataset = data.get("data", [])
    context = data.get("context", "general")
    preserve_fields = data.get("preserve_fields", [])
    
    if not dataset:
        return {"error": "Data is required"}
    
    # Build desensitization prompt
    prompt = f"""
    Desensitize this dataset for privacy compliance while maintaining utility:
    
    Context: {context}
    Data: {dataset[:5]}  # Show first 5 records as example
    Preserve Fields: {preserve_fields}
    
    Provide desensitized data in JSON format maintaining the same structure.
    """
    
    try:
        result = await claude_client.call_claude(
            operation="desensitize-data",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex data processing
            context={"original_count": len(dataset), "context": context}
        )
        
        return {
            "success": result.get("success", False),
            "desensitized_data": result.get("response", ""),
            "original_count": len(dataset),
            "context": context,
            "confidence": result.get("confidence", 0.0),
            "model_used": result.get("model_used", ""),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "service": "unified_claude",
            "error": result.get("error")
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "service": "unified_claude"
        }

@router.post("/infrastructure-ai")
async def infrastructure_ai_assistant(request: Request):
    """Infrastructure AI assistant using unified Claude service"""
    try:
        data = await request.json()
        query = data.get("query", "")
        context = data.get("context", "general")
        
        if not query:
            return {"error": "Query is required"}
        
        # Build infrastructure AI prompt
        prompt = f"""
        As an infrastructure AI assistant, help with this query:
        
        Query: {query}
        Context: {context}
        
        Provide helpful infrastructure guidance and recommendations.
        """
        
        result = await claude_client.call_claude(
            operation="infrastructure-ai",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex infrastructure analysis
            context={"query_context": context}
        )
        
        return {
            "success": result.get("success", False),
            "response": result.get("response", ""),
            "query": query,
            "context": context,
            "confidence": result.get("confidence", 0.0),
            "model_used": result.get("model_used", ""),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "service": "unified_claude",
            "error": result.get("error")
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "service": "unified_claude"
        }

@router.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "Bot Core with Unified Claude",
        "claude_service": "unified_claude:7000"
    }

@router.get("/bedrockclaude/status")
async def get_claude_status():
    """Get unified Claude service status"""
    return await claude_client.get_status()

@router.get("/bedrockclaude/test")
async def test_claude_connection():
    """Test unified Claude service connection"""
    return await claude_client.test_connection()