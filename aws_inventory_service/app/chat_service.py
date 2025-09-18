from typing import List, Dict, Any
import re
import json
from datetime import datetime, timedelta

class ChatService:
    def __init__(self):
        self.query_patterns = {
            "top_applications": [
                r"top\s+(\d+)?\s*applications?",
                r"which applications? have the most databases?",
                r"show me the biggest applications?"
            ],
            "database_count": [
                r"how many (\w+)? ?databases? (?:for|in) (\w+)",
                r"count of (\w+)? ?databases? (?:for|in) (\w+)",
                r"(\w+) database count"
            ],
            "cost_analysis": [
                r"cost (?:for|of) (\w+)",
                r"how much (?:does|is) (\w+) costing?",
                r"spending (?:for|on) (\w+)",
                r"total cost"
            ],
            "resource_usage": [
                r"resource usage (?:for|of) (\w+)",
                r"how many instances? (?:for|of) (\w+)",
                r"ec2 instances? (?:for|of) (\w+)"
            ],
            "team_analysis": [
                r"team (\w+)",
                r"what does team (\w+) have",
                r"(\w+) team resources?"
            ]
        }
    
    async def process_query(self, query: str, databases: List[Dict] = None, ec2_instances: List[Dict] = None, 
                          rds_instances: List[Dict] = None, cost_data: List[Dict] = None, 
                          context: str = None, resources: List[Dict] = None) -> str:
        """Process natural language query and return response"""
        query_lower = query.lower()
        
        # Handle AWS inventory context
        if context == "aws_inventory" and resources:
            return self._handle_aws_inventory_query(query_lower, resources)
        
        # Fallback to original database-focused queries
        if not databases:
            databases = []
        if not ec2_instances:
            ec2_instances = []
        if not rds_instances:
            rds_instances = []
        if not cost_data:
            cost_data = []
        
        # Detect query type and extract parameters
        query_type, params = self._classify_query(query_lower)
        
        if query_type == "top_applications":
            return self._handle_top_applications(databases, params)
        elif query_type == "database_count":
            return self._handle_database_count(databases, params)
        elif query_type == "cost_analysis":
            return self._handle_cost_analysis(cost_data, params)
        elif query_type == "resource_usage":
            return self._handle_resource_usage(databases, ec2_instances, rds_instances, params)
        elif query_type == "team_analysis":
            return self._handle_team_analysis(databases, ec2_instances, rds_instances, cost_data, params)
        else:
            return self._handle_general_query(query, databases, ec2_instances, rds_instances, cost_data)
    
    def _classify_query(self, query: str) -> tuple:
        """Classify the query type and extract parameters"""
        for query_type, patterns in self.query_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, query, re.IGNORECASE)
                if match:
                    return query_type, match.groups()
        
        return "general", ()
    
    def _handle_top_applications(self, databases: List[Dict], params: tuple) -> str:
        """Handle top applications queries"""
        limit = int(params[0]) if params and params[0] and params[0].isdigit() else 5
        
        # Count databases per application
        app_counts = {}
        app_details = {}
        
        for db in databases:
            app = db["application"]
            if app not in app_counts:
                app_counts[app] = 0
                app_details[app] = {
                    "databases": 0,
                    "ec2_instances": set(),
                    "rds_instances": set(),
                    "database_types": set(),
                    "teams": set()
                }
            
            app_counts[app] += 1
            app_details[app]["databases"] += 1
            app_details[app]["database_types"].add(db["database_type"])
            app_details[app]["teams"].add(db["team"])
            
            if db["host_type"] == "EC2":
                app_details[app]["ec2_instances"].add(db["host_instance_id"])
            else:
                app_details[app]["rds_instances"].add(db["host_instance_id"])
        
        # Sort and get top applications
        top_apps = sorted(app_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        response = f"Here are the top {limit} applications by database count:\n\n"
        
        for i, (app, count) in enumerate(top_apps, 1):
            details = app_details[app]
            ec2_count = len(details["ec2_instances"])
            rds_count = len(details["rds_instances"])
            db_types = ", ".join(details["database_types"])
            teams = ", ".join(details["teams"])
            
            response += f"{i}. **{app}**\n"
            response += f"   • {count} databases ({db_types})\n"
            response += f"   • {ec2_count} EC2 instances, {rds_count} RDS instances\n"
            response += f"   • Teams: {teams}\n\n"
        
        return response
    
    def _handle_database_count(self, databases: List[Dict], params: tuple) -> str:
        """Handle database count queries"""
        if len(params) >= 2:
            db_type = params[0] if params[0] else None
            entity = params[1]  # Could be application or team
            
            # Try to match as application first
            filtered_dbs = [db for db in databases if db["application"].lower() == entity.lower()]
            
            if not filtered_dbs:
                # Try as team
                filtered_dbs = [db for db in databases if db["team"].lower() == entity.lower()]
                entity_type = "team"
            else:
                entity_type = "application"
            
            if not filtered_dbs:
                return f"I couldn't find any databases for '{entity}'. Please check the spelling or try a different application/team name."
            
            # Filter by database type if specified
            if db_type and db_type.lower() != "database":
                filtered_dbs = [db for db in filtered_dbs if db_type.lower() in db["database_type"].lower()]
            
            count = len(filtered_dbs)
            db_type_str = f"{db_type} " if db_type and db_type.lower() != "database" else ""
            
            # Get breakdown by database type
            type_counts = {}
            for db in filtered_dbs:
                db_type_name = db["database_type"]
                type_counts[db_type_name] = type_counts.get(db_type_name, 0) + 1
            
            response = f"The {entity_type} '{entity}' has {count} {db_type_str}databases.\n\n"
            
            if type_counts:
                response += "Breakdown by database type:\n"
                for db_type_name, type_count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
                    response += f"• {db_type_name}: {type_count}\n"
            
            return response
        
        return "I need more information. Please specify what you'd like to count (e.g., 'How many PostgreSQL databases for UserAuth?')"
    
    def _handle_cost_analysis(self, cost_data: List[Dict], params: tuple) -> str:
        """Handle cost analysis queries"""
        # Get last 30 days of cost data
        cutoff_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        recent_costs = [c for c in cost_data if c["date"] >= cutoff_date]
        
        if params and params[0]:
            entity = params[0]
            
            # Try to match as application
            app_costs = [c for c in recent_costs if c["application"].lower() == entity.lower()]
            
            if not app_costs:
                # Try as team
                app_costs = [c for c in recent_costs if c["team"].lower() == entity.lower()]
                entity_type = "team"
            else:
                entity_type = "application"
            
            if not app_costs:
                return f"I couldn't find cost data for '{entity}'. Please check the spelling."
            
            total_cost = sum(c["cost"] for c in app_costs)
            daily_avg = total_cost / 30
            
            # Breakdown by service type
            service_costs = {}
            for cost in app_costs:
                service = cost["service_type"]
                service_costs[service] = service_costs.get(service, 0) + cost["cost"]
            
            response = f"Cost analysis for {entity_type} '{entity}' (last 30 days):\n\n"
            response += f"• Total cost: ${total_cost:.2f}\n"
            response += f"• Average daily cost: ${daily_avg:.2f}\n\n"
            
            if service_costs:
                response += "Breakdown by service:\n"
                for service, cost in sorted(service_costs.items(), key=lambda x: x[1], reverse=True):
                    percentage = (cost / total_cost) * 100
                    response += f"• {service}: ${cost:.2f} ({percentage:.1f}%)\n"
            
            return response
        else:
            # Overall cost summary
            total_cost = sum(c["cost"] for c in recent_costs)
            daily_avg = total_cost / 30
            
            # Top applications by cost
            app_costs = {}
            for cost in recent_costs:
                app = cost["application"]
                app_costs[app] = app_costs.get(app, 0) + cost["cost"]
            
            top_apps = sorted(app_costs.items(), key=lambda x: x[1], reverse=True)[:5]
            
            response = f"Overall cost summary (last 30 days):\n\n"
            response += f"• Total cost: ${total_cost:.2f}\n"
            response += f"• Average daily cost: ${daily_avg:.2f}\n\n"
            response += "Top 5 applications by cost:\n"
            
            for i, (app, cost) in enumerate(top_apps, 1):
                percentage = (cost / total_cost) * 100
                response += f"{i}. {app}: ${cost:.2f} ({percentage:.1f}%)\n"
            
            return response
    
    def _handle_resource_usage(self, databases: List[Dict], ec2_instances: List[Dict], 
                             rds_instances: List[Dict], params: tuple) -> str:
        """Handle resource usage queries"""
        if params and params[0]:
            entity = params[0]
            
            # Filter databases
            filtered_dbs = [db for db in databases if db["application"].lower() == entity.lower()]
            
            if not filtered_dbs:
                # Try as team
                filtered_dbs = [db for db in databases if db["team"].lower() == entity.lower()]
                entity_type = "team"
            else:
                entity_type = "application"
            
            if not filtered_dbs:
                return f"I couldn't find resources for '{entity}'. Please check the spelling."
            
            # Count instances
            ec2_instance_ids = set()
            rds_instance_ids = set()
            
            for db in filtered_dbs:
                if db["host_type"] == "EC2":
                    ec2_instance_ids.add(db["host_instance_id"])
                else:
                    rds_instance_ids.add(db["host_instance_id"])
            
            # Get instance details
            ec2_details = [inst for inst in ec2_instances if inst["instance_id"] in ec2_instance_ids]
            rds_details = [inst for inst in rds_instances if inst["db_instance_identifier"] in rds_instance_ids]
            
            # Calculate resource usage
            total_cpu = sum(inst["cpu_utilization"] for inst in ec2_details) / len(ec2_details) if ec2_details else 0
            total_memory = sum(inst["memory_utilization"] for inst in ec2_details) / len(ec2_details) if ec2_details else 0
            
            response = f"Resource usage for {entity_type} '{entity}':\n\n"
            response += f"• Total databases: {len(filtered_dbs)}\n"
            response += f"• EC2 instances: {len(ec2_instance_ids)}\n"
            response += f"• RDS instances: {len(rds_instance_ids)}\n"
            response += f"• Average CPU utilization: {total_cpu:.1f}%\n"
            response += f"• Average memory utilization: {total_memory:.1f}%\n\n"
            
            # Instance type breakdown
            if ec2_details:
                instance_types = {}
                for inst in ec2_details:
                    inst_type = inst["instance_type"]
                    instance_types[inst_type] = instance_types.get(inst_type, 0) + 1
                
                response += "EC2 instance types:\n"
                for inst_type, count in sorted(instance_types.items()):
                    response += f"• {inst_type}: {count}\n"
            
            return response
        
        return "Please specify which application or team you'd like to analyze."
    
    def _handle_team_analysis(self, databases: List[Dict], ec2_instances: List[Dict], 
                            rds_instances: List[Dict], cost_data: List[Dict], params: tuple) -> str:
        """Handle team-specific analysis"""
        if not params or not params[0]:
            return "Please specify which team you'd like to analyze."
        
        team_name = params[0]
        
        # Filter data by team
        team_databases = [db for db in databases if db["team"].lower() == team_name.lower()]
        
        if not team_databases:
            return f"I couldn't find any resources for team '{team_name}'. Please check the spelling."
        
        # Get cost data for the team
        cutoff_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        team_costs = [c for c in cost_data if c["team"].lower() == team_name.lower() and c["date"] >= cutoff_date]
        
        # Calculate statistics
        applications = set(db["application"] for db in team_databases)
        database_types = {}
        ec2_instances_set = set()
        rds_instances_set = set()
        
        for db in team_databases:
            db_type = db["database_type"]
            database_types[db_type] = database_types.get(db_type, 0) + 1
            
            if db["host_type"] == "EC2":
                ec2_instances_set.add(db["host_instance_id"])
            else:
                rds_instances_set.add(db["host_instance_id"])
        
        total_cost = sum(c["cost"] for c in team_costs)
        
        response = f"Analysis for team '{team_name}':\n\n"
        response += f"• Applications managed: {len(applications)}\n"
        response += f"• Total databases: {len(team_databases)}\n"
        response += f"• EC2 instances: {len(ec2_instances_set)}\n"
        response += f"• RDS instances: {len(rds_instances_set)}\n"
        response += f"• Monthly cost: ${total_cost:.2f}\n\n"
        
        response += "Applications:\n"
        for app in sorted(applications):
            app_db_count = len([db for db in team_databases if db["application"] == app])
            response += f"• {app}: {app_db_count} databases\n"
        
        response += "\nDatabase types:\n"
        for db_type, count in sorted(database_types.items(), key=lambda x: x[1], reverse=True):
            response += f"• {db_type}: {count}\n"
        
        return response
    
    def _handle_general_query(self, query: str, databases: List[Dict], ec2_instances: List[Dict], 
                            rds_instances: List[Dict], cost_data: List[Dict]) -> str:
        """Handle general queries with basic statistics"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["overview", "summary", "total monthly", "total spending", "monthly spending", "total cost"]):
            total_databases = len(databases)
            total_ec2 = len(set(db["host_instance_id"] for db in databases if db["host_type"] == "EC2"))
            total_rds = len(set(db["host_instance_id"] for db in databases if db["host_type"] == "RDS"))
            total_applications = len(set(db["application"] for db in databases))
            total_teams = len(set(db["team"] for db in databases))
            
            # Recent costs
            cutoff_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            recent_costs = [c for c in cost_data if c["date"] >= cutoff_date]
            total_monthly_cost = sum(c["cost"] for c in recent_costs)
            
            if "cost" in query_lower or "spending" in query_lower:
                response = f"💰 **Monthly Spending Overview**\n\n"
                response += f"• **Total monthly cost**: ${total_monthly_cost:.2f}\n"
                response += f"• **Average daily cost**: ${total_monthly_cost/30:.2f}\n\n"
                
                # Top cost applications
                app_costs = {}
                for cost in recent_costs:
                    app = cost["application"]
                    app_costs[app] = app_costs.get(app, 0) + cost["cost"]
                
                top_apps = sorted(app_costs.items(), key=lambda x: x[1], reverse=True)[:5]
                response += "**Top 5 applications by cost:**\n"
                for i, (app, cost) in enumerate(top_apps, 1):
                    percentage = (cost / total_monthly_cost) * 100
                    response += f"{i}. {app}: ${cost:.2f} ({percentage:.1f}%)\n"
            else:
                response = "📊 **Infrastructure Overview**\n\n"
                response += f"• **Total databases**: {total_databases}\n"
                response += f"• **EC2 instances**: {total_ec2}\n"
                response += f"• **RDS instances**: {total_rds}\n"
                response += f"• **Applications**: {total_applications}\n"
                response += f"• **Teams**: {total_teams}\n"
                response += f"• **Monthly cost**: ${total_monthly_cost:.2f}\n"
            
            return response
        
        return "I can help you with queries about:\n• Top applications by database count\n• Database counts for specific applications or teams\n• Cost analysis\n• Resource usage\n• Team analysis\n\nTry asking something like 'Show me the top 5 applications' or 'How much is UserAuth costing?'"
    
    def _handle_aws_inventory_query(self, query: str, resources: List[Dict]) -> str:
        """Handle AWS inventory-specific queries"""
        
        if any(word in query for word in ["cost", "expensive", "spending", "budget"]):
            return self._handle_aws_cost_query(query, resources)
        elif any(word in query for word in ["ec2", "instance", "compute"]):
            return self._handle_aws_ec2_query(query, resources)
        elif any(word in query for word in ["rds", "database", "db"]):
            return self._handle_aws_rds_query(query, resources)
        elif any(word in query for word in ["s3", "bucket", "storage"]):
            return self._handle_aws_s3_query(query, resources)
        elif any(word in query for word in ["project", "application", "app"]):
            return self._handle_aws_project_query(query, resources)
        elif any(word in query for word in ["team", "owner"]):
            return self._handle_aws_team_query(query, resources)
        elif any(word in query for word in ["region", "location", "where"]):
            return self._handle_aws_region_query(query, resources)
        elif any(word in query for word in ["optimize", "underutilized", "waste"]):
            return self._handle_aws_optimization_query(query, resources)
        elif any(word in query for word in ["tag", "tagging", "compliance"]):
            return self._handle_aws_tagging_query(query, resources)
        else:
            return self._handle_aws_overview_query(query, resources)
    
    def _handle_aws_cost_query(self, query: str, resources: List[Dict]) -> str:
        """Handle AWS cost-related queries"""
        total_cost = sum(r.get('cost_monthly', 0) for r in resources)
        
        if "top" in query or "most expensive" in query:
            # Sort by cost and get top projects
            project_costs = {}
            for resource in resources:
                key = f"{resource.get('application', 'Unknown')}-{resource.get('team', 'Unknown')}"
                project_costs[key] = project_costs.get(key, 0) + resource.get('cost_monthly', 0)
            
            top_projects = sorted(project_costs.items(), key=lambda x: x[1], reverse=True)[:5]
            
            response = f"💰 **Top 5 Projects by Monthly Cost** (Total: ${total_cost:,.2f})\n\n"
            for i, (project, cost) in enumerate(top_projects, 1):
                percentage = (cost / total_cost) * 100 if total_cost > 0 else 0
                response += f"{i}. **{project.replace('-', ' - ')}**: ${cost:,.2f} ({percentage:.1f}%)\n"
            
            return response
        
        elif any(service in query for service in ["ec2", "rds", "s3"]):
            # Cost by service type
            service_costs = {}
            for resource in resources:
                service = resource.get('type', 'Unknown')
                service_costs[service] = service_costs.get(service, 0) + resource.get('cost_monthly', 0)
            
            response = f"💰 **Monthly Cost by Service** (Total: ${total_cost:,.2f})\n\n"
            for service, cost in sorted(service_costs.items(), key=lambda x: x[1], reverse=True):
                percentage = (cost / total_cost) * 100 if total_cost > 0 else 0
                response += f"• **{service}**: ${cost:,.2f} ({percentage:.1f}%)\n"
            
            return response
        
        else:
            # General cost overview
            avg_cost = total_cost / len(resources) if resources else 0
            
            response = f"💰 **Cost Overview**\n\n"
            response += f"• **Total monthly cost**: ${total_cost:,.2f}\n"
            response += f"• **Average cost per resource**: ${avg_cost:,.2f}\n"
            response += f"• **Total resources**: {len(resources)}\n\n"
            
            # Cost by environment
            env_costs = {}
            for resource in resources:
                env = resource.get('environment', 'Unknown')
                env_costs[env] = env_costs.get(env, 0) + resource.get('cost_monthly', 0)
            
            response += "**Cost by Environment:**\n"
            for env, cost in sorted(env_costs.items(), key=lambda x: x[1], reverse=True):
                percentage = (cost / total_cost) * 100 if total_cost > 0 else 0
                response += f"• {env}: ${cost:,.2f} ({percentage:.1f}%)\n"
            
            return response
    
    def _handle_aws_ec2_query(self, query: str, resources: List[Dict]) -> str:
        """Handle EC2-specific queries"""
        ec2_resources = [r for r in resources if r.get('type') == 'EC2']
        
        if not ec2_resources:
            return "❌ No EC2 instances found in the current data."
        
        if "environment" in query or "production" in query or "staging" in query:
            env_counts = {}
            env_costs = {}
            for resource in ec2_resources:
                env = resource.get('environment', 'Unknown')
                env_counts[env] = env_counts.get(env, 0) + 1
                env_costs[env] = env_costs.get(env, 0) + resource.get('cost_monthly', 0)
            
            response = f"🖥️ **EC2 Instances by Environment** (Total: {len(ec2_resources)})\n\n"
            for env in sorted(env_counts.keys()):
                response += f"• **{env}**: {env_counts[env]} instances, ${env_costs[env]:,.2f}/month\n"
            
            return response
        
        else:
            # General EC2 overview
            total_cost = sum(r.get('cost_monthly', 0) for r in ec2_resources)
            
            # Instance types
            instance_types = {}
            for resource in ec2_resources:
                inst_type = resource.get('specifications', {}).get('instance_type', 'Unknown')
                instance_types[inst_type] = instance_types.get(inst_type, 0) + 1
            
            response = f"🖥️ **EC2 Overview**\n\n"
            response += f"• **Total instances**: {len(ec2_resources)}\n"
            response += f"• **Monthly cost**: ${total_cost:,.2f}\n"
            response += f"• **Average cost per instance**: ${total_cost/len(ec2_resources):,.2f}\n\n"
            
            response += "**Top Instance Types:**\n"
            for inst_type, count in sorted(instance_types.items(), key=lambda x: x[1], reverse=True)[:5]:
                response += f"• {inst_type}: {count} instances\n"
            
            return response
    
    def _handle_aws_rds_query(self, query: str, resources: List[Dict]) -> str:
        """Handle RDS-specific queries"""
        rds_resources = [r for r in resources if r.get('type') == 'RDS']
        
        if not rds_resources:
            return "❌ No RDS instances found in the current data."
        
        if "engine" in query or "type" in query:
            engines = {}
            engine_costs = {}
            for resource in rds_resources:
                engine = resource.get('specifications', {}).get('engine', 'Unknown')
                engines[engine] = engines.get(engine, 0) + 1
                engine_costs[engine] = engine_costs.get(engine, 0) + resource.get('cost_monthly', 0)
            
            response = f"🗄️ **RDS Databases by Engine** (Total: {len(rds_resources)})\n\n"
            for engine in sorted(engines.keys()):
                response += f"• **{engine}**: {engines[engine]} instances, ${engine_costs[engine]:,.2f}/month\n"
            
            return response
        
        else:
            # General RDS overview
            total_cost = sum(r.get('cost_monthly', 0) for r in resources if r.get('type') == 'RDS')
            
            response = f"🗄️ **RDS Overview**\n\n"
            response += f"• **Total databases**: {len(rds_resources)}\n"
            response += f"• **Monthly cost**: ${total_cost:,.2f}\n"
            response += f"• **Average cost per database**: ${total_cost/len(rds_resources):,.2f}\n\n"
            
            # Engines breakdown
            engines = {}
            for resource in rds_resources:
                engine = resource.get('specifications', {}).get('engine', 'Unknown')
                engines[engine] = engines.get(engine, 0) + 1
            
            response += "**Database Engines:**\n"
            for engine, count in sorted(engines.items(), key=lambda x: x[1], reverse=True):
                response += f"• {engine}: {count} instances\n"
            
            return response
    
    def _handle_aws_s3_query(self, query: str, resources: List[Dict]) -> str:
        """Handle S3-specific queries"""
        s3_resources = [r for r in resources if r.get('type') == 'S3']
        
        if not s3_resources:
            return "❌ No S3 buckets found in the current data."
        
        total_cost = sum(r.get('cost_monthly', 0) for r in s3_resources)
        total_storage = sum(r.get('specifications', {}).get('bucket_size_gb', 0) for r in s3_resources)
        
        if "team" in query or "usage" in query:
            team_usage = {}
            team_costs = {}
            for resource in s3_resources:
                team = resource.get('team', 'Unknown')
                team_usage[team] = team_usage.get(team, 0) + resource.get('specifications', {}).get('bucket_size_gb', 0)
                team_costs[team] = team_costs.get(team, 0) + resource.get('cost_monthly', 0)
            
            response = f"📦 **S3 Usage by Team** (Total: {total_storage:,.0f} GB)\n\n"
            for team in sorted(team_usage.keys(), key=lambda x: team_usage[x], reverse=True):
                response += f"• **{team}**: {team_usage[team]:,.0f} GB, ${team_costs[team]:,.2f}/month\n"
            
            return response
        
        else:
            response = f"📦 **S3 Overview**\n\n"
            response += f"• **Total buckets**: {len(s3_resources)}\n"
            response += f"• **Total storage**: {total_storage:,.0f} GB\n"
            response += f"• **Monthly cost**: ${total_cost:,.2f}\n"
            response += f"• **Average cost per bucket**: ${total_cost/len(s3_resources):,.2f}\n"
            
            return response
    
    def _handle_aws_project_query(self, query: str, resources: List[Dict]) -> str:
        """Handle project/application queries"""
        if "top" in query:
            limit = 5
            if "10" in query:
                limit = 10
            elif "3" in query:
                limit = 3
            
            project_stats = {}
            for resource in resources:
                project = resource.get('application', 'Unknown')
                if project not in project_stats:
                    project_stats[project] = {
                        'count': 0,
                        'cost': 0,
                        'ec2': 0,
                        'rds': 0,
                        's3': 0,
                        'team': resource.get('team', 'Unknown')
                    }
                
                project_stats[project]['count'] += 1
                project_stats[project]['cost'] += resource.get('cost_monthly', 0)
                project_stats[project][resource.get('type', '').lower()] += 1
            
            top_projects = sorted(project_stats.items(), key=lambda x: x[1]['cost'], reverse=True)[:limit]
            
            response = f"🏆 **Top {limit} Projects by Cost**\n\n"
            for i, (project, stats) in enumerate(top_projects, 1):
                response += f"{i}. **{project}** (Team: {stats['team']})\n"
                response += f"   • Cost: ${stats['cost']:,.2f}/month\n"
                response += f"   • Resources: {stats['count']} (EC2: {stats['ec2']}, RDS: {stats['rds']}, S3: {stats['s3']})\n\n"
            
            return response
        
        else:
            # General project overview
            projects = set(r.get('application', 'Unknown') for r in resources)
            
            response = f"🏗️ **Project Overview**\n\n"
            response += f"• **Total projects**: {len(projects)}\n"
            response += f"• **Total resources**: {len(resources)}\n"
            response += f"• **Average resources per project**: {len(resources)/len(projects):.1f}\n"
            
            return response
    
    def _handle_aws_team_query(self, query: str, resources: List[Dict]) -> str:
        """Handle team-specific queries"""
        team_stats = {}
        for resource in resources:
            team = resource.get('team', 'Unknown')
            if team not in team_stats:
                team_stats[team] = {
                    'count': 0,
                    'cost': 0,
                    'applications': set(),
                    'ec2': 0,
                    'rds': 0,
                    's3': 0
                }
            
            team_stats[team]['count'] += 1
            team_stats[team]['cost'] += resource.get('cost_monthly', 0)
            team_stats[team]['applications'].add(resource.get('application', 'Unknown'))
            team_stats[team][resource.get('type', '').lower()] += 1
        
        response = f"👥 **Team Analysis**\n\n"
        for team, stats in sorted(team_stats.items(), key=lambda x: x[1]['cost'], reverse=True):
            response += f"**{team} Team:**\n"
            response += f"• Cost: ${stats['cost']:,.2f}/month\n"
            response += f"• Resources: {stats['count']} (EC2: {stats['ec2']}, RDS: {stats['rds']}, S3: {stats['s3']})\n"
            response += f"• Applications: {len(stats['applications'])}\n\n"
        
        return response
    
    def _handle_aws_region_query(self, query: str, resources: List[Dict]) -> str:
        """Handle region-specific queries"""
        region_stats = {}
        for resource in resources:
            region = resource.get('region', 'Unknown')
            if region not in region_stats:
                region_stats[region] = {'count': 0, 'cost': 0, 'ec2': 0, 'rds': 0, 's3': 0}
            
            region_stats[region]['count'] += 1
            region_stats[region]['cost'] += resource.get('cost_monthly', 0)
            region_stats[region][resource.get('type', '').lower()] += 1
        
        response = f"🌍 **Regional Distribution**\n\n"
        for region, stats in sorted(region_stats.items(), key=lambda x: x[1]['cost'], reverse=True):
            response += f"**{region}:**\n"
            response += f"• Resources: {stats['count']} (EC2: {stats['ec2']}, RDS: {stats['rds']}, S3: {stats['s3']})\n"
            response += f"• Monthly cost: ${stats['cost']:,.2f}\n\n"
        
        return response
    
    def _handle_aws_optimization_query(self, query: str, resources: List[Dict]) -> str:
        """Handle optimization queries"""
        # Simple optimization suggestions based on cost patterns
        total_cost = sum(r.get('cost_monthly', 0) for r in resources)
        
        # Find high-cost, low-utilization resources (simulated)
        optimization_opportunities = []
        
        for resource in resources:
            cost = resource.get('cost_monthly', 0)
            if cost > total_cost / len(resources) * 2:  # Above average cost
                optimization_opportunities.append({
                    'resource': resource.get('name', 'Unknown'),
                    'type': resource.get('type', 'Unknown'),
                    'cost': cost,
                    'suggestion': 'Consider right-sizing or reviewing utilization'
                })
        
        response = f"⚡ **Optimization Opportunities**\n\n"
        response += f"• **Potential monthly savings**: ${sum(o['cost'] * 0.3 for o in optimization_opportunities[:5]):,.2f}\n"
        response += f"• **Resources to review**: {len(optimization_opportunities)}\n\n"
        
        response += "**Top Optimization Candidates:**\n"
        for i, opp in enumerate(optimization_opportunities[:5], 1):
            response += f"{i}. **{opp['resource']}** ({opp['type']})\n"
            response += f"   • Current cost: ${opp['cost']:,.2f}/month\n"
            response += f"   • Suggestion: {opp['suggestion']}\n\n"
        
        return response
    
    def _handle_aws_tagging_query(self, query: str, resources: List[Dict]) -> str:
        """Handle tagging compliance queries"""
        required_tags = ['Application', 'Team', 'Environment', 'Owner']
        
        missing_tags = {}
        total_resources = len(resources)
        
        for resource in resources:
            tags = resource.get('tags', {})
            for required_tag in required_tags:
                if required_tag not in tags or not tags[required_tag]:
                    if required_tag not in missing_tags:
                        missing_tags[required_tag] = 0
                    missing_tags[required_tag] += 1
        
        response = f"🏷️ **Tagging Compliance Report**\n\n"
        response += f"• **Total resources**: {total_resources}\n\n"
        
        response += "**Tag Compliance:**\n"
        for tag in required_tags:
            missing_count = missing_tags.get(tag, 0)
            compliance_rate = ((total_resources - missing_count) / total_resources) * 100
            response += f"• **{tag}**: {compliance_rate:.1f}% compliant ({missing_count} missing)\n"
        
        if missing_tags:
            response += f"\n**Action Required**: {sum(missing_tags.values())} tag updates needed for full compliance.\n"
        else:
            response += f"\n✅ **All resources are properly tagged!**\n"
        
        return response
    
    def _handle_aws_overview_query(self, query: str, resources: List[Dict]) -> str:
        """Handle general overview queries"""
        total_cost = sum(r.get('cost_monthly', 0) for r in resources)
        
        # Resource type breakdown
        type_counts = {}
        type_costs = {}
        for resource in resources:
            res_type = resource.get('type', 'Unknown')
            type_counts[res_type] = type_counts.get(res_type, 0) + 1
            type_costs[res_type] = type_costs.get(res_type, 0) + resource.get('cost_monthly', 0)
        
        # Environment breakdown
        env_counts = {}
        for resource in resources:
            env = resource.get('environment', 'Unknown')
            env_counts[env] = env_counts.get(env, 0) + 1
        
        response = f"📊 **AWS Infrastructure Overview**\n\n"
        response += f"• **Total resources**: {len(resources)}\n"
        response += f"• **Monthly cost**: ${total_cost:,.2f}\n"
        response += f"• **Projects**: {len(set(r.get('application', 'Unknown') for r in resources))}\n"
        response += f"• **Teams**: {len(set(r.get('team', 'Unknown') for r in resources))}\n"
        response += f"• **Regions**: {len(set(r.get('region', 'Unknown') for r in resources))}\n\n"
        
        response += "**Resources by Type:**\n"
        for res_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            cost = type_costs.get(res_type, 0)
            response += f"• {res_type}: {count} resources, ${cost:,.2f}/month\n"
        
        response += "\n**Resources by Environment:**\n"
        for env, count in sorted(env_counts.items(), key=lambda x: x[1], reverse=True):
            response += f"• {env}: {count} resources\n"
        
        return response