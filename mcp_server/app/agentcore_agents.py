"""
AWS Agent Core Incident Response Multi-Agent System
Specialized agents for SRE incident response automation using Agent Core patterns
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from bedrock_client import BedrockClaudeClient

@dataclass
class AgentResult:
    agent_name: str
    analysis: Dict[str, Any]
    confidence: float
    reasoning: List[str]
    recommendations: List[str]
    timestamp: str
    execution_time_ms: int

class BaseAgentCoreAgent:
    """Base class for all AWS Agent Core agents"""
    
    def __init__(self, name: str, specialization: str):
        self.name = name
        self.specialization = specialization
        self.bedrock_client = BedrockClaudeClient()
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        """Override this method in each specialized agent"""
        raise NotImplementedError
    
    def _create_result(self, analysis: Dict, confidence: float, reasoning: List[str], 
                      recommendations: List[str], execution_time: int) -> AgentResult:
        return AgentResult(
            agent_name=self.name,
            analysis=analysis,
            confidence=confidence,
            reasoning=reasoning,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat(),
            execution_time_ms=execution_time
        )
    
    async def _call_bedrock(self, prompt: str) -> Dict[str, Any]:
        """Make a direct call to Bedrock with a custom prompt"""
        try:
            if hasattr(self.bedrock_client, 'bedrock_client') and self.bedrock_client.bedrock_client:
                response = self.bedrock_client.bedrock_client.converse(
                    modelId=self.bedrock_client.model_id,
                    messages=[
                        {
                            "role": "user",
                            "content": [{"text": prompt}]
                        }
                    ],
                    inferenceConfig={
                        "maxTokens": 2000,
                        "temperature": 0.1,
                        "topP": 0.9
                    }
                )
                
                ai_response = response['output']['message']['content'][0]['text']
                
                # Try to parse JSON response
                try:
                    json_start = ai_response.find('{')
                    json_end = ai_response.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = ai_response[json_start:json_end]
                        return {"success": True, "data": json.loads(json_str), "raw": ai_response}
                except:
                    pass
                
                return {"success": True, "data": {}, "raw": ai_response}
            else:
                return {"success": False, "error": "Bedrock client not available"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _calculate_confidence(self, analysis: Dict[str, Any], bedrock_used: bool, execution_time_ms: int) -> float:
        """Calculate dynamic confidence score based on analysis quality and data availability"""
        base_confidence = 0.75  # Base confidence for fallback analysis
        
        if bedrock_used:
            base_confidence = 0.88
            
            # Check data completeness
            data_completeness = 0
            total_fields = 0
            
            # Check key analysis fields
            key_fields = ['severity', 'impact', 'root_cause_analysis']
            for field in key_fields:
                total_fields += 1
                if analysis.get(field) and analysis[field] != "Unknown":
                    data_completeness += 1
            
            if total_fields > 0:
                completeness_bonus = (data_completeness / total_fields) * 0.1
                base_confidence += completeness_bonus
        
        # Performance penalty for slow execution
        if execution_time_ms > 3000:
            performance_penalty = min(0.05, (execution_time_ms - 3000) / 10000)
            base_confidence -= performance_penalty
        
        # Ensure confidence is within bounds
        final_confidence = max(0.70, min(0.98, base_confidence))
        return round(final_confidence, 3)

class IncidentDetectionAgent(BaseAgentCoreAgent):
    """Detects and classifies incidents from monitoring data"""
    
    def __init__(self):
        super().__init__("Incident Detection Agent", "Incident Detection & Classification")
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        start_time = datetime.now()
        
        # Handle both string and dict incident data
        incident_raw = request.get('incident_description', '')
        if isinstance(incident_raw, str):
            incident_data = {'description': incident_raw}
        else:
            incident_data = incident_raw
            
        symptoms = request.get('symptoms', [])
        metrics = request.get('metrics', {})
        
        try:
            prompt = f"""
            As an SRE incident detection specialist, analyze this incident and respond with JSON:
            
            Incident Description: {incident_data.get('description', 'Unknown')}
            Symptoms: {symptoms}
            Metrics: {metrics}
            Service: {request.get('service', 'Unknown')}
            
            Provide analysis in this exact JSON format:
            {{
                "incident_classification": {{
                    "severity": "P0|P1|P2|P3|P4",
                    "category": "Performance|Availability|Security|Data|Infrastructure",
                    "impact_scope": "Critical|High|Medium|Low",
                    "affected_services": ["service1", "service2"],
                    "estimated_users_affected": 1000
                }},
                "detection_analysis": {{
                    "detection_method": "Automated|Manual|Customer Report",
                    "detection_time": "2024-01-15T10:30:00Z",
                    "time_to_detect": "5 minutes",
                    "alert_sources": ["CloudWatch", "DataDog", "PagerDuty"]
                }},
                "initial_assessment": {{
                    "business_impact": "Revenue loss, customer complaints",
                    "technical_impact": "Service degradation, increased latency",
                    "urgency_score": 8.5,
                    "escalation_required": true
                }},
                "incident_metadata": {{
                    "incident_id": "INC-2024-001",
                    "created_by": "monitoring-system",
                    "tags": ["performance", "database", "critical"]
                }}
            }}
            """
            
            bedrock_response = await self._call_bedrock(prompt)
            
            if bedrock_response.get("success") and bedrock_response.get("data"):
                ai_data = bedrock_response["data"]
                analysis = {
                    "incident_classification": ai_data.get("incident_classification", {}),
                    "detection_analysis": ai_data.get("detection_analysis", {}),
                    "initial_assessment": ai_data.get("initial_assessment", {}),
                    "incident_metadata": ai_data.get("incident_metadata", {}),
                    "bedrock_used": True,
                    "ai_prompt": prompt,
                    "ai_raw_response": bedrock_response.get("raw", "")
                }
            else:
                raise Exception(f"Bedrock analysis failed: {bedrock_response.get('error', 'Unknown error')}")
        except Exception as e:
            # Fallback analysis
            analysis = {
                "incident_classification": {
                    "severity": "P2",
                    "category": "Performance",
                    "impact_scope": "Medium",
                    "affected_services": [request.get('service', 'unknown-service')],
                    "estimated_users_affected": 500
                },
                "detection_analysis": {
                    "detection_method": "Automated",
                    "detection_time": datetime.now().isoformat(),
                    "time_to_detect": "Unknown",
                    "alert_sources": ["CloudWatch"]
                },
                "initial_assessment": {
                    "business_impact": "Service degradation",
                    "technical_impact": "Performance issues",
                    "urgency_score": 7.0,
                    "escalation_required": False
                },
                "incident_metadata": {
                    "incident_id": f"INC-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                    "created_by": "agent-core-system",
                    "tags": ["automated", "performance"]
                },
                "bedrock_used": False,
                "fallback_reason": str(e)
            }
        
        severity = analysis.get("incident_classification", {}).get("severity", "P2")
        category = analysis.get("incident_classification", {}).get("category", "Performance")
        
        reasoning = [
            f"Classified as {severity} {category} incident",
            f"Impact scope: {analysis.get('incident_classification', {}).get('impact_scope', 'Medium')}",
            f"Urgency score: {analysis.get('initial_assessment', {}).get('urgency_score', 7.0)}/10"
        ]
        
        recommendations = [
            f"Escalate to {category.lower()} team immediately" if severity in ["P0", "P1"] else f"Assign to {category.lower()} team",
            "Begin impact assessment and customer communication",
            "Start incident response playbook execution"
        ]
        
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        bedrock_used = analysis.get('bedrock_used', False)
        confidence = self._calculate_confidence(analysis, bedrock_used, execution_time)
        
        return self._create_result(analysis, confidence, reasoning, recommendations, execution_time)

class RootCauseAnalysisAgent(BaseAgentCoreAgent):
    """Performs automated root cause analysis"""
    
    def __init__(self):
        super().__init__("Root Cause Analysis Agent", "Automated Root Cause Analysis")
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        start_time = datetime.now()
        
        incident_context = context.get('incident_classification', {}) if context else {}
        logs = request.get('logs', [])
        metrics = request.get('metrics', {})
        
        try:
            severity = incident_context.get('severity', 'P2')
            category = incident_context.get('category', 'Performance')
            
            prompt = f"""
            As an expert SRE root cause analysis specialist, analyze this incident and respond with JSON:
            
            Incident Severity: {severity}
            Category: {category}
            Logs: {logs[:5] if logs else 'No logs available'}
            Metrics: {metrics}
            Service: {request.get('service', 'Unknown')}
            
            Provide comprehensive root cause analysis in this exact JSON format:
            {{
                "root_cause_analysis": {{
                    "primary_cause": "Database connection pool exhaustion",
                    "contributing_factors": ["High traffic spike", "Inefficient queries", "Connection leak"],
                    "failure_mode": "Resource exhaustion",
                    "timeline": {{
                        "initial_symptoms": "2024-01-15T10:25:00Z",
                        "escalation_point": "2024-01-15T10:30:00Z",
                        "root_cause_identified": "2024-01-15T10:45:00Z"
                    }}
                }},
                "technical_analysis": {{
                    "affected_components": ["Database", "Application Server", "Load Balancer"],
                    "failure_chain": ["Traffic spike → Connection pool exhaustion → Service degradation"],
                    "error_patterns": ["Connection timeout", "502 Bad Gateway", "High response times"],
                    "system_state": "Degraded performance with intermittent failures"
                }},
                "evidence_analysis": {{
                    "log_patterns": ["ERROR: Connection pool exhausted", "WARN: High connection count"],
                    "metric_anomalies": ["CPU spike to 95%", "Connection count > threshold"],
                    "correlation_score": 0.92,
                    "confidence_level": "High"
                }},
                "impact_assessment": {{
                    "mttr_estimate": "30 minutes",
                    "recovery_complexity": "Medium",
                    "data_integrity_risk": "Low",
                    "customer_impact_duration": "15 minutes"
                }}
            }}
            """
            
            bedrock_response = await self._call_bedrock(prompt)
            
            if bedrock_response.get("success") and bedrock_response.get("data"):
                ai_data = bedrock_response["data"]
                analysis = {
                    "root_cause_analysis": ai_data.get("root_cause_analysis", {}),
                    "technical_analysis": ai_data.get("technical_analysis", {}),
                    "evidence_analysis": ai_data.get("evidence_analysis", {}),
                    "impact_assessment": ai_data.get("impact_assessment", {}),
                    "bedrock_used": True,
                    "ai_prompt": prompt,
                    "ai_raw_response": bedrock_response.get("raw", "")
                }
            else:
                raise Exception(f"Bedrock analysis failed: {bedrock_response.get('error', 'Unknown error')}")
        except Exception as e:
            # Fallback analysis
            analysis = {
                "root_cause_analysis": {
                    "primary_cause": "Service performance degradation",
                    "contributing_factors": ["High load", "Resource constraints"],
                    "failure_mode": "Performance degradation",
                    "timeline": {
                        "initial_symptoms": datetime.now().isoformat(),
                        "escalation_point": (datetime.now() + timedelta(minutes=5)).isoformat(),
                        "root_cause_identified": (datetime.now() + timedelta(minutes=15)).isoformat()
                    }
                },
                "technical_analysis": {
                    "affected_components": [request.get('service', 'unknown-service')],
                    "failure_chain": ["Unknown trigger → Service degradation"],
                    "error_patterns": ["Performance issues"],
                    "system_state": "Degraded"
                },
                "evidence_analysis": {
                    "log_patterns": ["Performance warnings"],
                    "metric_anomalies": ["Response time increase"],
                    "correlation_score": 0.75,
                    "confidence_level": "Medium"
                },
                "impact_assessment": {
                    "mttr_estimate": "45 minutes",
                    "recovery_complexity": "Medium",
                    "data_integrity_risk": "Low",
                    "customer_impact_duration": "Unknown"
                },
                "bedrock_used": False,
                "fallback_reason": str(e)
            }
        
        primary_cause = analysis.get("root_cause_analysis", {}).get("primary_cause", "Unknown")
        confidence_level = analysis.get("evidence_analysis", {}).get("confidence_level", "Medium")
        
        reasoning = [
            f"Primary cause identified: {primary_cause}",
            f"Analysis confidence: {confidence_level}",
            f"MTTR estimate: {analysis.get('impact_assessment', {}).get('mttr_estimate', 'Unknown')}"
        ]
        
        recommendations = [
            "Implement immediate mitigation based on root cause",
            "Monitor key metrics for recovery validation",
            "Document findings for post-incident review"
        ]
        
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        bedrock_used = analysis.get('bedrock_used', False)
        confidence = self._calculate_confidence(analysis, bedrock_used, execution_time)
        
        return self._create_result(analysis, confidence, reasoning, recommendations, execution_time)

class AutomatedRemediationAgent(BaseAgentCoreAgent):
    """Generates and executes automated remediation actions"""
    
    def __init__(self):
        super().__init__("Automated Remediation Agent", "Incident Remediation & Recovery")
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        start_time = datetime.now()
        
        incident_context = context.get('incident_classification', {}) if context else {}
        rca_context = context.get('root_cause_analysis', {}) if context else {}
        
        try:
            primary_cause = rca_context.get('primary_cause', 'Unknown')
            severity = incident_context.get('severity', 'P2')
            
            prompt = f"""
            As an expert SRE automation specialist, design remediation actions and respond with JSON:
            
            Primary Cause: {primary_cause}
            Severity: {severity}
            Service: {request.get('service', 'Unknown')}
            Environment: {request.get('environment', 'production')}
            
            Provide comprehensive remediation plan in this exact JSON format:
            {{
                "remediation_plan": {{
                    "immediate_actions": [
                        {{
                            "action": "Scale up application instances",
                            "automation_level": "Fully Automated",
                            "execution_time": "2 minutes",
                            "risk_level": "Low",
                            "rollback_available": true
                        }},
                        {{
                            "action": "Restart affected services",
                            "automation_level": "Semi-Automated",
                            "execution_time": "5 minutes",
                            "risk_level": "Medium",
                            "rollback_available": true
                        }}
                    ],
                    "monitoring_actions": [
                        "Enable enhanced monitoring",
                        "Set up temporary alerts",
                        "Increase log verbosity"
                    ]
                }},
                "automation_workflow": {{
                    "workflow_id": "remediation-workflow-001",
                    "execution_order": ["scale-up", "health-check", "traffic-validation"],
                    "approval_gates": ["human-approval-for-restart"],
                    "rollback_triggers": ["error-rate > 5%", "latency > 2s"]
                }},
                "recovery_validation": {{
                    "success_criteria": [
                        "Error rate < 1%",
                        "Response time < 500ms",
                        "All health checks passing"
                    ],
                    "validation_duration": "10 minutes",
                    "automated_tests": ["health-check", "smoke-test", "load-test"]
                }},
                "risk_assessment": {{
                    "automation_safety": "High",
                    "business_risk": "Low",
                    "technical_risk": "Medium",
                    "recommended_approach": "Automated with monitoring"
                }}
            }}
            """
            
            bedrock_response = await self._call_bedrock(prompt)
            
            if bedrock_response.get("success") and bedrock_response.get("data"):
                ai_data = bedrock_response["data"]
                analysis = {
                    "remediation_plan": ai_data.get("remediation_plan", {}),
                    "automation_workflow": ai_data.get("automation_workflow", {}),
                    "recovery_validation": ai_data.get("recovery_validation", {}),
                    "risk_assessment": ai_data.get("risk_assessment", {}),
                    "bedrock_used": True,
                    "ai_prompt": prompt,
                    "ai_raw_response": bedrock_response.get("raw", "")
                }
            else:
                raise Exception(f"Bedrock analysis failed: {bedrock_response.get('error', 'Unknown error')}")
        except Exception as e:
            # Fallback analysis
            analysis = {
                "remediation_plan": {
                    "immediate_actions": [
                        {
                            "action": "Restart service",
                            "automation_level": "Semi-Automated",
                            "execution_time": "5 minutes",
                            "risk_level": "Medium",
                            "rollback_available": True
                        }
                    ],
                    "monitoring_actions": ["Enable monitoring", "Check health status"]
                },
                "automation_workflow": {
                    "workflow_id": f"remediation-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                    "execution_order": ["restart", "health-check"],
                    "approval_gates": ["human-approval"],
                    "rollback_triggers": ["health-check-failure"]
                },
                "recovery_validation": {
                    "success_criteria": ["Service responding", "No errors"],
                    "validation_duration": "15 minutes",
                    "automated_tests": ["health-check"]
                },
                "risk_assessment": {
                    "automation_safety": "Medium",
                    "business_risk": "Medium",
                    "technical_risk": "Medium",
                    "recommended_approach": "Manual with automation support"
                },
                "bedrock_used": False,
                "fallback_reason": str(e)
            }
        
        immediate_actions = len(analysis.get("remediation_plan", {}).get("immediate_actions", []))
        automation_safety = analysis.get("risk_assessment", {}).get("automation_safety", "Medium")
        
        reasoning = [
            f"Generated {immediate_actions} immediate remediation actions",
            f"Automation safety level: {automation_safety}",
            f"Recovery validation: {analysis.get('recovery_validation', {}).get('validation_duration', '15 minutes')}"
        ]
        
        recommendations = [
            "Execute immediate actions in priority order",
            "Monitor recovery validation criteria",
            "Prepare rollback plan if remediation fails"
        ]
        
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        bedrock_used = analysis.get('bedrock_used', False)
        confidence = self._calculate_confidence(analysis, bedrock_used, execution_time)
        
        return self._create_result(analysis, confidence, reasoning, recommendations, execution_time)

class CommunicationAgent(BaseAgentCoreAgent):
    """Manages incident communication and stakeholder updates"""
    
    def __init__(self):
        super().__init__("Communication Agent", "Incident Communication & Stakeholder Management")
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        start_time = datetime.now()
        
        incident_context = context.get('incident_classification', {}) if context else {}
        rca_context = context.get('root_cause_analysis', {}) if context else {}
        
        try:
            severity = incident_context.get('severity', 'P2')
            impact_scope = incident_context.get('impact_scope', 'Medium')
            primary_cause = rca_context.get('primary_cause', 'Under investigation')
            
            prompt = f"""
            As an expert incident communication specialist, create communication plan and respond with JSON:
            
            Severity: {severity}
            Impact Scope: {impact_scope}
            Primary Cause: {primary_cause}
            Service: {request.get('service', 'Unknown')}
            
            Provide comprehensive communication plan in this exact JSON format:
            {{
                "communication_strategy": {{
                    "internal_notifications": [
                        {{
                            "audience": "Engineering Team",
                            "channel": "Slack #incidents",
                            "frequency": "Every 15 minutes",
                            "template": "incident-update-engineering"
                        }},
                        {{
                            "audience": "Leadership",
                            "channel": "Email + Slack #leadership",
                            "frequency": "Every 30 minutes",
                            "template": "incident-update-leadership"
                        }}
                    ],
                    "external_communications": [
                        {{
                            "audience": "Customers",
                            "channel": "Status Page",
                            "frequency": "As needed",
                            "template": "customer-status-update"
                        }}
                    ]
                }},
                "message_templates": {{
                    "initial_notification": "🚨 INCIDENT ALERT: {severity} incident detected affecting {service}. Investigation in progress.",
                    "progress_update": "📊 UPDATE: Root cause identified as {primary_cause}. Remediation in progress. ETA: {eta}",
                    "resolution_notice": "✅ RESOLVED: Incident has been resolved. Services are operating normally.",
                    "post_mortem_notice": "📋 Post-mortem scheduled for {date}. RCA document will be shared."
                }},
                "stakeholder_matrix": {{
                    "immediate_notify": ["On-call Engineer", "Engineering Manager", "SRE Team"],
                    "escalation_notify": ["VP Engineering", "CTO", "Customer Success"],
                    "external_notify": ["Customers", "Partners", "Status Page Subscribers"]
                }},
                "communication_timeline": {{
                    "t0_detection": "Immediate notification to on-call",
                    "t5_initial": "Initial stakeholder notification",
                    "t15_update": "First progress update",
                    "t30_escalation": "Leadership notification if unresolved",
                    "resolution": "Resolution notification to all stakeholders"
                }}
            }}
            """
            
            bedrock_response = await self._call_bedrock(prompt)
            
            if bedrock_response.get("success") and bedrock_response.get("data"):
                ai_data = bedrock_response["data"]
                analysis = {
                    "communication_strategy": ai_data.get("communication_strategy", {}),
                    "message_templates": ai_data.get("message_templates", {}),
                    "stakeholder_matrix": ai_data.get("stakeholder_matrix", {}),
                    "communication_timeline": ai_data.get("communication_timeline", {}),
                    "bedrock_used": True,
                    "ai_prompt": prompt,
                    "ai_raw_response": bedrock_response.get("raw", "")
                }
            else:
                raise Exception(f"Bedrock analysis failed: {bedrock_response.get('error', 'Unknown error')}")
        except Exception as e:
            # Fallback analysis
            analysis = {
                "communication_strategy": {
                    "internal_notifications": [
                        {
                            "audience": "Engineering Team",
                            "channel": "Slack",
                            "frequency": "Every 15 minutes",
                            "template": "standard-update"
                        }
                    ],
                    "external_communications": [
                        {
                            "audience": "Customers",
                            "channel": "Status Page",
                            "frequency": "As needed",
                            "template": "customer-update"
                        }
                    ]
                },
                "message_templates": {
                    "initial_notification": f"Incident detected: {severity} severity affecting {request.get('service', 'service')}",
                    "progress_update": "Investigation in progress, updates to follow",
                    "resolution_notice": "Incident resolved, services restored",
                    "post_mortem_notice": "Post-mortem to be scheduled"
                },
                "stakeholder_matrix": {
                    "immediate_notify": ["On-call Engineer", "SRE Team"],
                    "escalation_notify": ["Engineering Manager"],
                    "external_notify": ["Status Page"]
                },
                "communication_timeline": {
                    "t0_detection": "Immediate notification",
                    "t15_update": "First update",
                    "resolution": "Resolution notification"
                },
                "bedrock_used": False,
                "fallback_reason": str(e)
            }
        
        internal_channels = len(analysis.get("communication_strategy", {}).get("internal_notifications", []))
        external_channels = len(analysis.get("communication_strategy", {}).get("external_communications", []))
        
        reasoning = [
            f"Configured {internal_channels} internal communication channels",
            f"Configured {external_channels} external communication channels",
            f"Severity {severity} requires {'immediate' if severity in ['P0', 'P1'] else 'standard'} escalation"
        ]
        
        recommendations = [
            "Send initial notification immediately",
            "Set up automated update schedule",
            "Prepare customer communication if external impact"
        ]
        
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        bedrock_used = analysis.get('bedrock_used', False)
        confidence = self._calculate_confidence(analysis, bedrock_used, execution_time)
        
        return self._create_result(analysis, confidence, reasoning, recommendations, execution_time)

class PostIncidentAnalysisAgent(BaseAgentCoreAgent):
    """Conducts post-incident analysis and generates improvement recommendations"""
    
    def __init__(self):
        super().__init__("Post-Incident Analysis Agent", "Post-Incident Analysis & Continuous Improvement")
    
    async def analyze(self, request: Dict[str, Any], context: Dict[str, Any] = None) -> AgentResult:
        start_time = datetime.now()
        
        incident_context = context.get('incident_classification', {}) if context else {}
        rca_context = context.get('root_cause_analysis', {}) if context else {}
        remediation_context = context.get('remediation_plan', {}) if context else {}
        
        try:
            severity = incident_context.get('severity', 'P2')
            primary_cause = rca_context.get('primary_cause', 'Unknown')
            mttr = rca_context.get('impact_assessment', {}).get('mttr_estimate', '30 minutes')
            
            prompt = f"""
            As an expert SRE post-incident analysis specialist, analyze this incident and respond with JSON:
            
            Severity: {severity}
            Primary Cause: {primary_cause}
            MTTR: {mttr}
            Service: {request.get('service', 'Unknown')}
            
            Provide comprehensive post-incident analysis in this exact JSON format:
            {{
                "incident_metrics": {{
                    "detection_time": "5 minutes",
                    "response_time": "2 minutes",
                    "resolution_time": "{mttr}",
                    "customer_impact_duration": "15 minutes",
                    "affected_users": 1000,
                    "revenue_impact": "$5000"
                }},
                "process_analysis": {{
                    "what_went_well": [
                        "Quick detection through automated monitoring",
                        "Effective team coordination",
                        "Clear communication to stakeholders"
                    ],
                    "what_went_wrong": [
                        "Delayed root cause identification",
                        "Manual remediation steps",
                        "Insufficient monitoring coverage"
                    ],
                    "lessons_learned": [
                        "Need better automated remediation",
                        "Improve monitoring granularity",
                        "Update incident response playbook"
                    ]
                }},
                "improvement_recommendations": {{
                    "immediate_actions": [
                        {{
                            "action": "Implement automated scaling triggers",
                            "priority": "High",
                            "effort": "Medium",
                            "timeline": "1 week",
                            "owner": "SRE Team"
                        }},
                        {{
                            "action": "Add connection pool monitoring",
                            "priority": "High",
                            "effort": "Low",
                            "timeline": "3 days",
                            "owner": "Platform Team"
                        }}
                    ],
                    "long_term_improvements": [
                        {{
                            "action": "Implement chaos engineering tests",
                            "priority": "Medium",
                            "effort": "High",
                            "timeline": "1 month",
                            "owner": "SRE Team"
                        }}
                    ]
                }},
                "prevention_measures": {{
                    "monitoring_enhancements": ["Add connection pool metrics", "Implement predictive alerting"],
                    "automation_improvements": ["Auto-scaling policies", "Self-healing mechanisms"],
                    "process_updates": ["Update runbooks", "Improve escalation procedures"],
                    "training_needs": ["Incident response training", "Tool familiarization"]
                }}
            }}
            """
            
            bedrock_response = await self._call_bedrock(prompt)
            
            if bedrock_response.get("success") and bedrock_response.get("data"):
                ai_data = bedrock_response["data"]
                analysis = {
                    "incident_metrics": ai_data.get("incident_metrics", {}),
                    "process_analysis": ai_data.get("process_analysis", {}),
                    "improvement_recommendations": ai_data.get("improvement_recommendations", {}),
                    "prevention_measures": ai_data.get("prevention_measures", {}),
                    "bedrock_used": True,
                    "ai_prompt": prompt,
                    "ai_raw_response": bedrock_response.get("raw", "")
                }
            else:
                raise Exception(f"Bedrock analysis failed: {bedrock_response.get('error', 'Unknown error')}")
        except Exception as e:
            # Fallback analysis
            analysis = {
                "incident_metrics": {
                    "detection_time": "Unknown",
                    "response_time": "Unknown",
                    "resolution_time": mttr,
                    "customer_impact_duration": "Unknown",
                    "affected_users": 0,
                    "revenue_impact": "Unknown"
                },
                "process_analysis": {
                    "what_went_well": ["Team responded quickly"],
                    "what_went_wrong": ["Root cause took time to identify"],
                    "lessons_learned": ["Need better monitoring"]
                },
                "improvement_recommendations": {
                    "immediate_actions": [
                        {
                            "action": "Review monitoring setup",
                            "priority": "Medium",
                            "effort": "Low",
                            "timeline": "1 week",
                            "owner": "SRE Team"
                        }
                    ],
                    "long_term_improvements": []
                },
                "prevention_measures": {
                    "monitoring_enhancements": ["Improve alerting"],
                    "automation_improvements": ["Consider automation"],
                    "process_updates": ["Update procedures"],
                    "training_needs": ["Team training"]
                },
                "bedrock_used": False,
                "fallback_reason": str(e)
            }
        
        immediate_actions = len(analysis.get("improvement_recommendations", {}).get("immediate_actions", []))
        long_term_actions = len(analysis.get("improvement_recommendations", {}).get("long_term_improvements", []))
        
        reasoning = [
            f"Identified {immediate_actions} immediate improvement actions",
            f"Identified {long_term_actions} long-term improvement opportunities",
            f"Resolution time: {mttr} - {'within SLA' if '30' in mttr else 'review SLA targets'}"
        ]
        
        recommendations = [
            "Schedule post-mortem meeting within 48 hours",
            "Prioritize high-impact immediate actions",
            "Track improvement implementation progress"
        ]
        
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        bedrock_used = analysis.get('bedrock_used', False)
        confidence = self._calculate_confidence(analysis, bedrock_used, execution_time)
        
        return self._create_result(analysis, confidence, reasoning, recommendations, execution_time)

class AgentCoreOrchestrator:
    """Orchestrates multiple specialized Agent Core agents for incident response"""
    
    def __init__(self):
        self.agents = {
            'detection': IncidentDetectionAgent(),
            'root_cause': RootCauseAnalysisAgent(),
            'remediation': AutomatedRemediationAgent(),
            'communication': CommunicationAgent(),
            'post_incident': PostIncidentAnalysisAgent()
        }
    
    async def analyze_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate multi-agent incident response analysis"""
        
        # Check AWS credentials first - fail immediately if not available
        try:
            bedrock_client = BedrockClaudeClient()
            if not (hasattr(bedrock_client, 'bedrock_client') and bedrock_client.bedrock_client):
                return {
                    'success': False,
                    'error': 'AWS_CREDENTIALS_REQUIRED',
                    'message': 'AWS Bedrock credentials are required for AI-powered analysis',
                    'setup_guide': 'Please configure AWS credentials and Bedrock access to use this demo'
                }
        except Exception as e:
            return {
                'success': False,
                'error': 'AWS_CREDENTIALS_ERROR',
                'message': f'AWS Bedrock configuration error: {str(e)}',
                'setup_guide': 'Please check AWS credentials and Bedrock setup'
            }
        
        print("🤖 Starting Agent Core incident response analysis...")
        
        # Phase 1: Incident Detection and Classification
        detection_result = await self.agents['detection'].analyze(request)
        
        # Phase 2: Root Cause Analysis (parallel with Communication setup)
        context_phase2 = {'incident_classification': detection_result.analysis}
        
        rca_result, communication_result = await asyncio.gather(
            self.agents['root_cause'].analyze(request, context_phase2),
            self.agents['communication'].analyze(request, context_phase2)
        )
        
        # Phase 3: Automated Remediation
        context_phase3 = {
            'incident_classification': detection_result.analysis,
            'root_cause_analysis': rca_result.analysis,
            'communication_strategy': communication_result.analysis
        }
        
        remediation_result = await self.agents['remediation'].analyze(request, context_phase3)
        
        # Phase 4: Post-Incident Analysis
        full_context = {
            'incident_classification': detection_result.analysis,
            'root_cause_analysis': rca_result.analysis,
            'remediation_plan': remediation_result.analysis,
            'communication_strategy': communication_result.analysis
        }
        
        post_incident_result = await self.agents['post_incident'].analyze(request, full_context)
        
        # Phase 5: Synthesize final incident response plan
        final_response = self._synthesize_response(
            detection_result, rca_result, remediation_result, 
            communication_result, post_incident_result
        )
        
        return {
            'success': True,
            'agent_results': {
                'detection': detection_result,
                'root_cause': rca_result,
                'remediation': remediation_result,
                'communication': communication_result,
                'post_incident': post_incident_result
            },
            'final_response': final_response,
            'execution_summary': {
                'total_agents': 5,
                'total_execution_time_ms': sum([
                    detection_result.execution_time_ms,
                    rca_result.execution_time_ms,
                    remediation_result.execution_time_ms,
                    communication_result.execution_time_ms,
                    post_incident_result.execution_time_ms
                ]),
                'average_confidence': sum([
                    detection_result.confidence,
                    rca_result.confidence,
                    remediation_result.confidence,
                    communication_result.confidence,
                    post_incident_result.confidence
                ]) / 5
            }
        }
    
    def _synthesize_response(self, detection_result, rca_result, remediation_result, 
                           communication_result, post_incident_result) -> Dict[str, Any]:
        """Synthesize final incident response plan from all agent results"""
        
        # Get key data from each agent
        severity = detection_result.analysis.get('incident_classification', {}).get('severity', 'P2')
        primary_cause = rca_result.analysis.get('root_cause_analysis', {}).get('primary_cause', 'Unknown')
        mttr_estimate = rca_result.analysis.get('impact_assessment', {}).get('mttr_estimate', '30 minutes')
        immediate_actions = remediation_result.analysis.get('remediation_plan', {}).get('immediate_actions', [])
        
        return {
            'incident_response_plan': {
                'incident_id': detection_result.analysis.get('incident_metadata', {}).get('incident_id', 'INC-UNKNOWN'),
                'severity': severity,
                'classification': detection_result.analysis.get('incident_classification', {}),
                'estimated_resolution_time': mttr_estimate
            },
            'immediate_response': {
                'primary_cause': primary_cause,
                'remediation_actions': len(immediate_actions),
                'automation_level': 'High' if len([a for a in immediate_actions if a.get('automation_level') == 'Fully Automated']) > 0 else 'Medium',
                'human_approval_required': any(a.get('automation_level') == 'Semi-Automated' for a in immediate_actions)
            },
            'communication_plan': {
                'internal_channels': len(communication_result.analysis.get('communication_strategy', {}).get('internal_notifications', [])),
                'external_channels': len(communication_result.analysis.get('communication_strategy', {}).get('external_communications', [])),
                'stakeholder_count': len(communication_result.analysis.get('stakeholder_matrix', {}).get('immediate_notify', []))
            },
            'improvement_opportunities': {
                'immediate_actions': len(post_incident_result.analysis.get('improvement_recommendations', {}).get('immediate_actions', [])),
                'long_term_improvements': len(post_incident_result.analysis.get('improvement_recommendations', {}).get('long_term_improvements', [])),
                'prevention_measures': len(post_incident_result.analysis.get('prevention_measures', {}).get('monitoring_enhancements', []))
            },
            'agent_core_insights': {
                'detection_confidence': detection_result.confidence,
                'rca_confidence': rca_result.confidence,
                'remediation_confidence': remediation_result.confidence,
                'overall_automation_readiness': 'High' if all(r.confidence > 0.85 for r in [detection_result, rca_result, remediation_result]) else 'Medium'
            }
        }

# Global orchestrator instance
agentcore_orchestrator = AgentCoreOrchestrator()