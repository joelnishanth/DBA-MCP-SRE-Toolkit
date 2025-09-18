from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .synthetic_data_generator import SyntheticDataGenerator
from .chat_service import ChatService
import json
import random

router = APIRouter()

# These will be set by main.py
data_generator = None
chat_service = None

@router.get("/inventory/ec2")
async def get_ec2_instances(
    application: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    environment: Optional[str] = Query(None)
):
    """Get EC2 instances with optional filtering"""
    instances = data_generator.get_ec2_instances()
    
    # Apply filters
    if application:
        instances = [i for i in instances if i["application"] == application]
    if team:
        instances = [i for i in instances if i["team"] == team]
    if region:
        instances = [i for i in instances if i["region"] == region]
    if environment:
        instances = [i for i in instances if i["environment"] == environment]
    
    return {
        "total_count": len(instances),
        "instances": instances
    }

@router.get("/inventory/rds")
async def get_rds_instances(
    application: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    engine: Optional[str] = Query(None)
):
    """Get RDS instances with optional filtering"""
    instances = data_generator.get_rds_instances()
    
    # Apply filters
    if application:
        instances = [i for i in instances if i["application"] == application]
    if team:
        instances = [i for i in instances if i["team"] == team]
    if region:
        instances = [i for i in instances if i["region"] == region]
    if engine:
        instances = [i for i in instances if i["engine"] == engine]
    
    return {
        "total_count": len(instances),
        "instances": instances
    }

@router.get("/inventory/databases")
async def get_databases(
    application: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    database_type: Optional[str] = Query(None),
    host_type: Optional[str] = Query(None)
):
    """Get all databases with optional filtering"""
    databases = data_generator.get_databases()
    
    # Apply filters
    if application:
        databases = [d for d in databases if d["application"] == application]
    if team:
        databases = [d for d in databases if d["team"] == team]
    if database_type:
        databases = [d for d in databases if d["database_type"] == database_type]
    if host_type:
        databases = [d for d in databases if d["host_type"] == host_type]
    
    return {
        "total_count": len(databases),
        "databases": databases
    }

@router.get("/analytics/database-summary")
async def get_database_summary():
    """Get database summary analytics"""
    databases = data_generator.get_databases()
    
    # Group by application and database type
    app_db_summary = {}
    for db in databases:
        app = db["application"]
        db_type = db["database_type"]
        
        if app not in app_db_summary:
            app_db_summary[app] = {}
        
        if db_type not in app_db_summary[app]:
            app_db_summary[app][db_type] = {
                "count": 0,
                "ec2_instances": set(),
                "rds_instances": set(),
                "total_size_gb": 0,
                "total_connections": 0
            }
        
        app_db_summary[app][db_type]["count"] += 1
        app_db_summary[app][db_type]["total_size_gb"] += db["database_size_gb"]
        app_db_summary[app][db_type]["total_connections"] += db["active_connections"]
        
        if db["host_type"] == "EC2":
            app_db_summary[app][db_type]["ec2_instances"].add(db["host_instance_id"])
        else:
            app_db_summary[app][db_type]["rds_instances"].add(db["host_instance_id"])
    
    # Convert sets to counts and format response
    summary = []
    for app, db_types in app_db_summary.items():
        for db_type, stats in db_types.items():
            summary.append({
                "application": app,
                "database_type": db_type,
                "database_count": stats["count"],
                "ec2_instance_count": len(stats["ec2_instances"]),
                "rds_instance_count": len(stats["rds_instances"]),
                "total_instance_count": len(stats["ec2_instances"]) + len(stats["rds_instances"]),
                "total_size_gb": round(stats["total_size_gb"], 2),
                "total_active_connections": stats["total_connections"]
            })
    
    # Sort by database count descending
    summary.sort(key=lambda x: x["database_count"], reverse=True)
    
    return {
        "summary": summary,
        "total_applications": len(app_db_summary),
        "total_databases": len(databases)
    }

