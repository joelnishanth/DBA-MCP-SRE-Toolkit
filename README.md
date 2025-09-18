# SRE GenAI Platform

The SRE GenAI Platform provides an AI-enabled Site Reliability Engineering environment that unifies infrastructure automation, multi-agent diagnostics, and database provisioning under a single workflow. It is built around AWS Strands Agents, Anthropic Claude models, and the Model Context Protocol (MCP) to streamline incident response, performance analysis, and cloud cost management.

## Problem This Project Solves
Modern SRE teams operate complex hybrid environments that require rapid incident triage, accurate database provisioning decisions, and continuous visibility into infrastructure costs. Manual triage and ad-hoc tooling create delays and knowledge gaps. This platform consolidates diagnostics, remediation planning, and resource insights into a consistent experience powered by AI agents, reducing mean time to resolution and improving operational decision making.

## Quick Start

### Development Environment
```bash
# Start the development environment (returns terminal control)
./dev-local.sh

# Stop all services when finished
./stop-dev.sh
```

**What `./dev-local.sh` does**
- Validates AWS credentials for AI capabilities
- Starts backend services in Docker containers
- Launches the frontend with hot reloading
- Waits for all services to become available
- Returns terminal control while services continue to run
- Enables automatic frontend updates during development

### Access Points
- Main UI: http://localhost:3000
- MCP Server: http://localhost:5001
- Bot Core API: http://localhost:6000
- AWS Inventory Service: http://localhost:5002
- Unified Claude Service: http://localhost:7000

## Architecture Overview

### Core Services
- **Liquid Glass UI** – React frontend with a glassmorphism design system
- **MCP Server** – Model Context Protocol server for database and container management
- **Bot Core** – AI diagnostics and natural language processing services
- **AWS Inventory Service** – Cloud resource management and cost analytics
- **Unified Claude Service** – Consolidated interface to Anthropic Claude models via AWS Bedrock

### Technology Stack

#### Frontend
- React 18 with TypeScript
- Vite for development and build tooling
- Tailwind CSS for styling
- React Router for routing
- Axios for API communication

#### Backend
- FastAPI for REST services
- Docker and Docker Compose for container orchestration
- AWS Strands Agents for model-driven AI workflows
- Model Context Protocol for tool integration

#### Databases
- PostgreSQL (primary relational database)
- MySQL (secondary relational database)
- SQLite (lightweight embedded database)

#### AI and Machine Learning
- AWS Bedrock with Anthropic Claude models
- AWS Strands SDK for multi-agent coordination
- MCP-based adapters for standardized AI access

### Multi-Agent Systems
- **AWS Strands Agents** – Model-driven reasoning for SQL provisioning
- **Database Management Agents** – Multi-database query and performance analysis
- **Container Diagnostics Agents** – Infrastructure monitoring and remediation planning
- **Cost Analysis Agents** – Optimization recommendations for cloud spending

## Documentation
Key documentation is located in the `docs` directory:
- [AWS Bedrock Setup](docs/AWS_BEDROCK_SETUP.md)
- [AWS Strands Architecture](docs/AWS_STRANDS_ARCHITECTURE.md)
- [NoSQL Onboarding Demo](docs/NOSQL_ONBOARDING_DEMO.md)
- [Agent Core Demo](docs/AWS_AGENT_CORE_DEMO.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Troubleshooting](docs/DEV_LOCAL_TROUBLESHOOTING.md)

## Testing

### Test Scripts
```bash
# Validate deployment prerequisites
./test-deployment.sh

# Verify backend service connectivity
curl http://localhost:5001/health
curl http://localhost:6000/health
curl http://localhost:5002/health
curl http://localhost:7000/health
```

### Development Workflow
```bash
# Start the development environment (returns terminal control)
./dev-local.sh

# Run additional commands while services continue to run
git status
npm run build
docker logs mcp_server

# Stop all services after development
./stop-dev.sh
```

## Key Features

