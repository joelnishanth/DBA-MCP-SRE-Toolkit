import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const BOT_CORE_URL = import.meta.env.VITE_BOT_CORE_URL || 'http://localhost:6000'
const AWS_INVENTORY_URL = import.meta.env.VITE_AWS_INVENTORY_URL || 'http://localhost:5002'
const UNIFIED_CLAUDE_URL = import.meta.env.VITE_UNIFIED_CLAUDE_URL || 'http://localhost:7000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for complex multi-agent analysis
})

const botCoreClient = axios.create({
  baseURL: BOT_CORE_URL,
  timeout: 60000,
})

const awsInventoryClient = axios.create({
  baseURL: AWS_INVENTORY_URL,
  timeout: 30000,
})

const unifiedClaudeClient = axios.create({
  baseURL: UNIFIED_CLAUDE_URL,
  timeout: 60000,
})

export interface ContainerMetric {
  name: string
  status: 'running' | 'stopped' | 'error'
  cpuPercent: number
  memoryUsageMB: number
  memoryPercent: number
  memoryLimitMB: number
  uptime?: string
  restartCount?: number
}

export const apiService = {
  async getContainerMetrics(): Promise<ContainerMetric[]> {
    try {
      const containersResponse = await apiClient.get('/containers')
      const containerNames = containersResponse.data.containers || []
      
      const metrics: ContainerMetric[] = []
      
      for (const name of containerNames) {
        try {
          const statsResponse = await apiClient.get(`/status/${name}`)
          const stats = statsResponse.data
          
          metrics.push({
            name,
            status: stats.status === 'running' ? 'running' : stats.status === 'stopped' ? 'stopped' : 'error',
            cpuPercent: stats.cpu_percent || 0,
            memoryUsageMB: stats.memory_usage_mb || 0,
            memoryPercent: stats.memory_percent || 0,
            memoryLimitMB: stats.memory_limit_mb || 0,
            uptime: stats.uptime,
            restartCount: stats.restart_count || 0,
          })
        } catch (error) {
          metrics.push({
            name,
            status: 'error',
            cpuPercent: 0,
            memoryUsageMB: 0,
            memoryPercent: 0,
            memoryLimitMB: 0,
            restartCount: 0,
          })
        }
      }
      
      return metrics
    } catch (error) {
      console.error('Failed to fetch container metrics:', error)
      return []
    }
  },

  async getContainerNames(): Promise<string[]> {
    try {
      const response = await apiClient.get('/containers')
      return response.data.containers || []
    } catch (error) {
      console.error('Failed to get container names:', error)
      return []
    }
  },

  async getContainerLogs(containerName: string, lines: number = 100): Promise<string[]> {
    try {
      const response = await apiClient.get(`/logs/${containerName}?lines=${lines}`)
      return response.data.logs || []
    } catch (error) {
      console.error('Failed to get container logs:', error)
      return [`Error fetching logs: ${error}`]
    }
  },

  async diagnoseContainer(containerName: string, options?: { signal?: AbortSignal }) {
    try {
      const response = await botCoreClient.post('/diagnose', {
        container_name: containerName,
      }, options)
      return response.data
    } catch (error) {
      console.error('Failed to diagnose container:', error)
      throw error
    }
  },

  async getFixPreview(containerName: string) {
    try {
      const response = await botCoreClient.post('/fix/preview', {
        container_name: containerName,
      })
      return response.data
    } catch (error) {
      console.error('Failed to get fix preview:', error)
      throw error
    }
  },

  async executeContainerFix(containerName: string, confirmed: boolean = false) {
    try {
      const response = await botCoreClient.post('/fix/execute', {
        container_name: containerName,
        confirmed,
      })
      return response.data
    } catch (error) {
      console.error('Failed to execute container fix:', error)
      throw error
    }
  },

  async executeNlpQuery(query: string) {
    try {
      console.log('Executing NLP query:', query)
      const response = await botCoreClient.post('/nlp-query', { query })
      console.log('NLP query response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to execute NLP query:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      throw error
    }
  },

  async analyzeQueryPerformance(queries: any) {
    try {
      const response = await apiClient.post('/analyze/performance', queries)
      return response.data
    } catch (error) {
      console.error('Failed to analyze query performance:', error)
      throw error
    }
  },

  async desensitizeData(data: any[], context: string = 'general', preserveFields: string[] = []) {
    try {
      const response = await botCoreClient.post('/desensitize-data', {
        data,
        context,
        preserve_fields: preserveFields
      })
      return response.data
    } catch (error) {
      console.error('Failed to desensitize data:', error)
      throw error
    }
  },

  // AWS Inventory Service APIs
  async getAWSEC2Instances(filters?: { application?: string; team?: string; region?: string; environment?: string }) {
    try {
      const params = new URLSearchParams()
      if (filters?.application) params.append('application', filters.application)
      if (filters?.team) params.append('team', filters.team)
      if (filters?.region) params.append('region', filters.region)
      if (filters?.environment) params.append('environment', filters.environment)
      
      const response = await awsInventoryClient.get(`/api/v1/inventory/ec2?${params}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch EC2 instances:', error)
      throw error
    }
  },

  async getAWSRDSInstances(filters?: { application?: string; team?: string; region?: string; engine?: string }) {
    try {
      const params = new URLSearchParams()
      if (filters?.application) params.append('application', filters.application)
      if (filters?.team) params.append('team', filters.team)
      if (filters?.region) params.append('region', filters.region)
      if (filters?.engine) params.append('engine', filters.engine)
      
      const response = await awsInventoryClient.get(`/api/v1/inventory/rds?${params}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch RDS instances:', error)
      throw error
    }
  },

  async getAWSS3Buckets(filters?: { application?: string; team?: string; region?: string; environment?: string }) {
    try {
      const params = new URLSearchParams()
      if (filters?.application) params.append('application', filters.application)
      if (filters?.team) params.append('team', filters.team)
      if (filters?.region) params.append('region', filters.region)
      if (filters?.environment) params.append('environment', filters.environment)
      
      const response = await awsInventoryClient.get(`/api/v1/inventory/s3?${params}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch S3 buckets:', error)
      throw error
    }
  },

  async getAWSCostSummary(days: number = 30, filters?: { application?: string; team?: string }) {
    try {
      const params = new URLSearchParams()
      params.append('days', days.toString())
      if (filters?.application) params.append('application', filters.application)
      if (filters?.team) params.append('team', filters.team)
      
      const response = await awsInventoryClient.get(`/api/v1/cost/summary?${params}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch cost summary:', error)
      throw error
    }
  },

  async queryAWSInventoryChat(query: string, context?: string, resources?: any[]) {
    try {
      const response = await awsInventoryClient.post('/api/v1/chat', {
        query,
        context,
        resources
      })
      return response.data
    } catch (error) {
      console.error('Failed to query AWS inventory chat:', error)
      throw error
    }
  },

  // AWS Strands Demo APIs
  async strandsAnalyzeRequest(request: any) {
    try {
      const response = await apiClient.post('/strands/analyze', request)
      return response.data
    } catch (error) {
      console.error('Failed to analyze request with Strands:', error)
      throw error
    }
  },

  async strandsApproveRecommendation(sessionId: string, approved: boolean) {
    try {
      const response = await apiClient.post(`/strands/approve/${sessionId}`, { approved })
      return response.data
    } catch (error) {
      console.error('Failed to approve Strands recommendation:', error)
      throw error
    }
  },

  async getStrandsSession(sessionId: string) {
    try {
      const response = await apiClient.get(`/strands/session/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get Strands session:', error)
      throw error
    }
  },

  // NoSQL Database Onboarding APIs
  async nosqlAnalyzeRequest(request: any) {
    try {
      const response = await apiClient.post('/nosql/analyze', request)
      return response.data
    } catch (error) {
      console.error('Failed to analyze request with NoSQL agents:', error)
      throw error
    }
  },

  async nosqlApproveRecommendation(sessionId: string, approved: boolean) {
    try {
      const response = await apiClient.post(`/nosql/approve/${sessionId}`, { approved })
      return response.data
    } catch (error) {
      console.error('Failed to approve NoSQL recommendation:', error)
      throw error
    }
  },

  // AWS Agent Core Incident Response APIs
  async agentcoreAnalyzeIncident(incident: any) {
    try {
      const response = await apiClient.post('/agentcore/analyze', incident)
      return response.data
    } catch (error) {
      console.error('Failed to analyze incident with Agent Core:', error)
      throw error
    }
  },

  async agentcoreExecuteRemediation(sessionId: string, approved: boolean) {
    try {
      const response = await apiClient.post(`/agentcore/execute/${sessionId}`, { approved })
      return response.data
    } catch (error) {
      console.error('Failed to execute Agent Core remediation:', error)
      throw error
    }
  },

  async agentcoreGetSession(sessionId: string) {
    try {
      const response = await apiClient.get(`/agentcore/session/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get Agent Core session:', error)
      throw error
    }
  },

  // AWS Credentials Check
  async checkAWSCredentials() {
    try {
      const response = await apiClient.get('/aws-credentials-status')
      return response.data
    } catch (error) {
      console.error('Failed to check AWS credentials:', error)
      throw error
    }
  },

  // Unified Claude Service Methods
  async callUnifiedClaude(operation: string, prompt: string, model?: string, context?: any, metadata?: any) {
    try {
      const response = await unifiedClaudeClient.post('/bedrockclaude', {
        operation,
        prompt,
        model,
        context,
        metadata,
        max_tokens: 4000,
        temperature: 0.1
      })
      return response.data
    } catch (error) {
      console.error('Failed to call unified Claude service:', error)
      throw error
    }
  },

  async getUnifiedClaudeStatus() {
    try {
      const response = await unifiedClaudeClient.get('/bedrockclaude/status')
      return response.data
    } catch (error) {
      console.error('Failed to get unified Claude status:', error)
      throw error
    }
  },

  async testUnifiedClaudeConnection() {
    try {
      const response = await unifiedClaudeClient.get('/bedrockclaude/test')
      return response.data
    } catch (error) {
      console.error('Failed to test unified Claude connection:', error)
      throw error
    }
  },

  async getNoSQLSession(sessionId: string) {
    try {
      const response = await apiClient.get(`/nosql/session/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get NoSQL session:', error)
      throw error
    }
  },

  async listStrandsSessions(limit: number = 20) {
    try {
      const response = await apiClient.get(`/strands/sessions?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Failed to list Strands sessions:', error)
      throw error
    }
  },

  async analyzeSQLProvisioning(request: any) {
    try {
      const response = await apiClient.post('/sql-provisioning/analyze', request)
      return response.data
    } catch (error) {
      console.error('Failed to analyze SQL provisioning request:', error)
      throw error
    }
  },

  async analyzeIncidentResponse(request: any) {
    try {
      const response = await apiClient.post('/incident-response/analyze', request)
      return response.data
    } catch (error) {
      console.error('Failed to analyze incident response request:', error)
      throw error
    }
  },

  async generateSQLTerraform(request: any) {
    try {
      const response = await apiClient.post('/sql-provisioning/terraform', request)
      return response.data
    } catch (error) {
      console.error('Failed to generate SQL Terraform template:', error)
      throw error
    }
  },
}

export default apiService