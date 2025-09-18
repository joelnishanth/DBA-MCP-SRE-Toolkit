import React, { useState } from 'react'
import { apiService } from '../services/api'
import { Button } from '../components/ui/Button'
import QueryLoadingBar from '../components/QueryLoadingBar'
import MermaidDiagram from '../components/MermaidDiagram'

const QueryPerformance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fast')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [customQueries, setCustomQueries] = useState({ postgres: '', mysql: '', sqlite: '' })

  const performanceQueries = {
    fast: {
      'Simple Count': { postgres: 'SELECT COUNT(*) FROM employees', mysql: 'SELECT COUNT(*) FROM customers', sqlite: 'SELECT COUNT(*) FROM users' },
      'Indexed Lookup': { postgres: 'SELECT * FROM employees WHERE id = 1', mysql: 'SELECT * FROM customers WHERE id = 1', sqlite: 'SELECT * FROM users WHERE id = 1' },
      'Simple Aggregation': { postgres: 'SELECT AVG(salary) FROM employees', mysql: 'SELECT COUNT(DISTINCT city) FROM customers', sqlite: 'SELECT COUNT(*) FROM users WHERE is_active = 1' }
    },
    medium: {
      'Department Filter': { postgres: "SELECT * FROM employees WHERE department = 'Engineering'", mysql: null, sqlite: null },
      'Date Range': { postgres: "SELECT * FROM employees WHERE hire_date > '2020-01-01'", mysql: "SELECT * FROM customers WHERE registration_date > '2020-01-01'", sqlite: null },
      'Role Filter': { postgres: 'SELECT first_name, last_name, salary FROM employees WHERE salary BETWEEN 60000 AND 100000', mysql: "SELECT first_name, last_name, city FROM customers WHERE city IN ('New York', 'Los Angeles', 'Chicago')", sqlite: "SELECT username, email FROM users WHERE role IN ('Admin', 'Manager')" }
    },
    slow: {
      'Full Table Scan': { postgres: 'SELECT * FROM employees WHERE salary > 80000 ORDER BY hire_date', mysql: "SELECT * FROM customers WHERE email LIKE '%gmail%'", sqlite: "SELECT * FROM users WHERE email LIKE '%test%'" },
      'Complex Join': { postgres: 'SELECT e1.first_name, e2.first_name as manager FROM employees e1 LEFT JOIN employees e2 ON e1.manager_id = e2.id', mysql: null, sqlite: null },
      'Pattern Search': { postgres: "SELECT * FROM employees WHERE first_name LIKE '%John%' OR last_name LIKE '%Smith%'", mysql: "SELECT * FROM customers WHERE first_name LIKE '%A%' AND last_name LIKE '%son'", sqlite: "SELECT * FROM users WHERE username LIKE '%admin%' OR email LIKE '%test%'" }
    }
  }

  const runTest = async (queries: any) => {
    setLoading(true)
    try {
      const formattedQueries: any = {}
      if (queries.postgres) formattedQueries.postgres_query = queries.postgres
      if (queries.mysql) formattedQueries.mysql_query = queries.mysql
      if (queries.sqlite) formattedQueries.sqlite_query = queries.sqlite
      
      console.log('Sending performance analysis request:', formattedQueries)
      const result = await apiService.analyzeQueryPerformance(formattedQueries)
      console.log('Performance analysis result:', result)
      setResults(result)
    } catch (error: any) {
      console.error('Performance analysis error:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to analyze query performance'
      setResults({ 
        error: errorMessage,
        error_details: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const runCustom = async () => {
    const formattedQueries: any = {}
    if (customQueries.postgres.trim()) formattedQueries.postgres_query = customQueries.postgres.trim()
    if (customQueries.mysql.trim()) formattedQueries.mysql_query = customQueries.mysql.trim()
    if (customQueries.sqlite.trim()) formattedQueries.sqlite_query = customQueries.sqlite.trim()
    if (Object.keys(formattedQueries).length > 0) runTest(formattedQueries)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-screen">
        {/* Left Panel - Query Input */}
        <div className="w-2/5 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Query Performance</h1>
            <p className="text-gray-600 text-sm">Test database performance with AI insights</p>
            <QueryLoadingBar isLoading={loading} type="performance" />
            
            {/* Performance Analysis Flow */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-light text-gray-900 mb-4 text-center">
                Performance Analysis Flow
              </h3>
              <MermaidDiagram chart={`
                flowchart TD
                  A[SQL Query] --> B[Execute on Database]
                  B --> C[Collect Metrics]
                  C --> D[AI Analysis]
                  D --> E[Performance Report]
                  
                  B --> F[Execution Time]
                  B --> G[Resource Usage]
                  B --> H[Query Plan]
                  
                  F --> C
                  G --> C
                  H --> C
                  
                  classDef default fill:#f9f9f9,stroke:#e5e5e5,stroke-width:1px,color:#374151
              `} />
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-gray-100/50 rounded-xl p-1 mb-6">
            {[
              { id: 'fast', label: '🚀 Fast', color: 'text-emerald-600' },
              { id: 'medium', label: '⚡ Medium', color: 'text-amber-600' },
              { id: 'slow', label: '🐌 Slow', color: 'text-red-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Predefined Queries */}
          <div className="space-y-3 mb-8">
            {Object.entries(performanceQueries[activeTab as keyof typeof performanceQueries]).map(([name, queries]) => (
              <div key={name} className="bg-white/60 rounded-lg p-4 border border-gray-200/50 hover:bg-white/80 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">{name}</h3>
                  <div className="flex gap-1">
                    {[
                      { key: 'postgres', color: 'bg-blue-500' },
                      { key: 'mysql', color: 'bg-orange-500' },
                      { key: 'sqlite', color: 'bg-gray-500' }
                    ].map(({ key, color }) => (
                      <div key={key} className={`w-2 h-2 rounded-full ${queries[key] ? color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {[
                    { key: 'postgres', icon: '🐘', label: 'PostgreSQL' },
                    { key: 'mysql', icon: '🐬', label: 'MySQL' },
                    { key: 'sqlite', icon: '🪶', label: 'SQLite' }
                  ].map(({ key, icon, label }) => 
                    queries[key] && (
                      <div key={key} className="text-xs">
                        <div className="text-gray-600 mb-1">{icon} {label}:</div>
                        <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-xs font-mono block">
                          {queries[key]}
                        </code>
                      </div>
                    )
                  )}
                </div>
                <Button onClick={() => runTest(queries)} disabled={loading} color="primary" className="w-full text-sm py-2">
                  {loading ? 'Testing...' : 'Run Test'}
                </Button>
              </div>
            ))}
          </div>

          {/* Custom Queries */}
          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
            <h3 className="font-medium text-gray-800 mb-4">Custom Queries</h3>
            <div className="space-y-3">
              {[
                { db: 'PostgreSQL', key: 'postgres', icon: '🐘' },
                { db: 'MySQL', key: 'mysql', icon: '🐬' },
                { db: 'SQLite', key: 'sqlite', icon: '🪶' }
              ].map(({ db, key, icon }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{icon} {db}</label>
                  <textarea
                    value={customQueries[key as keyof typeof customQueries]}
                    onChange={(e) => setCustomQueries(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${db} query...`}
                    className="w-full h-16 p-2 text-xs font-mono bg-white/80 border border-gray-200 rounded-md resize-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <Button
                onClick={runCustom}
                disabled={loading || !Object.values(customQueries).some(q => q.trim())}
                color="primary"
                className="w-full text-sm py-2 mt-3"
              >
                {loading ? 'Analyzing...' : 'Analyze Custom'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-8 overflow-y-auto">
          {results ? (
            <div className="max-w-4xl">
              <h2 className="text-xl font-light text-gray-800 mb-6">Performance Analysis</h2>
              
              {results.error ? (
                <div className="bg-red-50/80 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-red-500 text-2xl mr-4">⚠️</span>
                    <div>
                      <h3 className="text-red-800 font-medium">Analysis Failed</h3>
                      <p className="text-red-700 text-sm mt-1">{results.error}</p>
                    </div>
                  </div>
                  {results.error_details && (
                    <div className="bg-red-100/50 rounded p-3 mt-3">
                      <h4 className="text-red-800 font-medium text-sm mb-2">Error Details:</h4>
                      <div className="text-red-700 text-xs space-y-1">
                        {results.error_details.status && (
                          <div>Status: {results.error_details.status} {results.error_details.statusText}</div>
                        )}
                        {results.error_details.data && (
                          <div>Response: {JSON.stringify(results.error_details.data, null, 2)}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Performance Metrics */}
                  {results.performance_results && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-3">📊</span>
                        Database Performance
                      </h3>
                      <div className="grid gap-4">
                        {Object.entries(results.performance_results).map(([db, result]: [string, any]) => (
                          <div key={db} className={`p-6 rounded-xl border-l-4 ${
                            result.success ? 'bg-emerald-50/80 border-emerald-400' : 'bg-red-50/80 border-red-400'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                {db === 'postgres' && <span className="text-blue-500 mr-2">🐘</span>}
                                {db === 'mysql' && <span className="text-orange-500 mr-2">🐬</span>}
                                {db === 'sqlite' && <span className="text-gray-500 mr-2">🪶</span>}
                                {db.toUpperCase()}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                result.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {result.success ? '✓ Success' : '✗ Failed'}
                              </span>
                            </div>
                            {result.success ? (
                              <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">{result.execution_time_ms?.toFixed(1) || 0}</div>
                                  <div className="text-xs text-gray-600">milliseconds</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">{result.rows_returned || 0}</div>
                                  <div className="text-xs text-gray-600">rows returned</div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-red-600 text-sm">{result.error || 'Unknown error occurred'}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {results.ai_recommendations && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-3">🤖</span>
                        AI Insights & Recommendations
                      </h3>
                      
                      {results.ai_recommendations.overall_assessment && (
                        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6 mb-6">
                          <h4 className="font-medium text-blue-900 mb-3">Overall Assessment</h4>
                          <p className="text-blue-800 leading-relaxed">{results.ai_recommendations.overall_assessment}</p>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {results.ai_recommendations.database_recommendations && Object.entries(results.ai_recommendations.database_recommendations).map(([db, rec]: [string, any]) => (
                          rec.recommendations && rec.recommendations.length > 0 && (
                            <div key={db} className="bg-white/80 border border-gray-200 rounded-xl p-6">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                {db === 'postgres' && <span className="text-blue-500 mr-2">🐘</span>}
                                {db === 'mysql' && <span className="text-orange-500 mr-2">🐬</span>}
                                {db === 'sqlite' && <span className="text-gray-500 mr-2">🪶</span>}
                                {db.toUpperCase()} - {rec.assessment}
                              </h4>
                              <div className="space-y-2">
                                {rec.recommendations.map((recommendation: string, idx: number) => (
                                  <div key={idx} className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-8xl mb-6">📊</div>
                <h3 className="text-xl font-light mb-2">Ready to Analyze</h3>
                <p className="text-sm">Select a query from the left panel to begin performance testing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QueryPerformance