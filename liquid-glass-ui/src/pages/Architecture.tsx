import React, { useState } from 'react'
import MermaidDiagram from '../components/MermaidDiagram'

const Architecture: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'mcp' | 'components' | 'flows' | 'aws-inventory'>('overview')
  const [zoomLevel, setZoomLevel] = useState(1)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-16 px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            MCP-Powered Architecture
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Interactive visualization of Model Context Protocol integration across all components
          </p>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex justify-center mb-12">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'System Overview' },
              { id: 'mcp', label: 'MCP Integration' },
              { id: 'components', label: 'Component Map' },
              { id: 'flows', label: 'Data Flows' },
              { id: 'aws-inventory', label: 'AWS Inventory AI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Zoom Controls */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
            >
              Zoom Out
            </button>
            <span className="text-sm font-medium min-w-16 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
            >
              Zoom In
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Content with Zoom */}
        <div 
          className="space-y-12 transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {activeView === 'overview' && <SystemOverview />}
          {activeView === 'mcp' && <MCPIntegration />}
          {activeView === 'components' && <ComponentMap />}
          {activeView === 'flows' && <DataFlows />}
          {activeView === 'aws-inventory' && <AWSInventoryArchitecture />}
        </div>
      </div>
    </main>
  )
}

// System Overview Component
const SystemOverview: React.FC = () => {
  const systemArchitecture = `
graph TB
    subgraph Frontend["Frontend Components"]
        UI[Liquid Glass UI]
        DEV[DevFeed]
        QUERY[Database Query Builder]
        HUB[Synthetic Data Hub]
        SEED[Seed Data Generator]
        DESENTIZE[Data Desensitization]
        PRIVACY[Privacy-Preserving ML]
    end
    
    subgraph Protocol["MCP Protocol"]
        MCP[MCP Server]
    end
    
    subgraph Agents["AI Agents"]
        KIRO[Kiro IDE Agent]
        BOT[Bot Core Agent]
        CLAUDE[Claude AI Agent]
        OLLAMA[Ollama Local Agent]
        BEDROCK[AWS Bedrock Agent]
    end
    
    subgraph Data["Data Sources"]
        PG[(PostgreSQL)]
        MY[(MySQL)]
        SQ[(SQLite)]
        DOCKER[Docker API]
    end
    
    UI --> MCP
    DEV --> MCP
    QUERY --> MCP
    HUB --> MCP
    SEED --> MCP
    DESENTIZE --> MCP
    PRIVACY --> MCP
    
    MCP --> KIRO
    MCP --> BOT
    MCP --> CLAUDE
    MCP --> OLLAMA
    MCP --> BEDROCK
    
    MCP --> PG
    MCP --> MY
    MCP --> SQ
    MCP --> DOCKER
    
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1
    classDef mcp fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef ai fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100
    
    class UI,DEV,QUERY,HUB,SEED,DESENTIZE,PRIVACY frontend
    class MCP mcp
    class KIRO,BOT,CLAUDE,OLLAMA,BEDROCK ai
    class PG,MY,SQ,DOCKER data
  `

  return (
    <div className="space-y-16">
      {/* Main Architecture Diagram */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          Complete System Architecture
        </h3>
        <MermaidDiagram chart={systemArchitecture} id="system-overview-diagram" />
      </div>

      {/* Architecture Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Frontend Components</h4>
          <p className="text-sm text-blue-700">
            React components including core system management, development tools, 
            and comprehensive Synthetic Data Hub with privacy-preserving capabilities.
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-3">MCP Protocol</h4>
          <p className="text-sm text-purple-700">
            Model Context Protocol serves as the communication bridge between 
            frontend components and backend services.
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">AI Agents</h4>
          <p className="text-sm text-green-700">
            Multiple AI agents including Kiro IDE Agent, Bot Core Agent, Claude AI Agent, 
            Ollama Local Agent, and AWS Bedrock Agent for comprehensive AI-powered operations.
          </p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-3">Data Layer</h4>
          <p className="text-sm text-orange-700">
            Multiple databases and Docker API provide data storage and 
            container management capabilities.
          </p>
        </div>
      </div>
    </div>
  )
}

// MCP Integration Component
const MCPIntegration: React.FC = () => {
  const mcpArchitecture = `
graph TB
    subgraph Tools["MCP Tools"]
        T1[get_container_stats]
        T2[get_container_logs]
        T3[list_containers]
        T4[execute_multi_db_query]
        T5[analyze_query_performance]
        T6[health_check]
        T7[fetch]
        T8[fix_container]
        T9[generate_synthetic_data]
        T10[desensitize_data]
        T11[privacy_preserving_ml]
    end
    
    subgraph Components["UI Components"]
        C1[DevFeed - Live Updates]
        C2[Container Logs - Log Retrieval]
        C3[Container Metrics - Real-time Stats]
        C4[Alerts Panel - Monitoring]
        C5[Database Query Builder - Multi-DB Queries]
        C6[MCP Demo - Tool Showcase]
        C7[Synthetic Data Hub - Privacy Suite]
        C8[Seed Data Generator - AI Data Creation]
        C9[Data Desensitization - Privacy Protection]
        C10[Privacy-Preserving ML - Federated Learning]
    end
    
    subgraph Agents["AI Agents"]
        A1[Kiro IDE Agent]
        A2[Bot Core Agent]
        A3[Claude AI Agent]
        A4[Ollama Local Agent]
        A5[AWS Bedrock Agent]
    end
      
      C1 --> T6
      C2 --> T2
      C3 --> T1
      C3 --> T3
      C4 --> T6
      C5 --> T4
      C5 --> T5
      C6 --> T1
      C6 --> T2
      C6 --> T3
      C7 --> T9
      C8 --> T9
      C9 --> T10
      C10 --> T11
      
      T1 --> A2
      T2 --> A2
      T3 --> A2
      T4 --> A3
      T5 --> A3
      T6 --> A1
      T7 --> A4
      T8 --> A2
      T9 --> A4
      T10 --> A5
      T10 --> A4
      T11 --> A3
      T11 --> A4
      
      classDef tools fill:#fff3cd,stroke:#856404,stroke-width:2px
      classDef components fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
      classDef agents fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
      
      class T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11 tools
      class C1,C2,C3,C4,C5,C6,C7,C8,C9,C10 components
      class A1,A2,A3,A4,A5 agents
  `

  return (
    <div className="space-y-16">
      {/* MCP Integration Diagram */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          MCP Integration Across Components
        </h3>
        <MermaidDiagram chart={mcpArchitecture} id="mcp-integration-diagram" />
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-800">MCP Tools in Action</h4>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-semibold text-yellow-800 mb-2">Container Management</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <code>get_container_stats</code> - Real-time CPU/memory metrics</li>
                <li>• <code>get_container_logs</code> - Log retrieval and streaming</li>
                <li>• <code>list_containers</code> - Container discovery</li>
                <li>• <code>fix_container</code> - Automated restart/repair</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">Database Operations</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>execute_multi_db_query</code> - Cross-database queries</li>
                <li>• <code>analyze_query_performance</code> - Performance analysis</li>
                <li>• Supports PostgreSQL, MySQL, SQLite</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-2">Synthetic Data & Privacy</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <code>generate_synthetic_data</code> - AI-powered data generation</li>
                <li>• <code>desensitize_data</code> - Privacy-preserving data masking</li>
                <li>• <code>privacy_preserving_ml</code> - Federated learning & differential privacy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-800">📱 Component Integration</h4>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-green-800 mb-2">AI Agent Integration</h5>
              <p className="text-sm text-green-700">
                MCP tools connect to multiple AI agents: Kiro IDE Agent for development, 
                Bot Core Agent for container operations, Claude AI Agent for analysis, 
                Ollama Local Agent for local processing, and AWS Bedrock Agent for enterprise AI.
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h5 className="font-semibold text-indigo-800 mb-2">Synthetic Data Hub</h5>
              <p className="text-sm text-indigo-700">
                Comprehensive privacy-preserving data suite with 5 categories: Data Generation, 
                Healthcare PHI, Financial PII, Education Records, and Privacy-Preserving ML techniques.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-2">Container Components</h5>
              <p className="text-sm text-purple-700">
                Logs and Metrics pages use <code>get_container_logs</code> and 
                <code>get_container_stats</code> via Bot Core Agent for real-time monitoring.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h5 className="font-semibold text-orange-800 mb-2">Database Query Builder</h5>
              <p className="text-sm text-orange-700">
                Executes queries across multiple databases via Claude AI Agent using 
                <code>execute_multi_db_query</code> MCP tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component Map Component
const ComponentMap: React.FC = () => {
  const componentFlow = `
    graph TB
      subgraph "System Components"
        DF[DevFeed]
        CL[Container Logs]
        CM[Container Metrics]
        AP[Alerts Panel]
        DB[Database Query Builder]
      end
      
      subgraph "Synthetic Data Hub"
        HUB[Synthetic Data Hub]
        SEED[Seed Data Generator]
        DESENTIZE[Data Desensitization]
        PRIVACY[Privacy-Preserving ML]
      end
      
      subgraph "MCP Tools"
        T1[get_container_stats]
        T2[get_container_logs]
        T3[health_check]
        T4[execute_multi_db_query]
        T5[analyze_query_performance]
        T6[generate_synthetic_data]
        T7[desensitize_data]
        T8[privacy_preserving_ml]
      end
      
      subgraph "AI Agents"
        A1[Kiro IDE Agent]
        A2[Bot Core Agent]
        A3[Claude AI Agent]
        A4[Ollama Local Agent]
        A5[AWS Bedrock Agent]
      end
      
      DF --> T3
      CL --> T2
      CM --> T1
      AP --> T3
      DB --> T4
      DB --> T5
      
      HUB --> T6
      SEED --> T6
      DESENTIZE --> T7
      PRIVACY --> T8
      
      T1 --> A2
      T2 --> A2
      T3 --> A1
      T4 --> A3
      T5 --> A3
      T6 --> A4
      T7 --> A5
      T7 --> A4
      T8 --> A3
      T8 --> A4
      
      classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
      classDef synthetic fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
      classDef tools fill:#fff3cd,stroke:#856404,stroke-width:2px
      classDef agents fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
      
      class DF,CL,CM,AP,DB component
      class HUB,SEED,DESENTIZE,PRIVACY synthetic
      class T1,T2,T3,T4,T5,T6,T7,T8 tools
      class A1,A2,A3,A4,A5 agents
  `

  return (
    <div className="space-y-16">
      {/* Component Flow Diagram */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          Component-to-MCP Mapping
        </h3>
        <MermaidDiagram chart={componentFlow} id="component-map-diagram" />
      </div>

      {/* Interactive Component Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ComponentCard
          title="DevFeed.tsx"
          icon="DevFeed"
          mcpEndpoint="health_check → Kiro IDE Agent"
          features={[
            "Live development updates",
            "Real-time polling (5s)",
            "AI Agent status tracking",
            "Clear all updates"
          ]}
          color="green"
        />
        <ComponentCard
          title="ContainerLogs.tsx"
          icon="Logs"
          mcpEndpoint="get_container_logs → Bot Core Agent"
          features={[
            "Log retrieval via AI Agent",
            "Auto-refresh",
            "Line limit control",
            "Container selection"
          ]}
          color="blue"
        />
        <ComponentCard
          title="ContainerMetrics.tsx"
          icon="Metrics"
          mcpEndpoint="get_container_stats → Bot Core Agent"
          features={[
            "Real-time metrics via AI Agent",
            "CPU/Memory monitoring",
            "Status tracking",
            "Auto-refresh (5s)"
          ]}
          color="purple"
        />
        <ComponentCard
          title="AlertsPanel.tsx"
          icon="Alerts"
          mcpEndpoint="health_check → Kiro IDE Agent"
          features={[
            "AI Agent threshold monitoring",
            "Alert generation",
            "Acknowledgment system",
            "Severity levels"
          ]}
          color="red"
        />
        <ComponentCard
          title="DatabaseQueryBuilder.tsx"
          icon="Database"
          mcpEndpoint="execute_multi_db_query → Claude AI Agent"
          features={[
            "Multi-database queries via AI Agent",
            "AI-powered performance analysis",
            "PostgreSQL/MySQL/SQLite",
            "Query execution time"
          ]}
          color="orange"
        />
        <ComponentCard
          title="MCPDemo.tsx"
          icon="Tools"
          mcpEndpoint="Multiple Tools → All AI Agents"
          features={[
            "AI Agent tool demonstration",
            "Server status",
            "Interactive examples",
            "Configuration display"
          ]}
          color="indigo"
        />
        <ComponentCard
          title="SyntheticDataHub.tsx"
          icon="Security"
          mcpEndpoint="generate_synthetic_data → Multiple AI Agents"
          features={[
            "Privacy-preserving data suite",
            "5 industry categories",
            "AI-powered generation",
            "Compliance tools"
          ]}
          color="purple"
        />
        <ComponentCard
          title="SeedDataGeneration.tsx"
          icon="🌱"
          mcpEndpoint="generate_synthetic_data → Ollama Local Agent"
          features={[
            "AI-powered data generation",
            "Multi-database support",
            "Realistic relationships",
            "Live progress tracking"
          ]}
          color="green"
        />
        <ComponentCard
          title="DataDesensitization.tsx"
          icon="Privacy"
          mcpEndpoint="desensitize_data → AWS Bedrock + Ollama Agents"
          features={[
            "PHI/PII protection",
            "Research utility preservation",
            "Dual AI Agent support",
            "Real-time processing"
          ]}
          color="orange"
        />
      </div>
    </div>
  )
}

// Component Card Helper
const ComponentCard: React.FC<{
  title: string
  icon: string
  mcpEndpoint: string
  features: string[]
  color: string
}> = ({ title, icon, mcpEndpoint, features, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <div className="mb-4">
        <span className="text-sm font-medium">MCP Endpoint:</span>
        <code className="block bg-white p-2 rounded mt-1 text-xs font-mono">
          {mcpEndpoint}
        </code>
      </div>
      <div>
        <span className="text-sm font-medium mb-2 block">Features:</span>
        <ul className="text-sm space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-xs mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Data Flows Component
const DataFlows: React.FC = () => {
  const devFeedFlow = `
    sequenceDiagram
      participant KiroAgent as Kiro IDE Agent
      participant MCP
      participant DevFeed
      participant User
      
      KiroAgent->>MCP: POST /dev/update
      Note over MCP: Store update with metadata
      DevFeed->>MCP: health_check via Kiro IDE Agent
      MCP-->>DevFeed: Return latest updates
      DevFeed-->>User: Display live updates
      User->>DevFeed: Clear all updates
      DevFeed->>MCP: DELETE /dev/updates
  `

  const containerFlow = `
    sequenceDiagram
      participant UI
      participant MCP
      participant BotAgent as Bot Core Agent
      participant ClaudeAgent as Claude AI Agent
      participant Docker
      participant Database
      
      UI->>MCP: get_container_stats
      MCP->>BotAgent: Process container request
      BotAgent->>Docker: Query container metrics
      Docker-->>BotAgent: CPU, Memory, Status
      BotAgent-->>MCP: Formatted metrics
      MCP-->>UI: AI Agent processed data
      
      UI->>MCP: execute_multi_db_query
      MCP->>ClaudeAgent: Process database request
      ClaudeAgent->>Database: Query PostgreSQL
      ClaudeAgent->>Database: Query MySQL
      ClaudeAgent->>Database: Query SQLite
      Database-->>ClaudeAgent: Results from all DBs
      ClaudeAgent-->>MCP: AI analyzed results
      MCP-->>UI: Consolidated results
  `

  const alertFlow = `
    sequenceDiagram
      participant AlertsPanel
      participant MCP
      participant KiroAgent as Kiro IDE Agent
      participant Containers
      participant User
      
      loop Every 5 seconds
        AlertsPanel->>MCP: health_check
        MCP->>KiroAgent: Process health request
        KiroAgent->>Containers: Get metrics
        Containers-->>KiroAgent: CPU/Memory/Status
        KiroAgent-->>MCP: AI analyzed health data
        MCP-->>AlertsPanel: Health data
        
        Note over AlertsPanel: AI Agent generates alerts if thresholds exceeded
        
        alt Critical Alert
          AlertsPanel-->>User: Critical Alert
        else Warning Alert
          AlertsPanel-->>User: Warning Alert
        end
      end
      
      User->>AlertsPanel: Acknowledge alert
      Note over AlertsPanel: Mark alert as acknowledged
  `

  return (
    <div className="space-y-16">
      {/* DevFeed Flow */}
      <div>
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          DevFeed Live Updates Flow
        </h3>
        <div className="bg-gray-50 rounded-lg p-8">
          <MermaidDiagram chart={devFeedFlow} id="devfeed-flow-diagram" />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Real-time development updates posted by Kiro IDE Agent and displayed in the DevFeed component
          </p>
        </div>
      </div>

      {/* Container Management Flow */}
      <div>
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          Container & Database Management Flow
        </h3>
        <div className="bg-gray-50 rounded-lg p-8">
          <MermaidDiagram chart={containerFlow} id="container-flow-diagram" />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            MCP tools provide unified access via AI Agents to Docker containers and multiple databases
          </p>
        </div>
      </div>

      {/* Alert Monitoring Flow */}
      <div>
        <h3 className="text-xl font-light text-gray-900 mb-8 text-center">
          Alert Monitoring Flow
        </h3>
        <div className="bg-gray-50 rounded-lg p-8">
          <MermaidDiagram chart={alertFlow} />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Continuous AI Agent monitoring with threshold-based alerting and user acknowledgment
          </p>
        </div>
      </div>

      {/* MCP Benefits Summary */}
      <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-6 text-center">
          🔌 MCP Integration Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-semibold text-blue-700 mb-2">Real-time Updates</h4>
            <p className="text-sm text-blue-600">
              Live data streaming across all components
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🧩</div>
            <h4 className="font-semibold text-blue-700 mb-2">Unified Interface</h4>
            <p className="text-sm text-blue-600">
              Single protocol for all system interactions
            </p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold mb-3">Performance</div>
            <h4 className="font-semibold text-blue-700 mb-2">High Performance</h4>
            <p className="text-sm text-blue-600">
              Efficient data transfer and caching
            </p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold mb-3">Tools</div>
            <h4 className="font-semibold text-blue-700 mb-2">Tool Extensibility</h4>
            <p className="text-sm text-blue-600">
              Easy to add new MCP tools and capabilities
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const AWSInventoryArchitecture: React.FC = () => {
  const awsInventoryArchitecture = `
    graph TB
        %% User Interface Layer
        subgraph "Frontend - React UI (Port 3000/8080)"
            UI[AWS Inventory Page]
            Chat[AI Chat Interface]
            Demo[Demo Query Cards]
            Overview[Resource Overview]
            Resources[Resource List]
        end

        %% API Gateway Layer
        subgraph "API Services"
            BotCore[Bot Core API<br/>Port 6000]
            AWSService[AWS Inventory Service<br/>Port 5002]
            MCPServer[MCP Server<br/>Port 5001]
        end

        %% AI Processing Layer
        subgraph "AI Analysis Engine"
            Claude[Claude AI API]
            InfraHandler[Infrastructure AI Handler]
            MCPClient[MCP Client]
        end

        %% Data Sources
        subgraph "AWS Data Sources"
            EC2API[AWS EC2 API]
            RDSAPI[AWS RDS API]
            S3API[AWS S3 API]
            CostAPI[AWS Cost Explorer API]
        end

        %% Data Storage
        subgraph "Data Layer"
            SyntheticGen[Synthetic Data Generator]
            DataCache[In-Memory Cache]
            RealData[Real AWS Data]
        end

        %% Database Systems
        subgraph "Database Infrastructure"
            PostgresDB[(PostgreSQL<br/>Port 5432)]
            MySQLDB[(MySQL<br/>Port 3306)]
            SQLiteDB[(SQLite)]
        end

        %% User Interactions
        UI --> Chat
        UI --> Demo
        UI --> Overview
        UI --> Resources

        %% Frontend to Backend Communication
        Chat -->|POST /infrastructure-ai| BotCore
        UI -->|GET /api/v1/inventory/*| AWSService
        Demo -->|Populate Query| Chat

        %% Backend Processing Flow
        BotCore --> InfraHandler
        InfraHandler --> Claude
        InfraHandler --> MCPClient
        MCPClient --> MCPServer

        %% Data Collection Flow
        AWSService --> EC2API
        AWSService --> RDSAPI
        AWSService --> S3API
        AWSService --> CostAPI
        AWSService --> SyntheticGen

        %% Data Processing
        EC2API --> RealData
        RDSAPI --> RealData
        S3API --> RealData
        SyntheticGen --> DataCache
        RealData --> DataCache

        %% Database Connections
        MCPServer --> PostgresDB
        MCPServer --> MySQLDB
        MCPServer --> SQLiteDB

        %% Response Flow
        Claude -->|AI Analysis| InfraHandler
        InfraHandler -->|Structured Response| BotCore
        BotCore -->|JSON Response| Chat
        DataCache -->|Resource Data| UI

        %% Styling
        classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
        classDef api fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
        classDef ai fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
        classDef aws fill:#fff3e0,stroke:#e65100,stroke-width:2px
        classDef data fill:#fce4ec,stroke:#880e4f,stroke-width:2px
        classDef db fill:#f1f8e9,stroke:#33691e,stroke-width:2px

        class UI,Chat,Demo,Overview,Resources frontend
        class BotCore,AWSService,MCPServer api
        class Claude,InfraHandler,MCPClient ai
        class EC2API,RDSAPI,S3API,CostAPI aws
        class SyntheticGen,DataCache,RealData data
        class PostgresDB,MySQLDB,SQLiteDB db
  `;

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          AWS Inventory AI System Architecture
        </h3>
        <div className="bg-gray-50 rounded-lg p-8">
          <MermaidDiagram chart={awsInventoryArchitecture} id="aws-inventory-architecture" />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Complete data flow from AWS APIs through AI analysis to user interface
          </p>
        </div>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Key Features</h4>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <strong>Database-Focused Analysis:</strong> MySQL, PostgreSQL, Oracle, SQL Server, MariaDB engine analysis
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <div>
                <strong>AI-Powered Insights:</strong> Claude AI provides intelligent analysis and recommendations
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <div>
                <strong>Real-time Data:</strong> Live AWS API integration with synthetic data fallback
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              <div>
                <strong>Security Assessment:</strong> Encryption, Multi-AZ, and compliance checking
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🔄 Data Flow</h4>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
              <div>User submits database query through chat interface</div>
            </li>
            <li className="flex items-start">
              <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
              <div>Bot Core API processes request with AWS resource context</div>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
              <div>Claude AI analyzes data and generates insights</div>
            </li>
            <li className="flex items-start">
              <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
              <div>Structured response with recommendations returned to user</div>
            </li>
          </ol>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">Technology Stack</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-semibold text-blue-700 mb-3">Frontend</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• React 18 + TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Vite Build Tool</li>
              <li>• Mermaid Diagrams</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-green-700 mb-3">Backend</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• FastAPI (Python)</li>
              <li>• Claude AI Integration</li>
              <li>• AWS SDK</li>
              <li>• MCP Protocol</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-700 mb-3">Infrastructure</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Docker Containers</li>
              <li>• PostgreSQL/MySQL/SQLite</li>
              <li>• Nginx Proxy</li>
              <li>• Multi-environment Support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Architecture