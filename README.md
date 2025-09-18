# SRE GenAI Platform

A comprehensive AI-powered Site Reliability Engineering platform with multi-agent systems, database provisioning, and infrastructure management capabilities using AWS Strands Agents and Model Context Protocol (MCP).

## 🚀 Quick Start

### Development Environment
```bash
# Start development environment (returns terminal control)
./dev-local.sh

# Stop all services
./stop-dev.sh
```

**What `./dev-local.sh` does:**
- ✅ Validates AWS credentials for AI features
- 🐳 Starts backend services in Docker containers
- 🔥 Starts frontend locally with hot reloading
- ⏳ Waits for all services to be ready
- 🎯 Returns terminal control while services run in background
- 💡 Frontend automatically updates when you make changes

### Access Points
- **Main UI**: http://localhost:3000 (development with hot reloading)
- **MCP Server**: http://localhost:5001
- **Bot Core API**: http://localhost:6000
- **AWS Inventory Service**: http://localhost:5002
- **Unified Claude Service**: http://localhost:7000

## 🏗️ Architecture

### Core Services
- **Liquid Glass UI** - Modern React frontend with glass morphism design
- **MCP Server** - Model Context Protocol server with database and container management
- **Bot Core** - AI diagnostics and NLP query processing
- **AWS Inventory Service** - Cloud resource management and cost analysis
- **Unified Claude Service** - Consolidated AI endpoints using AWS Bedrock

### Technology Stack

#### Frontend
- **React 18** with TypeScript for type safety
- **Vite** as build tool and dev server for fast development
- **Tailwind CSS** for styling with glass morphism design
- **React Router** for navigation
- **Axios** for API communication

#### Backend
- **FastAPI** (Python) for REST APIs
- **Docker** and Docker Compose for containerization
- **AWS Strands Agents** for model-driven AI agent orchestration
- **Model Context Protocol (MCP)** for AI tool integration

#### Databases
- **PostgreSQL** (primary database)
- **MySQL** (secondary database)  
- **SQLite** (lightweight database)

#### AI/ML Integration
- **AWS Bedrock** with Claude AI for diagnostics and analysis
- **AWS Strands SDK** for agent-based workflows
- **Model Context Protocol** for standardized AI tool access

### Multi-Agent Systems
- **AWS Strands Agents** - Model-driven approach with LLM reasoning
- **Database Management** - Multi-database query and analysis agents
- **Container Diagnostics** - AI-powered infrastructure monitoring
- **Cost Analysis** - Intelligent resource optimization recommendations

## 📚 Documentation

Essential documentation is located in the `/docs` folder:

- [AWS Bedrock Setup](docs/AWS_BEDROCK_SETUP.md) - Configure AI integration
- [AWS Strands Architecture](docs/AWS_STRANDS_ARCHITECTURE.md) - Multi-agent SQL provisioning
- [NoSQL Onboarding Demo](docs/NOSQL_ONBOARDING_DEMO.md) - NoSQL database selection
- [Agent Core Demo](docs/AWS_AGENT_CORE_DEMO.md) - Incident response system
- [Development Guide](docs/DEVELOPMENT.md) - Development setup and practices
- [Testing Guide](docs/TESTING_GUIDE.md) - Testing procedures and scripts
- [Troubleshooting](docs/DEV_LOCAL_TROUBLESHOOTING.md) - Common issues and solutions

## 🧪 Testing

### Test Scripts
```bash
# Test deployment setup
./test-deployment.sh

# Test backend connections
curl http://localhost:5001/health
curl http://localhost:6000/health
curl http://localhost:5002/health
curl http://localhost:7000/health
```

### Development Workflow
```bash
# Start development (returns terminal control)
./dev-local.sh

# Your terminal is now free for other commands
git status
npm run build
docker logs mcp_server

# Stop everything when done
./stop-dev.sh
```

## 🛠️ Key Features

