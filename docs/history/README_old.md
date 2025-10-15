# ![![Pulse Banner](/docs/assets/top_banner_md_c.png)](/docs/assets/top_banner_md_c.png)

---

## PulseDashboard

Sistema de monitoramento e manipulação de tarefas AI executadas em servidores MCP.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── StatusBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── NotificationCenter.tsx
│   └── dashboard/
│       └── TaskCard.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── MonitorPage.tsx
│   └── AnalyticsPage.tsx
├── context/
│   └── AppContext.tsx
├── hooks/
│   └── useTheme.ts
├── types/
│   └── index.ts
└── App.tsx
```

## 🎯 Funcionalidades

- ✅ Dashboard com estatísticas em tempo real
- ✅ Live Monitor com logs simulados e filtros
- ✅ Analytics com KPIs e gráficos
- ✅ Sistema de notificações integrado
- ✅ Context API para estado global
- ✅ Tema claro/escuro
- ✅ Layout 100% responsivo
- ✅ Animações e microinterações

## 🛠️ Extração de Arquivos

Para extrair os arquivos deste código, use o script de extração v2.0:

```bash
# Listar todos os arquivos
grep "^///" codigo.txt | sed 's/^\/\/m\/ \(.*\) \/m\/\/$/\1/'

# Extrair com o script v2.0 (fornecido separadamente)
./extract-files.sh codigo.txt ./meu-projeto
```

⚠️ **Formato dos marcadores**: `/// caminho/arquivo ///`

## 🚀 Deploy

O projeto está configurado para build estático com Next.js:

```bash
npm run build
# Os arquivos estarão em ./out/
```

## 🧩 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Estado global

## 🔧 Sistema de Marcadores v2.0

Este projeto usa marcadores únicos para decomposição:

- **Formato**: `/// caminho/arquivo ///`
- **Vantagem**: Nunca conflita com código JavaScript/TypeScript
- **Compatível**: grep, sed, awk e ferramentas Unix
