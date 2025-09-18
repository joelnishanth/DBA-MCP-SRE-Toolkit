import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AIAssistant from '../components/AIAssistant';

interface ExecutiveData {
  report_type?: string;
  key_metrics: {
    total_databases: number;
    total_applications: number;
    total_teams: number;
    monthly_cost: number;
    daily_cost: number;
    annual_projection: number;
  };
  top_applications: Array<{
    application: string;
    total_databases: number;
    database_types: Record<string, number>;
    ec2_instance_count: number;
    rds_instance_count: number;
    total_instance_count: number;
    team_count: number;
    teams: string[];
  }>;
  cost_breakdown: {
    by_application: Record<string, number>;
    by_team: Record<string, number>;
  };
  generated_at: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

const ExecutiveSummary: React.FC = () => {
  const [executiveData, setExecutiveData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const fetchExecutiveData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/reports/executive-summary');
      const data = await response.json();
      setExecutiveData(data);
    } catch (error) {
      console.error('Error fetching executive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareApplicationData = () => {
    if (!executiveData?.top_applications) return [];
    
    return executiveData.top_applications.map(app => ({
      name: app.application,
      databases: app.total_databases,
      instances: app.total_instance_count,
      teams: app.team_count
    }));
  };

  const prepareCostByApplicationData = () => {
    if (!executiveData?.cost_breakdown?.by_application) return [];
    
    return Object.entries(executiveData.cost_breakdown.by_application)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const prepareCostByTeamData = () => {
    if (!executiveData?.cost_breakdown?.by_team) return [];
    
    return Object.entries(executiveData.cost_breakdown.by_team)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading executive summary...</div>
        </div>
      </div>
    );
  }

  const applicationData = prepareApplicationData();
  const costByApplicationData = prepareCostByApplicationData();
  const costByTeamData = prepareCostByTeamData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Executive Summary</h1>
          <p className="text-gray-600">High-level infrastructure metrics and insights for leadership</p>
        </div>

        {executiveData && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {executiveData.key_metrics?.total_databases?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-gray-600">Total Databases</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Across {executiveData.key_metrics?.total_applications || 0} applications
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {executiveData.key_metrics?.monthly_cost ? formatLargeCurrency(executiveData.key_metrics.monthly_cost) : 'N/A'}
                  </div>
                  <div className="text-gray-600">Monthly Cost</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {executiveData.key_metrics?.daily_cost ? formatCurrency(executiveData.key_metrics.daily_cost) : 'N/A'}/day
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {executiveData.key_metrics?.annual_projection ? formatLargeCurrency(executiveData.key_metrics.annual_projection) : 'N/A'}
                  </div>
                  <div className="text-gray-600">Annual Projection</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on current usage
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {executiveData.key_metrics?.total_teams || 'N/A'}
                  </div>
                  <div className="text-gray-600">Active Teams</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Managing infrastructure
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost by Application */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Applications by Cost</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costByApplicationData.slice(0, 8)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number"
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatLargeCurrency(value)}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Monthly Cost']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost by Team */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Cost Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costByTeamData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costByTeamData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Monthly Cost']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Application Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Applications Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="databases" fill="#3b82f6" name="Databases" />
                    <Bar dataKey="instances" fill="#8b5cf6" name="Instances" />
                    <Bar dataKey="teams" fill="#10b981" name="Teams" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Applications Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Application Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 text-gray-600 font-semibold text-sm">Application</th>
                        <th className="pb-3 text-gray-600 font-semibold text-sm">Databases</th>
                        <th className="pb-3 text-gray-600 font-semibold text-sm">Instances</th>
                        <th className="pb-3 text-gray-600 font-semibold text-sm">Teams</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(executiveData.top_applications || []).map((app, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 text-gray-800 font-medium text-sm">{app.application}</td>
                          <td className="py-3 text-blue-600 font-semibold text-sm">{app.total_databases}</td>
                          <td className="py-3 text-gray-600 text-sm">
                            {app.total_instance_count} 
                            <span className="text-xs text-gray-500 ml-1">
                              ({app.ec2_instance_count}+{app.rds_instance_count})
                            </span>
                          </td>
                          <td className="py-3 text-gray-600 text-sm">{app.team_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cost Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">By Application</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {executiveData.cost_breakdown?.by_application ? 
                        Object.entries(executiveData.cost_breakdown.by_application)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([app, cost]) => (
                            <div key={app} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{app}</span>
                              <span className="text-green-600 font-semibold">{formatCurrency(cost)}</span>
                            </div>
                          ))
                        : <div className="text-sm text-gray-500">No cost data available</div>
                      }
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">By Team</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {executiveData.cost_breakdown?.by_team ? 
                        Object.entries(executiveData.cost_breakdown.by_team)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([team, cost]) => (
                            <div key={team} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{team}</span>
                              <span className="text-blue-600 font-semibold">{formatCurrency(cost)}</span>
                            </div>
                          ))
                        : <div className="text-sm text-gray-500">No team cost data available</div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Infrastructure Scale</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {executiveData.key_metrics?.total_databases || 'N/A'} databases managed</li>
                    <li>• {executiveData.key_metrics?.total_applications || 'N/A'} applications supported</li>
                    <li>• {executiveData.key_metrics?.total_teams || 'N/A'} teams actively using resources</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">💰 Cost Analysis</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• {executiveData.key_metrics?.monthly_cost ? formatCurrency(executiveData.key_metrics.monthly_cost) : 'N/A'} monthly spend</li>
                    <li>• {executiveData.key_metrics?.annual_projection ? formatCurrency(executiveData.key_metrics.annual_projection) : 'N/A'} annual projection</li>
                    <li>• {executiveData.key_metrics?.daily_cost ? formatCurrency(executiveData.key_metrics.daily_cost) : 'N/A'} average daily cost</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Top Performers</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• {executiveData.top_applications?.[0]?.application || 'N/A'} leads with {executiveData.top_applications?.[0]?.total_databases || 'N/A'} DBs</li>
                    <li>• {executiveData.cost_breakdown?.by_application ? Object.keys(executiveData.cost_breakdown.by_application)[0] : 'N/A'} highest cost app</li>
                    <li>• {executiveData.cost_breakdown?.by_team ? Object.keys(executiveData.cost_breakdown.by_team)[0] : 'N/A'} team leads spending</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500 text-center">
                Executive summary generated on {new Date(executiveData.generated_at).toLocaleString()} | 
                Report type: {executiveData.report_type ? executiveData.report_type.replace('_', ' ') : 'Standard Report'} | 
                Data reflects current infrastructure state
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="executive-ai-assistant"
        context="executive" 
        data={executiveData}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like drilling down into specific metrics
        }}
      />
    </div>
  );
};

export default ExecutiveSummary;