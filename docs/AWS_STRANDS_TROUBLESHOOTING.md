# AWS Strands Demo - Troubleshooting Guide

## 🎯 Overview

This guide covers common issues and solutions for the AWS Strands multi-agent database provisioning demo.

## 🚀 Quick Health Check

Run this command to verify the Strands demo is working:

```bash
# Test the Strands analysis endpoint
curl -s -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "team": "Test Team",
    "application": "Test App", 
    "requirements": {
      "data_type": "test_database",
      "expected_records": "1M records",
      "read_write_ratio": "80:20",
      "peak_concurrent_users": 1000,
      "compliance": ["PCI-DSS"],
      "availability_requirement": "99.9%",
      "performance_requirements": {
        "max_query_response": "100ms",
        "max_transaction_time": "500ms",
        "concurrent_connections": 1000
      }
    }
  }' | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ SUCCESS!' if data.get('success') else '❌ FAILED')
    if 'agent_results' in data:
        prompt_count = sum(1 for agent in data['agent_results'].values() 
                          if agent.get('analysis', {}).get('ai_prompt'))
        print(f'Agents with prompts: {prompt_count}/5')
    else:
        print('Error:', data.get('error', 'Unknown'))
except Exception as e:
    print('Parse error:', e)
"
```

**Expected Output**:
```
✅ SUCCESS!
Agents with prompts: 5/5
```

## 🐛 Common Issues & Solutions

### 1. 404 Not Found Error

**Symptoms**:
- Strands analysis fails immediately
- Browser console shows `404 Not Found` for `/strands/analyze`
- Backend logs show `404` for strands endpoints

**Root Cause**: Missing `strands_agents.py` file in Docker container

**Solution**:
```bash
# Check if the file exists in container
docker exec mcp_server ls -la /app/strands_agents.py

# If missing, copy it from host
docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
docker cp sre-genai/mcp_server/app/endpoints.py mcp_server:/app/endpoints.py

# Restart the container
docker restart mcp_server

# Wait and test
sleep 5
curl http://localhost:5001/health
```

### 2. ModuleNotFoundError: strands_agents

**Symptoms**:
- Container fails to start
- Logs show `ModuleNotFoundError: No module named 'strands_agents'`
- MCP server is unhealthy

**Root Cause**: Missing dependency file in container

**Solution**:
```bash
# Check container logs
docker logs mcp_server --tail 20

# Copy missing files
docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
docker restart mcp_server

# Verify fix
docker logs mcp_server --tail 10
```

### 3. Empty AI Prompts in Transparency Tab

**Symptoms**:
- Analysis completes successfully
- Agents show in transparency tab
- "Show AI Prompts" reveals empty sections

**Root Cause**: Agents not storing `ai_prompt` field correctly

**Diagnosis**:
```bash
# Test if prompts are in API response
curl -s -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{"team": "Test", "application": "Test", "requirements": {"data_type": "test"}}' \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'agent_results' in data:
    for key, agent in data['agent_results'].items():
        analysis = agent.get('analysis', {})
        has_prompt = 'ai_prompt' in analysis and analysis['ai_prompt']
        has_response = 'ai_raw_response' in analysis and analysis['ai_raw_response']
        print(f'{key}: prompt={has_prompt}, response={has_response}')
else:
    print('No agent_results found')
"
```

**Expected Output**:
```
workload: prompt=True, response=True
cost: prompt=True, response=True
security: prompt=True, response=True
performance: prompt=True, response=True
architecture: prompt=True, response=True
```

**Solution**: If any agent shows `prompt=False`, update the agent code to include `ai_prompt` field.

### 4. Analysis Timeout

**Symptoms**:
- Analysis starts but never completes
- Frontend shows loading state indefinitely
- No error messages

**Root Cause**: Frontend timeout too short for multi-agent analysis (~21 seconds)

**Solution**:
```bash
# Check if analysis is actually completing
curl -s -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{"team": "Test", "application": "Test", "requirements": {"data_type": "test"}}' \
  --max-time 30

# If backend works, increase frontend timeout in api.ts
# timeout: 30000 (30 seconds)
```

### 5. Bedrock Connection Issues

**Symptoms**:
- Analysis completes but with low confidence scores
- Agents show `bedrock_used: false`
- Fallback analysis being used

**Diagnosis**:
```bash
# Test Bedrock connection
curl http://localhost:5001/ai/bedrock/status
curl http://localhost:5001/ai/bedrock/test
```

