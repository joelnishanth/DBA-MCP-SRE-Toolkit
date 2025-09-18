# 🔥 Development Guide - Hot Reloading Setup

This guide shows you how to develop with instant hot reloading so you don't have to restart Docker Compose every time you make changes.

## 🚀 Quick Start

### Option 1: Docker Development (Recommended)
```bash
# Start development environment with hot reloading
./dev.sh
```

### Option 2: Local Development (Fastest)
```bash
# Run UI locally, services in Docker
./dev-local.sh
```

### Stop Development
```bash
# Stop all development services
./stop-dev.sh
```

## 📋 Development Options Explained

### 🐳 **Option 1: Docker Development (`./dev.sh`)**
- **What it does**: Runs everything in Docker with hot reloading
- **Pros**: 
  - Consistent environment
  - All services containerized
  - Hot reloading enabled
- **Cons**: Slightly slower than local development
- **Access**: http://localhost:81 (through nginx) or http://localhost:3000 (direct)

### 💻 **Option 2: Local Development (`./dev-local.sh`)**
- **What it does**: Runs UI locally, backend services in Docker
- **Pros**: 
  - Fastest hot reloading
  - Native performance
  - Easy debugging
- **Cons**: Requires Node.js installed locally
- **Access**: http://localhost:5173 (Vite default port)

## 🔧 How Hot Reloading Works

### Docker Development Setup:
1. **Dockerfile.dev**: Development container with Vite dev server
2. **Volume mounts**: Your source code is mounted into the container
3. **WebSocket proxy**: Nginx forwards WebSocket connections for HMR
4. **Port mapping**: Container port 3000 → host port 3000

### Local Development Setup:
1. **Backend services**: Run in Docker (databases, APIs, MCP server)
2. **Frontend**: Runs locally with `npm run dev`
3. **Direct connection**: UI connects directly to Docker services
4. **Instant updates**: No container rebuilds needed

## 📁 File Structure

```
sre-genai/
├── dev.sh                    # Docker development script
├── dev-local.sh             # Local development script  
├── stop-dev.sh              # Stop development script
├── docker-compose.dev.yml   # Development overrides
├── liquid-glass-ui/
│   ├── Dockerfile.dev       # Development Dockerfile
│   ├── src/                 # Your source code (hot reloaded)
│   └── package.json
└── nginx/
    └── nginx.dev.conf       # Development nginx config
```

## 🛠️ Development Workflow

1. **Start development**:
   ```bash
   ./dev.sh  # or ./dev-local.sh
   ```

2. **Make changes** to files in `liquid-glass-ui/src/`

3. **See instant updates** in your browser (no restart needed!)

4. **Stop when done**:
   ```bash
   ./stop-dev.sh
   ```

## 🌐 Service URLs

| Service | Docker Dev | Local Dev | Production |
|---------|------------|-----------|------------|
| Liquid Glass UI | http://localhost:81 | http://localhost:5173 | http://localhost:81 |
| Vite Dev Server | http://localhost:3000 | http://localhost:5173 | N/A |
| MCP Server | http://localhost:5001 | http://localhost:5001 | http://localhost:5001 |
| Bot Core API | http://localhost:6000 | http://localhost:6000 | http://localhost:6000 |
| PostgreSQL | localhost:5432 | localhost:5432 | localhost:5432 |
| MySQL | localhost:3306 | localhost:3306 | localhost:3306 |

## 🐛 Troubleshooting

### Hot Reloading Not Working?
```bash
# Restart development environment
./stop-dev.sh
./dev.sh
```

### Port Conflicts?
```bash
# Check what's using ports
lsof -i :3000
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

### Docker Issues?
```bash
# Clean up Docker
docker-compose down
docker system prune -f
./dev.sh
```

### Local Development Issues?
```bash
# Reinstall dependencies
cd liquid-glass-ui
rm -rf node_modules package-lock.json
npm install
cd ..
./dev-local.sh
```

## 💡 Pro Tips

1. **Use Local Development** for fastest iteration when working on UI
2. **Use Docker Development** when you need to test full integration
3. **Check the browser console** for hot reload connection status
4. **Use browser dev tools** for debugging React components
5. **Restart development** if you change configuration files

## 🔄 What Gets Hot Reloaded?

✅ **Instantly reloaded**:
- React components (`.tsx`, `.jsx`)
- TypeScript files (`.ts`)
- CSS/Tailwind styles
- Images and assets

⚠️ **Requires restart**:
- `package.json` changes
- `vite.config.ts` changes
- `tailwind.config.js` changes
- Docker configuration changes

## 🎯 Next Steps

1. Run `./dev.sh` or `./dev-local.sh`
2. Open http://localhost:81 or http://localhost:5173
3. Edit files in `liquid-glass-ui/src/`
4. Watch your changes appear instantly!

Happy coding! 🚀