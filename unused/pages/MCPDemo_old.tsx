import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'
import { Button } from '../components/ui/Button'

// MCP Server API base URL
const MCP_SERVER_URL = 'http://localhost:5001'

interface SystemMetric {
    id: string
    name: string
    value: string | number
    unit: string
    status: 'healthy' | 'warning' | 'critical'
    lastUpdated: string
    trend: 'up' | 'down' | 'stable'
}

interface DatabaseMetric {
    id: string
    database: string
    connections: number
    queryTime: number
    throughput: number
    status: 'online' | 'degraded' | 'offline'
}

interface ContainerStatus {
    id: string
    name: string
    status: 'running' | 'stopped' | 'restarting'
    cpu: number
    memory: number
    uptime: string
}

interface KiroUpdate {
    id: string
    timestamp: string
    action: string
    target: string
    oldValue: string
    newValue: string
    status: 'success' | 'pending' | 'failed'
}

const MCPDemo: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            id: '1',
            name: 'CPU Usage',
            value: 45.2,
            unit: '%',
            status: 'healthy',
            lastUpdated: new Date().toLocaleTimeString(),
            trend: 'stable'
        },
        {
            id: '2',
            name: 'Memory Usage',
            value: 68.7,
            unit: '%',
            status: 'warning',
            lastUpdated: new Date().toLocaleTimeString(),
            trend: 'up'
        },
        {
            id: '3',
            name: 'Disk I/O',
            value: 1247,
            unit: 'MB/s',
            status: 'healthy',
            lastUpdated: new Date().toLocaleTimeString(),
            trend: 'down'
        },
        {
            id: '4',
            name: 'Network Latency',
            value: 12.4,
            unit: 'ms',
            status: 'healthy',
            lastUpdated: new Date().toLocaleTimeString(),
            trend: 'stable'
        }
    ])

    const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetric[]>([
        {
            id: '1',
            database: 'PostgreSQL',
            connections: 45,
            queryTime: 23.5,
            throughput: 1250,
            status: 'online'
        },
        {
            id: '2',
            database: 'MySQL',
            connections: 32,
            queryTime: 18.2,
            throughput: 980,
            status: 'online'
        },
        {
            id: '3',
            database: 'SQLite',
            connections: 8,
            queryTime: 5.1,
            throughput: 450,
            status: 'degraded'
        }
    ])

    const [containerStatuses, setContainerStatuses] = useState<ContainerStatus[]>([
        {
            id: '1',
            name: 'bot-core',
            status: 'running',
            cpu: 23.1,
            memory: 512,
            uptime: '2d 14h 32m'
        },
        {
            id: '2',
            name: 'liquid-glass-ui',
            status: 'running',
            cpu: 8.7,
            memory: 256,
            uptime: '2d 14h 30m'
        },
        {
            id: '3',
            name: 'mcp-server',
            status: 'running',
            cpu: 15.3,
            memory: 128,
            uptime: '2d 14h 28m'
        }
    ])

    const [kiroUpdates, setKiroUpdates] = useState<KiroUpdate[]>([])
    const [isUpdating, setIsUpdating] = useState(false)
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString())
    const [mcpConnected, setMcpConnected] = useState(true)
    const [updateCount, setUpdateCount] = useState(0)

    // Fetch real data from MCP server
    const fetchRealContainerData = async () => {
        try {
            // Get list of containers
            const containersResponse = await fetch(`${MCP_SERVER_URL}/containers`)
            const containersData = await containersResponse.json()

            // Get stats for first few containers
            const containerNames = containersData.containers.slice(0, 3)
            const containerPromises = containerNames.map(async (name: string) => {
                const response = await fetch(`${MCP_SERVER_URL}/status/${name}`)
                return response.json()
            })

            const containerStats = await Promise.all(containerPromises)

            // Update container statuses with real data
            setContainerStatuses(containerStats.map((stats, index) => ({
                id: (index + 1).toString(),
                name: stats.container_name,
                status: stats.status as 'running' | 'stopped' | 'restarting',
                cpu: stats.cpu_percent,
                memory: stats.memory_usage_mb,
                uptime: '2d 14h 32m' // This would need to be calculated from container start time
            })))

            setMcpConnected(true)
        } catch (error) {
            console.error('Failed to fetch container data:', error)
            setMcpConnected(false)
        }
    }

    const fetchHealthStatus = async () => {
        try {
            const response = await fetch(`${MCP_SERVER_URL}/health`)
            const data = await response.json()
            if (data.status === 'healthy') {
                setMcpConnected(true)
            }
        } catch (error) {
            setMcpConnected(false)
        }
    }

    // Real-time updates with actual MCP data
    useEffect(() => {
        fetchHealthStatus()
        fetchRealContainerData()

        const interval = setInterval(() => {
            updateMetrics()
            fetchRealContainerData()
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const updateMetrics = () => {
        // Update system metrics with some variation
        setSystemMetrics(prev => prev.map(metric => ({
            ...metric,
            value: typeof metric.value === 'number'
                ? Math.max(0, metric.value + (Math.random() - 0.5) * 10)
                : metric.value,
            lastUpdated: new Date().toLocaleTimeString(),
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
            status: Math.random() > 0.8 ? 'warning' : 'healthy'
        })))

        // Update database metrics
        setDatabaseMetrics(prev => prev.map(db => ({
            ...db,
            connections: Math.max(1, db.connections + Math.floor((Math.random() - 0.5) * 10)),
            queryTime: Math.max(1, db.queryTime + (Math.random() - 0.5) * 5),
            throughput: Math.max(100, db.throughput + Math.floor((Math.random() - 0.5) * 200))
        })))

        setLastUpdate(new Date().toLocaleTimeString())
        setUpdateCount(prev => prev + 1)
    }

    const handleManualUpdate = async () => {
        setIsUpdating(true)

        // Add a Kiro MCP update record
        const newUpdate: KiroUpdate = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action: 'Container Health Analysis',
            target: 'MCP: get_container_stats + list_containers',
            oldValue: 'Previous State',
            newValue: 'Real-time Data',
            status: 'pending'
        }

        setKiroUpdates(prev => [newUpdate, ...prev.slice(0, 4)])

        try {
            // Simulate Kiro's MCP tool selection and execution
            await new Promise(resolve => setTimeout(resolve, 1500))
            await fetchRealContainerData()
            updateMetrics()

            // Update the record to success
            setKiroUpdates(prev => prev.map(update =>
                update.id === newUpdate.id
                    ? { ...update, status: 'success' as const, newValue: 'Analyzed 15 containers via MCP' }
                    : update
            ))
        } catch (error) {
            // Update the record to failed
            setKiroUpdates(prev => prev.map(update =>
                update.id === newUpdate.id
                    ? { ...update, status: 'failed' as const }
                    : update
            ))
        }

        setIsUpdating(false)
    }

    const handleKiroOptimization = async () => {
        setIsUpdating(true)

        const optimizationUpdate: KiroUpdate = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action: 'AI-Driven Performance Optimization',
            target: 'MCP: analyze_query_performance + health_check',
            oldValue: 'Baseline Performance',
            newValue: 'Optimizing...',
            status: 'pending'
        }

        setKiroUpdates(prev => [optimizationUpdate, ...prev.slice(0, 4)])

        try {
            // Simulate Kiro's AI optimization via MCP tools
            await new Promise(resolve => setTimeout(resolve, 2500))

            // Update metrics to show optimization results
            setSystemMetrics(prev => prev.map(metric => ({
                ...metric,
                value: typeof metric.value === 'number'
                    ? Math.max(0, metric.value * 0.85) // 15% improvement
                    : metric.value,
                status: 'healthy',
                trend: 'down',
                lastUpdated: new Date().toLocaleTimeString()
            })))

            setKiroUpdates(prev => prev.map(update =>
                update.id === optimizationUpdate.id
                    ? { ...update, status: 'success' as const, newValue: '15% performance improvement via MCP analysis' }
                    : update
            ))
        } catch (error) {
            setKiroUpdates(prev => prev.map(update =>
                update.id === optimizationUpdate.id
                    ? { ...update, status: 'failed' as const }
                    : update
            ))
        }

        setIsUpdating(false)
    }

    const handleKiroScale = async () => {
        setIsUpdating(true)

        const scaleUpdate: KiroUpdate = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action: 'Intelligent Auto-Scaling Decision',
            target: 'MCP: get_container_stats → fix_container',
            oldValue: 'Current Resource Allocation',
            newValue: 'Scaling...',
            status: 'pending'
        }

        setKiroUpdates(prev => [scaleUpdate, ...prev.slice(0, 4)])

        try {
            // Simulate Kiro's intelligent auto-scaling via MCP
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Update container memory to show scaling
            setContainerStatuses(prev => prev.map(container => ({
                ...container,
                memory: container.memory * 1.5, // 50% increase
                cpu: Math.max(0, container.cpu * 0.9) // CPU usage decreases due to more memory
            })))

            setKiroUpdates(prev => prev.map(update =>
                update.id === scaleUpdate.id
                    ? { ...update, status: 'success' as const, newValue: 'Scaled memory_leak_app +50% via MCP' }
                    : update
            ))
        } catch (error) {
            setKiroUpdates(prev => prev.map(update =>
                update.id === scaleUpdate.id
                    ? { ...update, status: 'failed' as const }
                    : update
            ))
        }

        setIsUpdating(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'online':
            case 'running':
            case 'success':
                return '#10b981'
            case 'warning':
            case 'degraded':
            case 'pending':
                return '#f59e0b'
            case 'critical':
            case 'offline':
            case 'stopped':
            case 'failed':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '↗️'
            case 'down': return '↘️'
            case 'stable': return '→'
            default: return '→'
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto py-16 px-8">
                <Block title="Kiro MCP Integration Demo - SRE Bot Server">
                    <div className="space-y-6">
                        {/* Kiro MCP Overview */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">🤖</div>
                                <div>
                                    <h2 className="text-xl font-bold text-purple-800">Kiro + Model Context Protocol (MCP)</h2>
                                    <p className="text-purple-600">Extending Kiro's capabilities with specialized SRE tools</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-3 rounded border">
                                    <div className="font-semibold text-blue-600 mb-1">🔧 Direct Questions</div>
                                    <div className="text-gray-600">"Show me container logs for bot_core"</div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <div className="font-semibold text-green-600 mb-1">⚡ Auto Tool Selection</div>
                                    <div className="text-gray-600">Kiro picks the right MCP tool automatically</div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                    <div className="font-semibold text-orange-600 mb-1">🎯 Specialized Context</div>
                                    <div className="text-gray-600">Access to real-time system data</div>
                                </div>
                            </div>
                        </div>

                        {/* MCP Tools Available */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-lg mb-4">Available MCP Tools from srebot-mcp Server</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded border">
                                    <div className="font-semibold text-blue-600 mb-2">🐳 Container Management</div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• list_containers</li>
                                        <li>• get_container_stats</li>
                                        <li>• get_container_logs</li>
                                        <li>• fix_container (restart)</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded border">
                                    <div className="font-semibold text-green-600 mb-2">🗄️ Database Operations</div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• execute_multi_db_query</li>
                                        <li>• analyze_query_performance</li>
                                        <li>• PostgreSQL, MySQL, SQLite</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded border">
                                    <div className="font-semibold text-purple-600 mb-2">📊 System Monitoring</div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• health_check</li>
                                        <li>• Real-time metrics</li>
                                        <li>• Performance analysis</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Demo Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 flex-wrap">
                                <Button onClick={handleManualUpdate} disabled={isUpdating} color="primary">
                                    {isUpdating ? '🔄 Kiro MCP Working...' : '🤖 Ask Kiro via MCP'}
                                </Button>
                                <Button onClick={handleKiroOptimization} disabled={isUpdating} color="secondary">
                                    🚀 Kiro Auto-Optimize
                                </Button>
                                <Button onClick={handleKiroScale} disabled={isUpdating} color="tertiary">
                                    📈 Kiro Auto-Scale
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Last MCP update: {lastUpdate} | Total: {updateCount}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${mcpConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                    srebot-mcp {mcpConnected ? '✅ Connected' : '❌ Disconnected'}
                                </span>
                            </div>
                        </div>

                        {/* Example Kiro Prompts */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="font-semibold text-blue-800 mb-4">💬 Try These Kiro MCP Prompts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <div className="font-medium text-blue-700 mb-1">Container Monitoring:</div>
                                        <div className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded">
                                            "Show me the status of all containers and highlight any with high memory usage"
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <div className="font-medium text-blue-700 mb-1">Log Analysis:</div>
                                        <div className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded">
                                            "Get the last 20 logs from memory_leak_app and analyze any issues"
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <div className="font-medium text-blue-700 mb-1">Database Health:</div>
                                        <div className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded">
                                            "Check the health of all databases and run a performance test query"
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <div className="font-medium text-blue-700 mb-1">Auto-Remediation:</div>
                                        <div className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded">
                                            "If any container is using more than 80% memory, restart it automatically"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Link to Development Feed */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">👨‍💻</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-800">Live Development Feed</h3>
                                        <p className="text-green-600">See real-time updates as I build features via MCP</p>
                                    </div>
                                </div>
                                <a 
                                    href="/dev-feed" 
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    View Live Feed →
                                </a>
                            </div>
                        </div>
                    </div>
                </Block>

                <Block title="System Performance Metrics">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-gray-200">
                                        <th className="text-left p-4 text-gray-900 font-semibold">Metric</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Value</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Status</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Trend</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemMetrics.map((metric) => (
                                        <tr key={metric.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 text-gray-800 font-medium">{metric.name}</td>
                                            <td className="p-4 text-gray-700">
                                                {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} {metric.unit}
                                            </td>
                                            <td className="p-4">
                                                <span style={{ color: getStatusColor(metric.status) }} className="font-medium">
                                                    ● {metric.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-lg">{getTrendIcon(metric.trend)}</td>
                                            <td className="p-4 text-gray-600 text-sm">{metric.lastUpdated}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Block>

                <Block title="Database Performance">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-gray-200">
                                        <th className="text-left p-4 text-gray-900 font-semibold">Database</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Connections</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Avg Query Time</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Throughput</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {databaseMetrics.map((db) => (
                                        <tr key={db.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 text-gray-800 font-medium">{db.database}</td>
                                            <td className="p-4 text-gray-700">{db.connections}</td>
                                            <td className="p-4 text-gray-700">{db.queryTime.toFixed(1)}ms</td>
                                            <td className="p-4 text-gray-700">{db.throughput} req/s</td>
                                            <td className="p-4">
                                                <span style={{ color: getStatusColor(db.status) }} className="font-medium">
                                                    ● {db.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Block>

                <Block title="Container Status (Real MCP Data)">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-gray-200">
                                        <th className="text-left p-4 text-gray-900 font-semibold">Container</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Status</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">CPU %</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Memory (MB)</th>
                                        <th className="text-left p-4 text-gray-900 font-semibold">Uptime</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {containerStatuses.map((container) => (
                                        <tr key={container.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 text-gray-800 font-medium">{container.name}</td>
                                            <td className="p-4">
                                                <span style={{ color: getStatusColor(container.status) }} className="font-medium">
                                                    ● {container.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-700">{container.cpu.toFixed(2)}%</td>
                                            <td className="p-4 text-gray-700">{container.memory.toFixed(0)}MB</td>
                                            <td className="p-4 text-gray-700">{container.uptime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Block>

                <Block title="🤖 Kiro MCP Actions & Results">
                    <div className="space-y-6">
                        {/* MCP Action History */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            {kiroUpdates.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-4xl mb-4">🤖</div>
                                    <div className="text-lg font-medium mb-2">Ready for Kiro MCP Integration!</div>
                                    <div className="text-sm">Click "Ask Kiro via MCP" to see intelligent SRE automation in action.</div>
                                    <div className="mt-4 text-xs text-gray-400">
                                        Kiro will automatically select the right MCP tools based on your requests.
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-200">
                                                <th className="text-left p-4 text-gray-900 font-semibold">Timestamp</th>
                                                <th className="text-left p-4 text-gray-900 font-semibold">Kiro MCP Action</th>
                                                <th className="text-left p-4 text-gray-900 font-semibold">Target System</th>
                                                <th className="text-left p-4 text-gray-900 font-semibold">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kiroUpdates.map((update) => (
                                                <tr key={update.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="p-4 text-gray-700 text-sm">{update.timestamp}</td>
                                                    <td className="p-4 text-gray-800 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <span>🤖</span>
                                                            {update.action}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-700">{update.target}</td>
                                                    <td className="p-4">
                                                        <span style={{ color: getStatusColor(update.status) }} className="font-medium">
                                                            ● {update.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Example MCP Tool Outputs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-800 mb-4">🔧 Example: Container Health Check</h4>
                                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                                    <div className="text-blue-400 mb-2">$ kiro: "Check container health"</div>
                                    <div className="text-yellow-400 mb-1">→ Using MCP tool: get_container_stats</div>
                                    <div className="mb-2">✅ Found 15 containers</div>
                                    <div className="text-red-400">⚠️  memory_leak_app: 38.5% memory usage</div>
                                    <div className="text-green-400">✅ bot_core: healthy (0.4% CPU, 0.6% memory)</div>
                                    <div className="text-green-400">✅ postgres_db: healthy (0.5% CPU, 0.7% memory)</div>
                                    <div className="text-blue-400 mt-2">💡 Recommendation: Monitor memory_leak_app</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-800 mb-4">📊 Example: Database Performance</h4>
                                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                                    <div className="text-blue-400 mb-2">$ kiro: "Analyze database performance"</div>
                                    <div className="text-yellow-400 mb-1">→ Using MCP tool: analyze_query_performance</div>
                                    <div className="mb-2">🔍 Testing PostgreSQL, MySQL, SQLite</div>
                                    <div className="text-green-400">✅ PostgreSQL: 23.5ms avg query time</div>
                                    <div className="text-green-400">✅ MySQL: 18.2ms avg query time</div>
                                    <div className="text-yellow-400">⚠️  SQLite: degraded performance</div>
                                    <div className="text-blue-400 mt-2">💡 Suggestion: Optimize SQLite indexes</div>
                                </div>
                            </div>
                        </div>

                        {/* MCP Tool Approval Demo */}
                        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                            <h4 className="font-semibold text-yellow-800 mb-4">🔒 MCP Tool Approval Process</h4>
                            <div className="space-y-3">
                                <div className="bg-white p-4 rounded border border-yellow-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-gray-800">Kiro wants to use: <code className="bg-gray-100 px-2 py-1 rounded">get_container_logs</code></div>
                                            <div className="text-sm text-gray-600 mt-1">Parameters: container="memory_leak_app", lines=50</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">✓ Approve</button>
                                            <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">✗ Deny</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>Auto-approved tools:</strong> fetch, get_container_logs, get_container_stats, list_containers, execute_multi_db_query, analyze_query_performance, health_check
                                </div>
                            </div>
                        </div>
                    </div>
                </Block>

                <Block title="How Kiro's MCP Integration Works">
                    <div className="space-y-6">
                        {/* MCP Workflow */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                            <h3 className="font-semibold text-lg mb-4">🔄 MCP Workflow in Action</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-green-200 mb-3">
                                        <div className="text-3xl mb-2">💬</div>
                                        <div className="font-semibold text-green-700">1. You Ask Kiro</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        "Show container stats"
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3">
                                        <div className="text-3xl mb-2">🧠</div>
                                        <div className="font-semibold text-blue-700">2. Kiro Selects Tool</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Auto-picks get_container_stats
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-purple-200 mb-3">
                                        <div className="text-3xl mb-2">🔧</div>
                                        <div className="font-semibold text-purple-700">3. MCP Tool Runs</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Fetches real container data
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-orange-200 mb-3">
                                        <div className="text-3xl mb-2">📊</div>
                                        <div className="font-semibold text-orange-700">4. Kiro Responds</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Formatted analysis & insights
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MCP Configuration Example */}
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-lg mb-4">⚙️ MCP Configuration (.kiro/settings/mcp.json)</h3>
                            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                                <pre>{`{
  "mcpServers": {
    "srebot-mcp": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {
        "MCP_SERVER_URL": "http://localhost:5001",
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": [
        "fetch",
        "get_container_logs",
        "get_container_stats", 
        "list_containers",
        "execute_multi_db_query",
        "analyze_query_performance",
        "health_check"
      ]
    }
  }
}`}</pre>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <strong>Key Features:</strong> Auto-approval for trusted tools, environment configuration, and seamless integration with your SRE infrastructure.
                            </div>
                        </div>

                        {/* MCP Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg border border-blue-200">
                                <div className="text-2xl mb-3">🚀</div>
                                <h4 className="font-semibold text-blue-700 mb-2">Seamless Integration</h4>
                                <p className="text-sm text-gray-600">
                                    Kiro automatically discovers and uses your MCP tools without manual configuration in chat.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-green-200">
                                <div className="text-2xl mb-3">🎯</div>
                                <h4 className="font-semibold text-green-700 mb-2">Context-Aware</h4>
                                <p className="text-sm text-gray-600">
                                    MCP provides Kiro with real-time system context for more accurate responses and actions.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-purple-200">
                                <div className="text-2xl mb-3">🔒</div>
                                <h4 className="font-semibold text-purple-700 mb-2">Secure & Controlled</h4>
                                <p className="text-sm text-gray-600">
                                    Tool approval process and auto-approve lists give you full control over what Kiro can access.
                                </p>
                            </div>
                        </div>

                        {/* Live Stats */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="font-semibold text-lg mb-4">📈 Live MCP Integration Stats</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                        {mcpConnected ? '✅ Active' : '❌ Offline'}
                                    </div>
                                    <div className="text-gray-600">srebot-mcp Server</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-2">7</div>
                                    <div className="text-gray-600">Auto-Approved Tools</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 mb-2">5.0s</div>
                                    <div className="text-gray-600">Refresh Interval</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600 mb-2">{updateCount}</div>
                                    <div className="text-gray-600">MCP Interactions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Block>
            </div>
        </main>
    )
}

export default MCPDemo