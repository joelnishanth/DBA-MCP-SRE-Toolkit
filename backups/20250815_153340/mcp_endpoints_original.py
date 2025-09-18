from fastapi import APIRouter
from docker_utils import get_container_logs, get_container_stats, list_container_names, fix_container
from db_query_utils import execute_multi_db_query
from performance_utils import analyze_query_performance
from inventory_utils import (
    get_database_inventory, get_ec2_instances, get_rds_instances,
    get_database_summary, get_top_applications, get_cost_summary,
    get_cost_trends, chat_query, get_metadata,
    format_database_summary, format_cost_summary
)
from datetime import datetime
from typing import List, Dict, Any, Optional
from bedrock_client import BedrockClaudeClient

router = APIRouter()

# Initialize Bedrock client
bedrock_client = BedrockClaudeClient()

# In-memory storage for development updates (in production, use a database)
dev_updates: List[Dict[str, Any]] = []

# In-memory storage for n8n workflow updates (in production, use a database)
n8n_updates: List[Dict[str, Any]] = []

@router.get("/logs/{container_name}")
def logs(container_name: str, lines: int = 100):
    if not container_name:
        return {"logs": ["Error: Container name not provided"]}
    try:
        return {"logs": get_container_logs(container_name, lines)}
    except Exception as e:
        return {"logs": [f"Error: {str(e)}"]}

@router.get("/status/{container_name}")
def status(container_name: str):
    return get_container_stats(container_name)

@router.get("/containers")
def containers():
    return {"containers": list_container_names()}

@router.post("/fix/{container_name}")
def fix(container_name: str):
    return fix_container(container_name)

@router.post("/query/multi-db")
def multi_db_query(data: dict):
    postgres_query = data.get("postgres_query")
    mysql_query = data.get("mysql_query")
    sqlite_query = data.get("sqlite_query")
    
    return execute_multi_db_query(postgres_query, mysql_query, sqlite_query)

@router.post("/analyze/performance")
def analyze_performance(data: dict):
    postgres_query = data.get("postgres_query")
    mysql_query = data.get("mysql_query")
    sqlite_query = data.get("sqlite_query")
    
    return analyze_query_performance(postgres_query, mysql_query, sqlite_query)

@router.get("/health")
def health():
    return {"status": "healthy", "timestamp": "2023-06-20T12:00:00Z"}

@router.get("/aws-credentials-status")
def check_aws_credentials():
    """Check if AWS Bedrock credentials are available"""
    try:
        # Check if Bedrock client is properly configured
        bedrock_client = BedrockClaudeClient()
        if hasattr(bedrock_client, 'bedrock_client') and bedrock_client.bedrock_client:
            return {
                "available": True,
                "status": "AWS Bedrock credentials configured",
                "model": bedrock_client.model_id
            }
        else:
            return {
                "available": False,
                "status": "AWS Bedrock credentials not configured",
                "setup_guide": "Please configure AWS credentials and Bedrock access"
            }
    except Exception as e:
        return {
            "available": False,
            "status": f"AWS Bedrock configuration error: {str(e)}",
            "setup_guide": "Please check AWS credentials and Bedrock setup"
        }

# Development Updates Endpoints
@router.post("/dev/update")
def post_dev_update(data: dict):
    """Post a development update from Kiro"""
    update = {
        "id": len(dev_updates) + 1,
        "timestamp": datetime.now().isoformat(),
        "feature": data.get("feature", "Unknown Feature"),
        "description": data.get("description", ""),
        "code_highlights": data.get("code_highlights", []),
        "files_created": data.get("files_created", []),
        "files_modified": data.get("files_modified", []),
        "status": data.get("status", "completed"),
        "kiro_notes": data.get("kiro_notes", ""),
        "next_steps": data.get("next_steps", [])
    }
    
    dev_updates.insert(0, update)  # Add to beginning for newest first
    
    # Keep only last 50 updates
    if len(dev_updates) > 50:
        dev_updates.pop()
    
    return {"success": True, "update_id": update["id"], "message": "Development update posted successfully"}

@router.get("/dev/updates")
def get_dev_updates(limit: int = 20):
    """Get recent development updates"""
    return {"updates": dev_updates[:limit]}

@router.get("/dev/updates/{update_id}")
def get_dev_update(update_id: int):
    """Get a specific development update"""
    update = next((u for u in dev_updates if u["id"] == update_id), None)
    if update:
        return update
    return {"error": "Update not found"}

@router.delete("/dev/updates")
def clear_dev_updates():
    """Clear all development updates"""
    global dev_updates
    dev_updates.clear()
    return {"success": True, "message": "All development updates cleared"}

# Database Inventory Management Tools
@router.get("/inventory/databases")
async def inventory_databases(
    application: Optional[str] = None,
    team: Optional[str] = None,
    database_type: Optional[str] = None,
    host_type: Optional[str] = None
):
    """Get database inventory with optional filtering"""
    return await get_database_inventory(application, team, database_type, host_type)

@router.get("/inventory/ec2")
async def inventory_ec2(
    application: Optional[str] = None,
    team: Optional[str] = None,
    region: Optional[str] = None,
    environment: Optional[str] = None
):
    """Get EC2 instances with optional filtering"""
    return await get_ec2_instances(application, team, region, environment)

@router.get("/inventory/rds")
async def inventory_rds(
    application: Optional[str] = None,
    team: Optional[str] = None,
    region: Optional[str] = None,
    engine: Optional[str] = None
):
    """Get RDS instances with optional filtering"""
    return await get_rds_instances(application, team, region, engine)

@router.get("/inventory/summary")
async def inventory_summary():
    """Get database summary analytics"""
    result = await get_database_summary()
    return {
        "raw_data": result,
        "formatted": format_database_summary(result)
    }

@router.get("/inventory/top-applications")
async def inventory_top_applications(limit: int = 10):
    """Get top applications by database count"""
    return await get_top_applications(limit)

# Cost Management Tools
@router.get("/cost/summary")
async def cost_summary(
    days: int = 30,
    application: Optional[str] = None,
    team: Optional[str] = None
):
    """Get cost summary for specified period"""
    result = await get_cost_summary(days, application, team)
    return {
        "raw_data": result,
        "formatted": format_cost_summary(result)
    }

@router.get("/cost/trends")
async def cost_trends(days: int = 30, group_by: str = "application"):
    """Get cost trends over time"""
    return await get_cost_trends(days, group_by)

# Natural Language Query Tool
@router.post("/inventory/chat")
async def inventory_chat(data: dict):
    """Process natural language query about inventory and costs"""
    query = data.get("query", "")
    if not query:
        return {"error": "Query is required"}
    
    return await chat_query(query)

# Metadata Tools
@router.get("/inventory/metadata")
async def inventory_metadata():
    """Get metadata about applications, teams, and database types"""
    return await get_metadata()

