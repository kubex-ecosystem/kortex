import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      /*
      Environment variables for Kortex Mission Control
      They are all prefixed with "process.env." to be compatible with libraries that expect this format.

      !!!!! DON'T LET THEM LEAK INTO THE FRONTEND CODE !!!!
      !!!!! THEY SHOULD ONLY BE USED IN SERVER-SIDE CODE !!!!!
      */
      'process.env.PORT': JSON.stringify(env.PORT || '3000'),
      'process.env.DEBUG': JSON.stringify(env.DEBUG || 'false'),
      'process.env.LOG_LEVEL': JSON.stringify(env.LOG_LEVEL || 'info'),
      'process.env.SECURITY_ENABLED': JSON.stringify(env.SECURITY_ENABLED || 'true'),

      // GoBE Backend Integration
      'process.env.GOBE_API_URL': JSON.stringify(env.GOBE_API_URL || 'http://localhost:8080'),
      'process.env.GOBE_WS_URL': JSON.stringify(env.GOBE_WS_URL || 'ws://localhost:8080/ws'),
      'process.env.GOBE_API_KEY': JSON.stringify(env.GOBE_API_KEY || ''),

      // MCP Server Management
      'process.env.MCP_DEFAULT_HOST': JSON.stringify(env.MCP_DEFAULT_HOST || 'localhost'),
      'process.env.MCP_DEFAULT_PORT': JSON.stringify(env.MCP_DEFAULT_PORT || '3001'),

      // External API Keys (for testing/development)
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || ''),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),

      // Development flags
      'process.env.MOCK_MODE': JSON.stringify(env.MOCK_MODE || 'false'),
      'process.env.ENABLE_DEV_TOOLS': JSON.stringify(env.ENABLE_DEV_TOOLS || 'true'),
    },

    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
        '@components': path.resolve(process.cwd(), './src/components'),
        '@contexts': path.resolve(process.cwd(), './src/contexts'),
        '@hooks': path.resolve(process.cwd(), './src/hooks'),
        '@services': path.resolve(process.cwd(), './src/services'),
        '@types': path.resolve(process.cwd(), './src/types'),
        '@constants': path.resolve(process.cwd(), './src/constants'),
        '@lib': path.resolve(process.cwd(), './src/lib'),
      },
    },

    server: {
      port: parseInt(env.PORT || '3000'),
      host: '0.0.0.0',
      open: true,
      cors: true,
      proxy: {
        // Proxy para GoBE backend em desenvolvimento
        '/api': {
          target: env.GOBE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        },
        '/ws': {
          target: env.GOBE_WS_URL || 'ws://localhost:8080',
          ws: true,
          changeOrigin: true
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'esbuild',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'framer-motion'],
            utils: ['clsx', 'zustand']
          }
        }
      }
    },

    css: {
      modules: {
        localsConvention: 'camelCase'
      }
    },

    plugins: [],

    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'framer-motion']
    },

    esbuild: {
      jsx: 'automatic'
    }
  };
});
