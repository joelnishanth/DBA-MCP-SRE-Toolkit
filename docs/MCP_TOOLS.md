# 🛠️ MCP Server Tools - Database Inventory & Cost Management

The MCP (Model Context Protocol) Server now includes comprehensive tools for database inventory management and cost analysis. These tools allow AI agents to programmatically access and analyze your database infrastructure.

## 🔧 Available Tools

### 📊 Database Inventory Tools

#### `GET /inventory/databases`
Get database inventory with optional filtering.

**Parameters:**
- `application` (optional): Filter by application name
- `team` (optional): Filter by team name  
- `database_type` (optional): Filter by database type (PostgreSQL, MySQL, etc.)
- `host_type` (optional): Filter by host type (EC2, RDS)

**Example:**
```bash
curl "http://localhost:5001/inventory/databases?application=UserAuth&database_type=PostgreSQL"
```

#### `GET /inventory/ec2`
Get EC2 instances with optional filtering.

**Parameters:**
- `application` (optional): Filter by application name
- `team` (optional): Filter by team name
- `region` (optional): Filter by AWS region
- `environment` (optional): Filter by environment (production, staging, development)

#### `GET /inventory/rds`
Get RDS instances with optional filtering.

**Parameters:**
- `application` (optional): Filter by application name
- `team` (optional): Filter by team name
- `region` (optional): Filter by AWS region
- `engine` (optional): Filter by database engine

#### `GET /inventory/summary`
Get database summary analytics with formatted output.

**Returns:**
- `raw_data`: Complete JSON data
- `formatted`: Human-readable summary

#### `GET /inventory/top-applications`
Get top applications by database count.

**Parameters:**
- `limit` (optional, default: 10): Number of top applications to return

### 💰 Cost Management Tools

#### `GET /cost/summary`
Get cost summary for specified period with formatted output.

**Parameters:**
- `days` (optional, default: 30): Number of days to analyze
- `application` (optional): Filter by application name
- `team` (optional): Filter by team name

**Returns:**
- `raw_data`: Complete cost data
- `formatted`: Human-readable cost summary

#### `GET /cost/trends`
Get cost trends over time.

**Parameters:**
- `days` (optional, default: 30): Number of days to analyze
- `group_by` (optional, default: "application"): Group by application, team, or service_type

### 🤖 Natural Language Query Tool

#### `POST /inventory/chat`
Process natural language queries about inventory and costs.

**Request Body:**
```json
{
  "query": "Show me the top 5 applications by database count"
}
```

**Example Queries:**
- "What is our total monthly spending?"
- "How many PostgreSQL databases does UserAuth have?"
- "Show me resource usage for team Platform"
- "Give me an overview of our infrastructure"

### 📋 Metadata Tools

#### `GET /inventory/metadata`
Get metadata about applications, teams, and database types.

**Returns:**
```json
{
  "applications": ["UserAuth", "PaymentProcessor", ...],
  "teams": ["Platform", "Commerce", ...],
  "database_types": ["PostgreSQL", "MySQL", ...]
}
```

### 📈 Combined Analytics Tool

#### `GET /inventory/analytics`
Get comprehensive analytics for an application or team.

**Parameters:**
- `application` (optional): Analyze specific application
- `team` (optional): Analyze specific team

**Returns:**
- Database inventory
- Cost summary
- EC2 instances
- RDS instances
- Generation timestamp

### 📊 Advanced Reporting Tools

#### `GET /reports/chargeback`
Generate chargeback reports for cost allocation.

**Parameters:**
- `team` (optional): Generate report for specific team (if omitted, generates for all teams)
- `days` (optional, default: 30): Number of days to analyze

**Returns:**
- Single team or all teams chargeback data
- Cost breakdowns by service type
- Resource utilization summary

#### `GET /reports/optimization`
Generate infrastructure optimization recommendations.

**Returns:**
- Cost optimization opportunities
- Database consolidation suggestions
- Priority-ranked recommendations
- Potential savings estimates

#### `GET /reports/executive-summary`
Generate executive-level summary report.

**Returns:**
- Key infrastructure metrics
- Monthly and annual cost projections
- Top applications and teams by cost
- High-level resource utilization

### ⚡ Resource Utilization Tools

#### `GET /utilization/overview`
Get comprehensive resource utilization overview.

