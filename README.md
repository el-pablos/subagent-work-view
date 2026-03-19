<div align="center">

# 🤖 Live Agents - Claude Code Dashboard

### Real-time Visualization Platform untuk Multi-Agent AI Collaboration

[![CI/CD](https://img.shields.io/badge/CI%2FCD-Passing-success?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/el-pablos/live-agents)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)](package.json)

<p align="center">
  <strong>Visualisasi real-time gimana tim AI Claude Code agents lo bekerja bareng ngerjain task.</strong><br>
  <em>Kayak mission control buat nonton pasukan AI lo beraksi! 🚀</em>
</p>

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">

---

[Demo](#-screenshots) • [Instalasi](#-instalasi-cepet) • [Arsitektur](#-arsitektur-sistem) • [Claude Code](#-integrasi-claude-code) • [API](#-api-endpoints) • [Kontributor](#-kontributor)

</div>

---

## 📖 Apa Sih Ini?

**Live Agents** itu dashboard buat ngawasin tim AI sub-agent yang lagi kerja bareng, khususnya dioptimasi buat **Claude Code multi-agent workflow**. Bayangin lo punya tim developer AI virtual, terus lo bisa liat live:

- 🤖 **Siapa yang lagi ngerjain apa** - Status real-time setiap agent
- 💬 **Komunikasi antar agent** - Handoff task, diskusi, koordinasi
- 📊 **Progress task** - Bar progress, timeline, estimasi selesai
- ⚡ **Command center** - Kirim perintah dari terminal atau dashboard
- 🔗 **Claude Code Integration** - Native support buat multi-agent Claude Code session

### Use Case

1. **Lo jalanin Claude Code dengan multi-agent**: "Hey Claude, buatin fitur auth dengan 5 sub-agent"
2. **Dashboard langsung rame**:
   - Team Lead agent mulai breakdown task
   - Coder agents mulai nulis kode parallel
   - Reviewer agent standby buat review
   - Tester agent siap jalanin test
3. **Lo tinggal nonton** progress real-time sambil ngopi ☕

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎯 **Agent Topology** | Visualisasi posisi & status semua agent dalam bentuk node interaktif |
| 📡 **Real-time Updates** | WebSocket-powered, update instant tanpa refresh |
| 📋 **Task Management** | Track progress, dependencies, retry failed tasks |
| 💬 **Communication Log** | Stream chat antar agent dengan filter channel |
| 🖥️ **Command Console** | Terminal-style input dengan autocomplete |
| 📈 **Timeline View** | Horizontal timeline eksekusi task |
| 🌙 **Dark Theme** | "War Room" aesthetic yang enak diliat |
| 🔌 **Claude Code Native** | Built-in support buat Claude Code multi-agent |

---

## 🏗 Arsitektur Sistem

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE ECOSYSTEM                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    CLAUDE CODE CLI / VS CODE                         │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │    │
│  │  │ Team Lead  │──│  Coder-1   │──│  Coder-2   │──│  Reviewer  │     │    │
│  │  │  (Leader)  │  │  (Worker)  │  │  (Worker)  │  │  (Worker)  │     │    │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘     │    │
│  │        │               │               │               │            │    │
│  │        └───────────────┴───────┬───────┴───────────────┘            │    │
│  └────────────────────────────────┼────────────────────────────────────┘    │
│                                   │                                          │
│                                   │ Events (MCP / API)                       │
│                                   ▼                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIVE AGENTS BACKEND                                │
│                                                                              │
│    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│    │   LARAVEL 11    │    │     MYSQL 8     │    │     REDIS 7     │        │
│    │   Backend API   │◄──►│    Database     │◄──►│   Cache/Queue   │        │
│    │   PHP 8.3       │    │                 │    │                 │        │
│    └────────┬────────┘    └─────────────────┘    └─────────────────┘        │
│             │                                                                │
│             │ Broadcasting                                                   │
│             ▼                                                                │
│    ┌─────────────────┐                                                       │
│    │     SOKETI      │ ◄─── Pusher-compatible WebSocket Server              │
│    │   WebSocket     │                                                       │
│    └────────┬────────┘                                                       │
│             │                                                                │
└─────────────┼────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND DASHBOARD                                 │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                     WAR ROOM LAYOUT                              │      │
│    │  ┌─────────────────────┐  ┌─────────────────────────────────┐   │      │
│    │  │  Agent Topology     │  │  Active Tasks + Communication   │   │      │
│    │  │  (7 columns)        │  │  Log (5 columns)                │   │      │
│    │  │                     │  │                                 │   │      │
│    │  │  [🤖] [🤖] [🤖]     │  │  ┌─────────────────────────┐   │   │      │
│    │  │     \   |   /       │  │  │ Task: Implement OAuth   │   │   │      │
│    │  │  [🤖]──[🎯]──[🤖]   │  │  │ ████████░░░░ 75%       │   │   │      │
│    │  │                     │  │  └─────────────────────────┘   │   │      │
│    │  └─────────────────────┘  │  ┌─────────────────────────┐   │   │      │
│    │                           │  │ 💬 Leader → Coder-1:    │   │   │      │
│    │  ┌─────────────────────┐  │  │ "Handle auth module!"   │   │   │      │
│    │  │ Timeline + Console  │  │  └─────────────────────────┘   │   │      │
│    │  └─────────────────────┘  └─────────────────────────────────┘   │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│    React 19 + TypeScript 5.9 + Vite 8 + Zustand 5 + Framer Motion           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Teknologi | Version | Kenapa Dipilih |
|-------|-----------|---------|----------------|
| **Backend** | Laravel | 11.x | Queue support, broadcasting, ecosystem lengkap |
| **PHP Runtime** | PHP | 8.2+ | Fitur modern, performa optimal |
| **Database** | MySQL | 8.0 | Reliable, indexing bagus buat dashboard query |
| **Cache/Queue** | Redis | 7.x | Cepet, pub/sub support |
| **WebSocket** | Soketi | 1.6 | Pusher-compatible, self-hosted, Laravel Echo ready |
| **Frontend** | React | 19.x | Component-based, concurrent features |
| **Language** | TypeScript | 5.9 | Type-safe, better DX |
| **Build Tool** | Vite | 8.x | Lightning fast HMR |
| **State** | Zustand + Immer | 5.x | Lightweight, perfect buat real-time updates |
| **Animation** | Framer Motion | 12.x | Smooth transitions buat status changes |
| **Styling** | Tailwind CSS | 4.x | Rapid development, dark theme gampang |
| **Container** | Docker Compose | 3.8 | Consistent environment, easy deployment |

---

## 🔌 Integrasi Claude Code

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLAUDE CODE INTEGRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   COMMAND    │     │  TEAM LEAD   │     │   WORKERS    │     │  DASHBOARD   │
│   (User)     │     │   (Claude)   │     │  (Sub-Agent) │     │ (Live Agents)│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │  1. Start Session  │                    │                    │
       │ ──────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │  2. Register       │                    │
       │                    │     Session        │                    │
       │                    │ ──────────────────────────────────────> │
       │                    │                    │                    │
       │                    │  3. Spawn Workers  │                    │
       │                    │ ──────────────────>│                    │
       │                    │                    │                    │
       │                    │                    │  4. Register Agent │
       │                    │                    │ ──────────────────>│
       │                    │                    │                    │
       │                    │  5. Assign Tasks   │                    │
       │                    │ ──────────────────>│                    │
       │                    │                    │                    │
       │                    │                    │  6. Task Updates   │
       │                    │                    │ ──────────────────>│
       │                    │                    │        │           │
       │                    │                    │        │  7. Real-time
       │                    │                    │        │     Broadcast
       │                    │                    │        │     (WebSocket)
       │                    │                    │        ▼           │
       │                    │                    │    ┌───────────┐   │
       │                    │                    │    │ Dashboard │   │
       │                    │                    │    │  Updates  │   │
       │                    │                    │    └───────────┘   │
       │                    │                    │                    │
       │                    │  8. Task Complete  │                    │
       │                    │ <──────────────────│                    │
       │                    │                    │                    │
       │                    │                    │  9. Final Status   │
       │                    │                    │ ──────────────────>│
       │                    │                    │                    │
       │  10. Result        │                    │                    │
       │ <──────────────────│                    │                    │
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
```

### Event Types dari Claude Code

```typescript
// Events yang di-broadcast ke Dashboard
interface ClaudeCodeEvents {
  // Session Events
  'session.created': { sessionId: string; command: string; }
  'session.completed': { sessionId: string; result: any; }

  // Agent Events
  'agent.registered': { agentId: string; type: 'leader' | 'worker'; }
  'agent.status_changed': { agentId: string; status: AgentStatus; }
  'agent.heartbeat': { agentId: string; timestamp: Date; }

  // Task Events
  'task.created': { taskId: string; title: string; assignee: string; }
  'task.progress': { taskId: string; progress: number; }
  'task.completed': { taskId: string; result: any; }

  // Communication Events
  'message.sent': { from: string; to: string; content: string; }
}
```

### Integration Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **REST API** | HTTP endpoints buat CRUD operations | Initial data load, one-time actions |
| **WebSocket** | Real-time bidirectional communication | Live updates, status changes |
| **MCP (Coming Soon)** | Model Context Protocol integration | Native Claude Code hooks |

---

## 📊 Database Schema (ERD)

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id            (PK)  │
│ name                │
│ email          (UK) │
│ password            │
│ created_at          │
└──────────┬──────────┘
           │ 1
           │
           │ creates
           ▼ *
┌─────────────────────┐         ┌─────────────────────┐
│      sessions       │         │       agents        │
├─────────────────────┤         ├─────────────────────┤
│ id            (PK)  │         │ id            (PK)  │
│ uuid          (UK)  │         │ uuid          (UK)  │
│ command_source      │         │ name                │
│ original_command    │         │ type                │
│ status              │         │ status              │
│ context       (JSON)│         │ current_task        │
│ created_by    (FK)  │         │ avatar              │
│ started_at          │         │ capacity            │
│ ended_at            │         │ priority            │
│ timestamps          │         │ capabilities  (JSON)│
└──────────┬──────────┘         │ last_seen_at        │
           │ 1                  │ timestamps          │
           │                    │ deleted_at    (ST)  │
           │ has many           └──────────┬──────────┘
           ▼ *                             │ 1
┌─────────────────────┐                    │
│       tasks         │                    │ assigned to
├─────────────────────┤                    │
│ id            (PK)  │◄───────────────────┘ *
│ uuid          (UK)  │
│ session_id    (FK)  │         ┌─────────────────────┐
│ title               │         │     task_logs       │
│ description         │         ├─────────────────────┤
│ status              │    *    │ id            (PK)  │
│ assigned_agent (FK) ├────────►│ task_id       (FK)  │
│ progress      (0-100)         │ agent_id      (FK)  │
│ attempt             │         │ action              │
│ max_attempt         │         │ notes               │
│ payload       (JSON)│         │ meta          (JSON)│
│ result        (JSON)│         │ timestamp           │
│ dependencies  (JSON)│         │ timestamps          │
│ queued_at           │         └─────────────────────┘
│ started_at          │
│ finished_at         │
│ timestamps          │
└──────────┬──────────┘
           │ 1
           │
           │ has many
           ▼ *
┌─────────────────────┐
│      messages       │
├─────────────────────┤
│ id            (PK)  │
│ session_id    (FK)  │
│ from_agent_id (FK)  │
│ to_agent_id   (FK)  │
│ content             │
│ message_type        │
│ channel             │
│ timestamp           │
│ timestamps          │
└─────────────────────┘

Legend:
  (PK) = Primary Key
  (UK) = Unique Key
  (FK) = Foreign Key
  (ST) = Soft Delete Timestamp
  (JSON) = JSON Column
```

### Status Enums

```
AgentStatus:   idle | busy | offline | error | communicating
TaskStatus:    pending | assigned | running | blocked | completed | failed | cancelled
SessionStatus: queued | planning | running | completed | failed | cancelled
MessageType:   agent | system | user | broadcast
```

---

## 🚀 Instalasi Cepet

### Prerequisites

- Docker & Docker Compose (required)
- Git
- 4GB RAM minimum (recommended 8GB)

### Steps

```bash
# 1. Clone repo
git clone https://github.com/el-pablos/live-agents.git
cd live-agents

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env sesuai kebutuhan (optional)
nano .env

# 4. Jalankan semua container
docker-compose up -d

# 5. Tunggu MySQL ready, terus jalankan migration
docker exec subagent-backend php artisan migrate --seed

# 6. Generate app key
docker exec subagent-backend php artisan key:generate

# 7. Done! Akses di browser
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| 🖥️ Frontend Dashboard | http://localhost:5173 | Main dashboard UI |
| 🔌 API Endpoint | http://localhost/api/v1 | REST API |
| 📡 WebSocket | ws://localhost:6001 | Soketi WebSocket |
| 🐬 MySQL | localhost:3306 | Database |
| 🔴 Redis | localhost:6379 | Cache & Queue |
| 📊 Soketi Metrics | http://localhost:9601 | WebSocket metrics |

### Docker Services

```yaml
services:
  - nginx          # Reverse proxy
  - backend        # Laravel PHP-FPM
  - queue-worker   # Background job processor
  - scheduler      # Laravel scheduler
  - soketi         # WebSocket server
  - frontend       # React dev server
  - mysql          # Database
  - redis          # Cache/Queue
```

---

## 📡 API Endpoints

### Sessions

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/sessions` | List semua sessions |
| POST | `/api/v1/sessions` | Bikin session baru |
| GET | `/api/v1/sessions/{id}` | Detail session |
| POST | `/api/v1/sessions/{id}/cancel` | Cancel session |
| POST | `/api/v1/sessions/{id}/pause` | Pause session |
| POST | `/api/v1/sessions/{id}/resume` | Resume session |
| GET | `/api/v1/sessions/{id}/timeline` | Timeline session |

### Agents

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/agents` | List semua agents |
| POST | `/api/v1/agents` | Register agent baru |
| GET | `/api/v1/agents/{id}` | Detail agent |
| PUT | `/api/v1/agents/{id}` | Update agent |
| DELETE | `/api/v1/agents/{id}` | Hapus agent (soft delete) |
| POST | `/api/v1/agents/{id}/heartbeat` | Agent heartbeat |
| POST | `/api/v1/agents/{id}/events` | Report batch events |
| GET | `/api/v1/agents/overview/stats` | Statistik agents |

### Tasks & Messages

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/tasks` | List tasks |
| GET | `/api/v1/tasks/{id}` | Detail task |
| PUT | `/api/v1/tasks/{id}` | Update task |
| POST | `/api/v1/tasks/{id}/retry` | Retry failed task |
| GET | `/api/v1/sessions/{id}/messages` | List messages di session |
| POST | `/api/v1/sessions/{id}/messages` | Kirim message |

### Dashboard & Health

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/dashboard/overview` | Overview stats |
| GET | `/api/v1/dashboard/agents` | Status semua agents |
| GET | `/api/v1/dashboard/active-sessions` | Sessions yang lagi jalan |
| GET | `/api/v1/dashboard/metrics` | Performance metrics |
| GET | `/api/v1/health` | System health check |
| GET | `/api/v1/health/agents` | Agent health status |

---

## 🔌 WebSocket Events

Subscribe pake Laravel Echo:

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: 6001,
  forceTLS: false,
  disableStats: true,
});

// Subscribe ke global dashboard
echo.channel('dashboard.global')
  .listen('.agent.status_changed', (e) => {
    console.log('Agent berubah status:', e);
  })
  .listen('.task.updated', (e) => {
    console.log('Task di-update:', e);
  })
  .listen('.session.created', (e) => {
    console.log('Session baru dibuat:', e);
  });

// Subscribe ke session tertentu
echo.channel(`session.${sessionId}`)
  .listen('.task.updated', (e) => {
    console.log('Task dalam session:', e);
  })
  .listen('.message.created', (e) => {
    console.log('Pesan baru:', e);
  });
```

### Available Channels

| Channel | Events | Description |
|---------|--------|-------------|
| `dashboard.global` | agent.*, session.*, task.* | Global dashboard updates |
| `session.{id}` | task.*, message.* | Session-specific updates |
| `agent.{id}` | status.*, heartbeat.* | Individual agent updates |

---

## 🤖 Default Agents

System include 6 agent templates siap pakai:

| Agent | Type | Priority | Kemampuan |
|-------|------|----------|-----------|
| 🎯 **Planner** | planner | 10 (highest) | planning, analysis, decomposition |
| 🏗️ **Architect** | architect | 20 | design, architecture, patterns |
| 💻 **Coder Alpha** | coder | 30 | coding, php, laravel, javascript |
| 💻 **Coder Beta** | coder | 30 | coding, react, typescript, frontend |
| 🔍 **Reviewer** | reviewer | 40 | review, quality, best-practices |
| 🧪 **Tester** | tester | 50 (lowest) | testing, e2e, unit-test |

---

## 📁 Struktur Project

```
live-agents/
├── 📂 backend/                    # Laravel 11 Backend
│   ├── app/
│   │   ├── Enums/                 # Status enums (AgentStatus, TaskStatus, dll)
│   │   ├── Events/                # Broadcast events
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # REST Controllers
│   │   │   └── Resources/         # API Resources
│   │   ├── Jobs/                  # Queue jobs
│   │   ├── Models/                # Eloquent models
│   │   └── Services/              # Business logic (Orchestration, Distribution)
│   ├── database/
│   │   ├── migrations/            # Database schema
│   │   └── seeders/               # Default data
│   └── routes/api.php             # API routes
│
├── 📂 frontend/                   # React 19 Frontend
│   └── src/
│       ├── components/
│       │   ├── agents/            # AgentNode, AgentTopologyPanel, TypingIndicator
│       │   ├── communication/     # CommunicationLogPanel, MessageBubble
│       │   ├── layout/            # WarRoomLayout, Header
│       │   ├── tasks/             # TaskCard, TaskTimeline, ActiveTaskPanel
│       │   ├── command/           # CommandConsole, CommandHistory
│       │   └── common/            # StatusChip, ProgressRing, AlertToast
│       ├── hooks/                 # useWebSocket, custom hooks
│       ├── services/              # API client, WebSocket setup
│       ├── stores/                # Zustand stores
│       └── types/                 # TypeScript interfaces
│
├── 📂 docker/                     # Docker configs
│   ├── nginx/                     # Nginx dev & prod configs
│   ├── php/                       # PHP 8.3 Dockerfile
│   └── supervisor/                # Queue worker config
│
├── 📄 docker-compose.yml          # 8 services orchestration
├── 📄 .env.example                # Environment template
└── 📄 README.md                   # You are here! 👋
```

---

## 📸 Screenshots

<div align="center">

### War Room Dashboard

![Dashboard Screenshot](docs/screenshots/dashboard.png)
*Main dashboard dengan agent topology dan real-time task updates*

### Agent Communication

![Communication Screenshot](docs/screenshots/communication.png)
*Real-time chat antar agents dengan status indicators*

### Task Timeline

![Timeline Screenshot](docs/screenshots/timeline.png)
*Horizontal timeline view untuk tracking task execution*

</div>

> 💡 **Note**: Screenshots akan di-update setelah deployment pertama

---

## 📈 Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| 📁 Total Files | **200+ files** |
| 📝 Lines of Code | **30,000+ lines** |
| 🤖 Build Agents Used | **35 parallel agents** |
| ⏱️ Initial Build Time | **~15 minutes** |
| 🐳 Docker Services | **8 containers** |
| 🔌 API Endpoints | **25+ endpoints** |
| 🎨 React Components | **25+ components** |
| 📡 WebSocket Channels | **3 channel types** |

</div>

---

## 🛠️ Development

### Local Development (tanpa Docker)

```bash
# Backend
cd backend
composer install
php artisan serve

# Frontend (terminal baru)
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
docker exec subagent-backend php artisan test

# Frontend tests
docker exec subagent-frontend npm run test
```

### Code Style

```bash
# PHP (Laravel Pint)
docker exec subagent-backend ./vendor/bin/pint

# TypeScript (ESLint)
docker exec subagent-frontend npm run lint
```

---

## 🧑‍💻 Kontributor

<div align="center">

### Main Developer

<a href="https://github.com/el-pablos">
  <img src="https://github.com/el-pablos.png" width="100" height="100" style="border-radius: 50%;" alt="el-pablos">
  <br>
  <strong>@el-pablos</strong>
</a>

<br><br>

### AI Development Partner

<a href="https://claude.ai">
  <img src="https://www.anthropic.com/images/icons/apple-touch-icon.png" width="80" height="80" alt="Claude AI">
  <br>
  <strong>Claude Code (Anthropic)</strong>
</a>

<br><br>

*Built with ❤️ menggunakan 35 parallel AI sub-agents*

<br>

### Powered By

[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_Code-7C3AED?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)

</div>

---

## 📜 License

MIT License - bebas dipake, dimodif, didistribusi. Cuma jangan lupa kasih credit aja ya! 😉

---

<div align="center">

**⭐ Star repo ini kalo bermanfaat! ⭐**

<br>

[![GitHub stars](https://img.shields.io/github/stars/el-pablos/live-agents?style=social)](https://github.com/el-pablos/live-agents/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/el-pablos/live-agents?style=social)](https://github.com/el-pablos/live-agents/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/el-pablos/live-agents?style=social)](https://github.com/el-pablos/live-agents/watchers)

<br>

---

<sub>Made with 🤖 Claude Code + ☕ by el-pablos</sub>

</div>
