import React, { useState } from 'react'
import { Button } from './ui/Button'

interface ContainerActionPanelProps {
    containerName: string
    status: 'running' | 'stopped' | 'restarting'
    cpuPercent: number
    memoryPercent: number
    onRestart: (containerName: string) => Promise<void>
    onGetLogs: (containerName: string, lines: number) => Promise<string[]>
}

export const ContainerActionPanel: React.FC<ContainerActionPanelProps> = ({
    containerName,
    status,
    cpuPercent,
    memoryPercent,
    onRestart,
    onGetLogs
}) => {
    const [isRestarting, setIsRestarting] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [showLogs, setShowLogs] = useState(false)

    const handleRestart = async () => {
        setIsRestarting(true)
        try {
            await onRestart(containerName)
        } finally {
            setIsRestarting(false)
        }
    }

    const handleGetLogs = async () => {
        const containerLogs = await onGetLogs(containerName, 50)
        setLogs(containerLogs)
        setShowLogs(true)
    }

    const getHealthStatus = () => {
        if (status !== 'running') return 'critical'
        if (cpuPercent > 80 || memoryPercent > 80) return 'warning'
        return 'healthy'
    }

    const healthColors = {
        healthy: 'bg-green-100 border-green-300 text-green-800',
        warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        critical: 'bg-red-100 border-red-300 text-red-800'
    }

    return (
        <div className={`p-4 rounded-lg border-2 ${healthColors[getHealthStatus()]}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">{containerName}</h3>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleRestart} 
                        disabled={isRestarting}
                        color="secondary"
                        size="sm"
                    >
                        {isRestarting ? '🔄 Restarting...' : '🔄 Restart'}
                    </Button>
                    <Button 
                        onClick={handleGetLogs}
                        color="tertiary"
                        size="sm"
                    >
                        📋 Logs
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="font-medium">Status:</span> {status}
                </div>
                <div>
                    <span className="font-medium">CPU:</span> {cpuPercent.toFixed(1)}%
                </div>
                <div>
                    <span className="font-medium">Memory:</span> {memoryPercent.toFixed(1)}%
                </div>
            </div>

            {showLogs && (
                <div className="mt-4 bg-black text-green-400 p-3 rounded font-mono text-xs max-h-40 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white">Recent Logs:</span>
                        <button 
                            onClick={() => setShowLogs(false)}
                            className="text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </div>
                    {logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                    ))}
                </div>
            )}
        </div>
    )
}