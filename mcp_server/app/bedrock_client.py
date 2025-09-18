"""
AWS Bedrock Claude AI Client for Database Analysis
Based on: https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-runtime_example_bedrock-runtime_Converse_AnthropicClaudeReasoning_section.html
"""

import boto3
import json
import logging
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)

class BedrockClaudeClient:
    def __init__(self, region_name: str = "us-east-1"):
        """Initialize Bedrock client for Claude AI analysis"""
        self.region_name = region_name
        # Use Claude 3.0 Haiku model
        self.model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        
        try:
            self.bedrock_client = boto3.client(
                service_name='bedrock-runtime',
                region_name=region_name
            )
            logger.info(f"Bedrock client initialized for region: {region_name}")
        except NoCredentialsError:
            logger.error("AWS credentials not found. Please configure AWS credentials.")
            self.bedrock_client = None
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {str(e)}")
            self.bedrock_client = None

    def analyze_database_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze database requirements using Claude AI and provide recommendations
        
        Args:
            requirements: Dictionary containing database requirements
            
        Returns:
            Dictionary with AI analysis and recommendations
        """
        if not self.bedrock_client:
            return self._get_fallback_response(requirements)
        
        try:
            # Create the analysis prompt
            prompt = self._create_analysis_prompt(requirements)
            
            # Call Bedrock Converse API
            response = self.bedrock_client.converse(
                modelId=self.model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": prompt}]
                    }
                ],
                inferenceConfig={
                    "maxTokens": 4000,
                    "temperature": 0.1,
                    "topP": 0.9
                }
            )
            
            # Extract and parse the response
            ai_response = response['output']['message']['content'][0]['text']
            
            # Parse the structured response
            return self._parse_ai_response(ai_response, requirements)
            
        except ClientError as e:
            logger.error(f"Bedrock API error: {str(e)}")
            return self._get_fallback_response(requirements, error=str(e))
        except Exception as e:
            logger.error(f"Unexpected error in AI analysis: {str(e)}")
            return self._get_fallback_response(requirements, error=str(e))

    def _create_analysis_prompt(self, requirements: Dict[str, Any]) -> str:
        """Create a structured prompt for database analysis"""
        
        scenario = requirements.get('scenario', 'general')
        team = requirements.get('team', 'Unknown Team')
        application = requirements.get('application', 'Unknown Application')
        
        base_prompt = f"""
You are a senior database architect and AWS solutions expert. Analyze the following database requirements and provide a comprehensive recommendation.

## Request Details
- **Team**: {team}
- **Application**: {application}
- **Scenario**: {scenario}

## Requirements Analysis
"""
        
        # Add scenario-specific requirements
        if scenario == 'ecommerce':
            base_prompt += f"""
**E-commerce Database Requirements:**
- Data Type: {requirements.get('requirements', {}).get('data_type', 'product_catalog')}
- Expected Records: {requirements.get('requirements', {}).get('expected_records', 'Not specified')}
- Read/Write Ratio: {requirements.get('requirements', {}).get('read_write_ratio', 'Not specified')}
- Peak Users: {requirements.get('requirements', {}).get('peak_concurrent_users', 'Not specified')}
- Compliance: {requirements.get('requirements', {}).get('compliance', [])}
- Availability: {requirements.get('requirements', {}).get('availability_requirement', 'Not specified')}
- Performance: {json.dumps(requirements.get('requirements', {}).get('performance_requirements', {}), indent=2)}
"""
        elif scenario == 'analytics':
            base_prompt += f"""
**Analytics Warehouse Requirements:**
- Data Volume: {requirements.get('requirements', {}).get('expected_data_volume', 'Not specified')}
- Query Patterns: {requirements.get('requirements', {}).get('query_patterns', 'Not specified')}
- Concurrent Users: {requirements.get('requirements', {}).get('concurrent_analysts', 'Not specified')}
- ETL Requirements: {requirements.get('requirements', {}).get('batch_processing', 'Not specified')}
- Real-time Needs: {requirements.get('requirements', {}).get('real_time_requirements', 'Not specified')}
- Compliance: {requirements.get('requirements', {}).get('compliance', [])}
"""
        elif scenario == 'microservices':
            base_prompt += f"""
**Microservices Session Store Requirements:**
- Expected Load: {requirements.get('requirements', {}).get('expected_load', 'Not specified')}
- Data Patterns: {requirements.get('requirements', {}).get('data_patterns', 'Not specified')}
- Session Duration: {requirements.get('requirements', {}).get('session_duration', 'Not specified')}
- Failover Requirement: {requirements.get('requirements', {}).get('failover_requirement', 'Not specified')}
- Performance: {json.dumps(requirements.get('requirements', {}).get('performance_requirements', {}), indent=2)}
"""
        
        base_prompt += """

## Analysis Required
Please provide a comprehensive analysis in the following JSON format:

