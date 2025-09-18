"""
Unified Claude Client - Client library for accessing the consolidated /bedrockclaude endpoint
Replaces individual Claude API calls with unified interface
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class UnifiedClaudeClient:
    """Client for the unified Claude service"""
    
    def __init__(self, base_url: str = "http://unified_claude:7000"):
        self.base_url = base_url
        self.endpoint = f"{base_url}/bedrockclaude"
        self.timeout = 60.0  # 60 second timeout for AI operations
    
    async def call_claude(
        self, 
        operation: str, 
        prompt: str, 
        model: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        max_tokens: int = 4000,
        temperature: float = 0.1,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a unified Claude API call
        
        Args:
            operation: The operation type (diagnose, analyze-database, etc.)
            prompt: The prompt to send to Claude
            model: Optional model override (sonnet/haiku)
            context: Optional context data
            max_tokens: Maximum tokens in response
            temperature: Temperature for response generation
            metadata: Optional metadata to include
            
        Returns:
            Dict containing the Claude response
        """
        try:
            request_data = {
                "operation": operation,
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            if model:
                request_data["model"] = model
            if context:
                request_data["context"] = context
            if metadata:
                request_data["metadata"] = metadata
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    json=request_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Claude API error: {response.status_code} - {response.text}")
                    return self._get_error_response(operation, f"HTTP {response.status_code}: {response.text}")
                    
        except httpx.TimeoutException:
            logger.error(f"Claude API timeout for operation: {operation}")
            return self._get_error_response(operation, "Request timeout")
        except Exception as e:
            logger.error(f"Claude API error for operation {operation}: {str(e)}")
            return self._get_error_response(operation, str(e))
    
    def _get_error_response(self, operation: str, error: str) -> Dict[str, Any]:
        """Generate error response when Claude call fails"""
        return {
            "success": False,
            "operation": operation,
            "model_used": "error",
            "response": f"Claude service unavailable: {error}",
            "confidence": 0.0,
            "execution_time_ms": 0,
            "timestamp": datetime.now().isoformat(),
            "error": error
        }
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test connection to unified Claude service"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/bedrockclaude/test")
                return response.json() if response.status_code == 200 else {"status": "error", "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def get_status(self) -> Dict[str, Any]:
        """Get unified Claude service status"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/bedrockclaude/status")
                return response.json() if response.status_code == 200 else {"status": "error", "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Convenience functions for common operations
class ClaudeOperations:
    """High-level operations using the unified Claude client"""
    
    def __init__(self, client: UnifiedClaudeClient):
        self.client = client
    
    async def diagnose_container(self, container_name: str, logs: list, stats: dict) -> Dict[str, Any]:
        """Container diagnostics operation"""
        prompt = f"""
        Analyze this container issue and provide diagnostic recommendations:
        
        Container: {container_name}
        Recent Logs: {logs[-10:] if logs else 'No logs available'}
        Stats: {stats}
        
        Provide analysis in JSON format with:
        - issue_summary
        - root_cause_analysis  
        - recommended_actions
        - urgency_level
        """
        
        return await self.client.call_claude(
            operation="diagnose",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex diagnostics
            metadata={"container": container_name}
        )
    
    async def analyze_database_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Database requirements analysis operation"""
        prompt = f"""
        Analyze these database requirements and provide recommendations:
        
        Requirements: {json.dumps(requirements, indent=2)}
        
        Provide analysis in JSON format with:
        - recommended_solution
        - cost_analysis
        - performance_assessment
        - compliance_considerations
        """
        
        return await self.client.call_claude(
            operation="analyze-database",
            prompt=prompt,
            model="haiku",  # Use Haiku for fast analysis
            context=requirements
        )
    
    async def nlp_to_sql(self, natural_query: str, database_schema: Optional[str] = None) -> Dict[str, Any]:
        """Natural language to SQL conversion"""
        schema_info = f"\nDatabase Schema: {database_schema}" if database_schema else ""
        
        prompt = f"""
        Convert this natural language query to SQL:
        
        Query: {natural_query}{schema_info}
        
        Provide response in JSON format with:
        - sql_query
        - explanation
        - confidence_level
        - potential_issues
        """
        
        return await self.client.call_claude(
            operation="nlp-query",
            prompt=prompt,
            model="sonnet",  # Use Sonnet for complex SQL generation
            metadata={"query_type": "nlp_to_sql"}
        )
    
    async def multi_agent_analysis(self, agent_type: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Multi-agent system analysis (Strands, NoSQL, AgentCore)"""
        prompt = f"""
        Perform {agent_type} multi-agent analysis:
        
        Request: {json.dumps(request_data, indent=2)}
        
        Coordinate multiple specialized agents and provide comprehensive analysis.
        """
        
        operation_map = {
            "strands": "strands-analyze",
            "nosql": "nosql-analyze", 
            "agentcore": "agentcore-analyze"
        }
        
        return await self.client.call_claude(
            operation=operation_map.get(agent_type, "analyze"),
            prompt=prompt,
            model="haiku",  # Use Haiku for multi-agent coordination
            context=request_data,
            max_tokens=6000  # Larger response for multi-agent results
        )

# Global client instance
_claude_client = None

def get_claude_client(base_url: str = "http://unified_claude:7000") -> UnifiedClaudeClient:
    """Get or create global Claude client instance"""
    global _claude_client
    if _claude_client is None:
        _claude_client = UnifiedClaudeClient(base_url)
    return _claude_client

def get_claude_operations(base_url: str = "http://unified_claude:7000") -> ClaudeOperations:
    """Get Claude operations helper"""
    client = get_claude_client(base_url)
    return ClaudeOperations(client)