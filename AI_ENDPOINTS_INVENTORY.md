# AI Endpoints Inventory

This inventory captures every AI, Bedrock, and Claude endpoint exposed across the SRE GenAI Platform. It reflects the transition to the Unified Claude Service while preserving visibility into legacy services that are still in use.

## Unified AI Endpoints Architecture

### Consolidated Unified Claude Service
| Service | Endpoint | Method | Purpose | Model Strategy | Port | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Unified Claude | `/bedrockclaude` | POST | Primary entry point for all AI operations | Auto-selects Claude 3 Sonnet or Haiku by operation | 7000 | Production |
| Unified Claude | `/bedrockclaude/test` | GET | Validate Claude connectivity | Auto-selected | 7000 | Production |
| Unified Claude | `/bedrockclaude/status` | GET | Inspect service configuration | Auto-selected | 7000 | Production |
| Unified Claude | `/health` | GET | Health probe | N/A | 7000 | Production |

### Legacy Endpoints in Migration
| Service | Endpoint | Method | Purpose | Model | Port | Status |
| --- | --- | --- | --- | --- | --- | --- |
| MCP Server | `/ai/analyze-database` | POST | Database requirements assessment | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/ai/bedrock/test` | GET | Test AWS Bedrock connectivity | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/ai/bedrock/status` | GET | Review Bedrock configuration | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/aws-credentials-status` | GET | Validate AWS credential availability | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/strands/analyze` | POST | Multi-agent SQL provisioning (7 agents) | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/nosql/analyze` | POST | Multi-agent NoSQL onboarding (7 agents) | Claude 3 Haiku | 5001 | Migrating |
| MCP Server | `/agentcore/analyze` | POST | Incident response analysis (5 agents) | Claude 3 Haiku | 5001 | Migrating |
| Bot Core | `/diagnose` | POST | Container diagnostics | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/fix/preview` | POST | Generate fix plan without execution | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/fix/execute` | POST | Execute approved fixes | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/nlp-query` | POST | Natural language to SQL translation | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/infrastructure-ai` | POST | Infrastructure AI assistant | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/analyze-performance` | POST | Query performance review | Claude 3 Sonnet | 6000 | Migrating |
| Bot Core | `/desensitize-data` | POST | Data privacy desensitization | Claude 3 Sonnet | 6000 | Migrating |
| AWS Inventory | `/chat` | POST | Natural language inventory queries | Claude (via MCP) | 5002 | Active |

## Unified Claude Operations
The `/bedrockclaude` endpoint routes all operations through a single request contract:

```json
{
  "operation": "diagnose|analyze-database|nlp-query|strands-analyze|nosql-analyze|agentcore-analyze|fix-preview|fix-execute|analyze-performance|desensitize-data|infrastructure-ai|test",
  "prompt": "Describe the request context",
  "model": "sonnet|haiku (optional override)",
  "context": { "additional_context": "optional" },
  "max_tokens": 4000,
  "temperature": 0.1,
  "metadata": { "operation_metadata": "optional" }
}
```

### Automatic Model Selection
- **Claude 3 Sonnet**: Diagnose, fix-execute, nlp-query, analyze-performance, desensitize-data, infrastructure-ai
- **Claude 3 Haiku**: Analyze-database, strands-analyze, nosql-analyze, agentcore-analyze, test

## Multi-Agent Systems Breakdown

### AWS Strands SQL Provisioning (7 Agents)
| Agent | Specialization | Model | Purpose |
| --- | --- | --- | --- |
| Database Workload Analyzer | Workload pattern analysis | Claude 3 Haiku | Evaluates OLTP/OLAP patterns and concurrency requirements |
| Database Cost Optimizer | Cost modeling | Claude 3 Haiku | Provides cost breakdowns and reserved instance guidance |
| Database Security and Compliance | Security assessment | Claude 3 Haiku | Evaluates compliance with PCI-DSS, SOX, HIPAA |
| Database Performance Engineer | Performance tuning | Claude 3 Haiku | Recommends instance sizing and tuning strategies |
| Database Reliability Engineer | Availability planning | Claude 3 Haiku | Suggests multi-AZ, backup, and recovery strategies |
| Database Migration Specialist | Migration planning | Claude 3 Haiku | Plans migration paths and downtime mitigation |
| Database Architecture Synthesizer | Architecture integration | Claude 3 Haiku | Produces final architecture recommendations |

