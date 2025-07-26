/**
 * 🔗 MCP Server Proxy API - Enhanced
 * Conecta o frontend Kortex com o StatusRafa MCP Server Python
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface MCPProxyConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  corsEnabled: boolean;
}

const CONFIG: MCPProxyConfig = {
  baseURL: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  timeout: 15000,
  retries: 3,
  corsEnabled: true
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  // Adicionar headers CORS primeiro
  if (CONFIG.corsEnabled) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Extrair path da URL
  const { path: pathArray = [] } = req.query;

  let mcpPath = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
  if (mcpPath.indexOf('api/') >= 0) {
    mcpPath = mcpPath.replace(/^api\//, '');
  }

  // Construir URL target - limpar parâmetros duplicados
  let targetUrl = `${CONFIG.baseURL}/api/${mcpPath}`;
  
  // Adicionar query parameters apenas uma vez
  const url = new URL(req.url!, `http://localhost:3000`);
  if (url.search && url.search !== '?') {
    targetUrl += url.search;
  }

  console.log(`🔗 [MCP Proxy] ${method} ${req.url} -> ${targetUrl}`);

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 0; attempt < CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
      
      const response = await fetch(targetUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kortex-MCP-Proxy/1.0.1',
          'Accept': 'application/json'
        },
        body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data;
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Tentar fazer parse manual se parecer JSON
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: false,
            error: 'Invalid response format',
            message: `MCP Server responded with: ${text.substring(0, 200)}...`,
            content_type: contentType,
            raw_response: text.length > 500 ? text.substring(0, 500) + '...' : text
          };
        }
      }

      console.log(`✅ [MCP Proxy] Success: ${method} ${targetUrl} -> ${response.status}`);
      return res.status(response.status).json(data);

    } catch (error) {
      lastError = error as Error;
      console.warn(`🔄 [MCP Proxy] Attempt ${attempt + 1}/${CONFIG.retries} failed:`, error);
      
      if (attempt < CONFIG.retries - 1) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error(`❌ [MCP Proxy] All ${CONFIG.retries} attempts failed:`, lastError);
  
  return res.status(502).json({
    success: false,
    error: 'MCP Server Unavailable',
    message: lastError?.message || 'All retry attempts failed',
    target_url: targetUrl,
    timestamp: new Date().toISOString(),
    retries: CONFIG.retries
  });
}
