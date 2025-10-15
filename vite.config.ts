import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gatewayTarget = env.VITE_GATEWAY_SERVER_URL || env.GATEWAY_SERVER_URL || 'http://127.0.0.1:8088';
  const mcpTarget = env.VITE_MCP_SERVER_URL || env.MCP_SERVER_URL || 'https://api.kubex.world';

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: Number(env.PORT) || 3000,
      proxy: {
        '/api/v1/mcp': {
          target: mcpTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (urlPath) => urlPath.replace(/^\/api\/mcp/, '/api'),
        },
        '/api/v1/gateway': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (urlPath) => urlPath.replace(/^\/api\/gateway/, ''),
        },
        '/api/v1/': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: ['.localhost', '.localdomain', 'dev.kubex.world', 'test.kubex.world', 'kubex.world'],
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
