#!/usr/bin/env node

/**
 * 🔥 Mock API Server para Dados Reais
 * Simula GitHub + Azure DevOps + MCP APIs com dados dinâmicos
 */

const http = require('http');
const url = require('url');

const PORT = 3002;

// Sample data generators
const generateGitHubStats = () => ({
  repositories: Math.floor(Math.random() * 20) + 10,
  pullRequests: Math.floor(Math.random() * 100) + 20,
  openPRs: Math.floor(Math.random() * 20) + 5,
  draftPRs: Math.floor(Math.random() * 10) + 1,
  mergedPRs: Math.floor(Math.random() * 50) + 10,
  issues: Math.floor(Math.random() * 50) + 20,
  commits: Math.floor(Math.random() * 500) + 100,
  contributors: Math.floor(Math.random() * 15) + 5,
  lastUpdated: new Date().toISOString()
});

const generateAzureStats = () => ({
  projects: Math.floor(Math.random() * 5) + 1,
  pipelines: Math.floor(Math.random() * 50) + 10,
  successfulPipelines: Math.floor(Math.random() * 40) + 10,
  failedPipelines: Math.floor(Math.random() * 5) + 1,
  runningPipelines: Math.floor(Math.random() * 5) + 1,
  workItems: Math.floor(Math.random() * 100) + 30,
  builds: Math.floor(Math.random() * 200) + 50,
  releases: Math.floor(Math.random() * 50) + 10,
  lastUpdated: new Date().toISOString()
});

const generateMCPServers = () => [
  {
    id: 'kosmos-1',
    name: 'Kosmos MCP Server',
    hostname: 'localhost:8000',
    status: Math.random() > 0.3 ? 'Online' : 'Offline',
    responseTime: Math.floor(Math.random() * 200) + 20,
    lastSeen: new Date(Date.now() - Math.random() * 300000).toISOString(), // Random within 5 minutes
    version: '1.0.0',
    capabilities: ['files', 'memory', 'tools', 'kubernetes'],
    endpoints: Math.floor(Math.random() * 20) + 8,
    activeConnections: Math.floor(Math.random() * 10) + 1,
    totalRequests: Math.floor(Math.random() * 1000) + 200,
    errors: Math.floor(Math.random() * 10)
  },
  {
    id: 'statusrafa-1',
    name: 'StatusRafa MCP Server',
    hostname: 'localhost:8001',
    status: Math.random() > 0.4 ? 'Online' : 'Offline',
    responseTime: Math.floor(Math.random() * 150) + 15,
    lastSeen: new Date(Date.now() - Math.random() * 180000).toISOString(), // Random within 3 minutes
    version: '0.9.5',
    capabilities: ['status', 'monitoring', 'alerts', 'notifications'],
    endpoints: Math.floor(Math.random() * 15) + 5,
    activeConnections: Math.floor(Math.random() * 8) + 1,
    totalRequests: Math.floor(Math.random() * 800) + 150,
    errors: Math.floor(Math.random() * 5)
  },
  {
    id: 'local-mock-1',
    name: 'Local Mock Server',
    hostname: 'localhost:3002',
    status: 'Online',
    responseTime: Math.floor(Math.random() * 100) + 25,
    lastSeen: new Date().toISOString(),
    version: '1.0.0-mock',
    capabilities: ['mock', 'testing', 'development', 'api'],
    endpoints: 6,
    activeConnections: Math.floor(Math.random() * 5) + 1,
    totalRequests: Math.floor(Math.random() * 500) + 100,
    errors: 0
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`📡 ${method} ${path}`);

  try {
    // GitHub API endpoints
    if (path === '/github/stats') {
      const stats = generateGitHubStats();
      console.log('✅ Serving GitHub stats:', stats);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }

    // Azure DevOps API endpoints
    if (path === '/azure/stats') {
      const stats = generateAzureStats();
      console.log('✅ Serving Azure stats:', stats);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }

    // Health check
    if (path === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }));
      return;
    }

    // MCP Servers endpoint
    if (path === '/mcp/servers') {
      const servers = generateMCPServers();
      console.log('✅ Serving MCP servers:', servers.length, 'servers');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(servers));
      return;
    }

    // Combined stats endpoint
    if (path === '/stats') {
      const githubStats = generateGitHubStats();
      const azureStats = generateAzureStats();
      
      const combinedStats = {
        github: githubStats,
        azure: azureStats,
        combined: {
          totalRepositories: githubStats.repositories,
          totalPullRequests: githubStats.pullRequests,
          totalPipelines: azureStats.pipelines,
          connectedSources: 2,
          lastUpdated: new Date().toISOString()
        }
      };

      console.log('✅ Serving combined stats');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(combinedStats));
      return;
    }

    // 404 for unknown endpoints
    console.log('❌ Unknown endpoint:', path);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found', path }));

  } catch (error) {
    console.error('🔴 Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints available:`);
  console.log(`   GET /github/stats    - GitHub statistics`);
  console.log(`   GET /azure/stats     - Azure DevOps statistics`);
  console.log(`   GET /mcp/servers     - MCP servers list`);
  console.log(`   GET /stats           - Combined statistics`);
  console.log(`   GET /health          - Health check`);
  console.log(`🔄 Data refreshes on each request with realistic variations`);
});

server.on('error', (error) => {
  console.error('🔴 Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down Mock API Server...');
  server.close(() => {
    console.log('✅ Mock API Server closed');
    process.exit(0);
  });
});
