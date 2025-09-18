"""
Base Agent Class for Agentic AWS Inventory System
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging
from datetime import datetime

class AgentStatus(Enum):
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class AgentTask:
    id: str
    type: str
    description: str
    priority: TaskPriority
    context: Dict[str, Any]
    dependencies: List[str] = None
    created_at: datetime = None
    started_at: datetime = None
    completed_at: datetime = None
    result: Any = None
    error: str = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class AgentCapability:
    name: str
    description: str
    input_types: List[str]
    output_types: List[str]
    risk_level: str  # "low", "medium", "high"
    requires_approval: bool = False

class BaseAgent(ABC):
    """Base class for all agents in the system"""
    
    def __init__(self, agent_id: str, name: str, capabilities: List[AgentCapability]):
        self.agent_id = agent_id
        self.name = name
        self.capabilities = capabilities
        self.status = AgentStatus.IDLE
        self.current_task: Optional[AgentTask] = None
        self.task_history: List[AgentTask] = []
        self.knowledge_base: Dict[str, Any] = {}
        self.logger = logging.getLogger(f"agent.{agent_id}")
        
    @abstractmethod
    async def execute_task(self, task: AgentTask) -> Any:
        """Execute a specific task"""
        pass
    
    @abstractmethod
    async def plan_actions(self, goal: str, context: Dict[str, Any]) -> List[AgentTask]:
        """Plan a sequence of actions to achieve a goal"""
        pass
    
    async def can_handle_task(self, task: AgentTask) -> bool:
        """Check if this agent can handle the given task"""
        return task.type in [cap.name for cap in self.capabilities]
    
    async def start_task(self, task: AgentTask) -> None:
        """Start executing a task"""
        if self.status != AgentStatus.IDLE:
            raise ValueError(f"Agent {self.agent_id} is not idle (current status: {self.status})")
        
        self.current_task = task
        self.status = AgentStatus.EXECUTING
        task.started_at = datetime.utcnow()
        
        self.logger.info(f"Starting task {task.id}: {task.description}")
        
        try:
            result = await self.execute_task(task)
            task.result = result
            task.completed_at = datetime.utcnow()
            self.status = AgentStatus.COMPLETED
            self.logger.info(f"Completed task {task.id}")
            
        except Exception as e:
            task.error = str(e)
            task.completed_at = datetime.utcnow()
            self.status = AgentStatus.FAILED
            self.logger.error(f"Failed task {task.id}: {e}")
            
        finally:
            self.task_history.append(task)
            self.current_task = None
            self.status = AgentStatus.IDLE
    
    async def learn_from_outcome(self, task: AgentTask, feedback: Dict[str, Any]) -> None:
        """Learn from task outcomes to improve future performance"""
        learning_key = f"{task.type}_{task.priority.name}"
        
        if learning_key not in self.knowledge_base:
            self.knowledge_base[learning_key] = {
                "success_count": 0,
                "failure_count": 0,
                "patterns": [],
                "improvements": []
            }
        
        kb_entry = self.knowledge_base[learning_key]
        
        if task.error is None:
            kb_entry["success_count"] += 1
            if feedback.get("user_satisfaction", 0) > 0.8:
                kb_entry["patterns"].append({
                    "context": task.context,
                    "result": task.result,
                    "satisfaction": feedback["user_satisfaction"]
                })
        else:
            kb_entry["failure_count"] += 1
            kb_entry["improvements"].append({
                "error": task.error,
                "context": task.context,
                "suggested_fix": feedback.get("suggested_fix")
            })
    
    def get_success_rate(self, task_type: str = None) -> float:
        """Get success rate for this agent"""
        if task_type:
            tasks = [t for t in self.task_history if t.type == task_type]
        else:
            tasks = self.task_history
            
        if not tasks:
            return 0.0
            
        successful = len([t for t in tasks if t.error is None])
        return successful / len(tasks)
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and statistics"""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "status": self.status.value,
            "capabilities": [cap.name for cap in self.capabilities],
            "success_rate": self.get_success_rate(),
            "tasks_completed": len(self.task_history),
            "current_task": self.current_task.id if self.current_task else None
        }