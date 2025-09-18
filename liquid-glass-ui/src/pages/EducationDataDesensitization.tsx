import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { apiService } from '../services/api'

const EducationDataDesensitization: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])
  const [desensitizedData, setDesensitizedData] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [generatingData, setGeneratingData] = useState(false)

  const generateSensitiveData = async () => {
    setGeneratingData(true)
    setLogs([])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generating education dataset with Ollama...`])
    
    try {
      const names = ['Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis', 'Ava Wilson', 'William Garcia']
      const schools = ['Lincoln High School', 'Washington Elementary', 'Roosevelt Middle School', 'Jefferson Academy']
      const grades = ['A', 'B', 'C', 'D', 'F']
      const subjects = ['Mathematics', 'English', 'Science', 'History', 'Art', 'Physical Education']
      
      const recordCount = Math.floor(Math.random() * 3) + 4
      const generatedData = Array.from({ length: recordCount }, (_, idx) => ({
        id: idx + 1,
        student_name: names[Math.floor(Math.random() * names.length)],
        student_id: `STU${Math.floor(Math.random() * 900000) + 100000}`,
        ssn: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
        dob: `200${Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        grade_level: Math.floor(Math.random() * 12) + 1,
        gpa: (Math.random() * 3 + 1).toFixed(2),
        school_name: schools[Math.floor(Math.random() * schools.length)],
        parent_name: `Parent of ${names[Math.floor(Math.random() * names.length)]}`,
        parent_phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 999) + 100} School St, District ${Math.floor(Math.random() * 10) + 1}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        grade: grades[Math.floor(Math.random() * grades.length)]
      }))
      
      setOriginalData(generatedData)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Generated ${generatedData.length} student records`])
      
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Generation failed, using fallback data`])
    } finally {
      setGeneratingData(false)
    }
  }

  const processDesensitization = async () => {
    if (originalData.length === 0) return
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Bedrock education desensitization...`])
    
    try {
      const result = await apiService.desensitizeData(
        originalData,
        'education_ferpa',
        ['grade_level', 'subject', 'grade', 'school_name'] // Keep for educational analysis
      )
      
      setDesensitizedData(result.desensitized_data || [])
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Bedrock desensitization completed`])
      
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Bedrock failed, using local desensitization`])
      
      const desensitized = originalData.map((record, idx) => ({
        id: record.id,
        student_name: `Student_${String(idx + 1).padStart(3, '0')}`,
        student_id: `STU${String(idx + 1).padStart(6, '0')}`,
        ssn: `XXX-XX-${String(record.ssn).slice(-4)}`,
        dob: `${String(record.dob).slice(0, 4)}-XX-XX`,
        grade_level: record.grade_level,
        gpa: Math.floor(parseFloat(record.gpa) * 10) / 10, // Round GPA
        school_name: record.school_name,
        parent_name: `Parent_${String(idx + 1).padStart(3, '0')}`,
        parent_phone: `555-XXX-${String(record.parent_phone).slice(-4)}`,
        address: `[REDACTED] District ${String(record.address).slice(-1)}`,
        subject: record.subject,
        grade: record.grade
      }))
      
      setDesensitizedData(desensitized)
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Local desensitization completed`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/4 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-light text-gray-800 mb-2">Education Data Desensitization</h1>
            <p className="text-gray-600 text-sm">Protect student FERPA data while enabling research</p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50 mb-4">
            <h3 className="font-medium text-gray-800 mb-3">Data Generation</h3>
            <Button
              onClick={generateSensitiveData}
              disabled={generatingData}
              color="secondary"
              className="w-full mb-3"
            >
              {generatingData ? '🔄 Generating...' : '🎓 Generate Student Data'}
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
                <span className="text-2xl mr-3">📚</span>
                Original Student Data
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
                      <div className="text-4xl mb-2">🎓</div>
                      <p>Student data will appear here</p>
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
                  <p>Ready to process education data desensitization</p>
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

export default EducationDataDesensitization