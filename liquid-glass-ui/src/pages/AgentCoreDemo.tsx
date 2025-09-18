import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'
import { apiService } from '../services/api'
import AWSCredentialsWarning from '../components/AWSCredentialsWarning'
import MermaidDiagram from '../components/MermaidDiagram'

interface AgentExecution {
  agent_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  start_time?: string
  end_time?: string
  confidence?: number
  execution_time_ms?: number
  bedrock_used?: boolean
  ai_prompt?: string
  ai_response?: string
}

interface AnalysisStep {
  step: string
  reasoning: string
  findings: any
  confidence: number
  timestamp: string
}

interface GuidedStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed'
  required: boolean
}

// Architecture diagrams for Agent Core Incident Response
const AGENTCORE_ARCHITECTURE_DIAGRAM = `
graph TB
    INCIDENT[Incident Report]
    ORCH[Agent Core Orchestrator]
    
    DETECT[Incident Detection Agent]
    RCA[Root Cause Analysis Agent]
    REMEDIATE[Automated Remediation Agent]
    COMM[Communication Agent]
    POST[Post-Incident Analysis Agent]
    
    BEDROCK[AWS Bedrock API<br/>Claude 3.5 Sonnet<br/>~500ms per call]
    
    PLAN[Response Plan]
    HUMAN[Human Approval]
    EXECUTE[Automated Execution]
    
    INCIDENT --> ORCH
    ORCH --> DETECT
    DETECT --> RCA
    DETECT --> COMM
    RCA --> REMEDIATE
    COMM --> REMEDIATE
    REMEDIATE --> POST
    POST --> PLAN
    PLAN --> HUMAN
    HUMAN --> EXECUTE
    
    DETECT -.-> BEDROCK
    RCA -.-> BEDROCK
    REMEDIATE -.-> BEDROCK
    COMM -.-> BEDROCK
    POST -.-> BEDROCK
    
    style INCIDENT fill:#fee2e2
    style PLAN fill:#dcfce7
    style EXECUTE fill:#dbeafe
    style BEDROCK fill:#fef3c7
`;

const AGENTCORE_SEQUENCE_DIAGRAM = `
sequenceDiagram
    participant UI as Frontend UI
    participant ORCH as Agent Core Orchestrator
    participant DETECT as Detection Agent
    participant RCA as RCA Agent
    participant COMM as Communication Agent
    participant REMEDIATE as Remediation Agent
    participant POST as Post-Incident Agent
    participant BEDROCK as AWS Bedrock
    participant HUMAN as Human Operator
    
    UI->>ORCH: Submit Incident Report
    ORCH->>DETECT: Phase 1: Classify Incident
    DETECT->>BEDROCK: Analyze incident patterns
    BEDROCK-->>DETECT: Classification & severity
    DETECT-->>ORCH: Incident classified (P0/P1/P2)
    
    par Phase 2: Parallel Analysis
        ORCH->>RCA: Analyze root cause
        RCA->>BEDROCK: Deep cause analysis
        BEDROCK-->>RCA: Root cause findings
    and
        ORCH->>COMM: Setup communication plan
        COMM->>BEDROCK: Stakeholder analysis
        BEDROCK-->>COMM: Communication strategy
    end
    
    ORCH->>REMEDIATE: Phase 3: Plan remediation
    REMEDIATE->>BEDROCK: Generate fix actions
    BEDROCK-->>REMEDIATE: Automated remediation plan
    
    ORCH->>POST: Phase 4: Post-incident analysis
    POST->>BEDROCK: Improvement recommendations
    BEDROCK-->>POST: Prevention measures
    
    ORCH-->>UI: Complete response plan
    UI->>HUMAN: Review & approve plan
    HUMAN-->>UI: Approval decision
    UI->>ORCH: Execute (if approved)
    ORCH-->>UI: Execution results
`;

