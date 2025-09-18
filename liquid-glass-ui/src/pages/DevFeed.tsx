import React, { useState, useEffect } from 'react'
import { Block } from '../components/ui/Block'

// MCP Server API base URL
const MCP_SERVER_URL = 'http://localhost:5001'

interface DevUpdate {
    id: number
    timestamp: string
    feature: string
    description: string
    code_highlights: string[]
    files_created: string[]
    files_modified: string[]
    status: 'completed' | 'in_progress' | 'failed'
    kiro_notes: string
    next_steps: string[]
}

const DevFeed: React.FC = () => {
    const [devUpdates, setDevUpdates] = useState<DevUpdate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastFetch, setLastFetch] = useState(new Date().toLocaleTimeString())

    const fetchDevUpdates = async () => {
        try {
            const response = await fetch(`${MCP_SERVER_URL}/dev/updates?limit=20`)
            const data = await response.json()
            setDevUpdates(data.updates || [])
            setLastFetch(new Date().toLocaleTimeString())
        } catch (error) {
            console.error('Failed to fetch dev updates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearAllUpdates = async () => {
        try {
            const response = await fetch(`${MCP_SERVER_URL}/dev/updates`, {
                method: 'DELETE'
            })
            if (response.ok) {
                setDevUpdates([])
            }
        } catch (error) {
            console.error('Failed to clear updates:', error)
        }
    }

    // Real-time updates
    useEffect(() => {
        fetchDevUpdates()

        const interval = setInterval(() => {
            fetchDevUpdates()
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto py-16 px-8">
                <Block title="🚀 Kiro Development Feed - Live Updates">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">👨‍💻</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-green-800">Real-time Development Feed</h2>
                                        <p className="text-green-600">Live updates from Kiro as features are built via MCP</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">{devUpdates.length}</div>
                                        <div className="text-sm text-gray-600">Total Updates</div>
                                    </div>
                                    <button
                                        onClick={clearAllUpdates}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Live updates every 5 seconds</span>
                                </div>
                                <div>Last updated: {lastFetch}</div>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="font-semibold text-blue-800 mb-4">🔄 How the Live Feed Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3">
                                        <div className="text-3xl mb-2">💬</div>
                                        <div className="font-semibold text-blue-700">1. You Request</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Ask me to build a feature
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-green-200 mb-3">
                                        <div className="text-3xl mb-2">🔧</div>
                                        <div className="font-semibold text-green-700">2. I Build</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Create code and components
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-purple-200 mb-3">
                                        <div className="text-3xl mb-2">📡</div>
                                        <div className="font-semibold text-purple-700">3. I Post via MCP</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Send update to MCP server
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white p-4 rounded-lg border border-orange-200 mb-3">
                                        <div className="text-3xl mb-2">📊</div>
                                        <div className="font-semibold text-orange-700">4. You See Live</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Updates appear here instantly
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Development Updates List */}
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="text-4xl mb-4">⏳</div>
                                    <div className="text-lg font-medium text-gray-700">Loading development updates...</div>
                                </div>
                            ) : devUpdates.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="text-4xl mb-4">🎯</div>
                                    <div className="text-lg font-medium text-gray-700 mb-2">Ready for Development Updates!</div>
                                    <div className="text-sm text-gray-500 mb-4">
                                        Ask me to build a feature and watch live updates appear here via MCP!
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Example: "Build a user authentication component" or "Create a data visualization dashboard"
                                    </div>
                                </div>
                            ) : (
                                devUpdates.map((update) => (
                                    <div key={update.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        {/* Update Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-2xl">
                                                        {update.status === 'completed' ? '✅' : 
                                                         update.status === 'in_progress' ? '🔄' : '❌'}
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-800">{update.feature}</h4>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        update.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        update.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {update.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-3">{update.description}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(update.timestamp).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Code Highlights */}
                                        {update.code_highlights.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-gray-700 mb-2">💡 Code Highlights:</h5>
                                                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                                                    {update.code_highlights.map((highlight, index) => (
                                                        <div key={index} className="mb-1">{highlight}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Files Created/Modified */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {update.files_created.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-green-700 mb-2">📄 Files Created:</h5>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {update.files_created.map((file, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <span className="text-green-500">+</span>
                                                                <code className="bg-gray-100 px-2 py-1 rounded">{file}</code>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {update.files_modified.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-blue-700 mb-2">✏️ Files Modified:</h5>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {update.files_modified.map((file, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <span className="text-blue-500">~</span>
                                                                <code className="bg-gray-100 px-2 py-1 rounded">{file}</code>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Kiro Notes */}
                                        {update.kiro_notes && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-purple-700 mb-2">🤖 Kiro Notes:</h5>
                                                <div className="bg-purple-50 border border-purple-200 p-3 rounded text-sm text-gray-700">
                                                    {update.kiro_notes}
                                                </div>
                                            </div>
                                        )}

                                        {/* Next Steps */}
                                        {update.next_steps.length > 0 && (
                                            <div>
                                                <h5 className="font-medium text-orange-700 mb-2">🎯 Next Steps:</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {update.next_steps.map((step, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-orange-500 mt-1">→</span>
                                                            <span>{step}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Block>
            </div>
        </main>
    )
}

export default DevFeed