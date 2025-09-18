import React from 'react'
import { Link } from 'react-router-dom'
import LiquidGlassCard from '../components/LiquidGlassCard'

const Home: React.FC = () => {
  const features = [
    {
      category: "AI-Powered Data Intelligence",
      description: "Natural language querying with interactive visualizations and analytics",
      featured: true,
      items: [
        { title: "NLP Charts", icon: "📊", path: "/nlp-charts", desc: "Natural language queries with interactive charts", featured: true },
        { title: "NLP Query", icon: "◎", path: "/nlp", desc: "Natural language database queries" },
        { title: "Query Performance", icon: "◆", path: "/performance", desc: "Cross-database performance analysis" }
      ]
    },
    {
      category: "Infrastructure Monitoring",
      description: "Real-time container monitoring and AI-powered diagnostics",
      items: [
        { title: "AI Diagnostics", icon: "◈", path: "/diagnostics", desc: "Automated issue detection" },
        { title: "Container Metrics", icon: "◉", path: "/metrics", desc: "Real-time performance monitoring" },
        { title: "Container Logs", icon: "≡", path: "/logs", desc: "Centralized log analysis" }
      ]
    },
    {
      category: "Workflow Automation",
      description: "Intelligent container management with n8n workflow automation",
      featured: true,
      items: [
        { title: "n8n Workflows", icon: "🔄", path: "/n8n-workflows", desc: "Automate container operations with intelligent workflows", featured: true },
        { title: "n8n Updates", icon: "🔔", path: "/n8n-updates", desc: "Real-time workflow alerts and notifications", featured: true }
      ]
    },
    {
      category: "Synthetic Data Hub",
      description: "Privacy-preserving data generation and desensitization",
      items: [
        { title: "Data Generation", icon: "◇", path: "/synthetic-hub", desc: "AI-powered synthetic data creation" }
      ]
    },
    {
      category: "Database Intelligence",
      description: "AI-powered database selection and provisioning with multi-agent analysis",
      featured: true,
      items: [
        { title: "NoSQL Onboarding", icon: "🗄️", path: "/nosql-demo", desc: "7-agent AI system for NoSQL, cache, and in-memory database selection", featured: true },
        { title: "SQL Database Provisioning", icon: "🤖", path: "/strands-demo", desc: "5-agent AI system for relational database provisioning using AWS Agent Core", featured: true },
        { title: "Incident Response", icon: "🚨", path: "/agentcore-demo", desc: "5-agent AI system for automated incident response using AWS Agent Core", featured: true }
      ]
    },
    {
      category: "System Architecture",
      description: "Visual system overview and component relationships",
      items: [
        { title: "Architecture View", icon: "◊", path: "/architecture", desc: "Interactive system visualization" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-light text-gray-900 mb-4">
              AI-Powered Infrastructure Intelligence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ask questions in natural language, get SQL results with interactive charts and visualizations
            </p>
            
            {/* Featured NLP Charts CTA */}
            <div className="mb-8">
              <Link 
                to="/nlp-charts" 
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-2xl mr-3">📊</span>
                Try NLP Charts - Query with Visualizations
                <span className="ml-2">→</span>
              </Link>
            </div>
            
            <div className="flex justify-center space-x-4">
              <div className="bg-blue-100 px-4 py-2 rounded-full text-blue-800 text-sm font-medium">
                📊 Interactive Charts
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 text-sm font-medium">
                🧠 Natural Language
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-full text-purple-800 text-sm font-medium">
                ⚡ Real-time Insights
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="space-y-16">
          {features.map((category, categoryIdx) => (
            <div key={categoryIdx}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-light text-gray-900 mb-4">{category.category}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
              </div>
              
              <div className={`grid gap-6 justify-items-center ${category.featured ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {category.items.map((item, itemIdx) => (
                  <Link key={itemIdx} to={item.path}>
                    <LiquidGlassCard
                      variant={item.featured ? 'featured' : 'default'}
                      rounded="2xl"
                      className={`group p-6 flex flex-col justify-center cursor-pointer ${
                        item.featured 
                          ? 'aspect-auto min-h-[240px] w-full' 
                          : 'aspect-square w-48'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`mb-4 group-hover:scale-110 transition-transform duration-300 ${
                          item.featured ? 'text-7xl' : 'text-4xl'
                        }`}>
                          {item.icon}
                        </div>
                        <h3 className={`font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors ${
                          item.featured ? 'text-xl' : 'text-base'
                        }`}>
                          {item.title}
                        </h3>
                        <p className={`text-white/80 leading-relaxed ${
                          item.featured ? 'text-base' : 'text-sm'
                        }`}>
                          {item.desc}
                        </p>
                        {item.featured && (
                          <div className="mt-6 inline-flex items-center text-blue-200 font-medium">
                            Try it now <span className="ml-2">→</span>
                          </div>
                        )}
                      </div>
                    </LiquidGlassCard>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">📊 Interactive</div>
              <div className="text-gray-600">Chart Visualizations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">🧠 Natural</div>
              <div className="text-gray-600">Language Queries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">🔄 Real-time</div>
              <div className="text-gray-600">Data Processing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">🎯 Multi-DB</div>
              <div className="text-gray-600">Query Intelligence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home