| Category | Feature | Description |
| --- | --- | --- |
| Infrastructure Management | Real-time container monitoring | Collect metrics and health insights across application containers. |
| Infrastructure Management | AI-driven diagnostics | Generate remediation guidance using contextual container and service data. |
| Infrastructure Management | Multi-database performance analysis | Evaluate and compare PostgreSQL, MySQL, and SQLite workloads. |
| AI Capabilities | Container diagnostics | Run deep analyses of container logs and status to surface probable causes. |
| AI Capabilities | Database query optimization | Produce query tuning recommendations and execution plans. |
| AI Capabilities | Natural language querying | Translate plain-language questions into infrastructure-aware responses. |
| AI Capabilities | Cost analysis | Identify cost anomalies and provide optimization suggestions. |
| Visualization | Architecture mapping | Render component relationships and dependencies for situational awareness. |
| MCP Integration | Standardized data access | Use MCP tooling for consistent database connectivity across engines. |
| MCP Integration | Container management | Invoke lifecycle management tools through a unified interface. |
| MCP Integration | Inventory intelligence | Combine natural language requests with inventory data for quick insights. |

## Configuration

### AWS Credentials for AI Features
The platform integrates with AWS Bedrock. Enable AI functionality by supplying credentials:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Populate AWS credentials in `.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key-here
   AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
   AWS_SESSION_TOKEN=your-session-token-here-if-using-temporary-credentials
   AWS_REGION=us-east-1
   ```
3. Refresh credentials if they expire:
   ```bash
   ./refresh-aws-credentials.sh
   ```

### Port Allocation
- 3000: Vite development server
- 5001: MCP Server API
- 6000: Bot Core API
- 5002: AWS Inventory Service
- 7000: Unified Claude Service
- 5432: PostgreSQL database
- 3306: MySQL database

## Project Structure

```
sre-genai/
├── liquid-glass-ui/         # React frontend using Vite
├── mcp_server/              # Model Context Protocol server implementation
├── bot_core/                # AI diagnostics and NLP processing services
├── aws_inventory_service/   # Cloud resource and cost management APIs
├── unified_claude_service/  # Consolidated AI endpoint gateway
├── docs/                    # Project documentation
├── slow_query_app/          # Sample service simulating slow queries
├── connection_leak_app/     # Sample service simulating connection leaks
├── lock_contention_app/     # Sample service simulating database locks
├── memory_bloat_app/        # Sample service simulating memory issues
└── data_seeder/             # Database initialization utilities
```

### Development Scripts
- `dev-local.sh` – Start the development environment
- `stop-dev.sh` – Stop all services
- `test-deployment.sh` – Validate deployment requirements
- `aws-credentials-manager.sh` – Manage AWS credentials
- `refresh-aws-credentials.sh` – Refresh temporary credentials

## Contributing
1. Follow the practices outlined in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
2. Apply the testing workflow in [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
3. Consult the troubleshooting guide for common issues before filing bugs

## Troubleshooting

### Common Issues

**Services fail to start**
```bash
# Confirm Docker is running
docker info

# Restart the development environment
./stop-dev.sh
./dev-local.sh
```

**Frontend changes are not visible**
- The frontend is served with hot reloading; verify the terminal running `dev-local.sh` for compilation errors.

**AI features are unavailable**
```bash
# Validate AWS credentials
./aws-credentials-manager.sh check

# Refresh credentials if necessary
./refresh-aws-credentials.sh

# Inspect Unified Claude service logs
docker logs unified_claude
```

**Port conflicts**
- Confirm that ports 3000, 5001, 6000, 5002, and 7000 are available before starting services.

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

## Support
- Review [docs/DEV_LOCAL_TROUBLESHOOTING.md](docs/DEV_LOCAL_TROUBLESHOOTING.md) for detailed troubleshooting
- Follow [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for validation procedures
- Run `./test-deployment.sh` to confirm environment readiness

---

This platform demonstrates an integrated approach to AI-assisted infrastructure management using AWS Strands Agents, the Model Context Protocol, and AWS Bedrock-backed Claude models for intelligent database and container operations.