### Infrastructure Management
- Real-time container monitoring and metrics
- AI-powered diagnostics and issue resolution
- Multi-database query performance analysis (PostgreSQL, MySQL, SQLite)
- Cost analysis and optimization recommendations

### AI-Powered Features
- **Container Diagnostics**: AI analysis of container health and performance
- **Database Query Optimization**: Performance analysis across multiple databases
- **Natural Language Queries**: Ask questions about your infrastructure in plain English
- **Cost Analysis**: AI-driven spending analysis and optimization recommendations
- **Architecture Visualization**: System component mapping and relationship diagrams

### Model Context Protocol (MCP) Integration
- Standardized database access across all database types
- Container management and monitoring tools
- Development update tracking and visibility
- Inventory management with natural language queries
- Cost analysis and reporting tools

## 🔧 Configuration

### AWS Credentials (For AI Features)
The platform includes AI-powered features using AWS Bedrock. To enable:

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add AWS credentials to `.env`:**
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key-here
   AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
   AWS_SESSION_TOKEN=your-session-token-here-if-using-temporary-credentials
   AWS_REGION=us-east-1
   ```

3. **Refresh credentials if expired:**
   ```bash
   ./refresh-aws-credentials.sh
   ```

### Port Configuration
- **3000**: Vite dev server (development with hot reloading)
- **5001**: MCP Server API
- **6000**: Bot Core API
- **5002**: AWS Inventory Service
- **7000**: Unified Claude Service
- **5432**: PostgreSQL Database
- **3306**: MySQL Database

## 📁 Project Structure

```
sre-genai/
├── liquid-glass-ui/           # Modern React frontend with Vite
├── mcp_server/                # Model Context Protocol server
├── bot_core/                  # AI diagnostics and NLP processing
├── aws_inventory_service/     # Cloud resource management
├── unified_claude_service/    # Consolidated AI endpoints
├── docs/                      # Essential documentation
├── unused/                    # Archived unused files
├── slow_query_app/           # Sample app simulating slow queries
├── connection_leak_app/      # Sample app simulating connection leaks
├── lock_contention_app/      # Sample app simulating database locks
├── memory_bloat_app/         # Sample app simulating memory issues
└── data_seeder/              # Database initialization and sample data
```

### Development Scripts
- **`dev-local.sh`** - Start development environment (returns terminal control)
- **`stop-dev.sh`** - Stop all services (Docker + frontend)
- **`test-deployment.sh`** - Validate deployment requirements
- **`aws-credentials-manager.sh`** - Manage AWS credentials
- **`refresh-aws-credentials.sh`** - Refresh expired AWS credentials

## 🤝 Contributing

1. Follow the development practices in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
2. Use the testing procedures in [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
3. Check troubleshooting guide for common issues

## �️ Trooubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker is running
docker info

# Restart everything
./stop-dev.sh
./dev-local.sh
```

**Frontend not updating:**
- The frontend runs with hot reloading - changes should update automatically
- If not working, check the terminal where dev-local.sh was run for errors

**AI features not working:**
```bash
# Check AWS credentials
./aws-credentials-manager.sh check

# Refresh if expired
./refresh-aws-credentials.sh

# Check unified Claude service
docker logs unified_claude
```

**Port conflicts:**
- Make sure ports 3000, 5001, 6000, 5002, 7000 are available
- Stop other applications using these ports

### Getting Help
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker logs mcp_server
docker logs bot_core
docker logs unified_claude

# Check service status
docker-compose ps
```

## 📞 Support

- Check the [troubleshooting guide](docs/DEV_LOCAL_TROUBLESHOOTING.md) for detailed solutions
- Review the [testing guide](docs/TESTING_GUIDE.md) for validation procedures
- Use `./test-deployment.sh` to validate your setup

---

**Note**: This platform demonstrates advanced AI-powered infrastructure management with AWS Strands Agents, Model Context Protocol (MCP), and real AWS Bedrock integration for intelligent database and container management.