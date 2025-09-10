# MIGRATION PLAN — analyzer-frontend → kortex

Data: 2025-09-10

---

## 1) Inventory

| Área | Item | Caminho | Observações |
| - | - | - | - |
| rotas/páginas | LandingPage.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/landing/LandingPage.tsx | No alvo: MISSING |
| rotas/páginas | Dashboard.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/dashboard/Dashboard.tsx | No alvo: src/components/Dashboard/Dashboard.tsx (não equivalente) |
| rotas/páginas | ProjectInput.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/input/ProjectInput.tsx | No alvo: MISSING |
| rotas/páginas | SuggestionsDisplay.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/analysis/SuggestionsDisplay.tsx | No alvo: MISSING |
| rotas/páginas | EvolutionDisplay.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/analysis/EvolutionDisplay.tsx | No alvo: MISSING |
| rotas/páginas | HistoryPanel.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/history/HistoryPanel.tsx | No alvo: MISSING |
| rotas/páginas | KanbanBoard.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/kanban/KanbanBoard.tsx | No alvo: MISSING |
| componentes reutilizáveis | DifficultyMeter.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/DifficultyMeter.tsx | No alvo: MISSING |
| componentes reutilizáveis | Loader.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/Loader.tsx | No alvo: MISSING |
| componentes reutilizáveis | MaturityKpiCard.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/MaturityKpiCard.tsx | No alvo: MISSING |
| componentes reutilizáveis | NetworkStatusIndicator.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/NetworkStatusIndicator.tsx | No alvo: MISSING |
| componentes reutilizáveis | NotificationContainer.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/NotificationContainer.tsx | No alvo: MISSING |
| componentes reutilizáveis | NotificationToast.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/NotificationToast.tsx | No alvo: MISSING |
| componentes reutilizáveis | Sparkline.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/Sparkline.tsx | No alvo: MISSING |
| componentes reutilizáveis | SubtleTokenUsage.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/SubtleTokenUsage.tsx | No alvo: MISSING |
| componentes reutilizáveis | TokenUsageAlert.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/TokenUsageAlert.tsx | No alvo: MISSING |
| componentes reutilizáveis | ViabilityScore.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/ViabilityScore.tsx | No alvo: MISSING |
| componentes reutilizáveis | Header.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/layout/Header.tsx | No alvo: src/components/Layout/Header.tsx (diferente) |
| componentes reutilizáveis | NavigationBar.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/layout/NavigationBar.tsx | No alvo: MISSING |
| componentes reutilizáveis | SettingsModal.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/settings/SettingsModal.tsx | No alvo: MISSING |
| componentes reutilizáveis | ProfileModal.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/user/ProfileModal.tsx | No alvo: MISSING |
| estado global | AuthContext.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/AuthContext.tsx | No alvo: MISSING (usa KortexContext.tsx) |
| estado global | LanguageContext.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/LanguageContext.tsx | No alvo: MISSING |
| estado global | NotificationContext.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/NotificationContext.tsx | No alvo: MISSING |
| temas/estilos | index.css | /srv/apps/LIFE/KUBEX/analyzer-frontend/index.css | Utiliza classes estilo Tailwind; sem Tailwind no ref |
| temas/estilos | tailwind.config.js | — | MISSING no ref; Presente no alvo (tailwind.config.js) |
| ícones | lucide-react | package.json (ref) | Presente no alvo |
| hooks | useNetworkStatus.ts | /srv/apps/LIFE/KUBEX/analyzer-frontend/hooks/useNetworkStatus.ts | No alvo: MISSING |
| hooks | usePersistentState.ts | /srv/apps/LIFE/KUBEX/analyzer-frontend/hooks/usePersistentState.ts | No alvo: MISSING |
| hooks | useTranslation.ts | /srv/apps/LIFE/KUBEX/analyzer-frontend/hooks/useTranslation.ts | No alvo: MISSING |
| gráficos | Sparkline.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/common/Sparkline.tsx | No alvo: MISSING |
| gráficos | TrendChart.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/dashboard/TrendChart.tsx | No alvo: MISSING |
| providers | AuthProvider | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/AuthContext.tsx | No alvo: MISSING |
| providers | LanguageProvider | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/LanguageContext.tsx | No alvo: MISSING |
| providers | NotificationProvider | /srv/apps/LIFE/KUBEX/analyzer-frontend/contexts/NotificationContext.tsx | No alvo: MISSING |
| layouts | Header.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/layout/Header.tsx | No alvo: src/components/Layout/Header.tsx (diferente) |
| layouts | NavigationBar.tsx | /srv/apps/LIFE/KUBEX/analyzer-frontend/components/layout/NavigationBar.tsx | No alvo: MISSING |
| assets | locales/en-US/translation.json | /srv/apps/LIFE/KUBEX/analyzer-frontend/public/locales/en-US/translation.json | No alvo: MISSING |
| assets | locales/pt-BR/translation.json | /srv/apps/LIFE/KUBEX/analyzer-frontend/public/locales/pt-BR/translation.json | No alvo: MISSING |
| envs | .env.local | /srv/apps/LIFE/KUBEX/analyzer-frontend/.env.local | Alvo: sem .env* |
| envs | vite.config.ts (define env) | /srv/apps/LIFE/KUBEX/analyzer-frontend/vite.config.ts | Alvo: vite.config.ts (GoBE/MCP vars) |
| dependências NPM | @google/genai | ref: devDependencies | No alvo: MISSING |
| dependências NPM | react, react-dom | ref: dependencies | Presente no alvo |
| dependências NPM | react-markdown, remark-gfm | ref: dependencies | Presente no alvo |
| dependências NPM | react-syntax-highlighter | ref: dependencies | Presente no alvo |
| dependências NPM | lucide-react | ref: dependencies | Presente no alvo |
| dependências NPM | framer-motion | ref: devDependencies | Presente no alvo |
| dependências NPM | tailwindcss/postcss/autoprefixer | — | Ref: MISSING; Alvo: Presente |
| dependências NPM | zustand | — | Ref: MISSING; Alvo: Presente (não utilizado) |