# Combined Analytics Tool
@router.get("/inventory/analytics")
async def inventory_analytics(application: Optional[str] = None, team: Optional[str] = None):
    """Get comprehensive analytics for an application or team"""
    try:
        # Get inventory data
        databases = await get_database_inventory(application=application, team=team)
        
        # Get cost data
        cost_summary = await get_cost_summary(days=30, application=application, team=team)
        
        # Get EC2 and RDS data
        ec2_instances = await get_ec2_instances(application=application, team=team)
        rds_instances = await get_rds_instances(application=application, team=team)
        
        return {
            "databases": databases,
            "cost_summary": cost_summary,
            "ec2_instances": ec2_instances,
            "rds_instances": rds_instances,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to get analytics: {str(e)}"}

# Advanced Reporting Tools
@router.get("/reports/chargeback")
async def chargeback_report(team: Optional[str] = None, days: int = 30):
    """Generate chargeback report for teams"""
    try:
        if team:
            # Single team report
            cost_data = await get_cost_summary(days=days, team=team)
            databases = await get_database_inventory(team=team)
            
            return {
                "report_type": "single_team_chargeback",
                "team": team,
                "period_days": days,
                "cost_data": cost_data,
                "resource_summary": databases,
                "generated_at": datetime.now().isoformat()
            }
        else:
            # All teams report
            metadata = await get_metadata()
            teams = metadata.get("teams", {}).get("teams", [])
            
            team_reports = []
            for team_name in teams:
                cost_data = await get_cost_summary(days=days, team=team_name)
                team_reports.append({
                    "team": team_name,
                    "cost_data": cost_data
                })
            
            return {
                "report_type": "all_teams_chargeback",
                "period_days": days,
                "team_reports": team_reports,
                "generated_at": datetime.now().isoformat()
            }
    except Exception as e:
        return {"error": f"Failed to generate chargeback report: {str(e)}"}

@router.get("/reports/optimization")
async def optimization_report():
    """Generate infrastructure optimization recommendations"""
    try:
        # Get all data for analysis
        databases = await get_database_inventory()
        cost_summary = await get_cost_summary(days=30)
        top_apps = await get_top_applications(limit=10)
        
        # Simple optimization logic (can be enhanced with ML)
        recommendations = []
        
        # Check for high-cost, low-utilization resources
        if "cost_by_application" in cost_summary:
            high_cost_apps = sorted(
                cost_summary["cost_by_application"].items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
            
            for app, cost in high_cost_apps:
                if cost > 5000:  # High cost threshold
                    recommendations.append({
                        "type": "cost_optimization",
                        "application": app,
                        "current_cost": cost,
                        "recommendation": f"Review {app} infrastructure - high monthly cost of ${cost:.2f}",
                        "priority": "high" if cost > 10000 else "medium"
                    })
        
        # Check for database consolidation opportunities
        if "databases" in databases:
            db_count = databases.get("total_count", 0)
            if db_count > 100:
                recommendations.append({
                    "type": "consolidation",
                    "recommendation": f"Consider database consolidation - {db_count} databases detected",
                    "priority": "medium"
                })
        
        return {
            "report_type": "optimization_recommendations",
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to generate optimization report: {str(e)}"}

@router.get("/reports/executive-summary")
async def executive_summary():
    """Generate executive summary report"""
    try:
        # Get key metrics
        databases = await get_database_inventory()
        cost_summary = await get_cost_summary(days=30)
        top_apps = await get_top_applications(limit=5)
        metadata = await get_metadata()
        
        # Calculate key metrics
        total_databases = databases.get("total_count", 0)
        monthly_cost = cost_summary.get("total_cost", 0)
        daily_cost = cost_summary.get("average_daily_cost", 0)
        
        # Get team and application counts
        team_count = len(metadata.get("teams", {}).get("teams", []))
        app_count = len(metadata.get("applications", {}).get("applications", []))
        
        return {
            "report_type": "executive_summary",
            "key_metrics": {
                "total_databases": total_databases,
                "total_applications": app_count,
                "total_teams": team_count,
                "monthly_cost": monthly_cost,
                "daily_cost": daily_cost,
                "annual_projection": monthly_cost * 12
            },
            "top_applications": top_apps.get("top_applications", [])[:5],
            "cost_breakdown": {
                "by_application": dict(list(cost_summary.get("cost_by_application", {}).items())[:5]),
                "by_team": dict(list(cost_summary.get("cost_by_team", {}).items())[:5])
            },
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to generate executive summary: {str(e)}"}

# Resource Utilization Tools
@router.get("/utilization/overview")
async def utilization_overview():
    """Get resource utilization overview"""
    try:
        ec2_instances = await get_ec2_instances()
        rds_instances = await get_rds_instances()
        
        # Calculate utilization metrics
        ec2_data = ec2_instances.get("instances", [])
        rds_data = rds_instances.get("instances", [])
        
        # EC2 utilization
        ec2_cpu_avg = sum(inst.get("cpu_utilization", 0) for inst in ec2_data) / len(ec2_data) if ec2_data else 0
        ec2_memory_avg = sum(inst.get("memory_utilization", 0) for inst in ec2_data) / len(ec2_data) if ec2_data else 0
        
        # RDS utilization
        rds_cpu_avg = sum(inst.get("cpu_utilization", 0) for inst in rds_data) / len(rds_data) if rds_data else 0
        rds_connections_avg = sum(inst.get("database_connections", 0) for inst in rds_data) / len(rds_data) if rds_data else 0
        
        return {
            "ec2_utilization": {
                "total_instances": len(ec2_data),
                "average_cpu": round(ec2_cpu_avg, 2),
                "average_memory": round(ec2_memory_avg, 2),
                "running_instances": len([i for i in ec2_data if i.get("state") == "running"])
            },
            "rds_utilization": {
                "total_instances": len(rds_data),
                "average_cpu": round(rds_cpu_avg, 2),
                "average_connections": round(rds_connections_avg, 2),
                "available_instances": len([i for i in rds_data if i.get("db_status") == "available"])
            },
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to get utilization overview: {str(e)}"}
# N8N Workflow Updates Endpoints
@router.post("/n8n/update")
def post_n8n_update(data: dict):
    """Post an n8n workflow update/alert"""
    global n8n_updates
    
    update = {
        "id": len(n8n_updates) + 1,
        "workflow_name": data.get("workflow_name", "Unknown Workflow"),
        "alert_type": data.get("alert_type", "workflow_execution"),
        "message": data.get("message", ""),
        "container": data.get("container"),
        "status": data.get("status"),
        "severity": data.get("severity", "medium"),
        "timestamp": datetime.now().isoformat(),
        "details": data.get("details", {})
    }
    
    # Add to the beginning of the list (most recent first)
    n8n_updates.insert(0, update)
    
    # Keep only the last 100 updates
    if len(n8n_updates) > 100:
        n8n_updates = n8n_updates[:100]
    
    return {"success": True, "update_id": update["id"], "message": "N8N update posted successfully"}

@router.get("/n8n/updates")
def get_n8n_updates(limit: int = 50):
    """Get recent n8n workflow updates"""
    return {"updates": n8n_updates[:limit]}

@router.get("/n8n/updates/{update_id}")
def get_n8n_update(update_id: int):
    """Get a specific n8n workflow update"""
    for update in n8n_updates:
        if update["id"] == update_id:
            return update
    return {"error": "N8N update not found"}

@router.delete("/n8n/updates")
def clear_n8n_updates():
    """Clear all n8n workflow updates"""
    global n8n_updates
    n8n_updates.clear()
    return {"success": True, "message": "All n8n updates cleared"}

@router.get("/n8n/stats")
def get_n8n_stats():
    """Get n8n workflow statistics"""
    if not n8n_updates:
        return {
            "total_updates": 0,
            "by_type": {},
            "by_severity": {},
            "recent_containers": []
        }
    
    # Count by alert type
    by_type = {}
    by_severity = {}
    containers = set()
    
    for update in n8n_updates:
        alert_type = update.get("alert_type", "unknown")
        severity = update.get("severity", "unknown")
        container = update.get("container")
        
        by_type[alert_type] = by_type.get(alert_type, 0) + 1
        by_severity[severity] = by_severity.get(severity, 0) + 1
        
        if container:
            containers.add(container)
    
    return {
        "total_updates": len(n8n_updates),
        "by_type": by_type,
        "by_severity": by_severity,
        "recent_containers": list(containers)[:10]
    }

@router.get("/n8n/health")
def check_n8n_health():
    """Check n8n server health status"""
    try:
        import httpx
        with httpx.Client() as client:
            response = client.get("http://n8n:5678/healthz", timeout=5.0)
            if response.status_code == 200:
                return {"status": "connected", "n8n_status": "healthy"}
            else:
                return {"status": "disconnected", "n8n_status": "unhealthy", "status_code": response.status_code}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

# AI Analysis Endpoints
@router.post("/ai/analyze-database")
def analyze_database_requirements(data: dict):
    """Analyze database requirements using AWS Bedrock Claude AI"""
    try:
        # Perform AI analysis
        analysis_result = bedrock_client.analyze_database_requirements(data)
        
        # Post update to n8n feed
        if analysis_result.get("success"):
            n8n_update = {
                "workflow_name": f"Claude AI Analysis - {data.get('scenario', 'Database').title()}",
                "alert_type": "workflow_execution",
                "message": f"🤖 AI analysis complete: {analysis_result['recommendation']['primary_solution']} recommended with {analysis_result['analysis']['confidence_score']:.0%} confidence",
                "severity": "low",
                "details": {
                    "ai_provider": analysis_result["ai_provider"],
                    "recommendation": analysis_result["recommendation"]["primary_solution"],
                    "confidence": analysis_result["analysis"]["confidence_score"],
                    "estimated_cost": analysis_result["recommendation"]["estimated_monthly_cost"],
                    "reasoning": analysis_result["analysis"]["reasoning"][:3]  # First 3 reasons
                }
            }
        else:
            n8n_update = {
                "workflow_name": "Claude AI Analysis - Error",
                "alert_type": "workflow_execution", 
                "message": f"⚠️ AI analysis failed: {analysis_result.get('error', 'Unknown error')}",
                "severity": "medium",
                "details": {
                    "error": analysis_result.get("error"),
                    "fallback_used": True,
                    "recommendation": analysis_result.get("recommendation", {}).get("primary_solution", "Unknown")
                }
            }
        
        # Add to n8n updates
        global n8n_updates
        update = {
            "id": len(n8n_updates) + 1,
            "workflow_name": n8n_update["workflow_name"],
            "alert_type": n8n_update["alert_type"],
            "message": n8n_update["message"],
            "severity": n8n_update["severity"],
            "timestamp": datetime.now().isoformat(),
            "details": n8n_update["details"]
        }
        n8n_updates.insert(0, update)
        
        return analysis_result
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Analysis endpoint error: {str(e)}",
            "ai_provider": "Error Handler"
        }

@router.get("/ai/bedrock/test")
def test_bedrock_connection():
    """Test AWS Bedrock connection"""
    return bedrock_client.test_connection()

@router.get("/ai/bedrock/status")
def get_bedrock_status():
    """Get Bedrock configuration status"""
    test_result = bedrock_client.test_connection()
    return {
        "bedrock_configured": test_result["configured"],
        "model_id": bedrock_client.model_id,
        "region": bedrock_client.region_name,
        "status": test_result["status"],
        "message": test_result["message"]
    }

# AWS Multi-Agent Systems
from strands_agents import StrandsOrchestrator
from nosql_agents import NoSQLOrchestrator
from agentcore_agents import AgentCoreOrchestrator
import asyncio

strands_sessions: Dict[str, Dict[str, Any]] = {}
strands_orchestrator = StrandsOrchestrator()
nosql_orchestrator = NoSQLOrchestrator()

# AWS Agent Core Incident Response System
agentcore_sessions: Dict[str, Dict[str, Any]] = {}
agentcore_orchestrator = AgentCoreOrchestrator()

@router.post("/strands/analyze")
async def strands_analyze_request(data: dict):
    """Real AWS Strands multi-agent analysis"""
    try:
        session_id = f"strands_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize session
        strands_sessions[session_id] = {
            "request": data,
            "status": "analyzing",
            "agent_results": {},
            "recommendation": None,
            "created_at": datetime.now().isoformat()
        }
        
        # Run multi-agent analysis
        analysis_result = await strands_orchestrator.analyze_request(data)
        
        if analysis_result['success']:
            # Convert agent results to steps format for frontend compatibility
            agent_results = analysis_result['agent_results']
            steps = []
            
            # Step 1: Workload Analysis
            workload_result = agent_results['workload']
            steps.append({
                "step": "workload_analysis",
                "reasoning": f"🔍 {workload_result.agent_name}: {' '.join(workload_result.reasoning[:2])}",
                "findings": {
                    "workload_type": workload_result.analysis.get('workload_type', 'OLTP'),
                    "read_intensity": workload_result.analysis.get('read_intensity', 'High'),
                    "concurrency_requirements": workload_result.analysis.get('concurrency_requirements', 'Medium'),
                    "agent_execution_time": f"{workload_result.execution_time_ms}ms"
                },
                "confidence": workload_result.confidence,
                "timestamp": workload_result.timestamp
            })
            
            # Step 2: Multi-Agent Parallel Analysis
            steps.append({
                "step": "multi_agent_analysis", 
                "reasoning": f"🤖 Parallel execution of {len(agent_results)-2} specialized agents: Cost Optimizer, Security Analyst, Performance Engineer",
                "findings": {
                    "cost_analysis": f"${agent_results['cost'].analysis['monthly_cost_breakdown'].get('total', 1500)}/month estimated",
                    "security_compliance": f"{len(agent_results['security'].analysis['security_assessment']['compliance_frameworks'])} frameworks analyzed",
                    "performance_optimization": agent_results['performance'].analysis['instance_recommendation']['instance_type'],
                    "total_execution_time": f"{analysis_result['execution_summary']['total_execution_time_ms']}ms"
                },
                "confidence": analysis_result['execution_summary']['average_confidence'],
                "timestamp": datetime.now().isoformat()
            })
            
            # Step 3: Architecture Synthesis
            architecture_result = agent_results['architecture']
            steps.append({
                "step": "architecture_synthesis",
                "reasoning": f"🏗️ {architecture_result.agent_name}: {' '.join(architecture_result.reasoning[:2])}",
                "findings": {
                    "recommended_engine": architecture_result.analysis['architecture_design']['recommended_engine'],
                    "deployment_model": architecture_result.analysis['architecture_design']['deployment_model'],
                    "high_availability": architecture_result.analysis['architecture_design']['high_availability']['multi_az'],
                    "agent_execution_time": f"{architecture_result.execution_time_ms}ms"
                },
                "confidence": architecture_result.confidence,
                "timestamp": architecture_result.timestamp
            })
            
            # Update session with results
            strands_sessions[session_id].update({
                "status": "completed",
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},
                "steps": steps,
                "recommendation": analysis_result['final_recommendation'],
                "execution_summary": analysis_result['execution_summary']
            })
            
            return {
                "success": True,
                "session_id": session_id,
                "status": "completed",
                "steps": steps,
                "recommendation": analysis_result['final_recommendation'],
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},  # Include agent results in response
                "multi_agent_summary": {
                    "total_agents": analysis_result['execution_summary']['total_agents'],
                    "execution_time_ms": analysis_result['execution_summary']['total_execution_time_ms'],
                    "average_confidence": round(analysis_result['execution_summary']['average_confidence'], 3),
                    "agents_used": list(agent_results.keys())
                }
            }
        else:
            raise Exception("Multi-agent analysis failed")
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Strands multi-agent analysis error: {str(e)}",
            "fallback_message": "Falling back to single-agent analysis"
        }

@router.get("/strands/session/{session_id}")
def get_strands_session(session_id: str):
    """Get Strands analysis session details"""
    session = strands_sessions.get(session_id)
    if not session:
        return {"error": "Session not found"}
    return session

# NoSQL Database Onboarding endpoints
nosql_sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/nosql/analyze")
async def nosql_analyze_request(data: dict):
    """NoSQL Database Onboarding multi-agent analysis"""
    try:
        session_id = f"nosql_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize session
        nosql_sessions[session_id] = {
            "request": data,
            "status": "analyzing",
            "agent_results": {},
            "recommendation": None,
            "created_at": datetime.now().isoformat()
        }
        
        # Run multi-agent analysis
        analysis_result = await nosql_orchestrator.analyze_request(data)
        
        if analysis_result['success']:
            # Convert agent results to steps format for frontend compatibility
            agent_results = analysis_result['agent_results']
            steps = []
            
            # Step 1: Workload Analysis
            workload_result = agent_results['workload']
            steps.append({
                "step": "workload_analysis",
                "reasoning": f"🔍 {workload_result.agent_name}: Identified {workload_result.analysis.get('workload_type', 'Document')} workload pattern",
                "findings": {
                    "workload_type": workload_result.analysis.get('workload_type', 'Document'),
                    "data_model": workload_result.analysis.get('data_model', 'Document'),
                    "consistency_needs": workload_result.analysis.get('consistency_needs', 'Eventual'),
                    "agent_execution_time": f"{workload_result.execution_time_ms}ms"
                },
                "confidence": workload_result.confidence,
                "timestamp": workload_result.timestamp
            })
            
            # Step 2: Database & Cache Selection
            database_result = agent_results['database_selector']
            cache_result = agent_results['cache_strategy']
            steps.append({
                "step": "database_cache_selection",
                "reasoning": f"🗄️ Database & Cache Selection: {database_result.analysis.get('primary_recommendation', {}).get('database', 'DynamoDB')} + {cache_result.analysis.get('cache_strategy', {}).get('primary_cache', 'Redis')}",
                "findings": {
                    "primary_database": database_result.analysis.get('primary_recommendation', {}).get('database', 'DynamoDB'),
                    "primary_cache": cache_result.analysis.get('cache_strategy', {}).get('primary_cache', 'Redis'),
                    "deployment_model": database_result.analysis.get('primary_recommendation', {}).get('deployment', 'Managed'),
                    "cache_pattern": cache_result.analysis.get('cache_strategy', {}).get('cache_pattern', 'Cache-Aside')
                },
                "confidence": (database_result.confidence + cache_result.confidence) / 2,
                "timestamp": database_result.timestamp
            })
            
            # Step 3: Multi-Agent Analysis (Cost, Security, Performance)
            cost_result = agent_results['cost']
            security_result = agent_results['security']
            performance_result = agent_results['performance']
            steps.append({
                "step": "multi_agent_analysis",
                "reasoning": f"🤖 Parallel analysis: Cost (${cost_result.analysis.get('cost_breakdown', {}).get('total_monthly', 2000)}/mo), Security ({int(security_result.analysis.get('compliance_score', 0.8) * 100)}%), Performance optimized",
                "findings": {
                    "total_monthly_cost": cost_result.analysis.get('cost_breakdown', {}).get('total_monthly', 2000),
                    "compliance_score": int(security_result.analysis.get('compliance_score', 0.8) * 100),
                    "performance_target": performance_result.analysis.get('performance_analysis', {}).get('throughput_requirements', {}).get('sustained_throughput', 1000),
                    "total_execution_time": f"{analysis_result['execution_summary']['total_execution_time_ms']}ms"
                },
                "confidence": analysis_result['execution_summary']['average_confidence'],
                "timestamp": datetime.now().isoformat()
            })
            
            # Step 4: Architecture Synthesis
            architecture_result = agent_results['architecture']
            steps.append({
                "step": "architecture_synthesis",
                "reasoning": f"🏗️ {architecture_result.agent_name}: Complete NoSQL architecture with {architecture_result.analysis.get('architecture_design', {}).get('deployment_architecture', {}).get('regions', ['us-east-1'])} regions",
                "findings": {
                    "deployment_regions": len(architecture_result.analysis.get('architecture_design', {}).get('deployment_architecture', {}).get('regions', ['us-east-1'])),
                    "high_availability": architecture_result.analysis.get('architecture_design', {}).get('deployment_architecture', {}).get('availability_zones', 3),
                    "disaster_recovery": architecture_result.analysis.get('disaster_recovery', {}).get('rto', '< 1 hour'),
                    "agent_execution_time": f"{architecture_result.execution_time_ms}ms"
                },
                "confidence": architecture_result.confidence,
                "timestamp": architecture_result.timestamp
            })
            
            # Update session with results
            nosql_sessions[session_id].update({
                "status": "completed",
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},
                "steps": steps,
                "recommendation": analysis_result['final_recommendation'],
                "execution_summary": analysis_result['execution_summary']
            })
            
            return {
                "success": True,
                "session_id": session_id,
                "status": "completed",
                "steps": steps,
                "recommendation": analysis_result['final_recommendation'],
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},
                "multi_agent_summary": {
                    "total_agents": analysis_result['execution_summary']['total_agents'],
                    "execution_time_ms": analysis_result['execution_summary']['total_execution_time_ms'],
                    "average_confidence": round(analysis_result['execution_summary']['average_confidence'], 3),
                    "agents_used": list(agent_results.keys())
                }
            }
        else:
            raise Exception("NoSQL multi-agent analysis failed")
            
    except Exception as e:
        return {
            "success": False,
            "error": f"NoSQL multi-agent analysis error: {str(e)}",
            "fallback_message": "Falling back to basic analysis"
        }