```json
{
  "recommendation": {
    "primary_solution": "Recommended AWS service (e.g., Aurora PostgreSQL, Redshift Serverless, ElastiCache Redis)",
    "instance_type": "Specific instance type/configuration",
    "storage_config": "Storage configuration details",
    "high_availability": "HA configuration (Multi-AZ, replicas, etc.)",
    "estimated_monthly_cost": 2500
  },
  "analysis": {
    "confidence_score": 0.92,
    "reasoning": [
      "Key reason 1 for this recommendation",
      "Key reason 2 for this recommendation", 
      "Key reason 3 for this recommendation"
    ],
    "performance_assessment": "How this solution meets performance requirements",
    "compliance_assessment": "How this solution meets compliance requirements",
    "scalability_assessment": "How this solution handles scaling requirements"
  },
  "alternatives": [
    {
      "solution": "Alternative option 1",
      "monthly_cost": 1800,
      "pros": ["Advantage 1", "Advantage 2"],
      "cons": ["Disadvantage 1", "Disadvantage 2"]
    }
  ],
  "cost_breakdown": {
    "compute": 1500,
    "storage": 800,
    "networking": 200,
    "total_monthly": 2500,
    "three_year_tco": 90000
  },
  "implementation_notes": [
    "Important implementation consideration 1",
    "Important implementation consideration 2"
  ]
}
```

Focus on:
1. **Accuracy**: Use real AWS pricing and service capabilities
2. **Compliance**: Address all regulatory requirements
3. **Performance**: Ensure solution meets all performance criteria
4. **Cost Optimization**: Balance performance with cost efficiency
5. **Scalability**: Consider future growth and scaling needs

Provide only the JSON response, no additional text.
"""
        
        return base_prompt

    def _parse_ai_response(self, ai_response: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the AI response and structure it for the application"""
        
        try:
            # Extract JSON from the response
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in AI response")
            
            json_str = ai_response[json_start:json_end]
            parsed_response = json.loads(json_str)
            
            # Structure the response for our application
            return {
                "success": True,
                "ai_provider": "AWS Bedrock Claude 3.5 Sonnet",
                "model_id": self.model_id,
                "analysis_timestamp": self._get_timestamp(),
                "request_scenario": requirements.get('scenario', 'general'),
                "recommendation": parsed_response.get("recommendation", {}),
                "analysis": parsed_response.get("analysis", {}),
                "alternatives": parsed_response.get("alternatives", []),
                "cost_breakdown": parsed_response.get("cost_breakdown", {}),
                "implementation_notes": parsed_response.get("implementation_notes", []),
                "raw_response": ai_response
            }
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {str(e)}")
            return self._get_fallback_response(requirements, error=f"AI response parsing error: {str(e)}")

    def _get_fallback_response(self, requirements: Dict[str, Any], error: Optional[str] = None) -> Dict[str, Any]:
        """Provide a fallback response when AI analysis fails"""
        
        scenario = requirements.get('scenario', 'general')
        
        # Scenario-specific fallback recommendations
        fallback_recommendations = {
            'ecommerce': {
                "primary_solution": "Amazon Aurora PostgreSQL",
                "instance_type": "db.r6g.2xlarge",
                "estimated_monthly_cost": 2847,
                "reasoning": ["High availability for e-commerce", "PCI-DSS compliance", "Read replica support"]
            },
            'analytics': {
                "primary_solution": "Amazon Redshift Serverless",
                "instance_type": "128 RPUs base capacity",
                "estimated_monthly_cost": 4200,
                "reasoning": ["Optimized for analytics workloads", "Serverless scaling", "Cost-effective for variable workloads"]
            },
            'microservices': {
                "primary_solution": "Amazon ElastiCache for Redis",
                "instance_type": "cache.r6g.xlarge cluster",
                "estimated_monthly_cost": 1890,
                "reasoning": ["Sub-millisecond latency", "High availability", "Horizontal scaling"]
            }
        }
        
        fallback = fallback_recommendations.get(scenario, fallback_recommendations['ecommerce'])
        
        return {
            "success": False,
            "ai_provider": "Fallback Analysis",
            "error": error or "AWS Bedrock not available",
            "analysis_timestamp": self._get_timestamp(),
            "request_scenario": scenario,
            "recommendation": {
                "primary_solution": fallback["primary_solution"],
                "instance_type": fallback["instance_type"],
                "estimated_monthly_cost": fallback["estimated_monthly_cost"]
            },
            "analysis": {
                "confidence_score": 0.75,
                "reasoning": fallback["reasoning"],
                "note": "This is a fallback recommendation. Configure AWS Bedrock for AI-powered analysis."
            },
            "alternatives": [],
            "cost_breakdown": {
                "total_monthly": fallback["estimated_monthly_cost"],
                "note": "Estimated costs - configure Bedrock for detailed analysis"
            }
        }

    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"

    def test_connection(self) -> Dict[str, Any]:
        """Test the Bedrock connection"""
        if not self.bedrock_client:
            return {
                "status": "error",
                "message": "Bedrock client not initialized",
                "configured": False
            }
        
        try:
            # Test with a simple request
            response = self.bedrock_client.converse(
                modelId=self.model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": "Hello, please respond with 'Connection successful'"}]
                    }
                ],
                inferenceConfig={
                    "maxTokens": 50,
                    "temperature": 0.1
                }
            )
            
            return {
                "status": "success",
                "message": "Bedrock connection successful",
                "configured": True,
                "model_id": self.model_id,
                "region": self.region_name,
                "response": response['output']['message']['content'][0]['text']
            }
            
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Bedrock connection failed: {str(e)}",
                "configured": False
            }