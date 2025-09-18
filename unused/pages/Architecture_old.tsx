import React, { useState } from 'react'
import { Block } from '../components/ui/Block'

const Architecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dataflow' | 'components'>('overview')
  const [selectedComponent, setSelectedComponent] = useState('Streamlit UI')

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-16 px-8">
        <Block title="🏗️ DBA GenAI Architecture">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                Interactive architecture overview of the AI-powered database management system
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎯 System Overview
                </button>
                <button
                  onClick={() => setActiveTab('dataflow')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'dataflow'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔄 Data Flow
                </button>
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'components'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔧 Components
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    DBA GenAI System Architecture
                  </h2>
                  <p className="text-gray-600">AI-powered database management across multiple platforms</p>
                </div>

                {/* Main Architecture Diagram */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
                  <div className="space-y-8">
                    {/* User Interface Layer */}
                    <div className="bg-blue-100 rounded-lg p-6 border border-blue-300">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                        🖥️ User Interface Layer
                      </h3>
                      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-blue-700 font-medium">Liquid Glass UI</div>
                        <div className="text-sm text-gray-600 mt-2">
                          📊 Metrics | 🔍 NLP Query | ⚡ Performance | 🧠 AI Chat
                        </div>
                      </div>
                    </div>

                    {/* AI & Processing Layer */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-300">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                        🤖 AI & Processing Layer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-green-700 font-medium">Bot Core</div>
                          <div className="text-sm text-gray-600 mt-2">
                            🧠 Claude AI<br/>📝 NLP Processing<br/>⚡ Performance Analysis
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-green-700 font-medium">MCP Server</div>
                          <div className="text-sm text-gray-600 mt-2">
                            🔗 API Gateway<br/>📊 Metrics Collection<br/>🗄️ Query Execution
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Database Layer */}
                    <div className="bg-yellow-100 rounded-lg p-6 border border-yellow-300">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4 text-center">
                        🗄️ Database Layer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-yellow-700 font-medium">PostgreSQL</div>
                          <div className="text-sm text-gray-600 mt-2">
                            👥 Employees<br/>💼 HR Data
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-yellow-700 font-medium">MySQL</div>
                          <div className="text-sm text-gray-600 mt-2">
                            🛒 Customers<br/>📦 Orders
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-yellow-700 font-medium">SQLite</div>
                          <div className="text-sm text-gray-600 mt-2">
                            👤 Users<br/>📋 Audit Logs
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Simulation Layer */}
                    <div className="bg-red-100 rounded-lg p-6 border border-red-300">
                      <h3 className="text-lg font-semibold text-red-800 mb-4 text-center">
                        ⚠️ Database Problem Simulators
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-red-700 font-medium">Slow Query App</div>
                          <div className="text-sm text-gray-600 mt-2">🐌 Expensive Queries</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-red-700 font-medium">Connection Leak</div>
                          <div className="text-sm text-gray-600 mt-2">🔗 Unclosed Connections</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-red-700 font-medium">Lock Contention</div>
                          <div className="text-sm text-gray-600 mt-2">🔒 Deadlocks</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-red-700 font-medium">Memory Bloat</div>
                          <div className="text-sm text-gray-600 mt-2">💾 Buffer Issues</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Component Explorer */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                    🔍 Interactive Component Explorer
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select a component:
                      </label>
                      <select
                        value={selectedComponent}
                        onChange={(e) => setSelectedComponent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Streamlit UI">Streamlit UI</option>
                        <option value="Bot Core (AI Engine)">Bot Core (AI Engine)</option>
                        <option value="MCP Server">MCP Server</option>
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MySQL">MySQL</option>
                        <option value="SQLite">SQLite</option>
                        <option value="Problem Simulators">Problem Simulators</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <ComponentDetails component={selectedComponent} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Flow Tab */}
            {activeTab === 'dataflow' && (
              <DataFlowSection />
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <ComponentsSection />
            )}
          </div>
        </Block>
      </div>
    </main>
  )
}

