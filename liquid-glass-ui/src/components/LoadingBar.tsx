import React, { useState, useEffect } from 'react'

interface LoadingBarProps {
  isLoading: boolean
  onError?: (error: string) => void
}

const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading, onError }) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: '🔌', text: 'Connecting to container', color: 'text-blue-500' },
    { icon: '📊', text: 'Analyzing system logs', color: 'text-green-500' },
    { icon: '🔍', text: 'Running diagnostics', color: 'text-yellow-500' },
    { icon: '🤖', text: 'Processing with AI', color: 'text-purple-500' },
    { icon: '✨', text: 'Finalizing results', color: 'text-pink-500' }
  ]

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setStatus('')
      setCurrentStep(0)
      return
    }

    let step = 0
    const interval = setInterval(() => {
      if (step < steps.length) {
        setCurrentStep(step)
        setStatus(steps[step].text)
        setProgress(((step + 1) / steps.length) * 100)
        step++
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-200 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">AI Diagnosis in Progress</h3>
        <div className="text-2xl animate-spin">⚡</div>
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
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{status}...</span>
          <span className="text-sm font-semibold text-gray-800">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}

export default LoadingBar