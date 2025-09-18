import React, { useState } from 'react';
import DatabaseInventory from './DatabaseInventory';
import CostAnalysis from './CostAnalysis';
import ExecutiveSummary from './ExecutiveSummary';
import ChargebackReports from './ChargebackReports';
import OptimizationReports from './OptimizationReports';

type TabType = 'inventory' | 'cost' | 'executive' | 'chargeback' | 'optimization';

const InfrastructureManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('executive');

  const tabs = [
    { id: 'executive' as TabType, label: 'Executive Summary', icon: '📊', description: 'High-level metrics and insights' },
    { id: 'inventory' as TabType, label: 'Database Inventory', icon: '🗄️', description: 'Database catalog and resources' },
    { id: 'cost' as TabType, label: 'Cost Analysis', icon: '💰', description: 'Spending trends and analysis' },
    { id: 'chargeback' as TabType, label: 'Chargeback Reports', icon: '📋', description: 'Team cost allocation' },
    { id: 'optimization' as TabType, label: 'Optimization', icon: '⚡', description: 'AI-powered recommendations' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'inventory':
        return <DatabaseInventory />;
      case 'cost':
        return <CostAnalysis />;
      case 'executive':
        return <ExecutiveSummary />;
      case 'chargeback':
        return <ChargebackReports />;
      case 'optimization':
        return <OptimizationReports />;
      default:
        return <ExecutiveSummary />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Infrastructure Management</h1>
            <p className="text-gray-600">Comprehensive database inventory, cost analysis, and optimization platform</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {/* Remove the background and padding from child components since we handle it here */}
        <div className="infrastructure-content">
          {renderActiveComponent()}
        </div>
      </div>

      {/* Custom styles to override child component backgrounds */}
      <style jsx>{`
        .infrastructure-content > div {
          background: transparent !important;
          padding-top: 0 !important;
        }
        
        .infrastructure-content > div > div:first-child {
          padding-top: 1.5rem;
        }
        
        /* Hide duplicate headers from child components */
        .infrastructure-content h1 {
          display: none;
        }
        
        .infrastructure-content > div > div > div:first-child {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default InfrastructureManagement;