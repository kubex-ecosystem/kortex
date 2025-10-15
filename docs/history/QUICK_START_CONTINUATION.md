# Quick Start - Retomada do Trabalho de Desmocking

## 🚀 Comandos Essenciais para Continuar

### 1. Verificar Estado Atual

```bash
# Navegar para o diretório do Pulse
cd /srv/apps/LIFE/KUBEX/pulse

# Verificar se o build ainda está funcionando
npm run build

# Verificar se o mock server está configurado
ls scripts/mock-api-server.cjs
```

### 2. Iniciar Ambiente de Desenvolvimento

```bash
# Terminal 1 - Mock API Server (OBRIGATÓRIO)
cd /srv/apps/LIFE/KUBEX/pulse
node scripts/mock-api-server.cjs

# Terminal 2 - Aplicação Pulse
npm run dev

# Terminal 3 - Opcional: Kosmos MCP Server
cd /srv/apps/LIFE/KUBEX/kbx_kosmos
python -m kbx_kosmos.server
```

### 3. Validar Endpoints Funcionando

```bash
# Testar todos os endpoints críticos
curl localhost:3002/api/v1/github/repos
curl localhost:3002/api/v1/azure/projects
curl localhost:3002/api/v1/mcp/servers
curl localhost:3002/api/v1/helm/context
curl localhost:3002/api/v1/helm/releases

# Abrir interface no browser
open http://localhost:3000
```

## 📋 Checklist de Status

### ✅ Páginas Completamente Desmockadas

- [ ] **Dashboard** (`/`) - useRealAPIData.ts
- [ ] **Servers** (`/servers`) - useRealMCPData.ts
- [ ] **Analytics** (`/analytics`) - useRealAnalyticsData.ts
- [ ] **Helm** (`/helm`) - Integração Kubernetes
- [ ] **API Config** (`/api-config`) - Configurações

### ✅ Hooks de Dados Implementados

- [ ] `src/hooks/useRealAPIData.ts` - GitHub + Azure
- [ ] `src/hooks/useRealMCPData.ts` - Servidores MCP
- [ ] `src/hooks/useRealAnalyticsData.ts` - Analytics agregado

### ✅ Mock Server Operacional

- [ ] `scripts/mock-api-server.cjs` - 10 endpoints ativos
- [ ] GitHub APIs: `/api/v1/github/repos`, `/api/v1/github/user`
- [ ] Azure APIs: `/api/v1/azure/projects`, `/api/v1/azure/pipelines`
- [ ] MCP APIs: `/api/v1/mcp/servers`, `/api/v1/mcp/server/:id/health`
- [ ] Helm APIs: `/api/v1/helm/context`, `/api/v1/helm/releases`, `/api/v1/helm/deploy`, `/api/v1/helm/uninstall`

## 🎯 Próximos Passos Possíveis

### Opção 1: Transição para Produção

```bash
# Atualizar URLs base nos hooks para produção:
# localhost:3002 → kosmos.statusrafa.com
# localhost:3002 → horizon.statusrafa.com

# Implementar autenticação real
# Configurar RBAC Kubernetes
# Deploy para GitHub Pages
```

### Opção 2: Melhorias no Sistema

```bash
# Adicionar rate limiting
# Implementar cache mais inteligente
# Adicionar monitoramento de performance
# Melhorar tratamento de erros
# Adicionar mais endpoints de API
```

### Opção 3: Novas Funcionalidades

```bash
# Adicionar mais páginas ao sistema
# Implementar notificações push
# Adicionar sistema de alerts
# Implementar dashboard personalizado
# Adicionar integração com mais serviços
```

## 🔍 Pontos de Atenção

### Estado dos Arquivos Críticos

- **Mock Server** - Deve estar sempre rodando em desenvolvimento
- **TypeScript** - Zero erros ou warnings no build
- **Hooks** - Todos usando resilientMcpService
- **Páginas** - Todas com indicadores visuais de fonte de dados

### URLs de Desenvolvimento

- **Pulse Dashboard:** <http://localhost:3000>
- **Mock API Server:** <http://localhost:3002>
- **Kosmos MCP Server:** <http://localhost:8000> (opcional)

### Comandos de Debug

```bash
# Ver logs do mock server
node scripts/mock-api-server.cjs | grep -E "(GET|POST|PUT|DELETE)"

# Testar endpoint específico com headers
curl -H "Content-Type: application/json" localhost:3002/api/v1/mcp/servers

# Build com output detalhado
npm run build -- --verbose

# Verificar portas ocupadas
lsof -i :3000
lsof -i :3002
lsof -i :8000
```

## 📊 Métricas de Sucesso Atual

- ✅ **5/5 páginas principais** desmockadas
- ✅ **10/10 endpoints** funcionais
- ✅ **3/3 hooks** implementados
- ✅ **14/14 páginas** compilando
- ✅ **0 erros TypeScript**

---

**💡 DICA:** Sempre verificar se o mock server está rodando antes de trabalhar no frontend!
