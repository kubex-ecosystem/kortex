# 🎯 PLANO DE DESMOCKING DO KORTEX
## Estratégia para Remover Mocks e Implementar Sistema Real + WebSockets

### 📊 **STATUS ATUAL MAPEADO**

#### **Componentes Mockados Identificados:**
- ✅ `src/context/AppContext.tsx` - MOCK data de servidores
- ✅ `src/hooks/useMCPData.ts` - Hook com dados mockados
- ✅ `src/lib/authService.ts` - Autenticação mock
- ✅ `src/components/UI/UserMenu.tsx` - User data mock
- ✅ `src/pages/login.tsx` - Validação mock

#### **Problema Crítico Identificado:**
- 🔴 **Páginas quebram sem MCP**: Hooks pesados causam crash
- 🔴 **Turbopack errors**: Sem fallbacks adequados
- 🔴 **Offline experience**: Inconsistente entre páginas

---

## 🚀 **FASE 1: OFFLINE-FIRST FOUNDATION** 
### *Garantir que TODAS as páginas funcionem sem MCP*

#### **1.1 - Service Layer Resiliente**
```typescript
// src/lib/resilientMcpService.ts
class ResilientMCPService {
  private fallbackMode = false;
  private retryCount = 0;
  
  async safeRequest(endpoint: string, fallbackData: any) {
    try {
      if (this.fallbackMode) return fallbackData;
      const response = await fetch(endpoint);
      return response.json();
    } catch (error) {
      this.fallbackMode = true;
      console.warn(`MCP offline, using fallback for ${endpoint}`);
      return fallbackData;
    }
  }
}
```

#### **1.2 - Context Provider Robusto**
- ✅ Substituir AppContext com fallbacks inteligentes
- ✅ Loading states apropriados
- ✅ Error boundaries para cada seção
- ✅ Offline detection automática

#### **1.3 - Hooks Defensivos**
- ✅ `useMCPData` com timeout e fallback
- ✅ `useMCPServers` com cache local
- ✅ `useAPIManager` com retry logic

---

## 🌐 **FASE 2: WEBSOCKETS & REAL-TIME**
### *Sistema de Messaging/Broadcasting ÉPICO*

#### **2.1 - WebSocket Manager**
```typescript
// src/lib/websocketManager.ts
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers = new Map<string, Function[]>();
  
  connect(url: string) {
    // Auto-reconnect WebSocket with exponential backoff
  }
  
  subscribe(event: string, callback: Function) {
    // Event subscription system
  }
  
  broadcast(event: string, data: any) {
    // Broadcast to all subscribers
  }
}
```

#### **2.2 - Real-time Features**
- 🔥 **Live Server Status**: Status em tempo real
- 🔥 **Pipeline Updates**: Notificações de deploy
- 🔥 **Chat System**: Comunicação entre componentes
- 🔥 **Activity Feed**: Updates automáticos
- 🔥 **System Alerts**: Notificações push

#### **2.3 - Broadcasting Architecture**
```typescript
// Events System
interface KortexEvents {
  'server:status': { serverId: string, status: string };
  'pipeline:update': { pipelineId: string, stage: string };
  'user:action': { userId: string, action: string };
  'system:alert': { type: 'info'|'warning'|'error', message: string };
}
```

---

## 🔧 **FASE 3: PROGRESSIVE ENHANCEMENT**
### *Um componente de cada vez, mas com resultado garantido*

#### **3.1 - Ordem de Ataque Estratégica**

**1. Dashboard (Mais Crítico)**
- ✅ **Status Cards**: Dados reais de servidores
- ✅ **Activity Feed**: WebSocket real-time
- ✅ **Quick Actions**: Integração com APIs

**2. Servers Page**
- ✅ **Server List**: API real + WebSocket updates
- ✅ **Server Details**: Métricas em tempo real
- ✅ **Actions**: Start/Stop/Restart real

**3. Analytics Page**
- ✅ **Charts**: Dados reais de métricas
- ✅ **Performance**: Real-time monitoring
- ✅ **Reports**: Export funcional

**4. Helm Page**
- ✅ **Kubernetes Integration**: Real kubectl calls
- ✅ **Chart Management**: Helm operations
- ✅ **Deployment Status**: Live updates

