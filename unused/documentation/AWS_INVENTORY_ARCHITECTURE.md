# AWS Inventory AI System Architecture

## System Overview

The AWS Inventory AI system is a comprehensive database inventory management platform that combines real-time AWS data collection, AI-powered analysis, and interactive chat interfaces to provide actionable insights for infrastructure teams.

## Architecture Diagram

```mermaid
graph TB
    %% User Interface Layer
    subgraph "Frontend - React UI (Port 3000/8080)"
        UI[AWS Inventory Page]
        Chat[AI Chat Interface]
        Demo[Demo Query Cards]
        Overview[Resource Overview]
        Resources[Resource List]
    end

    %% API Gateway Layer
    subgraph "API Services"
        BotCore[Bot Core API<br/>Port 6000]
        AWSService[AWS Inventory Service<br/>Port 5002]
        MCPServer[MCP Server<br/>Port 5001]
    end

    %% AI Processing Layer
    subgraph "AI Analysis Engine"
        Claude[Claude AI API]
        InfraHandler[Infrastructure AI Handler]
        MCPClient[MCP Client]
    end

    %% Data Sources
    subgraph "AWS Data Sources"
        EC2API[AWS EC2 API]
        RDSAPI[AWS RDS API]
        S3API[AWS S3 API]
        CostAPI[AWS Cost Explorer API]
    end

    %% Data Storage
    subgraph "Data Layer"
        SyntheticGen[Synthetic Data Generator]
        DataCache[In-Memory Cache]
        RealData[Real AWS Data]
    end

    %% Database Systems
    subgraph "Database Infrastructure"
        PostgresDB[(PostgreSQL<br/>Port 5432)]
        MySQLDB[(MySQL<br/>Port 3306)]
        SQLiteDB[(SQLite)]
    end

    %% User Interactions
    UI --> Chat
    UI --> Demo
    UI --> Overview
    UI --> Resources

    %% Frontend to Backend Communication
    Chat -->|POST /infrastructure-ai| BotCore
    UI -->|GET /api/v1/inventory/*| AWSService
    Demo -->|Populate Query| Chat

    %% Backend Processing Flow
    BotCore --> InfraHandler
    InfraHandler --> Claude
    InfraHandler --> MCPClient
    MCPClient --> MCPServer

    %% Data Collection Flow
    AWSService --> EC2API
    AWSService --> RDSAPI
    AWSService --> S3API
    AWSService --> CostAPI
    AWSService --> SyntheticGen

    %% Data Processing
    EC2API --> RealData
    RDSAPI --> RealData
    S3API --> RealData
    SyntheticGen --> DataCache
    RealData --> DataCache

    %% Database Connections
    MCPServer --> PostgresDB
    MCPServer --> MySQLDB
    MCPServer --> SQLiteDB

    %% Response Flow
    Claude -->|AI Analysis| InfraHandler
    InfraHandler -->|Structured Response| BotCore
    BotCore -->|JSON Response| Chat
    DataCache -->|Resource Data| UI

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef ai fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef aws fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef data fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef db fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class UI,Chat,Demo,Overview,Resources frontend
    class BotCore,AWSService,MCPServer api
    class Claude,InfraHandler,MCPClient ai
    class EC2API,RDSAPI,S3API,CostAPI aws
    class SyntheticGen,DataCache,RealData data
    class PostgresDB,MySQLDB,SQLiteDB db
```

## Component Details

### 1. Frontend Layer (React + TypeScript)
- **AWS Inventory Page**: Main interface with tabs (Overview, Resources, AI Chat)
- **AI Chat Interface**: Large chat area with textarea input and message history
- **Demo Query Cards**: Pre-built database-focused queries for quick access
- **Resource Views**: Tables and summaries of AWS resources

### 2. API Services Layer
- **Bot Core API (Port 6000)**: Handles AI chat requests and Claude integration
- **AWS Inventory Service (Port 5002)**: Fetches and processes AWS resource data
- **MCP Server (Port 5001)**: Model Context Protocol server for database operations

### 3. AI Analysis Engine
- **Claude AI**: Provides intelligent analysis of infrastructure data
- **Infrastructure AI Handler**: Processes queries and formats responses
- **MCP Client**: Interfaces with database tools and utilities

### 4. Data Flow

#### Query Processing Flow:
1. User types query in chat interface
2. Frontend sends POST to `/infrastructure-ai` endpoint
3. Bot Core processes query with context data
4. Infrastructure AI Handler enriches query with AWS resource data
5. Claude AI analyzes data and generates insights
6. Response flows back through the chain to the UI

#### Data Collection Flow:
1. AWS Inventory Service calls AWS APIs (EC2, RDS, S3, Cost Explorer)
2. Real data is processed and cached
3. Synthetic data generator creates realistic demo data when APIs unavailable
4. Combined data is served to frontend for display

### 5. Database Integration
- **PostgreSQL**: Primary database for complex queries
- **MySQL**: Secondary database for compatibility testing
- **SQLite**: Lightweight database for development

## Key Features

### Database-Focused Analysis
- **Engine Analysis**: MySQL, PostgreSQL, Oracle, SQL Server, MariaDB
- **Version Compliance**: Identifies outdated database versions
- **Security Assessment**: Encryption, public access, Multi-AZ configuration
- **Cost Optimization**: Reserved Instance opportunities, right-sizing
- **Performance Analysis**: Instance classes, storage types, IOPS configuration

### AI-Powered Insights
- **Natural Language Queries**: Plain English database questions
- **Contextual Analysis**: Considers environment, team, application context
- **Actionable Recommendations**: Specific steps for optimization
- **Compliance Reporting**: Security and best practice adherence

### Real-time Data
- **Live AWS Integration**: Fetches current resource states
- **Cost Analysis**: Monthly cost breakdowns and trends
- **Resource Relationships**: Application and team mappings
- **Multi-region Support**: Cross-region resource visibility

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building

### Backend
- **FastAPI** (Python) for REST APIs
- **Claude AI** integration for analysis
- **AWS SDK** for resource data collection

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **Multi-database** support (PostgreSQL, MySQL, SQLite)

## Security & Compliance

### Data Protection
- **No persistent storage** of sensitive AWS data
- **In-memory caching** for performance
- **Synthetic data** for demo environments

### Access Control
- **API-based architecture** for controlled access
- **Environment separation** (production, staging, development)
- **Audit logging** for compliance tracking

## Scalability

### Horizontal Scaling
- **Microservices architecture** allows independent scaling
- **Stateless APIs** for load balancing
- **Container-based deployment** for easy scaling

### Performance Optimization
- **Data caching** reduces API calls
- **Async processing** for large datasets
- **Efficient data structures** for fast queries

This architecture provides a robust, scalable platform for database inventory management with AI-powered insights and real-time AWS integration.