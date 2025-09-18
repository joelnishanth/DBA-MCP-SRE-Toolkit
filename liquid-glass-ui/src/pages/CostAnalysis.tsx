import React, { useState, useEffect } from 'react';
import LiquidGlassCard from '../components/LiquidGlassCard';
import AIAssistant from '../components/AIAssistant';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CostSummary {
  period_days: number;
  total_cost: number;
  average_daily_cost: number;
  cost_by_application: Record<string, number>;
  cost_by_team: Record<string, number>;
  cost_by_service: Record<string, number>;
  records_analyzed: number;
}

interface CostTrend {
  date: string;
  application?: string;
  team?: string;
  service_type?: string;
  cost: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'];

const CostAnalysis: React.FC = () => {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [costTrends, setCostTrends] = useState<CostTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [groupBy, setGroupBy] = useState<'application' | 'team' | 'service_type'>('application');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const demoQueries = [
    { label: '💰 Total Monthly Cost', query: 'What is our total monthly spending?' },
    { label: '🏆 Top Cost Applications', query: 'Show me the top 5 applications by cost' },
    { label: '👥 Team Platform Cost', query: 'What is the cost for team Platform?' },
    { label: '📊 UserAuth Spending', query: 'How much is UserAuth costing us?' },
    { label: '⚡ Cost Breakdown', query: 'Show me cost breakdown by service type' },
    { label: '📈 Commerce Team Analysis', query: 'What does team Commerce spend on?' },
    { label: '🔍 PaymentProcessor Cost', query: 'What is the monthly cost for PaymentProcessor?' },
    { label: '💡 Cost Overview', query: 'Give me an overview of our spending' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, groupBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes] = await Promise.all([
        fetch(`http://localhost:5002/api/v1/cost/summary?days=${selectedPeriod}`),
        fetch(`http://localhost:5002/api/v1/cost/trends?days=${selectedPeriod}&group_by=${groupBy}`)
      ]);

      const summaryData = await summaryRes.json();
      const trendsData = await trendsRes.json();

      setCostSummary(summaryData);
      setCostTrends(trendsData.trends);
    } catch (error) {
      console.error('Error fetching cost data:', error);
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

  const prepareTrendData = () => {
    const groupedData: Record<string, Record<string, number>> = {};
    
    costTrends.forEach(trend => {
      const date = trend.date;
      const groupKey = trend[groupBy] || 'Unknown';
      
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      
      groupedData[date][groupKey] = (groupedData[date][groupKey] || 0) + trend.cost;
    });

    return Object.entries(groupedData)
      .map(([date, costs]) => ({
        date,
        ...costs
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const preparePieData = (costData: Record<string, number>) => {
    return Object.entries(costData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 only
  };

  const prepareBarData = (costData: Record<string, number>) => {
    return Object.entries(costData)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // Top 10 only
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading cost analysis...</div>
        </div>
      </div>
    );
  }

  const trendData = prepareTrendData();
  const uniqueGroups = Array.from(new Set(costTrends.map(t => t[groupBy]))).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Cost Analysis & Chargeback</h1>
          <p className="text-gray-600">Track spending across applications, teams, and services</p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 180 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'application' | 'team' | 'service_type')}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="application">Application</option>
                <option value="team">Team</option>
                <option value="service_type">Service Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ask About Costs</h2>
          <div className="space-y-4">
            {/* Demo Queries */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Try these sample queries:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {demoQueries.map((demo, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoQuery(demo.query)}
                    className="text-left px-3 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
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
                placeholder="e.g., 'What is the cost for UserAuth?' or 'Show me team spending'"
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

        {/* Cost Summary Cards */}
        {costSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${costSummary.total_cost.toFixed(2)}
                </div>
                <div className="text-gray-600">Total Cost ({selectedPeriod} days)</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${costSummary.average_daily_cost.toFixed(2)}
                </div>
                <div className="text-gray-600">Average Daily Cost</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.keys(costSummary.cost_by_application).length}
                </div>
                <div className="text-gray-600">Applications</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Object.keys(costSummary.cost_by_team).length}
                </div>
                <div className="text-gray-600">Teams</div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Trends Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cost Trends Over Time</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
                <Legend />
                {uniqueGroups.map((group, index) => (
                  <Line
                    key={group}
                    type="monotone"
                    dataKey={group}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Charts */}
        {costSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Bar Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Applications by Cost</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareBarData(costSummary.cost_by_application)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                    />
                    <Bar dataKey="cost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Teams Pie Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cost Distribution by Team</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePieData(costSummary.cost_by_team)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieData(costSummary.cost_by_team).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Cost Tables */}
        {costSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Cost by Application</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(costSummary.cost_by_application)
                  .sort(([,a], [,b]) => b - a)
                  .map(([app, cost]) => (
                    <div key={app} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">{app}</span>
                      <span className="text-green-600 font-semibold">${cost.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Teams Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Cost by Team</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(costSummary.cost_by_team)
                  .sort(([,a], [,b]) => b - a)
                  .map(([team, cost]) => (
                    <div key={team} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">{team}</span>
                      <span className="text-blue-600 font-semibold">${cost.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Cost by Service</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(costSummary.cost_by_service)
                  .sort(([,a], [,b]) => b - a)
                  .map(([service, cost]) => (
                    <div key={service} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">{service}</span>
                      <span className="text-purple-600 font-semibold">${cost.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="cost-ai-assistant"
        context="cost" 
        data={costSummary}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like cost optimization or budget alerts
        }}
      />
    </div>
  );
};

export default CostAnalysis;