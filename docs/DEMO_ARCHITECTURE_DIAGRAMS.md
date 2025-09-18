# Demo Architecture Diagrams

This document contains comprehensive architecture diagrams for all three AI-powered demo flows in the SRE GenAI platform.

## 1. AWS Strands SQL Database Provisioning Flow

### High-Level Architecture
```mermaid
graph TB
    subgraph "Frontend (React)"
        UI[User Interface]
        FORM[Requirements Form]
        PROGRESS[Progress Tracker]
        APPROVAL[Human Approval]
        RESULTS[Results Display]
        TERRAFORM[Terraform Template]
    end
    
    subgraph "Backend API (FastAPI)"
        ENDPOINT[/strands/analyze]
        ORCHESTRATOR[Strands Orchestrator]
        APPROVAL_EP[/strands/approve]
        TF_GEN[Terraform Generator]
    end
    
    subgraph "AI Agents (5 Agents)"
        WA[Workload Analyzer]
        CA[Cost Analyzer]
        SA[Security Analyst]
        PA[Performance Engineer]
        AA[Architecture Specialist]
    end
    
    subgraph "AWS Bedrock"
        CLAUDE[Claude 3.5 Haiku]
    end
    
    subgraph "Generated Infrastructure"
        RDS[RDS/Aurora Cluster]
        KMS[KMS Encryption]
        SG[Security Groups]
        IAM[IAM Roles]
        CW[CloudWatch Monitoring]
    end
    
    UI --> FORM
    FORM --> ENDPOINT
    ENDPOINT --> ORCHESTRATOR
    
    ORCHESTRATOR --> WA
    ORCHESTRATOR --> CA
    ORCHESTRATOR --> SA
    ORCHESTRATOR --> PA
    ORCHESTRATOR --> AA
    
    WA --> CLAUDE
    CA --> CLAUDE
    SA --> CLAUDE
    PA --> CLAUDE
    AA --> CLAUDE
    
    ORCHESTRATOR --> PROGRESS
    PROGRESS --> APPROVAL
    APPROVAL --> APPROVAL_EP
    APPROVAL_EP --> TF_GEN
    TF_GEN --> RESULTS
    RESULTS --> TERRAFORM
    
    TERRAFORM -.-> RDS
    TERRAFORM -.-> KMS
    TERRAFORM -.-> SG
    TERRAFORM -.-> IAM
    TERRAFORM -.-> CW
```

### Detailed Agent Workflow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Orchestrator
    participant WA as Workload Agent
    participant CA as Cost Agent
    participant SA as Security Agent
    participant PA as Performance Agent
    participant AA as Architecture Agent
    participant Claude as AWS Bedrock
    participant TF as Terraform Gen
    
    User->>Frontend: Fill Requirements Form
    Frontend->>API: POST /strands/analyze
    API->>Orchestrator: Start Multi-Agent Analysis
    
    Note over Orchestrator: Phase 1: Workload Analysis
    Orchestrator->>WA: Analyze workload requirements
    WA->>Claude: AI Analysis Request
    Claude-->>WA: Workload recommendations
    WA-->>Orchestrator: Workload analysis result
    
    Note over Orchestrator: Phase 2: Parallel Analysis
    par Parallel Execution
        Orchestrator->>CA: Cost analysis with context
        CA->>Claude: Cost optimization request
        Claude-->>CA: Cost recommendations
        CA-->>Orchestrator: Cost analysis result
    and
        Orchestrator->>SA: Security analysis with context
        SA->>Claude: Security assessment request
        Claude-->>SA: Security recommendations
        SA-->>Orchestrator: Security analysis result
    and
        Orchestrator->>PA: Performance analysis with context
        PA->>Claude: Performance optimization request
        Claude-->>PA: Performance recommendations
        PA-->>Orchestrator: Performance analysis result
    end
    
    Note over Orchestrator: Phase 3: Architecture Synthesis
    Orchestrator->>AA: Architecture design with full context
    AA->>Claude: Architecture synthesis request
    Claude-->>AA: Complete architecture design
    AA-->>Orchestrator: Architecture analysis result
    
    Orchestrator-->>API: Complete analysis results
    API-->>Frontend: Analysis steps + recommendation
    Frontend-->>User: Display results + approval request
    
    User->>Frontend: Approve recommendation
    Frontend->>API: POST /strands/approve/{session_id}
    API->>TF: Generate Terraform template
    TF-->>API: Production-ready Terraform
    API-->>Frontend: Provisioning result + Terraform
    Frontend-->>User: Display Terraform template
```

## 2. NoSQL Database Onboarding Flow

### High-Level Architecture
```mermaid
graph TB
    subgraph "Frontend (React)"
        UI2[User Interface]
        SCENARIOS[Scenario Selector]
        FORM2[Requirements Form]
        PROGRESS2[Progress Tracker]
        APPROVAL2[Human Approval]
        RESULTS2[Results Display]
        TERRAFORM2[Terraform Template]
    end
    
    subgraph "Backend API (FastAPI)"
        ENDPOINT2[/nosql/analyze]
        ORCHESTRATOR2[NoSQL Orchestrator]
        APPROVAL_EP2[/nosql/approve]
        TF_GEN2[NoSQL Terraform Generator]
    end
    
    subgraph "AI Agents (7 Agents)"
        WA2[Workload Analyzer]
        DS[Database Selector]
        CS[Cache Strategy]
        CO[Cost Optimizer]
        SC[Security & Compliance]
        PE[Performance Engineer]
        AS[Architecture Specialist]
    end
    
    subgraph "AWS Bedrock"
        CLAUDE2[Claude 3.5 Haiku]
    end
    
    subgraph "Generated NoSQL Stack"
        DYNAMO[DynamoDB Tables]
        REDIS[ElastiCache Redis]
        DOCDB[DocumentDB]
        KMS2[KMS Encryption]
        IAM2[IAM Roles & Policies]
        CW2[CloudWatch Logs]
    end
    
    UI2 --> SCENARIOS
    SCENARIOS --> FORM2
    FORM2 --> ENDPOINT2
    ENDPOINT2 --> ORCHESTRATOR2
    
    ORCHESTRATOR2 --> WA2
    ORCHESTRATOR2 --> DS
    ORCHESTRATOR2 --> CS
    ORCHESTRATOR2 --> CO
    ORCHESTRATOR2 --> SC
    ORCHESTRATOR2 --> PE
    ORCHESTRATOR2 --> AS
    
    WA2 --> CLAUDE2
    DS --> CLAUDE2
    CS --> CLAUDE2
    CO --> CLAUDE2
    SC --> CLAUDE2
    PE --> CLAUDE2
    AS --> CLAUDE2
    
    ORCHESTRATOR2 --> PROGRESS2
    PROGRESS2 --> APPROVAL2
    APPROVAL2 --> APPROVAL_EP2
    APPROVAL_EP2 --> TF_GEN2
    TF_GEN2 --> RESULTS2
    RESULTS2 --> TERRAFORM2
    
    TERRAFORM2 -.-> DYNAMO
    TERRAFORM2 -.-> REDIS
    TERRAFORM2 -.-> DOCDB
    TERRAFORM2 -.-> KMS2
    TERRAFORM2 -.-> IAM2
    TERRAFORM2 -.-> CW2
