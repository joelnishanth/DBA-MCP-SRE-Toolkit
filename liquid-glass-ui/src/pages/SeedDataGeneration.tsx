import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'

const SeedDataGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [databases, setDatabases] = useState({
    postgres: { status: 'idle', records: 0, data: [] },
    mysql: { status: 'idle', records: 0, data: [] },
    sqlite: { status: 'idle', records: 0, data: [] }
  })

  const generateSeedData = async () => {
    setIsGenerating(true)
    setProgress(0)
    setLogs([])
    
    const steps = [
      { step: 'Initializing AI data generator...', progress: 10 },
      { step: 'Connecting to Ollama for schema analysis...', progress: 20 },
      { step: 'Generating PostgreSQL employee data...', progress: 40 },
      { step: 'Generating MySQL customer data...', progress: 60 },
      { step: 'Generating SQLite user data...', progress: 80 },
      { step: 'Finalizing data insertion...', progress: 100 }
    ]

    for (let i = 0; i < steps.length; i++) {
      const { step, progress } = steps[i]
      setCurrentStep(step)
      setProgress(progress)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`])
      
      // Simulate AI narrative generation
      if (i > 0) {
        try {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama2',
              prompt: `Generate a brief technical status update for: ${step}`,
              stream: false
            })
          })
          const data = await response.json()
          if (data.response) {
            setLogs(prev => [...prev, `[AI] ${data.response.substring(0, 100)}...`])
          }
        } catch (error) {
          console.log('Ollama not available, using fallback')
        }
      }

      // Update database status with sample data
      if (i === 2) {
        setDatabases(prev => ({ ...prev, postgres: { status: 'generating', records: 0, data: [] } }))
        setTimeout(() => {
          const sampleData = [
            { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com', department: 'Engineering', salary: 85000 },
            { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com', department: 'Marketing', salary: 72000 },
            { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com', department: 'Sales', salary: 68000 }
          ]
          setDatabases(prev => ({ ...prev, postgres: { status: 'completed', records: 150, data: sampleData } }))
        }, 1000)
      }
      if (i === 3) {
        setDatabases(prev => ({ ...prev, mysql: { status: 'generating', records: 0, data: [] } }))
        setTimeout(() => {
          const sampleData = [
            { id: 1, first_name: 'Alice', last_name: 'Brown', email: 'alice.brown@email.com', city: 'New York', phone: '555-0123' },
            { id: 2, first_name: 'Bob', last_name: 'Wilson', email: 'bob.wilson@email.com', city: 'Chicago', phone: '555-0456' },
            { id: 3, first_name: 'Carol', last_name: 'Davis', email: 'carol.davis@email.com', city: 'Los Angeles', phone: '555-0789' }
          ]
          setDatabases(prev => ({ ...prev, mysql: { status: 'completed', records: 200, data: sampleData } }))
        }, 1000)
      }
      if (i === 4) {
        setDatabases(prev => ({ ...prev, sqlite: { status: 'generating', records: 0, data: [] } }))
        setTimeout(() => {
          const sampleData = [
            { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User', email: 'admin@system.com', role: 'Admin', is_active: true },
            { id: 2, username: 'manager1', first_name: 'Sarah', last_name: 'Connor', email: 'sarah.connor@system.com', role: 'Manager', is_active: true },
            { id: 3, username: 'user1', first_name: 'Tom', last_name: 'Anderson', email: 'tom.anderson@system.com', role: 'User', is_active: false }
          ]
          setDatabases(prev => ({ ...prev, sqlite: { status: 'completed', records: 75, data: sampleData } }))
        }, 1000)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    setIsGenerating(false)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Seed data generation completed successfully!`])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/3 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Seed Data Generator</h1>
            <p className="text-gray-600 text-sm">Generate realistic test data using AI</p>
          </div>

          {/* Generation Controls */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50 mb-6">
            <h3 className="font-medium text-gray-800 mb-4">Data Generation</h3>
            <Button
              onClick={generateSeedData}
              disabled={isGenerating}
              color="primary"
              className="w-full mb-4"
            >
              {isGenerating ? '🔄 Generating...' : '🚀 Generate Seed Data'}
            </Button>
            
            {isGenerating && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{currentStep}</p>
              </div>
            )}
          </div>

          {/* Database Status */}
          <div className="bg-white/60 rounded-lg p-6 border border-gray-200/50">
            <h3 className="font-medium text-gray-800 mb-4">Database Status</h3>
            <div className="space-y-3">
              {[
                { key: 'postgres', name: '🐘 PostgreSQL', table: 'employees' },
                { key: 'mysql', name: '🐬 MySQL', table: 'customers' },
                { key: 'sqlite', name: '🪶 SQLite', table: 'users' }
              ].map(({ key, name, table }) => {
                const db = databases[key as keyof typeof databases]
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/40 rounded border">
                    <div>
                      <div className="font-medium text-sm">{name}</div>
                      <div className="text-xs text-gray-600">{table}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        db.status === 'completed' ? 'text-green-600' :
                        db.status === 'generating' ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {db.status === 'completed' ? '✅ Done' :
                         db.status === 'generating' ? '🔄 Generating' : '⏳ Waiting'}
                      </div>
                      <div className="text-xs text-gray-600">{db.records} records</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Logs and Data */}
        <div className="flex-1 p-8 flex flex-col space-y-6">
          {/* Live Logs */}
          <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6 h-1/2">
            <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Live Generation Logs
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-4 overflow-y-auto font-mono text-sm h-full">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>Ready to generate seed data</p>
                  <p className="text-xs mt-2">Click "Generate Seed Data" to start</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className={`${
                      log.includes('[AI]') ? 'text-blue-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="text-yellow-400 animate-pulse">
                      ▶ {currentStep}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Generated Data Tables */}
          <div className="bg-white/80 rounded-xl border border-gray-200/50 p-6 h-1/2">
            <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Generated Sample Data
            </h2>
            
            <div className="grid grid-cols-3 gap-4 h-full">
              {[
                { key: 'postgres', name: '🐘 PostgreSQL', table: 'employees' },
                { key: 'mysql', name: '🐬 MySQL', table: 'customers' },
                { key: 'sqlite', name: '🪶 SQLite', table: 'users' }
              ].map(({ key, name, table }) => {
                const db = databases[key as keyof typeof databases]
                return (
                  <div key={key} className="flex flex-col">
                    <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
                    <div className="bg-gray-50 rounded border flex-1 overflow-hidden">
                      {db.data.length > 0 ? (
                        <div className="overflow-auto h-full">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-white">
                              <tr className="border-b">
                                {Object.keys(db.data[0]).map(col => (
                                  <th key={col} className="text-left p-2 text-xs font-medium text-gray-700">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {db.data.map((row: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  {Object.values(row).map((val: any, colIdx: number) => (
                                    <td key={colIdx} className="p-2 text-xs text-gray-600">
                                      {typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          {db.status === 'generating' ? '🔄 Generating...' : 'No data yet'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeedDataGeneration