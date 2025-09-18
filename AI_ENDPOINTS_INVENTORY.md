# AI Endpoints Inventory - Complete Project Overview

This document provides a comprehensive inventory of all AI, Bedrock, and Claude endpoints across the entire SRE GenAI project.

## 🤖 **Unified AI Endpoints Architecture**

### **NEW: Consolidated Unified Claude Service**
| **Service** | **Endpoint** | **Method** | **Purpose** | **AI Model** | **Port** | **Status** |
|-------------|--------------|------------|-------------|--------------|----------|------------|
| **🎯 Unified Claude** | `/bedrockclaude` | POST | **ALL AI operations consolidated** | **Auto-selected Sonnet/Haiku** | **7000** | **🆕 New** |
| **Unified Claude** | `/bedrockclaude/test` | GET | Test Claude connection | Auto-selected | 7000 | 🆕 New |
| **Unified Claude** | `/bedrockclaude/status` | GET | Get service status | Auto-selected | 7000 | 🆕 New |
| **Unified Claude** | `/health` | GET | Health check | N/A | 7000 | 🆕 New |

### **Legacy Endpoints (Being Migrated)**
| **Service** | **Endpoint** | **Method** | **Purpose** | **AI Model** | **Port** | **Status** |
|-------------|--------------|------------|-------------|--------------|----------|------------|
| **MCP Server** | `/ai/analyze-database` | POST | Database requirements analysis | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/ai/bedrock/test` | GET | Test Bedrock connection | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/ai/bedrock/status` | GET | Get Bedrock configuration status | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/aws-credentials-status` | GET | Check AWS Bedrock credentials | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/strands/analyze` | POST | Multi-agent SQL provisioning (7 agents) | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/nosql/analyze` | POST | Multi-agent NoSQL onboarding (7 agents) | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **MCP Server** | `/agentcore/analyze` | POST | Incident response analysis (5 agents) | Claude 3.0 Haiku | 5001 | 🔄 Migrating |
| **Bot Core** | `/diagnose` | POST | Container diagnostics | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/fix/preview` | POST | Fix plan preview | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/fix/execute` | POST | Execute container fixes | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/nlp-query` | POST | Natural language to SQL queries | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/infrastructure-ai` | POST | Infrastructure AI assistant | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/analyze-performance` | POST | Query performance analysis | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **Bot Core** | `/desensitize-data` | POST | Data privacy desensitization | Claude 3.0 Sonnet | 6000 | 🔄 Migrating |
| **AWS Inventory** | `/chat` | POST | Natural language inventory queries | Claude (via MCP) | 5002 | ✅ Active |

## 🎯 **Unified Claude Operations**

The new `/bedrockclaude` endpoint handles all AI operations through a single interface:

```json
{
  "operation": "diagnose|analyze-database|nlp-query|strands-analyze|nosql-analyze|agentcore-analyze|fix-preview|fix-execute|analyze-performance|desensitize-data|infrastructure-ai|test",
  "prompt": "Your AI prompt here",
  "model": "sonnet|haiku (optional - auto-selected based on operation)",
  "context": { "additional_context": "optional" },
  "max_tokens": 4000,
  "temperature": 0.1,
  "metadata": { "operation_metadata": "optional" }
}
```

### **Automatic Model Selection**
- **Claude 3.0 Sonnet**: Complex operations (diagnose, fix-execute, nlp-query, analyze-performance, desensitize-data, infrastructure-ai)
- **Claude 3.0 Haiku**: Fast operations (analyze-database, strands-analyze, nosql-analyze, agentcore-analyze, test)

## 🏗️ **Multi-Agent Systems Breakdown**

### **AWS Strands (SQL Database Provisioning) - 7 Agents**
| **Agent** | **Specialization** | **Model** | **Purpose** |
|-----------|-------------------|-----------|-------------|
| Database Workload Analyzer | Workload Pattern Analysis | Claude 3.0 Haiku | Analyzes OLTP/OLAP patterns, concurrency needs |
| Database Cost Optimizer | Cost Analysis & Optimization | Claude 3.0 Haiku | Cost breakdown, Reserved Instance recommendations |
| Database Security & Compliance | Security & Compliance Analysis | Claude 3.0 Haiku | PCI-DSS, SOX, HIPAA compliance analysis |
| Database Performance Engineer | Performance Analysis & Optimization | Claude 3.0 Haiku | Instance sizing, performance tuning |
| Database Reliability Engineer | Reliability & Availability | Claude 3.0 Haiku | Multi-AZ, backup strategies, disaster recovery |
| Database Migration Specialist | Migration Planning & Execution | Claude 3.0 Haiku | Migration strategies, downtime planning |
| Database Architecture Synthesizer | Architecture Design & Integration | Claude 3.0 Haiku | Final architecture recommendations |

### **NoSQL Database Onboarding - 7 Agents**
| **Agent** | **Specialization** | **Model** | **Purpose** |
|-----------|-------------------|-----------|-------------|
| NoSQL Workload Analyzer | NoSQL Workload Pattern Analysis | Claude 3.0 Haiku | Document/Key-Value/Graph pattern analysis |
| NoSQL Database Selector | Database Technology Selection | Claude 3.0 Haiku | DynamoDB, DocumentDB, Cassandra selection |
| Cache Strategy Specialist | Caching Architecture & Strategy | Claude 3.0 Haiku | Redis, Memcached, in-memory strategies |
| NoSQL Cost Optimizer | Cost Analysis & Optimization | Claude 3.0 Haiku | NoSQL cost optimization, capacity planning |
| NoSQL Security Analyst | Security & Compliance | Claude 3.0 Haiku | NoSQL security patterns, encryption |
| NoSQL Performance Engineer | Performance Optimization | Claude 3.0 Haiku | Throughput, latency, scaling patterns |
| NoSQL Architecture Synthesizer | Architecture Integration | Claude 3.0 Haiku | Final NoSQL architecture design |

### **AWS Agent Core (Incident Response) - 5 Agents**
| **Agent** | **Specialization** | **Model** | **Purpose** |
|-----------|-------------------|-----------|-------------|
| Incident Detection Agent | Incident Detection & Classification | Claude 3.0 Haiku | P0-P4 severity classification, impact assessment |
| Root Cause Analysis Agent | Automated Root Cause Analysis | Claude 3.0 Haiku | RCA automation, failure pattern analysis |
| Automated Remediation Agent | Incident Remediation & Recovery | Claude 3.0 Haiku | Automated fix generation, recovery validation |
| Communication Agent | Incident Communication & Stakeholder Management | Claude 3.0 Haiku | Stakeholder notifications, status updates |
| Post-Incident Analysis Agent | Post-Mortem & Learning | Claude 3.0 Haiku | Post-incident analysis, prevention strategies |

## 🔧 **Model Distribution Strategy**

### **Claude 3.0 Sonnet (Bot Core Service)**
- **Use Case**: Complex analysis requiring deep reasoning
- **Endpoints**: Container diagnostics, NLP queries, performance analysis
- **Characteristics**: Higher token limit, better reasoning, slower response
- **Cost**: Higher per request

### **Claude 3.0 Haiku (MCP Server)**
- **Use Case**: Fast analysis, multi-agent orchestration
- **Endpoints**: Database analysis, multi-agent systems
- **Characteristics**: Faster response, lower cost, good for parallel execution
- **Cost**: Lower per request, optimized for high-volume

## 🔧 **Detailed Endpoint Analysis**

### **MCP Server AI Endpoints (Port 5001)**

#### **Core AI Analysis**
- **`POST /ai/analyze-database`**
  - **Purpose**: Analyze database requirements using AWS Bedrock Claude AI
  - **Model**: `anthropic.claude-3-haiku-20240307-v1:0`
  - **Input**: Database requirements (scenario, team, application, requirements)
  - **Output**: AI recommendations with confidence scores, cost analysis, alternatives
  - **Used By**: Database provisioning workflows, DBA approval dashboards

#### **Bedrock Management**
- **`GET /ai/bedrock/test`**
  - **Purpose**: Test AWS Bedrock connection and model availability
  - **Model**: Claude 3.0 Haiku
  - **Output**: Connection status, model info, test response
  - **Used By**: Health checks, configuration validation

