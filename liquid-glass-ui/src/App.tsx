import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ContainerMetrics from './pages/ContainerMetrics'
import AIDiagnostics from './pages/AIDiagnostics'
import NLPQuery from './pages/NLPQuery'
import NLPQueryCharts from './pages/NLPQueryCharts'
import ContainerLogs from './pages/ContainerLogs'
import QueryPerformance from './pages/QueryPerformance'
import SeedDataGeneration from './pages/SeedDataGeneration'
import DataDesensitization from './pages/DataDesensitization'
import FinancialDataDesensitization from './pages/FinancialDataDesensitization'
import EducationDataDesensitization from './pages/EducationDataDesensitization'
import PrivacyPreservingML from './pages/PrivacyPreservingML'
import Home from './pages/Home'
import SyntheticDataHub from './pages/SyntheticDataHub'
import Architecture from './pages/Architecture'
import MCPDemo from './pages/MCPDemo'
import DevFeed from './pages/DevFeed'
import DatabaseInventory from './pages/DatabaseInventory'
import CostAnalysis from './pages/CostAnalysis'
import ChargebackReports from './pages/ChargebackReports'
import OptimizationReports from './pages/OptimizationReports'
import ExecutiveSummary from './pages/ExecutiveSummary'
import InfrastructureManagement from './pages/InfrastructureManagement'
import AWSInventory from './pages/AWSInventory'

import SQLProvisioning from './pages/SQLProvisioning'
import NoSQLDemo from './pages/NoSQLDemo'
import IncidentResponse from './pages/IncidentResponse'
import AIAgentsDemo from './pages/AIAgentsDemo'
import LiquidGlassLink from './components/LiquidGlassLink'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Link to="/home" className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                DataVault AI Platform
              </Link>
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              {/* Primary Feature - Database & Cost Management */}
              <LiquidGlassLink to="/infrastructure" variant="primary">Infrastructure Management</LiquidGlassLink>
              <LiquidGlassLink to="/aws-inventory" variant="primary">AWS Inventory</LiquidGlassLink>
              
              {/* AI & Analytics Tools */}
              <LiquidGlassLink to="/nosql-demo" variant="primary">NoSQL Onboarding</LiquidGlassLink>
              <LiquidGlassLink to="/sql-provisioning" variant="primary">SQL Provisioning</LiquidGlassLink>
              <LiquidGlassLink to="/incident-response" variant="primary">Incident Response with AI</LiquidGlassLink>
              <LiquidGlassLink to="/ai-agents-demo" variant="primary">AI Agents Patterns</LiquidGlassLink>
              <LiquidGlassLink to="/nlp-charts" variant="secondary">NLP Charts</LiquidGlassLink>
              <LiquidGlassLink to="/diagnostics" variant="secondary">AI Diagnostics</LiquidGlassLink>
              
              {/* Container & Performance Tools */}

              <LiquidGlassLink to="/metrics" variant="ghost">Container Metrics</LiquidGlassLink>
              <LiquidGlassLink to="/logs" variant="ghost">Container Logs</LiquidGlassLink>
              <LiquidGlassLink to="/performance" variant="ghost">Query Performance</LiquidGlassLink>
              
              {/* Development & Architecture */}
              <LiquidGlassLink to="/synthetic-hub" variant="ghost">Synthetic Data Hub</LiquidGlassLink>
              <LiquidGlassLink to="/architecture" variant="ghost">Architecture</LiquidGlassLink>
              <LiquidGlassLink to="/mcp-demo" variant="ghost">MCP Demo</LiquidGlassLink>
              <LiquidGlassLink to="/dev-feed" variant="ghost">Dev Feed</LiquidGlassLink>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<InfrastructureManagement />} />
          <Route path="/home" element={<Home />} />
          <Route path="/infrastructure" element={<InfrastructureManagement />} />
          <Route path="/aws-inventory" element={<AWSInventory />} />
          
          {/* Legacy individual routes for direct access */}
          <Route path="/database-inventory" element={<DatabaseInventory />} />
          <Route path="/cost-analysis" element={<CostAnalysis />} />
          <Route path="/executive-summary" element={<ExecutiveSummary />} />
          <Route path="/chargeback-reports" element={<ChargebackReports />} />
          <Route path="/optimization-reports" element={<OptimizationReports />} />
          
          {/* Other tools */}
          <Route path="/metrics" element={<ContainerMetrics />} />
          <Route path="/logs" element={<ContainerLogs />} />
          <Route path="/diagnostics" element={<AIDiagnostics />} />
          <Route path="/nlp" element={<NLPQuery />} />
          <Route path="/nlp-charts" element={<NLPQueryCharts />} />
          <Route path="/performance" element={<QueryPerformance />} />
          <Route path="/synthetic-hub" element={<SyntheticDataHub />} />
          <Route path="/seed-data" element={<SeedDataGeneration />} />
          <Route path="/desensitize" element={<DataDesensitization />} />
          <Route path="/financial-desensitize" element={<FinancialDataDesensitization />} />
          <Route path="/education-desensitize" element={<EducationDataDesensitization />} />
          <Route path="/privacy-ml" element={<PrivacyPreservingML />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/mcp-demo" element={<MCPDemo />} />
          <Route path="/dev-feed" element={<DevFeed />} />

          <Route path="/sql-provisioning" element={<SQLProvisioning />} />
          <Route path="/nosql-demo" element={<NoSQLDemo />} />
          <Route path="/incident-response" element={<IncidentResponse />} />
          <Route path="/ai-agents-demo" element={<AIAgentsDemo />} />
          <Route path="/ai-agents-tutorial" element={<AIAgentsDemo />} />
          <Route path="/langgraph-demo" element={<AIAgentsDemo />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App