**Returns:**
- EC2 utilization metrics (CPU, memory, instance counts)
- RDS utilization metrics (CPU, connections, availability)
- Running vs. stopped instance counts
- Average utilization across all resources

## 🚀 Usage Examples

### Basic Inventory Query
```bash
# Get all databases
curl http://localhost:5001/inventory/databases

# Get databases for specific application
curl "http://localhost:5001/inventory/databases?application=UserAuth"

# Get PostgreSQL databases only
curl "http://localhost:5001/inventory/databases?database_type=PostgreSQL"
```

### Cost Analysis
```bash
# Get 30-day cost summary
curl http://localhost:5001/cost/summary

# Get cost summary for specific team
curl "http://localhost:5001/cost/summary?team=Platform&days=90"

# Get cost trends by team
curl "http://localhost:5001/cost/trends?group_by=team&days=60"
```

### Natural Language Queries
```bash
# Ask about top applications
curl -X POST http://localhost:5001/inventory/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me the top 5 applications"}'

# Ask about costs
curl -X POST http://localhost:5001/inventory/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is our total monthly spending?"}'
```

### Comprehensive Analytics
```bash
# Get full analytics for UserAuth application
curl "http://localhost:5001/inventory/analytics?application=UserAuth"

# Get full analytics for Platform team
curl "http://localhost:5001/inventory/analytics?team=Platform"
```

### Advanced Reporting
```bash
# Generate chargeback report for Platform team
curl "http://localhost:5001/reports/chargeback?team=Platform&days=90"

# Generate chargeback report for all teams
curl "http://localhost:5001/reports/chargeback?days=30"

# Get optimization recommendations
curl "http://localhost:5001/reports/optimization"

# Generate executive summary
curl "http://localhost:5001/reports/executive-summary"

# Get resource utilization overview
curl "http://localhost:5001/utilization/overview"
```

## 🔗 Integration with AI Agents

These MCP tools can be used by AI agents to:

1. **Inventory Management**
   - Discover and catalog database resources
   - Track application-to-database mappings
   - Monitor resource utilization across EC2 and RDS

2. **Cost Optimization**
   - Analyze spending patterns and trends
   - Generate detailed chargeback reports
   - Identify cost optimization opportunities
   - Provide executive-level cost summaries

3. **Advanced Analytics**
   - Generate optimization recommendations
   - Create executive summary reports
   - Analyze resource utilization patterns
   - Provide infrastructure insights

4. **Natural Language Interface**
   - Answer questions about infrastructure
   - Provide insights and recommendations
   - Generate reports and summaries
   - Process complex queries about costs and resources

5. **Automated Reporting**
   - Generate team-specific chargeback reports
   - Create optimization recommendations
   - Provide utilization analysis
   - Executive dashboard data

## 📊 Sample Data

The MCP server works with synthetic data including:
- **150 EC2 instances** across multiple regions
- **45 RDS instances** with various engines
- **200+ databases** across 10 applications
- **10 teams** with realistic resource allocation
- **6 months** of historical cost data

## 🛡️ Error Handling

All endpoints include comprehensive error handling:
- Network connectivity issues
- Service unavailability
- Invalid parameters
- Timeout handling

Errors are returned in a consistent format:
```json
{
  "error": "Description of the error"
}
```

## 🔧 Development

### Adding New Tools

1. Add utility functions to `inventory_utils.py`
2. Add endpoint to `endpoints.py`
3. Update this documentation
4. Rebuild the MCP server container

### Testing Tools

```bash
# Test MCP server health
curl http://localhost:5001/health

# Test inventory service connectivity
curl http://localhost:5001/inventory/metadata
```

## 🌐 Service Architecture

```
AI Agent/Client
    ↓
MCP Server (Port 5001)
    ↓
AWS Inventory Service (Port 5002)
    ↓
Synthetic Data Generator
```

The MCP server acts as a bridge between AI agents and the inventory/cost management system, providing a standardized interface for programmatic access to infrastructure data.

## 📚 Related Documentation

- [Main README](README.md) - Platform overview and setup
- [AWS Inventory Service README](sre-genai/aws_inventory_service/README.md) - Detailed service documentation
- [Quick Start Guide](QUICK_START.md) - 5-minute setup
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Problem solving