import React, { useState, useEffect } from 'react'

interface QueryLoadingBarProps {
  isLoading: boolean
  type: 'nlp' | 'performance'
}

const QueryLoadingBar: React.FC<QueryLoadingBarProps> = ({ isLoading, type }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const nlpSteps = [
    { icon: '🧠', text: 'Understanding query', color: 'text-purple-500' },
    { icon: '🔄', text: 'Generating SQL', color: 'text-blue-500' },
    { icon: '🗄️', text: 'Querying databases', color: 'text-green-500' },
    { icon: '📊', text: 'Analyzing results', color: 'text-orange-500' },
    { icon: '✨', text: 'Formatting response', color: 'text-pink-500' }
  ]

  const performanceSteps = [
    { icon: '⚡', text: 'Preparing queries', color: 'text-yellow-500' },
    { icon: '🏃', text: 'Executing tests', color: 'text-blue-500' },
    { icon: '📈', text: 'Measuring performance', color: 'text-green-500' },
    { icon: '🤖', text: 'AI analysis', color: 'text-purple-500' },
    { icon: '📋', text: 'Generating report', color: 'text-orange-500' }
  ]

  const steps = type === 'nlp' ? nlpSteps : performanceSteps
  const title = type === 'nlp' ? 'Processing Natural Language Query' : 'Analyzing Query Performance'
  const emoji = type === 'nlp' ? '🔍' : '⚡'
  const gradient = type === 'nlp' ? 'from-purple-50 to-blue-50' : 'from-yellow-50 to-orange-50'
  const border = type === 'nlp' ? 'border-purple-200' : 'border-yellow-200'

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setCurrentStep(0)
      return
    }

    let step = 0
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCurrentStep(step)
        setProgress(((step + 1) / steps.length) * 100)
        step++
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className={`bg-gradient-to-r ${gradient} p-8 rounded-xl border ${border} mb-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div className="text-2xl animate-spin">{emoji}</div>
      </div>
      
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
              index <= currentStep ? 'bg-white shadow-lg scale-110' : 'bg-gray-100'
            }`}>
              {step.icon}
            </div>
            <div className={`mt-2 text-xs text-center max-w-20 transition-colors duration-500 ${
              index === currentStep ? step.color + ' font-semibold' : 'text-gray-400'
            }`}>
              {step.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${type === 'nlp' ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500' : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500'} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{steps[currentStep]?.text}...</span>
          <span className="text-sm font-semibold text-gray-800">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}

export default QueryLoadingBar