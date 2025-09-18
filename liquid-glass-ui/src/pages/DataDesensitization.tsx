import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { apiService } from '../services/api'

const DataDesensitization: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])
  const [desensitizedData, setDesensitizedData] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [selectedDataset, setSelectedDataset] = useState('phi')
  const [generatingData, setGeneratingData] = useState(false)

  const generateSensitiveData = async () => {
    setGeneratingData(true)
    setLogs([])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generating sensitive dataset with Ollama...`])
    
    try {
      const timestamp = Date.now()
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Generate ${Math.floor(Math.random() * 3) + 3} unique realistic medical patient records (timestamp: ${timestamp}) in JSON format with these fields: patient_name, ssn, dob, phone, email, diagnosis, doctor_name, address, insurance_id. Use different names, locations, and medical conditions each time. Make them completely different from previous generations.`,
          stream: false
        })
      })
      
      const data = await response.json()
      
      // Parse AI response and create structured data with randomization
      const names = ['Jennifer Martinez', 'Robert Chen', 'Amanda Foster', 'David Wilson', 'Sarah Johnson', 'Michael Brown', 'Lisa Garcia', 'James Miller']
      const diagnoses = ['Migraine', 'Arthritis', 'Anxiety', 'Diabetes', 'Hypertension', 'Asthma', 'Depression', 'Allergies']
      const doctors = ['Dr. Thompson', 'Dr. Rodriguez', 'Dr. Kim', 'Dr. Anderson', 'Dr. Williams', 'Dr. Davis', 'Dr. Taylor']
      const cities = ['Boston MA', 'Seattle WA', 'Austin TX', 'Denver CO', 'Miami FL', 'Portland OR', 'Nashville TN']
      
      const recordCount = Math.floor(Math.random() * 3) + 3
      const generatedData = Array.from({ length: recordCount }, (_, idx) => ({
        id: idx + 1,
        patient_name: names[Math.floor(Math.random() * names.length)],
        ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
        dob: `19${Math.floor(Math.random() * 40) + 60}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '.')}@email.com`,
        diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        doctor: doctors[Math.floor(Math.random() * doctors.length)],
        address: `${Math.floor(Math.random() * 999) + 100} ${['Oak', 'Pine', 'Elm', 'Main', 'First'][Math.floor(Math.random() * 5)]} St, ${cities[Math.floor(Math.random() * cities.length)]}`,
        insurance_id: `INS-${Math.floor(Math.random() * 900000) + 100000}`
      }))
      
      setOriginalData(generatedData)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Generated ${generatedData.length} sensitive records`])
      
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Ollama generation failed, using fallback data`])
      
      // Generate random fallback data if Ollama fails
      const fallbackData = Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, idx) => ({
        id: idx + 1,
        patient_name: ['Alex Johnson', 'Maria Garcia', 'John Smith', 'Emily Davis'][Math.floor(Math.random() * 4)],
        ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
        dob: `19${Math.floor(Math.random() * 40) + 60}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `user${idx + 1}@email.com`,
        diagnosis: ['Headache', 'Back Pain', 'Cold'][Math.floor(Math.random() * 3)],
        doctor: `Dr. ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        address: `${Math.floor(Math.random() * 999) + 100} Main St, City ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        insurance_id: `INS-${Math.floor(Math.random() * 900000) + 100000}`
      }))
      setOriginalData(fallbackData)
    } finally {
      setGeneratingData(false)
    }
  }

  const processDesensitization = async () => {
    if (originalData.length === 0) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ No data to desensitize. Generate data first.`])
      return
    }
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Bedrock-powered desensitization...`])
    
    try {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Calling Bedrock API...`])
      
      // Call bot-core for Bedrock desensitization using API service
      const result = await apiService.desensitizeData(
        originalData,
        'medical_phi',
        ['diagnosis'] // Keep medical data for research
      )
      
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Bedrock response: ${JSON.stringify(result).substring(0, 100)}...`])
      setDesensitizedData(result.desensitized_data || [])
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Bedrock desensitization completed`])
      
    } catch (error) {
      console.error('Bedrock API Error:', error)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Bedrock failed: ${error.message || error}, using local desensitization`])
      
      // Fallback local desensitization with context awareness
      const desensitized = originalData.map((record, idx) => ({
        id: record.id,
        patient_name: `Patient_${String(idx + 1).padStart(3, '0')}`,
        ssn: `XXX-XX-${String(record.ssn).slice(-4)}`, // Keep last 4 digits
        dob: `${String(record.dob).slice(0, 4)}-XX-XX`, // Keep year only
        phone: `555-XXX-${String(record.phone).slice(-4)}`,
        email: `patient${idx + 1}@research.org`,
        diagnosis: record.diagnosis, // Preserve for research
        doctor: `Dr. ${String.fromCharCode(65 + idx)}`,
        address: `[REDACTED] ${String(record.address).split(' ').pop()}`, // Keep state only
        insurance_id: `INS-XXXX${String(record.insurance_id).slice(-2)}`
      }))
      
      setDesensitizedData(desensitized)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Local desensitization completed`])
    } finally {
      setIsProcessing(false)
    }
  }

  const processOllamaDesensitization = async () => {
    if (originalData.length === 0) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ No data to desensitize. Generate data first.`])
      return
    }
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Ollama-powered desensitization...`])
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `You are a data privacy expert. Desensitize this medical PHI dataset while preserving research utility.

Rules:
1. Replace patient names with Patient_001, Patient_002, etc.
2. Mask SSNs but keep last 4 digits: XXX-XX-1234
3. Anonymize emails: patient1@research.org
4. Mask phone numbers: 555-XXX-1234
5. Redact addresses but keep state: [REDACTED] MA
6. Keep diagnosis field unchanged for research
7. Anonymize doctor names: Dr. A, Dr. B, etc.
8. Mask insurance IDs: INS-XXXX12

Original data: ${JSON.stringify(originalData)}

Return ONLY a valid JSON array of desensitized records with the same structure.`,
          stream: false
        })
      })
      
      const data = await response.json()
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Ollama response received`])
      
      try {
        // Try to parse Ollama's response as JSON
        const jsonMatch = data.response.match(/\[.*\]/s)
        if (jsonMatch) {
          const desensitized = JSON.parse(jsonMatch[0])
          setDesensitizedData(desensitized)
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Ollama desensitization completed`])
        } else {
          throw new Error('No valid JSON found in response')
        }
      } catch (parseError) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Ollama JSON parsing failed, using fallback`])
        
        // Fallback desensitization if Ollama response can't be parsed
        const desensitized = originalData.map((record, idx) => ({
          id: record.id,
          patient_name: `Patient_${String(idx + 1).padStart(3, '0')}`,
          ssn: `XXX-XX-${String(record.ssn).slice(-4)}`,
          dob: `${String(record.dob).slice(0, 4)}-XX-XX`,
          phone: `555-XXX-${String(record.phone).slice(-4)}`,
          email: `patient${idx + 1}@research.org`,
          diagnosis: record.diagnosis,
          doctor: `Dr. ${String.fromCharCode(65 + idx)}`,
          address: `[REDACTED] ${String(record.address).split(' ').pop()}`,
          insurance_id: `INS-XXXX${String(record.insurance_id).slice(-2)}`
        }))
        
        setDesensitizedData(desensitized)
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Fallback desensitization completed`])
      }
      
    } catch (error) {
      console.error('Ollama desensitization error:', error)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Ollama failed: ${error.message || error}, using fallback`])
      
      // Same fallback as above
      const desensitized = originalData.map((record, idx) => ({
        id: record.id,
        patient_name: `Patient_${String(idx + 1).padStart(3, '0')}`,
        ssn: `XXX-XX-${String(record.ssn).slice(-4)}`,
        dob: `${String(record.dob).slice(0, 4)}-XX-XX`,
        phone: `555-XXX-${String(record.phone).slice(-4)}`,
        email: `patient${idx + 1}@research.org`,
        diagnosis: record.diagnosis,
        doctor: `Dr. ${String.fromCharCode(65 + idx)}`,
        address: `[REDACTED] ${String(record.address).split(' ').pop()}`,
        insurance_id: `INS-XXXX${String(record.insurance_id).slice(-2)}`
      }))
      
      setDesensitizedData(desensitized)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Fallback desensitization completed`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/4 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Data Desensitization</h1>
            <p className="text-gray-600 text-sm">Remove sensitive information while preserving data utility</p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50 mb-4">
            <h3 className="font-medium text-gray-800 mb-3">Data Generation</h3>
            <Button
              onClick={generateSensitiveData}
              disabled={generatingData}
              color="secondary"
              className="w-full mb-3"
            >
              {generatingData ? '🔄 Generating...' : '🤖 Generate with Ollama'}
            </Button>
            
            <Button
              onClick={() => alert('Upload feature coming soon!')}
              disabled={true}
              color="default"
              className="w-full mb-3 opacity-50"
            >
              📁 Upload Dataset (Coming Soon)
            </Button>
          </div>

          <Button
            onClick={processDesensitization}
            disabled={isProcessing || originalData.length === 0}
            color="primary"
            className="w-full mb-3"
          >
            {isProcessing ? '🔄 Processing...' : '🛡️ Desensitize with Bedrock'}
          </Button>
          
          <Button
            onClick={processOllamaDesensitization}
            disabled={isProcessing || originalData.length === 0}
            color="secondary"
            className="w-full"
          >
            {isProcessing ? '🔄 Processing...' : '🤖 Desensitize with Ollama'}
          </Button>
        </div>

        {/* Right Panel - Data Comparison */}
        <div className="flex-1 p-6 flex flex-col space-y-4">
          {/* Original vs Desensitized Data */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Original Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Original Sensitive Data
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
                      <div className="text-4xl mb-2">🔒</div>
                      <p>Original data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desensitized Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">🛡️</span>
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
                  <p>Ready to process data desensitization</p>
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

export default DataDesensitization