# Unused Files Archive

This folder contains files that were identified as unused in the SRE GenAI repository and moved here for cleanup purposes.

## Directory Structure

### `/documentation/` - Archived Documentation
- `AGENTIC_ARCHITECTURE.md` - Detailed agentic architecture notes
- `AWS_INVENTORY_AI_ENHANCED.md` - AI enhancement documentation
- `AWS_INVENTORY_ARCHITECTURE.md` - Inventory service architecture
- `AWS_INVENTORY_FLOW.txt` - Flow documentation
- `AWS_STRANDS_COMPLETION_STATUS.md` - Completion status notes
- `CLAUDE_INTEGRATION_COMPLETE.md` - Integration completion notes
- `LIQUID_GLASS_UI_INTEGRATION.md` - UI integration documentation

### `/setup-scripts/` - One-time Setup Scripts
- `setup-aws-credentials.sh` - AWS credentials setup helper
- `setup-n8n-aws-credentials.sh` - n8n AWS setup helper
- `import-workflow-guide.sh` - Workflow import guide script

### `/test-scripts/` - Additional Test Scripts
- `test-inventory-service.sh` - Inventory service testing script

### `/pages/` - Unused Frontend Pages
- `Architecture_old.tsx` - Old backup version of Architecture page
- `MCPDemo_old.tsx` - Old backup version of MCP Demo page  
- `DataAnalytics.tsx` - Unused page not referenced in App.tsx routing

### `/components/` - Unused React Components
- `TestComponent.tsx` - Test component for development
- `TestDiagram.tsx` - Test diagram component

- `AlertsPanel.tsx` - Alerts panel component not imported anywhere
- `ContainerActionPanel.tsx` - Container action panel not imported anywhere
- `DatabaseQueryBuilder.tsx` - Database query builder not imported anywhere

### `/backend/` - Unused Backend Files
- `nosql_agents.py.backup` - Backup of NoSQL agents file
- `test_endpoints.py` - Test endpoints file from bot_core

### `/scripts/` - Unused Test Scripts
- `test_nlp_queries.py` - NLP query testing script
- `test_queries_curl.sh` - cURL testing script
- `test-backend-connection.sh` - Backend connection testing script
- `test-claude-integration.py` - Claude AI integration testing script
- `test-frontend-api.html` - Frontend API testing HTML file
- `test-frontend-backend.html` - Frontend-backend testing HTML file
- `test-simple-workflow.sh` - Simple workflow testing script
- `test-workflow-demo.sh` - Workflow demo testing script
- `quick-workflow-test.sh` - Quick workflow testing script

### `/mock-files/` - Mock and Test Files
- `mock_slack_webhook.py` - Python mock Slack webhook server
- `mock-slack-webhook.js` - JavaScript mock Slack webhook server
- `simple-test-workflow.json` - Simple test workflow configuration

### `/streamlit_ui/` - Legacy UI
- Complete Streamlit UI directory - Legacy Python-based UI replaced by Liquid Glass UI

### `/mcp_server_official/` - Redundant MCP Server Implementation
- Alternative MCP server implementation that was not used in production
- Moved to unused as `mcp_server/` is the active implementation

### `/mcp_server_v2/` - Redundant MCP Server Implementation  
- Version 2 of MCP server implementation that was not used in production
- Moved to unused as `mcp_server/` is the active implementation

## Organization Changes
**Date**: August 15, 2025
**Reason**: Repository cleanup to remove unused files and improve maintainability

### What Was Moved
- **Phase 1**: Backup files, test components, mock files, legacy Streamlit UI
- **Phase 2**: Additional documentation, setup scripts, and test scripts
- **Phase 3**: Organized essential documentation into `/docs` folder
- **Phase 4**: Redundant MCP server implementations (`mcp_server_official/`, `mcp_server_v2/`)

### Current Repository Structure
- **Root**: Only essential development scripts and configuration
- **`/docs`**: Essential documentation for users and developers
- **`/unused`**: All archived files organized by category

## Recovery Instructions
If any of these files are needed in the future:
1. Copy the file back to its original location
2. Update any import statements if necessary
3. Test functionality to ensure it works with current codebase

## Safe to Delete
These files can be safely deleted if confirmed they are no longer needed:
- All backup files (`.backup`, `_old.tsx`)
- Test components and mock files
- Legacy Streamlit UI (if Liquid Glass UI is fully adopted)

## Total Space Saved
Approximately **70MB** of unused files moved to this archive folder.