- **`GET /ai/bedrock/status`**
  - **Purpose**: Get comprehensive Bedrock configuration status
  - **Output**: Configuration details, model ID, region, status
  - **Used By**: Admin dashboards, troubleshooting

- **`GET /aws-credentials-status`**
  - **Purpose**: Check if AWS Bedrock credentials are properly configured
  - **Output**: Credential availability, setup guidance
  - **Used By**: Setup validation, error handling

#### **Multi-Agent Systems**
- **`POST /strands/analyze`**
  - **Purpose**: AWS Strands multi-agent SQL database provisioning analysis
  - **Agents**: 7 specialized agents (Workload, Cost, Security, Performance, Architecture, etc.)
  - **Model**: Claude 3.0 Haiku (via BedrockClaudeClient)
  - **Execution Time**: ~30-60 seconds for complete analysis
  - **Output**: Comprehensive database recommendations with multi-agent insights

- **`POST /nosql/analyze`**
  - **Purpose**: NoSQL database onboarding with multi-agent analysis
  - **Agents**: 7 specialized agents (Workload, Database Selector, Cache Strategy, Cost, Security, Performance, Architecture)
  - **Model**: Claude 3.0 Haiku (via BedrockClaudeClient)
  - **Output**: NoSQL database recommendations (DynamoDB, DocumentDB, etc.)

- **`POST /agentcore/analyze`**
  - **Purpose**: AWS Agent Core incident response and automated remediation
  - **Agents**: Multiple incident response agents
  - **Model**: Claude 3.0 Haiku (via BedrockClaudeClient)
  - **Output**: Incident analysis and remediation recommendations

### **Bot Core AI Endpoints (Port 6000)**

#### **Container Intelligence**
- **`POST /diagnose`**
  - **Purpose**: AI-powered container diagnostics and issue identification
  - **Model**: `anthropic.claude-3-sonnet-20240229-v1:0`
  - **Input**: Container name
  - **Process**: Fetches logs/status → Builds diagnostic prompt → Claude analysis
  - **Output**: Diagnostic analysis and recommendations

- **`POST /fix/preview`**
  - **Purpose**: Generate fix plan preview without execution
  - **Model**: Claude 3.0 Sonnet
  - **Output**: Detailed fix plan with steps and commands

- **`POST /fix/execute`**
  - **Purpose**: Execute AI-generated container fixes (requires confirmation)
  - **Model**: Claude 3.0 Sonnet
  - **Safety**: Requires explicit confirmation flag
  - **Output**: Executed commands and results

#### **Query Intelligence**
- **`POST /nlp-query`**
  - **Purpose**: Convert natural language to SQL queries across multiple databases
  - **Model**: Claude 3.0 Sonnet
  - **Databases**: PostgreSQL, MySQL, SQLite
  - **Output**: Generated SQL queries and execution results

- **`POST /analyze-performance`**
  - **Purpose**: AI-powered database query performance analysis
  - **Model**: Claude 3.0 Sonnet
  - **Input**: SQL queries from multiple databases
  - **Output**: Performance insights, optimization recommendations

#### **Data Privacy**
- **`POST /desensitize-data`**
  - **Purpose**: AI-powered data desensitization for privacy compliance
  - **Model**: Claude 3.0 Sonnet
  - **Contexts**: General, financial, education, healthcare
  - **Output**: Desensitized datasets maintaining utility

#### **Infrastructure AI Assistant**
- **`POST /infrastructure-ai`**
  - **Purpose**: Dedicated infrastructure AI assistant with context awareness
  - **Model**: Claude 3.0 Sonnet
  - **Contexts**: Executive, inventory, cost, chargeback, optimization
  - **Integration**: Enhanced with MCP data for comprehensive responses
  - **Used By**: AIAssistant component across multiple frontend pages

### **AWS Inventory Service AI Integration (Port 5002)**

- **`POST /chat`**
  - **Purpose**: Natural language queries about AWS inventory and costs
  - **Model**: Claude (via MCP server integration)
  - **Input**: Natural language queries about infrastructure
  - **Output**: Structured responses about AWS resources and costs

## 🌐 **Frontend Integration Points**

