# 🎯 SubAgent Work View — War Room Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Soketi](https://img.shields.io/badge/Soketi-WebSocket-8B5CF6?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

![Commits](https://img.shields.io/badge/commits-42+-blue?style=flat-square)
![Contributors](https://img.shields.io/badge/contributors-2-green?style=flat-square)
![LOC](https://img.shields.io/badge/lines_of_code-677K+-orange?style=flat-square)
![Version](https://img.shields.io/badge/version-v1.0.0-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/tests-100%25_passed-22C55E?style=flat-square)

**Dashboard monitoring realtime buat ngawasin AI sub-agent yang jalan di server kamu.**

Auto-detect agent dari **Claude Code**, **OpenClaw**, dan **Copilot CLI** — semua keliatan live di satu layar.

[🌐 Live Demo](https://live-agents.tams.codes) · [🐛 Report Bug](https://github.com/el-pablos/subagent-work-view/issues) · [📖 Docs](https://porto.tams.codes)

</div>

---

## 📝 Deskripsi Projek

SubAgent Work View itu **war room dashboard** buat monitoring AI agent secara realtime. Jadi misal kamu lagi jalanin Claude Code, OpenClaw, atau Copilot CLI di server — semua agent, task, dan message mereka bakal muncul otomatis di dashboard ini lewat WebSocket.

Bayangin kayak mission control NASA, tapi buat AI agents 🚀

### Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Auto-detect Agents** | Otomatis detect agent dari Claude Code, OpenClaw, dan Copilot CLI |
| 📡 **Realtime Updates** | WebSocket live updates via Soketi (Pusher-compatible) |
| 🗺️ **Agent Topology** | Visualisasi koneksi antar agent dalam circular layout |
| 📋 **Task Tracker** | Pantau progress task dengan timeline dan progress bar |
| 💬 **Communication Log** | Semua inter-agent message dalam satu panel |
| 🔔 **Smart Notifications** | Toast + drawer buat event penting (spawn, complete, error) |
| 🌙 **Dark Glassmorphism** | Design modern dengan backdrop blur yang keren |
| 📱 **Mobile-first** | Bottom nav di mobile, 12-column grid di desktop |
| ⚡ **PWA Ready** | Bisa di-install sebagai app, offline-capable |
| 🔄 **Auto-reconnect** | WebSocket reconnect otomatis dengan exponential backoff |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                            │
│                                  │                                               │
│                          ┌───────▼───────┐                                       │
│                          │   CLOUDFLARE   │                                      │
│                          │   (DNS/CDN)    │                                      │
│                          └───────┬───────┘                                       │
└──────────────────────────────────┼───────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────────┐
│                              VPS SERVER                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                    NGINX (:443 HTTPS + SSL/TLS)                              │ │
│  │              Let's Encrypt Auto-Renewal Certificate                          │ │
│  └─────────────────────────┬───────────────────────────────────────────────────┘ │
│                            │                                                      │
│     ┌──────────────────────┼──────────────────────────────────────┐              │
│     │                      │                                      │              │
│     ▼                      ▼                                      ▼              │
│  ┌──────────┐       ┌──────────────┐                      ┌──────────────┐       │
│  │ FRONTEND │       │   BACKEND    │                      │   WEBSOCKET  │       │
│  │  (SPA)   │       │     API      │                      │    PROXY     │       │
│  │ /dist/*  │       │ /api/v1/*    │                      │ /app/* /apps │       │
│  └──────────┘       └──────┬───────┘                      └──────┬───────┘       │
│                            │                                      │              │
│                            ▼                                      ▼              │
│                 ┌──────────────────┐                    ┌──────────────────┐     │
│                 │   PHP-FPM 8.3    │                    │     SOKETI       │     │
│                 │   Laravel 11     │◄──── broadcast ────│    (Docker)      │     │
│                 │  :8005 (TCP)     │                    │  :6001 (WS)      │     │
│                 └────────┬─────────┘                    └──────────────────┘     │
│                          │                                                       │
│           ┌──────────────┼──────────────┐                                       │
│           │              │              │                                        │
│           ▼              ▼              ▼                                        │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                               │
│   │   MySQL 8   │ │    Redis    │ │   Queue     │                               │
│   │  :3306      │ │   :6379     │ │  Worker     │                               │
│   └─────────────┘ └─────────────┘ └─────────────┘                               │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                    ▲                ▲                 ▲
                    │                │                 │
               ┌────┴────┐     ┌─────┴─────┐    ┌─────┴──────┐
               │ Claude  │     │ OpenClaw  │    │ Copilot    │
               │  Code   │     │  Gateway  │    │   CLI      │
               │ (hooks) │     │ (JSONL)   │    │ (webhook)  │
               └─────────┘     └───────────┘    └────────────┘
```

---

## 🔄 Flow Data (Webhook → Realtime)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────┐                                                                 │
│  │ Claude Code │──┐                                                              │
│  │   (hooks)   │  │                                                              │
│  └─────────────┘  │                                                              │
│                   │     POST /api/v1/webhook/{source}                            │
│  ┌─────────────┐  │     ┌─────────────────────────────────────────────────────┐ │
│  │  OpenClaw   │──┼────▶│                WEBHOOK CONTROLLER                    │ │
│  │  (JSONL)    │  │     │  • Validate payload                                  │ │
│  └─────────────┘  │     │  • Normalize format (claude/openclaw/copilot)        │ │
│                   │     │  • Extract session_id, agent_id, event_type          │ │
│  ┌─────────────┐  │     └──────────────────────┬──────────────────────────────┘ │
│  │ Copilot CLI │──┘                            │                                 │
│  │  (webhook)  │                               ▼                                 │
│  └─────────────┘                    ┌─────────────────────┐                     │
│                                     │  AGENT INGEST SVC   │                     │
│                                     │  • upsertSession()  │                     │
│                                     │  • upsertAgent()    │                     │
│                                     │  • createMessage()  │                     │
│                                     └──────────┬──────────┘                     │
│                                                │                                 │
│                           ┌────────────────────┼────────────────────┐           │
│                           ▼                    ▼                    ▼           │
│                    ┌────────────┐       ┌────────────┐       ┌────────────┐    │
│                    │   MySQL    │       │  Broadcast │       │   Redis    │    │
│                    │  (store)   │       │   Event    │       │  (cache)   │    │
│                    └────────────┘       └─────┬──────┘       └────────────┘    │
│                                               │                                 │
│                                               ▼                                 │
│                                        ┌────────────┐                          │
│                                        │   SOKETI   │                          │
│                                        │ WebSocket  │                          │
│                                        └─────┬──────┘                          │
│                                               │                                 │
│                                               ▼                                 │
│                                        ┌────────────┐                          │
│                                        │  FRONTEND  │                          │
│                                        │  (React)   │                          │
│                                        │  Realtime! │                          │
│                                        └────────────┘                          │
│                                                                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Session     │       │      Agent      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id          PK  │──┐    │ id          PK  │    ┌──│ id          PK  │
│ name            │  │    │ uuid            │    │  │ uuid            │
│ email           │  │    │ external_id     │    │  │ name            │
│ password        │  └───▶│ created_by  FK  │    │  │ type (enum)     │
│ created_at      │       │ status (enum)   │◀───┼──│ session_id  FK  │
│ updated_at      │       │ command_source  │    │  │ status (enum)   │
└─────────────────┘       │ original_command│    │  │ source          │
                          │ context (json)  │    │  │ capabilities    │
                          │ started_at      │    │  │ last_seen_at    │
                          │ ended_at        │    │  └────────┬────────┘
                          └────────┬────────┘    │           │
                                   │             │           │ has many
                          has many │             │           ▼
                                   ▼             │  ┌─────────────────┐
                          ┌─────────────────┐   │  │    TaskLog      │
                          │      Task       │   │  ├─────────────────┤
                          ├─────────────────┤   │  │ id          PK  │
                          │ id          PK  │◀──┼──│ task_id     FK  │
                          │ uuid            │   │  │ agent_id    FK  │──┐
                          │ session_id  FK  │   │  │ action          │  │
                          │ title           │   │  │ notes           │  │
                          │ status (enum)   │   │  │ meta (json)     │  │
                          │ agent_id    FK  │───┘  │ timestamp       │  │
                          │ progress 0-100  │      └─────────────────┘  │
                          │ dependencies    │                           │
                          │ payload (json)  │                           │
                          │ result (json)   │                           │
                          └────────┬────────┘                           │
                                   │                                    │
                          has many │                                    │
                                   ▼                                    │
                          ┌─────────────────┐                           │
                          │    Message      │                           │
                          ├─────────────────┤                           │
                          │ id          PK  │                           │
                          │ session_id  FK  │                           │
                          │ from_agent  FK  │◀──────────────────────────┤
                          │ to_agent    FK  │◀──────────────────────────┘
                          │ content         │
                          │ message_type    │
                          │ channel         │
                          │ timestamp       │
                          └─────────────────┘
```

### Enum Values

| Enum | Values |
|------|--------|
| **AgentStatus** | `idle`, `busy`, `communicating`, `error`, `offline` |
| **AgentType** | `planner`, `architect`, `coder`, `reviewer`, `tester`, `docs`, `devops` |
| **SessionStatus** | `queued`, `planning`, `running`, `completed`, `failed`, `cancelled` |
| **TaskStatus** | `pending`, `assigned`, `running`, `blocked`, `completed`, `failed`, `cancelled` |
| **MessageType** | `agent`, `system`, `user`, `broadcast` |

---

## 📡 WebSocket Events

### Channel Structure

| Channel | Scope | Events |
|---------|-------|--------|
| `dashboard.global` | Global | All dashboard updates |
| `session.{id}` | Session-specific | Messages, task updates |
| `agent.{id}` | Agent-specific | Status changes |

### Event Types

| Event | Channel | Payload | Trigger |
|-------|---------|---------|---------|
| `agent.created` | dashboard.global | `{agent: {...}}` | Agent spawned |
| `agent.status_changed` | dashboard.global, agent.{id} | `{agent: {...}}` | Status update |
| `session.created` | dashboard.global | `{session: {...}}` | New session |
| `session.completed` | dashboard.global, session.{id} | `{session: {...}}` | Session finished |
| `task.created` | dashboard.global, session.{id} | `{task: {...}}` | New task |
| `task.updated` | dashboard.global, session.{id} | `{task: {...}}` | Progress update |
| `task.completed` | dashboard.global, session.{id} | `{task: {...}}` | Task finished |
| `message.created` | session.{id} | `{message: {...}}` | Inter-agent message |

---

## 🔗 API Endpoints

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/sessions` | List semua sessions (paginated) |
| `POST` | `/api/v1/sessions` | Buat session baru |
| `GET` | `/api/v1/sessions/{id}` | Detail session |
| `GET` | `/api/v1/sessions/active` | Sessions yang lagi running |
| `POST` | `/api/v1/sessions/{id}/start` | Start session |
| `POST` | `/api/v1/sessions/{id}/cancel` | Cancel session |
| `GET` | `/api/v1/sessions/{id}/timeline` | Timeline events |

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/agents` | List semua agents |
| `POST` | `/api/v1/agents` | Register agent baru |
| `PATCH` | `/api/v1/agents/{id}/status` | Update status agent |
| `POST` | `/api/v1/agents/{id}/heartbeat` | Heartbeat ping |
| `GET` | `/api/v1/agents/overview/stats` | Statistik agents |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tasks` | List tasks (filterable) |
| `POST` | `/api/v1/tasks` | Buat task baru |
| `POST` | `/api/v1/tasks/{id}/assign` | Assign ke agent |
| `POST` | `/api/v1/tasks/{id}/retry` | Retry failed task |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/webhook/claude` | Webhook dari Claude Code |
| `POST` | `/api/v1/webhook/openclaw` | Webhook dari OpenClaw |
| `POST` | `/api/v1/webhook/copilot-cli` | Webhook dari Copilot CLI |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/overview` | Overview stats |
| `GET` | `/api/v1/dashboard/metrics` | Performance metrics |
| `GET` | `/api/v1/health` | Health check |

---

## 🗂️ Struktur Folder

```
subagent-work-view/
├── 📁 frontend/                      # React 19 + Vite 8 + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 agents/            # AgentNode, AgentTopologyPanel, StatusRing
│   │   │   ├── 📁 command/           # CommandConsole, CommandPalette
│   │   │   ├── 📁 common/            # Badge, GlassPanel, Toast, Skeleton
│   │   │   ├── 📁 communication/     # MessageBubble, CommunicationLogPanel
│   │   │   ├── 📁 layout/            # WarRoomLayout, Header
│   │   │   └── 📁 tasks/             # TaskCard, TaskTimeline, ProgressBar
│   │   ├── 📁 hooks/                 # useWebSocket, useDebounce, useMediaQuery
│   │   ├── 📁 stores/                # Zustand: agent, task, session, notification
│   │   ├── 📁 services/              # api.ts, websocket.ts (auto-reconnect)
│   │   ├── 📁 lib/                   # adapters, animations, utils
│   │   └── 📁 types/                 # TypeScript definitions
│   ├── 📁 e2e/                       # Playwright E2E tests
│   └── 📁 dist/                      # Production build
│
├── 📁 backend/                       # Laravel 11 + PHP 8.3
│   ├── 📁 app/
│   │   ├── 📁 Http/Controllers/Api/  # REST API controllers
│   │   ├── 📁 Models/                # Agent, Session, Task, Message, TaskLog
│   │   ├── 📁 Events/                # Broadcasting events
│   │   ├── 📁 Jobs/                  # Queue jobs
│   │   ├── 📁 Services/
│   │   │   ├── 📁 Orchestration/     # TaskPlanner, TaskDistribution
│   │   │   ├── 📁 Webhook/           # AgentIngest, WebhookNormalizer
│   │   │   └── 📁 Agent/             # AgentHealth, AgentRegistry
│   │   └── 📁 Enums/                 # Status enums
│   ├── 📁 database/migrations/       # Schema definitions
│   └── 📁 routes/api.php             # API routes
│
├── 📁 docker/                        # Docker configs
│   ├── 📁 nginx/                     # Nginx config
│   ├── 📁 php/                       # PHP-FPM Dockerfile
│   └── 📁 supervisor/                # Queue worker config
│
├── 📁 claude-hooks/                  # Claude Code integration
├── 📁 .github/workflows/             # CI/CD pipeline
├── 📄 docker-compose.yml             # Development stack
└── 📄 README.md                      # You are here!
```

---

## ⚙️ Environment Variables

### Backend `.env`
```bash
# App
APP_NAME="SubAgent Work View"
APP_ENV=production
APP_URL=https://live-agents.tams.codes

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=subagent_workview
DB_USERNAME=root
DB_PASSWORD=secret

# Broadcasting (Soketi)
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=subagent-app
PUSHER_APP_KEY=subagent-key
PUSHER_APP_SECRET=subagent-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# Queue
QUEUE_CONNECTION=database
```

### Frontend `.env`
```bash
VITE_API_URL=https://live-agents.tams.codes/api
VITE_PUSHER_APP_KEY=subagent-key
VITE_PUSHER_HOST=live-agents.tams.codes
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- PHP 8.3+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Development

```bash
# Clone repo
git clone https://github.com/el-pablos/subagent-work-view.git
cd subagent-work-view

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173

# Backend (terminal baru)
cd backend
cp .env.example .env
composer install
php artisan migrate
php artisan serve  # http://localhost:8000

# Soketi WebSocket (terminal baru)
docker run -d --name soketi \
  -p 6001:6001 \
  -e SOKETI_DEFAULT_APP_ID=subagent-app \
  -e SOKETI_DEFAULT_APP_KEY=subagent-key \
  -e SOKETI_DEFAULT_APP_SECRET=subagent-secret \
  quay.io/soketi/soketi:1.6-16-debian
```

### Docker (All-in-one)

```bash
# Copy env dan jalankan semua services
cp .env.example .env
docker compose up -d

# Akses di http://localhost
```

---

## 🔌 Integrasi Agent

### Claude Code

Hook scripts di `claude-hooks/` yang POST ke webhook setiap ada tool use:

```bash
# Install hooks
cp claude-hooks/* ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
```

Events yang di-track:
- `agent_spawn` — ketika Task tool dipanggil
- `agent_message` — ketika SendMessage dipanggil
- `agent_action` — tool use lainnya

### OpenClaw

Daemon watcher yang tail JSONL session files:

```bash
# Start watcher
php artisan openclaw:watch

# Auto-detect session baru dan kirim ke webhook
```

### Copilot CLI

Webhook endpoint siap terima payload. Source auto-detect dari agent name/UUID.

---

## 🧪 Testing

```bash
# Frontend Unit Tests (Vitest)
cd frontend && npm test

# Frontend E2E Tests (Playwright)
cd frontend && npm run test:e2e

# Backend Tests (PHPUnit)
cd backend && php artisan test

# Type Check
cd frontend && npm run typecheck

# Lint
cd frontend && npm run lint
cd backend && ./vendor/bin/pint
```

---

## 📈 Statistik Repo

| Metric | Value |
|--------|-------|
| 🔢 **Total Commits** | 42+ |
| 👥 **Contributors** | 2 |
| 📂 **Source Files** | 27K+ |
| 📝 **Lines of Code** | 677K+ |
| 🚀 **Latest Release** | v1.0.0 |
| ✅ **Unit Tests** | 39 passed |
| ✅ **E2E Tests** | 5 passed |
| 📱 **Responsive** | Mobile-first |
| ⚡ **PWA** | Service Worker + Manifest |
| 🔄 **CI/CD** | GitHub Actions + Auto Release |

### Tech Stack Breakdown

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 8, TypeScript 5.9, Tailwind CSS 4, Zustand 5, Framer Motion 12 |
| **Backend** | Laravel 11, PHP 8.3, MySQL 8, Redis |
| **Realtime** | Soketi (Pusher-compatible), Laravel Echo, Pusher.js |
| **Testing** | Vitest, Playwright, PHPUnit |
| **DevOps** | Docker, Nginx, GitHub Actions, Let's Encrypt |

---

## 🤝 Kontributor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/el-pablos">
        <img src="https://github.com/el-pablos.png" width="100px;" alt="el-pablos" style="border-radius: 50%;"/>
        <br />
        <sub><b>el-pablos</b></sub>
      </a>
      <br />
      <sub>🧑‍💻 Creator & Lead Developer</sub>
      <br />
      <sub>41 commits (97.6%)</sub>
    </td>
    <td align="center">
      <a href="https://anthropic.com/claude">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Anthropic_Logo.svg/220px-Anthropic_Logo.svg.png" width="100px;" alt="Claude"/>
        <br />
        <sub><b>Claude (Anthropic)</b></sub>
      </a>
      <br />
      <sub>🤖 AI Pair Programmer</sub>
      <br />
      <sub>Deep Analysis & Code Gen</sub>
    </td>
    <td align="center">
      <a href="https://github.com/apps/copilot">
        <img src="https://github.com/copilot.png" width="100px;" alt="Copilot"/>
        <br />
        <sub><b>GitHub Copilot</b></sub>
      </a>
      <br />
      <sub>🤖 AI Co-author</sub>
      <br />
      <sub>1 commit (2.4%)</sub>
    </td>
  </tr>
</table>

---

## 📄 Lisensi

MIT License — bebas dipake, dimodif, dan didistribusi.

```
MIT License

Copyright (c) 2026 el-pablos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built with ❤️ and 🤖 AI-powered development**

*War Room Dashboard — karena ngawasin AI agent harusnya gak ribet.*

---

[🌐 Live Demo](https://live-agents.tams.codes) · [📖 Documentation](https://porto.tams.codes) · [🐛 Issues](https://github.com/el-pablos/subagent-work-view/issues)

</div>