```

### NoSQL Specialized Flows
```mermaid
graph LR
    subgraph "Scenario Types"
        ECOM[🛒 E-commerce<br/>Multi-Database]
        DOC[📄 Document Store<br/>NoSQL Focus]
        MEM[⚡ In-Memory<br/>Ultra-Fast Cache]
        GAME[🎮 Gaming<br/>Real-time]
        IOT[📡 IoT Platform<br/>Time-series]
        SOCIAL[👥 Social Media<br/>Graph + Content]
    end
    
    subgraph "Database Recommendations"
        DYNAMO_REC[DynamoDB + Redis]
        DOCDB_REC[DocumentDB + ElastiCache]
        REDIS_REC[MemoryDB + DAX]
        TIMESTREAM[Timestream + DynamoDB]
        NEPTUNE[Neptune + ElastiCache]
    end
    
    subgraph "Terraform Templates"
        DYNAMO_TF[DynamoDB Stack Template]
        DOCDB_TF[DocumentDB Stack Template]
        MEMORY_TF[In-Memory Stack Template]
        TIMESERIES_TF[Time-series Stack Template]
        GRAPH_TF[Graph Database Template]
    end
    
    ECOM --> DYNAMO_REC --> DYNAMO_TF
    DOC --> DOCDB_REC --> DOCDB_TF
    MEM --> REDIS_REC --> MEMORY_TF
    GAME --> REDIS_REC --> MEMORY_TF
    IOT --> TIMESTREAM --> TIMESERIES_TF
    SOCIAL --> NEPTUNE --> GRAPH_TF
```

### NoSQL Agent Execution Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Orchestrator
    participant WA as Workload Agent
    participant DS as Database Selector
    participant CS as Cache Strategy
    participant CO as Cost Optimizer
    participant SC as Security Agent
    participant PE as Performance Agent
    participant AS as Architecture Agent
    participant Claude as AWS Bedrock
    participant TF as NoSQL Terraform Gen
    
    User->>Frontend: Select scenario + requirements
    Frontend->>API: POST /nosql/analyze
    API->>Orchestrator: Start 7-agent analysis
    
    Note over Orchestrator: Phase 1: Workload Analysis
    Orchestrator->>WA: Analyze NoSQL workload patterns
    WA->>Claude: NoSQL workload analysis
    Claude-->>WA: Workload type + data model
    WA-->>Orchestrator: Workload analysis result
    
    Note over Orchestrator: Phase 2: Database & Cache Selection
    par Parallel Database Selection
        Orchestrator->>DS: Select optimal NoSQL database
        DS->>Claude: Database selection analysis
        Claude-->>DS: Database recommendations
        DS-->>Orchestrator: Database selection result
    and
        Orchestrator->>CS: Design caching strategy
        CS->>Claude: Cache strategy analysis
        Claude-->>CS: Cache recommendations
        CS-->>Orchestrator: Cache strategy result
    end
    
    Note over Orchestrator: Phase 3: Multi-Agent Analysis
    par Parallel Optimization
        Orchestrator->>CO: Cost optimization analysis
        CO->>Claude: Cost analysis request
        Claude-->>CO: Cost recommendations
        CO-->>Orchestrator: Cost analysis result
    and
        Orchestrator->>SC: Security & compliance analysis
        SC->>Claude: Security assessment
        Claude-->>SC: Security recommendations
        SC-->>Orchestrator: Security analysis result
    and
        Orchestrator->>PE: Performance engineering
        PE->>Claude: Performance optimization
        Claude-->>PE: Performance recommendations
        PE-->>Orchestrator: Performance analysis result
    end
    
    Note over Orchestrator: Phase 4: Architecture Synthesis
    Orchestrator->>AS: Complete architecture design
    AS->>Claude: Architecture synthesis with full context
    Claude-->>AS: Complete NoSQL architecture
    AS-->>Orchestrator: Architecture analysis result
    
    Orchestrator-->>API: Complete 7-agent analysis
    API-->>Frontend: Analysis steps + recommendation
    Frontend-->>User: Display results + approval
    
    User->>Frontend: Approve NoSQL recommendation
    Frontend->>API: POST /nosql/approve/{session_id}
    API->>TF: Generate NoSQL Terraform stack
    TF-->>API: DynamoDB + Redis + IAM template
    API-->>Frontend: Provisioning + Terraform
    Frontend-->>User: Display NoSQL Terraform template
```

