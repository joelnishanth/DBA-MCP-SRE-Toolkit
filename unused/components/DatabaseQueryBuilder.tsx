import React, { useState } from 'react'
import { Button } from './ui/Button'

interface QueryResult {
    database: string
    result: any
    executionTime: number
    error?: string
}

export const DatabaseQueryBuilder: React.FC = () => {
    const [postgresQuery, setPostgresQuery] = useState('')
    const [mysqlQuery, setMysqlQuery] = useState('')
    const [sqliteQuery, setSqliteQuery] = useState('')
    const [results, setResults] = useState<QueryResult[]>([])
    const [isExecuting, setIsExecuting] = useState(false)

    const commonQueries = {
        postgres: [
            'SELECT version();',
            'SELECT * FROM pg_stat_activity LIMIT 10;',
            'SELECT schemaname, tablename FROM pg_tables LIMIT 10;'
        ],
        mysql: [
            'SELECT VERSION();',
            'SHOW PROCESSLIST;',
            'SHOW TABLES;'
        ],
        sqlite: [
            'SELECT sqlite_version();',
            'SELECT name FROM sqlite_master WHERE type="table";',
            'PRAGMA table_info(main);'
        ]
    }

    const executeQueries = async () => {
        setIsExecuting(true)
        try {
            const response = await fetch('http://localhost:5000/query/multi-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postgres_query: postgresQuery || null,
                    mysql_query: mysqlQuery || null,
                    sqlite_query: sqliteQuery || null
                })
            })
            
            const data = await response.json()
            setResults(data.results || [])
        } catch (error) {
            console.error('Query execution failed:', error)
        } finally {
            setIsExecuting(false)
        }
    }

    const analyzePerformance = async () => {
        setIsExecuting(true)
        try {
            const response = await fetch('http://localhost:5000/analyze/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postgres_query: postgresQuery || null,
                    mysql_query: mysqlQuery || null,
                    sqlite_query: sqliteQuery || null
                })
            })
            
            const data = await response.json()
            setResults(data.analysis || [])
        } catch (error) {
            console.error('Performance analysis failed:', error)
        } finally {
            setIsExecuting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* PostgreSQL */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-blue-600">PostgreSQL</h3>
                        <select 
                            onChange={(e) => setPostgresQuery(e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                        >
                            <option value="">Quick queries...</option>
                            {commonQueries.postgres.map((query, i) => (
                                <option key={i} value={query}>{query.slice(0, 30)}...</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        value={postgresQuery}
                        onChange={(e) => setPostgresQuery(e.target.value)}
                        placeholder="Enter PostgreSQL query..."
                        className="w-full h-24 p-2 border rounded font-mono text-sm"
                    />
                </div>

                {/* MySQL */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-orange-600">MySQL</h3>
                        <select 
                            onChange={(e) => setMysqlQuery(e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                        >
                            <option value="">Quick queries...</option>
                            {commonQueries.mysql.map((query, i) => (
                                <option key={i} value={query}>{query.slice(0, 30)}...</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        value={mysqlQuery}
                        onChange={(e) => setMysqlQuery(e.target.value)}
                        placeholder="Enter MySQL query..."
                        className="w-full h-24 p-2 border rounded font-mono text-sm"
                    />
                </div>

                {/* SQLite */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-green-600">SQLite</h3>
                        <select 
                            onChange={(e) => setSqliteQuery(e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                        >
                            <option value="">Quick queries...</option>
                            {commonQueries.sqlite.map((query, i) => (
                                <option key={i} value={query}>{query.slice(0, 30)}...</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        value={sqliteQuery}
                        onChange={(e) => setSqliteQuery(e.target.value)}
                        placeholder="Enter SQLite query..."
                        className="w-full h-24 p-2 border rounded font-mono text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <Button 
                    onClick={executeQueries} 
                    disabled={isExecuting}
                    color="primary"
                >
                    {isExecuting ? '⏳ Executing...' : '▶️ Execute Queries'}
                </Button>
                <Button 
                    onClick={analyzePerformance} 
                    disabled={isExecuting}
                    color="secondary"
                >
                    {isExecuting ? '⏳ Analyzing...' : '📊 Analyze Performance'}
                </Button>
            </div>

            {results.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold">Query Results:</h3>
                    {results.map((result, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{result.database}</span>
                                <span className="text-sm text-gray-600">
                                    {result.executionTime}ms
                                </span>
                            </div>
                            {result.error ? (
                                <div className="text-red-600 font-mono text-sm">
                                    Error: {result.error}
                                </div>
                            ) : (
                                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                                    {JSON.stringify(result.result, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}