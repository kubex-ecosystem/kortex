
# 🌐 Kortex Dashboard – Real-Time DevOps & AI Monitoring

> Enterprise-grade dashboard for monitoring API usage, rate limits, and development workflows across GitHub, Azure DevOps, and AI pipelines – in real-time.

&#x20;&#x20;

---

## 🚀 What is Kortex?

Kortex is a modular, real-time monitoring dashboard designed for developers, AI engineers, and DevOps teams. It integrates live telemetry from GitHub, Azure DevOps, and your own infrastructure via the [StatusRafa MCP Server](https://github.com/rafa-mori/statusrafa-mcp).

**Use Cases:**

- Monitor rate limits before they break your builds
- Track API provider health in real time
- Pause polling and optimize usage dynamically
- Visualize performance and telemetry from GitHub, Azure, and LLM agents

---

## 🧱 Core Features

✅ Live WebSocket monitoring (no refresh needed)\
✅ Animated UI with performance indicators\
✅ Auto-pause for providers hitting rate limits\
✅ Remote MCP configuration via UI\
✅ Toast alerts, smart logs, and timestamp tracking\
✅ Fully modular (Next.js + Tailwind CSS + TypeScript)\
✅ Compatible with TimeCraft AI and the Kubex Ecosystem

---

## 🖥️ Live Dashboard Preview

---

## 📦 Installation (Development)

```bash
# 1. Clone the repo
$ git clone https://github.com/rafa-mori/kortex.git && cd kortex

# 2. Install dependencies
$ npm install

# 3. Start dev server (http://localhost:3001)
$ npm run dev

# MCP Server required (run separately)
```

### Optional: Start MCP HTTP + WebSocket server

```bash
cd ../timecraft_ai
uv run --env-file .env timecraft_ai/mcp/api_server.py
```

---

## ⚙️ Environment Variables (Kortex)

Create a `.env.local` file in the `kortex/` directory:

```env
NEXT_PUBLIC_BACKEND_HOST=http://127.0.0.1:3002
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3002/ws
```

Backend port `3002` is used by the MCP HTTP + WebSocket API.

---

## 🧠 Part of the Kubex Ecosystem

Kortex is one of the key modules inside the Kubex ecosystem. It integrates with:

- **TimeCraft AI**: LLM agent orchestrator + suggestions + memory
- **StatusRafa MCP Server**: Real-time telemetry + API unification
- **GoForge**: DevOps pipelines and auto-compilation

Explore more: [kubex.dev (coming soon)](https://kubex.rafa-mori.dev)

---

## 📊 Architecture Overview

```mermaid
system datagraph TD
    A[Kortex Dashboard (Next.js)] --> B[API Proxy /api/mcp/*]
    B --> C[StatusRafa HTTP API (Python)]
    C --> D[GitHub | Azure | MCP Memory]
    C --> E[WebSocket /ws] --> A
```

---

## 🛠 Roadmap Highlights

-

See full roadmap → [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## 🤝 Contributing

Contributions are welcome! Please open issues or PRs.

```bash
# Format & Lint
npm run lint

# Build static site
npm run build
```

---

## 📄 License

MIT © Rafael Mori

---