## 3. AWS Agent Core Incident Response Flow

### High-Level Architecture
```mermaid
graph TB
    subgraph "Frontend (React)"
        UI3[Incident Reporting UI]
        SCENARIOS3[Incident Scenarios]
        FORM3[Incident Details Form]
        PROGRESS3[Agent Execution Tracker]
        APPROVAL3[Execution Approval]
        RESULTS3[Response Plan Display]
    end
    
    subgraph "Backend API (FastAPI)"
        ENDPOINT3[/agentcore/analyze]
        ORCHESTRATOR3[Agent Core Orchestrator]
        EXECUTE_EP[/agentcore/execute]
    end
    
    subgraph "AI Agents (5 Agents)"
        IDA[Incident Detection Agent]
        RCA[Root Cause Analysis Agent]
        ARA[Automated Remediation Agent]
        COM[Communication Agent]
        PIA[Post-Incident Analysis Agent]
    end
    
    subgraph "AWS Bedrock"
        CLAUDE3[Claude 3.5 Haiku]
    end
    
    subgraph "Incident Response Actions"
        DETECT[Incident Classification]
        ANALYZE[Root Cause Analysis]
        REMEDIATE[Automated Remediation]
        COMMUNICATE[Stakeholder Notification]
        IMPROVE[Improvement Recommendations]
    end
    
    UI3 --> SCENARIOS3
    SCENARIOS3 --> FORM3
    FORM3 --> ENDPOINT3
    ENDPOINT3 --> ORCHESTRATOR3
    
    ORCHESTRATOR3 --> IDA
    ORCHESTRATOR3 --> RCA
    ORCHESTRATOR3 --> ARA
    ORCHESTRATOR3 --> COM
    ORCHESTRATOR3 --> PIA
    
    IDA --> CLAUDE3
    RCA --> CLAUDE3
    ARA --> CLAUDE3
    COM --> CLAUDE3
    PIA --> CLAUDE3
    
    ORCHESTRATOR3 --> PROGRESS3
    PROGRESS3 --> APPROVAL3
    APPROVAL3 --> EXECUTE_EP
    EXECUTE_EP --> RESULTS3
    
    IDA --> DETECT
    RCA --> ANALYZE
    ARA --> REMEDIATE
    COM --> COMMUNICATE
    PIA --> IMPROVE
```

### Agent Core Incident Response Workflow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Orchestrator
    participant IDA as Incident Detection
    participant RCA as Root Cause Analysis
    participant COM as Communication
    participant ARA as Automated Remediation
    participant PIA as Post-Incident Analysis
    participant Claude as AWS Bedrock
    participant Systems as Target Systems
    
    User->>Frontend: Report incident details
    Frontend->>API: POST /agentcore/analyze
    API->>Orchestrator: Start incident response
    
    Note over Orchestrator: Phase 1: Incident Detection & Classification
    Orchestrator->>IDA: Classify incident severity & impact
    IDA->>Claude: Incident classification analysis
    Claude-->>IDA: Severity, category, impact assessment
    IDA-->>Orchestrator: Incident classification result
    
    Note over Orchestrator: Phase 2: Root Cause Analysis & Communication
    par Parallel Analysis
        Orchestrator->>RCA: Perform root cause analysis
        RCA->>Claude: RCA with logs and metrics
        Claude-->>RCA: Root cause identification
        RCA-->>Orchestrator: Root cause analysis result
    and
        Orchestrator->>COM: Setup communication plan
        COM->>Claude: Communication strategy analysis
        Claude-->>COM: Stakeholder notification plan
        COM-->>Orchestrator: Communication plan result
    end
    
    Note over Orchestrator: Phase 3: Automated Remediation Planning
    Orchestrator->>ARA: Generate remediation workflow
    ARA->>Claude: Remediation planning with full context
    Claude-->>ARA: Automated remediation actions
    ARA-->>Orchestrator: Remediation plan result
    
    Note over Orchestrator: Phase 4: Post-Incident Analysis
    Orchestrator->>PIA: Analyze incident for improvements
    PIA->>Claude: Post-incident analysis
    Claude-->>PIA: Improvement recommendations
    PIA-->>Orchestrator: Post-incident analysis result
    
    Orchestrator-->>API: Complete incident response plan
    API-->>Frontend: Response plan + agent results
    Frontend-->>User: Display response plan + approval request
    
    User->>Frontend: Approve automated remediation
    Frontend->>API: POST /agentcore/execute/{session_id}
    API->>Systems: Execute remediation workflow
    Systems-->>API: Execution status
    API-->>Frontend: Execution results
    Frontend-->>User: Display remediation status
