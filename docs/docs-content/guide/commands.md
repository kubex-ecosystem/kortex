# Commands Reference

Complete reference for all available commands in Pulse dashboard and CLI tools.

## 🖥️ Dashboard Commands

### Server Management

#### Start/Stop Servers

- **Start Server**: Click the play button or use `Ctrl + R`
- **Stop Server**: Click the stop button or use `Ctrl + S`
- **Restart Server**: Click refresh button or use `Ctrl + Shift + R`

#### Server Configuration

- **Edit Config**: Right-click server → "Edit Configuration"
- **Clone Config**: Right-click server → "Duplicate Configuration"
- **Delete Server**: Right-click server → "Remove Server"

### Connection Management

#### MCP Connections

```bash
# Connect to MCP server
pulse connect --host localhost --port 3001

# List active connections
pulselist --connections

# Disconnect from server
pulsedisconnect --server <server-id>
```

#### Health Checks

```bash
# Check server health
pulsehealth --server <server-id>

# Test connection
pulseping --host <hostname> --port <port>
```

## 🔧 CLI Commands

### Installation Commands

```bash
# Install Pulse globally
npm install -g pulse

# Install in project
npm install pulse

# Development setup
git clone https://github.com/rafa-mori/pulsegit
cd pulse
npm install
npm run dev
```

### Server Management Commands

```bash
# Start Pulse server
pulsestart

# Start with custom port
pulsestart --port 3000

# Start in production mode
pulsestart --env production

# Start with debug logging
pulsestart --debug

# Stop server
pulsestop

# Restart server
pulserestart
```

### Configuration Commands

```bash
# Initialize configuration
pulseinit

# Validate configuration
pulseconfig validate

# Show current configuration
pulseconfig show

# Set configuration value
pulseconfig set <key> <value>

# Reset configuration
pulseconfig reset
```

### Monitoring Commands

```bash
# Show system status
pulsestatus

# Display server logs
pulselogs

# Follow logs in real-time
pulselogs --follow

# Filter logs by level
pulselogs --level error

# Export logs
pulselogs --export logs.json
```

### Development Commands

```bash
# Build for production
pulsebuild

# Run tests
pulsetest

# Run linting
pulselint

# Generate documentation
pulsedocs

# Clean build artifacts
pulseclean
```

## 🔍 Query Commands

### Server Queries

```bash
# List all servers
pulseservers list

# Find servers by status
pulseservers find --status running

# Get server details
pulseservers info <server-id>

# Show server metrics
pulseservers metrics <server-id>
```

### Task Management

```bash
# List active tasks
pulsetasks list

# Create new task
pulsetasks create --name "Task Name" --command "echo hello"

# Run task
pulsetasks run <task-id>

# Cancel task
pulsetasks cancel <task-id>

# Show task history
pulsetasks history
```

## 🛠️ Utility Commands

### Import/Export

```bash
# Export configuration
pulseexport --config config.json

# Import configuration
pulseimport --config config.json

# Export server definitions
pulseexport --servers servers.json

# Import server definitions
pulseimport --servers servers.json
```

### Backup/Restore

```bash
# Create backup
pulsebackup create --name "backup-$(date +%Y%m%d)"

# List backups
pulsebackup list

# Restore from backup
pulsebackup restore --name <backup-name>

# Delete backup
pulsebackup delete --name <backup-name>
```

## 🔐 Security Commands

### Authentication

```bash
# Login to service
pulseauth login --provider github

# Logout
pulseauth logout

# Check authentication status
pulseauth status

# Refresh tokens
pulseauth refresh
```

### API Keys

```bash
# Generate API key
pulseapikey generate --name "My App"

# List API keys
pulseapikey list

# Revoke API key
pulseapikey revoke <key-id>
```

## 📊 Analytics Commands

### Metrics

```bash
# Show performance metrics
pulsemetrics show

# Export metrics data
pulsemetrics export --format json

# Generate report
pulsereport generate --period "last-7-days"
```

### Diagnostics

```bash
# Run system diagnostics
pulsediagnose

# Check dependencies
pulsecheck deps

# Validate environment
pulsecheck env

# Test connectivity
pulsecheck network
```

## 🔄 Keyboard Shortcuts

### Global Shortcuts

- `Ctrl + /`: Show command palette
- `Ctrl + ,`: Open settings
- `Ctrl + Shift + P`: Open command palette
- `F5`: Refresh dashboard
- `Ctrl + F`: Search
- `Esc`: Close modals/dialogs

### Server Management (Shortcuts)

- `Ctrl + N`: New server
- `Ctrl + D`: Duplicate server
- `Delete`: Remove selected server
- `Ctrl + R`: Restart server
- `Ctrl + S`: Stop server
- `Ctrl + Shift + S`: Start server

### Navigation

- `Ctrl + 1`: Dashboard view
- `Ctrl + 2`: Servers view
- `Ctrl + 3`: Tasks view
- `Ctrl + 4`: Logs view
- `Ctrl + 5`: Settings view

## 🆘 Help Commands

```bash
# Show general help
pulsehelp

# Show command-specific help
pulsehelp <command>

# Show version information
pulseversion

# Show system information
pulseinfo

# Open documentation
pulsedocs open
```

## 📝 Command Examples

### Complete Workflow Example

```bash
# 1. Initialize new project
pulseinit --name "My Project"

# 2. Add MCP servers
pulseservers add --name "Dev Server" --host localhost --port 3001
pulseservers add --name "Prod Server" --host prod.example.com --port 3001

# 3. Start monitoring
pulsestart --watch

# 4. Run health checks
pulsehealth --all

# 5. Generate status report
pulsereport generate --format pdf --output status-report.pdf
```

### Development Workflow

```bash
# Start development environment
npm run dev

# In another terminal, run tests
npm run test:watch

# Check code quality
npm run lint && npm run type-check

# Build and preview
npm run build && npm run preview
```

---

!!! tip "Pro Tips"
    - Use `pulsehelp <command>` for detailed help on any command
    - Most commands support `--json` flag for machine-readable output
    - Use `--dry-run` flag to preview changes before applying them
    - Set `KORTEX_DEBUG=true` environment variable for verbose logging