@router.get("/nosql/session/{session_id}")
def get_nosql_session(session_id: str):
    """Get NoSQL analysis session details"""
    if session_id not in nosql_sessions:
        return {"error": "Session not found"}
    
    session = nosql_sessions[session_id]
    return session

def generate_nosql_terraform(recommendation: dict, session_data: dict) -> str:
    """Generate Terraform template for NoSQL database provisioning"""
    
    primary_db = recommendation.get('solution_stack', {}).get('primary_database', 'DynamoDB')
    cache_layer = recommendation.get('solution_stack', {}).get('cache_layer', 'Redis')
    app_name = session_data.get('request', {}).get('application', 'myapp').lower().replace(' ', '-')
    team_name = session_data.get('request', {}).get('team', 'myteam').lower().replace(' ', '-')
    
    if 'DynamoDB' in primary_db:
        terraform_template = f'''# Terraform configuration for NoSQL Stack: {primary_db} + {cache_layer}
# Generated by NoSQL Onboarding AI Analysis
# Application: {session_data.get('request', {}).get('application', 'Unknown')}
# Team: {session_data.get('request', {}).get('team', 'Unknown')}

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = var.aws_region
}}

# Variables
variable "aws_region" {{
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}}

variable "environment" {{
  description = "Environment name"
  type        = string
  default     = "production"
}}

# DynamoDB Table
resource "aws_dynamodb_table" "main_table" {{
  name           = "{app_name}-main-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"
  
  attribute {{
    name = "pk"
    type = "S"
  }}
  
  attribute {{
    name = "sk"
    type = "S"
  }}
  
  attribute {{
    name = "gsi1pk"
    type = "S"
  }}
  
  attribute {{
    name = "gsi1sk"
    type = "S"
  }}
  
  global_secondary_index {{
    name     = "GSI1"
    hash_key = "gsi1pk"
    range_key = "gsi1sk"
  }}
  
  server_side_encryption {{
    enabled     = true
    kms_key_id  = aws_kms_key.dynamodb_key.arn
  }}
  
  point_in_time_recovery {{
    enabled = true
  }}
  
  tags = {{
    Name        = "{app_name}-main-table"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedBy   = "nosql-onboarding-ai"
  }}
}}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "redis_subnet_group" {{
  name       = "{app_name}-redis-subnet-group"
  subnet_ids = var.subnet_ids
}}

resource "aws_security_group" "redis_security_group" {{
  name_prefix = "{app_name}-redis-"
  description = "Security group for Redis cache"
  
  ingress {{
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }}
  
  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  tags = {{
    Name        = "{app_name}-redis-security-group"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_elasticache_replication_group" "redis_cluster" {{
  replication_group_id       = "{app_name}-redis"
  description                = "Redis cluster for {app_name}"
  
  node_type                  = "cache.r7g.large"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids = [aws_security_group.redis_security_group.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                = aws_kms_key.redis_key.arn
  
  log_delivery_configuration {{
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }}
  
  tags = {{
    Name        = "{app_name}-redis"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    Environment = var.environment
  }}
}}

# KMS Keys
resource "aws_kms_key" "dynamodb_key" {{
  description = "KMS key for {app_name} DynamoDB encryption"
  
  tags = {{
    Name        = "{app_name}-dynamodb-key"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_kms_alias" "dynamodb_key_alias" {{
  name          = "alias/{app_name}-dynamodb-key"
  target_key_id = aws_kms_key.dynamodb_key.key_id
}}

resource "aws_kms_key" "redis_key" {{
  description = "KMS key for {app_name} Redis encryption"
  
  tags = {{
    Name        = "{app_name}-redis-key"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_kms_alias" "redis_key_alias" {{
  name          = "alias/{app_name}-redis-key"
  target_key_id = aws_kms_key.redis_key.key_id
}}

# CloudWatch Log Group for Redis
resource "aws_cloudwatch_log_group" "redis_slow_log" {{
  name              = "/aws/elasticache/{app_name}-redis/slow-log"
  retention_in_days = 7
  
  tags = {{
    Name        = "{app_name}-redis-slow-log"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

# IAM Role for DynamoDB access
resource "aws_iam_role" "app_role" {{
  name = "{app_name}-app-role"
  
  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "ec2.amazonaws.com"
        }}
      }}
    ]
  }})
}}

resource "aws_iam_policy" "dynamodb_policy" {{
  name = "{app_name}-dynamodb-policy"
  
  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.main_table.arn,
          "${{aws_dynamodb_table.main_table.arn}}/index/*"
        ]
      }}
    ]
  }})
}}

resource "aws_iam_role_policy_attachment" "app_dynamodb_policy" {{
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}}

# Variables that need to be provided
variable "subnet_ids" {{
  description = "List of subnet IDs for the cache subnet group"
  type        = list(string)
}}

# Outputs
output "dynamodb_table_name" {{
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.main_table.name
}}

output "dynamodb_table_arn" {{
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.main_table.arn
}}

output "redis_endpoint" {{
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.redis_cluster.primary_endpoint_address
}}

output "redis_port" {{
  description = "Redis cluster port"
  value       = aws_elasticache_replication_group.redis_cluster.port
}}

output "app_role_arn" {{
  description = "IAM role ARN for application access"
  value       = aws_iam_role.app_role.arn
}}
'''
    elif 'DocumentDB' in primary_db:
        terraform_template = f'''# Terraform configuration for NoSQL Stack: {primary_db} + {cache_layer}
# Generated by NoSQL Onboarding AI Analysis

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = var.aws_region
}}

variable "aws_region" {{
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {{
  cluster_identifier      = "{app_name}-docdb-cluster"
  engine                 = "docdb"
  master_username        = "admin"
  master_password        = var.master_password
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  skip_final_snapshot    = false
  final_snapshot_identifier = "{app_name}-final-snapshot"
  
  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.docdb.id]
  
  storage_encrypted = true
  kms_key_id       = aws_kms_key.docdb_key.arn
  
  tags = {{
    Name        = "{app_name}-docdb-cluster"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_docdb_cluster_instance" "cluster_instances" {{
  count              = 2
  identifier         = "{app_name}-docdb-${{count.index}}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.r5.large"
}}

# Security Group and Subnet Group
resource "aws_security_group" "docdb" {{
  name_prefix = "{app_name}-docdb-"
  
  ingress {{
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }}
}}

resource "aws_docdb_subnet_group" "main" {{
  name       = "{app_name}-docdb-subnet-group"
  subnet_ids = var.subnet_ids
}}

resource "aws_kms_key" "docdb_key" {{
  description = "KMS key for DocumentDB encryption"
}}

variable "master_password" {{
  description = "Master password for DocumentDB"
  type        = string
  sensitive   = true
}}

variable "subnet_ids" {{
  description = "List of subnet IDs"
  type        = list(string)
}}

output "docdb_endpoint" {{
  value = aws_docdb_cluster.main.endpoint
}}
'''
    else:
        # Generic NoSQL template
        terraform_template = f'''# Terraform configuration for NoSQL Stack: {primary_db} + {cache_layer}
# Generated by NoSQL Onboarding AI Analysis
# Note: This is a generic template - customize based on your specific NoSQL database choice

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

# Add your specific NoSQL database resources here
# Common options: DynamoDB, DocumentDB, Amazon MemoryDB, etc.
'''
    
    return terraform_template

