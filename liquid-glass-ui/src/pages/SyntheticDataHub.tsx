import React from 'react'
import { Link } from 'react-router-dom'

const SyntheticDataHub: React.FC = () => {
  const dataCategories = [
    {
      title: "Data Generation",
      description: "Create realistic test datasets for development and testing",
      items: [
        {
          title: "Seed Data Generator",
          icon: "🌱",
          path: "/seed-data",
          desc: "Generate structured data for PostgreSQL, MySQL, and SQLite databases with realistic relationships and constraints",
          features: ["Multi-database support", "Realistic relationships", "Configurable volume", "Live progress tracking"]
        }
      ]
    },
    {
      title: "Healthcare & Medical",
      description: "Medical data desensitization and generation for healthcare research",
      items: [
        {
          title: "Medical PHI Desensitization",
          icon: "🏥",
          path: "/desensitize",
          desc: "Protect patient health information while preserving medical research utility with AI-powered desensitization",
          features: ["Research utility preservation", "Bedrock & Ollama support", "Real-time processing", "AI-powered analysis"]
        }
      ]
    },
    {
      title: "Financial Services",
      description: "Financial data protection and synthetic generation for banking",
      items: [
        {
          title: "Financial PII Protection",
          icon: "🏦",
          path: "/financial-desensitize",
          desc: "Secure financial data including account numbers, SSNs, and credit cards while maintaining analytical value",
          features: ["Account masking", "Balance anonymization", "Bank relationship preservation", "Secure processing"]
        }
      ]
    },
    {
      title: "Education & Research",
      description: "Student data protection for educational institutions and research",
      items: [
        {
          title: "Student Data Protection",
          icon: "🎓",
          path: "/education-desensitize",
          desc: "Protect student records and academic information while enabling educational research and analytics",
          features: ["Grade preservation", "Identity protection", "Research enablement", "Academic analytics"]
        }
      ]
    },
    {
      title: "Privacy-Preserving ML",
      description: "Advanced privacy techniques for machine learning and AI development",
      items: [
        {
          title: "Federated Learning & Differential Privacy",
          icon: "🔒",
          path: "/privacy-ml",
          desc: "Implement cutting-edge privacy techniques including federated learning, differential privacy, and synthetic data generation",
          features: ["Federated learning", "Differential privacy", "Synthetic generation", "Privacy metrics"]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Synthetic Data Hub
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
              Comprehensive suite of privacy-preserving data generation and desensitization tools for various industry verticals
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 text-sm font-medium">
                🛡️ Privacy-First
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-full text-blue-800 text-sm font-medium">
                🤖 AI-Powered
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-full text-purple-800 text-sm font-medium">
                📊 Industry Compliant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="space-y-16">
          {dataCategories.map((category, categoryIdx) => (
            <div key={categoryIdx}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-gray-900 mb-3">{category.title}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {category.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:border-gray-300/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-6">
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {item.desc}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {item.features.map((feature, featureIdx) => (
                            <div key={featureIdx} className="flex items-center text-xs text-gray-500">
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <div className="bg-gray-100 group-hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors inline-block">
                            Launch Tool →
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

export default SyntheticDataHub