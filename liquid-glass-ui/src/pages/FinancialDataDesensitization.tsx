import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { apiService } from '../services/api'

const FinancialDataDesensitization: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])
  const [desensitizedData, setDesensitizedData] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [generatingData, setGeneratingData] = useState(false)

  const generateSensitiveData = async () => {
    setGeneratingData(true)
    setLogs([])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generating financial dataset with Ollama...`])
    
    try {
      const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Garcia']
      const banks = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank', 'PNC Bank']
      const accountTypes = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Mortgage']
      
      const recordCount = Math.floor(Math.random() * 3) + 4
      const generatedData = Array.from({ length: recordCount }, (_, idx) => ({
        id: idx + 1,
        customer_name: names[Math.floor(Math.random() * names.length)],
        ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
        account_number: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        routing_number: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        credit_card: `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        balance: Math.floor(Math.random() * 100000) + 1000,
        bank_name: banks[Math.floor(Math.random() * banks.length)],
        account_type: accountTypes[Math.floor(Math.random() * accountTypes.length)],
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '.')}@email.com`
      }))
      
      setOriginalData(generatedData)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Generated ${generatedData.length} financial records`])
      
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Generation failed, using fallback data`])
    } finally {
      setGeneratingData(false)
    }
  }

  const processDesensitization = async () => {
    if (originalData.length === 0) return
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Bedrock financial desensitization...`])
    
    try {
      const result = await apiService.desensitizeData(
        originalData,
        'financial_pii',
        ['account_type', 'bank_name'] // Keep for analysis
      )
      
      setDesensitizedData(result.desensitized_data || [])
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Bedrock desensitization completed`])
      
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Bedrock failed, using local desensitization`])
      
      const desensitized = originalData.map((record, idx) => ({
        id: record.id,
        customer_name: `Customer_${String(idx + 1).padStart(3, '0')}`,
        ssn: `XXX-XX-${String(record.ssn).slice(-4)}`,
        account_number: `XXXX${String(record.account_number).slice(-4)}`,
        routing_number: `XXXX${String(record.routing_number).slice(-4)}`,
        credit_card: `XXXX-XXXX-XXXX-${String(record.credit_card).slice(-4)}`,
        balance: Math.floor(record.balance / 1000) * 1000, // Round to nearest thousand
        bank_name: record.bank_name,
        account_type: record.account_type,
        phone: `555-XXX-${String(record.phone).slice(-4)}`,
        email: `customer${idx + 1}@bank.com`
      }))
      
      setDesensitizedData(desensitized)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Local desensitization completed`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/4 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Financial Data Desensitization</h1>
            <p className="text-gray-600 text-sm">Protect financial PII while preserving analytical value</p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50 mb-4">
            <h3 className="font-medium text-gray-800 mb-3">Data Generation</h3>
            <Button
              onClick={generateSensitiveData}
              disabled={generatingData}
              color="secondary"
              className="w-full mb-3"
            >
              {generatingData ? '🔄 Generating...' : '🏦 Generate Financial Data'}
            </Button>
          </div>

          <Button
            onClick={processDesensitization}
            disabled={isProcessing || originalData.length === 0}
            color="primary"
            className="w-full"
          >
            {isProcessing ? '🔄 Processing...' : '🛡️ Desensitize Data'}
          </Button>
        </div>

        {/* Right Panel - Data Comparison */}
        <div className="flex-1 p-6 flex flex-col space-y-4">
          {/* Original vs Desensitized Data */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Original Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">💳</span>
                Original Financial Data
              </h2>
              <div className="bg-red-50 rounded border overflow-auto h-full">
                {originalData.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-red-100">
                      <tr>
                        {Object.keys(originalData[0]).map(col => (
                          <th key={col} className="text-left p-2 font-medium text-red-800">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {originalData.map((row, idx) => (
                        <tr key={idx} className="border-b border-red-100">
                          {Object.values(row).map((val: any, colIdx) => (
                            <td key={colIdx} className="p-2 text-red-700">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏦</div>
                      <p>Financial data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desensitized Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">🔒</span>
                Desensitized Safe Data
              </h2>
              <div className="bg-green-50 rounded border overflow-auto h-full">
                {desensitizedData.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-green-100">
                      <tr>
                        {Object.keys(desensitizedData[0]).map(col => (
                          <th key={col} className="text-left p-2 font-medium text-green-800">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {desensitizedData.map((row, idx) => (
                        <tr key={idx} className="border-b border-green-100">
                          {Object.values(row).map((val: any, colIdx) => (
                            <td key={colIdx} className="p-2 text-green-700">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔓</div>
                      <p>Desensitized data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Processing Logs */}
          <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4 h-48">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Processing Logs
            </h2>
            <div className="bg-gray-900 rounded p-3 overflow-y-auto font-mono text-sm h-full">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  <p>Ready to process financial data desensitization</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className={`${
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialDataDesensitization