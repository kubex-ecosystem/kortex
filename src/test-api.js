// Teste rápido da correção do mcpService
import { mcpService } from '../lib/mcpService';

async function testAPI() {
  console.log('🧪 Testando mcpService...');
  
  const result = await mcpService.getSystemMetrics();
  
  console.log('📊 Resultado:', {
    success: result.success,
    data: result.data,
    isRealData: result.isRealData,
    source: result.source
  });
  
  if (result.data) {
    console.log('🔥 CPU Usage:', result.data.cpu?.usage || result.data.cpuUsage);
    console.log('🔥 Memory Usage:', result.data.memory?.percentage || result.data.memoryUsage);
  }
}

testAPI();
