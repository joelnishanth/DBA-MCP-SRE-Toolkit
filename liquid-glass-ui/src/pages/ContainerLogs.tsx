import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'

const ContainerLogs: React.FC = () => {
  const [containers, setContainers] = useState<string[]>([])
  const [selectedContainer, setSelectedContainer] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadContainers = async () => {
      const names = await apiService.getContainerNames()
      setContainers(names)
    }
    loadContainers()
  }, [])

  const [autoRefresh, setAutoRefresh] = useState(false)
  const [maxLines, setMaxLines] = useState(100)

  const fetchLogs = async () => {
    if (!selectedContainer) return
    
    setLoading(true)
    try {
      const logData = await apiService.getContainerLogs(selectedContainer, maxLines)
      setLogs(logData)
    } catch (error) {
      setLogs(['Error fetching logs'])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedContainer) {
      fetchLogs()
    }
  }, [selectedContainer, maxLines])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh && selectedContainer) {
      interval = setInterval(fetchLogs, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, selectedContainer, maxLines])

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-16 px-8">
        <Block title="Container Logs">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select 
                value={selectedContainer} 
                onChange={(e) => setSelectedContainer(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 min-w-48"
              >
                <option value="">Select a container...</option>
                {containers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              
              <select 
                value={maxLines}
                onChange={(e) => setMaxLines(Number(e.target.value))}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800"
              >
                <option value={50}>50 lines</option>
                <option value={100}>100 lines</option>
                <option value={200}>200 lines</option>
                <option value={500}>500 lines</option>
              </select>
              
              <label className="flex items-center gap-2 text-gray-700">
                <input 
                  type="checkbox" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (3s)
              </label>
              
              <Button 
                onClick={fetchLogs} 
                disabled={!selectedContainer || loading}
                color="primary"
              >
                {loading ? 'Loading...' : '🔄 Refresh Logs'}
              </Button>
            </div>
          </div>
        </Block>

        {selectedContainer && (
          <Block title={`Logs for ${selectedContainer}`}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
                    {autoRefresh ? '🟢 Live' : '🔴 Static'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {logs.length} lines
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap border border-gray-200 text-gray-800">
                {logs.length > 0 ? logs.join('\n') : 'No logs available'}
              </div>
            </div>
          </Block>
        )}
      </div>
    </main>
  )
}

export default ContainerLogs