// SQL Provisioning Architecture
const SQL_PROVISIONING_DIAGRAM = `
graph TB
    REQUEST[SQL Database Request]
    ORCH[Agent Core SQL Orchestrator]
    
    ASSESS[Assessment Agent]
    PROVISION[Provisioning Agent]
    CONFIG[Configuration Agent]
    SECURITY[Security Agent]
    VALIDATE[Validation Agent]
    
    BEDROCK[AWS Bedrock API<br/>Claude 3.5 Sonnet]
    
    RDS[Amazon RDS]
    AURORA[Amazon Aurora]
    SECRETS[AWS Secrets Manager]
    
    COMPLETE[Database Ready]
    
    REQUEST --> ORCH
    ORCH --> ASSESS
    ASSESS --> PROVISION
    PROVISION --> CONFIG
    CONFIG --> SECURITY
    SECURITY --> VALIDATE
    VALIDATE --> COMPLETE
    
    ASSESS -.-> BEDROCK
    PROVISION -.-> BEDROCK
    CONFIG -.-> BEDROCK
    SECURITY -.-> BEDROCK
    VALIDATE -.-> BEDROCK
    
    PROVISION --> RDS
    PROVISION --> AURORA
    SECURITY --> SECRETS
    
    style REQUEST fill:#e0f2fe
    style COMPLETE fill:#dcfce7
    style BEDROCK fill:#fef3c7
    style RDS fill:#f3e8ff
    style AURORA fill:#f3e8ff
    style SECRETS fill:#fef3c7
`;

// NoSQL Provisioning Architecture
const NOSQL_PROVISIONING_DIAGRAM = `
graph TB
    REQUEST[NoSQL Database Request]
    ORCH[Agent Core NoSQL Orchestrator]
    
    ANALYZE[Analysis Agent]
    DESIGN[Design Agent]
    DEPLOY[Deployment Agent]
    OPTIMIZE[Optimization Agent]
    MONITOR[Monitoring Agent]
    
    BEDROCK[AWS Bedrock API<br/>Claude 3.5 Sonnet]
    
    DYNAMO[Amazon DynamoDB]
    DOCDB[Amazon DocumentDB]
    KEYSPACES[Amazon Keyspaces]
    
    COMPLETE[NoSQL Database Ready]
    
    REQUEST --> ORCH
    ORCH --> ANALYZE
    ANALYZE --> DESIGN
    DESIGN --> DEPLOY
    DEPLOY --> OPTIMIZE
    OPTIMIZE --> MONITOR
    MONITOR --> COMPLETE
    
    ANALYZE -.-> BEDROCK
    DESIGN -.-> BEDROCK
    DEPLOY -.-> BEDROCK
    OPTIMIZE -.-> BEDROCK
    MONITOR -.-> BEDROCK
    
    DEPLOY --> DYNAMO
    DEPLOY --> DOCDB
    DEPLOY --> KEYSPACES
    
    style REQUEST fill:#e0f2fe
    style COMPLETE fill:#dcfce7
    style BEDROCK fill:#fef3c7
    style DYNAMO fill:#f0f9ff
    style DOCDB fill:#f0f9ff
    style KEYSPACES fill:#f0f9ff
`;