@router.get("/analytics/top-applications")
async def get_top_applications(limit: int = Query(5)):
    """Get top applications by database count"""
    databases = data_generator.get_databases()
    
    app_stats = {}
    for db in databases:
        app = db["application"]
        db_type = db["database_type"]
        
        if app not in app_stats:
            app_stats[app] = {
                "application": app,
                "total_databases": 0,
                "database_types": {},
                "ec2_instances": set(),
                "rds_instances": set(),
                "teams": set()
            }
        
        app_stats[app]["total_databases"] += 1
        app_stats[app]["teams"].add(db["team"])
        
        if db_type not in app_stats[app]["database_types"]:
            app_stats[app]["database_types"][db_type] = 0
        app_stats[app]["database_types"][db_type] += 1
        
        if db["host_type"] == "EC2":
            app_stats[app]["ec2_instances"].add(db["host_instance_id"])
        else:
            app_stats[app]["rds_instances"].add(db["host_instance_id"])
    
    # Convert to list and format
    top_apps = []
    for app, stats in app_stats.items():
        top_apps.append({
            "application": stats["application"],
            "total_databases": stats["total_databases"],
            "database_types": stats["database_types"],
            "ec2_instance_count": len(stats["ec2_instances"]),
            "rds_instance_count": len(stats["rds_instances"]),
            "total_instance_count": len(stats["ec2_instances"]) + len(stats["rds_instances"]),
            "team_count": len(stats["teams"]),
            "teams": list(stats["teams"])
        })
    
    # Sort by total databases and limit
    top_apps.sort(key=lambda x: x["total_databases"], reverse=True)
    
    return {
        "top_applications": top_apps[:limit],
        "total_applications_analyzed": len(top_apps)
    }

@router.get("/cost/summary")
async def get_cost_summary(
    days: int = Query(30, description="Number of days to analyze"),
    application: Optional[str] = Query(None),
    team: Optional[str] = Query(None)
):
    """Get cost summary for specified period"""
    cost_data = data_generator.get_cost_data()
    
    # Filter by date range
    from datetime import datetime, timedelta
    cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    recent_costs = [c for c in cost_data if c["date"] >= cutoff_date]
    
    # Apply filters
    if application:
        recent_costs = [c for c in recent_costs if c["application"] == application]
    if team:
        recent_costs = [c for c in recent_costs if c["team"] == team]
    
    # Calculate summaries
    total_cost = sum(c["cost"] for c in recent_costs)
    
    # Group by application
    app_costs = {}
    team_costs = {}
    service_costs = {}
    
    for cost in recent_costs:
        # By application
        if cost["application"] not in app_costs:
            app_costs[cost["application"]] = 0
        app_costs[cost["application"]] += cost["cost"]
        
        # By team
        if cost["team"] not in team_costs:
            team_costs[cost["team"]] = 0
        team_costs[cost["team"]] += cost["cost"]
        
        # By service type
        if cost["service_type"] not in service_costs:
            service_costs[cost["service_type"]] = 0
        service_costs[cost["service_type"]] += cost["cost"]
    
    return {
        "period_days": days,
        "total_cost": round(total_cost, 2),
        "average_daily_cost": round(total_cost / days, 2),
        "cost_by_application": {k: round(v, 2) for k, v in sorted(app_costs.items(), key=lambda x: x[1], reverse=True)},
        "cost_by_team": {k: round(v, 2) for k, v in sorted(team_costs.items(), key=lambda x: x[1], reverse=True)},
        "cost_by_service": {k: round(v, 2) for k, v in sorted(service_costs.items(), key=lambda x: x[1], reverse=True)},
        "records_analyzed": len(recent_costs)
    }

@router.get("/cost/trends")
async def get_cost_trends(
    days: int = Query(30),
    group_by: str = Query("application", description="Group by: application, team, service_type")
):
    """Get cost trends over time"""
    cost_data = data_generator.get_cost_data()
    
    # Filter by date range
    from datetime import datetime, timedelta
    cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    recent_costs = [c for c in cost_data if c["date"] >= cutoff_date]
    
    # Group by date and specified field
    trends = {}
    for cost in recent_costs:
        date = cost["date"]
        group_key = cost[group_by]
        
        if date not in trends:
            trends[date] = {}
        
        if group_key not in trends[date]:
            trends[date][group_key] = 0
        
        trends[date][group_key] += cost["cost"]
    
    # Format for charting
    formatted_trends = []
    for date, groups in sorted(trends.items()):
        for group_key, cost in groups.items():
            formatted_trends.append({
                "date": date,
                group_by: group_key,
                "cost": round(cost, 2)
            })
    
    return {
        "trends": formatted_trends,
        "group_by": group_by,
        "period_days": days
    }

