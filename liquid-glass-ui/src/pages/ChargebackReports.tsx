import React, { useState, useEffect } from 'react';
import AIAssistant from '../components/AIAssistant';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChargebackData {
  report_type?: string;
  team?: string;
  period_days: number;
  cost_data: {
    total_cost: number;
    average_daily_cost: number;
    cost_by_application: Record<string, number>;
    cost_by_team: Record<string, number>;
    cost_by_service: Record<string, number>;
  };
  resource_summary?: {
    total_count: number;
    databases: any[];
  };
  team_reports?: Array<{
    team: string;
    cost_data: any;
  }>;
  generated_at: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

const ChargebackReports: React.FC = () => {
  const [chargebackData, setChargebackData] = useState<ChargebackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchChargebackData();
  }, [selectedTeam, selectedPeriod]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5001/inventory/metadata');
      const data = await response.json();
      setTeams(data.teams?.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchChargebackData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: selectedPeriod.toString()
      });
      
      if (selectedTeam) {
        params.append('team', selectedTeam);
      }

      const response = await fetch(`http://localhost:5001/reports/chargeback?${params}`);
      const data = await response.json();
      setChargebackData(data);
    } catch (error) {
      console.error('Error fetching chargeback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareTeamCostData = () => {
    if (!chargebackData?.team_reports) return [];
    
    return chargebackData.team_reports.map(report => ({
      team: report.team,
      cost: report.cost_data.total_cost || 0,
      ec2_cost: report.cost_data.cost_by_service?.EC2 || 0,
      rds_cost: report.cost_data.cost_by_service?.RDS || 0
    })).sort((a, b) => b.cost - a.cost);
  };

  const prepareServiceCostData = () => {
    if (selectedTeam && chargebackData?.cost_data?.cost_by_service) {
      return Object.entries(chargebackData.cost_data.cost_by_service).map(([service, cost]) => ({
        name: service,
        value: cost
      }));
    }
    
    if (chargebackData?.team_reports) {
      const serviceData: Record<string, number> = {};
      chargebackData.team_reports.forEach(report => {
        Object.entries(report.cost_data.cost_by_service || {}).forEach(([service, cost]) => {
          serviceData[service] = (serviceData[service] || 0) + cost;
        });
      });
      
      return Object.entries(serviceData).map(([service, cost]) => ({
        name: service,
        value: cost
      }));
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading chargeback reports...</div>
        </div>
      </div>
    );
  }

  const teamCostData = prepareTeamCostData();
  const serviceCostData = prepareServiceCostData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Chargeback Reports</h1>
          <p className="text-gray-600">Team cost allocation and billing analysis</p>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            
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
          </div>
        </div>

        {chargebackData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${selectedTeam ? chargebackData.cost_data?.total_cost?.toFixed(2) : 
                      chargebackData.team_reports?.reduce((sum, report) => sum + (report.cost_data.total_cost || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-gray-600">Total Cost ({selectedPeriod} days)</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${selectedTeam ? chargebackData.cost_data?.average_daily_cost?.toFixed(2) :
                      (chargebackData.team_reports?.reduce((sum, report) => sum + (report.cost_data.total_cost || 0), 0) / selectedPeriod).toFixed(2)}
                  </div>
                  <div className="text-gray-600">Daily Average</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {selectedTeam ? 1 : chargebackData.team_reports?.length || 0}
                  </div>
                  <div className="text-gray-600">{selectedTeam ? 'Team' : 'Teams'}</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {selectedTeam ? chargebackData.resource_summary?.total_count || 0 : 
                      chargebackData.team_reports?.reduce((sum, report) => sum + (report.cost_data.records_analyzed || 0), 0) || 0}
                  </div>
                  <div className="text-gray-600">Resources</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Cost Comparison */}
              {!selectedTeam && teamCostData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Cost Comparison</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamCostData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="team" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                        />
                        <Legend />
                        <Bar dataKey="ec2_cost" stackId="a" fill="#3b82f6" name="EC2 Cost" />
                        <Bar dataKey="rds_cost" stackId="a" fill="#8b5cf6" name="RDS Cost" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Service Cost Distribution */}
              {serviceCostData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {selectedTeam ? `${selectedTeam} Service Costs` : 'Service Cost Distribution'}
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceCostData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceCostData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Breakdown */}
              {!selectedTeam && chargebackData.team_reports && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Team Cost Breakdown</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {chargebackData.team_reports
                      .sort((a, b) => (b.cost_data.total_cost || 0) - (a.cost_data.total_cost || 0))
                      .map((report) => (
                        <div key={report.team} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-700 font-medium">{report.team}</span>
                          <span className="text-green-600 font-semibold">${(report.cost_data.total_cost || 0).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Application Breakdown */}
              {selectedTeam && chargebackData.cost_data?.cost_by_application && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedTeam} Application Costs</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(chargebackData.cost_data.cost_by_application)
                      .sort(([,a], [,b]) => b - a)
                      .map(([app, cost]) => (
                        <div key={app} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-700">{app}</span>
                          <span className="text-blue-600 font-semibold">${cost.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Resource Summary */}
              {selectedTeam && chargebackData.resource_summary && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Resource Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Databases:</span>
                      <span className="font-semibold">{chargebackData.resource_summary.total_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EC2 Instances:</span>
                      <span className="font-semibold">
                        {new Set(chargebackData.resource_summary.databases
                          .filter(db => db.host_type === 'EC2')
                          .map(db => db.host_instance_id)).size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RDS Instances:</span>
                      <span className="font-semibold">
                        {new Set(chargebackData.resource_summary.databases
                          .filter(db => db.host_type === 'RDS')
                          .map(db => db.host_instance_id)).size}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Report Metadata */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500 text-center">
                Report generated on {new Date(chargebackData.generated_at).toLocaleString()} | 
                Report type: {chargebackData.report_type ? chargebackData.report_type.replace('_', ' ') : 'Standard Report'} | 
                Period: {selectedPeriod} days
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="chargeback-ai-assistant"
        context="chargeback" 
        data={chargebackData}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like cost allocation adjustments
        }}
      />
    </div>
  );
};

export default ChargebackReports;