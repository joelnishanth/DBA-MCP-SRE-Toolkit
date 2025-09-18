import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'
import LoadingBar from '../components/LoadingBar'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MermaidDiagram from '../components/MermaidDiagram'

const AIDiagnostics: React.FC = () => {
  const [containers, setContainers] = useState<string[]>([])
  const [selectedContainer, setSelectedContainer] = useState('')
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [fixPreview, setFixPreview] = useState<any>(null)
  const [fixResult, setFixResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    const loadContainers = async () => {
      const names = await apiService.getContainerNames()
      setContainers(names)
    }
    loadContainers()
  }, [])

  const handleDiagnose = async () => {
    if (!selectedContainer) return
    
    setLoading(true)
    setFixPreview(null)
    setFixResult(null)
    setDiagnosis(null)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
      
      const result = await apiService.diagnoseContainer(selectedContainer, { signal: controller.signal })
      clearTimeout(timeoutId)
      setDiagnosis(result)
    } catch (error) {
      console.error('Diagnosis error:', error)
      const errorMessage = await generateErrorNarrative(error.message || 'Failed to diagnose container')
      setDiagnosis({ error: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const generateErrorNarrative = async (error: string) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Explain this technical error in simple, user-friendly terms: ${error}`,
          stream: false
        })
      })
      const data = await response.json()
      return data.response || error
    } catch {
      return error
    }
  }

  const handleGetFixPreview = async () => {
    if (!selectedContainer) return
    
    setLoading(true)
    try {
      const result = await apiService.getFixPreview(selectedContainer)
      setFixPreview(result)
    } catch (error) {
      console.error('Fix preview error:', error)
      setFixPreview({ error: error.message || 'Failed to get fix preview' })
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteFix = async () => {
    if (!selectedContainer) return
    
    setLoading(true)
    setShowConfirmation(false)
    try {
      const result = await apiService.executeContainerFix(selectedContainer, true)
      setFixResult(result)
    } catch (error) {
      console.error('Fix execution error:', error)
      setFixResult({ error: error.message || 'Failed to execute fix' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-16 px-8">
        <Block title="AI Diagnostics">
          <div className="space-y-8">
            {/* AI Diagnostics Flow */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-light text-gray-900 mb-4 text-center">
                AI Diagnostics Process
              </h3>
              <MermaidDiagram chart={`
                sequenceDiagram
                  participant User
                  participant System
                  participant AI
                  participant Container
                  
                  User->>System: Select container
                  System->>Container: Collect metrics & logs
                  Container-->>System: Health data
                  System->>AI: Analyze symptoms
                  AI->>AI: Generate diagnosis
                  AI-->>System: Recommendations
                  System-->>User: Diagnostic report
              `} />
            </div>
            
            <LoadingBar isLoading={loading} />
            <div className="flex gap-4 items-center">
              <select 
                value={selectedContainer} 
                onChange={(e) => setSelectedContainer(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 min-w-64"
              >
                <option value="">Select a container...</option>
                {containers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <Button 
                onClick={handleDiagnose} 
                disabled={!selectedContainer || loading}
                color="primary"
              >
                {loading ? 'Analyzing...' : 'Diagnose'}
              </Button>
            </div>
          </div>
        </Block>

        {diagnosis && (
          <Block title="Diagnosis Results">
            {diagnosis.error ? (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium mb-2">❌ Error Occurred</p>
                <p className="text-red-700">{diagnosis.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 mb-3">Analysis:</p>
                  <div className="text-gray-700 leading-relaxed">
                    <MarkdownRenderer content={diagnosis.claude_response} />
                  </div>
                </div>
                <Button 
                  onClick={handleGetFixPreview}
                  disabled={loading}
                  color="secondary"
                >
                  👁 Preview Fix
                </Button>
              </div>
            )}
          </Block>
        )}

        {fixPreview && (
          <Block title="Fix Preview">
            {fixPreview.error ? (
              <p className="text-red-500">{fixPreview.error}</p>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 mb-3">Proposed Fix:</p>
                  <div className="text-gray-700 leading-relaxed">
                    <MarkdownRenderer content={fixPreview.fix_plan} />
                  </div>
                </div>
                {!showConfirmation ? (
                  <Button 
                    onClick={() => setShowConfirmation(true)}
                    color="tertiary"
                  >
                    Execute Fix
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-amber-600 font-medium">Are you sure you want to execute this fix?</p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleExecuteFix}
                        disabled={loading}
                        color="primary"
                      >
                        {loading ? 'Executing...' : '✓ Yes, Execute'}
                      </Button>
                      <Button 
                        onClick={() => setShowConfirmation(false)}
                        disabled={loading}
                        color="default"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Block>
        )}

        {fixResult && (
          <Block title="Fix Execution Results">
            {fixResult.error ? (
              <p className="text-red-500">❌ {fixResult.error}</p>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">Fix executed successfully</p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900 mb-3">Result:</p>
                  <div className="text-gray-700 leading-relaxed">
                    <MarkdownRenderer content={fixResult.claude_response} />
                  </div>
                </div>
              </div>
            )}
          </Block>
        )}
      </div>
    </main>
  )
}

export default AIDiagnostics