@router.post("/chat")
async def chat_query(request: dict):
    """Handle chat queries about inventory and costs"""
    query = request.get("query", "")
    context = request.get("context", "")
    resources = request.get("resources", [])
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    try:
        if context == "aws_inventory" and resources:
            # Handle AWS inventory queries with provided resources
            response = await chat_service.process_query(
                query,
                context=context,
                resources=resources
            )
        else:
            # Handle traditional database inventory queries
            response = await chat_service.process_query(
                query, 
                data_generator.get_databases(),
                data_generator.get_ec2_instances(),
                data_generator.get_rds_instances(),
                data_generator.get_cost_data()
            )
        
        return {
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/metadata/applications")
async def get_applications():
    """Get list of all applications"""
    databases = data_generator.get_databases()
    applications = list(set(db["application"] for db in databases))
    return {"applications": sorted(applications)}

@router.get("/metadata/teams")
async def get_teams():
    """Get list of all teams"""
    databases = data_generator.get_databases()
    teams = list(set(db["team"] for db in databases))
    return {"teams": sorted(teams)}

@router.get("/metadata/database-types")
async def get_database_types():
    """Get list of all database types"""
    databases = data_generator.get_databases()
    db_types = list(set(db["database_type"] for db in databases))
    return {"database_types": sorted(db_types)}

@router.get("/inventory/s3")
async def get_s3_buckets(
    application: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    environment: Optional[str] = Query(None)
):
    """Get S3 buckets with optional filtering"""
    # Generate synthetic S3 data for demo
    applications = ["UserAuth", "PaymentProcessor", "OrderManagement", "InventorySystem", "RecommendationEngine"]
    teams = ["Platform", "Commerce", "Analytics", "Infrastructure", "Security"]
    regions = ["us-east-1", "us-west-2", "eu-west-1"]
    environments = ["production", "staging", "development"]
    
    buckets = []
    for i in range(25):
        bucket_app = applications[i % len(applications)]
        bucket_team = teams[i % len(teams)]
        bucket_region = regions[i % len(regions)]
        bucket_env = environments[i % len(environments)]
        
        bucket = {
            "bucket_name": f"{bucket_app.lower()}-{bucket_env}-bucket-{i + 1}",
            "region": bucket_region,
            "application": bucket_app,
            "team": bucket_team,
            "environment": bucket_env,
            "creation_date": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
            "size_gb": round(random.uniform(10, 1000), 2),
            "object_count": random.randint(100, 50000),
            "storage_class": random.choice(["STANDARD", "STANDARD_IA", "GLACIER", "DEEP_ARCHIVE"]),
            "versioning_enabled": random.choice([True, False]),
            "encryption_enabled": random.choice([True, False]),
            "public_access_blocked": random.choice([True, False]),
            "cost_breakdown": {
                "storage_cost_monthly": round(random.uniform(50, 500), 2),
                "request_cost_monthly": round(random.uniform(5, 50), 2),
                "data_transfer_cost_monthly": round(random.uniform(10, 100), 2),
                "total_monthly_cost": 0
            },
            "tags": {
                "Application": bucket_app,
                "Team": bucket_team,
                "Environment": bucket_env,
                "Purpose": random.choice(["backup", "logs", "static-assets", "data-lake"]),
                "CostCenter": f"CC-{bucket_team.upper()[:3]}-{random.randint(100, 999)}",
                "Owner": f"{random.choice(['john', 'jane', 'alex', 'sarah'])}.{random.choice(['smith', 'doe', 'johnson', 'brown'])}@company.com"
            }
        }
        
        # Calculate total cost
        bucket["cost_breakdown"]["total_monthly_cost"] = (
            bucket["cost_breakdown"]["storage_cost_monthly"] +
            bucket["cost_breakdown"]["request_cost_monthly"] +
            bucket["cost_breakdown"]["data_transfer_cost_monthly"]
        )
        
        buckets.append(bucket)
    
    # Apply filters
    if application:
        buckets = [b for b in buckets if b["application"] == application]
    if team:
        buckets = [b for b in buckets if b["team"] == team]
    if region:
        buckets = [b for b in buckets if b["region"] == region]
    if environment:
        buckets = [b for b in buckets if b["environment"] == environment]
    
    return {
        "total_count": len(buckets),
        "buckets": buckets
    }