### NoSQL Onboarding (7 Agents)
| Agent | Specialization | Model | Purpose |
| --- | --- | --- | --- |
| NoSQL Workload Analyzer | Workload evaluation | Claude 3 Haiku | Reviews document, key-value, and graph access patterns |
| NoSQL Database Selector | Technology selection | Claude 3 Haiku | Compares DynamoDB, DocumentDB, Cassandra, and others |
| Cache Strategy Specialist | Caching architecture | Claude 3 Haiku | Recommends Redis, Memcached, and in-memory strategies |
| NoSQL Cost Optimizer | Cost optimization | Claude 3 Haiku | Provides capacity planning and pricing analysis |
| NoSQL Security Analyst | Security review | Claude 3 Haiku | Evaluates encryption and access controls |
| NoSQL Performance Engineer | Performance tuning | Claude 3 Haiku | Analyzes throughput and latency trade-offs |
| NoSQL Architecture Synthesizer | Architecture integration | Claude 3 Haiku | Delivers final onboarding recommendations |

### AWS Agent Core Incident Response (5 Agents)
| Agent | Specialization | Model | Purpose |
| --- | --- | --- | --- |
| Incident Detection Agent | Incident classification | Claude 3 Haiku | Assigns severity and analyzes impact |
| Root Cause Analysis Agent | Causal analysis | Claude 3 Haiku | Identifies likely failure mechanisms |
| Automated Remediation Agent | Remediation planning | Claude 3 Haiku | Generates fix playbooks and validation steps |
| Communication Agent | Stakeholder coordination | Claude 3 Haiku | Drafts updates and status communications |
| Post-Incident Analysis Agent | Learning and prevention | Claude 3 Haiku | Produces retrospectives and follow-up actions |

## Model Distribution Strategy

### Claude 3 Sonnet (Bot Core)
- Use cases: Deep diagnostics and reasoning-intensive tasks
- Characteristics: Higher token allowance and richer context handling
- Trade-off: Higher per-request cost and latency

### Claude 3 Haiku (MCP Server)
- Use cases: Fast, parallel multi-agent analysis
- Characteristics: Lower latency and cost, optimized for orchestration workloads

## Detailed Endpoint Analysis

### MCP Server AI Endpoints (Port 5001)

#### Core AI Analysis
- `POST /ai/analyze-database`
  - Purpose: Evaluate database requirements through AWS Bedrock Claude
  - Model: `anthropic.claude-3-haiku-20240307-v1:0`
  - Input: Scenario, team profile, workload requirements
  - Output: Recommendations with confidence scores and cost projections
  - Consumers: Database provisioning workflows and DBA dashboards

#### Bedrock Management
- `GET /ai/bedrock/test`
  - Purpose: Validate AWS Bedrock connectivity and model availability
  - Output: Connection status and model metadata
  - Consumers: Health checks and configuration diagnostics
- `GET /ai/bedrock/status`
  - Purpose: Provide comprehensive Bedrock configuration details
  - Output: Model identifiers, region, and configuration data
  - Consumers: Administrative tooling and troubleshooting
- `GET /aws-credentials-status`
  - Purpose: Verify AWS Bedrock credential readiness
  - Output: Credential state and remediation guidance
  - Consumers: Setup validation flows

#### Multi-Agent Systems
- `POST /strands/analyze`
  - Purpose: Execute the SQL provisioning agent collective
  - Composition: Seven specialized agents with aggregated reasoning
  - Model: Claude 3 Haiku via BedrockClaudeClient
  - Typical runtime: 30–60 seconds
- `POST /nosql/analyze`
  - Purpose: Execute the NoSQL onboarding agent collective
  - Composition: Seven specialized agents
  - Model: Claude 3 Haiku via BedrockClaudeClient
- `POST /agentcore/analyze`
  - Purpose: Run the incident response agents for AWS workloads
  - Composition: Five agents covering detection through retrospectives
  - Model: Claude 3 Haiku via BedrockClaudeClient

