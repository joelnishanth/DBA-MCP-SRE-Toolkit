import React, { useState, useEffect } from 'react';
import LiquidGlassCard from '../components/LiquidGlassCard';
import MermaidDiagram from '../components/MermaidDiagram';
import AIAssistant from '../components/AIAssistant';

interface DatabaseSummary {
  application: string;
  database_type: string;
  database_count: number;
  ec2_instance_count: number;
  rds_instance_count: number;
  total_instance_count: number;
  total_size_gb: number;
  total_active_connections: number;
}

interface TopApplication {
  application: string;
  total_databases: number;
  database_types: Record<string, number>;
  ec2_instance_count: number;
  rds_instance_count: number;
  total_instance_count: number;
  team_count: number;
  teams: string[];
}

const DatabaseInventory: React.FC = () => {
  const [summary, setSummary] = useState<DatabaseSummary[]>([]);
  const [topApps, setTopApps] = useState<TopApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const demoQueries = [
    { label: '🏆 Top 5 Applications', query: 'Show me the top 5 applications by database count' },
    { label: '🗄️ PostgreSQL for UserAuth', query: 'How many PostgreSQL databases does UserAuth have?' },
    { label: '💰 OrderManagement Cost', query: 'What is the monthly cost for OrderManagement?' },
    { label: '👥 Platform Team Resources', query: 'Show me all resources for team Platform' },
    { label: '📊 Database Overview', query: 'Give me an overview of our infrastructure' },
    { label: '🔍 MySQL Database Count', query: 'How many MySQL databases do we have across all applications?' },
    { label: '⚡ Resource Usage Analytics', query: 'Show me resource usage for PaymentProcessor' },
    { label: '🏢 Team Analytics Summary', query: 'What does team Analytics manage?' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, topAppsRes] = await Promise.all([
        fetch('http://localhost:5002/api/v1/analytics/database-summary'),
        fetch('http://localhost:5002/api/v1/analytics/top-applications?limit=10')
      ]);

      const summaryData = await summaryRes.json();
      const topAppsData = await topAppsRes.json();

      setSummary(summaryData.summary);
      setTopApps(topAppsData.top_applications);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) return;
    
    setChatLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: chatQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChatResponse(data.response || 'No response received');
    } catch (error) {
      console.error('Chat error:', error);
      setChatResponse(`Error processing query: ${error.message}. Please try again.`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDemoQuery = (query: string) => {
    setChatQuery(query);
    setChatResponse(''); // Clear previous response
  };

  const generateTopAppsDiagram = () => {
    const top5 = topApps.slice(0, 5);
    let diagram = 'graph TD\n';
    
    top5.forEach((app, index) => {
      const nodeId = `A${index}`;
      diagram += `    ${nodeId}["${app.application}<br/>${app.total_databases} DBs<br/>${app.total_instance_count} Instances"]\n`;
      
      // Add database type nodes
      Object.entries(app.database_types).forEach(([dbType, count], dbIndex) => {
        const dbNodeId = `${nodeId}_DB${dbIndex}`;
        diagram += `    ${dbNodeId}["${dbType}<br/>${count} databases"]\n`;
        diagram += `    ${nodeId} --> ${dbNodeId}\n`;
      });
    });

    return diagram;
  };

  const filteredSummary = selectedApp 
    ? summary.filter(item => item.application === selectedApp)
    : summary;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Database Inventory Management</h1>
          <p className="text-gray-600">Comprehensive view of your database infrastructure across AWS</p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ask About Your Infrastructure</h2>
          <div className="space-y-4">
            {/* Demo Queries */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Try these sample queries:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {demoQueries.map((demo, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoQuery(demo.query)}
                    className="text-left px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                    title={demo.query}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="e.g., 'Show me top 5 applications' or 'How many PostgreSQL databases for UserAuth?'"
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleChatQuery()}
              />
              <button
                onClick={handleChatQuery}
                disabled={chatLoading || !chatQuery.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {chatLoading ? 'Processing...' : 'Ask'}
              </button>
            </div>
            
            {chatResponse && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Response:</span>
                  <button
                    onClick={() => setChatResponse('')}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                <pre className="text-gray-700 whitespace-pre-wrap font-mono text-sm">
                  {chatResponse}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Top Applications Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Applications by Database Count</h2>
            <div className="space-y-3">
              {topApps.slice(0, 5).map((app, index) => (
                <div key={app.application} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      #{index + 1} {app.application}
                    </h3>
                    <span className="text-blue-600 font-bold">{app.total_databases} DBs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Instances:</span> {app.total_instance_count}
                      <br />
                      <span className="text-gray-500">EC2:</span> {app.ec2_instance_count} | 
                      <span className="text-gray-500"> RDS:</span> {app.rds_instance_count}
                    </div>
                    <div>
                      <span className="text-gray-500">Teams:</span> {app.team_count}
                      <br />
                      <span className="text-gray-500">Types:</span> {Object.keys(app.database_types).length}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Database Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(app.database_types).map(([type, count]) => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Architecture Overview</h2>
            <MermaidDiagram 
              chart={generateTopAppsDiagram()}
              className="h-96"
            />
          </div>
        </div>

        {/* Detailed Database Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Database Summary by Application & Type</h2>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Applications</option>
              {Array.from(new Set(summary.map(item => item.application))).map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-gray-600 font-semibold">Application</th>
                  <th className="pb-3 text-gray-600 font-semibold">Database Type</th>
                  <th className="pb-3 text-gray-600 font-semibold">DB Count</th>
                  <th className="pb-3 text-gray-600 font-semibold">EC2 Instances</th>
                  <th className="pb-3 text-gray-600 font-semibold">RDS Instances</th>
                  <th className="pb-3 text-gray-600 font-semibold">Total Size (GB)</th>
                  <th className="pb-3 text-gray-600 font-semibold">Active Connections</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-800 font-medium">{item.application}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {item.database_type}
                      </span>
                    </td>
                    <td className="py-3 text-blue-600 font-semibold">{item.database_count}</td>
                    <td className="py-3 text-gray-600">{item.ec2_instance_count}</td>
                    <td className="py-3 text-gray-600">{item.rds_instance_count}</td>
                    <td className="py-3 text-gray-600">{item.total_size_gb.toFixed(1)}</td>
                    <td className="py-3 text-gray-600">{item.total_active_connections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {summary.reduce((sum, item) => sum + item.database_count, 0)}
              </div>
              <div className="text-gray-600">Total Databases</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Array.from(new Set(summary.map(item => item.application))).length}
              </div>
              <div className="text-gray-600">Applications</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {summary.reduce((sum, item) => sum + item.ec2_instance_count + item.rds_instance_count, 0)}
              </div>
              <div className="text-gray-600">Total Instances</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Array.from(new Set(summary.map(item => item.database_type))).length}
              </div>
              <div className="text-gray-600">Database Types</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="inventory-ai-assistant"
        context="inventory" 
        data={summary}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like filtering databases or showing details
        }}
      />
    </div>
  );
};

export default DatabaseInventory;