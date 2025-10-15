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

    // Helm API endpoints
    if (path === '/api/helm/context') {
      console.log('📡 GET /api/helm/context');

      const helmContext = {
        success: true,
        context: {
          kubeconfig_path: '/home/user/.kube/config',
          current_context: 'kubernetes-admin@kubernetes',
          namespaces: ['default', 'kube-system', 'kube-public', 'kube-node-lease', 'kubex-system', 'monitoring'],
          helm_version: 'v3.12.0',
          kubernetes_version: 'v1.27.3',
          cluster_info: {
            server: 'https://10.0.0.1:6443',
            name: 'kubernetes'
          }
        }
      };

      console.log('✅ Serving Helm context:', { namespaces: helmContext.context.namespaces.length });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(helmContext));
      return;
    }

    if (path === '/api/v1/helm/releases') {
      console.log('📡 GET /api/v1/helm/releases');

      const namespace = parsedUrl.query.namespace;

      // Generate realistic Helm releases
      const generateReleases = (targetNamespace) => {
        const releases = [
          {
            name: 'kosmos-mcp',
            namespace: 'kubex-system',
            revision: 3,
            updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'deployed',
            chart: 'kosmos-mcp-1.2.3',
            app_version: '1.0.0',
            description: 'Kosmos MCP Server deployment'
          },
          {
            name: 'statusrafa',
            namespace: 'monitoring',
            revision: 1,
            updated: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'deployed',
            chart: 'statusrafa-0.9.5',
            app_version: '0.9.5',
            description: 'StatusRafa monitoring system'
          },
          {
            name: 'prometheus',
            namespace: 'monitoring',
            revision: 5,
            updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'deployed',
            chart: 'prometheus-15.9.2',
            app_version: '2.40.0',
            description: 'Prometheus monitoring stack'
          },
          {
            name: 'nginx-ingress',
            namespace: 'default',
            revision: 2,
            updated: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'deployed',
            chart: 'nginx-ingress-4.7.1',
            app_version: '1.8.1',
            description: 'NGINX Ingress Controller'
          },
          {
            name: 'cert-manager',
            namespace: 'cert-manager',
            revision: 1,
            updated: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'deployed',
            chart: 'cert-manager-v1.12.0',
            app_version: 'v1.12.0',
            description: 'Certificate management controller'
          }
        ];

        // Filter by namespace if specified
        if (targetNamespace) {
          return releases.filter(r => r.namespace === targetNamespace);
        }

        return releases;
      };

      const releases = generateReleases(namespace);

      const response = {
        success: true,
        releases: releases
      };

      console.log('✅ Serving Helm releases:', {
        namespace: namespace || 'all',
        count: releases.length
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    // Handle POST requests for Helm deploy
    if (req.method === 'POST' && path === '/api/v1/helm/deploy') {
      console.log('📡 POST /api/v1/helm/deploy');

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const deployRequest = JSON.parse(body);
          console.log('Deploy request:', {
            release: deployRequest.release_name,
            chart: deployRequest.chart_path,
            namespace: deployRequest.namespace,
            dry_run: deployRequest.dry_run
          });

          // Simulate deployment process
          const response = {
            success: true,
            message: `Release "${deployRequest.release_name}" deployed successfully`,
            release: {
              name: deployRequest.release_name,
              namespace: deployRequest.namespace,
              revision: 1,
              status: 'deployed',
              chart: deployRequest.chart_path,
              updated: new Date().toISOString(),
              description: `Deployed ${deployRequest.release_name} via Pulse`
            }
          };

          console.log('✅ Deployment successful:', deployRequest.release_name);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (error) {
          console.error('❌ Deploy error:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid request body' }));
        }
      });
      return;
    }

    // Handle DELETE requests for Helm uninstall
    if (req.method === 'DELETE' && path.startsWith('/api/v1/helm/uninstall/')) {
      console.log('📡 DELETE /api/v1/helm/uninstall');

      const releaseName = path.split('/').pop();
      const namespace = parsedUrl.query.namespace || 'default';

      console.log('Uninstall request:', { release: releaseName, namespace });

      const response = {
        success: true,
        message: `Release "${releaseName}" uninstalled successfully`,
        release: releaseName
      };

      console.log('✅ Uninstall successful:', releaseName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
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
  let baseUrl = `https://api.kubex.world`;

  if (PORT === 3002) {
    console.warn('⚠️ Warning: Running on default port 3002. Ensure no conflicts with other services.');
  }
  if (process.env.NODE_ENV !== 'production') {
    baseUrl = `http://localhost:${PORT}`;
  }


  console.log(`🚀 Mock API Server running on ${baseUrl}`);
  console.log(`📊 Endpoints available:`);
  console.log(`   GET /api/v1/github/stats    - GitHub statistics`);
  console.log(`   GET /api/v1/azure/stats     - Azure DevOps statistics`);
  console.log(`   GET /api/v1/mcp/servers     - MCP servers list`);
  console.log(`   GET /api/v1/stats           - Combined statistics`);
  console.log(`   GET /health          - Health check`);
  console.log(`   GET /api/v1/helm/context - Helm system context`);
  console.log(`   GET /api/v1/helm/releases - Helm releases`);
  console.log(`   POST /api/v1/helm/deploy - Deploy Helm chart`);
  console.log(`   DELETE /api/v1/helm/uninstall/:release - Uninstall release`);
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