@router.post("/nosql/approve/{session_id}")
def approve_nosql_recommendation(session_id: str, data: dict):
    """Approve or reject NoSQL recommendation and trigger provisioning"""
    if session_id not in nosql_sessions:
        return {"error": "Session not found"}
    
    approved = data.get("approved", False)
    session = nosql_sessions[session_id]
    
    if approved:
        # Generate Terraform template
        terraform_template = generate_nosql_terraform(session["recommendation"], session)
        
        # Simulate provisioning process
        session["status"] = "provisioning"
        session["provisioning"] = {
            "status": "in_progress",
            "aws_resources": {
                "primary_database": session["recommendation"]["solution_stack"]["primary_database"],
                "cache_cluster": session["recommendation"]["solution_stack"]["cache_layer"],
                "region": "us-east-1",
                "estimated_completion": "45 minutes"
            },
            "connection_details": {
                "database_endpoint": "nosql-cluster.cluster-xyz.us-east-1.amazonaws.com",
                "cache_endpoint": "nosql-cache.abc123.cache.amazonaws.com",
                "port": 443
            },
            "terraform_template": terraform_template
        }
        return {"success": True, "message": "Provisioning started", "provisioning": session["provisioning"]}
    else:
        session["status"] = "rejected"
        return {"success": True, "message": "Recommendation rejected"}

    return session

