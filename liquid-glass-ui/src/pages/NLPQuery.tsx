import React, { useState } from 'react'
import { apiService } from '../services/api'
import { Button } from '../components/ui/Button'
import QueryLoadingBar from '../components/QueryLoadingBar'
import MermaidDiagram from '../components/MermaidDiagram'

const NLPQuery: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showSchemas, setShowSchemas] = useState(false)

  const handleSubmit = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const result = await apiService.executeNlpQuery(query)
      setResults(result)
    } catch (error) {
      console.error('NLP Query Error:', error)
      setResults({
        error: `Failed to execute query: ${error.response?.data?.detail || error.message || 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const demoQueries = [
    { emoji: '📧', label: 'Gmail Users Across All Systems', query: 'Find all people with gmail email addresses across employees, customers, and users' },
    { emoji: '👥', label: 'People Named John', query: 'Show all people named John from all databases' },
    { emoji: '💰', label: 'High Earners vs Customers', query: 'Find employees with salary above 80000 and customers from the same cities' },
    { emoji: '🏢', label: 'Active Users & Staff', query: 'List all active admin users and employees in management roles' },
    { emoji: '📊', label: 'Cross-System Summary', query: 'Count total employees, customers, and active users' },
    { emoji: '🎯', label: 'Email Domain Analysis', query: 'Show email domain distribution across all three systems' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Left Panel - Query Input */}
        <div className="w-2/5 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Natural Language Query</h1>
            <p className="text-gray-600 text-sm">Ask questions in plain English, get SQL results</p>
            
            {/* Text-to-SQL Process */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-light text-gray-900 mb-4 text-center">
                Text-to-SQL Process
              </h3>
              <MermaidDiagram chart={`
                sequenceDiagram
                  participant User
                  participant NLP
                  participant AI
                  participant Database
                  
                  User->>NLP: "Find engineers in Sales"
                  NLP->>AI: Parse natural language
                  AI->>AI: Generate SQL query
                  AI->>Database: Execute SQL
                  Database-->>AI: Return results
                  AI-->>NLP: Format response
                  NLP-->>User: Display data
              `} />
            </div>
            <QueryLoadingBar isLoading={loading} type="nlp" />
          </div>

          {/* Query Input */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Find all employees in the Sales department"
              className="w-full h-24 p-4 bg-white/80 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              color="primary"
              className="w-full mt-4"
            >
              {loading ? 'Processing...' : '🚀 Execute Query'}
            </Button>
          </div>

          {/* Demo Queries */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50">
            <h3 className="font-medium text-gray-800 mb-4">Example Queries</h3>
            <div className="space-y-2">
              {demoQueries.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(demo.query)}
                  className="w-full text-left p-3 bg-white/60 hover:bg-white/80 border border-gray-200/50 rounded-lg transition-all"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{demo.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{demo.label}</div>
                      <div className="text-xs text-gray-600">{demo.query}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Database Schemas */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50 mt-6">
            <button
              onClick={() => setShowSchemas(!showSchemas)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="font-medium text-gray-800">Database Schemas</h3>
              <span className="text-gray-500">{showSchemas ? '▲' : '▼'}</span>
            </button>
            {showSchemas && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">Database</th>
                      <th className="text-left py-2 font-medium text-gray-700">Table</th>
                      <th className="text-left py-2 font-medium text-gray-700">Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-blue-600">🐘 PostgreSQL</td>
                      <td className="py-2 font-medium">employees</td>
                      <td className="py-2 text-gray-600">id, first_name, last_name, email, department, salary, hire_date, manager_id</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-orange-600">🐬 MySQL</td>
                      <td className="py-2 font-medium">customers</td>
                      <td className="py-2 text-gray-600">id, first_name, last_name, email, phone, city, registration_date</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">🪶 SQLite</td>
                      <td className="py-2 font-medium">users</td>
                      <td className="py-2 text-gray-600">id, username, first_name, last_name, email, role, is_active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Analysis & Generated Queries */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          {results ? (
            results.error ? (
              <div className="bg-red-50/80 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-red-500 text-2xl mr-4">⚠️</span>
                  <div>
                    <h3 className="text-red-800 font-medium">Query Failed</h3>
                    <p className="text-red-700 text-sm mt-1">{results.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                {/* Top Section - AI Analysis & Generated Queries Side by Side */}
                <div className="grid grid-cols-2 gap-6 h-1/2">
                  {/* AI Analysis */}
                  <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🧠</span>
                      AI Analysis
                    </h3>
                    <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4 h-full overflow-y-auto">
                      <p className="text-blue-800 leading-relaxed">{results.explanation}</p>
                    </div>
                  </div>

                  {/* Generated SQL Queries */}
                  <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🔧</span>
                      Generated SQL
                    </h3>
                    <div className="space-y-3 h-full overflow-y-auto">
                      {results.generated_queries && [
                        { db: 'PostgreSQL', key: 'postgres_query', icon: '🐘', color: 'border-blue-200' },
                        { db: 'MySQL', key: 'mysql_query', icon: '🐬', color: 'border-orange-200' },
                        { db: 'SQLite', key: 'sqlite_query', icon: '🪶', color: 'border-gray-200' }
                      ].map(({ db, key, icon, color }) => (
                        <div key={key} className={`border ${color} rounded-lg p-3`}>
                          <div className="text-sm font-medium text-gray-700 mb-2">{icon} {db}</div>
                          {results.generated_queries[key] && results.generated_queries[key].toLowerCase() !== 'null' ? (
                            <code className="bg-gray-800 text-green-400 px-3 py-2 rounded text-xs font-mono block overflow-x-auto">
                              {results.generated_queries[key]}
                            </code>
                          ) : (
                            <div className="text-xs text-gray-500 italic">No relevant query</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Database Results */}
                <div className="flex-1 bg-white/80 rounded-xl border border-gray-200/50 p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    Database Results
                  </h3>
                  <div className="h-full">
                    {results.database_results && (
                      <div className="space-y-6 h-full">
                        {Object.entries(results.database_results).map(([db, result]: [string, any]) => (
                          <div key={db} className="bg-white/60 rounded-lg border border-gray-200/50 p-4">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                              {db === 'postgres' && <span className="text-blue-500 mr-2">🐘</span>}
                              {db === 'mysql' && <span className="text-orange-500 mr-2">🐬</span>}
                              {db === 'sqlite' && <span className="text-gray-500 mr-2">🪶</span>}
                              {db.toUpperCase()}
                            </h4>
                            {result.success ? (
                              result.data && result.data.length > 0 ? (
                                <div className="bg-gray-50/80 rounded-lg border border-gray-200 overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-full">
                                      <thead>
                                        <tr className="bg-white border-b border-gray-200">
                                          {result.columns?.map((col: string) => (
                                            <th key={col} className="text-left p-3 text-gray-900 font-semibold text-sm whitespace-nowrap">{col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.map((row: any, idx: number) => (
                                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            {result.columns?.map((col: string, colIdx: number) => (
                                              <td key={col} className="p-3 text-gray-700 text-sm whitespace-nowrap">
                                                {Array.isArray(row) ? row[colIdx] : row[col]}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="bg-gray-100/80 px-4 py-3 border-t border-gray-200">
                                    <p className="text-gray-600 text-sm font-medium">{result.data.length} records found</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50/80 rounded-lg p-6 border border-gray-200 flex items-center justify-center">
                                  <p className="text-gray-500 text-sm">No data found</p>
                                </div>
                              )
                            ) : (
                              <div className="bg-red-50/80 rounded-lg p-6 border border-red-200 flex items-center justify-center">
                                <p className="text-red-600 text-sm">Error: {result.error}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-8xl mb-6">🧠</div>
                <h3 className="text-xl font-light mb-2">Ready to Query</h3>
                <p className="text-sm">Ask a question in natural language to see AI analysis and results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NLPQuery