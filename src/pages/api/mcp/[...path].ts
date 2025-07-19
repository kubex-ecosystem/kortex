// Next.js API route para fazer proxy das requisições MCP
import { NextApiRequest, NextApiResponse } from 'next';

const MCP_BASE_URL = 'http://127.0.0.1:3002';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, url } = req;
  
  // Extrair o path depois de /api/mcp
  const mcpPath = req.url?.replace('/api/mcp', '') || '';
  // Remove o /api duplicado se existir e barras extras
  const cleanPath = mcpPath.replace(/\/+$/, ''); // Remove trailing slashes
  const finalPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  const targetUrl = `${MCP_BASE_URL}${finalPath}`;
  
  console.log(`[MCP Proxy] ${method} ${req.url} -> ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Se não for JSON, retornar erro estruturado
      const text = await response.text();
      data = {
        success: false,
        error: `Resposta inválida do servidor: ${text}`,
        message: 'MCP Server não respondeu com JSON válido'
      };
    }
    
    // Adicionar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro no proxy MCP:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Falha ao conectar com MCP Server' 
    });
  }
}