#### **3.2 - Implementation Strategy**
```typescript
// Progressive Enhancement Pattern
const useServerData = (serverId: string) => {
  const [data, setData] = useState(FALLBACK_DATA);
  const [isReal, setIsReal] = useState(false);
  
  useEffect(() => {
    // Tenta dados reais, fallback para mock
    fetchRealData().then(realData => {
      setData(realData);
      setIsReal(true);
    }).catch(() => {
      // Mantém fallback, mas funciona
      console.warn('Using fallback data');
    });
  }, [serverId]);
  
  return { data, isReal, isLoading: false };
};
```

---

## 🎨 **FASE 4: UX ENHANCEMENTS**
### *Interface que mostra o status real*

#### **4.1 - Connection Status UI**
- 🔍 **Status Indicator**: Online/Offline/Connecting
- 🔍 **Data Freshness**: Timestamp dos dados
- 🔍 **Retry Button**: Manual refresh quando offline
- 🔍 **Fallback Notice**: "Running in demo mode"

#### **4.2 - Real-time Indicators**
- 🔴 **Live Dot**: Piscando para dados ao vivo
- ⚡ **WebSocket Status**: Conectado/Desconectado
- 📊 **Data Age**: "Updated 2 minutes ago"
- 🔄 **Sync Status**: Loading/Synced/Failed

---

## 🏗️ **ARQUITETURA FINAL PROPOSTA**

```typescript
// Kornex Architecture v2.0
Kortex Frontend
├── WebSocket Manager (Real-time)
├── Resilient Service Layer (Offline-first) 
├── Progressive Enhancement Hooks (Fallback-aware)
├── Context Providers (Defensive)
└── UI Components (Status-aware)

// Integration Points
Kortex ←→ WebSocket ←→ Kosmos ←→ Synex ←→ MCP Servers
```

### **Key Features:**
- ✅ **Offline-First**: Tudo funciona sem servidor
- ✅ **Progressive**: Melhora com conectividade
- ✅ **Real-time**: WebSockets para updates live
- ✅ **Resilient**: Error boundaries e fallbacks
- ✅ **Broadcasting**: Sistema de eventos interno

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

### **Passo 1: Base Resiliente** (Hoje)
1. ✅ Criar `ResilientMCPService`
2. ✅ Substituir `AppContext` com fallbacks
3. ✅ Testar todas as páginas offline

### **Passo 2: WebSocket Foundation** (Amanhã)
1. ✅ Implementar `WebSocketManager`
2. ✅ Sistema de eventos básico
3. ✅ Conectar com Kosmos

### **Passo 3: Progressive Enhancement** (Esta semana)
1. ✅ Dashboard com dados reais
2. ✅ Servers page funcionais
3. ✅ Analytics com métricas reais

---

## 💡 **RESPOSTA ÀS SUAS PERGUNTAS**

### **"Começar tirar os mocks aos poucos?"**
- ✅ **SIM! Estratégia perfeita!** Uma de cada vez, com fallback garantido
- ✅ **Progressive Enhancement**: Cada componente melhora com conectividade
- ✅ **Risk-Free**: Se um falha, os outros continuam funcionando

### **"Páginas não abrem sem MCP?"**
- 🔧 **PRIORIDADE MÁXIMA!** Vamos criar service layer resiliente
- 🔧 **Offline-First**: Toda página funcionará sem servidor
- 🔧 **Smart Fallbacks**: Dados demo quando necessário

### **"Sistema de WebSockets/Broadcasting?"**
- 🔥 **ÉPICO! Vai dar um sabor incrível!**
- 🔥 **Real-time Dashboard**: Status ao vivo
- 🔥 **Live Notifications**: Alerts automáticos  
- 🔥 **Inter-component Communication**: Como Discord/Slack

---

## 🚀 **COMEÇAMOS AGORA?**

**Proposta**: Começar pela **base resiliente** hoje mesmo! Garantir que todas as páginas funcionem offline, depois adicionar WebSockets para o sabor especial.

**O que acha? Atacamos a Fase 1 agora?** 🎯
