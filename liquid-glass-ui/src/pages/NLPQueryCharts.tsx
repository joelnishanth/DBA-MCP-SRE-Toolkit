import React, { useState } from 'react'
import { apiService } from '../services/api'
import { Button } from '../components/ui/Button'
import QueryLoadingBar from '../components/QueryLoadingBar'
import MermaidDiagram from '../components/MermaidDiagram'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000']

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

const NLPQueryCharts: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'scatter'>('bar')
  const [showSchemas, setShowSchemas] = useState(false)

  const processDataForCharts = (results: any): ChartData[] => {
    if (!results?.database_results) return []

    const allData: ChartData[] = []
    
    // Process each database result
    Object.entries(results.database_results).forEach(([db, result]: [string, any]) => {
      if (result.success && result.data && result.data.length > 0) {
        result.data.forEach((row: any, index: number) => {
          const processedRow: ChartData = { name: `${db}_${index}`, value: 0 }
          
          // Process each column
          result.columns?.forEach((col: string, colIdx: number) => {
            const value = Array.isArray(row) ? row[colIdx] : row[col]
            
            // Try to convert to number for charting
            if (typeof value === 'number') {
              processedRow.value = value
              processedRow[col] = value
            } else if (typeof value === 'string') {
              const numValue = parseFloat(value)
              if (!isNaN(numValue)) {
                processedRow.value = numValue
                processedRow[col] = numValue
              } else {
                processedRow[col] = value
                processedRow.name = value // Use string values as names
              }
            } else {
              processedRow[col] = value
            }
          })
          
          allData.push(processedRow)
        })
      }
    })

    return allData
  }

  const generateChartSuggestions = (data: ChartData[]): string => {
    if (data.length === 0) return "No data available for charting"
    
    const hasNumericData = data.some(item => typeof item.value === 'number' && item.value > 0)
    const hasCategories = data.some(item => typeof item.name === 'string')
    
    let suggestions = "Chart Suggestions:\n"
    
    if (hasNumericData && hasCategories) {
      suggestions += "• Bar Chart: Compare values across categories\n"
      suggestions += "• Pie Chart: Show distribution of values\n"
    }
    
    if (data.length > 5) {
      suggestions += "• Line Chart: Show trends over data points\n"
    }
    
    if (hasNumericData) {
      suggestions += "• Scatter Plot: Explore relationships between variables\n"
    }
    
    return suggestions
  }

  const handleSubmit = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const result = await apiService.executeNlpQuery(query)
      setResults(result)
      
      // Process data for charts
      const processedData = processDataForCharts(result)
      setChartData(processedData)
      
      // Post update to srebot-mcp
      await postToSrebotMcp({
        feature: "NLP Query with Charts",
        description: `Executed natural language query: "${query}"`,
        code_highlights: [
          "Natural language to SQL conversion",
          "Multi-database query execution",
          "Automatic chart data processing",
          "Interactive data visualization"
        ],
        files_created: [],
        files_modified: ["NLPQueryCharts.tsx"],
        status: "completed",
        kiro_notes: `Query processed successfully with ${processedData.length} data points for visualization`,
        next_steps: [
          "Analyze chart patterns",
          "Export visualization data",
          "Create dashboard views"
        ]
      })
      
    } catch (error) {
      console.error('NLP Query Error:', error)
      setResults({
        error: `Failed to execute query: ${error.response?.data?.detail || error.message || 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const postToSrebotMcp = async (updateData: any) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
      await fetch(`${API_BASE_URL}/dev/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
    } catch (error) {
      console.error('Failed to post to srebot-mcp:', error)
    }
  }

  const renderChart = () => {
    if (chartData.length === 0) return null

    const chartProps = {
      width: 600,
      height: 300,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...chartProps}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis dataKey="value" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  const demoQueries = [
    { label: 'Department Salary Analysis', query: 'Show average salary by department from employees table' },
    { label: 'Customer City Distribution', query: 'Count customers by city from all databases' },
    { label: 'User Role Breakdown', query: 'Show count of users by role and active status' },
    { label: 'High Earners Count', query: 'Count employees with salary above 70000 by department' },
    { label: 'Registration Trends', query: 'Show customer registration counts by month' },
    { label: 'Email Domain Stats', query: 'Count users by email domain across all systems' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex h-screen">
        {/* Left Panel - Query Input */}
        <div className="w-2/5 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-800 mb-2">NLP Query with Charts</h1>
            <p className="text-gray-600 text-sm">Ask questions in plain English, get SQL results with visualizations</p>
            
            {/* Text-to-SQL-to-Chart Process */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-light text-gray-900 mb-4 text-center">
                Text-to-SQL-to-Chart Process
              </h3>
              <MermaidDiagram chart={`
                sequenceDiagram
                  participant User
                  participant NLP
                  participant AI
                  participant Database
                  participant Charts
                  
                  User->>NLP: "Show salary by department"
                  NLP->>AI: Parse natural language
                  AI->>AI: Generate SQL query
                  AI->>Database: Execute SQL
                  Database-->>AI: Return results
                  AI-->>Charts: Process data for visualization
                  Charts-->>NLP: Generate interactive charts
                  NLP-->>User: Display data + charts
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
              placeholder="e.g., Show average salary by department"
              className="w-full h-24 p-4 bg-white/80 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              color="primary"
              className="w-full mt-4"
            >
              {loading ? 'Processing...' : 'Query & Visualize'}
            </Button>
          </div>

          {/* Chart Type Selector */}
          {chartData.length > 0 && (
            <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50 mb-6">
              <h3 className="font-medium text-gray-800 mb-4">Chart Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'bar', label: 'Bar Chart', desc: 'Compare values' },
                  { type: 'pie', label: 'Pie Chart', desc: 'Show distribution' },
                  { type: 'line', label: 'Line Chart', desc: 'Show trends' },
                  { type: 'scatter', label: 'Scatter Plot', desc: 'Show relationships' }
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      chartType === type 
                        ? 'bg-blue-100 border-blue-300 text-blue-800' 
                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                    }`}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-gray-600">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demo Queries */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50 mb-6">
            <h3 className="font-medium text-gray-800 mb-4">Chart-Friendly Queries</h3>
            <div className="space-y-2">
              {demoQueries.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(demo.query)}
                  className="w-full text-left p-3 bg-white/60 hover:bg-white/80 border border-gray-200/50 rounded-lg transition-all"
                >
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{demo.label}</div>
                    <div className="text-xs text-gray-600">{demo.query}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Database Schemas */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50">
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
                      <td className="py-2 text-blue-600">PostgreSQL</td>
                      <td className="py-2 font-medium">employees</td>
                      <td className="py-2 text-gray-600">id, first_name, last_name, email, department, salary, hire_date, manager_id</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-orange-600">MySQL</td>
                      <td className="py-2 font-medium">customers</td>
                      <td className="py-2 text-gray-600">id, first_name, last_name, email, phone, city, registration_date</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">SQLite</td>
                      <td className="py-2 font-medium">users</td>
                      <td className="py-2 text-gray-600">id, username, first_name, last_name, email, role, is_active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Results and Charts */}
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
                {/* Chart Visualization */}
                {chartData.length > 0 && (
                  <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      Data Visualization
                    </h3>
                    <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
                      {renderChart()}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50/80 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">Chart Insights</h4>
                      <pre className="text-blue-700 text-sm whitespace-pre-wrap">
                        {generateChartSuggestions(chartData)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* AI Analysis & Generated Queries */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🧠</span>
                      AI Analysis
                    </h3>
                    <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4 h-64 overflow-y-auto">
                      <p className="text-blue-800 leading-relaxed">{results.explanation}</p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🔧</span>
                      Generated SQL
                    </h3>
                    <div className="space-y-3 h-64 overflow-y-auto">
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

                {/* Database Results */}
                <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-3">📋</span>
                    Database Results ({chartData.length} data points)
                  </h3>
                  {results.database_results && (
                    <div className="space-y-6">
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
                                <div className="overflow-x-auto max-h-64">
                                  <table className="w-full min-w-full">
                                    <thead>
                                      <tr className="bg-white border-b border-gray-200 sticky top-0">
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
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-8xl mb-6">📊</div>
                <h3 className="text-xl font-light mb-2">Ready to Query & Visualize</h3>
                <p className="text-sm">Ask a question in natural language to see AI analysis, results, and interactive charts</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NLPQueryCharts