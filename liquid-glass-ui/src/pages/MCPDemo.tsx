import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MermaidDiagram from '../components/MermaidDiagram'

// MCP Server API base URL
const MCP_SERVER_URL = 'http://localhost:5001'

interface MCPServer {
    name: string
    status: 'connected' | 'disconnected' | 'error'
    tools: string[]
    lastPing: string
}

const MCPDemo: React.FC = () => {
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([
        {
            name: 'srebot-mcp',
            status: 'connected',
            tools: ['fetch', 'get_container_logs', 'get_container_stats', 'list_containers', 'execute_multi_db_query', 'analyze_query_performance', 'health_check'],
            lastPing: new Date().toLocaleTimeString()
        }
    ])

    const [mcpConnected, setMcpConnected] = useState(true)

    // Check MCP server health
    const checkMcpHealth = async () => {
        try {
            const response = await fetch(`${MCP_SERVER_URL}/health`)
            const data = await response.json()
            setMcpConnected(data.status === 'healthy')
            
            // Update server status
            setMcpServers(prev => prev.map(server => ({
                ...server,
                status: data.status === 'healthy' ? 'connected' : 'error',
                lastPing: new Date().toLocaleTimeString()
            })))
        } catch (error) {
            setMcpConnected(false)
            setMcpServers(prev => prev.map(server => ({
                ...server,
                status: 'disconnected',
                lastPing: new Date().toLocaleTimeString()
            })))
        }
    }

    useEffect(() => {
        checkMcpHealth()
        const interval = setInterval(checkMcpHealth, 10000) // Check every 10 seconds
        return () => clearInterval(interval)
    }, [])

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto py-16 px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-light text-gray-900 mb-4">
                        Model Context Protocol (MCP)
                    </h1>
                    <p className="text-gray-600 text-lg font-light">
                        Extending Kiro's capabilities with specialized tools
                    </p>
                </div>

                {/* MCP Architecture Diagram */}
                <div className="bg-gray-50 rounded-lg p-8 mb-12">
                    <h3 className="text-lg font-light text-gray-900 mb-8 text-center">
                        MCP Architecture
                    </h3>
                    <MermaidDiagram chart={`
                        graph TD
                            K[Kiro IDE] --> MCP[MCP Protocol]
                            MCP --> SRE[SRE Bot Server]
                            MCP --> FETCH[Fetch Server]
                            
                            SRE --> DOCKER[Docker API]
                            SRE --> PG[(PostgreSQL)]
                            SRE --> MY[(MySQL)]
                            SRE --> SQ[(SQLite)]
                            
                            FETCH --> WEB[Web Resources]
                            
                            subgraph "MCP Tools"
                                T1[get_container_stats]
                                T2[get_container_logs]
                                T3[list_containers]
                                T4[execute_multi_db_query]
                                T5[analyze_query_performance]
                                T6[health_check]
                                T7[fetch]
                            end
                            
                            SRE --> T1
                            SRE --> T2
                            SRE --> T3
                            SRE --> T4
                            SRE --> T5
                            SRE --> T6
                            FETCH --> T7
                            
                            classDef default fill:#f9f9f9,stroke:#e5e5e5,stroke-width:1px,color:#374151
                            classDef server fill:#ffffff,stroke:#d1d5db,stroke-width:2px,color:#111827
                            
                            class K,MCP,SRE,FETCH server
                    `} />
                </div>

                {/* MCP Server Status */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-light text-gray-900 mb-6 text-center">
                        MCP Server Status
                    </h3>
                    <div className="space-y-4">
                        {mcpServers.map((server, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            server.status === 'connected' ? 'bg-green-500' :
                                            server.status === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}></div>
                                        <span className="font-medium text-gray-900">{server.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Last ping: {server.lastPing}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>Available Tools:</strong> {server.tools.length}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {server.tools.map((tool, toolIndex) => (
                                        <span key={toolIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MCP Workflow */}
                <div className="bg-gray-50 rounded-lg p-8 mb-8">
                    <h3 className="text-lg font-light text-gray-900 mb-8 text-center">
                        MCP Workflow
                    </h3>
                    <MermaidDiagram chart={`
                        sequenceDiagram
                            participant User
                            participant Kiro
                            participant MCP
                            participant Server
                            participant System
                            
                            User->>Kiro: "Show container stats"
                            Kiro->>MCP: Select tool: get_container_stats
                            MCP->>Server: Execute tool
                            Server->>System: Query Docker API
                            System-->>Server: Container metrics
                            Server-->>MCP: Formatted response
                            MCP-->>Kiro: Tool result
                            Kiro-->>User: Intelligent analysis
                    `} />
                </div>

                {/* MCP Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-light text-gray-900 mb-6 text-center">
                        MCP Configuration
                    </h3>
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                        <pre>{`{
  "mcpServers": {
    "srebot-mcp": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {
        "MCP_SERVER_URL": "${MCP_SERVER_URL}"
      },
      "autoApprove": [
        "fetch",
        "get_container_logs",
        "get_container_stats",
        "list_containers",
        "execute_multi_db_query",
        "analyze_query_performance",
        "health_check"
      ]
    }
  }
}`}</pre>
                    </div>
                </div>

                {/* Link to Dev Feed */}
                <div className="mt-8 text-center">
                    <Link 
                        to="/dev-feed" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        👨‍💻 View Development Feed
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default MCPDemo