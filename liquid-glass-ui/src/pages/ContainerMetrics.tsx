import React, { useState, useEffect } from 'react'
import { apiService, ContainerMetric } from '../services/api'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'
import MetricsLoadingBar from '../components/MetricsLoadingBar'
import MermaidDiagram from '../components/MermaidDiagram'

const ContainerMetrics: React.FC = () => {
  const [containers, setContainers] = useState<ContainerMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const metrics = await apiService.getContainerMetrics()
      setContainers(metrics)
      setError(null)
    } catch (err) {
      setError('Failed to fetch container metrics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#4ade80'
      case 'stopped': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading && containers.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-16 px-8">
          <Block title="Container Metrics">
            <div className="space-y-6">
              <MetricsLoadingBar isLoading={true} />
              <p className="text-gray-600">Loading container metrics...</p>
            </div>
          </Block>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-16 px-8">
        <Block title="Container Metrics">
          <div className="space-y-6">
            {/* Container Monitoring Flow */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-light text-gray-900 mb-4 text-center">
                Container Monitoring Flow
              </h3>
              <MermaidDiagram chart={`
                flowchart TD
                  A[Docker Containers] --> B[Docker API]
                  B --> C[Metrics Collection]
                  C --> D[Real-time Dashboard]
                  
                  A --> E[CPU Usage]
                  A --> F[Memory Usage]
                  A --> G[Network I/O]
                  A --> H[Disk I/O]
                  
                  E --> C
                  F --> C
                  G --> C
                  H --> C
                  
                  classDef default fill:#f9f9f9,stroke:#e5e5e5,stroke-width:1px,color:#374151
              `} />
            </div>
            
            <MetricsLoadingBar isLoading={loading} />
            <div className="flex justify-between items-center">
              <Button onClick={fetchMetrics} disabled={loading} color="primary">
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </div>
        </Block>

        <Block title="Metrics Overview">
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="text-left p-4 text-gray-900 font-semibold">Container</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">CPU %</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Memory</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => (
                    <tr key={container.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-800 font-medium">{container.name}</td>
                      <td className="p-4">
                        <span style={{ color: getStatusColor(container.status) }} className="font-medium">
                          ● {container.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{container.cpuPercent.toFixed(1)}%</td>
                      <td className="p-4 text-gray-700">
                        {container.memoryUsageMB.toFixed(0)}MB / {container.memoryLimitMB.toFixed(0)}MB
                      </td>
                      <td className="p-4 text-gray-700">{container.uptime || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Block>
      </div>
    </main>
  )
}

export default ContainerMetrics