def generate_strands_terraform(recommendation: dict, session_data: dict) -> str:
    """Generate Terraform template for Strands database provisioning"""
    
    solution = recommendation.get('solution', 'PostgreSQL')
    instance_type = recommendation.get('instance_type', 'db.t3.medium')
    storage_size = recommendation.get('storage_gb', 100)
    multi_az = recommendation.get('high_availability', True)
    backup_retention = recommendation.get('backup_retention_days', 7)
    
    # Determine engine based on solution
    if 'Aurora PostgreSQL' in solution:
        engine = 'aurora-postgresql'
        engine_version = '13.7'
        cluster_mode = True
    elif 'Aurora MySQL' in solution:
        engine = 'aurora-mysql'
        engine_version = '8.0.mysql_aurora.3.02.0'
        cluster_mode = True
    elif 'PostgreSQL' in solution:
        engine = 'postgres'
        engine_version = '14.9'
        cluster_mode = False
    elif 'MySQL' in solution:
        engine = 'mysql'
        engine_version = '8.0.35'
        cluster_mode = False
    else:
        engine = 'postgres'
        engine_version = '14.9'
        cluster_mode = False
    
    app_name = session_data.get('request', {}).get('application', 'myapp').lower().replace(' ', '-')
    team_name = session_data.get('request', {}).get('team', 'myteam').lower().replace(' ', '-')
    
    if cluster_mode:
        terraform_template = f'''# Terraform configuration for {solution}
# Generated by AWS Strands AI Analysis
# Application: {session_data.get('request', {}).get('application', 'Unknown')}
# Team: {session_data.get('request', {}).get('team', 'Unknown')}

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = var.aws_region
}}

# Variables
variable "aws_region" {{
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}}

variable "environment" {{
  description = "Environment name"
  type        = string
  default     = "production"
}}

# VPC and Security Group
resource "aws_security_group" "db_security_group" {{
  name_prefix = "{app_name}-db-"
  description = "Security group for {solution}"
  
  ingress {{
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }}
  
  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  tags = {{
    Name        = "{app_name}-db-security-group"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    ManagedBy   = "terraform"
    CreatedBy   = "aws-strands-ai"
  }}
}}

# DB Subnet Group
resource "aws_db_subnet_group" "db_subnet_group" {{
  name       = "{app_name}-db-subnet-group"
  subnet_ids = var.subnet_ids
  
  tags = {{
    Name        = "{app_name}-db-subnet-group"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

# Aurora Cluster
resource "aws_rds_cluster" "main" {{
  cluster_identifier      = "{app_name}-cluster"
  engine                 = "{engine}"
  engine_version         = "{engine_version}"
  database_name          = "{app_name.replace('-', '_')}"
  master_username        = "admin"
  manage_master_user_password = true
  
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  
  backup_retention_period = {backup_retention}
  preferred_backup_window = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"
  
  storage_encrypted = true
  kms_key_id       = aws_kms_key.db_key.arn
  
  skip_final_snapshot = false
  final_snapshot_identifier = "{app_name}-final-snapshot-${{formatdate("YYYY-MM-DD-hhmm", timestamp())}}"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {{
    Name        = "{app_name}-cluster"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedBy   = "aws-strands-ai"
  }}
}}

# Aurora Cluster Instances
resource "aws_rds_cluster_instance" "cluster_instances" {{
  count              = {2 if multi_az else 1}
  identifier         = "{app_name}-instance-${{count.index}}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "{instance_type}"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
  
  performance_insights_enabled = true
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  
  tags = {{
    Name        = "{app_name}-instance-${{count.index}}"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

# KMS Key for encryption
resource "aws_kms_key" "db_key" {{
  description = "KMS key for {app_name} database encryption"
  
  tags = {{
    Name        = "{app_name}-db-key"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_kms_alias" "db_key_alias" {{
  name          = "alias/{app_name}-db-key"
  target_key_id = aws_kms_key.db_key.key_id
}}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {{
  name = "{app_name}-rds-monitoring-role"
  
  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "monitoring.rds.amazonaws.com"
        }}
      }}
    ]
  }})
}}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {{
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}}

# Variables that need to be provided
variable "subnet_ids" {{
  description = "List of subnet IDs for the DB subnet group"
  type        = list(string)
}}

# Outputs
output "cluster_endpoint" {{
  description = "Aurora cluster endpoint"
  value       = aws_rds_cluster.main.endpoint
}}

output "cluster_reader_endpoint" {{
  description = "Aurora cluster reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
}}

output "cluster_identifier" {{
  description = "Aurora cluster identifier"
  value       = aws_rds_cluster.main.cluster_identifier
}}

output "database_name" {{
  description = "Database name"
  value       = aws_rds_cluster.main.database_name
}}

output "master_username" {{
  description = "Master username"
  value       = aws_rds_cluster.main.master_username
  sensitive   = true
}}
'''
    else:
        # Single RDS instance template
        terraform_template = f'''# Terraform configuration for {solution}
# Generated by AWS Strands AI Analysis
# Application: {session_data.get('request', {}).get('application', 'Unknown')}
# Team: {session_data.get('request', {}).get('team', 'Unknown')}

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = var.aws_region
}}

# Variables
variable "aws_region" {{
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}}

variable "environment" {{
  description = "Environment name"
  type        = string
  default     = "production"
}}

# Security Group
resource "aws_security_group" "db_security_group" {{
  name_prefix = "{app_name}-db-"
  description = "Security group for {solution}"
  
  ingress {{
    from_port   = {5432 if 'postgres' in engine else 3306}
    to_port     = {5432 if 'postgres' in engine else 3306}
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }}
  
  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  tags = {{
    Name        = "{app_name}-db-security-group"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    ManagedBy   = "terraform"
    CreatedBy   = "aws-strands-ai"
  }}
}}

# DB Subnet Group
resource "aws_db_subnet_group" "db_subnet_group" {{
  name       = "{app_name}-db-subnet-group"
  subnet_ids = var.subnet_ids
  
  tags = {{
    Name        = "{app_name}-db-subnet-group"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

# RDS Instance
resource "aws_db_instance" "main" {{
  identifier = "{app_name}-db"
  
  engine         = "{engine}"
  engine_version = "{engine_version}"
  instance_class = "{instance_type}"
  
  allocated_storage     = {storage_size}
  max_allocated_storage = {storage_size * 2}
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id          = aws_kms_key.db_key.arn
  
  db_name  = "{app_name.replace('-', '_')}"
  username = "admin"
  manage_master_user_password = true
  
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  
  backup_retention_period = {backup_retention}
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az = {str(multi_az).lower()}
  
  performance_insights_enabled = true
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  
  enabled_cloudwatch_logs_exports = ["{engine}"]
  
  skip_final_snapshot = false
  final_snapshot_identifier = "{app_name}-final-snapshot-${{formatdate("YYYY-MM-DD-hhmm", timestamp())}}"
  
  tags = {{
    Name        = "{app_name}-db"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedBy   = "aws-strands-ai"
  }}
}}

# KMS Key for encryption
resource "aws_kms_key" "db_key" {{
  description = "KMS key for {app_name} database encryption"
  
  tags = {{
    Name        = "{app_name}-db-key"
    Application = "{session_data.get('request', {}).get('application', 'Unknown')}"
    Team        = "{team_name}"
  }}
}}

resource "aws_kms_alias" "db_key_alias" {{
  name          = "alias/{app_name}-db-key"
  target_key_id = aws_kms_key.db_key.key_id
}}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {{
  name = "{app_name}-rds-monitoring-role"
  
  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "monitoring.rds.amazonaws.com"
        }}
      }}
    ]
  }})
}}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {{
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}}

# Variables that need to be provided
variable "subnet_ids" {{
  description = "List of subnet IDs for the DB subnet group"
  type        = list(string)
}}

# Outputs
output "db_endpoint" {{
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}}

output "db_port" {{
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}}

output "db_identifier" {{
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}}

output "database_name" {{
  description = "Database name"
  value       = aws_db_instance.main.db_name
}}

output "master_username" {{
  description = "Master username"
  value       = aws_db_instance.main.username
  sensitive   = true
}}
'''
    
    return terraform_template