**Solution**: Configure AWS Bedrock credentials (see `AWS_BEDROCK_SETUP.md`)

### 6. Agent Results Missing from Response

**Symptoms**:
- Analysis succeeds but transparency tab is empty
- `agent_results` field missing from API response

**Root Cause**: API endpoint not including agent results

**Solution**: Ensure endpoints.py includes agent_results in response:
```python
return {
    "success": True,
    "session_id": session_id,
    "status": "completed",
    "steps": steps,
    "recommendation": analysis_result['final_recommendation'],
    "agent_results": {k: v.__dict__ for k, v in agent_results.items()},  # This line is crucial
    "multi_agent_summary": {...}
}
```

## 🔧 Development Workflow

### Making Changes to Strands Agents

1. **Edit the code** in `sre-genai/mcp_server/app/strands_agents.py`
2. **Copy to container**:
   ```bash
   docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
   ```
3. **Restart container**:
   ```bash
   docker restart mcp_server
   ```
4. **Test the changes**:
   ```bash
   sleep 5
   curl -X POST "http://localhost:5001/strands/analyze" -H "Content-Type: application/json" -d '{"test": "data"}'
   ```

### Making Changes to API Endpoints

1. **Edit the code** in `sre-genai/mcp_server/app/endpoints.py`
2. **Copy to container**:
   ```bash
   docker cp sre-genai/mcp_server/app/endpoints.py mcp_server:/app/endpoints.py
   ```
3. **Restart container**:
   ```bash
   docker restart mcp_server
   ```

## 🧪 Testing Commands

### Test Individual Components

```bash
# Test MCP server health
curl http://localhost:5001/health

# Test Bedrock connection
curl http://localhost:5001/ai/bedrock/status

# Test Strands analysis (quick)
curl -X POST "http://localhost:5001/strands/analyze" \
  -H "Content-Type: application/json" \
  -d '{"team": "Test", "application": "Test", "requirements": {"data_type": "test"}}'

# Run comprehensive test
./test-real-ai.sh
```

### Test Frontend Integration

1. Go to http://localhost:3000/strands-demo
2. Click "🛒 E-commerce Platform" to load scenario
3. Click "🤖 Start AI Analysis"
4. Wait ~21 seconds for completion
5. Switch to "🔍 AI Transparency" tab
6. Click "Show AI Prompts" button
7. Verify prompts and responses are displayed

## 📊 Performance Expectations

- **Analysis Time**: ~21 seconds for all 5 agents
- **Agent Execution**: 
  - Workload Analyzer: ~1.3 seconds
  - Cost/Security/Performance (parallel): ~4-6 seconds each
  - Architecture Specialist: ~5 seconds
- **Confidence Scores**: 88-96% with Bedrock, 70-80% fallback
- **Response Size**: ~32KB JSON with full agent results

## 🚨 Emergency Recovery

If the Strands demo is completely broken:

```bash
# 1. Stop everything
docker-compose down

# 2. Rebuild containers
docker-compose up --build -d

# 3. Copy required files
docker cp sre-genai/mcp_server/app/strands_agents.py mcp_server:/app/strands_agents.py
docker cp sre-genai/mcp_server/app/endpoints.py mcp_server:/app/endpoints.py

# 4. Restart MCP server
docker restart mcp_server

# 5. Test
sleep 10
curl http://localhost:5001/health
./test-real-ai.sh
```

## 📝 Logging & Debugging

### Check Container Logs
```bash
# MCP Server logs
docker logs mcp_server --tail 50

# All container logs
docker-compose logs --tail 20
```

### Enable Debug Mode
```bash
# Set environment variable for more verbose logging
docker exec mcp_server env FASTMCP_LOG_LEVEL=DEBUG
```

### Frontend Debugging
1. Open browser dev tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Look for timeout or 404 errors

## ✅ Success Indicators

- ✅ MCP server responds to health checks
- ✅ Strands analysis returns `success: true`
- ✅ All 5 agents have `ai_prompt` and `ai_raw_response`
- ✅ Frontend displays agent execution in real-time
- ✅ Transparency tab shows actual AI prompts
- ✅ Confidence scores are 88%+ with Bedrock
- ✅ Analysis completes in ~21 seconds

This troubleshooting guide should help resolve most issues with the AWS Strands demo. For additional help, check the development updates at http://localhost:3000/n8n-updates.