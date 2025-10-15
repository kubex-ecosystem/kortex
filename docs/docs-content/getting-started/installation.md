# Installation

Get Pulse up and running in minutes with our comprehensive installation guide.

## Prerequisites

Before installing Pulse, ensure you have the following prerequisites:

### System Requirements

- **Node.js** 18.0.0 or higher
- **npm** 11.0.0 or higher
- **Git** for version control
- **Modern Browser** with WebSocket support

### Optional Requirements

- **Docker** for containerized deployment
- **Python 3.8+** for MCP server integration
- **Kubernetes** for Helm integration

## Quick Installation

### Method 1: NPM Installation

```bash
# Clone the repository
git clone https://github.com/rafa-mori/pulse.git
cd pulse

# Install dependencies
npm install

# Start development environment
npm run dev
```

### Method 2: Docker Installation

```bash
# Pull and run the container
docker run -p 3000:3000 rafa-mori/pulselatest

# Or build from source
git clone https://github.com/rafa-mori/pulsegit
cd pulse
docker build -t pulse.
docker run -p 3000:3000 pulse
```

### Method 3: Static Deployment

```bash
# Build static files
npm run build
npm run export

# Deploy to any static host
# Files will be in ./out directory
```

## Environment Setup

### Development Environment

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws

# Debug Mode
NODE_ENV=development
DEBUG=true
```

### Production Environment

```env
# Production API URLs
NEXT_PUBLIC_API_BASE_URL=https://api.yourcompany.com
NEXT_PUBLIC_WS_URL=wss://api.yourcompany.com/ws

# Security
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# Optional: Authentication
GITHUB_TOKEN=your_github_token
AZURE_DEVOPS_TOKEN=your_azure_token
```

## Verification

### Test Installation

```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Check npm version
npm --version   # Should be 8.0.0+

# Verify build
npm run build   # Should complete without errors

# Test development server
npm run dev     # Should start on http://localhost:3000
```

### Health Check

After starting Pulse, verify these endpoints:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Mock API**: [http://localhost:3002](http://localhost:3002)
- **Health**: [http://localhost:3002/health](http://localhost:3002/health)

## Common Issues

### Node.js Version Issues

If you encounter Node.js version errors:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or using n
npm install -g n
n 18
```

### Port Conflicts

If ports 3000 or 3002 are in use:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3002

# Kill processes if needed
kill -9 <PID>

# Or use different ports
PORT=3001 npm run dev
```

### Permission Issues

On macOS/Linux, you might need:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm instead of system npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

## Next Steps

After successful installation:

1. **[Quick Start Guide](quick-start.md)** - Get familiar with basic features
2. **[Configuration](../guide/configuration.md)** - Set up your integrations
3. **[Basic Concepts](concepts.md)** - Understand core functionality

## Getting Help

If you encounter issues during installation:

- **GitHub Issues**: [Report bugs or request help](https://github.com/rafa-mori/pulseissues)
- **Documentation**: Check our comprehensive guides
- **Community**: Join our Discord or discussions

---

*Installation taking longer than expected? Check our [troubleshooting guide](../guide/troubleshooting.md) for common solutions.*