## 2) Gaps (paridade mínima no kortex)

| Item | Status atual | Ação necessária | Prioridade |
| - | - | - | - |
| services/gemini (api.ts, prompts.ts, schemas.ts, utils.ts) | MISSING | Replicar pasta `services/gemini` do ref (ajustar imports/aliases) | P0 |
| @google/genai | MISSING | Adicionar dependência e configurar uso no frontend (chave via UI) | P0 |
| hooks/usePersistentState | MISSING | Portar `hooks/usePersistentState.ts` + `lib/idb.ts` | P0 |
| providers/LanguageProvider | MISSING | Implementar `contexts/LanguageContext.tsx` e carregar `public/locales` | P0 |
| i18n assets | MISSING | Copiar `public/locales/{en-US,pt-BR}/translation.json` | P0 |
| providers/NotificationProvider | MISSING | Implementar `contexts/NotificationContext.tsx` + UI de toasts | P0 |
| notificações UI | MISSING | Portar `components/common/NotificationContainer.tsx` e `NotificationToast.tsx` | P0 |
| ProjectInput | MISSING | Portar `components/input/ProjectInput.tsx` e integrar com `services/gemini` | P0 |
| Results view | MISSING | Portar `components/analysis/SuggestionsDisplay.tsx` | P0 |
| Dashboard (analyzer métricas) | MISSING | Portar `components/dashboard/Dashboard.tsx` (ref) ou integrar métricas no dashboard atual | P1 |
| Evolution view | MISSING | Portar `components/analysis/EvolutionDisplay.tsx` + compare | P1 |
| HistoryPanel | MISSING | Portar `components/history/HistoryPanel.tsx` + persistência (IndexedDB/LS) | P1 |
| KanbanBoard | MISSING | Portar `components/kanban/KanbanBoard.tsx` (a partir de `ProjectAnalysis`) | P1 |
| Layout/NavigationBar | MISSING | Portar `components/layout/NavigationBar.tsx` (ou integrar à Sidebar) | P1 |
| Loader/Feedback | MISSING | Portar `components/common/Loader.tsx` | P1 |
| NetworkStatusIndicator | MISSING | Portar `components/common/NetworkStatusIndicator.tsx` + `hooks/useNetworkStatus` | P1 |
| Gráficos (Sparkline/TrendChart) | MISSING | Portar `components/common/Sparkline.tsx` e `dashboard/TrendChart.tsx` (ou usar Recharts) | P1 |
| Settings/Profile modals | MISSING | Portar `components/settings/SettingsModal.tsx` e `components/user/ProfileModal.tsx` | P2 |
| Common UI (DifficultyMeter/TokenUsage/Viability) | MISSING | Portar componentes de `components/common/*` relevantes | P2 |
| Tailwind util classes do ref | Parcial | Garantir utilitários gerados (Tailwind já configurado no alvo) | P2 |
| AuthProvider (mock) | MISSING | Portar `contexts/AuthContext.tsx` se necessário | P2 |
| Rotas (SPA state) | Diferente | Reproduzir navegação por `view` dentro do alvo ou adotar router | P2 |