### Bot Core AI Endpoints (Port 6000)

#### Container Intelligence
- `POST /diagnose`
  - Purpose: Provide AI-powered container diagnostics
  - Model: `anthropic.claude-3-sonnet-20240229-v1:0`
  - Process: Collect logs and metrics → build prompt → analyze with Claude
  - Output: Probable cause assessment and remediation guidance
- `POST /fix/preview`
  - Purpose: Offer a remediation plan without executing commands
  - Model: Claude 3 Sonnet
  - Output: Ordered list of fixes with rationale
- `POST /fix/execute`
  - Purpose: Execute approved remediation steps
  - Model: Claude 3 Sonnet
  - Safeguards: Requires explicit confirmation flags

#### Query Intelligence
- `POST /nlp-query`
  - Purpose: Translate natural language questions into SQL
  - Model: Claude 3 Sonnet
  - Targets: PostgreSQL, MySQL, and SQLite
  - Output: SQL statements and execution summaries
- `POST /analyze-performance`
  - Purpose: Evaluate database query performance
  - Model: Claude 3 Sonnet
  - Output: Query diagnostics and tuning recommendations

#### Data Privacy
- `POST /desensitize-data`
  - Purpose: Apply AI-driven data desensitization
  - Model: Claude 3 Sonnet
  - Contexts: General, financial, education, healthcare
  - Output: Sanitized datasets with preserved utility

#### Infrastructure Assistant
- `POST /infrastructure-ai`
  - Purpose: Provide an AI assistant with contextual awareness
  - Model: Claude 3 Sonnet
  - Contexts: Executive briefings, inventory, cost management, chargeback, optimization
  - Integration: Used by the AIAssistant component across multiple frontend views

### AWS Inventory Service Integration (Port 5002)
- `POST /chat`
  - Purpose: Answer natural language questions about AWS inventory and cost
  - Model: Claude via MCP Server integration
  - Output: Structured responses summarizing resource posture and spending

## Frontend Integration Points

### Pages Using AI Endpoints
| Page | Endpoints | Purpose |
| --- | --- | --- |
| `StrandsDemo.tsx` | `/strands/analyze` | SQL database provisioning demo |
| `NoSQLDemo.tsx` | `/nosql/analyze` | NoSQL onboarding demo |
| `AgentCoreDemo.tsx` | `/agentcore/analyze` | Incident response demonstration |
| `AIDiagnostics.tsx` | `/diagnose`, `/fix/preview`, `/fix/execute` | Container diagnostics workflows |
| `NLPQuery.tsx` | `/nlp-query` | Natural language database queries |
| `QueryPerformance.tsx` | `/analyze-performance` | Database performance analysis |
| `DataDesensitization.tsx` | `/desensitize-data` | Data privacy compliance |
| Multiple pages | `/infrastructure-ai` | Embedded AI assistant |

### API Service Methods (`src/services/api.ts`)
| Method | Target Endpoint | Service |
| --- | --- | --- |
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

## Performance and Usage Summary
- Total AI endpoints: 15 across three services
- Specialized agents: 19 agents across three multi-agent systems
- Claude models utilized: Claude 3 Sonnet and Claude 3 Haiku
- Frontend touchpoints: More than ten pages with AI integrations
- Typical multi-agent runtime: 30–60 seconds
- Typical single-agent response: 1–3 seconds

## Configuration and Security Notes
- AWS Bedrock region: `us-east-1`
- Models: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-haiku-20240307-v1:0`
- Authentication: AWS credentials supplied via environment variables
- Security controls: IAM-based access, input validation, structured logging, AWS rate limiting

## Performance Characteristics
- Single-agent tasks return within a few seconds
- Multi-agent workloads execute in under one minute on average
- Agents can run in parallel to reduce wall-clock time
- Results are cached where feasible with safe fallbacks when AI services are unavailable

## Integration Architecture
- Claude 3 Sonnet powers reasoning-heavy Bot Core endpoints
- Claude 3 Haiku powers MCP Server orchestration endpoints
- Services interoperate through HTTP APIs and the MCP protocol layer

This document should be updated whenever new AI endpoints are introduced or when legacy endpoints are decommissioned during the migration to the Unified Claude Service.
