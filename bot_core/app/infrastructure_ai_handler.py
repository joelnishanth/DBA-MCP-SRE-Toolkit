from typing import Dict, Any, List
import json
from claude_api import get_claude_response

class InfrastructureAIHandler:
    """Specialized AI handler for Infrastructure Management contexts"""
    
    def __init__(self):
        self.context_prompts = {
            "executive": {
                "system": "You are an AI Executive Assistant specializing in infrastructure cost analysis and strategic insights. Provide high-level, business-focused responses with actionable recommendations.",
                "capabilities": [
                    "Cost trend analysis and forecasting",
                    "Strategic infrastructure recommendations", 
                    "Executive-level insights and summaries",
                    "ROI analysis and business impact assessment"
                ]
            },
            "inventory": {
                "system": "You are an AI AWS Infrastructure Inventory Specialist. Help users find, analyze, and optimize their AWS resources including EC2, RDS, and S3 with detailed technical insights and cost optimization recommendations.",
                "capabilities": [
                    "AWS resource search and filtering across EC2, RDS, and S3",
                    "Multi-cloud configuration analysis and recommendations",
                    "Capacity planning and auto-scaling advice",
                    "Resource health, performance, and cost optimization insights",
                    "Application and team resource allocation analysis"
                ]
            },
            "cost": {
                "system": "You are an AI Cost Analysis Expert. Provide detailed cost breakdowns, identify savings opportunities, and predict future spending patterns.",
                "capabilities": [
                    "Cost breakdown and analysis",
                    "Budget forecasting and planning",
                    "Cost optimization recommendations",
                    "Spending anomaly detection"
                ]
            },
            "chargeback": {
                "system": "You are an AI Chargeback Specialist. Help allocate costs fairly across teams and applications, and optimize billing models.",
                "capabilities": [
                    "Fair cost allocation strategies",
                    "Team usage pattern analysis",
                    "Billing model optimization",
                    "Chargeback dispute resolution"
                ]
            },
            "optimization": {
                "system": "You are an AI Infrastructure Optimization Expert. Analyze resource utilization and provide specific optimization recommendations.",
                "capabilities": [
                    "Resource utilization analysis",
                    "Right-sizing recommendations",
                    "Performance optimization strategies",
                    "Automated optimization scripting"
                ]
            }
        }
    
    async def process_query(self, query: str, context: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process infrastructure management queries with context-aware AI"""
        
        if context not in self.context_prompts:
            return {"error": f"Unknown context: {context}"}
        
        context_config = self.context_prompts[context]
        
        # Build context-specific prompt
        prompt = self._build_context_prompt(query, context, data, context_config)
        
        try:
            # Get AI response
            response = await get_claude_response(prompt)
            
            # Parse response for actions
            actions = self._extract_actions(response, context)
            
            return {
                "response": response,
                "context": context,
                "actions": actions,
                "capabilities": context_config["capabilities"]
            }
            
        except Exception as e:
            # Use fallback response when Claude is unavailable
            fallback_response = self._get_intelligent_fallback(query, context, data)
            return {
                "response": fallback_response,
                "context": context,
                "actions": [],
                "capabilities": context_config["capabilities"],
                "note": "AI service temporarily unavailable - using intelligent fallback"
            }
    
    def _build_context_prompt(self, query: str, context: str, data: Dict[str, Any], context_config: Dict[str, Any]) -> str:
        """Build context-specific prompt for AI"""
        
        system_prompt = context_config["system"]
        capabilities = context_config["capabilities"]
        
        # Format data for context
        data_summary = self._format_data_for_context(data, context)
        
        # Add specific AWS inventory guidance
        aws_guidance = ""
        if context == "inventory" and ("resources" in str(data) or "resourceCounts" in str(data)):
            aws_guidance = """
AWS-Specific Guidance:
• Analyze EC2, RDS, and S3 resources comprehensively across applications and teams
• Identify cost optimization opportunities (right-sizing, reserved instances, unused resources)
• Look for resource utilization patterns, inefficiencies, and consolidation opportunities
• Provide specific, actionable recommendations with estimated cost savings
• Consider security and compliance best practices (tagging, access controls)
• Analyze resource distribution patterns and suggest rebalancing strategies
• Recommend automation opportunities for resource management
• Identify potential single points of failure or availability improvements
• Suggest monitoring and alerting improvements for better visibility
"""
        
        prompt = f"""
{system_prompt}

Your capabilities include:
{chr(10).join(f"• {cap}" for cap in capabilities)}

{aws_guidance}

Current Infrastructure Data:
{data_summary}

User Query: {query}

Instructions:
1. Provide a helpful, context-appropriate response with specific insights
2. Use the provided data to give concrete examples and numbers
3. If suggesting actions, format them as [ACTION: action_name | params]
4. Keep responses concise but informative (aim for 3-5 key points)
5. Use business language for executive context, technical language for others
6. Include cost implications when relevant
7. Suggest specific next steps or optimizations when appropriate

Response:"""
        
        return prompt
    
    def _format_data_for_context(self, data: Dict[str, Any], context: str) -> str:
        """Format data appropriately for each context"""
        
        if not data:
            return "No data available"
        
        if context == "executive":
            return self._format_executive_data(data)
        elif context == "inventory":
            return self._format_inventory_data(data)
        elif context == "cost":
            return self._format_cost_data(data)
        elif context == "chargeback":
            return self._format_chargeback_data(data)
        elif context == "optimization":
            return self._format_optimization_data(data)
        else:
            return json.dumps(data, indent=2)[:1000]  # Truncate if too long
    
    def _format_executive_data(self, data: Dict[str, Any]) -> str:
        """Format data for executive context"""
        if "key_metrics" in data:
            metrics = data["key_metrics"]
            return f"""
Executive Summary:
• Total Databases: {metrics.get('total_databases', 'N/A')}
• Total Applications: {metrics.get('total_applications', 'N/A')}
• Monthly Cost: ${metrics.get('monthly_cost', 0):,.2f}
• Annual Projection: ${metrics.get('annual_projection', 0):,.2f}
• Teams: {metrics.get('total_teams', 'N/A')}
"""
        return str(data)[:500]
    
    def _format_inventory_data(self, data: Any) -> str:
        """Format data for inventory context"""
        # Handle enhanced MCP data
        if isinstance(data, dict) and "mcp_inventory" in data:
            mcp_data = data["mcp_inventory"]
            cost_data = data.get("mcp_cost_summary", {})
            exec_data = data.get("mcp_executive_summary", {})
            
            # Format comprehensive infrastructure summary
            summary = "📊 **Comprehensive Infrastructure Analysis**\n\n"
            
            # Executive metrics
            if exec_data and "key_metrics" in exec_data:
                metrics = exec_data["key_metrics"]
                summary += f"""**Executive Overview:**
• Total Databases: {metrics.get('total_databases', 'N/A')}
• Total Applications: {metrics.get('total_applications', 'N/A')}
• Total Teams: {metrics.get('total_teams', 'N/A')}
• Monthly Cost: ${metrics.get('monthly_cost', 0):,.2f}
• Annual Projection: ${metrics.get('annual_projection', 0):,.2f}

"""
            
            # Cost breakdown
            if cost_data:
                summary += f"""**Cost Analysis:**
• Total Monthly Cost: ${cost_data.get('total_cost', 0):,.2f}
• Average Daily Cost: ${cost_data.get('average_daily_cost', 0):,.2f}
• Records Analyzed: {cost_data.get('records_analyzed', 0)}

"""
                
                # Top cost drivers
                if "cost_by_application" in cost_data:
                    top_apps = list(cost_data["cost_by_application"].items())[:3]
                    summary += "**Top Cost Applications:**\n"
                    for app, cost in top_apps:
                        summary += f"• {app}: ${cost:,.2f}/month\n"
                    summary += "\n"
            
            # Resource details from frontend
            if "resources" in data:
                resources = data["resources"]
                summary += f"""**Current Resources:**
• Total Resources: {len(resources)}
• EC2 Instances: {data.get('resourceCounts', {}).get('ec2', 0)}
• RDS Databases: {data.get('resourceCounts', {}).get('rds', 0)}
• S3 Buckets: {data.get('resourceCounts', {}).get('s3', 0)}

"""
                
                # Performance insights from rich data
                if resources:
                    high_cost_resources = [r for r in resources if r.get('cost_monthly', 0) > 500]
                    if high_cost_resources:
                        summary += f"**High-Cost Resources ({len(high_cost_resources)}):**\n"
                        for resource in high_cost_resources[:3]:
                            summary += f"• {resource.get('type', 'Unknown')} - {resource.get('application', 'Unknown')}: ${resource.get('cost_monthly', 0):,.2f}/month\n"
                        summary += "\n"
            
            return summary
        
        # Handle AWS inventory data structure (fallback)
        if isinstance(data, dict):
            if "key_metrics" in data:
                # Executive summary data
                metrics = data["key_metrics"]
                return f"""
AWS Infrastructure Summary:
• Total Databases: {metrics.get('total_databases', 'N/A')}
• Total Applications: {metrics.get('total_applications', 'N/A')}
• Total Teams: {metrics.get('total_teams', 'N/A')}
• Monthly Cost: ${metrics.get('monthly_cost', 0):,.2f}
• Top Applications: {', '.join([app.get('application', 'Unknown') for app in data.get('top_applications', [])[:3]])}
"""
            elif "total_count" in data:
                # Direct inventory data
                return f"""
Resource Inventory:
• Total Resources: {data.get('total_count', 0)}
• Resource Types: {', '.join(set(item.get('type', 'Unknown') for item in data.get('instances', []) + data.get('databases', []) + data.get('buckets', [])))}
"""
        
        # Handle list of resources (AWS inventory format)
        if isinstance(data, list) and data:
            total_resources = len(data)
            apps = set(item.get('application', 'Unknown') for item in data)
            resource_types = set(item.get('type', 'Unknown') for item in data)
            teams = set(item.get('team', 'Unknown') for item in data)
            
            return f"""
AWS Resource Inventory:
• Total Resources: {total_resources}
• Applications: {len(apps)} ({', '.join(list(apps)[:5])}{'...' if len(apps) > 5 else ''})
• Resource Types: {', '.join(resource_types)}
• Teams: {len(teams)}
• Total Monthly Cost: ${sum(item.get('cost_monthly', 0) for item in data):,.2f}
"""
        
        return str(data)[:500]
    
    def _format_cost_data(self, data: Any) -> str:
        """Format data for cost context"""
        # Handle AWS inventory cost data
        if isinstance(data, dict):
            if "key_metrics" in data:
                # Executive summary format
                metrics = data["key_metrics"]
                cost_breakdown = data.get("cost_breakdown", {})
                return f"""
Cost Analysis Summary:
• Monthly Cost: ${metrics.get('monthly_cost', 0):,.2f}
• Daily Cost: ${metrics.get('daily_cost', 0):,.2f}
• Annual Projection: ${metrics.get('annual_projection', 0):,.2f}
• Top Applications by Cost: {', '.join(list(cost_breakdown.get('by_application', {}).keys())[:3])}
• Top Teams by Cost: {', '.join(list(cost_breakdown.get('by_team', {}).keys())[:3])}
"""
            elif "total_cost" in data:
                # Direct cost data
                return f"""
Cost Analysis Summary:
• Total Cost: ${data.get('total_cost', 0):,.2f}
• Average Daily Cost: ${data.get('average_daily_cost', 0):,.2f}
• Period: {data.get('period_days', 'N/A')} days
• Top Cost Drivers: {', '.join(list(data.get('cost_by_application', {}).keys())[:3])}
"""
        
        # Handle list of resources with cost data
        if isinstance(data, list) and data:
            total_cost = sum(item.get('cost_monthly', 0) for item in data)
            apps = {}
            for item in data:
                app = item.get('application', 'Unknown')
                apps[app] = apps.get(app, 0) + item.get('cost_monthly', 0)
            
            top_apps = sorted(apps.items(), key=lambda x: x[1], reverse=True)[:3]
            
            return f"""
Resource Cost Summary:
• Total Monthly Cost: ${total_cost:,.2f}
• Total Resources: {len(data)}
• Average Cost per Resource: ${total_cost/len(data):,.2f}
• Top Cost Applications: {', '.join([f"{app} (${cost:,.0f})" for app, cost in top_apps])}
"""
        
        return str(data)[:500]
    
    def _format_chargeback_data(self, data: Dict[str, Any]) -> str:
        """Format data for chargeback context"""
        if "cost_data" in data:
            cost_data = data["cost_data"]
            return f"""
Chargeback Summary:
• Total Cost: ${cost_data.get('total_cost', 0):,.2f}
• Period: {data.get('period_days', 'N/A')} days
• Team: {data.get('team', 'All Teams')}
• Report Type: {data.get('report_type', 'N/A')}
"""
        return str(data)[:500]
    
    def _format_optimization_data(self, data: Dict[str, Any]) -> str:
        """Format data for optimization context"""
        if "total_recommendations" in data:
            return f"""
Optimization Summary:
• Total Recommendations: {data.get('total_recommendations', 0)}
• High Priority: {len([r for r in data.get('recommendations', []) if r.get('priority') == 'high'])}
• Potential Savings: ${data.get('potential_savings', 0):,.2f}
"""
        return str(data)[:500]
    
    def _extract_actions(self, response: str, context: str) -> List[Dict[str, Any]]:
        """Extract suggested actions from AI response"""
        actions = []
        
        # Look for action patterns in response
        import re
        action_pattern = r'\[ACTION:\s*([^|]+)\s*\|\s*([^\]]+)\]'
        matches = re.findall(action_pattern, response)
        
        for action_name, params in matches:
            actions.append({
                "action": action_name.strip(),
                "params": params.strip(),
                "context": context
            })
        
        return actions
    
    def _get_intelligent_fallback(self, query: str, context: str, data: Dict[str, Any]) -> str:
        """Provide intelligent fallback response when AI fails"""
        query_lower = query.lower()
        
        if context == "executive":
            return self._executive_fallback(query_lower, data)
        elif context == "inventory":
            return self._inventory_fallback(query_lower, data)
        elif context == "optimization":
            return self._optimization_fallback(query_lower, data)
        elif context == "chargeback":
            return self._chargeback_fallback(query_lower, data)
        else:
            return self._get_fallback_response(query, context)
    
    def _executive_fallback(self, query: str, data: Dict[str, Any]) -> str:
        """Executive context fallback with data analysis"""
        if "cost" in query or "spend" in query or "budget" in query:
            if data and "key_metrics" in data:
                metrics = data["key_metrics"]
                monthly_cost = metrics.get("monthly_cost", 0)
                annual_projection = metrics.get("annual_projection", 0)
                return f"""📊 **Cost Overview** (AI service temporarily unavailable)

Based on current data:
• Monthly infrastructure cost: ${monthly_cost:,.2f}
• Annual projection: ${annual_projection:,.2f}
• Total databases: {metrics.get('total_databases', 'N/A')}
• Applications: {metrics.get('total_applications', 'N/A')}

**Key Insights:**
• Average cost per database: ${monthly_cost/max(metrics.get('total_databases', 1), 1):,.2f}/month
• Cost growth trend analysis requires historical data
• Consider optimization opportunities for high-cost applications

*Full AI analysis will be available when service is restored.*"""
        
        return "I can provide executive insights about costs, trends, and strategic recommendations. Please ask about specific metrics or areas of interest."
    
    def _inventory_fallback(self, query: str, data: Dict[str, Any]) -> str:
        """Inventory context fallback with AWS resource analysis"""
        if any(term in query for term in ["ec2", "instance", "compute"]):
            if data and "resourceCounts" in data:
                ec2_count = data["resourceCounts"].get("ec2", 0)
                total_cost = data.get("totalCost", 0)
                return f"""🖥️ **EC2 Analysis** (AI service temporarily unavailable)

Current EC2 Infrastructure:
• Total EC2 instances: {ec2_count}
• Estimated monthly cost: ${total_cost * 0.4:,.2f} (assuming 40% of total)

**Common Optimization Opportunities:**
• Review instances with <20% CPU utilization for downsizing
• Consider Reserved Instances for steady-state workloads (up to 75% savings)
• Evaluate Spot Instances for fault-tolerant workloads (up to 90% savings)
• Implement auto-scaling to match demand patterns
• Review instance families for better price/performance ratios

*Full AI-powered analysis will be available when service is restored.*"""
        
        elif any(term in query for term in ["rds", "database", "db"]):
            if data and "resourceCounts" in data:
                rds_count = data["resourceCounts"].get("rds", 0)
                return f"""🗄️ **RDS Analysis** (AI service temporarily unavailable)

Current RDS Infrastructure:
• Total RDS instances: {rds_count}

**Common Optimization Areas:**
• Right-size instances based on CPU/memory utilization
• Consider Aurora Serverless for variable workloads
• Implement read replicas for read-heavy applications
• Review backup retention policies and storage costs
• Evaluate Multi-AZ requirements vs. cost

*Detailed AI analysis will be available when service is restored.*"""
        
        elif any(term in query for term in ["s3", "storage", "bucket"]):
            if data and "resourceCounts" in data:
                s3_count = data["resourceCounts"].get("s3", 0)
                return f"""📦 **S3 Analysis** (AI service temporarily unavailable)

Current S3 Infrastructure:
• Total S3 buckets: {s3_count}

**Storage Optimization Strategies:**
• Implement lifecycle policies to transition to cheaper storage classes
• Use Intelligent Tiering for automatic cost optimization
• Review and delete incomplete multipart uploads
• Compress and deduplicate data where possible
• Monitor and optimize data transfer costs

*AI-powered storage analysis will be available when service is restored.*"""
        
        elif any(term in query for term in ["cost", "expensive", "optimize"]):
            if data and "totalCost" in data:
                total_cost = data["totalCost"]
                total_resources = data.get("totalResources", 0)
                return f"""💰 **Cost Optimization** (AI service temporarily unavailable)

Current Infrastructure Cost: ${total_cost:,.2f}/month
Average cost per resource: ${total_cost/max(total_resources, 1):,.2f}

**Quick Cost Optimization Wins:**
• Review and terminate unused resources
• Implement resource tagging for better cost allocation
• Consider Reserved Instances for predictable workloads
• Use AWS Cost Explorer to identify spending trends
• Set up billing alerts and budgets

*AI-powered cost optimization recommendations will be available when service is restored.*"""
        
        return "I can help you analyze AWS resources including EC2 instances, RDS databases, and S3 storage. Ask me about specific resource types, costs, or optimization opportunities."
    
    def _optimization_fallback(self, query: str, data: Dict[str, Any]) -> str:
        """Optimization context fallback with recommendations"""
        if "optimize" in query or "improve" in query or "reduce" in query:
            if data and "total_recommendations" in data:
                total_recs = data.get("total_recommendations", 0)
                return f"""⚡ **Optimization Opportunities** (AI service temporarily unavailable)

Current status:
• {total_recs} optimization recommendations available
• Common optimization areas include:
  - Right-sizing underutilized instances
  - Database consolidation opportunities
  - Storage optimization
  - Reserved instance planning

**Quick Wins:**
• Review instances with <20% CPU utilization
• Identify duplicate or unused databases
• Analyze storage growth patterns
• Consider auto-scaling configurations

*Detailed AI-powered analysis will be available when service is restored.*"""
        
        return "I can help identify optimization opportunities and performance improvements. Ask about specific resources or applications you'd like to optimize."
    
    def _chargeback_fallback(self, query: str, data: Dict[str, Any]) -> str:
        """Chargeback context fallback with allocation insights"""
        if "allocate" in query or "team" in query or "cost" in query:
            if data and "cost_data" in data:
                cost_data = data["cost_data"]
                total_cost = cost_data.get("total_cost", 0)
                return f"""📋 **Cost Allocation Analysis** (AI service temporarily unavailable)

Current period cost: ${total_cost:,.2f}

**Common Allocation Methods:**
• **Usage-based**: Allocate by actual resource consumption
• **Equal split**: Divide costs equally among teams
• **Weighted**: Based on team size or budget allocation
• **Application-based**: Charge teams for their specific applications

**Best Practices:**
• Track resource tagging for accurate attribution
• Regular review and adjustment of allocation models
• Transparent reporting to all stakeholders
• Consider shared service costs separately

*AI-powered allocation recommendations will be available when service is restored.*"""
        
        return "I can help with cost allocation strategies and chargeback models. Ask about specific teams or allocation methods."
    
    def _get_fallback_response(self, query: str, context: str) -> str:
        """Provide fallback response when AI fails"""
        fallbacks = {
            "executive": "I can help you analyze costs, identify trends, and provide strategic insights. Please try rephrasing your question or ask about specific metrics.",
            "inventory": "I can help you search databases, analyze configurations, and suggest optimizations. Try asking about specific applications or database types.",
            "cost": "I can analyze spending patterns, predict costs, and identify savings opportunities. Ask me about specific cost drivers or budget forecasts.",
            "chargeback": "I can help allocate costs fairly and analyze team usage patterns. Try asking about specific teams or cost allocation strategies.",
            "optimization": "I can analyze resource utilization and suggest optimizations. Ask me about specific applications or optimization opportunities."
        }
        
        return fallbacks.get(context, "I'm here to help with infrastructure management. Please try rephrasing your question.")

# Global instance
infrastructure_ai = InfrastructureAIHandler()