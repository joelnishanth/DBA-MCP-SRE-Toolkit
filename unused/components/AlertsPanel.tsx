import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'

interface Alert {
    id: string
    timestamp: string
    severity: 'info' | 'warning' | 'critical'
    container: string
    metric: string
    value: number
    threshold: number
    message: string
    acknowledged: boolean
}

interface AlertsPanelProps {
    containers: Array<{
        name: string
        cpu: number
        memory: number
        status: string
    }>
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ containers }) => {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [thresholds, setThresholds] = useState({
        cpu: 80,
        memory: 75,
        criticalCpu: 95,
        criticalMemory: 90
    })

    useEffect(() => {
        // Generate alerts based on container metrics
        const newAlerts: Alert[] = []
        
        containers.forEach(container => {
            const timestamp = new Date().toISOString()
            
            // CPU alerts
            if (container.cpu > thresholds.criticalCpu) {
                newAlerts.push({
                    id: `${container.name}-cpu-critical-${Date.now()}`,
                    timestamp,
                    severity: 'critical',
                    container: container.name,
                    metric: 'CPU',
                    value: container.cpu,
                    threshold: thresholds.criticalCpu,
                    message: `Critical CPU usage: ${container.cpu.toFixed(1)}% (threshold: ${thresholds.criticalCpu}%)`,
                    acknowledged: false
                })
            } else if (container.cpu > thresholds.cpu) {
                newAlerts.push({
                    id: `${container.name}-cpu-warning-${Date.now()}`,
                    timestamp,
                    severity: 'warning',
                    container: container.name,
                    metric: 'CPU',
                    value: container.cpu,
                    threshold: thresholds.cpu,
                    message: `High CPU usage: ${container.cpu.toFixed(1)}% (threshold: ${thresholds.cpu}%)`,
                    acknowledged: false
                })
            }

            // Memory alerts
            if (container.memory > thresholds.criticalMemory) {
                newAlerts.push({
                    id: `${container.name}-memory-critical-${Date.now()}`,
                    timestamp,
                    severity: 'critical',
                    container: container.name,
                    metric: 'Memory',
                    value: container.memory,
                    threshold: thresholds.criticalMemory,
                    message: `Critical memory usage: ${container.memory.toFixed(1)}% (threshold: ${thresholds.criticalMemory}%)`,
                    acknowledged: false
                })
            } else if (container.memory > thresholds.memory) {
                newAlerts.push({
                    id: `${container.name}-memory-warning-${Date.now()}`,
                    timestamp,
                    severity: 'warning',
                    container: container.name,
                    metric: 'Memory',
                    value: container.memory,
                    threshold: thresholds.memory,
                    message: `High memory usage: ${container.memory.toFixed(1)}% (threshold: ${thresholds.memory}%)`,
                    acknowledged: false
                })
            }

            // Status alerts
            if (container.status !== 'running') {
                newAlerts.push({
                    id: `${container.name}-status-${Date.now()}`,
                    timestamp,
                    severity: 'critical',
                    container: container.name,
                    metric: 'Status',
                    value: 0,
                    threshold: 0,
                    message: `Container not running: ${container.status}`,
                    acknowledged: false
                })
            }
        })

        // Only add new unique alerts
        setAlerts(prev => {
            const existingIds = new Set(prev.map(a => a.id))
            const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.has(alert.id))
            return [...prev, ...uniqueNewAlerts].slice(0, 50) // Keep last 50 alerts
        })
    }, [containers, thresholds])

    const acknowledgeAlert = (alertId: string) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
    }

    const clearAcknowledged = () => {
        setAlerts(prev => prev.filter(alert => !alert.acknowledged))
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-300 text-red-800'
            case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
            case 'info': return 'bg-blue-100 border-blue-300 text-blue-800'
            default: return 'bg-gray-100 border-gray-300 text-gray-800'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🚨'
            case 'warning': return '⚠️'
            case 'info': return 'ℹ️'
            default: return '📋'
        }
    }

    const activeAlerts = alerts.filter(alert => !alert.acknowledged)
    const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)

    return (
        <div className="space-y-6">
            {/* Threshold Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Alert Thresholds</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">CPU Warning (%)</label>
                        <input
                            type="number"
                            value={thresholds.cpu}
                            onChange={(e) => setThresholds(prev => ({ ...prev, cpu: Number(e.target.value) }))}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">CPU Critical (%)</label>
                        <input
                            type="number"
                            value={thresholds.criticalCpu}
                            onChange={(e) => setThresholds(prev => ({ ...prev, criticalCpu: Number(e.target.value) }))}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Memory Warning (%)</label>
                        <input
                            type="number"
                            value={thresholds.memory}
                            onChange={(e) => setThresholds(prev => ({ ...prev, memory: Number(e.target.value) }))}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Memory Critical (%)</label>
                        <input
                            type="number"
                            value={thresholds.criticalMemory}
                            onChange={(e) => setThresholds(prev => ({ ...prev, criticalMemory: Number(e.target.value) }))}
                            className="w-full p-2 border rounded text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Active Alerts */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">
                        Active Alerts ({activeAlerts.length})
                    </h3>
                    {acknowledgedAlerts.length > 0 && (
                        <Button onClick={clearAcknowledged} size="sm" color="tertiary">
                            Clear Acknowledged ({acknowledgedAlerts.length})
                        </Button>
                    )}
                </div>

                {activeAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        🎉 No active alerts - all systems healthy!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.map(alert => (
                            <div key={alert.id} className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                                            <span className="font-semibold">{alert.container}</span>
                                            <span className="text-sm opacity-75">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2">{alert.message}</p>
                                        <div className="text-xs opacity-75">
                                            {alert.metric}: {alert.value.toFixed(1)}% / {alert.threshold}%
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => acknowledgeAlert(alert.id)}
                                        size="sm"
                                        color="secondary"
                                    >
                                        ✓ Ack
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Acknowledged Alerts */}
            {acknowledgedAlerts.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-4">
                        Acknowledged Alerts ({acknowledgedAlerts.length})
                    </h3>
                    <div className="space-y-2">
                        {acknowledgedAlerts.slice(0, 5).map(alert => (
                            <div key={alert.id} className="p-3 bg-gray-100 rounded border opacity-60">
                                <div className="flex items-center gap-2 text-sm">
                                    <span>{getSeverityIcon(alert.severity)}</span>
                                    <span className="font-medium">{alert.container}</span>
                                    <span className="text-gray-600">{alert.message}</span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}