```

### Incident Response Scenarios
```mermaid
graph LR
    subgraph "Incident Types"
        DB_OUT[🗄️ Database Outage<br/>P0 Critical]
        API_PERF[⚡ API Performance<br/>P1 High]
        INFRA[🏗️ Infrastructure<br/>P0 Critical]
    end
    
    subgraph "Detection Results"
        P0_CLASS[P0 Classification<br/>Immediate Escalation]
        P1_CLASS[P1 Classification<br/>High Priority]
        IMPACT[Impact Assessment<br/>User/Business Impact]
    end
    
    subgraph "Remediation Actions"
        AUTO_SCALE[Auto-scaling Triggers]
        RESTART[Service Restart]
        FAILOVER[Database Failover]
        TRAFFIC[Traffic Rerouting]
    end
    
    subgraph "Communication"
        INTERNAL[Internal Notifications<br/>Slack, Email, PagerDuty]
        EXTERNAL[External Communications<br/>Status Page, Customers]
        ESCALATION[Escalation Matrix<br/>Leadership, On-call]
    end
    
    DB_OUT --> P0_CLASS --> FAILOVER --> INTERNAL
    API_PERF --> P1_CLASS --> AUTO_SCALE --> INTERNAL
    INFRA --> P0_CLASS --> TRAFFIC --> EXTERNAL
    
    P0_CLASS --> ESCALATION
    P1_CLASS --> ESCALATION
```

## 4. Cross-Demo Architecture Integration

### Unified Platform Architecture
```mermaid
graph TB
    subgraph "Frontend Layer"
        HOME[Home Dashboard]
        STRANDS_UI[Strands Demo UI]
        NOSQL_UI[NoSQL Demo UI]
        AGENT_UI[Agent Core Demo UI]
        CREDS[AWS Credentials Check]
    end
    
    subgraph "API Gateway Layer"
        ROUTER[FastAPI Router]
        AUTH[Authentication]
        CORS[CORS Middleware]
        HEALTH[Health Checks]
    end
    
    subgraph "Orchestration Layer"
        STRANDS_ORCH[Strands Orchestrator<br/>5 Agents]
        NOSQL_ORCH[NoSQL Orchestrator<br/>7 Agents]
        AGENT_ORCH[Agent Core Orchestrator<br/>5 Agents]
    end
    
    subgraph "AI Integration Layer"
        BEDROCK_CLIENT[Bedrock Client]
        CLAUDE_API[Claude 3.5 Haiku API]
        FALLBACK[Fallback Logic]
        CONFIDENCE[Confidence Scoring]
    end
    
    subgraph "Infrastructure Generation"
        SQL_TF[SQL Terraform Generator]
        NOSQL_TF[NoSQL Terraform Generator]
        TEMPLATES[Template Library]
    end
    
    subgraph "Data Layer"
        SESSIONS[Session Storage]
        DEV_UPDATES[Development Updates]
        AGENT_RESULTS[Agent Results Cache]
    end
    
    HOME --> STRANDS_UI
    HOME --> NOSQL_UI
    HOME --> AGENT_UI
    
    STRANDS_UI --> ROUTER
    NOSQL_UI --> ROUTER
    AGENT_UI --> ROUTER
    CREDS --> ROUTER
    
    ROUTER --> AUTH
    ROUTER --> CORS
    ROUTER --> HEALTH
    
    ROUTER --> STRANDS_ORCH
    ROUTER --> NOSQL_ORCH
    ROUTER --> AGENT_ORCH
    
    STRANDS_ORCH --> BEDROCK_CLIENT
    NOSQL_ORCH --> BEDROCK_CLIENT
    AGENT_ORCH --> BEDROCK_CLIENT
    
    BEDROCK_CLIENT --> CLAUDE_API
    BEDROCK_CLIENT --> FALLBACK
    BEDROCK_CLIENT --> CONFIDENCE
    
    STRANDS_ORCH --> SQL_TF
    NOSQL_ORCH --> NOSQL_TF
    SQL_TF --> TEMPLATES
    NOSQL_TF --> TEMPLATES
    
    STRANDS_ORCH --> SESSIONS
    NOSQL_ORCH --> SESSIONS
    AGENT_ORCH --> SESSIONS
    
    SESSIONS --> DEV_UPDATES
    SESSIONS --> AGENT_RESULTS
