"""
Agent Orchestrator for managing agentic workflows
"""
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime

from .base_agent import BaseAgent, AgentTask, TaskPriority, AgentStatus

class WorkflowStatus(Enum):
    PLANNING = "planning"
    EXECUTING = "executing"
    WAITING_APPROVAL = "waiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class AgentWorkflow:
    id: str
    goal: str
    context: Dict[str, Any]
    tasks: List[AgentTask]
    status: WorkflowStatus = WorkflowStatus.PLANNING
    created_at: datetime = None
    completed_at: datetime = None
    result: Any = None
    error: str = None
    requires_approval: bool = False
    approved_by: str = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class AgentOrchestrator:
    """Orchestrates multiple agents to achieve complex goals"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.workflows: Dict[str, AgentWorkflow] = {}
        self.active_workflows: List[str] = []
        self.logger = logging.getLogger("orchestrator")
        
    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent with the orchestrator"""
        self.agents[agent.agent_id] = agent
        self.logger.info(f"Registered agent: {agent.name} ({agent.agent_id})")
    
    async def create_workflow(self, goal: str, context: Dict[str, Any]) -> str:
        """Create a new agentic workflow"""
        workflow_id = f"workflow_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Parse intent and decompose goal
        intent = await self._parse_intent(goal, context)
        tasks = await self._decompose_goal(intent, context)
        
        workflow = AgentWorkflow(
            id=workflow_id,
            goal=goal,
            context=context,
            tasks=tasks,
            requires_approval=any(task.priority == TaskPriority.CRITICAL for task in tasks)
        )
        
        self.workflows[workflow_id] = workflow
        self.logger.info(f"Created workflow {workflow_id}: {goal}")
        
        return workflow_id
    
    async def execute_workflow(self, workflow_id: str, auto_approve: bool = False) -> Dict[str, Any]:
        """Execute an agentic workflow"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        workflow.status = WorkflowStatus.EXECUTING
        
        try:
            # Check if approval is needed
            if workflow.requires_approval and not auto_approve:
                workflow.status = WorkflowStatus.WAITING_APPROVAL
                return {
                    "status": "waiting_approval",
                    "workflow_id": workflow_id,
                    "tasks": [self._task_to_dict(task) for task in workflow.tasks],
                    "message": "This workflow requires approval before execution"
                }
            
            # Execute tasks in dependency order
            results = []
            for task in self._sort_tasks_by_dependencies(workflow.tasks):
                agent = await self._find_best_agent(task)
                if not agent:
                    raise ValueError(f"No agent available for task: {task.type}")
                
                await agent.start_task(task)
                results.append({
                    "task_id": task.id,
                    "agent_id": agent.agent_id,
                    "result": task.result,
                    "error": task.error
                })
                
                # Stop if any critical task fails
                if task.error and task.priority == TaskPriority.CRITICAL:
                    workflow.status = WorkflowStatus.FAILED
                    workflow.error = f"Critical task failed: {task.error}"
                    break
            
            if workflow.status != WorkflowStatus.FAILED:
                workflow.status = WorkflowStatus.COMPLETED
                workflow.result = results
                workflow.completed_at = datetime.utcnow()
            
            return {
                "status": workflow.status.value,
                "workflow_id": workflow_id,
                "results": results,
                "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None
            }
            
        except Exception as e:
            workflow.status = WorkflowStatus.FAILED
            workflow.error = str(e)
            workflow.completed_at = datetime.utcnow()
            self.logger.error(f"Workflow {workflow_id} failed: {e}")
            
            return {
                "status": "failed",
                "workflow_id": workflow_id,
                "error": str(e)
            }
    
    async def approve_workflow(self, workflow_id: str, approved_by: str) -> Dict[str, Any]:
        """Approve a workflow for execution"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        if workflow.status != WorkflowStatus.WAITING_APPROVAL:
            raise ValueError(f"Workflow {workflow_id} is not waiting for approval")
        
        workflow.approved_by = approved_by
        return await self.execute_workflow(workflow_id, auto_approve=True)
    
    async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get the status of a workflow"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        return {
            "workflow_id": workflow_id,
            "goal": workflow.goal,
            "status": workflow.status.value,
            "created_at": workflow.created_at.isoformat(),
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
            "tasks": [self._task_to_dict(task) for task in workflow.tasks],
            "requires_approval": workflow.requires_approval,
            "approved_by": workflow.approved_by,
            "result": workflow.result,
            "error": workflow.error
        }
    
    async def _parse_intent(self, goal: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Parse user intent from goal description"""
        goal_lower = goal.lower()
        
        intent = {
            "primary_action": "analyze",
            "target": "database",
            "urgency": "normal",
            "scope": "all"
        }
        
        # Detect primary actions
        if any(word in goal_lower for word in ["optimize", "reduce", "save"]):
            intent["primary_action"] = "optimize"
        elif any(word in goal_lower for word in ["fix", "resolve", "remediate"]):
            intent["primary_action"] = "remediate"
        elif any(word in goal_lower for word in ["monitor", "watch", "track"]):
            intent["primary_action"] = "monitor"
        elif any(word in goal_lower for word in ["audit", "check", "verify"]):
            intent["primary_action"] = "audit"
        
        # Detect targets
        if any(word in goal_lower for word in ["cost", "expense", "billing"]):
            intent["target"] = "cost"
        elif any(word in goal_lower for word in ["security", "encryption", "access"]):
            intent["target"] = "security"
        elif any(word in goal_lower for word in ["performance", "speed", "latency"]):
            intent["target"] = "performance"
        elif any(word in goal_lower for word in ["compliance", "policy", "standard"]):
            intent["target"] = "compliance"
        
        # Detect urgency
        if any(word in goal_lower for word in ["urgent", "critical", "immediately"]):
            intent["urgency"] = "high"
        elif any(word in goal_lower for word in ["soon", "quickly", "asap"]):
            intent["urgency"] = "medium"
        
        return intent
    
    async def _decompose_goal(self, intent: Dict[str, Any], context: Dict[str, Any]) -> List[AgentTask]:
        """Decompose a goal into executable tasks"""
        tasks = []
        task_counter = 1
        
        # Always start with data collection
        tasks.append(AgentTask(
            id=f"task_{task_counter}",
            type="data_collection",
            description="Collect current AWS resource data",
            priority=TaskPriority.HIGH,
            context=context
        ))
        task_counter += 1
        
        # Add analysis task
        tasks.append(AgentTask(
            id=f"task_{task_counter}",
            type="analysis",
            description=f"Analyze data for {intent['target']} {intent['primary_action']}",
            priority=TaskPriority.HIGH,
            context={**context, "intent": intent},
            dependencies=["task_1"]
        ))
        task_counter += 1
        
        # Add specific tasks based on intent
        if intent["primary_action"] == "optimize":
            if intent["target"] == "cost":
                tasks.append(AgentTask(
                    id=f"task_{task_counter}",
                    type="cost_optimization",
                    description="Identify cost optimization opportunities",
                    priority=TaskPriority.MEDIUM,
                    context={**context, "intent": intent},
                    dependencies=["task_2"]
                ))
                task_counter += 1
        
        elif intent["primary_action"] == "audit":
            if intent["target"] == "security":
                tasks.append(AgentTask(
                    id=f"task_{task_counter}",
                    type="security_audit",
                    description="Perform security compliance audit",
                    priority=TaskPriority.HIGH,
                    context={**context, "intent": intent},
                    dependencies=["task_2"]
                ))
                task_counter += 1
        
        # Add recommendation task
        tasks.append(AgentTask(
            id=f"task_{task_counter}",
            type="recommendation",
            description="Generate actionable recommendations",
            priority=TaskPriority.MEDIUM,
            context={**context, "intent": intent},
            dependencies=[f"task_{task_counter-1}"]
        ))
        
        return tasks
    
    async def _find_best_agent(self, task: AgentTask) -> Optional[BaseAgent]:
        """Find the best agent to handle a task"""
        suitable_agents = []
        
        for agent in self.agents.values():
            if await agent.can_handle_task(task) and agent.status == AgentStatus.IDLE:
                success_rate = agent.get_success_rate(task.type)
                suitable_agents.append((agent, success_rate))
        
        if not suitable_agents:
            return None
        
        # Return agent with highest success rate
        suitable_agents.sort(key=lambda x: x[1], reverse=True)
        return suitable_agents[0][0]
    
    def _sort_tasks_by_dependencies(self, tasks: List[AgentTask]) -> List[AgentTask]:
        """Sort tasks by their dependencies"""
        sorted_tasks = []
        remaining_tasks = tasks.copy()
        
        while remaining_tasks:
            # Find tasks with no unmet dependencies
            ready_tasks = []
            for task in remaining_tasks:
                if all(dep_id in [t.id for t in sorted_tasks] for dep_id in task.dependencies):
                    ready_tasks.append(task)
            
            if not ready_tasks:
                # Circular dependency or missing dependency
                self.logger.warning("Circular dependency detected, adding remaining tasks")
                ready_tasks = remaining_tasks
            
            # Sort by priority within ready tasks
            ready_tasks.sort(key=lambda x: x.priority.value, reverse=True)
            
            # Add the highest priority ready task
            task_to_add = ready_tasks[0]
            sorted_tasks.append(task_to_add)
            remaining_tasks.remove(task_to_add)
        
        return sorted_tasks
    
    def _task_to_dict(self, task: AgentTask) -> Dict[str, Any]:
        """Convert task to dictionary for JSON serialization"""
        return {
            "id": task.id,
            "type": task.type,
            "description": task.description,
            "priority": task.priority.name,
            "dependencies": task.dependencies,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "result": task.result,
            "error": task.error
        }
    
    def get_orchestrator_status(self) -> Dict[str, Any]:
        """Get orchestrator status and statistics"""
        return {
            "registered_agents": len(self.agents),
            "active_workflows": len(self.active_workflows),
            "total_workflows": len(self.workflows),
            "agents": [agent.get_agent_info() for agent in self.agents.values()],
            "recent_workflows": [
                {
                    "id": wf.id,
                    "goal": wf.goal,
                    "status": wf.status.value,
                    "created_at": wf.created_at.isoformat()
                }
                for wf in sorted(self.workflows.values(), key=lambda x: x.created_at, reverse=True)[:10]
            ]
        }