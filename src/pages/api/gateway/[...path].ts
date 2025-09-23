import type { NextApiRequest, NextApiResponse } from 'next';

type GatewayProxyConfig = {
  baseURL: string;
  timeout: number;
  retries: number;
  corsEnabled: boolean;
};

const CONFIG: GatewayProxyConfig = {
  baseURL: process.env.GATEWAY_SERVER_URL || 'http://127.0.0.1:8088',
  timeout: 15000,
  retries: 3,
  corsEnabled: true,
};

const sanitizeUrl = (base: string, path: string): string => {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
};

const appendQuery = (url: string, originalReq: NextApiRequest): string => {
  const current = new URL(originalReq.url || '/', 'http://localhost:3000');
  if (!current.search || current.search === '?') {
    return url;
  }
  return `${url}${current.search}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (CONFIG.corsEnabled) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path: pathArray = [] } = req.query;
  const nestedPath = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
  const targetBase = sanitizeUrl(CONFIG.baseURL, nestedPath || '');
  const targetUrl = appendQuery(targetBase, req);

  console.log(`🔗 [Gateway Proxy] ${method} ${req.url} -> ${targetUrl}`);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kortex-Gateway-Proxy/1.0.0',
          Accept: 'application/json',
        },
        body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data: unknown;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            success: false,
            error: 'Invalid response format',
            message: `Gateway responded with: ${text.substring(0, 200)}...`,
            content_type: contentType,
            raw_response: text.length > 500 ? `${text.substring(0, 500)}...` : text,
          };
        }
      }

      console.log(`✅ [Gateway Proxy] Success: ${method} ${targetUrl} -> ${response.status}`);
      return res.status(response.status).json(data);
    } catch (error) {
      lastError = error as Error;
      console.warn(`🔄 [Gateway Proxy] Attempt ${attempt + 1}/${CONFIG.retries} failed:`, error);

      if (attempt < CONFIG.retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`❌ [Gateway Proxy] All ${CONFIG.retries} attempts failed:`, lastError);
  return res.status(502).json({
    success: false,
    error: 'Gateway Unavailable',
    message: lastError?.message || 'All retry attempts failed',
    target_url: targetUrl,
    timestamp: new Date().toISOString(),
    retries: CONFIG.retries,
  });
}