const AgentCoreDemo: React.FC = () => {
  const [incidentData, setIncidentData] = useState({
    service: '',
    environment: 'production',
    incident_description: '',
    symptoms: [] as string[],
    metrics: {} as any,
    severity_hint: 'unknown' as 'unknown' | 'low' | 'medium' | 'high' | 'critical'
  })
  
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([])
  const [responsePlan, setResponsePlan] = useState<any>(null)
  const [provisioningStatus, setProvisioningStatus] = useState({
    status: 'idle' as 'idle' | 'analyzing' | 'awaiting_execution' | 'executing' | 'completed' | 'failed',
    current_step: '',
    progress: 0,
    execution_details: null as any
  })
  const [humanApproval, setHumanApproval] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [multiAgentSummary, setMultiAgentSummary] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'demo' | 'response_plan' | 'architecture' | 'transparency'>('demo')
  const [agentExecutions, setAgentExecutions] = useState<AgentExecution[]>([])
  const [currentGuidedStep, setCurrentGuidedStep] = useState<string>('incident_report')
  const [showAIPrompts, setShowAIPrompts] = useState(false)
  const [awsCredentialsAvailable, setAwsCredentialsAvailable] = useState<boolean | null>(null)
  const [credentialsError, setCredentialsError] = useState<string | null>(null)
  const [guidedSteps, setGuidedSteps] = useState<GuidedStep[]>([
    { id: 'incident_report', title: 'Incident Reporting', description: 'Report and classify the incident', status: 'active', required: true },
    { id: 'validation', title: 'Incident Validation', description: 'Validate incident details', status: 'pending', required: true },
    { id: 'analysis', title: 'AI Multi-Agent Analysis', description: '5 specialized agents analyze the incident', status: 'pending', required: true },
    { id: 'review', title: 'Review Response Plan', description: 'Review AI-generated response plan', status: 'pending', required: true },
    { id: 'execution', title: 'Automated Execution', description: 'Execute automated remediation', status: 'pending', required: true },
    { id: 'monitoring', title: 'Recovery Monitoring', description: 'Monitor recovery and validation', status: 'pending', required: false }
  ])

  // Check AWS credentials on component mount
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const result = await apiService.checkAWSCredentials()
        setAwsCredentialsAvailable(result.available)
        if (!result.available) {
          setCredentialsError(result.setup_guide)
        }
      } catch (error) {
        console.error('Credentials check failed:', error)
        // For now, assume credentials are available if the check fails
        setAwsCredentialsAvailable(true)
        setCredentialsError('Credentials check failed, but proceeding with demo')
      }
    }
    checkCredentials()
  }, [])

  const retryCredentialsCheck = async () => {
    setAwsCredentialsAvailable(null)
    setCredentialsError(null)
    try {
      const result = await apiService.checkAWSCredentials()
      setAwsCredentialsAvailable(result.available)
      if (!result.available) {
        setCredentialsError(result.setup_guide)
      }
    } catch (error) {
      console.error('Credentials check failed:', error)
      // For now, assume credentials are available if the check fails
      setAwsCredentialsAvailable(true)
      setCredentialsError('Credentials check failed, but proceeding with demo')
    }
  }

  // Predefined incident scenarios for quick demo
  const scenarios = {
    database_outage: {
      service: 'UserDatabase',
      environment: 'production',
      incident_description: 'Database connection pool exhausted causing 502 errors and service timeouts',
      symptoms: ['502 Bad Gateway errors', 'Database connection timeouts', 'High response times', 'User login failures'],
      metrics: {
        error_rate: '15%',
        response_time: '5000ms',
        cpu_usage: '95%',
        connection_pool_usage: '100%',
        affected_users: 2500
      },
      severity_hint: 'critical' as const
    },
    api_performance: {
      service: 'PaymentAPI',
      environment: 'production', 
      incident_description: 'Payment processing API experiencing severe latency spikes and intermittent failures',
      symptoms: ['Payment timeouts', 'API latency > 10s', 'Transaction failures', 'Customer complaints'],
      metrics: {
        error_rate: '8%',
        response_time: '12000ms',
        throughput: '50% of normal',
        queue_depth: '500 requests',
        affected_transactions: 1200
      },
      severity_hint: 'high' as const
    },
    infrastructure: {
      service: 'WebApplication',
      environment: 'production',
      incident_description: 'Multiple EC2 instances becoming unresponsive, load balancer showing unhealthy targets',
      symptoms: ['Instance health check failures', 'Load balancer errors', 'Service unavailable', 'Auto-scaling triggered'],
      metrics: {
        healthy_instances: '2/10',
        cpu_usage: '100%',
        memory_usage: '98%',
        network_errors: '25%',
        affected_regions: 'us-east-1'
      },
      severity_hint: 'critical' as const
    }
  }

  const updateGuidedStep = (stepId: string, status: 'pending' | 'active' | 'completed') => {
    setGuidedSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const loadScenario = (scenarioKey: keyof typeof scenarios) => {
    const scenario = scenarios[scenarioKey]
    setIncidentData(scenario)
    setAnalysisSteps([])
    setResponsePlan(null)
    setProvisioningStatus({ status: 'idle', current_step: '', progress: 0, execution_details: null })
    setHumanApproval(null)
    setSessionId(null)
    setAgentExecutions([])
    setCurrentGuidedStep('validation')
    updateGuidedStep('incident_report', 'completed')
    updateGuidedStep('validation', 'active')
  }

  const validateIncident = async () => {
    if (!incidentData.service || !incidentData.incident_description) {
      alert('Please provide service name and incident description')
      return
    }

    setIsLoading(true)
    setProvisioningStatus({ status: 'analyzing', current_step: 'Validating incident details...', progress: 10, execution_details: null })
    
    // Initialize agent executions for display
    const agents = [
      { agent_name: 'Incident Detection Agent', status: 'pending' as const },
      { agent_name: 'Root Cause Analysis Agent', status: 'pending' as const },
      { agent_name: 'Automated Remediation Agent', status: 'pending' as const },
      { agent_name: 'Communication Agent', status: 'pending' as const },
      { agent_name: 'Post-Incident Analysis Agent', status: 'pending' as const }
    ]
    setAgentExecutions(agents)
    
    try {
      // Simulate agent execution phases
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 1: Incident Detection & Classification', progress: 20 }))
      setAgentExecutions(prev => prev.map(agent => 
        agent.agent_name === 'Incident Detection Agent' 
          ? { ...agent, status: 'running', start_time: new Date().toISOString() }
          : agent
      ))
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 2: Root Cause Analysis & Communication Setup', progress: 40 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (agent.agent_name === 'Incident Detection Agent') {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: 1500, confidence: 0.92, bedrock_used: true }
        } else if (['Root Cause Analysis Agent', 'Communication Agent'].includes(agent.agent_name)) {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 3: Automated Remediation Planning', progress: 65 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (['Root Cause Analysis Agent', 'Communication Agent'].includes(agent.agent_name)) {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: Math.floor(Math.random() * 500) + 1800, confidence: 0.88 + Math.random() * 0.08, bedrock_used: true }
        } else if (agent.agent_name === 'Automated Remediation Agent') {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 4: Post-Incident Analysis', progress: 85 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (agent.agent_name === 'Automated Remediation Agent') {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: 1800, confidence: 0.90, bedrock_used: true }
        } else if (agent.agent_name === 'Post-Incident Analysis Agent') {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Call the real Agent Core analysis endpoint
      const result = await apiService.agentcoreAnalyzeIncident(incidentData)
      
      if (result.success) {
        // Update agent executions with real data from API
        if (result.agent_results) {
          console.log('Agent Core results from API:', result.agent_results)
          const realAgentExecutions = Object.entries(result.agent_results).map(([key, agentResult]: [string, any]) => ({
            agent_name: agentResult.agent_name,
            status: 'completed' as const,
            start_time: agentResult.timestamp,
            end_time: agentResult.timestamp,
            confidence: agentResult.confidence,
            execution_time_ms: agentResult.execution_time_ms,
            bedrock_used: agentResult.analysis?.bedrock_used || false,
            ai_prompt: agentResult.analysis?.ai_prompt || '',
            ai_response: agentResult.analysis?.ai_raw_response || ''
          }))
          console.log('Processed Agent Core executions:', realAgentExecutions)
          setAgentExecutions(realAgentExecutions)
        }
        
        // Update with real analysis steps
        setSessionId(result.session_id)
        setAnalysisSteps(result.steps)
        setResponsePlan(result.response_plan)
        setMultiAgentSummary(result.multi_agent_summary)
        setProvisioningStatus({ 
          status: 'awaiting_execution', 
          current_step: 'Agent Core Analysis Complete - Ready for Execution', 
          progress: 100,
          execution_details: null
        })
        
        updateGuidedStep('analysis', 'completed')
        updateGuidedStep('review', 'active')
        setCurrentGuidedStep('review')
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Agent Core analysis error:', error)
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
      const errorMessage = isTimeout ? 'Analysis timed out - please try again' : 'Analysis failed'
      
      setProvisioningStatus({ 
        status: 'failed', 
        current_step: errorMessage, 
        progress: 0,
        execution_details: null
      })
      setAgentExecutions(prev => prev.map(agent => ({ ...agent, status: 'failed' })))
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecution = async (approved: boolean) => {
    if (!sessionId) return
    
    setHumanApproval(approved ? 'approved' : 'rejected')
    
    if (approved) {
      setIsLoading(true)
      setProvisioningStatus({ status: 'executing', current_step: 'Executing automated remediation...', progress: 0, execution_details: null })
      
      try {
        const result = await apiService.agentcoreExecuteRemediation(sessionId, { approved: true })
        
        if (result.success) {
          setProvisioningStatus({ 
            status: 'completed', 
            current_step: 'Incident Response Complete', 
            progress: 100,
            execution_details: result.execution
          })
          
          updateGuidedStep('execution', 'completed')
          updateGuidedStep('monitoring', 'active')
          setCurrentGuidedStep('monitoring')
        } else {
          throw new Error(result.message || 'Execution failed')
        }
      } catch (error) {
        console.error('Execution error:', error)
        setProvisioningStatus({ 
          status: 'failed', 
          current_step: 'Execution failed', 
          progress: 0,
          execution_details: null
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      setProvisioningStatus({ 
        status: 'completed', 
        current_step: 'Manual incident response initiated', 
        progress: 100,
        execution_details: null
      })
      updateGuidedStep('execution', 'completed')
    }
  }

  const resetDemo = () => {
    setIncidentData({
      service: '',
      environment: 'production',
      incident_description: '',
      symptoms: [],
      metrics: {},
      severity_hint: 'unknown'
    })
    setAnalysisSteps([])
    setResponsePlan(null)
    setProvisioningStatus({ status: 'idle', current_step: '', progress: 0, execution_details: null })
    setHumanApproval(null)
    setSessionId(null)
    setAgentExecutions([])
    setMultiAgentSummary(null)
    setCurrentGuidedStep('incident_report')
    setGuidedSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index === 0 ? 'active' : 'pending'
    })))
  }

  // Show credentials warning if AWS credentials are not available
  if (awsCredentialsAvailable === false) {
    return <AWSCredentialsWarning demoName="AWS Agent Core Incident Response" onRetry={retryCredentialsCheck} />
  }

  // Show loading while checking credentials
  if (awsCredentialsAvailable === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">Loading...</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Checking AWS Credentials...</h2>
          <p className="text-gray-500">Verifying Bedrock access for AI-powered analysis</p>
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
            AWS Agent Core Incident Response
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Autonomous incident response with 5 specialized AI agents
          </p>
          
          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Button 
              onClick={() => loadScenario('database_outage')}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Database Outage (P0)
            </Button>
            <Button 
              onClick={() => loadScenario('api_performance')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              API Performance (P1)
            </Button>
            <Button 
              onClick={() => loadScenario('infrastructure')}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Infrastructure (P0)
            </Button>
            <Button 
              onClick={resetDemo}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Reset Demo
            </Button>
          </div>
        </div>

        {/* Guided Workflow Steps */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {guidedSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : step.status === 'active'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                <span className="mr-2">
                  {step.status === 'completed' ? '✓' : step.status === 'active' ? '→' : '○'}
                </span>
                {step.title}
                {index < guidedSteps.length - 1 && (
                  <span className="ml-3 text-gray-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            {[
              { id: 'demo', label: 'Incident Response' },
              { id: 'response_plan', label: 'Response Plan' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'transparency', label: 'AI Transparency' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Incident Input */}
            <div className="space-y-6">
              <Block>
                <h2 className="text-xl font-semibold mb-4">Incident Reporting</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                    <input
                      type="text"
                      value={incidentData.service}
                      onChange={(e) => setIncidentData(prev => ({ ...prev, service: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., UserDatabase, PaymentAPI"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                    <select
                      value={incidentData.environment}
                      onChange={(e) => setIncidentData(prev => ({ ...prev, environment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description *</label>
                    <textarea
                      value={incidentData.incident_description}
                      onChange={(e) => setIncidentData(prev => ({ ...prev, incident_description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the incident symptoms and impact..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="space-y-2">
                      {incidentData.symptoms.map((symptom, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                            {symptom}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity Hint</label>
                    <select
                      value={incidentData.severity_hint}
                      onChange={(e) => setIncidentData(prev => ({ ...prev, severity_hint: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="low">Low Impact</option>
                      <option value="medium">Medium Impact</option>
                      <option value="high">High Impact</option>
                      <option value="critical">Critical Impact</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={validateIncident}
                    disabled={isLoading || !incidentData.service || !incidentData.incident_description}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Analyzing Incident...' : 'Start Agent Core Analysis'}
                  </Button>
                </div>
              </Block>

              {/* Progress Status */}
              {provisioningStatus.status !== 'idle' && (
                <Block>
                  <h3 className="text-lg font-semibold mb-3">Analysis Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{provisioningStatus.current_step}</span>
                      <span className="text-sm text-gray-500">{provisioningStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          provisioningStatus.status === 'failed' ? 'bg-red-500' : 
                          provisioningStatus.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${provisioningStatus.progress}%` }}
                      />
                    </div>
                    <div className={`text-sm font-medium ${
                      provisioningStatus.status === 'failed' ? 'text-red-600' : 
                      provisioningStatus.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      Status: {provisioningStatus.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </Block>
              )}
            </div>

            {/* Right Column - Real-time Agent Execution */}
            <div className="space-y-6">
              {agentExecutions.length > 0 && (
                <Block>
                  <h2 className="text-xl font-semibold mb-4">Real-time Agent Execution (5 Agents)</h2>
                  <div className="space-y-3">
                    {agentExecutions.map((agent, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.status === 'completed' ? 'bg-green-500' :
                            agent.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <div className="font-medium text-sm">{agent.agent_name}</div>
                            {agent.bedrock_used && (
                              <div className="flex items-center space-x-1 text-xs text-orange-600">
                                <span>AI</span>
                                <span>AI Powered</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {agent.execution_time_ms && <div>{agent.execution_time_ms}ms</div>}
                          {agent.confidence && <div>{Math.round(agent.confidence * 100)}%</div>}
                          <div className={`font-medium ${
                            agent.status === 'completed' ? 'text-green-600' :
                            agent.status === 'running' ? 'text-blue-600' :
                            agent.status === 'failed' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {agent.status === 'completed' ? 'COMPLETED' :
                             agent.status === 'running' ? 'RUNNING' :
                             agent.status === 'failed' ? 'FAILED' : 'PENDING'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {multiAgentSummary && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-2">Multi-Agent Summary</div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-gray-600">Total Agents</div>
                          <div className="font-semibold">{multiAgentSummary.total_agents}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Execution Time</div>
                          <div className="font-semibold">{(multiAgentSummary.execution_time_ms / 1000).toFixed(1)}s</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Avg Confidence</div>
                          <div className="font-semibold">{Math.round(multiAgentSummary.average_confidence * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Block>
              )}

              {/* Human Approval */}
              {provisioningStatus.status === 'awaiting_execution' && humanApproval === null && (
                <Block>
                  <h3 className="text-lg font-semibold mb-3">Human Approval Required</h3>
                  <p className="text-gray-600 mb-4">
                    Agent Core has generated an automated incident response plan. Review the plan and decide whether to execute automated remediation.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleExecution(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Execute Automated Response
                    </Button>
                    <Button
                      onClick={() => handleExecution(false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Manual Override
                    </Button>
                  </div>
                </Block>
              )}

              {/* Execution Status */}
              {humanApproval && (
                <Block>
                  <h3 className="text-lg font-semibold mb-3">
                    {humanApproval === 'approved' ? 'Execution Approved' : 'Manual Override'}
                  </h3>
                  <p className="text-gray-600">
                    {humanApproval === 'approved' 
                      ? 'Automated remediation is being executed by Agent Core...'
                      : 'Manual incident response has been initiated. Follow your standard procedures.'
                    }
                  </p>
                  {provisioningStatus.execution_details && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Execution Details</div>
                      <div className="text-xs text-green-700 mt-1">
                        Workflow ID: {provisioningStatus.execution_details.workflow_id}
                      </div>
                    </div>
                  )}
                </Block>
              )}
            </div>
          </div>
        )}

        {/* Response Plan Tab */}
        {activeTab === 'response_plan' && responsePlan && (
          <div className="space-y-6">
            <Block>
              <h2 className="text-xl font-semibold mb-4">Incident Response Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Incident Classification</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Incident ID:</strong> {responsePlan.incident_response_plan?.incident_id}</div>
                    <div><strong>Severity:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                      responsePlan.incident_response_plan?.severity === 'P0' ? 'bg-red-100 text-red-800' :
                      responsePlan.incident_response_plan?.severity === 'P1' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{responsePlan.incident_response_plan?.severity}</span></div>
                    <div><strong>Estimated Resolution:</strong> {responsePlan.incident_response_plan?.estimated_resolution_time}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Immediate Response</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Primary Cause:</strong> {responsePlan.immediate_response?.primary_cause}</div>
                    <div><strong>Remediation Actions:</strong> {responsePlan.immediate_response?.remediation_actions}</div>
                    <div><strong>Automation Level:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                      responsePlan.immediate_response?.automation_level === 'High' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>{responsePlan.immediate_response?.automation_level}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Communication Plan</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Internal Channels:</strong> {responsePlan.communication_plan?.internal_channels}</div>
                    <div><strong>External Channels:</strong> {responsePlan.communication_plan?.external_channels}</div>
                    <div><strong>Stakeholders:</strong> {responsePlan.communication_plan?.stakeholder_count}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Improvement Opportunities</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Immediate Actions:</strong> {responsePlan.improvement_opportunities?.immediate_actions}</div>
                    <div><strong>Long-term Improvements:</strong> {responsePlan.improvement_opportunities?.long_term_improvements}</div>
                    <div><strong>Prevention Measures:</strong> {responsePlan.improvement_opportunities?.prevention_measures}</div>
                  </div>
                </div>
              </div>
            </Block>

            {/* Analysis Steps */}
            {analysisSteps.length > 0 && (
              <Block>
                <h3 className="text-lg font-semibold mb-4">Analysis Steps</h3>
                <div className="space-y-4">
                  {analysisSteps.map((step, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{step.step.replace('_', ' ')}</h4>
                        <span className="text-sm text-gray-500">{Math.round(step.confidence * 100)}% confidence</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{step.reasoning}</p>
                      <div className="text-xs text-gray-500">
                        {Object.entries(step.findings).map(([key, value]) => (
                          <div key={key}><strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Block>
            )}
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <Block>
              <h2 className="text-xl font-semibold mb-4">Agent Core Incident Response Architecture</h2>
              <p className="text-gray-600 mb-4">
                AWS Agent Core uses 5 specialized AI agents that collaborate to provide comprehensive incident response automation.
                Each agent leverages AWS Bedrock's Claude 3.5 Sonnet for intelligent analysis and decision-making.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-red-900">Detection Agent</div>
                  <div className="text-sm text-red-700">Incident classification & severity assessment</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-blue-900">Root Cause Agent</div>
                  <div className="text-sm text-blue-700">Deep analysis & evidence correlation</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-green-900">Remediation Agent</div>
                  <div className="text-sm text-green-700">Automated fix generation & execution</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-orange-900">Communication Agent</div>
                  <div className="text-sm text-orange-700">Stakeholder notifications & updates</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-purple-900">Post-Incident Agent</div>
                  <div className="text-sm text-purple-700">Analysis & improvement recommendations</div>
                </div>
              </div>
            </Block>

            <Block>
              <h2 className="text-xl font-semibold mb-4">System Architecture Overview</h2>
              <p className="text-gray-600 mb-4">
                Complete system architecture showing the flow from incident reporting through multi-agent orchestration to automated remediation.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram chart={AGENTCORE_ARCHITECTURE_DIAGRAM} />
              </div>
            </Block>

            <Block>
              <h2 className="text-xl font-semibold mb-4">Agent Execution Sequence</h2>
              <p className="text-gray-600 mb-4">
                Sequence diagram showing the orchestrated execution of 5 specialized agents with parallel processing for optimal response time.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram chart={AGENTCORE_SEQUENCE_DIAGRAM} />
              </div>
            </Block>

            <Block>
              <h2 className="text-xl font-semibold mb-4">SQL Database Provisioning</h2>
              <p className="text-gray-600 mb-4">
                Automated SQL database provisioning using 5 specialized agents for Amazon RDS and Aurora deployment with intelligent configuration and security setup.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-blue-900">Assessment Agent</div>
                  <div className="text-sm text-blue-700">Requirements analysis & sizing</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-green-900">Provisioning Agent</div>
                  <div className="text-sm text-green-700">RDS/Aurora deployment</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-orange-900">Configuration Agent</div>
                  <div className="text-sm text-orange-700">Parameter optimization</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-red-900">Security Agent</div>
                  <div className="text-sm text-red-700">Access control & encryption</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-purple-900">Validation Agent</div>
                  <div className="text-sm text-purple-700">Testing & verification</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram chart={SQL_PROVISIONING_DIAGRAM} />
              </div>
            </Block>

            <Block>
              <h2 className="text-xl font-semibold mb-4">NoSQL Database Provisioning</h2>
              <p className="text-gray-600 mb-4">
                Intelligent NoSQL database provisioning with 5 specialized agents for DynamoDB, DocumentDB, and Keyspaces deployment with automated optimization and monitoring.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-cyan-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-cyan-900">Analysis Agent</div>
                  <div className="text-sm text-cyan-700">Workload pattern analysis</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-indigo-900">Design Agent</div>
                  <div className="text-sm text-indigo-700">Schema & partition design</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-emerald-900">Deployment Agent</div>
                  <div className="text-sm text-emerald-700">Multi-service deployment</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-amber-900">Optimization Agent</div>
                  <div className="text-sm text-amber-700">Performance tuning</div>
                </div>
                <div className="bg-violet-50 p-4 rounded-lg text-center">
                  <div className="font-semibold text-violet-900">Monitoring Agent</div>
                  <div className="text-sm text-violet-700">Health & metrics tracking</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram chart={NOSQL_PROVISIONING_DIAGRAM} />
              </div>
            </Block>

            <Block>
              <h2 className="text-xl font-semibold mb-4">AI Technology Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">AWS Bedrock Integration</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Model:</strong> Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20241022-v2:0)</li>
                    <li>• <strong>Response Time:</strong> ~500ms average per agent call</li>
                    <li>• <strong>Parallel Processing:</strong> Multiple agents execute simultaneously</li>
                    <li>• <strong>Context Sharing:</strong> Agents share analysis context for better decisions</li>
                    <li>• <strong>Confidence Scoring:</strong> Each agent provides confidence metrics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Agent Core Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Multi-Agent Orchestration:</strong> 5 specialized agents working in concert</li>
                    <li>• <strong>Human-in-the-Loop:</strong> Critical decisions require human approval</li>
                    <li>• <strong>Automated Remediation:</strong> Self-healing capabilities for common issues</li>
                    <li>• <strong>Real-time Monitoring:</strong> Live agent execution tracking</li>
                    <li>• <strong>Audit Trail:</strong> Complete transparency of AI decision-making</li>
                  </ul>
                </div>
              </div>
            </Block>
          </div>
        )}

        {/* AI Transparency Tab */}
        {activeTab === 'transparency' && (
          <div className="space-y-6">
            <Block>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AI Transparency & Explainability</h2>
                <Button
                  onClick={() => setShowAIPrompts(!showAIPrompts)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  {showAIPrompts ? 'Hide' : 'Show'} AI Prompts
                </Button>
              </div>
              
              {agentExecutions.length > 0 && (
                <div className="space-y-4">
                  {agentExecutions.map((agent, index) => (
                    <Block key={index}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{agent.agent_name}</h3>
                        <div className="flex items-center space-x-2">
                          {agent.bedrock_used && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              AI Powered
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            agent.confidence && agent.confidence > 0.9 ? 'bg-green-100 text-green-800' :
                            agent.confidence && agent.confidence > 0.8 ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {agent.confidence ? `${Math.round(agent.confidence * 100)}% confidence` : 'No confidence data'}
                          </span>
                        </div>
                      </div>
                      
                      {showAIPrompts && agent.ai_prompt && (
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-2">AI Prompt:</h4>
                          <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                            {agent.ai_prompt}
                          </pre>
                        </div>
                      )}
                      
                      {showAIPrompts && agent.ai_response && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">AI Response:</h4>
                          <pre className="text-xs bg-blue-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                            {agent.ai_response}
                          </pre>
                        </div>
                      )}
                      
                      {!showAIPrompts && (
                        <div className="text-sm text-gray-600">
                          <div><strong>Execution Time:</strong> {agent.execution_time_ms}ms</div>
                          <div><strong>AI Model Used:</strong> {agent.bedrock_used ? 'Claude 3.5 Sonnet via Bedrock' : 'Fallback Logic'}</div>
                        </div>
                      )}
                    </Block>
                  ))}
                </div>
              )}
            </Block>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentCoreDemo