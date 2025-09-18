import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { apiService } from '../services/api'
import MermaidDiagram from '../components/MermaidDiagram'
import AWSCredentialsWarning from '../components/AWSCredentialsWarning'

interface IncidentRequest {
  service: string
  environment: 'production' | 'staging' | 'development'
  incident_type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  symptoms: string[]
  metrics: {
    error_rate?: string
    response_time?: string
    affected_users?: number
    cpu_usage?: string
    memory_usage?: string
  }
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

interface IncidentRecommendation {
  severity_classification: string
  root_cause: string
  remediation_plan: string[]
  estimated_resolution_time: string
  confidence_score: number
  reasoning: string
}

interface ResponseStatus {
  status: 'idle' | 'analyzing' | 'awaiting_approval' | 'executing' | 'completed' | 'failed'
  current_step: string
  progress: number
  execution_details?: any
}

// Fresh 3-Agent Architecture Diagrams
const INCIDENT_RESPONSE_ARCHITECTURE = `
graph TB
    INCIDENT[Incident Report]
    ORCHESTRATOR[Incident Response Orchestrator]
    
    DA[Detection & Classification Agent<br/>Severity Assessment]
    RCA[Root Cause Analysis Agent<br/>Problem Investigation]
    RA[Remediation Agent<br/>Solution Planning]
    
    BEDROCK[AWS Bedrock<br/>Claude 3.5 Sonnet<br/>Real AI Analysis]
    
    RESULT[Incident Response Plan]
    HUMAN[Human Approval Gateway]
    EXECUTE[Automated Remediation]
    
    INCIDENT --> ORCHESTRATOR
    ORCHESTRATOR --> DA
    DA --> RCA
    RCA --> RA
    RA --> RESULT
    RESULT --> HUMAN
    HUMAN --> EXECUTE
    
    DA -.-> BEDROCK
    RCA -.-> BEDROCK
    RA -.-> BEDROCK
    
    classDef agents fill:#fee2e2,stroke:#dc2626,stroke-width:2px
    classDef aws fill:#ff9800,stroke:#e65100,stroke-width:2px
    classDef flow fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef human fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class INCIDENT,ORCHESTRATOR,RESULT flow
    class DA,RCA,RA agents
    class BEDROCK aws
    class HUMAN,EXECUTE human
`;

const INCIDENT_AGENT_WORKFLOW = `
sequenceDiagram
    participant UI as Frontend UI
    participant ORCH as Incident Orchestrator
    participant DA as Detection Agent
    participant RCA as Root Cause Agent
    participant RA as Remediation Agent
    participant BEDROCK as AWS Bedrock
    participant HUMAN as Human Operator

    UI->>ORCH: Incident Report
    
    Note over BEDROCK: Claude 3.5 Sonnet<br/>Real-time AI Analysis
    
    Note over ORCH: Phase 1: Detection & Classification
    ORCH->>DA: Analyze Incident
    DA->>BEDROCK: Severity Classification Analysis
    BEDROCK-->>DA: P0/P1/P2/P3 Classification
    DA-->>ORCH: Incident Classified
    
    Note over ORCH: Phase 2: Root Cause Analysis
    ORCH->>RCA: Investigate Root Cause
    RCA->>BEDROCK: Deep Problem Analysis
    BEDROCK-->>RCA: Root Cause Findings
    RCA-->>ORCH: Root Cause Identified
    
    Note over ORCH: Phase 3: Remediation Planning
    ORCH->>RA: Plan Remediation
    RA->>BEDROCK: Solution Strategy Analysis
    BEDROCK-->>RA: Remediation Plan
    RA-->>ORCH: Plan Complete
    
    ORCH-->>UI: Final Response Plan
    UI->>HUMAN: Review & Approve
    HUMAN->>UI: Approval Decision
    UI->>ORCH: Execute Remediation
`;

const AGENT_SPECIALIZATION = `
graph LR
    subgraph "Detection & Classification Agent"
        DA1[Incident Severity Assessment]
        DA2[Impact Analysis]
        DA3[Priority Classification]
        DA4[Stakeholder Notification]
    end

    subgraph "Root Cause Analysis Agent"
        RCA1[Log Analysis]
        RCA2[Metric Correlation]
        RCA3[Pattern Recognition]
        RCA4[Failure Point Identification]
    end

    subgraph "Remediation Agent"
        RA1[Solution Strategy]
        RA2[Risk Assessment]
        RA3[Rollback Planning]
        RA4[Recovery Validation]
    end

    DA1 --> RCA1
    DA2 --> RCA2
    DA3 --> RCA3
    DA4 --> RCA4
    
    RCA1 --> RA1
    RCA2 --> RA2
    RCA3 --> RA3
    RCA4 --> RA4
    
    classDef detection fill:#fee2e2,stroke:#dc2626,stroke-width:2px
    classDef rootcause fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef remediation fill:#dcfce7,stroke:#16a34a,stroke-width:2px

    class DA1,DA2,DA3,DA4 detection
    class RCA1,RCA2,RCA3,RCA4 rootcause
    class RA1,RA2,RA3,RA4 remediation
`;

const IncidentResponse: React.FC = () => {
  const [request, setRequest] = useState<IncidentRequest>({
    service: '',
    environment: 'production',
    incident_type: '',
    description: '',
    severity: 'medium',
    symptoms: [],
    metrics: {}
  })

  const [agentExecutions, setAgentExecutions] = useState<AgentExecution[]>([])
  const [recommendation, setRecommendation] = useState<IncidentRecommendation | null>(null)
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 'idle',
    current_step: '',
    progress: 0
  })
  const [humanApproval, setHumanApproval] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'demo' | 'architecture' | 'transparency'>('demo')
  const [showAIPrompts, setShowAIPrompts] = useState(false)
  const [awsCredentialsAvailable, setAwsCredentialsAvailable] = useState<boolean | null>(null)

  // Professional incident scenarios
  const scenarios = {
    database_outage: {
      service: 'UserDatabase',
      environment: 'production' as const,
      incident_type: 'database_outage',
      description: 'Primary database cluster experiencing connection timeouts and high CPU usage',
      severity: 'critical' as const,
      symptoms: ['Connection timeouts', 'High CPU usage (95%)', '502 errors', 'User login failures'],
      metrics: {
        error_rate: '25%',
        response_time: '8000ms',
        affected_users: 5000,
        cpu_usage: '95%',
        memory_usage: '87%'
      }
    },
    api_performance: {
      service: 'PaymentAPI',
      environment: 'production' as const,
      incident_type: 'performance_degradation',
      description: 'Payment processing API showing severe latency spikes and intermittent failures',
      severity: 'high' as const,
      symptoms: ['API latency > 10s', 'Payment timeouts', 'Transaction failures', 'Queue backlog'],
      metrics: {
        error_rate: '12%',
        response_time: '15000ms',
        affected_users: 2500,
        cpu_usage: '78%',
        memory_usage: '92%'
      }
    },
    security_breach: {
      service: 'WebApplication',
      environment: 'production' as const,
      incident_type: 'security_incident',
      description: 'Suspicious authentication attempts and potential data access anomalies detected',
      severity: 'critical' as const,
      symptoms: ['Failed login spikes', 'Unusual data access patterns', 'Security alerts', 'IP blocking triggered'],
      metrics: {
        error_rate: '8%',
        response_time: '3000ms',
        affected_users: 1200,
        cpu_usage: '65%',
        memory_usage: '71%'
      }
    }
  }

  // Check AWS credentials on component mount
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const result = await apiService.checkAWSCredentials()
        setAwsCredentialsAvailable(result.available)
      } catch (error) {
        console.error('Credentials check failed:', error)
        setAwsCredentialsAvailable(true) // Allow demo to proceed
      }
    }
    checkCredentials()
  }, [])

  const loadScenario = (scenarioKey: keyof typeof scenarios) => {
    setRequest(scenarios[scenarioKey])
    resetAnalysis()
  }

  const resetAnalysis = () => {
    setAgentExecutions([])
    setRecommendation(null)
    setResponseStatus({ status: 'idle', current_step: '', progress: 0 })
    setHumanApproval(null)
  }

  const executeIncident3AgentAnalysis = async () => {
    setIsLoading(true)
    setResponseStatus({ status: 'analyzing', current_step: 'Initializing 3-Agent Incident Analysis', progress: 10 })
    
    // Initialize the 3 specialized agents
    const agents: AgentExecution[] = [
      { name: 'Detection & Classification Agent', status: 'pending' },
      { name: 'Root Cause Analysis Agent', status: 'pending' },
      { name: 'Remediation Agent', status: 'pending' }
    ]
    setAgentExecutions(agents)
    
    try {
      // Call the real backend API for 3-agent analysis
      setResponseStatus({ status: 'analyzing', current_step: 'Executing Real AI Analysis with AWS Bedrock', progress: 25 })
      
      const analysisResult = await apiService.analyzeIncidentResponse(request)
      
      if (analysisResult.success) {
        // Update agent executions with real results
        setAgentExecutions(analysisResult.agents.map((agent: any) => ({
          name: agent.name,
          status: 'completed',
          analysis: agent.analysis,
          confidence: agent.confidence,
          execution_time_ms: agent.execution_time_ms,
          bedrock_used: agent.bedrock_used,
          ai_prompt: agent.ai_prompt || `AI Prompt for ${agent.name}`,
          ai_response: agent.ai_response || agent.analysis
        })))
        
        // Set the final recommendation
        setRecommendation(analysisResult.recommendation)
        
        setResponseStatus({ 
          status: 'awaiting_approval', 
          current_step: '3-Agent Analysis Complete - Ready for Review', 
          progress: 100 
        })
      } else {
        throw new Error(analysisResult.error || 'Analysis failed')
      }
      
    } catch (error) {
      console.error('Incident analysis error:', error)
      setResponseStatus({ 
        status: 'failed', 
        current_step: 'Analysis failed', 
        progress: 0 
      })
      setAgentExecutions(prev => prev.map(agent => ({ ...agent, status: 'failed' })))
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (approved: boolean) => {
    setHumanApproval(approved ? 'approved' : 'rejected')
    
    if (!approved) return
    
    setResponseStatus({ status: 'executing', current_step: 'Starting Automated Remediation', progress: 0 })
    
    // Simulate remediation phases
    const phases = [
      { name: 'Isolating affected components', duration: 2000, progress: 25 },
      { name: 'Applying remediation actions', duration: 3000, progress: 60 },
      { name: 'Validating system recovery', duration: 2000, progress: 85 },
      { name: 'Monitoring stability', duration: 1500, progress: 100 }
    ]

    for (const phase of phases) {
      setResponseStatus(prev => ({ 
        ...prev, 
        current_step: phase.name, 
        progress: phase.progress 
      }))
      await new Promise(resolve => setTimeout(resolve, phase.duration))
    }

    // Complete remediation
    setResponseStatus({
      status: 'completed',
      current_step: 'Incident Response Complete - System Recovered',
      progress: 100,
      execution_details: {
        remediation_actions: recommendation?.remediation_plan || [],
        resolution_time: recommendation?.estimated_resolution_time || '15 minutes',
        success_rate: '98%',
        affected_components: request.service
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'text-blue-600'
      case 'awaiting_approval': return 'text-yellow-600'
      case 'executing': return 'text-orange-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Show credentials warning if AWS credentials are not available
  if (awsCredentialsAvailable === false) {
    return <AWSCredentialsWarning demoName="Incident Response with AI" onRetry={() => window.location.reload()} />
  }

  // Show loading while checking credentials
  if (awsCredentialsAvailable === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Checking AWS Credentials...</h2>
          <p className="text-gray-500">Verifying Bedrock access for AI-powered incident response</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident Response with AI</h1>
        <p className="text-gray-600">
          AI-powered 3-agent system for intelligent incident detection, analysis, and automated remediation
        </p>
        
        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'demo'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incident Response
            </button>
            <button
              onClick={() => setActiveTab('transparency')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transparency'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Transparency
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'architecture'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Architecture
            </button>
          </nav>
        </div>
      </div>

      {/* Demo Tab Content */}
      {activeTab === 'demo' && (
        <>
          {/* Quick Scenarios */}
          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Critical Incident Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => loadScenario('database_outage')}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">Database Outage</h3>
                <p className="text-sm text-gray-600 mt-1">Critical P0 - Connection timeouts & high CPU</p>
                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">CRITICAL</span>
              </button>
              <button
                onClick={() => loadScenario('api_performance')}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">API Performance</h3>
                <p className="text-sm text-gray-600 mt-1">High P1 - Payment API latency spikes</p>
                <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">HIGH</span>
              </button>
              <button
                onClick={() => loadScenario('security_breach')}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">Security Incident</h3>
                <p className="text-sm text-gray-600 mt-1">Critical P0 - Suspicious access patterns</p>
                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">CRITICAL</span>
              </button>
            </div>
          </Block>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Form */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">Incident Report</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={request.service}
                    onChange={(e) => setRequest(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., UserDatabase, PaymentAPI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={request.environment}
                    onChange={(e) => setRequest(prev => ({ ...prev, environment: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                  <input
                    type="text"
                    value={request.incident_type}
                    onChange={(e) => setRequest(prev => ({ ...prev, incident_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., database_outage, performance_degradation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={request.description}
                    onChange={(e) => setRequest(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Describe the incident symptoms and impact..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={request.severity}
                    onChange={(e) => setRequest(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affected Users</label>
                  <input
                    type="number"
                    value={request.metrics.affected_users || ''}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      metrics: { ...prev.metrics, affected_users: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Number of affected users"
                  />
                </div>
                
                <button
                  onClick={executeIncident3AgentAnalysis}
                  disabled={isLoading || !request.service || !request.description}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyzing Incident with 3 AI Agents...' : 'Start 3-Agent Incident Analysis'}
                </button>
              </div>
            </Block>

            {/* Analysis Progress */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
              
              {responseStatus.status !== 'idle' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${getStatusColor(responseStatus.status)}`}>
                      {responseStatus.current_step}
                    </span>
                    <span className="text-sm text-gray-500">{responseStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${responseStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Agent Execution Status */}
              {agentExecutions.length > 0 && (
                <div className="space-y-3">
                  {agentExecutions.map((agent, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                          agent.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          agent.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      {agent.status === 'completed' && (
                        <div className="text-sm text-gray-600">
                          <p>Confidence: {((agent.confidence || 0) * 100).toFixed(0)}%</p>
                          <p>Execution: {agent.execution_time_ms}ms</p>
                          {agent.bedrock_used && <p className="text-blue-600">AWS Bedrock: Claude 3.5 Sonnet</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Block>
          </div>

          {/* Recommendation Results */}
          {recommendation && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Incident Response Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assessment Results</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Severity:</span> {recommendation.severity_classification}</p>
                    <p><span className="font-medium">Root Cause:</span> {recommendation.root_cause}</p>
                    <p><span className="font-medium">Resolution Time:</span> {recommendation.estimated_resolution_time}</p>
                    <p><span className="font-medium">Confidence:</span> {(recommendation.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Reasoning</h3>
                  <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Remediation Plan</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {recommendation.remediation_plan.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              
              {humanApproval === null && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => handleApproval(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                  >
                    Approve & Execute
                  </button>
                  <button
                    onClick={() => handleApproval(false)}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {humanApproval === 'approved' && responseStatus.status === 'completed' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Remediation Complete!</h3>
                  <div className="text-sm text-green-800">
                    <p><span className="font-medium">Resolution Time:</span> {responseStatus.execution_details?.resolution_time}</p>
                    <p><span className="font-medium">Success Rate:</span> {responseStatus.execution_details?.success_rate}</p>
                    <p><span className="font-medium">Affected Service:</span> {responseStatus.execution_details?.affected_components}</p>
                  </div>
                </div>
              )}
            </Block>
          )}
        </>
      )}

      {/* AI Transparency Tab */}
      {activeTab === 'transparency' && (
        <Block>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">AI Transparency</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAIPrompts}
                onChange={(e) => setShowAIPrompts(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Show AI Prompts & Responses</span>
            </label>
          </div>
          
          {agentExecutions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Run a 3-agent incident analysis to see AI transparency details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {agentExecutions.map((agent, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{agent.name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Execution Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Status: <span className="font-medium">{agent.status}</span></p>
                        <p>Confidence: <span className="font-medium">{((agent.confidence || 0) * 100).toFixed(0)}%</span></p>
                        <p>Execution Time: <span className="font-medium">{agent.execution_time_ms}ms</span></p>
                        <p>AI Model: <span className="font-medium text-blue-600">AWS Bedrock Claude 3.5 Sonnet</span></p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Analysis Result</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {agent.analysis || 'Analysis in progress...'}
                      </div>
                    </div>
                  </div>
                  
                  {showAIPrompts && agent.ai_prompt && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">AI Prompt</h4>
                      <div className="text-sm text-gray-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                        {agent.ai_prompt}
                      </div>
                    </div>
                  )}
                  
                  {showAIPrompts && agent.ai_response && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">AI Response</h4>
                      <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                        {agent.ai_response}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Block>
      )}

      {/* System Architecture Tab */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <Block>
            <h2 className="text-xl font-semibold mb-4">3-Agent Incident Response Architecture</h2>
            <MermaidDiagram chart={INCIDENT_RESPONSE_ARCHITECTURE} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Agent Workflow Sequence</h2>
            <MermaidDiagram chart={INCIDENT_AGENT_WORKFLOW} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Agent Specialization</h2>
            <MermaidDiagram chart={AGENT_SPECIALIZATION} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Detection & Classification Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Incident severity assessment (P0-P3)</li>
                  <li>• Impact analysis and user impact</li>
                  <li>• Priority classification and routing</li>
                  <li>• Stakeholder notification planning</li>
                  <li>• SLA breach risk evaluation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">Root Cause Analysis Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Log pattern analysis and correlation</li>
                  <li>• Metric anomaly detection</li>
                  <li>• Historical pattern recognition</li>
                  <li>• Failure point identification</li>
                  <li>• Dependency mapping analysis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Remediation Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Solution strategy development</li>
                  <li>• Risk assessment for fixes</li>
                  <li>• Rollback planning and safety</li>
                  <li>• Recovery validation steps</li>
                  <li>• Post-incident prevention measures</li>
                </ul>
              </div>
            </div>
          </Block>
        </div>
      )}
    </div>
  )
}

export default IncidentResponse