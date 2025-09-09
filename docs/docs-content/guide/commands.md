# Commands Reference

Complete reference for all available commands in Kortex dashboard and CLI tools.

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
kortex connect --host localhost --port 3001

# List active connections
kortex list --connections

# Disconnect from server
kortex disconnect --server <server-id>
```

#### Health Checks

```bash
# Check server health
kortex health --server <server-id>

# Test connection
kortex ping --host <hostname> --port <port>
```

## 🔧 CLI Commands

### Installation Commands

```bash
# Install Kortex globally
npm install -g kortex

# Install in project
npm install kortex

# Development setup
git clone https://github.com/kubex-ecosystem/kortex.git
cd kortex
npm install
npm run dev
```

### Server Management Commands

```bash
# Start Kortex server
kortex start

# Start with custom port
kortex start --port 3000

# Start in production mode
kortex start --env production

# Start with debug logging
kortex start --debug

# Stop server
kortex stop

# Restart server
kortex restart
```

### Configuration Commands

```bash
# Initialize configuration
kortex init

# Validate configuration
kortex config validate

# Show current configuration
kortex config show

# Set configuration value
kortex config set <key> <value>

# Reset configuration
kortex config reset
```

### Monitoring Commands

```bash
# Show system status
kortex status

# Display server logs
kortex logs

# Follow logs in real-time
kortex logs --follow

# Filter logs by level
kortex logs --level error

# Export logs
kortex logs --export logs.json
```

### Development Commands

```bash
# Build for production
kortex build

# Run tests
kortex test

# Run linting
kortex lint

# Generate documentation
kortex docs

# Clean build artifacts
kortex clean
```

## 🔍 Query Commands

### Server Queries

```bash
# List all servers
kortex servers list

# Find servers by status
kortex servers find --status running

# Get server details
kortex servers info <server-id>

# Show server metrics
kortex servers metrics <server-id>
```

### Task Management

```bash
# List active tasks
kortex tasks list

# Create new task
kortex tasks create --name "Task Name" --command "echo hello"

# Run task
kortex tasks run <task-id>

# Cancel task
kortex tasks cancel <task-id>

# Show task history
kortex tasks history
```

## 🛠️ Utility Commands

### Import/Export

```bash
# Export configuration
kortex export --config config.json

# Import configuration
kortex import --config config.json

# Export server definitions
kortex export --servers servers.json

# Import server definitions
kortex import --servers servers.json
```

### Backup/Restore

```bash
# Create backup
kortex backup create --name "backup-$(date +%Y%m%d)"

# List backups
kortex backup list

# Restore from backup
kortex backup restore --name <backup-name>

# Delete backup
kortex backup delete --name <backup-name>
```

## 🔐 Security Commands

### Authentication

```bash
# Login to service
kortex auth login --provider github

# Logout
kortex auth logout

# Check authentication status
kortex auth status

# Refresh tokens
kortex auth refresh
```

### API Keys

```bash
# Generate API key
kortex apikey generate --name "My App"

# List API keys
kortex apikey list

# Revoke API key
kortex apikey revoke <key-id>
```

## 📊 Analytics Commands

### Metrics

```bash
# Show performance metrics
kortex metrics show

# Export metrics data
kortex metrics export --format json

# Generate report
kortex report generate --period "last-7-days"
```

### Diagnostics

```bash
# Run system diagnostics
kortex diagnose

# Check dependencies
kortex check deps

# Validate environment
kortex check env

# Test connectivity
kortex check network
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
kortex help

# Show command-specific help
kortex help <command>

# Show version information
kortex version

# Show system information
kortex info

# Open documentation
kortex docs open
```

## 📝 Command Examples

### Complete Workflow Example

```bash
# 1. Initialize new project
kortex init --name "My Project"

# 2. Add MCP servers
kortex servers add --name "Dev Server" --host localhost --port 3001
kortex servers add --name "Prod Server" --host prod.example.com --port 3001

# 3. Start monitoring
kortex start --watch

# 4. Run health checks
kortex health --all

# 5. Generate status report
kortex report generate --format pdf --output status-report.pdf
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
    - Use `kortex help <command>` for detailed help on any command
    - Most commands support `--json` flag for machine-readable output
    - Use `--dry-run` flag to preview changes before applying them
    - Set `KORTEX_DEBUG=true` environment variable for verbose logging