@router.post("/strands/approve/{session_id}")
def approve_strands_recommendation(session_id: str, data: dict):
    """Approve or reject Strands recommendation and trigger provisioning"""
    session = strands_sessions.get(session_id)
    if not session:
        return {"error": "Session not found"}
    
    approved = data.get("approved", False)
    
    if approved:
        # Generate Terraform template
        recommendation = session.get("recommendation", {})
        terraform_template = generate_strands_terraform(recommendation, session)
        
        # Simulate AWS resource provisioning
        provisioning_result = {
            "status": "provisioning_started",
            "aws_resources": {
                "cluster_identifier": f"{recommendation.get('solution', 'database').lower().replace(' ', '-')}-{session_id}",
                "instance_class": recommendation.get("instance_type", "db.r6g.xlarge"),
                "engine": "aurora-postgresql" if "Aurora" in recommendation.get("solution", "") else 
                         "redis" if "Redis" in recommendation.get("solution", "") else
                         "redshift" if "Redshift" in recommendation.get("solution", "") else "postgresql",
                "multi_az": True,
                "region": "us-east-1"
            },
            "connection_details": {
                "endpoint": f"{recommendation.get('solution', 'database').lower().replace(' ', '-')}-cluster.xyz.us-east-1.rds.amazonaws.com",
                "port": 6379 if "Redis" in recommendation.get("solution", "") else 
                       5439 if "Redshift" in recommendation.get("solution", "") else 5432,
                "database_name": session.get("request", {}).get("application", "app").lower().replace(" ", "_")
            },
            "estimated_completion": datetime.now().isoformat(),
            "terraform_template": terraform_template
        }
        
        # Update session
        session.update({
            "approval_status": "approved",
            "provisioning": provisioning_result,
            "approved_at": datetime.now().isoformat()
        })
        
        # Post to dev updates
        dev_update = {
            "feature": f"AWS Strands Database Provisioning - {session.get('request', {}).get('application', 'Application')}",
            "description": f"Successfully provisioned {recommendation.get('solution')} for {session.get('request', {}).get('team', 'team')}",
            "code_highlights": [
                f"Multi-step AI analysis with {recommendation.get('confidence_score', 0.9):.0%} confidence",
                f"Autonomous resource provisioning: {recommendation.get('solution')}",
                f"Estimated monthly cost: ${recommendation.get('estimated_monthly_cost', 0):,}"
            ],
            "files_created": [],
            "files_modified": [],
            "status": "completed",
            "kiro_notes": "AWS Strands agent successfully completed end-to-end database provisioning with human approval",
            "next_steps": ["Monitor resource utilization", "Configure application connections", "Set up automated backups"]
        }
        
        # Add to dev updates
        update = {
            "id": len(dev_updates) + 1,
            "timestamp": datetime.now().isoformat(),
            **dev_update
        }
        dev_updates.insert(0, update)
        
        return {
            "success": True,
            "approval_status": "approved",
            "provisioning": provisioning_result,
            "message": "Provisioning started successfully"
        }
    else:
        session.update({
            "approval_status": "rejected",
            "rejected_at": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "approval_status": "rejected",
            "message": "Recommendation rejected"
        }

@router.get("/strands/sessions")
def list_strands_sessions(limit: int = 20):
    """List recent Strands analysis sessions"""
    sessions = list(strands_sessions.values())
    sessions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"sessions": sessions[:limit]}

