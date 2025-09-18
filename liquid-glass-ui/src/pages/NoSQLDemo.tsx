import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { apiService } from '../services/api'
import MermaidDiagram from '../components/MermaidDiagram'
import AWSCredentialsWarning from '../components/AWSCredentialsWarning'

interface NoSQLRequest {
  team: string
  application: string
  contact: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  requirements: {
    data_pattern: string
    access_pattern: string
    consistency_requirement: 'strong' | 'eventual' | 'session' | 'bounded'
    scale_requirement: 'low' | 'medium' | 'high' | 'extreme'
    expected_operations_per_second: number
    estimated_data_size: string
    latency_requirement: string
    compliance: string[]
    data_sensitivity: 'low' | 'medium' | 'high' | 'critical'
    budget_constraint: 'low' | 'medium' | 'high' | 'unlimited'
    multi_region: boolean
    high_availability: boolean
    cache_budget: 'low' | 'medium' | 'high'
  }
}

interface NoSQLAnalysis {
  step: string
  reasoning: string
  findings: any
  confidence: number
  timestamp: string
}

interface NoSQLRecommendation {
  solution_stack: {
    primary_database: string
    cache_layer: string
    deployment: string
  }
  estimated_monthly_cost: number
  confidence_score: number
  reasoning_chain: string[]
  autonomous_decisions: any
  implementation_phases: any
  risks_and_mitigations: any[]
}

interface AgentExecution {
  agent_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  start_time?: string
  end_time?: string
  confidence?: number
  ai_prompt?: string
  ai_response?: string
  execution_time_ms?: number
  bedrock_used?: boolean
}

interface GuidedStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'skipped'
  required: boolean
}

// Architecture diagrams
const NOSQL_ORCHESTRATION_DIAGRAM = `
graph TB
    REQUEST[NoSQL Request]
    ORCH[NoSQL Orchestrator]
    
    WA[Workload Analyzer]
    DS[Database Selector]
    CS[Cache Strategy]
    CA[Cost Optimizer]
    SA[Security Analyst]
    PA[Performance Engineer]
    AA[Architecture Specialist]
    
    BEDROCK[AWS Bedrock API<br/>Claude 3.5 Haiku<br/>~300ms per call]
    
    RESULT[Final Recommendation]
    HUMAN[Human Approval]
    
    REQUEST --> ORCH
    ORCH --> WA
    WA --> DS
    WA --> CS
    DS --> CA
    CS --> CA
    CA --> SA
    SA --> PA
    PA --> AA
    AA --> RESULT
    RESULT --> HUMAN
    
    WA --> BEDROCK
    DS --> BEDROCK
    CS --> BEDROCK
    CA --> BEDROCK
    SA --> BEDROCK
    PA --> BEDROCK
    AA --> BEDROCK
    
    classDef agents fill:#e3f2fd,stroke:#1565c0
    classDef parallel fill:#fff3e0,stroke:#f57c00
    classDef aws fill:#ff9800,stroke:#e65100
    classDef flow fill:#e8f5e8,stroke:#2e7d32
    
    class REQUEST,ORCH,RESULT,HUMAN flow
    class WA,AA agents
    class DS,CS,CA,SA,PA parallel
    class BEDROCK aws
`;

const NOSQL_DATABASE_OPTIONS = `
graph LR
    subgraph "Document Databases"
        DOC1[Amazon DocumentDB<br/>MongoDB Compatible]
        DOC2[MongoDB on EC2<br/>Self-Managed]
        DOC3[CouchDB<br/>Multi-Master]
    end

    subgraph "Key-Value Databases"
        KV1[Amazon DynamoDB<br/>Serverless]
        KV2[Redis on ElastiCache<br/>In-Memory]
        KV3[Valkey<br/>Redis Fork]
        KV4[KeyDB<br/>Multi-Threaded]
    end

    subgraph "Column-Family"
        CF1[Amazon Keyspaces<br/>Cassandra Compatible]
        CF2[Cassandra on EC2<br/>Multi-Datacenter]
        CF3[HBase<br/>Hadoop Ecosystem]
    end

    subgraph "Graph Databases"
        GR1[Amazon Neptune<br/>Property Graph]
        GR2[Neo4j on EC2<br/>Cypher Queries]
        GR3[ArangoDB<br/>Multi-Model]
    end

    subgraph "Search & Analytics"
        SE1[Amazon OpenSearch<br/>Full-Text Search]
        SE2[Elasticsearch<br/>Self-Managed]
        SE3[Solr<br/>Apache Lucene]
    end

    subgraph "Cache & In-Memory"
        CA1[ElastiCache Redis<br/>Managed]
        CA2[MemoryDB<br/>Durable Redis]
        CA3[DragonflyDB<br/>High Performance]
        CA4[Memcached<br/>Simple Cache]
    end

    classDef document fill:#e3f2fd,stroke:#1565c0
    classDef keyvalue fill:#f1f8e9,stroke:#558b2f
    classDef column fill:#fce4ec,stroke:#c2185b
    classDef graph fill:#fff3e0,stroke:#f57c00
    classDef search fill:#f3e5f5,stroke:#7b1fa2
    classDef cache fill:#ffebee,stroke:#d32f2f

    class DOC1,DOC2,DOC3 document
    class KV1,KV2,KV3,KV4 keyvalue
    class CF1,CF2,CF3 column
    class GR1,GR2,GR3 graph
    class SE1,SE2,SE3 search
    class CA1,CA2,CA3,CA4 cache
`;

