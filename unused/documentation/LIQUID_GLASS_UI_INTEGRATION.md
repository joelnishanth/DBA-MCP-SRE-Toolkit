# Liquid Glass UI Integration

This document describes the integration of the Liquid Glass UI with the existing Streamlit UI backend services.

## Overview

The Liquid Glass UI is a modern React-based frontend that provides the same functionality as the Streamlit UI but with a more polished, glass-morphism design. It connects to the same backend services (MCP Server and Bot Core) that power the Streamlit UI.

## Backend Integration

### API Endpoints Connected

#### MCP Server (Port 5001)
- `GET /health` - Health check
- `GET /containers` - List all containers
- `GET /status/{container_name}` - Get container stats
- `GET /logs/{container_name}?lines={n}` - Get container logs
- `POST /query/multi-db` - Execute multi-database queries
- `POST /analyze/performance` - Analyze query performance

#### Bot Core (Port 6000)
- `GET /health` - Health check
- `POST /diagnose` - AI-powered container diagnosis
- `POST /fix/preview` - Preview container fixes
- `POST /fix/execute` - Execute container fixes
- `POST /nlp-query` - Natural language database queries

### Changes Made

1. **Updated API Service** (`src/services/api.ts`):
   - Connected to actual backend endpoints instead of mock data
   - Implemented proper error handling and retry logic
   - Added CORS support expectations

2. **Added CORS Support** to backend services:
   - `mcp_server/app/main.py` - Added CORS middleware
   - `bot_core/app/main.py` - Added CORS middleware

3. **Added Health Endpoints**:
   - `mcp_server/app/endpoints.py` - Added `/health` endpoint
   - `bot_core/app/endpoints.py` - Added `/health` endpoint

4. **Updated Docker Configuration**:
   - Modified environment variables to use localhost URLs for browser access
   - Maintained container-to-container communication for internal services

## Features Available

### 1. Container Metrics
- Real-time container performance monitoring
- CPU and memory usage visualization
- Container status tracking
- Auto-refresh capabilities

### 2. AI Diagnostics
- Container analysis using Claude AI
- Automated fix suggestions
- Fix preview and execution
- Real-time log streaming

### 3. NLP Database Queries
- Natural language to SQL conversion
- Multi-database support (PostgreSQL, MySQL, SQLite)
- Query history and suggestions
- Schema visualization

### 4. Container Logs
- Real-time log streaming
- Configurable log line limits
- Log filtering and search

### 5. Query Performance Analysis
- Performance testing with predefined queries
- Custom query analysis
- AI-powered optimization recommendations
- Execution plan visualization

### 6. Architecture Visualization
- System architecture overview
- Component relationship mapping
- Technology stack information

## Running the System

### 1. Start the Backend Services
```bash
cd sre-genai
docker compose up --build
```

### 2. Access the UI
- **Liquid Glass UI**: http://localhost:8080
- **Streamlit UI** (for comparison): http://localhost:8501 (if enabled)

### 3. Test Backend Connections
```bash
./test-backend-connection.sh
```

## Environment Configuration

### Development
- API Base URL: `http://localhost:5001`
- Bot Core URL: `http://localhost:6000`

### Production
- Uses nginx proxy for routing
- API calls routed through `/mcp` and `/bot` paths

## Key Differences from Streamlit UI

1. **Modern React Architecture**: Component-based, reusable UI elements
2. **Glass Morphism Design**: Modern, translucent design with blur effects
3. **Real-time Updates**: WebSocket support for live data updates
4. **Better Performance**: Optimized rendering and data fetching
5. **Enhanced UX**: Better error handling, loading states, and user feedback
6. **Responsive Design**: Works well on desktop and mobile devices

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend services have CORS middleware enabled
2. **Connection Refused**: Check if backend services are running on correct ports
3. **API Timeouts**: Verify network connectivity and service health

### Debug Steps

1. Check backend service logs:
   ```bash
   docker logs mcp_server
   docker logs bot_core
   ```

2. Test API endpoints directly:
   ```bash
   curl http://localhost:5001/health
   curl http://localhost:6000/health
   ```

3. Check browser console for JavaScript errors

## Future Enhancements

1. **WebSocket Integration**: Real-time data streaming
2. **Advanced Visualizations**: Charts and graphs for metrics
3. **User Authentication**: Role-based access control
4. **Custom Dashboards**: User-configurable layouts
5. **Export Functionality**: Data export in various formats

## Conclusion

The Liquid Glass UI provides a modern, feature-rich alternative to the Streamlit UI while maintaining full compatibility with the existing backend infrastructure. It offers the same functionality with improved user experience and performance.