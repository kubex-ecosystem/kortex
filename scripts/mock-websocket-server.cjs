#!/usr/bin/env node

/**
 * 🔥 Mock WebSocket Server para Testar Kortex Real-Time
 * Simula Kosmos/StatusRafa MCP para desenvolvimento
 */

const WebSocket = require('ws');

// Criar servidor WebSocket na porta 8001
const wss = new WebSocket.Server({ port: 8001 });

console.log('🚀 Mock WebSocket Server started on ws://localhost:8001');

// Dados de exemplo para broadcast
const mockData = {
  servers: [
    { id: 'kosmos-1', name: 'Kosmos DevOps', status: 'online' },
    { id: 'statusrafa-1', name: 'StatusRafa MCP', status: 'online' },
    { id: 'fastmcp-1', name: 'FastMCP', status: 'online' }
  ],
  pipelines: [
    { id: 'pipeline-1', stage: 'build', status: 'running', progress: 45 },
    { id: 'pipeline-2', stage: 'test', status: 'success', progress: 100 },
    { id: 'pipeline-3', stage: 'deploy', status: 'running', progress: 20 }
  ]
};

// Função para gerar evento aleatório
function generateRandomEvent() {
  const events = [
    {
      event: 'server:status',
      data: {
        serverId: mockData.servers[Math.floor(Math.random() * mockData.servers.length)].id,
        status: Math.random() > 0.8 ? 'offline' : 'online',
        timestamp: new Date().toISOString()
      }
    },
    {
      event: 'pipeline:update',
      data: {
        pipelineId: `pipeline-${Math.floor(Math.random() * 5) + 1}`,
        stage: ['build', 'test', 'deploy', 'release'][Math.floor(Math.random() * 4)],
        status: ['running', 'success', 'failed'][Math.floor(Math.random() * 3)],
        progress: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      }
    },
    {
      event: 'metrics:update',
      data: {
        source: 'github',
        metrics: {
          pullRequests: Math.floor(Math.random() * 50),
          repositories: Math.floor(Math.random() * 100),
          issues: Math.floor(Math.random() * 200)
        },
        timestamp: new Date().toISOString()
      }
    },
    {
      event: 'system:alert',
      data: {
        type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)],
        title: 'System Update',
        message: `Random system event at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString()
      }
    },
    {
      event: 'user:action',
      data: {
        userId: 'user-' + Math.floor(Math.random() * 10),
        action: ['deploy', 'commit', 'merge', 'review'][Math.floor(Math.random() * 4)],
        target: 'repo-' + Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      }
    }
  ];

  return events[Math.floor(Math.random() * events.length)];
}

// Handler de conexão
wss.on('connection', function connection(ws, req) {
  const clientIP = req.socket.remoteAddress;
  console.log(`✅ Client connected from ${clientIP}`);

  // Enviar mensagem de boas-vindas
  ws.send(JSON.stringify({
    event: 'system:alert',
    data: {
      type: 'success',
      title: 'Connected',
      message: '🔥 Real-time WebSocket connection established!',
      timestamp: new Date().toISOString()
    }
  }));

  // Heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'heartbeat', timestamp: Date.now() }));
    }
  }, 30000);

  // Eventos aleatórios a cada 3-8 segundos
  const eventInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const event = generateRandomEvent();
      ws.send(JSON.stringify(event));
      console.log(`📡 Sent ${event.event}:`, event.data);
    }
  }, Math.random() * 5000 + 3000); // 3-8 segundos

  // Handler de mensagens recebidas
  ws.on('message', function message(data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`📨 Received from client:`, parsed);
      
      // Echo de volta como confirmação
      ws.send(JSON.stringify({
        event: 'system:alert',
        data: {
          type: 'info',
          title: 'Message Received',
          message: `Server received: ${parsed.event || 'unknown event'}`,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('❌ Failed to parse message:', error);
    }
  });

  // Handler de desconexão
  ws.on('close', function close() {
    console.log(`❌ Client disconnected from ${clientIP}`);
    clearInterval(heartbeat);
    clearInterval(eventInterval);
  });

  // Handler de erro
  ws.on('error', function error(err) {
    console.error(`🔴 WebSocket error from ${clientIP}:`, err);
    clearInterval(heartbeat);
    clearInterval(eventInterval);
  });
});

// Handler de erro do servidor
wss.on('error', function error(err) {
  console.error('🔴 WebSocket Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down Mock WebSocket Server...');
  wss.close(() => {
    console.log('✅ Mock WebSocket Server closed');
    process.exit(0);
  });
});

console.log('🔥 Broadcasting random events every 3-8 seconds');
console.log('🎯 Connect Kortex to ws://localhost:8001 to see real-time magic!');
