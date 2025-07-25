# Quick Start - Retomada do Trabalho de Desmocking

## 🚀 Comandos Essenciais para Continuar

### 1. Verificar Estado Atual

```bash
# Navegar para o diretório do Kortex
cd /srv/apps/LIFE/KUBEX/kortex

# Verificar se o build ainda está funcionando
npm run build

# Verificar se o mock server está configurado
ls scripts/mock-api-server.cjs
```

### 2. Iniciar Ambiente de Desenvolvimento

```bash
# Terminal 1 - Mock API Server (OBRIGATÓRIO)
cd /srv/apps/LIFE/KUBEX/kortex
node scripts/mock-api-server.cjs

# Terminal 2 - Aplicação Kortex
npm run dev

# Terminal 3 - Opcional: Kosmos MCP Server
cd /srv/apps/LIFE/KUBEX/kbx_kosmos
python -m kbx_kosmos.server
```

### 3. Validar Endpoints Funcionando

```bash
# Testar todos os endpoints críticos
curl localhost:3002/api/github/repos
curl localhost:3002/api/azure/projects
curl localhost:3002/api/mcp/servers
curl localhost:3002/api/helm/context
curl localhost:3002/api/helm/releases

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
- [ ] GitHub APIs: `/api/github/repos`, `/api/github/user`
- [ ] Azure APIs: `/api/azure/projects`, `/api/azure/pipelines`
- [ ] MCP APIs: `/api/mcp/servers`, `/api/mcp/server/:id/health`
- [ ] Helm APIs: `/api/helm/context`, `/api/helm/releases`, `/api/helm/deploy`, `/api/helm/uninstall`

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

- **Kortex Dashboard:** <http://localhost:3000>
- **Mock API Server:** <http://localhost:3002>
- **Kosmos MCP Server:** <http://localhost:8000> (opcional)

### Comandos de Debug

```bash
# Ver logs do mock server
node scripts/mock-api-server.cjs | grep -E "(GET|POST|PUT|DELETE)"

# Testar endpoint específico com headers
curl -H "Content-Type: application/json" localhost:3002/api/mcp/servers

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