const NoSQLDemo: React.FC = () => {
  const [request, setRequest] = useState<NoSQLRequest>({
    team: '',
    application: '',
    contact: '',
    urgency: 'medium',
    requirements: {
      data_pattern: '',
      access_pattern: '',
      consistency_requirement: 'eventual',
      scale_requirement: 'medium',
      expected_operations_per_second: 1000,
      estimated_data_size: '1TB',
      latency_requirement: '< 10ms',
      compliance: [],
      data_sensitivity: 'medium',
      budget_constraint: 'medium',
      multi_region: false,
      high_availability: true,
      cache_budget: 'medium'
    }
  })

  const [analysisSteps, setAnalysisSteps] = useState<NoSQLAnalysis[]>([])
  const [recommendation, setRecommendation] = useState<NoSQLRecommendation | null>(null)
  const [provisioningStatus, setProvisioningStatus] = useState({
    status: 'idle' as 'idle' | 'analyzing' | 'awaiting_approval' | 'provisioning' | 'completed' | 'failed',
    current_step: '',
    progress: 0,
    aws_resources: null as any,
    connection_details: null as any
  })
  const [humanApproval, setHumanApproval] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [multiAgentSummary, setMultiAgentSummary] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'demo' | 'architecture' | 'transparency'>('demo')
  const [agentExecutions, setAgentExecutions] = useState<AgentExecution[]>([])
  const [currentGuidedStep, setCurrentGuidedStep] = useState<string>('requirements')
  const [showAIPrompts, setShowAIPrompts] = useState(false)
  const [awsCredentialsAvailable, setAwsCredentialsAvailable] = useState<boolean | null>(null)
  const [credentialsError, setCredentialsError] = useState<string | null>(null)
  const [terraformTemplate, setTerraformTemplate] = useState<string | null>(null)
  const [guidedSteps, setGuidedSteps] = useState<GuidedStep[]>([
    { id: 'requirements', title: 'Requirements Gathering', description: 'Define your NoSQL requirements', status: 'active', required: true },
    { id: 'validation', title: 'Requirement Validation', description: 'Validate and confirm requirements', status: 'pending', required: true },
    { id: 'analysis', title: 'AI Multi-Agent Analysis', description: '7 specialized agents analyze your requirements', status: 'pending', required: true },
    { id: 'review', title: 'Review Recommendations', description: 'Review AI-generated recommendations', status: 'pending', required: true },
    { id: 'approval', title: 'Human Approval', description: 'Approve or reject the recommendation', status: 'pending', required: true },
    { id: 'provisioning', title: 'Resource Provisioning', description: 'Deploy AWS resources', status: 'pending', required: false }
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

  // Predefined scenarios for quick demo
  const scenarios = {
    ecommerce: {
      team: 'E-commerce Platform',
      application: 'ProductCatalog',
      contact: 'sarah.chen@company.com',
      urgency: 'high' as const,
      requirements: {
        data_pattern: 'product_catalog_with_user_sessions',
        access_pattern: 'read_heavy_with_burst_writes',
        consistency_requirement: 'eventual' as const,
        scale_requirement: 'high' as const,
        expected_operations_per_second: 5000,
        estimated_data_size: '10TB',
        latency_requirement: '< 5ms',
        compliance: ['PCI-DSS', 'GDPR'],
        data_sensitivity: 'high' as const,
        budget_constraint: 'medium' as const,
        multi_region: true,
        high_availability: true,
        cache_budget: 'high' as const
      }
    },
    nosql_document: {
      team: 'Content Management',
      application: 'DocumentStore',
      contact: 'alex.kim@company.com',
      urgency: 'medium' as const,
      requirements: {
        data_pattern: 'document_storage_with_complex_queries',
        access_pattern: 'mixed_read_write_with_aggregations',
        consistency_requirement: 'strong' as const,
        scale_requirement: 'medium' as const,
        expected_operations_per_second: 2000,
        estimated_data_size: '5TB',
        latency_requirement: '< 10ms',
        compliance: ['SOC2'],
        data_sensitivity: 'medium' as const,
        budget_constraint: 'low' as const,
        multi_region: false,
        high_availability: true,
        cache_budget: 'medium' as const,
        database_focus: 'document' as const
      }
    },
    inmemory_cache: {
      team: 'Real-time Analytics',
      application: 'SessionStore',
      contact: 'maria.gonzalez@company.com',
      urgency: 'critical' as const,
      requirements: {
        data_pattern: 'session_data_with_real_time_updates',
        access_pattern: 'extremely_high_read_with_frequent_writes',
        consistency_requirement: 'eventual' as const,
        scale_requirement: 'very_high' as const,
        expected_operations_per_second: 50000,
        estimated_data_size: '500GB',
        latency_requirement: '< 1ms',
        compliance: [],
        data_sensitivity: 'low' as const,
        budget_constraint: 'high' as const,
        multi_region: true,
        high_availability: true,
        cache_budget: 'very_high' as const,
        database_focus: 'in_memory' as const
      }
    },
    gaming: {
      team: 'Gaming Platform',
      application: 'PlayerLeaderboards',
      contact: 'mike.rodriguez@company.com',
      urgency: 'critical' as const,
      requirements: {
        data_pattern: 'real_time_leaderboards_and_player_data',
        access_pattern: 'extremely_high_read_write',
        consistency_requirement: 'strong' as const,
        scale_requirement: 'extreme' as const,
        expected_operations_per_second: 50000,
        estimated_data_size: '5TB',
        latency_requirement: '< 1ms',
        compliance: ['COPPA'],
        data_sensitivity: 'medium' as const,
        budget_constraint: 'high' as const,
        multi_region: true,
        high_availability: true,
        cache_budget: 'high' as const
      }
    },
    iot: {
      team: 'IoT Platform',
      application: 'SensorDataPipeline',
      contact: 'alex.kim@company.com',
      urgency: 'medium' as const,
      requirements: {
        data_pattern: 'time_series_sensor_data',
        access_pattern: 'write_heavy_with_analytical_reads',
        consistency_requirement: 'eventual' as const,
        scale_requirement: 'high' as const,
        expected_operations_per_second: 10000,
        estimated_data_size: '100TB',
        latency_requirement: '< 50ms',
        compliance: ['ISO27001'],
        data_sensitivity: 'low' as const,
        budget_constraint: 'low' as const,
        multi_region: false,
        high_availability: true,
        cache_budget: 'medium' as const
      }
    },
    social: {
      team: 'Social Media',
      application: 'SocialGraph',
      contact: 'emma.davis@company.com',
      urgency: 'high' as const,
      requirements: {
        data_pattern: 'social_graph_with_content',
        access_pattern: 'complex_graph_queries',
        consistency_requirement: 'session' as const,
        scale_requirement: 'high' as const,
        expected_operations_per_second: 8000,
        estimated_data_size: '50TB',
        latency_requirement: '< 20ms',
        compliance: ['GDPR', 'CCPA'],
        data_sensitivity: 'high' as const,
        budget_constraint: 'medium' as const,
        multi_region: true,
        high_availability: true,
        cache_budget: 'high' as const
      }
    },
    analytics: {
      team: 'Data Analytics',
      application: 'LogAnalytics',
      contact: 'david.wilson@company.com',
      urgency: 'medium' as const,
      requirements: {
        data_pattern: 'log_data_with_full_text_search',
        access_pattern: 'write_heavy_with_search_queries',
        consistency_requirement: 'eventual' as const,
        scale_requirement: 'high' as const,
        expected_operations_per_second: 15000,
        estimated_data_size: '200TB',
        latency_requirement: '< 100ms',
        compliance: ['SOX'],
        data_sensitivity: 'medium' as const,
        budget_constraint: 'medium' as const,
        multi_region: false,
        high_availability: true,
        cache_budget: 'low' as const
      }
    }
  }  
const updateGuidedStep = (stepId: string, status: 'pending' | 'active' | 'completed' | 'skipped') => {
    setGuidedSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const loadScenario = (scenarioKey: keyof typeof scenarios) => {
    setRequest(scenarios[scenarioKey])
    setAnalysisSteps([])
    setRecommendation(null)
    setMultiAgentSummary(null)
    setProvisioningStatus({ status: 'idle', current_step: '', progress: 0, aws_resources: null, connection_details: null })
    setHumanApproval(null)
    setSessionId(null)
    setAgentExecutions([])
    setCurrentGuidedStep('validation')
    updateGuidedStep('requirements', 'completed')
    updateGuidedStep('validation', 'active')
  }

  const simulateNoSQLAnalysis = async () => {
    setIsLoading(true)
    updateGuidedStep('validation', 'completed')
    updateGuidedStep('analysis', 'active')
    setCurrentGuidedStep('analysis')
    setProvisioningStatus({ status: 'analyzing', current_step: 'Initializing NoSQL Multi-Agent System', progress: 10, aws_resources: null, connection_details: null })
    
    // Initialize agent executions (7 agents)
    const agents = [
      { agent_name: 'NoSQL Workload Analyzer', status: 'pending' as const },
      { agent_name: 'NoSQL Database Selector', status: 'pending' as const },
      { agent_name: 'Cache Strategy Specialist', status: 'pending' as const },
      { agent_name: 'NoSQL Cost Optimizer', status: 'pending' as const },
      { agent_name: 'NoSQL Security & Compliance', status: 'pending' as const },
      { agent_name: 'NoSQL Performance Engineer', status: 'pending' as const },
      { agent_name: 'NoSQL Architecture Specialist', status: 'pending' as const }
    ]
    setAgentExecutions(agents)
    
    try {
      // Simulate agent execution phases
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 1: Workload Analysis', progress: 15 }))
      setAgentExecutions(prev => prev.map(agent => 
        agent.agent_name === 'NoSQL Workload Analyzer' 
          ? { ...agent, status: 'running', start_time: new Date().toISOString() }
          : agent
      ))
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 2: Database & Cache Selection', progress: 30 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (agent.agent_name === 'NoSQL Workload Analyzer') {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: 1200, confidence: 0.91, bedrock_used: true }
        } else if (['NoSQL Database Selector', 'Cache Strategy Specialist'].includes(agent.agent_name)) {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 3: Parallel Agent Execution', progress: 60 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (['NoSQL Database Selector', 'Cache Strategy Specialist'].includes(agent.agent_name)) {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: Math.floor(Math.random() * 400) + 1400, confidence: 0.89 + Math.random() * 0.06, bedrock_used: true }
        } else if (['NoSQL Cost Optimizer', 'NoSQL Security & Compliance', 'NoSQL Performance Engineer'].includes(agent.agent_name)) {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProvisioningStatus(prev => ({ ...prev, current_step: 'Phase 4: Architecture Synthesis', progress: 85 }))
      setAgentExecutions(prev => prev.map(agent => {
        if (['NoSQL Cost Optimizer', 'NoSQL Security & Compliance', 'NoSQL Performance Engineer'].includes(agent.agent_name)) {
          return { ...agent, status: 'completed', end_time: new Date().toISOString(), execution_time_ms: Math.floor(Math.random() * 600) + 1600, confidence: 0.87 + Math.random() * 0.08, bedrock_used: true }
        } else if (agent.agent_name === 'NoSQL Architecture Specialist') {
          return { ...agent, status: 'running', start_time: new Date().toISOString() }
        }
        return agent
      }))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Call the real NoSQL analysis endpoint
      const result = await apiService.nosqlAnalyzeRequest(request)
      
      if (result.success) {
        // Update agent executions with real data from API
        if (result.agent_results) {
          console.log('NoSQL Agent results from API:', result.agent_results)
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
          console.log('Processed NoSQL agent executions:', realAgentExecutions)
          
          // Set all agents as completed with real data
          setAgentExecutions(realAgentExecutions)
          
          // Double-check that Architecture Specialist is completed
          const architectureAgent = realAgentExecutions.find(agent => agent.agent_name === 'NoSQL Architecture Specialist')
          if (architectureAgent) {
            console.log('Architecture Specialist status:', architectureAgent.status, 'confidence:', architectureAgent.confidence)
          } else {
            console.error('Architecture Specialist not found in agent results!')
          }
        }
        
        // Update with real analysis steps
        setSessionId(result.session_id)
        setAnalysisSteps(result.steps)
        setRecommendation(result.recommendation)
        setMultiAgentSummary(result.multi_agent_summary)
        
        setProvisioningStatus({ 
          status: 'awaiting_approval', 
          current_step: 'NoSQL Multi-Agent Analysis Complete - Ready for Review', 
          progress: 100,
          aws_resources: null,
          connection_details: null
        })
        
        updateGuidedStep('analysis', 'completed')
        updateGuidedStep('review', 'active')
        setCurrentGuidedStep('review')
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('NoSQL analysis error:', error)
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
      const errorMessage = isTimeout ? 'Analysis timed out - please try again' : 'Analysis failed'
      
      setProvisioningStatus({ 
        status: 'failed', 
        current_step: errorMessage, 
        progress: 0,
        aws_resources: null,
        connection_details: null
      })
      setAgentExecutions(prev => prev.map(agent => ({ ...agent, status: 'failed' })))
    } finally {
      setIsLoading(false)
    }
  }  
const handleApproval = async (approved: boolean) => {
    setHumanApproval(approved ? 'approved' : 'rejected')
    updateGuidedStep('approval', 'completed')
    
    if (!sessionId) {
      console.error('No session ID available for approval')
      return
    }
    
    try {
      const result = await apiService.nosqlApproveRecommendation(sessionId, approved)
      
      if (result.success && approved) {
        updateGuidedStep('provisioning', 'active')
        setCurrentGuidedStep('provisioning')
        setProvisioningStatus({ status: 'provisioning', current_step: 'Starting AWS Resource Provisioning', progress: 0, aws_resources: null, connection_details: null })
        
        // Simulate provisioning phases
        const phases = [
          { name: 'Infrastructure Setup', duration: 3000, progress: 25 },
          { name: 'Database Deployment', duration: 4000, progress: 60 },
          { name: 'Cache Layer Setup', duration: 2500, progress: 80 },
          { name: 'Validation & Testing', duration: 2000, progress: 100 }
        ]

        for (const phase of phases) {
          setProvisioningStatus(prev => ({ 
            ...prev, 
            current_step: phase.name, 
            progress: phase.progress 
          }))
          await new Promise(resolve => setTimeout(resolve, phase.duration))
        }

        // Complete provisioning with real data from API
        setProvisioningStatus({
          status: 'completed',
          current_step: '🎉 Provisioning Complete',
          progress: 100,
          aws_resources: {
            ...result.provisioning?.aws_resources,
            terraform_template: result.provisioning?.terraform_template
          },
          connection_details: result.provisioning?.connection_details
        })
        
        updateGuidedStep('provisioning', 'completed')
      }
    } catch (error) {
      console.error('Approval error:', error)
      setProvisioningStatus({ 
        status: 'failed', 
        current_step: 'Approval failed', 
        progress: 0,
        aws_resources: null,
        connection_details: null
      })
    }
  }

  const generateTerraformTemplate = () => {
    if (!recommendation) return
    
    const template = `# NoSQL Infrastructure - Generated by Agent Core
# Primary Database: ${recommendation.solution_stack.primary_database}
# Cache Layer: ${recommendation.solution_stack.cache_layer}
# Deployment: ${recommendation.solution_stack.deployment}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "${request.environment || 'production'}"
}

variable "application_name" {
  description = "Application name"
  type        = string
  default     = "${request.application}"
}

# DynamoDB Table
resource "aws_dynamodb_table" "${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_table" {
  name           = "\${var.application_name}-\${var.environment}"
  billing_mode   = "${recommendation.autonomous_decisions?.capacity_mode || 'ON_DEMAND'}"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  ${recommendation.autonomous_decisions?.capacity_mode === 'PROVISIONED' ? `
  read_capacity  = ${recommendation.autonomous_decisions?.read_capacity || 5}
  write_capacity = ${recommendation.autonomous_decisions?.write_capacity || 5}
  ` : ''}
  
  server_side_encryption {
    enabled = true
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = {
    Name        = "\${var.application_name}-\${var.environment}"
    Environment = var.environment
    Application = var.application_name
    ManagedBy   = "terraform"
    CreatedBy   = "agent-core"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cache_subnet" {
  name       = "\${var.application_name}-\${var.environment}-cache"
  subnet_ids = data.aws_subnets.private.ids
}

resource "aws_elasticache_replication_group" "${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cache" {
  replication_group_id       = "\${var.application_name}-\${var.environment}"
  description                = "Redis cache for \${var.application_name}"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cache_subnet.name
  security_group_ids = [aws_security_group.cache.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name        = "\${var.application_name}-\${var.environment}-cache"
    Environment = var.environment
    Application = var.application_name
    ManagedBy   = "terraform"
    CreatedBy   = "agent-core"
  }
}

# Security Group for Cache
resource "aws_security_group" "cache" {
  name_prefix = "\${var.application_name}-\${var.environment}-cache"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.application_name}-\${var.environment}-cache-sg"
    Environment = var.environment
    Application = var.application_name
    ManagedBy   = "terraform"
    CreatedBy   = "agent-core"
  }
}

# Data sources
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Outputs
output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_table.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_table.arn
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.${request.application.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cache.primary_endpoint_address
}

output "estimated_monthly_cost" {
  description = "Estimated monthly cost"
  value       = "$${recommendation.estimated_monthly_cost}"
}
`
    
    setTerraformTemplate(template)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'text-blue-600'
      case 'awaiting_approval': return 'text-yellow-600'
      case 'provisioning': return 'text-orange-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Show credentials warning if AWS credentials are not available
  if (awsCredentialsAvailable === false) {
    return <AWSCredentialsWarning demoName="NoSQL Database Onboarding" onRetry={retryCredentialsCheck} />
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NoSQL Database Onboarding Demo</h1>
        <p className="text-gray-600">
          Experience 7-agent AI reasoning for NoSQL, in-memory, and cache database selection with comprehensive analysis
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
              Guided Demo
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
              Architecture
            </button>
          </nav>
        </div>
      </div>    
  {/* Demo Tab Content */}
      {activeTab === 'demo' && (
        <>
          {/* Guided Navigation */}
          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">🧭 Guided Workflow</h2>
            <div className="flex items-center justify-between mb-4">
              {guidedSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                    step.status === 'active' ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      step.status === 'active' ? 'text-blue-600' : 
                      step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < guidedSteps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      guidedSteps[index + 1].status === 'completed' || guidedSteps[index + 1].status === 'active' 
                        ? 'bg-blue-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </Block>

          {/* Quick Scenario Loader */}
          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Demo Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <button
                onClick={() => loadScenario('ecommerce')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="text-2xl mb-2">🛒</div>
                <div className="font-medium text-blue-900">E-commerce</div>
                <div className="text-xs text-blue-700">Product Catalog + Sessions</div>
              </button>
              <button
                onClick={() => loadScenario('nosql_document')}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">Document</div>
                <div className="font-medium text-orange-900">Document Store</div>
                <div className="text-xs text-orange-700">NoSQL Document Focus</div>
              </button>
              <button
                onClick={() => loadScenario('inmemory_cache')}
                className="p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">Cache</div>
                <div className="font-medium text-red-900">In-Memory</div>
                <div className="text-xs text-red-700">Ultra-Fast Cache</div>
              </button>
              <button
                onClick={() => loadScenario('gaming')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-medium text-purple-900">Gaming</div>
                <div className="text-xs text-purple-700">Leaderboards + Real-time</div>
              </button>
              <button
                onClick={() => loadScenario('iot')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">IoT</div>
                <div className="font-medium text-green-900">IoT Platform</div>
                <div className="text-xs text-green-700">Time-series Sensor Data</div>
              </button>
              <button
                onClick={() => loadScenario('social')}
                className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-pink-900">Social Media</div>
                <div className="text-xs text-pink-700">Social Graph + Content</div>
              </button>
            </div>
          </Block>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Form */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">NoSQL Database Request</h2>
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
                    placeholder="e.g., ProductCatalog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Pattern</label>
                  <input
                    type="text"
                    value={request.requirements.data_pattern}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, data_pattern: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., product_catalog_with_user_sessions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Pattern</label>
                  <select
                    value={request.requirements.access_pattern}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, access_pattern: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select access pattern</option>
                    <option value="read_heavy">Read Heavy</option>
                    <option value="write_heavy">Write Heavy</option>
                    <option value="mixed_workload">Mixed Workload</option>
                    <option value="read_heavy_with_burst_writes">Read Heavy with Burst Writes</option>
                    <option value="extremely_high_read_write">Extremely High Read/Write</option>
                    <option value="write_heavy_with_analytical_reads">Write Heavy with Analytical Reads</option>
                    <option value="complex_graph_queries">Complex Graph Queries</option>
                    <option value="write_heavy_with_search_queries">Write Heavy with Search Queries</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Operations/Second</label>
                  <input
                    type="number"
                    value={request.requirements.expected_operations_per_second}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, expected_operations_per_second: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consistency Requirement</label>
                  <select
                    value={request.requirements.consistency_requirement}
                    onChange={(e) => setRequest(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, consistency_requirement: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="eventual">Eventual Consistency</option>
                    <option value="strong">Strong Consistency</option>
                    <option value="session">Session Consistency</option>
                    <option value="bounded">Bounded Staleness</option>
                  </select>
                </div>
                
                {currentGuidedStep === 'validation' && (
                  <button
                    onClick={() => {
                      updateGuidedStep('validation', 'completed')
                      updateGuidedStep('analysis', 'active')
                      setCurrentGuidedStep('analysis')
                    }}
                    disabled={!request.team || !request.application || !request.requirements.data_pattern}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-2"
                  >
                    Validate Requirements
                  </button>
                )}
                
                <button
                  onClick={simulateNoSQLAnalysis}
                  disabled={isLoading || currentGuidedStep !== 'analysis' || !request.team || !request.application}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Analyzing with 7-Agent System...' : 'Start NoSQL Analysis'}
                </button>
              </div>
            </Block>

            {/* Status Panel */}
            <Block>
              <h2 className="text-xl font-semibold mb-4">Analysis Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-sm font-semibold ${getStatusColor(provisioningStatus.status)}`}>
                    {provisioningStatus.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Step:</span>
                  <span className="text-sm text-gray-600">{provisioningStatus.current_step}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${provisioningStatus.progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {provisioningStatus.progress}% Complete
                </div>
              </div>
            </Block>
          </div> 
         {/* Real-time Agent Execution */}
          {agentExecutions.length > 0 && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Real-time Agent Execution (7 Agents)</h2>
              <div className="space-y-3">
                {agentExecutions.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'completed' ? 'bg-green-500' :
                        agent.status === 'running' ? 'bg-blue-500 animate-pulse' :
                        agent.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900">
                        {agent.agent_name.replace('NoSQL ', '')}
                      </span>
                      {agent.bedrock_used && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          AI Powered
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {agent.execution_time_ms && (
                        <span>{agent.execution_time_ms}ms</span>
                      )}
                      {agent.confidence && (
                        <span className="text-green-600 font-medium">
                          {Math.round(agent.confidence * 100)}%
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                        agent.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        agent.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {/* Multi-Agent Analysis Steps */}
          {analysisSteps.length > 0 && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div className="space-y-4">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {step.step === 'workload_analysis' && 'Workload Analysis'}
                        {step.step === 'database_cache_selection' && 'Database & Cache Selection'}
                        {step.step === 'multi_agent_analysis' && 'Multi-Agent Analysis'}
                        {step.step === 'architecture_synthesis' && 'Architecture Synthesis'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          {Math.round(step.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{step.reasoning}</p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-md border">
                      {step.step === 'workload_analysis' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Workload Type:</strong> {step.findings.workload_type}</div>
                          <div><strong>Data Model:</strong> {step.findings.data_model}</div>
                          <div><strong>Consistency:</strong> {step.findings.consistency_needs}</div>
                          <div><strong>Execution:</strong> {step.findings.agent_execution_time}</div>
                        </div>
                      )}
                      {step.step === 'database_cache_selection' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Database:</strong> {step.findings.primary_database}</div>
                          <div><strong>Cache:</strong> {step.findings.primary_cache}</div>
                          <div><strong>Deployment:</strong> {step.findings.deployment_model}</div>
                          <div><strong>Cache Pattern:</strong> {step.findings.cache_pattern}</div>
                        </div>
                      )}
                      {step.step === 'multi_agent_analysis' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Monthly Cost:</strong> ${step.findings.total_monthly_cost}</div>
                          <div><strong>Compliance:</strong> {step.findings.compliance_score}%</div>
                          <div><strong>Performance:</strong> {step.findings.performance_target} ops/sec</div>
                          <div><strong>Total Time:</strong> {step.findings.total_execution_time}</div>
                        </div>
                      )}
                      {step.step === 'architecture_synthesis' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Regions:</strong> {step.findings.deployment_regions}</div>
                          <div><strong>Availability Zones:</strong> {step.findings.high_availability}</div>
                          <div><strong>Recovery Time:</strong> {step.findings.disaster_recovery}</div>
                          <div><strong>Execution:</strong> {step.findings.agent_execution_time}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {/* Multi-Agent Summary */}
          {multiAgentSummary && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Multi-Agent Execution Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{multiAgentSummary.total_agents}</div>
                  <div className="text-sm text-blue-800">Specialized Agents</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{multiAgentSummary.execution_time_ms}ms</div>
                  <div className="text-sm text-green-800">Total Execution</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(multiAgentSummary.average_confidence * 100)}%</div>
                  <div className="text-sm text-purple-800">Avg Confidence</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{multiAgentSummary.agents_used?.length || 0}</div>
                  <div className="text-sm text-orange-800">Agents Executed</div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Agents Used:</h3>
                <div className="flex flex-wrap gap-2">
                  {(multiAgentSummary.agents_used || []).map((agent: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {agent === 'workload' && 'Workload Analyzer'}
                      {agent === 'database_selector' && 'Database Selector'}
                      {agent === 'cache_strategy' && 'Cache Strategy'}
                      {agent === 'cost' && 'Cost Optimizer'}
                      {agent === 'security' && 'Security Analyst'}
                      {agent === 'performance' && 'Performance Engineer'}
                      {agent === 'architecture' && 'Architecture Specialist'}
                    </span>
                  ))}
                </div>
              </div>
            </Block>
          )}      
    {/* Recommendation */}
          {recommendation && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">🎯 NoSQL Agent Recommendation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Solution Stack</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-blue-900">{recommendation.solution_stack.primary_database}</div>
                    <div className="text-blue-700">+ {recommendation.solution_stack.cache_layer}</div>
                    <div className="text-sm text-blue-600 mt-1">{recommendation.solution_stack.deployment} Deployment</div>
                    <div className="text-2xl font-bold text-blue-900 mt-2">
                      ${recommendation.estimated_monthly_cost.toLocaleString()}/month
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {Math.round(recommendation.confidence_score * 100)}% confidence
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reasoning Chain</h3>
                  <ul className="space-y-1">
                    {recommendation.reasoning_chain.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Implementation Phases */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Implementation Phases</h3>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">
                    <strong>Timeline:</strong> {recommendation.implementation_phases.timeline} | 
                    <strong> Readiness Score:</strong> {Math.round(recommendation.implementation_phases.readiness_score * 100)}%
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(recommendation.implementation_phases.tasks || []).map((task: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900 mb-1">{task.phase}</div>
                      <div className="text-sm text-gray-600 mb-2">{task.duration}</div>
                      <div className="text-xs text-gray-500">{task.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Approval Section */}
              {provisioningStatus.status === 'awaiting_approval' && humanApproval === null && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Human Approval Required</h3>
                  <p className="text-yellow-800 mb-4">
                    The NoSQL agents have completed their analysis. Please review the recommendation and approve or reject the provisioning.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApproval(true)}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve & Provision
                    </button>
                    <button
                      onClick={() => handleApproval(false)}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Approval Status */}
              {humanApproval && (
                <div className={`mt-6 p-4 rounded-lg ${humanApproval === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${humanApproval === 'approved' ? 'text-green-900' : 'text-red-900'}`}>
                    {humanApproval === 'approved' ? 'Approved' : 'Rejected'}
                  </h3>
                  <p className={humanApproval === 'approved' ? 'text-green-800' : 'text-red-800'}>
                    {humanApproval === 'approved' 
                      ? 'Provisioning has been approved and is now in progress.'
                      : 'The recommendation has been rejected. The request will need to be modified and resubmitted.'
                    }
                  </p>
                </div>
              )}

              {/* Why This Was Chosen Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  Why This Solution Was Chosen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🎯 Technical Rationale</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span><strong>{recommendation.solution_stack.primary_database}</strong> selected for {request.requirements.access_pattern.replace('_', ' ')} workload pattern</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span><strong>{recommendation.solution_stack.capacity_mode || 'On-Demand'}</strong> capacity mode chosen for {request.requirements.scale_requirement} scale requirements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span><strong>{recommendation.solution_stack.cache_layer}</strong> provides microsecond latency for frequently accessed data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span><strong>{recommendation.solution_stack.deployment}</strong> deployment ensures high availability and disaster recovery</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Decision Factors</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Performance Match</span>
                          <span className="text-sm text-green-600 font-semibold">{Math.round(recommendation.confidence_score * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${recommendation.confidence_score * 100}%`}}></div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Cost Efficiency</span>
                          <span className="text-sm text-blue-600 font-semibold">${recommendation.estimated_monthly_cost}/mo</span>
                        </div>
                        <div className="text-xs text-gray-500">Optimized for {request.requirements.budget_constraint} budget constraint</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Scalability</span>
                          <span className="text-sm text-purple-600 font-semibold">{request.requirements.expected_operations_per_second.toLocaleString()} ops/sec</span>
                        </div>
                        <div className="text-xs text-gray-500">Auto-scaling enabled for traffic spikes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terraform Generation */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Infrastructure as Code</h3>
                    <p className="text-sm text-gray-600">Generate Terraform template for this NoSQL solution</p>
                  </div>
                  <button
                    onClick={() => generateTerraformTemplate()}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <span>📄</span>
                    <span>Generate Terraform</span>
                  </button>
                </div>
                {terraformTemplate && (
                  <div className="mt-4">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                        {terraformTemplate}
                      </pre>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(terraformTemplate)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                      >
                        <span>📋</span>
                        <span>Copy to Clipboard</span>
                      </button>
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(terraformTemplate)}`}
                        download="nosql-infrastructure.tf"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center space-x-1"
                      >
                        <span>💾</span>
                        <span>Download main.tf</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Block>
          )}

          {/* Provisioning Results */}
          {provisioningStatus.status === 'completed' && provisioningStatus.aws_resources && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">🎉 Provisioning Complete</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AWS Resources Created</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>Primary Database:</strong> {provisioningStatus.aws_resources.primary_database}</div>
                      <div><strong>Cache Cluster:</strong> {provisioningStatus.aws_resources.cache_cluster}</div>
                      <div><strong>Region:</strong> {provisioningStatus.aws_resources.region}</div>
                      <div><strong>Estimated Completion:</strong> {provisioningStatus.aws_resources.estimated_completion}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Connection Details</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>Database Endpoint:</strong> {provisioningStatus.connection_details?.database_endpoint}</div>
                      <div><strong>Cache Endpoint:</strong> {provisioningStatus.connection_details?.cache_endpoint}</div>
                      <div><strong>Port:</strong> {provisioningStatus.connection_details?.port}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Terraform Template */}
              {provisioningStatus.aws_resources?.terraform_template && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🏗️ Generated Terraform Template</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm whitespace-pre-wrap">
                      {provisioningStatus.aws_resources.terraform_template}
                    </pre>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(provisioningStatus.aws_resources.terraform_template)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      📋 Copy Terraform
                    </button>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(provisioningStatus.aws_resources.terraform_template)}`}
                      download="main.tf"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      💾 Download main.tf
                    </a>
                  </div>
                </div>
              )}
            </Block>
          )}
        </>
      )}      
{/* AI Transparency Tab Content */}
      {activeTab === 'transparency' && (
        <>
          <Block className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🔍 AI Transparency Dashboard</h2>
              <button
                onClick={() => setShowAIPrompts(!showAIPrompts)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showAIPrompts 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showAIPrompts ? 'Hide' : 'Show'} AI Prompts
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              See exactly what prompts are sent to Claude AI and how the 7-agent system makes decisions.
            </p>
            
            {/* Bedrock Configuration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-900">AWS Bedrock</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Claude 3.5 Haiku Connected</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-900">7-Agent System</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Multi-phase orchestration</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-purple-900">Confidence Scoring</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Dynamic quality assessment</p>
              </div>
            </div>
          </Block>

          {/* Agent Execution Details */}
          {agentExecutions.length > 0 && (
            <div className="space-y-4">
              {agentExecutions.map((agent, index) => (
                <Block key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agent.agent_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {agent.bedrock_used && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          🧠 AI Analysis
                        </span>
                      )}
                      {agent.confidence && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {Math.round(agent.confidence * 100)}% Confidence
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <p className="font-medium">{agent.status.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Execution Time</span>
                      <p className="font-medium">{agent.execution_time_ms || 0}ms</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">AI Provider</span>
                      <p className="font-medium">{agent.bedrock_used ? 'AWS Bedrock' : 'Fallback'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Confidence</span>
                      <p className="font-medium">{agent.confidence ? `${Math.round(agent.confidence * 100)}%` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* AI Prompt Display */}
                  {showAIPrompts && agent.ai_prompt && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">🤖 AI Prompt Sent to Claude</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{agent.ai_prompt}</pre>
                      </div>
                    </div>
                  )}

                  {/* AI Response Display */}
                  {showAIPrompts && agent.ai_response && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">🧠 Claude AI Response</h4>
                      <div className="bg-blue-50 p-4 rounded-lg text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{agent.ai_response}</pre>
                      </div>
                    </div>
                  )}
                </Block>
              ))}
            </div>
          )}

          {/* Confidence Calculation Explanation */}
          {multiAgentSummary && (
            <Block className="mt-6">
              <h2 className="text-xl font-semibold mb-4">📈 Confidence Calculation Details</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">How Confidence is Calculated</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Base Confidence:</strong> 88% for AI analysis, 75% for fallback</li>
                    <li>• <strong>Data Completeness:</strong> +8% boost based on requirement completeness</li>
                    <li>• <strong>Execution Time:</strong> Slight adjustments for analysis thoroughness</li>
                    <li>• <strong>Cross-Agent Consensus:</strong> Higher confidence when agents agree</li>
                    <li>• <strong>Bedrock Response Quality:</strong> JSON structure and detail completeness</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(multiAgentSummary.average_confidence * 100)}%</div>
                    <div className="text-sm text-gray-600">Average Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{multiAgentSummary.total_agents}</div>
                    <div className="text-sm text-gray-600">Agents Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{multiAgentSummary.execution_time_ms}ms</div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">100%</div>
                    <div className="text-sm text-gray-600">AI Usage</div>
                  </div>
                </div>
              </div>
            </Block>
          )}
        </>
      )}

      {/* Architecture Tab Content */}
      {activeTab === 'architecture' && (
        <>
          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">NoSQL Multi-Agent Architecture</h2>
            <p className="text-gray-600 mb-4">
              Our NoSQL onboarding system uses 7 specialized AI agents that collaborate to analyze your requirements and recommend the optimal NoSQL, cache, or in-memory database solution.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-blue-900">Data Pattern Agent</div>
                <div className="text-sm text-blue-700">Analyzes data structure & access patterns</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-green-900">Performance Agent</div>
                <div className="text-sm text-green-700">Evaluates throughput & latency needs</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-orange-900">Scale Agent</div>
                <div className="text-sm text-orange-700">Determines scaling requirements</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-purple-900">Cost Agent</div>
                <div className="text-sm text-purple-700">Optimizes cost vs performance</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-red-900">Security Agent</div>
                <div className="text-sm text-red-700">Ensures compliance & security</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-indigo-900">Operations Agent</div>
                <div className="text-sm text-indigo-700">Evaluates operational complexity</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg text-center">
                <div className="font-semibold text-teal-900">Synthesis Agent</div>
                <div className="text-sm text-teal-700">Combines all analyses for final recommendation</div>
              </div>
            </div>
          </Block>

          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">7-Agent Orchestration Flow</h2>
            <p className="text-gray-600 mb-4">
              How the 7 specialized agents work together to analyze your NoSQL requirements and provide recommendations.
            </p>
            <MermaidDiagram diagram={NOSQL_ORCHESTRATION_DIAGRAM} />
          </Block>

          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">NoSQL Database Options</h2>
            <p className="text-gray-600 mb-4">
              Comprehensive overview of NoSQL, in-memory, and cache database options available on AWS and self-managed.
            </p>
            <MermaidDiagram diagram={NOSQL_DATABASE_OPTIONS} />
          </Block>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Block>
              <h3 className="text-lg font-semibold mb-3">📄 Document Databases</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Amazon DocumentDB:</strong> MongoDB-compatible, fully managed</li>
                <li>• <strong>MongoDB on EC2:</strong> Full control, self-managed</li>
                <li>• <strong>CouchDB:</strong> Multi-master replication</li>
              </ul>
            </Block>

            <Block>
              <h3 className="text-lg font-semibold mb-3">🔑 Key-Value Databases</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Amazon DynamoDB:</strong> Serverless, auto-scaling</li>
                <li>• <strong>Redis on ElastiCache:</strong> In-memory, rich data types</li>
                <li>• <strong>Valkey:</strong> Redis fork, open source</li>
                <li>• <strong>KeyDB:</strong> Multi-threaded Redis</li>
              </ul>
            </Block>

            <Block>
              <h3 className="text-lg font-semibold mb-3">📊 Column-Family</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Amazon Keyspaces:</strong> Cassandra-compatible</li>
                <li>• <strong>Cassandra on EC2:</strong> Multi-datacenter</li>
                <li>• <strong>HBase:</strong> Hadoop ecosystem</li>
              </ul>
            </Block>

            <Block>
              <h3 className="text-lg font-semibold mb-3">🕸️ Graph Databases</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Amazon Neptune:</strong> Property graph & RDF</li>
                <li>• <strong>Neo4j on EC2:</strong> Cypher queries</li>
                <li>• <strong>ArangoDB:</strong> Multi-model database</li>
              </ul>
            </Block>

            <Block>
              <h3 className="text-lg font-semibold mb-3">🔍 Search & Analytics</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Amazon OpenSearch:</strong> Full-text search</li>
                <li>• <strong>Elasticsearch:</strong> Self-managed</li>
                <li>• <strong>Apache Solr:</strong> Lucene-based</li>
              </ul>
            </Block>

            <Block>
              <h3 className="text-lg font-semibold mb-3">⚡ Cache & In-Memory</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>ElastiCache Redis:</strong> Managed Redis</li>
                <li>• <strong>MemoryDB:</strong> Durable Redis</li>
                <li>• <strong>DragonflyDB:</strong> High performance</li>
                <li>• <strong>Memcached:</strong> Simple caching</li>
              </ul>
            </Block>
          </div>

          <Block className="mb-6">
            <h2 className="text-xl font-semibold mb-4">AI Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">AWS Bedrock Integration</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Model:</strong> Claude 3.0 Haiku (anthropic.claude-3-haiku-20240307-v1:0)</li>
                  <li>• <strong>Response Time:</strong> ~400ms average per agent call</li>
                  <li>• <strong>Parallel Processing:</strong> Performance, Scale, Cost agents run simultaneously</li>
                  <li>• <strong>Context Sharing:</strong> Data pattern analysis feeds into all downstream agents</li>
                  <li>• <strong>Confidence Scoring:</strong> Each agent provides confidence metrics (0.0-1.0)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">NoSQL Onboarding Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Multi-Agent System:</strong> 7 specialized agents for comprehensive analysis</li>
                  <li>• <strong>Database Type Selection:</strong> Document, Key-Value, Column, Graph, Search</li>
                  <li>• <strong>Performance Optimization:</strong> Throughput and latency analysis</li>
                  <li>• <strong>Scaling Strategy:</strong> Horizontal vs vertical scaling recommendations</li>
                  <li>• <strong>Cost Analysis:</strong> TCO comparison across managed and self-hosted options</li>
                </ul>
              </div>
            </div>
          </Block>
        </>
      )}
    </div>
  )
}

export default NoSQLDemo