// Component Details Component
const ComponentDetails: React.FC<{ component: string }> = ({ component }) => {
  const componentDetails = {
    "Streamlit UI": {
      icon: "🖥️",
      description: "Multi-page web interface for database management",
      features: [
        "📊 Real-time container metrics",
        "🔍 Natural language database queries", 
        "⚡ Query performance analysis",
        "🧠 AI-powered diagnostics",
        "📄 Log analysis and monitoring"
      ]
    },
    "Bot Core (AI Engine)": {
      icon: "🤖",
      description: "Claude AI-powered analysis engine via AWS Bedrock",
      features: [
        "🧠 Natural language query processing",
        "⚡ Performance optimization recommendations",
        "🔍 Intelligent diagnostics",
        "📊 Query execution plan analysis",
        "💡 Database tuning suggestions"
      ]
    },
    "MCP Server": {
      icon: "🔗",
      description: "Model Context Protocol server - central coordination hub",
      features: [
        "🌐 RESTful API gateway",
        "🗄️ Multi-database query execution",
        "📊 Performance metrics collection",
        "🔄 Real-time data processing",
        "🛡️ Security and authentication"
      ]
    },
    "PostgreSQL": {
      icon: "🐘",
      description: "Advanced relational database for complex queries",
      features: [
        "👥 Employee management data",
        "💼 HR and payroll information",
        "📈 Advanced analytics support",
        "🔍 Full-text search capabilities",
        "⚡ Query optimization testing"
      ]
    },
    "MySQL": {
      icon: "🐬",
      description: "Popular relational database for web applications",
      features: [
        "🛒 Customer data management",
        "📦 Order processing system",
        "🔗 Connection pooling testing",
        "📊 E-commerce analytics",
        "⚡ Performance benchmarking"
      ]
    },
    "SQLite": {
      icon: "🗃️",
      description: "Lightweight embedded database for local data",
      features: [
        "👤 User authentication data",
        "📋 Audit logs and tracking",
        "🔒 Lock contention testing",
        "📱 Mobile-friendly operations",
        "⚡ Lightweight query testing"
      ]
    },
    "Problem Simulators": {
      icon: "⚠️",
      description: "Database problem simulation for testing and learning",
      features: [
        "🐌 Slow query generation",
        "🔗 Connection leak simulation",
        "🔒 Deadlock and contention creation",
        "💾 Memory bloat scenarios",
        "📊 Performance bottleneck testing"
      ]
    }
  }

  const details = componentDetails[component as keyof typeof componentDetails]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{details.icon}</span>
        <h4 className="text-xl font-semibold text-gray-800">{component}</h4>
      </div>
      
      <p className="text-gray-600 mb-4">{details.description}</p>
      
      <div>
        <h5 className="font-medium text-gray-800 mb-3">Key Features:</h5>
        <ul className="space-y-2">
          {details.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <span className="text-blue-500 mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Data Flow Section Component
const DataFlowSection: React.FC = () => {
  const [flowType, setFlowType] = useState('NLP Query Flow')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🔄 Data Flow & Processing
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select data flow to visualize:
          </label>
          <select
            value={flowType}
            onChange={(e) => setFlowType(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="NLP Query Flow">NLP Query Flow</option>
            <option value="Performance Analysis Flow">Performance Analysis Flow</option>
            <option value="Container Monitoring Flow">Container Monitoring Flow</option>
          </select>
        </div>

        <DataFlowVisualization flowType={flowType} />
      </div>
    </div>
  )
}

// Data Flow Visualization Component
const DataFlowVisualization: React.FC<{ flowType: string }> = ({ flowType }) => {
  if (flowType === 'NLP Query Flow') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Natural Language to SQL Query Processing
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="bg-blue-100 rounded-lg p-4 text-center border border-blue-300 min-w-[120px]">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-blue-800">User</div>
            <div className="text-xs text-blue-600 mt-1">Natural Language Query</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-cyan-100 rounded-lg p-4 text-center border border-cyan-300 min-w-[120px]">
            <div className="text-2xl mb-2">🖥️</div>
            <div className="font-medium text-cyan-800">UI</div>
            <div className="text-xs text-cyan-600 mt-1">Query Interface</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-green-100 rounded-lg p-4 text-center border border-green-300 min-w-[120px]">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-medium text-green-800">Bot Core</div>
            <div className="text-xs text-green-600 mt-1">Claude AI NLP Processing</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-yellow-100 rounded-lg p-4 text-center border border-yellow-300 min-w-[120px]">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium text-yellow-800">MCP Server</div>
            <div className="text-xs text-yellow-600 mt-1">SQL Generation & Execution</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-red-100 rounded-lg p-4 text-center border border-red-300 min-w-[120px]">
            <div className="text-2xl mb-2">🗄️</div>
            <div className="font-medium text-red-800">Databases</div>
            <div className="text-xs text-red-600 mt-1">PostgreSQL, MySQL, SQLite</div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Example Flow:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Input:</strong> "Find engineers in Sales department"</div>
            <div><strong>Processing:</strong> Claude AI converts to SQL</div>
            <div><strong>Output:</strong> SELECT * FROM employees WHERE department = 'Sales' AND role = 'Engineer'</div>
          </div>
        </div>
      </div>
    )
  }

  if (flowType === 'Performance Analysis Flow') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Query Performance Analysis & Optimization
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="bg-blue-100 rounded-lg p-4 text-center border border-blue-300 min-w-[120px]">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium text-blue-800">SQL Query</div>
            <div className="text-xs text-blue-600 mt-1">Input</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-yellow-100 rounded-lg p-4 text-center border border-yellow-300 min-w-[120px]">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium text-yellow-800">MCP Server</div>
            <div className="text-xs text-yellow-600 mt-1">Execution & Metrics</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-red-100 rounded-lg p-4 text-center border border-red-300 min-w-[120px]">
            <div className="text-2xl mb-2">🗄️</div>
            <div className="font-medium text-red-800">Database</div>
            <div className="text-xs text-red-600 mt-1">Query Execution Plan Analysis</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-green-100 rounded-lg p-4 text-center border border-green-300 min-w-[120px]">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-medium text-green-800">Claude AI</div>
            <div className="text-xs text-green-600 mt-1">Performance Analysis</div>
          </div>
          
          <div className="text-gray-400">→</div>
          
          <div className="bg-cyan-100 rounded-lg p-4 text-center border border-cyan-300 min-w-[120px]">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-cyan-800">Results</div>
            <div className="text-xs text-cyan-600 mt-1">Metrics + Recommendations</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Performance Metrics:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <div><strong>Execution Time:</strong> Query duration measurement</div>
            <div><strong>Resource Usage:</strong> CPU, memory, and I/O analysis</div>
            <div><strong>AI Recommendations:</strong> Index suggestions and query optimization</div>
          </div>
        </div>
      </div>
    )
  }

  if (flowType === 'Container Monitoring Flow') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Database Container Health Monitoring
        </h3>
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-red-100 rounded-lg p-4 text-center border border-red-300 min-w-[200px]">
            <div className="text-2xl mb-2">🐳</div>
            <div className="font-medium text-red-800">Database Containers</div>
            <div className="text-xs text-red-600 mt-1">(PostgreSQL, MySQL, SQLite)</div>
          </div>
          
          <div className="text-gray-400">↓</div>
          
          <div className="bg-gray-100 rounded-lg p-4 text-center border border-gray-300 min-w-[200px]">
            <div className="text-2xl mb-2">🔧</div>
            <div className="font-medium text-gray-800">Docker Engine</div>
            <div className="text-xs text-gray-600 mt-1">Stats API</div>
          </div>
          
          <div className="text-gray-400">↓</div>
          
          <div className="bg-yellow-100 rounded-lg p-4 text-center border border-yellow-300 min-w-[200px]">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium text-yellow-800">MCP Server</div>
            <div className="text-xs text-yellow-600 mt-1">Metrics Collection</div>
          </div>
          
          <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">↓</div>
              <div className="bg-cyan-100 rounded-lg p-4 text-center border border-cyan-300 min-w-[150px]">
                <div className="text-2xl mb-2">🖥️</div>
                <div className="font-medium text-cyan-800">UI Dashboard</div>
                <div className="text-xs text-cyan-600 mt-1">Real-time Metrics</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">↓</div>
              <div className="bg-green-100 rounded-lg p-4 text-center border border-green-300 min-w-[150px]">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-medium text-green-800">AI Diagnostics</div>
                <div className="text-xs text-green-600 mt-1">Health Analysis</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-2">Monitoring Capabilities:</h4>
          <div className="text-sm text-purple-700 space-y-1">
            <div><strong>Resource Usage:</strong> CPU, memory, disk I/O tracking</div>
            <div><strong>Health Status:</strong> Container state and availability</div>
            <div><strong>Performance Alerts:</strong> Automated threshold monitoring</div>
          </div>
        </div>
      </div>
    )
  }

  return <div>Flow visualization for {flowType}</div>
}

