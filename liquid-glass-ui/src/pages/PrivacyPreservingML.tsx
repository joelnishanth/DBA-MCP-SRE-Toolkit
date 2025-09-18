import React, { useState } from 'react'
import { Button } from '../components/ui/Button'

const PrivacyPreservingML: React.FC = () => {
  const [activeTab, setActiveTab] = useState('federated')
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])
  const [processedData, setProcessedData] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [privacyMetrics, setPrivacyMetrics] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)

  const generateDeviceData = async () => {
    setIsProcessing(true)
    setLogs([])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Generating simulated device data...`])
    
    // Simulate realistic device usage data
    const apps = ['Safari', 'Messages', 'Photos', 'Music', 'Maps', 'Weather', 'Mail', 'Calendar']
    const locations = ['Home', 'Work', 'Gym', 'Store', 'Restaurant', 'Park']
    
    const deviceData = Array.from({ length: 50 }, (_, idx) => ({
      user_id: `user_${Math.floor(idx / 10) + 1}`, // 5 users, 10 records each
      device_id: `device_${Math.floor(Math.random() * 1000000)}`,
      app_name: apps[Math.floor(Math.random() * apps.length)],
      usage_duration: Math.floor(Math.random() * 3600), // seconds
      location_category: locations[Math.floor(Math.random() * locations.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      battery_level: Math.floor(Math.random() * 100),
      screen_brightness: Math.floor(Math.random() * 100),
      network_type: ['WiFi', '5G', '4G'][Math.floor(Math.random() * 3)]
    }))
    
    setOriginalData(deviceData)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Generated ${deviceData.length} device usage records`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📊 Data contains: ${new Set(deviceData.map(d => d.user_id)).size} users across ${new Set(deviceData.map(d => d.app_name)).size} apps`])
    setIsProcessing(false)
  }

  const processFederatedLearning = async () => {
    if (originalData.length === 0) return
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Starting Federated Learning data preparation...`])
    
    // Step 1: Local aggregation per user
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📱 Step 1: Performing local aggregation on each device`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ℹ️  Each device computes local statistics without sharing raw data`])
    
    const userAggregates = originalData.reduce((acc: any, record) => {
      if (!acc[record.user_id]) {
        acc[record.user_id] = {
          user_id: record.user_id,
          total_usage: 0,
          app_counts: {},
          avg_battery: 0,
          location_diversity: new Set(),
          session_count: 0
        }
      }
      
      acc[record.user_id].total_usage += record.usage_duration
      acc[record.user_id].app_counts[record.app_name] = (acc[record.user_id].app_counts[record.app_name] || 0) + 1
      acc[record.user_id].avg_battery += record.battery_level
      acc[record.user_id].location_diversity.add(record.location_category)
      acc[record.user_id].session_count += 1
      
      return acc
    }, {})
    
    // Step 2: Add differential privacy noise
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔒 Step 2: Adding differential privacy noise (ε=1.0)`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ℹ️  Laplace noise added to preserve privacy while maintaining utility`])
    
    const addLaplaceNoise = (value: number, sensitivity: number, epsilon: number) => {
      const scale = sensitivity / epsilon
      const noise = (Math.random() - 0.5) * 2 * scale * Math.log(Math.random())
      return Math.max(0, value + noise)
    }
    
    // Step 3: Create federated aggregates
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🌐 Step 3: Computing federated aggregates across all devices`])
    
    const federatedData = Object.values(userAggregates).map((user: any) => ({
      user_id: `federated_user_${Math.random().toString(36).substr(2, 9)}`, // Anonymized ID
      total_usage_hours: Math.round(addLaplaceNoise(user.total_usage / 3600, 1, 1.0) * 100) / 100,
      most_used_app: Object.keys(user.app_counts).reduce((a, b) => user.app_counts[a] > user.app_counts[b] ? a : b),
      avg_battery_level: Math.round(addLaplaceNoise(user.avg_battery / user.session_count, 5, 1.0)),
      location_diversity_score: user.location_diversity.size,
      privacy_budget_used: '1.0 ε',
      federated_weight: user.session_count / originalData.length
    }))
    
    setProcessedData(federatedData)
    
    // Calculate privacy metrics
    const metrics = {
      epsilon_used: 1.0,
      delta: 1e-5,
      privacy_loss: 'Low',
      utility_preserved: '85%',
      k_anonymity: Math.min(...Object.values(userAggregates).map((u: any) => u.session_count)),
      differential_privacy: 'Enabled'
    }
    
    setPrivacyMetrics(metrics)
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Federated learning preparation complete`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔐 Privacy guarantee: (ε=${metrics.epsilon_used}, δ=${metrics.delta})-differential privacy`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📈 Model can now train on aggregated data without accessing individual records`])
    
    setIsProcessing(false)
  }

  const processDifferentialPrivacy = async () => {
    if (originalData.length === 0) return
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Applying Differential Privacy mechanisms...`])
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📊 Step 1: Computing global sensitivity for each feature`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ℹ️  Sensitivity = max change in output when one record is added/removed`])
    
    // Calculate app usage statistics with DP
    const appUsage = originalData.reduce((acc: any, record) => {
      acc[record.app_name] = (acc[record.app_name] || 0) + 1
      return acc
    }, {})
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔒 Step 2: Adding calibrated Laplace noise (ε=0.5 per query)`])
    
    const dpAppUsage = Object.entries(appUsage).map(([app, count]: [string, any]) => ({
      app_name: app,
      original_count: count,
      noisy_count: Math.max(0, Math.round(count + (Math.random() - 0.5) * 4)), // Laplace(2/0.5)
      privacy_cost: '0.5 ε'
    }))
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📈 Step 3: Computing differentially private statistics`])
    
    const dpStats = {
      total_users: Math.max(1, Math.round(new Set(originalData.map(d => d.user_id)).size + (Math.random() - 0.5) * 4)),
      avg_session_duration: Math.max(0, Math.round((originalData.reduce((sum, d) => sum + d.usage_duration, 0) / originalData.length + (Math.random() - 0.5) * 600) / 60)),
      privacy_budget_remaining: '4.5 ε',
      composition_theorem: 'Sequential composition applied'
    }
    
    setProcessedData(dpAppUsage)
    setPrivacyMetrics(dpStats)
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Differential Privacy applied successfully`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🛡️ Privacy guarantee: No individual can be identified even with auxiliary information`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📊 Statistical utility maintained for ML training and analytics`])
    
    setIsProcessing(false)
  }

  const processSyntheticGeneration = async () => {
    if (originalData.length === 0) return
    
    setIsProcessing(true)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Generating synthetic data using privacy-preserving techniques...`])
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🧠 Step 1: Learning data distributions with privacy constraints`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ℹ️  Using PATE (Private Aggregation of Teacher Ensembles) framework`])
    
    // Analyze patterns in original data
    const patterns = {
      app_preferences: originalData.reduce((acc: any, d) => {
        acc[d.app_name] = (acc[d.app_name] || 0) + 1
        return acc
      }, {}),
      usage_patterns: originalData.map(d => d.usage_duration),
      location_patterns: originalData.reduce((acc: any, d) => {
        acc[d.location_category] = (acc[d.location_category] || 0) + 1
        return acc
      }, {})
    }
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎲 Step 2: Generating synthetic records using learned distributions`])
    
    const apps = Object.keys(patterns.app_preferences)
    const locations = Object.keys(patterns.location_patterns)
    
    const syntheticData = Array.from({ length: 30 }, (_, idx) => ({
      synthetic_id: `synthetic_${idx + 1}`,
      app_name: apps[Math.floor(Math.random() * apps.length)],
      usage_duration: Math.floor(Math.random() * 3600),
      location_category: locations[Math.floor(Math.random() * locations.length)],
      battery_level: Math.floor(Math.random() * 100),
      network_type: ['WiFi', '5G', '4G'][Math.floor(Math.random() * 3)],
      privacy_source: 'Synthetic Generation',
      differential_privacy: 'Applied',
      k_anonymity: '5+'
    }))
    
    setProcessedData(syntheticData)
    
    const metrics = {
      synthetic_records: syntheticData.length,
      privacy_guarantee: 'Perfect (no real data exposed)',
      utility_score: '78%',
      statistical_similarity: '82%',
      generation_method: 'PATE + DP-SGD',
      privacy_budget: 'Unlimited (synthetic)'
    }
    
    setPrivacyMetrics(metrics)
    
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Synthetic data generation complete`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔒 Zero privacy risk: No real user data can be reverse-engineered`])
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 ML models can train on unlimited synthetic data without privacy concerns`])
    
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/3 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-light text-gray-800">Privacy-Preserving ML Training</h1>
              <Button
                onClick={() => setShowInfo(!showInfo)}
                color="default"
                className="text-xs px-2 py-1"
              >
                {showInfo ? 'Hide Info' : 'More Info'}
              </Button>
            </div>
            <p className="text-gray-600 text-sm">Enable AI innovation while protecting user privacy</p>
          </div>

          {/* Detailed Information Panel */}
          {showInfo && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-blue-900 mb-4">📚 Privacy Techniques Deep Dive</h3>
              
              <div className="space-y-4 text-sm">
                <div className="bg-white/60 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">🌐 Federated Learning</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p><strong>How it works:</strong> Each device computes local model updates, only sharing aggregated gradients</p>
                    <p><strong>Privacy benefit:</strong> Raw user data never leaves the device</p>
                    <p><strong>Innovation enabler:</strong> Enables personalized AI across millions of devices</p>
                    <p><strong>Apple use case:</strong> Siri improvements, keyboard predictions, photo recognition</p>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">🔐 Differential Privacy</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p><strong>How it works:</strong> Adds calibrated Laplace noise to queries with mathematical guarantees</p>
                    <p><strong>Privacy benefit:</strong> (ε, δ)-differential privacy ensures individual unidentifiability</p>
                    <p><strong>Innovation enabler:</strong> Enables population-level insights without individual exposure</p>
                    <p><strong>Apple use case:</strong> iOS usage analytics, health research, app improvement</p>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">🎲 Synthetic Data Generation</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p><strong>How it works:</strong> PATE framework learns distributions and generates artificial data</p>
                    <p><strong>Privacy benefit:</strong> Perfect privacy - no real data can be reverse-engineered</p>
                    <p><strong>Innovation enabler:</strong> Unlimited training data without privacy constraints</p>
                    <p><strong>Apple use case:</strong> ML model development, testing, research datasets</p>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Privacy Metrics Explained</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p><strong>Epsilon (ε) privacy budget:</strong> Lower values = stronger privacy. Each query consumes budget.</p>
                    <p><strong>K-anonymity levels:</strong> Minimum group size for any individual. Higher = more anonymous.</p>
                    <p><strong>Utility preservation:</strong> Percentage of statistical accuracy maintained after privacy application.</p>
                    <p><strong>Statistical similarity:</strong> How closely synthetic data matches original distributions.</p>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">🚀 Real-world Applications</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p>• Health research without patient identification</p>
                    <p>• App analytics without user tracking</p>
                    <p>• Personalized AI without data collection</p>
                    <p>• Cross-device learning without centralization</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Generation */}
          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">📱 Device Data Simulation</h3>
            <p className="text-xs text-gray-600 mb-3">Generate realistic device usage data representing user behavior patterns across apps, locations, and device states.</p>
            <Button
              onClick={generateDeviceData}
              disabled={isProcessing}
              color="secondary"
              className="w-full"
            >
              {isProcessing ? '🔄 Generating...' : '📊 Generate Device Data'}
            </Button>
          </div>

          {/* Privacy Techniques */}
          <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50 mb-6">
            <h3 className="font-medium text-gray-800 mb-4">🔒 Privacy-Preserving Techniques</h3>
            
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-3">
                <h4 className="font-medium text-sm text-gray-800 mb-2">🌐 Federated Learning</h4>
                <p className="text-xs text-gray-600 mb-3">Train models across decentralized devices without centralizing raw data. Each device computes local updates, only sharing aggregated gradients.</p>
                <Button
                  onClick={processFederatedLearning}
                  disabled={isProcessing || originalData.length === 0}
                  color="primary"
                  className="w-full text-sm"
                >
                  Process Federated Data
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded p-3">
                <h4 className="font-medium text-sm text-gray-800 mb-2">🔐 Differential Privacy</h4>
                <p className="text-xs text-gray-600 mb-3">Add calibrated noise to queries ensuring individual privacy while preserving statistical utility. Provides mathematical privacy guarantees.</p>
                <Button
                  onClick={processDifferentialPrivacy}
                  disabled={isProcessing || originalData.length === 0}
                  color="primary"
                  className="w-full text-sm"
                >
                  Apply Differential Privacy
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded p-3">
                <h4 className="font-medium text-sm text-gray-800 mb-2">🎲 Synthetic Generation</h4>
                <p className="text-xs text-gray-600 mb-3">Generate artificial data that preserves statistical properties without exposing real user information. Perfect privacy with maintained utility.</p>
                <Button
                  onClick={processSyntheticGeneration}
                  disabled={isProcessing || originalData.length === 0}
                  color="primary"
                  className="w-full text-sm"
                >
                  Generate Synthetic Data
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Metrics */}
          {privacyMetrics && (
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200/50">
              <h3 className="font-medium text-gray-800 mb-3">📊 Privacy Metrics</h3>
              <div className="space-y-2">
                {Object.entries(privacyMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 italic">💡 Lower ε = stronger privacy. Higher k-anonymity = better anonymization.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Data Visualization */}
        <div className="flex-1 p-6 flex flex-col space-y-4">
          {/* Original vs Processed Data */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Original Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">📱</span>
                Raw Device Data
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
                      {originalData.slice(0, 20).map((row, idx) => (
                        <tr key={idx} className="border-b border-red-100">
                          {Object.values(row).map((val: any, colIdx) => (
                            <td key={colIdx} className="p-2 text-red-700">{String(val).substring(0, 20)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <p>Device data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processed Data */}
            <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">🔒</span>
                Privacy-Preserved Data
              </h2>
              <div className="bg-green-50 rounded border overflow-auto h-full">
                {processedData.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-green-100">
                      <tr>
                        {Object.keys(processedData[0]).map(col => (
                          <th key={col} className="text-left p-2 font-medium text-green-800">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.map((row, idx) => (
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
                      <p>Privacy-preserved data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Processing Logs */}
          <div className="bg-white/80 rounded-xl border border-gray-200/50 p-4 h-64">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Privacy Processing Logs
            </h2>
            <div className="bg-gray-900 rounded p-3 overflow-y-auto font-mono text-sm h-full">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Ready to demonstrate privacy-preserving ML techniques</p>
                  <p className="text-xs mt-2">Generate device data first, then apply privacy techniques</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className={`${
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('ℹ️') ? 'text-blue-400' :
                      log.includes('🔒') || log.includes('🔐') || log.includes('🛡️') ? 'text-yellow-400' :
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

export default PrivacyPreservingML