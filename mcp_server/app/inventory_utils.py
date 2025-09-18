"""
Database Inventory and Cost Management utilities for MCP Server
"""
import httpx
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

# AWS Inventory Service base URL
INVENTORY_SERVICE_URL = "http://aws_inventory_service:5002"

async def get_database_inventory(
    application: Optional[str] = None,
    team: Optional[str] = None,
    database_type: Optional[str] = None,
    host_type: Optional[str] = None
) -> Dict[str, Any]:
    """Get database inventory with optional filtering"""
    try:
        params = {}
        if application:
            params["application"] = application
        if team:
            params["team"] = team
        if database_type:
            params["database_type"] = database_type
        if host_type:
            params["host_type"] = host_type
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/inventory/databases",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get database inventory: {str(e)}"}

async def get_ec2_instances(
    application: Optional[str] = None,
    team: Optional[str] = None,
    region: Optional[str] = None,
    environment: Optional[str] = None
) -> Dict[str, Any]:
    """Get EC2 instances with optional filtering"""
    try:
        params = {}
        if application:
            params["application"] = application
        if team:
            params["team"] = team
        if region:
            params["region"] = region
        if environment:
            params["environment"] = environment
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/inventory/ec2",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get EC2 instances: {str(e)}"}

async def get_rds_instances(
    application: Optional[str] = None,
    team: Optional[str] = None,
    region: Optional[str] = None,
    engine: Optional[str] = None
) -> Dict[str, Any]:
    """Get RDS instances with optional filtering"""
    try:
        params = {}
        if application:
            params["application"] = application
        if team:
            params["team"] = team
        if region:
            params["region"] = region
        if engine:
            params["engine"] = engine
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/inventory/rds",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get RDS instances: {str(e)}"}

async def get_database_summary() -> Dict[str, Any]:
    """Get database summary analytics"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/analytics/database-summary",
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get database summary: {str(e)}"}

async def get_top_applications(limit: int = 10) -> Dict[str, Any]:
    """Get top applications by database count"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/analytics/top-applications",
                params={"limit": limit},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get top applications: {str(e)}"}

async def get_cost_summary(
    days: int = 30,
    application: Optional[str] = None,
    team: Optional[str] = None
) -> Dict[str, Any]:
    """Get cost summary for specified period"""
    try:
        params = {"days": days}
        if application:
            params["application"] = application
        if team:
            params["team"] = team
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/cost/summary",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get cost summary: {str(e)}"}

async def get_cost_trends(
    days: int = 30,
    group_by: str = "application"
) -> Dict[str, Any]:
    """Get cost trends over time"""
    try:
        params = {"days": days, "group_by": group_by}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INVENTORY_SERVICE_URL}/api/v1/cost/trends",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to get cost trends: {str(e)}"}

async def chat_query(query: str) -> Dict[str, Any]:
    """Process natural language query about inventory and costs"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/api/v1/chat",
                json={"query": query},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": f"Failed to process chat query: {str(e)}"}

async def get_metadata() -> Dict[str, Any]:
    """Get metadata about applications, teams, and database types"""
    try:
        async with httpx.AsyncClient() as client:
            # Get all metadata in parallel
            applications_task = client.get(f"{INVENTORY_SERVICE_URL}/api/v1/metadata/applications")
            teams_task = client.get(f"{INVENTORY_SERVICE_URL}/api/v1/metadata/teams")
            db_types_task = client.get(f"{INVENTORY_SERVICE_URL}/api/v1/metadata/database-types")
            
            applications_resp = await applications_task
            teams_resp = await teams_task
            db_types_resp = await db_types_task
            
            return {
                "applications": applications_resp.json() if applications_resp.status_code == 200 else [],
                "teams": teams_resp.json() if teams_resp.status_code == 200 else [],
                "database_types": db_types_resp.json() if db_types_resp.status_code == 200 else []
            }
    except Exception as e:
        return {"error": f"Failed to get metadata: {str(e)}"}

def format_database_summary(data: Dict[str, Any]) -> str:
    """Format database summary for readable output"""
    if "error" in data:
        return f"Error: {data['error']}"
    
    summary = data.get("summary", [])
    if not summary:
        return "No database summary data available"
    
    output = f"Database Summary ({data.get('total_databases', 0)} total databases):\n\n"
    
    for item in summary[:10]:  # Show top 10
        output += f"• {item['application']} - {item['database_type']}\n"
        output += f"  Databases: {item['database_count']}, "
        output += f"EC2: {item['ec2_instance_count']}, "
        output += f"RDS: {item['rds_instance_count']}\n"
        output += f"  Size: {item['total_size_gb']:.1f}GB, "
        output += f"Connections: {item['total_active_connections']}\n\n"
    
    return output

def format_cost_summary(data: Dict[str, Any]) -> str:
    """Format cost summary for readable output"""
    if "error" in data:
        return f"Error: {data['error']}"
    
    output = f"Cost Summary ({data.get('period_days', 30)} days):\n\n"
    output += f"• Total Cost: ${data.get('total_cost', 0):.2f}\n"
    output += f"• Average Daily Cost: ${data.get('average_daily_cost', 0):.2f}\n\n"
    
    # Top applications by cost
    app_costs = data.get('cost_by_application', {})
    if app_costs:
        output += "Top Applications by Cost:\n"
        for app, cost in list(app_costs.items())[:5]:
            output += f"• {app}: ${cost:.2f}\n"
        output += "\n"
    
    # Top teams by cost
    team_costs = data.get('cost_by_team', {})
    if team_costs:
        output += "Top Teams by Cost:\n"
        for team, cost in list(team_costs.items())[:5]:
            output += f"• {team}: ${cost:.2f}\n"
    
    return output