@router.delete("/strands/sessions")
def clear_strands_sessions():
    """Clear all Strands sessions"""
    global strands_sessions
    strands_sessions.clear()

# AWS Agent Core Incident Response endpoints
@router.post("/agentcore/analyze")
async def agentcore_analyze_incident(data: dict):
    """AWS Agent Core incident response multi-agent analysis"""
    try:
        session_id = f"agentcore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize session
        agentcore_sessions[session_id] = {
            "request": data,
            "status": "analyzing",
            "agent_results": {},
            "response_plan": None,
            "created_at": datetime.now().isoformat()
        }
        
        # Run multi-agent incident response analysis
        analysis_result = await agentcore_orchestrator.analyze_request(data)
        
        if analysis_result['success']:
            # Convert agent results to steps format for frontend compatibility
            agent_results = analysis_result['agent_results']
            steps = []
            
            # Step 1: Incident Detection & Classification
            detection_result = agent_results['detection']
            steps.append({
                "step": "incident_detection",
                "reasoning": f"🚨 {detection_result.agent_name}: Classified as {detection_result.analysis.get('incident_classification', {}).get('severity', 'P2')} {detection_result.analysis.get('incident_classification', {}).get('category', 'Performance')} incident",
                "findings": {
                    "severity": detection_result.analysis.get('incident_classification', {}).get('severity', 'P2'),
                    "category": detection_result.analysis.get('incident_classification', {}).get('category', 'Performance'),
                    "impact_scope": detection_result.analysis.get('incident_classification', {}).get('impact_scope', 'Medium'),
                    "estimated_users_affected": detection_result.analysis.get('incident_classification', {}).get('estimated_users_affected', 0),
                    "agent_execution_time": f"{detection_result.execution_time_ms}ms"
                },
                "confidence": detection_result.confidence,
                "timestamp": detection_result.timestamp
            })
            
            # Step 2: Root Cause Analysis & Communication Setup
            rca_result = agent_results['root_cause']
            communication_result = agent_results['communication']
            steps.append({
                "step": "rca_and_communication",
                "reasoning": f"🔍 Parallel execution: Root cause identified as '{rca_result.analysis.get('root_cause_analysis', {}).get('primary_cause', 'Unknown')}' + Communication plan activated",
                "findings": {
                    "primary_cause": rca_result.analysis.get('root_cause_analysis', {}).get('primary_cause', 'Unknown'),
                    "mttr_estimate": rca_result.analysis.get('impact_assessment', {}).get('mttr_estimate', '30 minutes'),
                    "confidence_level": rca_result.analysis.get('evidence_analysis', {}).get('confidence_level', 'Medium'),
                    "communication_channels": len(communication_result.analysis.get('communication_strategy', {}).get('internal_notifications', [])),
                    "stakeholders_notified": len(communication_result.analysis.get('stakeholder_matrix', {}).get('immediate_notify', []))
                },
                "confidence": (rca_result.confidence + communication_result.confidence) / 2,
                "timestamp": rca_result.timestamp
            })
            
            # Step 3: Automated Remediation
            remediation_result = agent_results['remediation']
            steps.append({
                "step": "automated_remediation",
                "reasoning": f"🔧 {remediation_result.agent_name}: Generated {len(remediation_result.analysis.get('remediation_plan', {}).get('immediate_actions', []))} automated remediation actions",
                "findings": {
                    "immediate_actions": len(remediation_result.analysis.get('remediation_plan', {}).get('immediate_actions', [])),
                    "automation_safety": remediation_result.analysis.get('risk_assessment', {}).get('automation_safety', 'Medium'),
                    "workflow_id": remediation_result.analysis.get('automation_workflow', {}).get('workflow_id', 'Unknown'),
                    "validation_duration": remediation_result.analysis.get('recovery_validation', {}).get('validation_duration', '10 minutes'),
                    "agent_execution_time": f"{remediation_result.execution_time_ms}ms"
                },
                "confidence": remediation_result.confidence,
                "timestamp": remediation_result.timestamp
            })
            
            # Step 4: Post-Incident Analysis
            post_incident_result = agent_results['post_incident']
            steps.append({
                "step": "post_incident_analysis",
                "reasoning": f"📊 {post_incident_result.agent_name}: Identified {len(post_incident_result.analysis.get('improvement_recommendations', {}).get('immediate_actions', []))} improvement opportunities",
                "findings": {
                    "immediate_improvements": len(post_incident_result.analysis.get('improvement_recommendations', {}).get('immediate_actions', [])),
                    "long_term_improvements": len(post_incident_result.analysis.get('improvement_recommendations', {}).get('long_term_improvements', [])),
                    "prevention_measures": len(post_incident_result.analysis.get('prevention_measures', {}).get('monitoring_enhancements', [])),
                    "lessons_learned": len(post_incident_result.analysis.get('process_analysis', {}).get('lessons_learned', [])),
                    "agent_execution_time": f"{post_incident_result.execution_time_ms}ms"
                },
                "confidence": post_incident_result.confidence,
                "timestamp": post_incident_result.timestamp
            })
            
            # Update session with results
            agentcore_sessions[session_id].update({
                "status": "completed",
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},
                "steps": steps,
                "response_plan": analysis_result['final_response'],
                "execution_summary": analysis_result['execution_summary']
            })
            
            return {
                "success": True,
                "session_id": session_id,
                "status": "completed",
                "steps": steps,
                "response_plan": analysis_result['final_response'],
                "agent_results": {k: v.__dict__ for k, v in agent_results.items()},
                "multi_agent_summary": {
                    "total_agents": analysis_result['execution_summary']['total_agents'],
                    "execution_time_ms": analysis_result['execution_summary']['total_execution_time_ms'],
                    "average_confidence": round(analysis_result['execution_summary']['average_confidence'], 3),
                    "agents_used": list(agent_results.keys())
                }
            }
        else:
            raise Exception("Agent Core incident response analysis failed")
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Agent Core analysis error: {str(e)}",
            "fallback_message": "Falling back to manual incident response"
        }

