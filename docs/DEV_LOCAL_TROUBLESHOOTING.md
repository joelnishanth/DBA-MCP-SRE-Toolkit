# dev-local.sh Troubleshooting Guide

## ✅ Fixed Issues

The `dev-local.sh` script has been updated with:
- **n8n service inclusion** - Now starts n8n workflow automation
- **Better error handling** - Checks Docker availability and service health
- **Service health checks** - Waits for services to be ready before proceeding
- **Improved status reporting** - Shows all available services and ports

## 🚀 How to Use dev-local.sh

### Prerequisites
1. **Docker Desktop** must be running
2. **Node.js and npm** must be installed
3. Must run from the **sre-genai directory**

### Steps
```bash
# 1. Navigate to the sre-genai directory
cd sre-genai

# 2. Stop any existing containers (optional but recommended)
docker-compose down

# 3. Run the local development script
./dev-local.sh
```

## 🔧 What dev-local.sh Does

1. **Starts Backend Services in Docker**:
   - PostgreSQL (port 5432)
   - MySQL (port 3306)
   - SQLite
   - MCP Server (port 5001)
   - Bot Core API (port 6000)
   - AWS Inventory Service (port 5002)
   - **n8n Workflow Automation (port 5678)**
   - Sample applications (slow query, connection leak, etc.)

2. **Checks Service Health**:
   - Waits for critical services to be ready
   - Provides status updates during startup
   - Fails fast if services don't start

3. **Starts UI Locally**:
   - Installs npm dependencies if needed
   - Runs Vite dev server with hot reloading
   - UI available at http://localhost:3000

## 🐛 Common Issues & Solutions

### Issue: "Please run this script from the sre-genai directory"
**Solution**: Make sure you're in the correct directory
```bash
cd sre-genai
./dev-local.sh
```

### Issue: "Docker is not running"
**Solution**: Start Docker Desktop
- macOS: Open Docker Desktop application
- Verify with: `docker info`

### Issue: "Failed to install dependencies"
**Solution**: Check Node.js and npm installation
```bash
node --version  # Should show v18+ 
npm --version   # Should show recent version
cd liquid-glass-ui
npm install
```

### Issue: Services fail health checks
**Solution**: Check if ports are already in use
```bash
# Stop existing containers
docker-compose down

# Check what's using the ports
lsof -i :5001  # MCP Server
lsof -i :6000  # Bot Core
lsof -i :5002  # AWS Inventory

# Kill processes if needed, then retry
```

### Issue: "Failed to start Vite dev server"
**Solution**: Check for port conflicts or dependency issues
```bash
# Check if port 3000 is in use
lsof -i :3000

# Reinstall dependencies
cd liquid-glass-ui
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Strands Demo Returns 404 Not Found
**Symptoms**: 
- Strands analysis fails with 404 error
- `/strands/analyze` endpoint not found
- Browser console shows network errors

**Root Cause**: Missing `strands_agents.py` file in Docker container

**Solution**: Copy required files to container and restart
```bash
# Copy the missing files to the container
docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
docker cp sre-genai/mcp_server/app/endpoints.py mcp_server:/app/endpoints.py

# Restart the MCP server
docker restart mcp_server

# Wait for server to start and test
sleep 5
curl http://localhost:5001/health

# Test the Strands endpoint
curl -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{"team": "Test", "application": "Test", "requirements": {"data_type": "test"}}'
```

**Prevention**: When updating Strands agents, always copy files to container:
```bash
# After making changes to strands_agents.py or endpoints.py
docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
docker cp sre-genai/mcp_server/app/endpoints.py mcp_server:/app/endpoints.py
docker restart mcp_server
```

### Issue: Strands Demo Shows Empty AI Prompts
**Symptoms**:
- Analysis completes successfully
- Transparency tab shows agents but no prompts
- "Show AI Prompts" button reveals empty sections

**Solution**: Ensure all agents store prompts correctly
```bash
# Test if prompts are being returned
curl -s -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{"team": "Test", "application": "Test", "requirements": {"data_type": "test"}}' \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'agent_results' in data:
    for key, agent in data['agent_results'].items():
        has_prompt = 'ai_prompt' in agent.get('analysis', {})
        print(f'{key}: has_prompt={has_prompt}')
"
```

**Expected Output**: All 5 agents should show `has_prompt=True`

## 🎯 Expected Output

When successful, you should see:
```
🚀 Starting local development environment...
🐳 Starting backend services in Docker...
⏳ Waiting for services to be ready...
🔍 Checking service health...
✅ MCP Server is ready
✅ Bot Core API is ready
✅ AWS Inventory Service is ready
✅ Backend services started!

🌐 Services available at:
   - PostgreSQL: localhost:5432
   - MySQL: localhost:3306
   - MCP Server: http://localhost:5001
   - Bot Core API: http://localhost:6000
   - AWS Inventory Service: http://localhost:5002
   - n8n Workflow Automation: http://localhost:5678

🔥 Starting Vite dev server locally...
💡 Your UI will have instant hot reloading!

🚀 Starting Vite dev server...
  Local:   http://localhost:3000/
  Network: use --host to expose
```

## 🆚 dev.sh vs dev-local.sh

### Use `dev.sh` when:
- You want everything in Docker containers
- You're testing the full containerized setup
- You don't need instant UI hot reloading

### Use `dev-local.sh` when:
- You want faster UI development with hot reloading
- You're primarily working on frontend code
- You want to keep backend services in Docker but UI local

## 🔍 Debugging

If you're still having issues:

1. **Run the diagnostic script**:
   ```bash
   ./test-dev-local.sh
   ```

2. **Check container logs**:
   ```bash
   docker logs mcp_server
   docker logs bot_core
   docker logs aws_inventory_service
   ```

3. **Check service health manually**:
   ```bash
   curl http://localhost:5001/health
   curl http://localhost:6000/health
   curl http://localhost:5002/health
   ```

4. **Verify UI dependencies**:
   ```bash
   cd liquid-glass-ui
   npm list
   npm run dev
   ```

## 🎉 Success Indicators

- All Docker containers show "healthy" status
- MCP Server responds at http://localhost:5001/health
- Bot Core API responds at http://localhost:6000/health
- n8n is accessible at http://localhost:5678
- Vite dev server starts and shows local URL
- UI loads at http://localhost:3000 with hot reloading

The updated script should now work reliably with better error reporting and n8n integration!