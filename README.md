<div align="center">

# 🎮 SubAgent Work View

### War Room Dashboard untuk Tim AI Sub-Agent

[![CI/CD](https://github.com/el-pablos/subagent-work-view/actions/workflows/ci.yml/badge.svg)](https://github.com/el-pablos/subagent-work-view/actions)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<p align="center">
  <strong>Visualisasi real-time gimana tim AI agent lo bekerja bareng ngerjain task.</strong><br>
  <em>Kayak mission control buat nonton pasukan AI lo beraksi! 🚀</em>
</p>

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">

---

[Demo](#demo) • [Instalasi](#-instalasi-cepet) • [Arsitektur](#-arsitektur-sistem) • [API](#-api-endpoints) • [Kontributor](#-kontributor)

</div>

---

## 📖 Apa Sih Ini?

**SubAgent Work View** itu dashboard buat ngawasin tim AI sub-agent yang lagi kerja bareng. Bayangin lo punya tim developer AI virtual, terus lo bisa liat live:

- 🤖 **Siapa yang lagi ngerjain apa** - Status real-time setiap agent
- 💬 **Komunikasi antar agent** - Handoff task, diskusi, koordinasi
- 📊 **Progress task** - Bar progress, timeline, estimasi selesai
- ⚡ **Command center** - Kirim perintah dari WhatsApp, Telegram, atau langsung dari dashboard

### Use Case

1. **Lo kirim command via WhatsApp**: "Buatkan fitur login dengan OAuth Google"
2. **Dashboard langsung rame**:
   - Planner agent mulai analisis requirement
   - Coder agents mulai nulis kode
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

---

## 🏗 Arsitektur Sistem

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL CHANNELS                                    │
│          WhatsApp │ Telegram │ Slack │ Discord │ REST API                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│    │   LARAVEL 11    │    │     MYSQL 8     │    │     REDIS 7     │       │
│    │   Backend API   │◄──►│    Database     │◄──►│   Cache/Queue   │       │
│    │   PHP 8.3       │    │                 │    │                 │       │
│    └────────┬────────┘    └─────────────────┘    └─────────────────┘       │
│             │                                                               │
│             │ Broadcasting                                                  │
│             ▼                                                               │
│    ┌─────────────────┐                                                      │
│    │     SOKETI      │ ◄─── Pusher-compatible WebSocket Server             │
│    │   WebSocket     │                                                      │
│    └────────┬────────┘                                                      │
│             │                                                               │
└─────────────┼───────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND DASHBOARD                                 │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                     WAR ROOM LAYOUT                              │     │
│    │  ┌─────────────────────┐  ┌─────────────────────────────────┐   │     │
│    │  │  Agent Topology     │  │  Active Tasks + Communication   │   │     │
│    │  │  (7 columns)        │  │  Log (5 columns)                │   │     │
│    │  │                     │  │                                 │   │     │
│    │  │  [🤖] [🤖] [🤖]     │  │  ┌─────────────────────────┐   │   │     │
│    │  │     \   |   /       │  │  │ Task: Implement OAuth   │   │   │     │
│    │  │  [🤖]──[🤖]──[🤖]   │  │  │ ████████░░░░ 75%       │   │   │     │
│    │  │                     │  │  └─────────────────────────┘   │   │     │
│    │  └─────────────────────┘  │  ┌─────────────────────────┐   │   │     │
│    │                           │  │ 💬 Planner → Coder:     │   │   │     │
│    │  ┌─────────────────────┐  │  │ "Requirements ready!"   │   │   │     │
│    │  │ Timeline + Console  │  │  └─────────────────────────┘   │   │     │
│    │  └─────────────────────┘  └─────────────────────────────────┘   │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│    React 18 + TypeScript + Vite + Zustand + Framer Motion + Tailwind       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Teknologi | Kenapa Dipilih |
|-------|-----------|----------------|
| **Backend** | Laravel 11 + PHP 8.3 | Queue support, broadcasting, ecosystem lengkap |
| **Database** | MySQL 8 | Reliable, indexing bagus buat dashboard query |
| **Cache/Queue** | Redis 7 | Cepet, pub/sub support |
| **WebSocket** | Soketi | Pusher-compatible, self-hosted, Laravel Echo ready |
| **Frontend** | React 18 + TypeScript | Component-based, type-safe, great for real-time UI |
| **State** | Zustand + Immer | Lightweight, perfect buat real-time updates |
| **Animation** | Framer Motion | Smooth transitions buat status changes |
| **Styling** | Tailwind CSS | Rapid development, dark theme gampang |
| **Container** | Docker Compose | Consistent environment, easy deployment |

---

## 📊 Database Schema (ERD)

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id                  │
│ name                │
│ email               │
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
│ id                  │         │ id                  │
│ uuid           (UK) │         │ uuid           (UK) │
│ command_source      │         │ name                │
│ original_command    │         │ type                │
│ status              │         │ status              │
│ context        (JSON│         │ current_task        │
│ created_by     (FK) │         │ avatar              │
│ started_at          │         │ capacity            │
│ ended_at            │         │ priority            │
│ timestamps          │         │ capabilities  (JSON)│
└──────────┬──────────┘         │ last_seen_at        │
           │ 1                  │ timestamps          │
           │                    │ deleted_at     (ST) │
           │ has many           └──────────┬──────────┘
           ▼ *                             │ 1
┌─────────────────────┐                    │
│       tasks         │                    │ assigned to
├─────────────────────┤                    │
│ id                  │◄───────────────────┘ *
│ uuid           (UK) │
│ session_id     (FK) │         ┌─────────────────────┐
│ title               │         │     task_logs       │
│ description         │         ├─────────────────────┤
│ status              │    *    │ id                  │
│ assigned_agent_id(FK├────────►│ task_id       (FK)  │
│ progress       (0-100         │ agent_id      (FK)  │
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
│ id                  │
│ session_id     (FK) │
│ from_agent_id  (FK) │
│ to_agent_id    (FK) │
│ content             │
│ message_type        │
│ channel             │
│ timestamp           │
│ timestamps          │
└─────────────────────┘

Legend:
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

- Docker & Docker Compose
- Git

### Steps

```bash
# 1. Clone repo
git clone https://github.com/el-pablos/subagent-work-view.git
cd subagent-work-view

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env sesuai kebutuhan (optional)
nano .env

# 4. Jalankan semua container
docker-compose up -d

# 5. Tunggu MySQL ready, terus jalankan migration
docker exec subagent-backend php artisan migrate --seed

# 6. Done! Akses di browser
```

### Access Points

| Service | URL |
|---------|-----|
| 🖥️ Frontend Dashboard | http://localhost:5173 |
| 🔌 API Endpoint | http://localhost/api/v1 |
| 📡 WebSocket | ws://localhost:6001 |
| 🐬 MySQL | localhost:3306 |
| 🔴 Redis | localhost:6379 |

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
  key: 'your-app-key',
  wsHost: 'localhost',
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

---

## 🤖 Default Agents

System udah include 6 agents siap pakai:

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
subagent-work-view/
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
├── 📂 frontend/                   # React Frontend
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
└── 📄 .github/workflows/ci.yml    # CI/CD pipeline
```

---

## 📈 Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| 📁 Total Files | **194 files** |
| 📝 Lines of Code | **26,000+ lines** |
| 🤖 Build Agents Used | **35 parallel agents** |
| ⏱️ Build Time | **~10 minutes** |
| 🐳 Docker Services | **8 containers** |
| 🔌 API Endpoints | **25+ endpoints** |
| 🎨 React Components | **20+ components** |

</div>

---

## 🧑‍💻 Kontributor

<div align="center">

### Main Developer

<a href="https://github.com/el-pablos">
  <img src="https://github.com/el-pablos.png" width="100" height="100" style="border-radius: 50%;" alt="el-pablos">
  <br>
  <strong>@el-pablos</strong>
</a>

### AI Assistant

<a href="https://claude.ai">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png" width="80" height="80" alt="Claude AI">
  <br>
  <strong>Claude Code (Anthropic)</strong>
</a>

<br><br>

*Built with ❤️ using 30+ parallel AI sub-agents*

</div>

---

## 📜 License

MIT License - bebas dipake, dimodif, didistribusi. Cuma jangan lupa kasih credit aja ya! 😉

---

<div align="center">

**⭐ Star repo ini kalo bermanfaat! ⭐**

<br>

[![GitHub stars](https://img.shields.io/github/stars/el-pablos/subagent-work-view?style=social)](https://github.com/el-pablos/subagent-work-view/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/el-pablos/subagent-work-view?style=social)](https://github.com/el-pablos/subagent-work-view/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/el-pablos/subagent-work-view?style=social)](https://github.com/el-pablos/subagent-work-view/watchers)

</div>
