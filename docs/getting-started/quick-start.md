# Quick Start

Get up and running with Kortex in under 5 minutes. This guide will walk you through the essential steps to start monitoring your DevOps and AI infrastructure.

## 🚀 1-Minute Setup

```bash
# Clone and install
git clone https://github.com/rafa-mori/kortex.git && cd kortex
npm install

# Start development environment
npm run dev:mock &  # Start mock API server
npm run dev         # Start Kortex dashboard

# Open in browser
open http://localhost:3000
```

## 🎯 First Look

Once Kortex is running, you'll see:

### Dashboard Overview
- **GitHub Integration**: Repository stats and API usage
- **Azure DevOps**: Pipeline status and project metrics  
- **Real-time Updates**: Live data via WebSocket connections
- **Visual Indicators**: Data source status (Real Data vs Demo Mode)

### Key Interface Elements
- **Sidebar Navigation**: Switch between different views
- **Status Cards**: Quick overview of system health
- **Charts & Metrics**: Visual representation of your data
- **Real-time Badges**: Live connection status

## 📊 Understanding the Interface

### Navigation Structure

=== "Dashboard"
    Main overview with aggregated metrics from all connected services
    
    - GitHub repository statistics
    - Azure DevOps pipeline status
    - API rate limit monitoring
    - Real-time connection status

=== "Servers"
    MCP (Model Context Protocol) server management
    
    - Server health monitoring
    - Configuration management
    - Performance metrics
    - CRUD operations

=== "Analytics"
    Advanced analytics and trend analysis
    
    - Cross-platform data aggregation
    - Historical trend visualization
    - Provider usage statistics
    - Performance optimization insights

=== "Helm"
    Kubernetes cluster and Helm release management
    
    - Cluster health monitoring
    - Helm release status
    - Resource utilization
    - Deployment management

### Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 **Real Data** | Connected to live APIs |
| 🟡 **Demo Mode** | Using mock data (development) |
| 🔴 **Offline** | Connection issues |
| ⚡ **Loading** | Fetching data |

## 🔧 Basic Configuration

### 1. Environment Setup

Create your configuration file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:

```env
# Required: API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws

# Optional: Service Integrations
GITHUB_TOKEN=your_personal_access_token
AZURE_DEVOPS_TOKEN=your_azure_token
```

### 2. GitHub Integration

To connect real GitHub data:

1. **Generate Token**: Go to GitHub Settings → Developer settings → Personal access tokens
2. **Required Scopes**: `repo`, `user`, `read:org`
3. **Add to Environment**: Update your `.env.local` file
4. **Restart Kortex**: The dashboard will detect the new token

### 3. Azure DevOps Setup

For Azure DevOps integration:

1. **Create PAT**: Azure DevOps → User Settings → Personal Access Tokens
2. **Required Scopes**: `Build (read)`, `Project and team (read)`
3. **Configure**: Add token to environment variables
4. **Verify**: Check connection in Kortex dashboard

## 🎪 Demo Mode vs Real Data

### Demo Mode (Default)
- Uses mock API server on `localhost:3002`
- Simulates realistic data patterns
- Perfect for development and testing
- No external API tokens required

### Real Data Mode
- Connects to actual GitHub/Azure APIs
- Requires valid authentication tokens
- Shows your real project data
- Respects API rate limits

## 🔍 Exploring Features

### 1. Real-time Monitoring

Watch as data updates automatically:

```bash
# In terminal, watch API calls
curl http://localhost:3002/api/github/repos
curl http://localhost:3002/api/azure/projects
```

The dashboard will reflect changes within seconds via WebSocket updates.

### 2. API Rate Monitoring

Kortex automatically tracks your API usage:

- **GitHub**: 5,000 requests/hour for authenticated users
- **Azure DevOps**: Varies by organization plan
- **Auto-pause**: Stops requests before hitting limits

### 3. Server Management

Add and manage MCP servers:

1. Navigate to **Servers** section
2. Click **Add Server**
3. Configure connection details
4. Monitor health and performance

## 🎨 Customization

### Theme and Appearance

Kortex supports:
- **Dark/Light modes**: Automatic detection or manual toggle
- **Responsive design**: Works on desktop, tablet, and mobile
- **Custom branding**: Modify colors and logos in settings

### Dashboard Layout

Customize your workspace:
- **Drag & drop**: Rearrange dashboard cards
- **Hide/show**: Toggle specific metrics
- **Refresh rates**: Adjust update intervals

## 🔧 Troubleshooting

### Common Issues

!!! warning "Port Already in Use"
    If you see port conflicts:
    ```bash
    # Check what's using port 3000
    lsof -i :3000
    
    # Use different port
    PORT=3001 npm run dev
    ```

!!! info "WebSocket Connection Failed"
    Ensure mock API server is running:
    ```bash
    npm run dev:mock
    ```

!!! tip "No Data Showing"
    Check your environment configuration:
    ```bash
    # Verify environment variables
    cat .env.local
    
    # Test API endpoints
    curl http://localhost:3002/api/github/repos
    ```

### Getting Help

- **Documentation**: Continue with our [configuration guide](../guide/configuration.md)
- **Examples**: Check [practical examples](../examples/react-sharing.md)
- **Issues**: [Report bugs on GitHub](https://github.com/rafa-mori/kortex/issues)

## 🎯 Next Steps

Now that you have Kortex running:

1. **[Learn Core Concepts](concepts.md)** - Understand how Kortex works
2. **[Configure Integrations](../guide/configuration.md)** - Set up your services
3. **[Explore Features](../features/extraction.md)** - Discover advanced capabilities
4. **[See Examples](../examples/react-sharing.md)** - Real-world use cases

---

*Ready to dive deeper? Our [User Guide](../guide/commands.md) covers advanced features and workflows.*