## 3) Stack Alvo Mínima (sugerida) — validação

- Next.js: referência usa Vite (MISSING em ambos); alvo usa Vite. Migração opcional.
- TypeScript: presente no ref e no alvo (OK).
- Tailwind CSS: ref MISSING; alvo OK (tailwind.config.js + postcss.config.js).
- shadcn/ui: MISSING no ref e no alvo.
- lucide-react: presente no ref e no alvo (OK).
- recharts: MISSING no ref e no alvo (ref usa Sparkline/TrendChart custom).
- framer-motion: presente no ref e no alvo (OK).

Observação: Para paridade rápida, manter Vite no alvo e só introduzir Next.js se necessário por SEO/rotas/SSR.


## 4) Breaking Points

- Gemini SDK (@google/genai): requer chave do usuário; chamadas client-side. Checar limites/CORS e UX para inserir API key (ProfileModal).
- Persistência local: IndexedDB + localStorage via `lib/idb.ts` e `usePersistentState` (atenção a SSR — não aplicável no Vite SPA atual).
- i18n por fetch: carrega `/public/locales/{locale}/translation.json`; precisa dos arquivos e fallback para `en-US`.
- Navegação por `view` (sem router): o ref alterna views em `App.tsx`; no alvo existe `currentView` na Sidebar mas telas equivalentes do analyzer estão ausentes.
- Tailwind utilities: ref usa classes utilitárias porém não tem Tailwind; no alvo Tailwind já está ativo — garantir que as classes usadas existam no build.
- Env vars: ambos definem `process.env.*` no Vite; evitar depender de segredos em runtime client-side.
- Dependências: `framer-motion` é utilizado em runtime; garantir que não esteja apenas em devDependencies.


## 5) Notas do Alvo (kortex)

- Estado global existente: `src/contexts/KortexContext.tsx` (useReducer) com `currentView`, métricas e UI; `zustand` está instalado mas não utilizado.
- Layout existente: `src/components/Layout/{Header,Sidebar,Layout}.tsx`.
- Dashboard existente: `src/components/Dashboard/*` (MetricsCards, ServersList, ActiveTasks, SystemHealth, QuickActions).
- Estilos: Tailwind configurado (tailwind.config.js, postcss.config.js); `src/index.css` usa tokens CSS e util classes.
- Assets: `public/styles/globals.css`, `public/sitemap.xml` (sem `public/locales`).


## 6) Próximos Passos (sugeridos)

1. Adicionar dependência `@google/genai` e criar `src/services/gemini/{api.ts,prompts.ts,schemas.ts,utils.ts}`.
2. Portar `hooks/usePersistentState.ts` e `lib/idb.ts` para persistência de histórico/perfil.
3. Implementar `contexts/{LanguageContext,NotificationContext}.tsx` e UI de toasts.
4. Adicionar `public/locales/{en-US,pt-BR}/translation.json` e `hooks/useTranslation.ts`.
5. Portar telas-base: `ProjectInput.tsx` + `SuggestionsDisplay.tsx` e integrar no `Layout` do alvo (toggle por `currentView`).
6. Adicionar Evolution/History/Kanban gradualmente e componentes comuns (Loader, NetworkStatusIndicator, DifficultyMeter etc.).
7. Revisar Tailwind classes do ref para manter nomenclatura/utilitários ou substituir por shadcn/ui onde fizer sentido.

