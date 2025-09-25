import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gatewayTarget = env.VITE_GATEWAY_SERVER_URL || env.GATEWAY_SERVER_URL || 'http://127.0.0.1:8088';
  const mcpTarget = env.VITE_MCP_SERVER_URL || env.MCP_SERVER_URL || 'http://127.0.0.1:3002';

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: Number(env.PORT) || 3000,
      proxy: {
        '/api/mcp': {
          target: mcpTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (urlPath) => urlPath.replace(/^\/api\/mcp/, '/api'),
        },
        '/api/gateway': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (urlPath) => urlPath.replace(/^\/api\/gateway/, ''),
        },
        '/api': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'next/router': path.resolve(__dirname, 'src/compat/next-router.ts'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2022',
    },
    preview: {
      port: Number(env.PORT) || 3000,
    },
  };
});
