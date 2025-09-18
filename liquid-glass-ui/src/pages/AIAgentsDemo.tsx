import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { apiService } from '../services/api'
import AWSCredentialsWarning from '../components/AWSCredentialsWarning'

// Agent Pattern Types
interface AgentPattern {
  id: string
  name: string
  description: string
  use_cases: string[]
  advantages: string[]
  considerations: string[]
}

interface AgentExecution {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  analysis?: string
  confidence?: number
  execution_time_ms?: number
  bedrock_used?: boolean
  ai_prompt?: string
  ai_response?: string
}

const AIAgentsDemo: React.FC = () => {
  // Navigation State
  const [activeSection, setActiveSection] = useState<'overview' | 'patterns' | 'memory' | 'collaboration' | 'example' | 'implementation'>('overview')
  
  // AWS Credentials
  const [awsCredentialsAvailable, setAwsCredentialsAvailable] = useState<boolean | null>(null)

  // Agent Patterns Data
  const agentPatterns: AgentPattern[] = [
    {
      id: 'sequential',
      name: 'Sequential Workflow Pattern',
      description: 'Agents execute in a defined order, with each building on previous results',
      use_cases: [
        'Data processing pipelines',
        'Step-by-step analysis workflows',
        'Document generation processes',
        'Quality assurance chains'
      ],
      advantages: [
        'Predictable execution flow',
        'Easy to debug and monitor',
        'Clear dependency management',
        'Suitable for linear processes'
      ],
      considerations: [
        'Can be slower than parallel execution',
        'Single point of failure in chain',
        'Limited flexibility for dynamic routing'
      ]
    },
    {
      id: 'branching',
      name: 'Branching Workflow Pattern',
      description: 'Conditional logic routes execution to different agents based on criteria',
      use_cases: [
        'Incident severity routing',
        'Content classification systems',
        'Risk assessment workflows',
        'Adaptive processing pipelines'
      ],
      advantages: [
        'Dynamic routing capabilities',
        'Optimized resource utilization',
        'Specialized agent deployment',
        'Flexible decision trees'
      ],
      considerations: [
        'Complex routing logic',
        'Potential for routing errors',
        'Requires robust condition evaluation'
      ]
    },
    {
      id: 'cyclic',
      name: 'Cyclic Workflow Pattern',
      description: 'Feedback loops enable iterative improvement and validation',
      use_cases: [
        'Performance optimization loops',
        'Quality improvement processes',
        'Continuous learning systems',
        'Validation and refinement workflows'
      ],
      advantages: [
        'Continuous improvement capability',
        'Self-correcting mechanisms',
        'Adaptive learning integration',
        'Quality assurance built-in'
      ],
      considerations: [
        'Risk of infinite loops',
        'Convergence criteria needed',
        'Resource consumption monitoring required'
      ]
    },
    {
      id: 'parallel',
      name: 'Parallel Workflow Pattern',
      description: 'Multiple agents execute simultaneously for efficiency and speed',
      use_cases: [
        'Multi-dimensional analysis',
        'Independent task processing',
        'Distributed data collection',
        'Concurrent validation checks'
      ],
      advantages: [
        'Maximum execution speed',
        'Resource parallelization',
        'Independent failure isolation',
        'Scalable architecture'
      ],
      considerations: [
        'Synchronization complexity',
        'Resource contention management',
        'Result aggregation challenges'
      ]
    }
  ]

  // Check AWS credentials on component mount
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const result = await apiService.checkAWSCredentials()
        setAwsCredentialsAvailable(result.available)
      } catch (error) {
        console.error('Credentials check failed:', error)
        setAwsCredentialsAvailable(true) // Proceed with demo
      }
    }
    checkCredentials()
  }, [])

  // Show credentials warning if AWS credentials are not available
  if (awsCredentialsAvailable === false) {
    return <AWSCredentialsWarning demoName="AI Agents Demo" onRetry={() => window.location.reload()} />
  }

  // Show loading while checking credentials
  if (awsCredentialsAvailable === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">Loading...</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Initializing AI Agents Demo...</h2>
          <p className="text-gray-500">Preparing comprehensive agent patterns and examples</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Agents Patterns & Architecture
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive guide to AI agent workflows, memory management, and multi-agent collaboration
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            {[
              { id: 'overview', label: 'Agent Fundamentals' },
              { id: 'patterns', label: 'Workflow Patterns' },
              { id: 'memory', label: 'Memory Management' },
              { id: 'collaboration', label: 'Multi-Agent Systems' },
              { id: 'example', label: 'Complete Example' },
              { id: 'implementation', label: 'Implementation Guide' }
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        
        {/* Agent Fundamentals Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">AI Agent Core Architecture</h2>
              <p className="text-gray-600 mb-6">
                Modern AI agents are built on three fundamental components that work together to enable autonomous 
                decision-making, tool usage, and complex task execution.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">AI Model</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    The reasoning engine that processes information, makes decisions, and generates responses.
                  </p>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• Claude 3.5 Sonnet (AWS Bedrock)</li>
                    <li>• GPT-4 (OpenAI)</li>
                    <li>• Llama (Meta/Ollama)</li>
                    <li>• Custom fine-tuned models</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Tool Integration</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Functions and APIs that agents can call to interact with external systems.
                  </p>
                  <ul className="text-green-600 text-sm space-y-1">
                    <li>• Built-in tools (web search, calculations)</li>
                    <li>• Custom Python functions (@tool decorator)</li>
                    <li>• MCP servers (database, API access)</li>
                    <li>• External service integrations</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">System Prompt</h3>
                  <p className="text-purple-700 text-sm mb-3">
                    Instructions that define the agent's behavior, goals, and operational constraints.
                  </p>
                  <ul className="text-purple-600 text-sm space-y-1">
                    <li>• Role and responsibility definition</li>
                    <li>• Behavioral guidelines and constraints</li>
                    <li>• Context and domain knowledge</li>
                    <li>• Output format specifications</li>
                  </ul>
                </div>
              </div>
            </Block>
            
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Key Principles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-3">Model-Driven Approach</h3>
                  <p className="text-yellow-700 text-sm">
                    Leverage advanced LLM reasoning capabilities instead of complex orchestration logic. 
                    Let the AI model handle planning, tool selection, and decision-making for more flexible 
                    and intelligent agent behavior.
                  </p>
                </div>
                
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-3">Context & Memory</h3>
                  <p className="text-indigo-700 text-sm">
                    Maintain context across interactions through sophisticated memory management. 
                    Agents can remember past conversations, learn from experience, and maintain 
                    state across complex multi-step workflows.
                  </p>
                </div>
              </div>
            </Block>
          </div>
        )}

        {/* Workflow Patterns Section */}
        {activeSection === 'patterns' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Agent Workflow Patterns</h2>
              <p className="text-gray-600 mb-6">
                Different workflow patterns enable various agent collaboration and execution strategies. 
                Each pattern is optimized for specific use cases and operational requirements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agentPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">{pattern.name}</h3>
                    <p className="text-gray-600 mb-4">{pattern.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-800 mb-2">Use Cases</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pattern.use_cases.map((useCase, index) => (
                            <li key={index}>• {useCase}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-green-800 mb-2">Advantages</h4>
                        <ul className="text-sm text-green-600 space-y-1">
                          {pattern.advantages.map((advantage, index) => (
                            <li key={index}>• {advantage}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-orange-800 mb-2">Considerations</h4>
                        <ul className="text-sm text-orange-600 space-y-1">
                          {pattern.considerations.map((consideration, index) => (
                            <li key={index}>• {consideration}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          </div>
        )}

        {/* Memory Management Section */}
        {activeSection === 'memory' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Agent Memory Management</h2>
              <p className="text-gray-600 mb-6">
                Sophisticated memory systems enable agents to maintain context, learn from experience, 
                and persist important information across sessions and workflows.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-4">Short-term Memory</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Maintains current conversation context and immediate working state during active sessions.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-100 p-3 rounded">
                      <h4 className="font-medium text-green-800 text-sm mb-1">Current Context</h4>
                      <p className="text-green-600 text-xs">Active conversation thread, user preferences, current task state</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded">
                      <h4 className="font-medium text-green-800 text-sm mb-1">Working Variables</h4>
                      <p className="text-green-600 text-xs">Temporary data, intermediate results, processing state</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-4">Long-term Memory</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Stores learned patterns, historical data, and accumulated knowledge for continuous improvement.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-blue-100 p-3 rounded">
                      <h4 className="font-medium text-blue-800 text-sm mb-1">Knowledge Base</h4>
                      <p className="text-blue-600 text-xs">Domain expertise, learned patterns, best practices</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded">
                      <h4 className="font-medium text-blue-800 text-sm mb-1">User Preferences</h4>
                      <p className="text-blue-600 text-xs">Individual user patterns, communication style, preferences</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-4">Persistent State</h3>
                  <p className="text-purple-700 text-sm mb-4">
                    External storage systems that survive agent restarts and enable cross-session continuity.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-purple-100 p-3 rounded">
                      <h4 className="font-medium text-purple-800 text-sm mb-1">Database Storage</h4>
                      <p className="text-purple-600 text-xs">Structured data, workflow state, audit trails</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded">
                      <h4 className="font-medium text-purple-800 text-sm mb-1">File Systems</h4>
                      <p className="text-purple-600 text-xs">Documents, configurations, cached results</p>
                    </div>
                  </div>
                </div>
              </div>
            </Block>
          </div>
        )}

        {/* Multi-Agent Collaboration Section */}
        {activeSection === 'collaboration' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Multi-Agent Collaboration</h2>
              <p className="text-gray-600 mb-6">
                Complex systems leverage multiple specialized agents that communicate and coordinate 
                to solve sophisticated problems requiring diverse expertise and parallel processing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Orchestrator Agents</h3>
                    <p className="text-gray-600 mb-4">
                      Coordinate workflows and manage communication between specialist agents.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">Responsibilities</h4>
                      <ul className="text-purple-600 text-sm space-y-1">
                        <li>• Task routing and load balancing</li>
                        <li>• Result aggregation and synthesis</li>
                        <li>• Conflict resolution and prioritization</li>
                        <li>• Workflow state management</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Communication Infrastructure</h3>
                    <p className="text-gray-600 mb-4">
                      Standardized protocols and systems for agent interaction and data sharing.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Components</h4>
                      <ul className="text-green-600 text-sm space-y-1">
                        <li>• Message buses for asynchronous communication</li>
                        <li>• Shared state stores for context synchronization</li>
                        <li>• Event systems for real-time notifications</li>
                        <li>• Agent2Agent (A2A) protocol support</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Specialist Agents</h3>
                    <p className="text-gray-600 mb-4">
                      Domain-focused agents with deep expertise and specialized toolsets.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium text-blue-800 text-sm">Data Analysis Agent</h4>
                        <p className="text-blue-600 text-xs">Statistical processing, pattern recognition, data visualization</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <h4 className="font-medium text-red-800 text-sm">Security Agent</h4>
                        <p className="text-red-600 text-xs">Threat assessment, vulnerability analysis, compliance checks</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <h4 className="font-medium text-yellow-800 text-sm">Performance Agent</h4>
                        <p className="text-yellow-600 text-xs">Optimization analysis, resource monitoring, bottleneck detection</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded">
                        <h4 className="font-medium text-indigo-800 text-sm">Cost Agent</h4>
                        <p className="text-indigo-600 text-xs">Financial analysis, resource optimization, budget planning</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Human-in-the-Loop Integration</h3>
                    <p className="text-gray-600 mb-4">
                      Strategic human oversight points for critical decisions and continuous learning.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">Integration Patterns</h4>
                      <ul className="text-orange-600 text-sm space-y-1">
                        <li>• Approval gates for critical decisions</li>
                        <li>• Feedback loops for continuous improvement</li>
                        <li>• Escalation paths for complex issues</li>
                        <li>• Learning from human expertise</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Block>
          </div>
        )}

        {/* Complete Example Section */}
        {activeSection === 'example' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Complete Example: Database Performance Optimization</h2>
              <p className="text-gray-600 mb-6">
                This comprehensive example demonstrates all AI agent concepts working together in a real-world 
                database performance incident response scenario, showcasing sequential workflows, branching logic, 
                human oversight, memory management, and multi-agent collaboration.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Scenario</h3>
                <p className="text-blue-700">
                  A critical database performance alert is triggered in production. Multiple specialized agents 
                  collaborate to diagnose the issue, analyze root causes, plan remediation, execute fixes, 
                  and learn from the incident to prevent future occurrences.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-blue-600 mb-3">Phase 1: Detection</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Triage Agent</h4>
                      <p className="text-xs text-gray-600">Classifies severity and impact using historical patterns</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Data Collection Agent</h4>
                      <p className="text-xs text-gray-600">Gathers metrics, logs, and system state via MCP servers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-green-600 mb-3">Phase 2: Analysis</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Root Cause Agent</h4>
                      <p className="text-xs text-gray-600">AI-powered pattern recognition and historical comparison</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Correlation Agent</h4>
                      <p className="text-xs text-gray-600">Cross-system analysis and dependency mapping</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-orange-600 mb-3">Phase 3: Decision</h3>
                  <div className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Branching Logic</h4>
                      <p className="text-xs text-gray-600">Routes based on severity and complexity assessment</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Human Review</h4>
                      <p className="text-xs text-gray-600">Expert oversight for critical or complex issues</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-purple-600 mb-3">Phase 4: Execution</h3>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Execution Agent</h4>
                      <p className="text-xs text-gray-600">Implements approved remediation with change management</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Validation Agent</h4>
                      <p className="text-xs text-gray-600">Verifies fixes and monitors for regressions</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-indigo-600 mb-3">Phase 5: Learning</h3>
                  <div className="space-y-3">
                    <div className="bg-indigo-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Documentation Agent</h4>
                      <p className="text-xs text-gray-600">Records incident details and resolution steps</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded">
                      <h4 className="font-medium text-sm">Learning Agent</h4>
                      <p className="text-xs text-gray-600">Updates knowledge base with new patterns</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-600 mb-3">Concepts Demonstrated</h3>
                  <div className="space-y-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Sequential Flow</span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Branching Logic</span>
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Human-in-Loop</span>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Cyclic Validation</span>
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Memory Management</span>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Multi-Agent Collaboration</span>
                  </div>
                </div>
              </div>
            </Block>
          </div>
        )}

        {/* Implementation Guide Section */}
        {activeSection === 'implementation' && (
          <div className="space-y-8">
            <Block>
              <h2 className="text-2xl font-semibold mb-6">Implementation Guide</h2>
              <p className="text-gray-600 mb-8">
                Practical guidance for implementing AI agent systems using modern frameworks and best practices.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-4">Strands Agents Framework</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      This project uses AWS Strands Agents SDK for production-ready agent deployment.
                    </p>
                    <ul className="text-blue-600 text-sm space-y-2">
                      <li>• Model-driven approach with advanced LLM reasoning</li>
                      <li>• Native tool-use capabilities with MCP integration</li>
                      <li>• Enterprise security and compliance features</li>
                      <li>• Scalable multi-region deployment support</li>
                      <li>• Built-in monitoring and observability</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-4">Tool Development</h3>
                    <p className="text-green-700 text-sm mb-4">
                      Create custom tools using Python decorators and MCP servers.
                    </p>
                    <div className="bg-green-100 p-4 rounded text-sm font-mono">
                      @tool<br/>
                      def analyze_performance(metrics: dict) -&gt; dict:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;"""Analyze database performance metrics"""<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;return process_metrics(metrics)
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-4">Deployment Checklist</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-yellow-700 text-sm">Configure AWS Bedrock access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-yellow-700 text-sm">Set up MCP servers for tools</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-yellow-700 text-sm">Implement monitoring and logging</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-yellow-700 text-sm">Configure human approval workflows</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-yellow-700 text-sm">Test error handling scenarios</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-4">Best Practices</h3>
                    <ul className="text-purple-600 text-sm space-y-2">
                      <li>• Start with simple sequential workflows</li>
                      <li>• Add human oversight for critical decisions</li>
                      <li>• Use specialized agents for different domains</li>
                      <li>• Implement comprehensive testing strategies</li>
                      <li>• Monitor agent performance and costs</li>
                      <li>• Plan for scaling and load management</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-gray-50 border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Architecture Considerations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Performance</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Parallel agent execution</li>
                      <li>• Caching for expensive operations</li>
                      <li>• Streaming for long-running tasks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Security</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Input validation and sanitization</li>
                      <li>• Role-based access control</li>
                      <li>• Audit logging for all actions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Observability</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Real-time execution tracking</li>
                      <li>• Performance metrics and alerting</li>
                      <li>• Distributed tracing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Block>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAgentsDemo