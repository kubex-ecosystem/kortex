import compression from 'compression';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT) || 3000;
const gatewayTarget = process.env.GATEWAY_SERVER_URL || process.env.VITE_GATEWAY_SERVER_URL || 'http://127.0.0.1:8088';
const mcpTarget = process.env.MCP_SERVER_URL || process.env.VITE_MCP_SERVER_URL || 'http://127.0.0.1:3002';

const app = express();

app.use(compression());

app.use(
  '/api/mcp',
  createProxyMiddleware({
    target: mcpTarget,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api/mcp': '/api',
    },
  })
);

app.use(
  '/api/gateway',
  createProxyMiddleware({
    target: gatewayTarget,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api/gateway': '',
    },
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: gatewayTarget,
    changeOrigin: true,
    secure: false,
  })
);

app.use(express.static(distPath, { extensions: ['html'] }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Kortex server listening on http://localhost:${port}`);
});