// Components Section Component  
const ComponentsSection: React.FC = () => {
  const [componentCategory, setComponentCategory] = useState('Core Services')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🔧 Component Deep Dive
        </h2>
      </div>

      {/* Component Category Selection */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select component category:
          </label>
          <select
            value={componentCategory}
            onChange={(e) => setComponentCategory(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Core Services">Core Services</option>
            <option value="Database Layer">Database Layer</option>
            <option value="AI & Processing">AI & Processing</option>
            <option value="Problem Simulation">Problem Simulation</option>
          </select>
        </div>

        <ComponentCategoryDetails category={componentCategory} />
      </div>
      
      {/* Technology Stack */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          🛠️ Technology Stack
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-blue-600 mb-3">Frontend</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🖥️ React + TypeScript</li>
              <li>📊 Tailwind CSS</li>
              <li>📈 Real-time Updates</li>
              <li>🎨 Glass Morphism UI</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-green-600 mb-3">AI & ML</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🤖 Claude AI (Bedrock)</li>
              <li>🧠 Natural Language Processing</li>
              <li>📝 Prompt Engineering</li>
              <li>⚡ Performance Analysis</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-purple-600 mb-3">Backend</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🔗 FastAPI</li>
              <li>🌐 Model Context Protocol</li>
              <li>🐳 Docker</li>
              <li>🔄 Async Processing</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-orange-600 mb-3">Databases</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🐘 PostgreSQL 15</li>
              <li>🐬 MySQL 8.0</li>
              <li>🗃️ SQLite</li>
              <li>📊 Multi-DB Queries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          🎯 System Benefits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-600 mb-3">For DBAs:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">🔍</span>
                <span>Natural language database queries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">⚡</span>
                <span>AI-powered performance optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📊</span>
                <span>Multi-database monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">🧠</span>
                <span>Intelligent troubleshooting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">📈</span>
                <span>Proactive issue detection</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-600 mb-3">For Organizations:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500">🚀</span>
                <span>Faster problem resolution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">💡</span>
                <span>AI-driven insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">🔄</span>
                <span>Automated monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">📋</span>
                <span>Comprehensive reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">🛡️</span>
                <span>Proactive maintenance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          🔗 Quick Links
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">View Container Metrics</div>
          </button>
          
          <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">Try NLP Queries</div>
          </button>
          
          <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium">Analyze Performance</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// Component Category Details Component
const ComponentCategoryDetails: React.FC<{ category: string }> = ({ category }) => {
  if (category === 'Core Services') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">🖥️ UI Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-blue-600 mb-2">📊 Container Metrics</h4>
            <p className="text-sm text-gray-600">Real-time database container monitoring with health status, CPU usage, and memory consumption in table format</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-green-600 mb-2">🔍 NLP Database Query</h4>
            <p className="text-sm text-gray-600">Natural language interface for querying across PostgreSQL, MySQL, and SQLite databases simultaneously</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-purple-600 mb-2">⚡ Query Performance Analyzer</h4>
            <p className="text-sm text-gray-600">AI-powered query performance testing with execution time analysis and optimization recommendations</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-orange-600 mb-2">🧠 AI Diagnostics</h4>
            <p className="text-sm text-gray-600">Intelligent troubleshooting for database container issues with Claude AI recommendations</p>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'Database Layer') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">🗄️ Database Infrastructure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-blue-600 mb-3">🐘 PostgreSQL</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Purpose:</strong> Advanced analytics & HR data</li>
              <li><strong>Schema:</strong> Employees table with departments, salaries, hire dates</li>
              <li><strong>Use Cases:</strong> Complex queries, joins, aggregations</li>
              <li><strong>Problem Simulation:</strong> Slow queries, memory bloat</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-green-600 mb-3">🐬 MySQL</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Purpose:</strong> E-commerce & customer data</li>
              <li><strong>Schema:</strong> Customers table with orders, locations</li>
              <li><strong>Use Cases:</strong> Web applications, OLTP workloads</li>
              <li><strong>Problem Simulation:</strong> Connection leaks</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-purple-600 mb-3">🗃️ SQLite</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Purpose:</strong> User management & audit logs</li>
              <li><strong>Schema:</strong> Users table with roles, activity tracking</li>
              <li><strong>Use Cases:</strong> Lightweight operations, embedded scenarios</li>
              <li><strong>Problem Simulation:</strong> Lock contention, deadlocks</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'AI & Processing') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">🤖 AI & Processing Pipeline</h3>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-green-600 mb-3">AI Processing Capabilities:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500">🧠</span>
              <span><strong>Natural Language Understanding:</strong> Convert English queries to SQL</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">⚡</span>
              <span><strong>Performance Analysis:</strong> Execution time measurement and optimization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">🔍</span>
              <span><strong>Query Optimization:</strong> AI-powered recommendations for better performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">📊</span>
              <span><strong>Multi-Database Intelligence:</strong> Cross-platform query generation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">💡</span>
              <span><strong>Proactive Suggestions:</strong> Index recommendations and query rewrites</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  if (category === 'Problem Simulation') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">⚠️ Database Problem Simulators</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-red-600 mb-2">🐌 Slow Query App</h4>
            <p className="text-sm text-gray-600 mb-2"><strong>Target:</strong> PostgreSQL</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Purpose:</strong> Demonstrate query optimization techniques</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Cartesian product queries</li>
              <li>• Full table scans without indexes</li>
              <li>• Complex joins on large datasets</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-orange-600 mb-2">🔗 Connection Leak App</h4>
            <p className="text-sm text-gray-600 mb-2"><strong>Target:</strong> MySQL</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Purpose:</strong> Test connection management and pooling</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Unclosed database connections</li>
              <li>• Connection pool exhaustion</li>
              <li>• Resource starvation</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-purple-600 mb-2">🔒 Lock Contention App</h4>
            <p className="text-sm text-gray-600 mb-2"><strong>Target:</strong> SQLite</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Purpose:</strong> Simulate concurrency issues and locking problems</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Deadlock scenarios</li>
              <li>• Long-running transactions</li>
              <li>• Blocking queries</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-blue-600 mb-2">💾 Memory Bloat App</h4>
            <p className="text-sm text-gray-600 mb-2"><strong>Target:</strong> PostgreSQL</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Purpose:</strong> Test memory management and optimization</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Large result sets</li>
              <li>• Buffer pool pressure</li>
              <li>• Memory-intensive operations</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return <div>Category details for {category}</div>
}

export default Architecture