```

### Technology Stack Overview
```mermaid
graph LR
    subgraph "Frontend Stack"
        REACT[React 18 + TypeScript]
        VITE[Vite Build Tool]
        TAILWIND[Tailwind CSS]
        ROUTER_LIB[React Router]
        AXIOS[Axios HTTP Client]
    end
    
    subgraph "Backend Stack"
        FASTAPI[FastAPI + Python]
        UVICORN[Uvicorn ASGI Server]
        PYDANTIC[Pydantic Models]
        ASYNCIO[Async/Await]
    end
    
    subgraph "AI/ML Stack"
        BEDROCK[AWS Bedrock]
        CLAUDE[Claude 3.5 Haiku]
        MCP[Model Context Protocol]
        BOTO3[Boto3 AWS SDK]
    end
    
    subgraph "Infrastructure Stack"
        DOCKER[Docker Containers]
        NGINX[Nginx Reverse Proxy]
        TERRAFORM[Terraform Templates]
        AWS[AWS Services]
    end
    
    subgraph "Development Stack"
        TYPESCRIPT[TypeScript]
        PYTHON[Python 3.10+]
        GIT[Git Version Control]
        KIRO[Kiro IDE Integration]
    end
    
    REACT --> FASTAPI
    FASTAPI --> BEDROCK
    BEDROCK --> CLAUDE
    FASTAPI --> TERRAFORM
    TERRAFORM --> AWS
    
    DOCKER --> NGINX
    NGINX --> FASTAPI
    NGINX --> REACT
```

## Key Architecture Principles

### 1. Multi-Agent Orchestration
- **Parallel Execution**: Agents run concurrently where possible for optimal performance
- **Context Sharing**: Agents share analysis results for informed decision-making
- **Dynamic Confidence**: AI-powered confidence scoring based on data quality

### 2. Human-in-the-Loop
- **Approval Gates**: Human approval required for high-risk actions
- **Transparency**: Full visibility into AI decision-making process
- **Override Capability**: Manual override options at critical decision points

### 3. Infrastructure-as-Code Generation
- **Production Ready**: Generated Terraform includes security, monitoring, and best practices
- **Customizable**: Templates adapt to specific requirements and constraints
- **Downloadable**: Users can copy or download templates for immediate use

### 4. Real-time Feedback
- **Live Progress**: Real-time agent execution tracking
- **Confidence Scoring**: Dynamic confidence levels based on analysis quality
- **Error Handling**: Graceful degradation with meaningful error messages

### 5. Scalable Architecture
- **Microservices**: Separate orchestrators for different use cases
- **Async Processing**: Non-blocking agent execution
- **Session Management**: Stateful workflows with session persistence
- **API-First**: RESTful APIs for all functionality

This architecture enables sophisticated AI-powered database and incident response workflows while maintaining human oversight and generating production-ready infrastructure code.