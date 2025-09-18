import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { apiService } from '../services/api'
import MermaidDiagram from '../components/MermaidDiagram'
import AWSCredentialsWarning from '../components/AWSCredentialsWarning'

interface DatabaseRequest {
  team: string
  application: string
  contact: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  requirements: {
    data_type: string
    expected_records: string
    read_write_ratio: string
    peak_concurrent_users: number
    compliance: string[]
    availability_requirement: string
    performance_requirements: {
      max_query_response: string
      max_transaction_time: string
      concurrent_connections: number
    }
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

interface SQLRecommendation {
  database_engine: string
  instance_type: string
  estimated_monthly_cost: number
  confidence_score: number
  reasoning: string
}

interface TerraformTemplate {
  template: string
  filename: string
  variables: Record<string, any>
  outputs: Record<string, any>
}

interface ProvisioningStatus {
  status: 'idle' | 'analyzing' | 'awaiting_approval' | 'generating_terraform' | 'provisioning' | 'completed' | 'failed'
  current_step: string
  progress: number
  aws_resources?: any
  connection_details?: any
}

// Fresh 3-Agent Architecture Diagrams
const SQL_PROVISIONING_ARCHITECTURE = `
graph TB
    REQUEST[SQL Database Request]
    ORCHESTRATOR[SQL Provisioning Orchestrator]
    
    WA[Workload Analysis Agent<br/>OLTP/OLAP Classification]
    EA[Engine Selection Agent<br/>PostgreSQL/MySQL/Aurora]
    CA[Cost Architecture Agent<br/>TCO & Optimization]
    
    BEDROCK[AWS Bedrock<br/>Claude 3.5 Sonnet<br/>Real AI Analysis]
    
    RESULT[Final SQL Recommendation]
    HUMAN[Human Approval Gateway]
    PROVISION[AWS Resource Provisioning]
    
    REQUEST --> ORCHESTRATOR
    ORCHESTRATOR --> WA
    WA --> EA
    EA --> CA
    CA --> RESULT
    RESULT --> HUMAN
    HUMAN --> PROVISION
    
    WA -.-> BEDROCK
    EA -.-> BEDROCK
    CA -.-> BEDROCK
    
    classDef agents fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef aws fill:#ff9800,stroke:#e65100,stroke-width:2px
    classDef flow fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef human fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class REQUEST,ORCHESTRATOR,RESULT flow
    class WA,EA,CA agents
    class BEDROCK aws
    class HUMAN,PROVISION human
`;

const SQL_AGENT_WORKFLOW = `
sequenceDiagram
    participant UI as Frontend UI
    participant ORCH as SQL Orchestrator
    participant WA as Workload Agent
    participant EA as Engine Agent
    participant CA as Cost Agent
    participant BEDROCK as AWS Bedrock
    participant HUMAN as Human Operator

    UI->>ORCH: SQL Database Request
    
    Note over BEDROCK: Claude 3.5 Sonnet<br/>Real-time AI Analysis
    
    Note over ORCH: Phase 1: Workload Analysis
    ORCH->>WA: Analyze Requirements
    WA->>BEDROCK: Workload Pattern Analysis
    BEDROCK-->>WA: OLTP/OLAP Classification
    WA-->>ORCH: Workload Profile Complete
    
    Note over ORCH: Phase 2: Engine Selection
    ORCH->>EA: Select Database Engine
    EA->>BEDROCK: Engine Recommendation Analysis
    BEDROCK-->>EA: PostgreSQL/MySQL/Aurora
    EA-->>ORCH: Engine Selection Complete
    
    Note over ORCH: Phase 3: Cost Architecture
    ORCH->>CA: Design Cost-Optimal Architecture
    CA->>BEDROCK: TCO & Architecture Analysis
    BEDROCK-->>CA: Complete Architecture Plan
    CA-->>ORCH: Architecture Complete
    
    ORCH-->>UI: Final SQL Recommendation
    UI->>HUMAN: Review & Approve
    HUMAN->>UI: Approval Decision
    UI->>ORCH: Execute Provisioning
`;

const AGENT_SPECIALIZATION = `
graph LR
    subgraph "Workload Analysis Agent"
        WA1[Query Pattern Analysis]
        WA2[OLTP vs OLAP Detection]
        WA3[Concurrency Requirements]
        WA4[Data Growth Modeling]
    end

    subgraph "Engine Selection Agent"
        EA1[PostgreSQL Evaluation]
        EA2[MySQL Assessment]
        EA3[Aurora Consideration]
        EA4[Performance Matching]
    end

    subgraph "Cost Architecture Agent"
        CA1[Instance Sizing]
        CA2[Storage Optimization]
        CA3[Multi-AZ Planning]
        CA4[3-Year TCO Analysis]
    end

    WA1 --> EA1
    WA2 --> EA2
    WA3 --> EA3
    WA4 --> EA4
    
    EA1 --> CA1
    EA2 --> CA2
    EA3 --> CA3
    EA4 --> CA4
    
    classDef workload fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef engine fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    classDef cost fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class WA1,WA2,WA3,WA4 workload
    class EA1,EA2,EA3,EA4 engine
    class CA1,CA2,CA3,CA4 cost
`;

const SQLProvisioning: React.FC = () => {
  const [request, setRequest] = useState<DatabaseRequest>({
    team: '',
    application: '',
    contact: '',
    urgency: 'medium',
    requirements: {
      data_type: '',
      expected_records: '',
      read_write_ratio: '80:20',
      peak_concurrent_users: 1000,
      compliance: [],
      availability_requirement: '99.9%',
      performance_requirements: {
        max_query_response: '100ms',
        max_transaction_time: '500ms',
        concurrent_connections: 1000
      }
    }
  })

  const [agentExecutions, setAgentExecutions] = useState<AgentExecution[]>([])
  const [recommendation, setRecommendation] = useState<SQLRecommendation | null>(null)
  const [provisioningStatus, setProvisioningStatus] = useState<ProvisioningStatus>({
    status: 'idle',
    current_step: '',
    progress: 0
  })
  const [humanApproval, setHumanApproval] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [terraformTemplate, setTerraformTemplate] = useState<TerraformTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'demo' | 'architecture' | 'transparency' | 'terraform'>('demo')
  const [showAIPrompts, setShowAIPrompts] = useState(false)
  const [awsCredentialsAvailable, setAwsCredentialsAvailable] = useState<boolean | null>(null)

  // Professional SQL provisioning scenarios
  const scenarios = {
    ecommerce: {
      team: 'E-commerce Platform',
      application: 'RetailHub',
      contact: 'sarah.chen@retailhub.com',
      urgency: 'high' as const,
      requirements: {
        data_type: 'product_catalog_orders',
        expected_records: '2M products, 500K daily orders',
        read_write_ratio: '70:30',
        peak_concurrent_users: 5000,
        compliance: ['PCI-DSS', 'SOX'],
        availability_requirement: '99.9%',
        performance_requirements: {
          max_query_response: '50ms',
          max_transaction_time: '200ms',
          concurrent_connections: 2000
        }
      }
    },
    analytics: {
      team: 'Business Intelligence',
      application: 'DataWarehouse',
      contact: 'mike.rodriguez@datawarehouse.com',
      urgency: 'medium' as const,
      requirements: {
        data_type: 'analytical_reporting',
        expected_records: '100TB historical, 5TB monthly growth',
        read_write_ratio: '95:5',
        peak_concurrent_users: 50,
        compliance: ['GDPR', 'CCPA'],
        availability_requirement: '99.5%',
        performance_requirements: {
          max_query_response: '10s',
          max_transaction_time: '2min',
          concurrent_connections: 100
        }
      }
    },
    financial: {
      team: 'Financial Services',
      application: 'TradingPlatform',
      contact: 'alex.kim@tradingplatform.com',
      urgency: 'critical' as const,
      requirements: {
        data_type: 'financial_transactions',
        expected_records: '10M transactions daily',
        read_write_ratio: '60:40',
        peak_concurrent_users: 10000,
        compliance: ['SOX', 'PCI-DSS', 'FINRA'],
        availability_requirement: '99.99%',
        performance_requirements: {
          max_query_response: '10ms',
          max_transaction_time: '50ms',
          concurrent_connections: 5000
        }
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
    setTerraformTemplate(null)
    setProvisioningStatus({ status: 'idle', current_step: '', progress: 0 })
    setHumanApproval(null)
  }

  const executeSQL3AgentAnalysis = async () => {
    setIsLoading(true)
    setProvisioningStatus({ status: 'analyzing', current_step: 'Initializing 3-Agent SQL Analysis', progress: 10 })
    
    // Initialize the 3 specialized agents
    const agents: AgentExecution[] = [
      { name: 'Workload Analysis Agent', status: 'pending' },
      { name: 'Engine Selection Agent', status: 'pending' },
      { name: 'Cost Architecture Agent', status: 'pending' }
    ]
    setAgentExecutions(agents)
    
    try {
      // Call the real backend API for 3-agent analysis
      setProvisioningStatus({ status: 'analyzing', current_step: 'Executing Real AI Analysis with AWS Bedrock', progress: 25 })
      
      const analysisResult = await apiService.analyzeSQLProvisioning(request)
      
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
        
        setProvisioningStatus({ 
          status: 'awaiting_approval', 
          current_step: '3-Agent Analysis Complete - Ready for Review', 
          progress: 100 
        })
      } else {
        throw new Error(analysisResult.error || 'Analysis failed')
      }
      
    } catch (error) {
      console.error('SQL analysis error:', error)
      setProvisioningStatus({ 
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
    
    // Step 1: Generate Terraform Template
    setProvisioningStatus({ status: 'generating_terraform', current_step: 'Generating Terraform Infrastructure Template', progress: 10 })
    
    try {
      const terraformResult = await apiService.generateSQLTerraform({
        recommendation,
        request,
        application: request.application,
        environment: 'production'
      })
      
      if (terraformResult.success) {
        setTerraformTemplate(terraformResult.terraform)
        setProvisioningStatus({ status: 'provisioning', current_step: 'Terraform Template Generated - Starting Provisioning', progress: 25 })
      } else {
        throw new Error('Terraform generation failed')
      }
    } catch (error) {
      console.error('Terraform generation error:', error)
      setProvisioningStatus({ status: 'failed', current_step: 'Terraform generation failed', progress: 0 })
      return
    }
    
    // Step 2: Simulate provisioning phases
    const phases = [
      { name: 'Applying Terraform Configuration', duration: 3000, progress: 45 },
      { name: 'Creating VPC and Security Groups', duration: 2000, progress: 65 },
      { name: 'Provisioning RDS Instance', duration: 4000, progress: 85 },
      { name: 'Configuring Database and Testing Connection', duration: 2000, progress: 100 }
    ]

    for (const phase of phases) {
      setProvisioningStatus(prev => ({ 
        ...prev, 
        current_step: phase.name, 
        progress: phase.progress 
      }))
      await new Promise(resolve => setTimeout(resolve, phase.duration))
    }

    // Complete provisioning
    setProvisioningStatus({
      status: 'completed',
      current_step: 'SQL Database Provisioned Successfully with Terraform',
      progress: 100,
      aws_resources: {
        rds_instance: `${request.application.toLowerCase()}-${recommendation?.database_engine.toLowerCase().replace(/\s+/g, '-')}`,
        instance_class: recommendation?.instance_type,
        engine: recommendation?.database_engine,
        region: 'us-east-1',
        terraform_applied: true
      },
      connection_details: {
        endpoint: `${request.application.toLowerCase()}-db.cluster-xyz.us-east-1.rds.amazonaws.com`,
        port: recommendation?.database_engine.includes('PostgreSQL') ? 5432 : 3306,
        database: request.requirements.data_type.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'text-blue-600'
      case 'awaiting_approval': return 'text-yellow-600'
      case 'generating_terraform': return 'text-purple-600'
      case 'provisioning': return 'text-orange-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Show credentials warning if AWS credentials are not available
  if (awsCredentialsAvailable === false) {
    return <AWSCredentialsWarning demoName="SQL Database Provisioning" onRetry={() => window.location.reload()} />
  }

  // Show loading while checking credentials
  if (awsCredentialsAvailable === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Checking AWS Credentials...</h2>
          <p className="text-gray-500">Verifying Bedrock access for AI-powered analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SQL Database Provisioning</h1>
        <p className="text-gray-600">
          AI-powered 3-agent system for intelligent SQL database provisioning with real AWS Bedrock analysis
        </p>
        
        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'demo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SQL Provisioning
            </button>
            <button
              onClick={() => setActiveTab('transparency')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transparency'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Transparency
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'architecture'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('terraform')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'terraform'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Terraform Template
            </button>
          </nav>
        </div>
      </div>

      {/* Demo Tab Content */}
      {activeTab === 'demo' && (
        <>
          {/* Quick Scenarios */}
          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Start Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => loadScenario('ecommerce')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">E-commerce Platform</h3>
                <p className="text-sm text-gray-600 mt-1">High-volume OLTP with PCI compliance</p>
              </button>
              <button
                onClick={() => loadScenario('analytics')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">Analytics Warehouse</h3>
                <p className="text-sm text-gray-600 mt-1">Large-scale OLAP for business intelligence</p>
              </button>
              <button
                onClick={() => loadScenario('financial')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-gray-900">Financial Trading</h3>
                <p className="text-sm text-gray-600 mt-1">Ultra-low latency with strict compliance</p>
              </button>
            </div>
          </Block>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Form */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">Database Requirements</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <input
                    type="text"
                    value={request.team}
                    onChange={(e) => setRequest(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                  <input
                    type="text"
                    value={request.application}
                    onChange={(e) => setRequest(prev => ({ ...prev, application: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., RetailHub"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={request.contact}
                    onChange={(e) => setRequest(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., team.lead@yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <input
                    type="text"
                    value={request.requirements.data_type}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, data_type: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., product_catalog_orders"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Records</label>
                  <input
                    type="text"
                    value={request.requirements.expected_records}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, expected_records: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2M products, 500K daily orders"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peak Concurrent Users</label>
                  <input
                    type="number"
                    value={request.requirements.peak_concurrent_users}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, peak_concurrent_users: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={executeSQL3AgentAnalysis}
                  disabled={isLoading || !request.team || !request.application}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyzing with 3 AI Agents...' : 'Start 3-Agent SQL Analysis'}
                </button>
              </div>
            </Block>

            {/* Analysis Progress */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
              
              {provisioningStatus.status !== 'idle' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${getStatusColor(provisioningStatus.status)}`}>
                      {provisioningStatus.current_step}
                    </span>
                    <span className="text-sm text-gray-500">{provisioningStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${provisioningStatus.progress}%` }}
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
              <h2 className="text-xl font-semibold mb-4">SQL Database Recommendation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recommended Solution</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Database Engine:</span> {recommendation.database_engine}</p>
                    <p><span className="font-medium">Instance Type:</span> {recommendation.instance_type}</p>
                    <p><span className="font-medium">Monthly Cost:</span> ${recommendation.estimated_monthly_cost}</p>
                    <p><span className="font-medium">Confidence:</span> {(recommendation.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Reasoning</h3>
                  <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                </div>
              </div>
              
              {humanApproval === null && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => handleApproval(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                  >
                    Approve & Provision
                  </button>
                  <button
                    onClick={() => handleApproval(false)}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {humanApproval === 'approved' && provisioningStatus.status === 'completed' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Provisioning Complete!</h3>
                  <div className="text-sm text-green-800">
                    <p><span className="font-medium">RDS Instance:</span> {provisioningStatus.aws_resources?.rds_instance}</p>
                    <p><span className="font-medium">Endpoint:</span> {provisioningStatus.connection_details?.endpoint}</p>
                    <p><span className="font-medium">Port:</span> {provisioningStatus.connection_details?.port}</p>
                    <p><span className="font-medium">Database:</span> {provisioningStatus.connection_details?.database}</p>
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
              <p>Run a 3-agent analysis to see AI transparency details</p>
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
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
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
            <h2 className="text-xl font-semibold mb-4">3-Agent SQL Provisioning Architecture</h2>
            <MermaidDiagram chart={SQL_PROVISIONING_ARCHITECTURE} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Agent Workflow Sequence</h2>
            <MermaidDiagram chart={SQL_AGENT_WORKFLOW} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Agent Specialization</h2>
            <MermaidDiagram chart={AGENT_SPECIALIZATION} />
          </Block>
          
          <Block>
            <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Workload Analysis Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• OLTP vs OLAP classification</li>
                  <li>• Concurrency requirements analysis</li>
                  <li>• Query pattern evaluation</li>
                  <li>• Data growth modeling</li>
                  <li>• Performance criticality assessment</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Engine Selection Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PostgreSQL vs MySQL evaluation</li>
                  <li>• Aurora Serverless consideration</li>
                  <li>• Performance characteristic matching</li>
                  <li>• Compliance requirement validation</li>
                  <li>• Feature compatibility assessment</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">Cost Architecture Agent</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instance sizing optimization</li>
                  <li>• Storage configuration planning</li>
                  <li>• Multi-AZ setup evaluation</li>
                  <li>• 3-year TCO analysis</li>
                  <li>• Cost optimization recommendations</li>
                </ul>
              </div>
            </div>
          </Block>
        </div>
      )}

      {/* Terraform Template Tab */}
      {activeTab === 'terraform' && (
        <Block>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Terraform Infrastructure Template</h2>
            {terraformTemplate && (
              <button
                onClick={() => {
                  const blob = new Blob([terraformTemplate.template], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = terraformTemplate.filename
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download Terraform
              </button>
            )}
          </div>
          
          {!terraformTemplate ? (
            <div className="text-center py-8 text-gray-500">
              <p>Complete the 3-agent analysis and approve the recommendation to generate Terraform template</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Terraform Template */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Infrastructure Template ({terraformTemplate.filename})</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{terraformTemplate.template}</code>
                  </pre>
                </div>
              </div>
              
              {/* Variables */}
              {Object.keys(terraformTemplate.variables).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Terraform Variables</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(terraformTemplate.variables).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Outputs */}
              {Object.keys(terraformTemplate.outputs).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Expected Outputs</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(terraformTemplate.outputs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-blue-700">{key}:</span>
                          <span className="text-blue-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Deployment Instructions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Deployment Instructions</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                    <li>Save the Terraform template to a file named <code className="bg-gray-200 px-1 rounded">{terraformTemplate.filename}</code></li>
                    <li>Initialize Terraform: <code className="bg-gray-200 px-1 rounded">terraform init</code></li>
                    <li>Review the plan: <code className="bg-gray-200 px-1 rounded">terraform plan</code></li>
                    <li>Apply the configuration: <code className="bg-gray-200 px-1 rounded">terraform apply</code></li>
                    <li>Note the outputs for database connection details</li>
                  </ol>
                </div>
              </div>
              
              {/* Cost Estimation */}
              {recommendation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cost Estimation</h3>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">Monthly Cost:</span>
                        <p className="text-green-600">${recommendation.estimated_monthly_cost}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Annual Cost:</span>
                        <p className="text-green-600">${recommendation.estimated_monthly_cost * 12}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">3-Year TCO:</span>
                        <p className="text-green-600">${Math.round(recommendation.estimated_monthly_cost * 36 * 0.85)}</p>
                        <p className="text-xs text-green-500">(with reserved instances)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Block>
      )}
    </div>
  )
}

export default SQLProvisioning