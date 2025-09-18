import React, { useState, useEffect } from 'react';
import AIAssistant from '../components/AIAssistant';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OptimizationRecommendation {
  type: string;
  application?: string;
  current_cost?: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationData {
  report_type: string;
  recommendations: OptimizationRecommendation[];
  total_recommendations: number;
  generated_at: string;
}

const OptimizationReports: React.FC = () => {
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/reports/optimization');
      const data = await response.json();
      setOptimizationData(data);
    } catch (error) {
      console.error('Error fetching optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_optimization': return '💰';
      case 'consolidation': return '📦';
      case 'performance': return '⚡';
      case 'security': return '🔒';
      default: return '💡';
    }
  };

  const filteredRecommendations = optimizationData?.recommendations.filter(rec => 
    selectedPriority === 'all' || rec.priority === selectedPriority
  ) || [];

  const preparePriorityData = () => {
    if (!optimizationData?.recommendations) return [];
    
    const priorityCounts = optimizationData.recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      color: priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'
    }));
  };

  const prepareTypeData = () => {
    if (!optimizationData?.recommendations) return [];
    
    const typeCounts = optimizationData.recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading optimization reports...</div>
        </div>
      </div>
    );
  }

  const priorityData = preparePriorityData();
  const typeData = prepareTypeData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Infrastructure Optimization</h1>
          <p className="text-gray-600">AI-powered recommendations for cost savings and performance improvements</p>
        </div>

        {optimizationData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {optimizationData.total_recommendations}
                  </div>
                  <div className="text-gray-600">Total Recommendations</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {optimizationData.recommendations.filter(r => r.priority === 'high').length}
                  </div>
                  <div className="text-gray-600">High Priority</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {optimizationData.recommendations.filter(r => r.priority === 'medium').length}
                  </div>
                  <div className="text-gray-600">Medium Priority</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {optimizationData.recommendations.filter(r => r.current_cost).reduce((sum, r) => sum + (r.current_cost || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Potential Savings ($)</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchOptimizationData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Refresh Recommendations
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations by Priority</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="priority" 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
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
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Type Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations by Type</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="type" 
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
                      <Bar 
                        dataKey="count" 
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Optimization Recommendations 
                {selectedPriority !== 'all' && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({selectedPriority} priority)
                  </span>
                )}
              </h2>
              
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">No recommendations found</div>
                  <div className="text-gray-400 text-sm mt-2">
                    {selectedPriority !== 'all' 
                      ? `No ${selectedPriority} priority recommendations available`
                      : 'Your infrastructure appears to be well optimized!'
                    }
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations.map((recommendation, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">
                            {getTypeIcon(recommendation.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                                {getPriorityIcon(recommendation.priority)} {recommendation.priority.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {recommendation.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {recommendation.application && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {recommendation.application}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{recommendation.recommendation}</p>
                            {recommendation.current_cost && (
                              <div className="text-sm text-gray-600">
                                Current monthly cost: <span className="font-semibold text-red-600">${recommendation.current_cost.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Items */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">🔴 High Priority Actions</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Review high-cost applications immediately</li>
                    <li>• Implement cost optimization measures</li>
                    <li>• Set up cost alerts and monitoring</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">🟡 Medium Priority Actions</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Plan database consolidation</li>
                    <li>• Optimize resource allocation</li>
                    <li>• Review instance sizing</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🟢 Low Priority Actions</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Monitor performance trends</li>
                    <li>• Plan future capacity</li>
                    <li>• Document best practices</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500 text-center">
                Report generated on {new Date(optimizationData.generated_at).toLocaleString()} | 
                Total recommendations: {optimizationData.total_recommendations} | 
                Showing: {filteredRecommendations.length} recommendations
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="optimization-ai-assistant"
        context="optimization" 
        data={optimizationData}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like implementing optimization recommendations
        }}
      />
    </div>
  );
};

export default OptimizationReports;