@router.get("/agentcore/session/{session_id}")
def get_agentcore_session(session_id: str):
    """Get Agent Core incident response session details"""
    if session_id not in agentcore_sessions:
        return {"error": "Session not found"}
    
    session = agentcore_sessions[session_id]
    return session

@router.post("/agentcore/execute/{session_id}")
def execute_agentcore_remediation(session_id: str, data: dict):
    """Execute Agent Core automated remediation actions"""
    if session_id not in agentcore_sessions:
        return {"error": "Session not found"}
    
    approved = data.get("approved", False)
    session = agentcore_sessions[session_id]
    
    if approved:
        # Simulate Agent Core workflow execution
        session["status"] = "executing"
        session["execution"] = {
            "status": "in_progress",
            "workflow_id": session["response_plan"]["immediate_response"]["automation_level"],
            "actions_executed": 0,
            "total_actions": session["response_plan"]["immediate_response"]["remediation_actions"],
            "estimated_completion": "15 minutes",
            "monitoring_enabled": True
        }
        
        # Post to dev updates
        dev_update = {
            "feature": f"Agent Core Incident Response - {session.get('request', {}).get('service', 'Service')}",
            "description": f"Executing automated remediation for {session['response_plan']['incident_response_plan']['severity']} incident",
            "code_highlights": [
                f"Multi-agent analysis with {session['execution_summary']['average_confidence']:.0%} confidence",
                f"Automated remediation: {session['response_plan']['immediate_response']['automation_level']} level",
                f"Communication plan: {session['response_plan']['communication_plan']['stakeholder_count']} stakeholders notified"
            ],
            "files_created": [],
            "files_modified": [],
            "status": "completed",
            "kiro_notes": "AWS Agent Core successfully orchestrated 5-agent incident response workflow",
            "next_steps": ["Monitor remediation execution", "Validate recovery criteria", "Conduct post-incident review"]
        }
        
        # Add to dev updates
        update = {
            "id": len(dev_updates) + 1,
            "timestamp": datetime.now().isoformat(),
            **dev_update
        }
        dev_updates.insert(0, update)
        
        return {"success": True, "message": "Remediation execution started", "execution": session["execution"]}
    else:
        session["status"] = "manual_override"
        return {"success": True, "message": "Manual incident response initiated"}

@router.get("/agentcore/sessions")
def get_agentcore_sessions(limit: int = 10):
    """Get recent Agent Core incident response sessions"""
    sessions = [
        {
            "session_id": session_id,
            "created_at": session_data["created_at"],
            "status": session_data["status"],
            "service": session_data.get("request", {}).get("service", "Unknown"),
            "severity": session_data.get("response_plan", {}).get("incident_response_plan", {}).get("severity", "Unknown")
        }
        for session_id, session_data in agentcore_sessions.items()
    ]
    
    # Sort by creation time, most recent first
    sessions.sort(key=lambda x: x["created_at"], reverse=True)
    return {"sessions": sessions[:limit]}

@router.delete("/agentcore/sessions")
def clear_agentcore_sessions():
    """Clear all Agent Core sessions"""
    global agentcore_sessions
    agentcore_sessions.clear()
    return {"success": True, "message": "All Strands sessions cleared"}