### **Pages Using AI Endpoints**
| **Page** | **Endpoints Used** | **Purpose** |
|----------|-------------------|-------------|
| `StrandsDemo.tsx` | `/strands/analyze` | SQL database provisioning demo |
| `NoSQLDemo.tsx` | `/nosql/analyze` | NoSQL database onboarding demo |
| `AgentCoreDemo.tsx` | `/agentcore/analyze` | Incident response demo |
| `AIDiagnostics.tsx` | `/diagnose`, `/fix/preview`, `/fix/execute` | Container diagnostics |
| `NLPQuery.tsx` | `/nlp-query` | Natural language database queries |
| `QueryPerformance.tsx` | `/analyze-performance` | Database performance analysis |
| `DataDesensitization.tsx` | `/desensitize-data` | Data privacy compliance |
| Multiple Pages | `/infrastructure-ai` | AI assistant integration |

### **API Service Methods (src/services/api.ts)**
| **Method** | **Target Endpoint** | **Service** |
|------------|-------------------|-------------|
| `diagnoseContainer()` | `/diagnose` | Bot Core |
| `getFixPreview()` | `/fix/preview` | Bot Core |
| `executeContainerFix()` | `/fix/execute` | Bot Core |
| `executeNlpQuery()` | `/nlp-query` | Bot Core |
| `analyzeQueryPerformance()` | `/analyze-performance` | Bot Core |
| `desensitizeData()` | `/desensitize-data` | Bot Core |
| `strandsAnalyzeRequest()` | `/strands/analyze` | MCP Server |
| `nosqlAnalyzeRequest()` | `/nosql/analyze` | MCP Server |
| `agentcoreAnalyzeIncident()` | `/agentcore/analyze` | MCP Server |
| `checkAWSCredentials()` | `/aws-credentials-status` | MCP Server |

## 📊 **Performance & Usage Statistics**

- **Total AI Endpoints**: 15 endpoints across 3 services
- **Total Specialized Agents**: 19 agents across 3 multi-agent systems
- **Claude Models**: 2 different models (Sonnet for complex tasks, Haiku for fast analysis)
- **Frontend Integration**: 10+ pages with AI functionality
- **Multi-Agent Execution Time**: 30-60 seconds for comprehensive analysis
- **Single Agent Response**: 1-3 seconds typical response time

## 🔐 **Configuration & Security**

### **AWS Bedrock Configuration**
- **Region**: `us-east-1` (default)
- **Service**: `bedrock-runtime`
- **Authentication**: AWS credentials via environment variables
- **Models**: 
  - `anthropic.claude-3-sonnet-20240229-v1:0`
  - `anthropic.claude-3-haiku-20240307-v1:0`

### **Environment Variables (.env)**
```bash
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_SESSION_TOKEN=your-session-token-here-if-using-temporary-credentials
AWS_REGION=us-east-1
```

### **Security Features**
- **AWS IAM**: Proper role-based access for Bedrock
- **Environment Variables**: Secure credential management
- **Error Handling**: Graceful fallbacks when AI services unavailable
- **Logging**: Comprehensive logging for AI interactions
- **Rate Limiting**: Built into AWS Bedrock service

## 🚀 **Performance Characteristics**

- **Single Agent**: 1-3 seconds response time
- **Multi-Agent**: 30-60 seconds for comprehensive analysis
- **Parallel Processing**: Agents run concurrently for efficiency
- **Caching**: Results cached where appropriate
- **Fallback**: Fast fallback responses when AI unavailable

## 🔄 **AI Integration Architecture**

### **Model Distribution**
- **Claude 3.0 Sonnet**: Bot Core service (container diagnostics, NLP, performance analysis)
- **Claude 3.0 Haiku**: MCP Server (database analysis, multi-agent systems)
- **Integration**: Services communicate via HTTP APIs and MCP protocol

### **Multi-Agent Orchestration**
- **Strands System**: 7 agents for SQL database provisioning
- **NoSQL System**: 7 agents for NoSQL database selection
- **Agent Core**: 5 agents for incident response
- **Parallel Execution**: Agents run in parallel for faster analysis
- **Confidence Scoring**: Each agent provides confidence scores for recommendations

This comprehensive AI infrastructure provides intelligent automation across container management, database provisioning, cost optimization, and incident response workflows with 15 active endpoints powered by Claude AI models.