# 🎯 SubAgent Work View — War Room Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Tests](https://img.shields.io/badge/Tests-100%25_Passed-22C55E?style=for-the-badge)

**Dashboard monitoring realtime buat ngawasin AI sub-agent yang jalan di server kamu.**

Auto-detect agent dari **Claude Code**, **OpenClaw**, dan **Copilot CLI** — semua keliatan live di satu layar.

[Live Demo](https://live-agents.tams.codes/) · [Report Bug](https://github.com/el-pablos/subagent-work-view/issues)

</div>

---

## 📝 Deskripsi Projek

SubAgent Work View itu war room dashboard buat monitoring AI agent secara realtime. Jadi misal kamu lagi jalanin Claude Code, OpenClaw, atau Copilot CLI di server — semua agent, task, dan message mereka bakal muncul otomatis di dashboard ini lewat WebSocket.

Fitur utamanya:
- 🔍 **Auto-detect** agent dari Claude Code, OpenClaw, dan Copilot CLI
- 📡 **Realtime updates** via WebSocket (Soketi/Pusher)
- 🗺️ **Agent Topology** — visualisasi koneksi antar agent
- 📋 **Task Tracker** — pantau progress task dengan timeline
- 💬 **Communication Log** — semua message agent dalam satu panel
- 🔔 **Notifikasi** — toast + drawer buat event penting (agent spawn, task selesai, dll)
- 🌙 **Dark glassmorphism** — design modern dengan backdrop blur
- 📱 **Mobile-first responsive** — bottom nav di mobile, grid layout di desktop
- ⚡ **PWA ready** — bisa di-install sebagai app

---

## 🏗️ Arsitektur Projek

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Topology │  │  Tasks   │  │  Comms   │  │  Notif   │    │
│  │  Panel   │  │  Panel   │  │  Panel   │  │  System  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └──────────────┴──────────────┴──────────────┘         │
│                    Zustand Stores                             │
│           ┌──────────────────────────┐                       │
│           │   useWebSocketWithStore  │                       │
│           │   useNotificationBridge  │                       │
│           └────────────┬─────────────┘                       │
│                        │ Laravel Echo + Pusher JS            │
└────────────────────────┼─────────────────────────────────────┘
                         │ WebSocket (wss://)
┌────────────────────────┼─────────────────────────────────────┐
│                     SOKETI                                    │
│              (Pusher-compatible WS Server)                   │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                  BACKEND (Laravel 11)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Webhook     │  │  Agent       │  │  Broadcasting    │   │
│  │  Controller  │  │  Ingest      │  │  Events          │   │
│  │  (3 sources) │  │  Service     │  │                  │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘   │
│         │                                                    │
│  ┌──────┴───────────────────────────────────────────────┐   │
│  │              MySQL + Redis + Queue                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

         ▲                ▲                 ▲
         │                │                 │
    ┌────┴────┐     ┌─────┴─────┐    ┌─────┴──────┐
    │ Claude  │     │ OpenClaw  │    │ Copilot    │
    │  Code   │     │  Gateway  │    │   CLI      │
    │ (hooks) │     │ (JSONL)   │    │ (webhook)  │
    └─────────┘     └───────────┘    └────────────┘
```

### Flow Data (Webhook → Realtime)

```
┌──────────────┐     POST /api/v1/webhook/{source}     ┌──────────────┐
│  Agent Tool  │ ──────────────────────────────────────▶│  Webhook     │
│  (Claude/    │     payload: { event, data, ...}      │  Controller  │
│   OpenClaw/  │                                        │  (normalize) │
│   Copilot)   │                                        └──────┬───────┘
└──────────────┘                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │  Agent       │
                                                        │  Ingest Svc  │
                                                        └──────┬───────┘
                                                    ┌──────────┴──────────┐
                                                    ▼                     ▼
                                             ┌────────────┐       ┌────────────┐
                                             │  Database   │       │  Broadcast │
                                             │  (MySQL)    │       │  Event     │
                                             └────────────┘       └─────┬──────┘
                                                                        │ Soketi
                                                                        ▼
                                                                  ┌────────────┐
                                                                  │  Frontend  │
                                                                  │  (React)   │
                                                                  └────────────┘
```

---

## 🗂️ Struktur Folder

```
subagent-work-view/
├── frontend/                    # React 19 + Vite 8 + TypeScript
│   ├── src/
│   │   ├── components/          # UI components (layout, agents, tasks, comms)
│   │   ├── hooks/               # Custom hooks (WebSocket, notifikasi, media query)
│   │   ├── stores/              # Zustand state management
│   │   ├── services/            # API client + WebSocket setup
│   │   ├── lib/                 # Utilities (adapters, source detection, animasi)
│   │   └── types/               # TypeScript type definitions
│   ├── e2e/                     # Playwright E2E tests
│   └── public/                  # Static assets + PWA icons
├── backend/                     # Laravel 11 + PHP 8.2
│   ├── app/
│   │   ├── Http/Controllers/    # API controllers (Agent, Task, Session, Webhook)
│   │   ├── Models/              # Eloquent models
│   │   ├── Events/              # Broadcasting events
│   │   ├── Services/            # Business logic (AgentIngest, WebhookNormalizer)
│   │   └── Console/Commands/    # Artisan commands (OpenClaw watcher)
│   ├── routes/                  # API routes
│   └── database/migrations/     # Database schema
├── docker/                      # Docker configs (nginx, php-fpm, supervisor, soketi)
├── claude-hooks/                # Claude Code integration hooks
└── .github/workflows/           # CI/CD (lint, test, build, auto-release)
```

---

## 🔌 Integrasi Agent

### Claude Code
Hook scripts di `claude-hooks/` yang nge-POST ke webhook tiap ada tool use. Event: `agent_spawn` (Task tool), `agent_message` (SendMessage).

### OpenClaw
Log watcher daemon (`php artisan openclaw:watch`) yang tail JSONL session files. Auto-detect session baru dan kirim event ke webhook.

### Copilot CLI
Webhook endpoint siap terima payload dari Copilot CLI. Source detection otomatis dari nama/uuid agent.

---

## 🧪 Testing

```bash
# Unit tests (Vitest) — 12 files, 39 tests
cd frontend && npm test

# E2E tests (Playwright) — 5 tests (responsive + a11y)
cd frontend && npm run test:e2e

# Build check
cd frontend && npm run build
```

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/el-pablos/subagent-work-view.git
cd subagent-work-view

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev

# Backend
cd backend && cp .env.example .env && composer install && php artisan migrate && php artisan serve

# Docker (all-in-one)
docker compose up -d
```

---

## 📊 Statistik Repo

| Metric | Value |
|--------|-------|
| 📁 Frontend Files | 89 TS/TSX |
| 📁 Backend Files | 51 PHP |
| 📝 Lines of Code | ~4,200+ |
| 🔄 Total Commits | 36+ |
| ✅ Unit Tests | 39 passed |
| ✅ E2E Tests | 5 passed |
| 🎨 Design System | Dark Glassmorphism |
| 📱 Responsive | Mobile-first |
| ⚡ PWA | Service Worker + Manifest |
| 🔄 CI/CD | GitHub Actions + Auto Release |

---

## 🤝 Kontributor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/el-pablos">
        <img src="https://github.com/el-pablos.png" width="80px;" alt="el-pablos"/>
        <br />
        <sub><b>el-pablos</b></sub>
      </a>
      <br />
      <sub>🧑‍💻 Creator & Lead Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/apps/copilot">
        <img src="https://github.com/copilot.png" width="80px;" alt="Copilot"/>
        <br />
        <sub><b>GitHub Copilot</b></sub>
      </a>
      <br />
      <sub>🤖 AI Co-author</sub>
    </td>
  </tr>
</table>

---

## 📄 Lisensi

MIT License — bebas dipake, dimodif, dan didistribusi.

---

<div align="center">

**Built with ❤️ and 🤖 AI-powered development**

*War Room Dashboard — karena ngawasin AI agent harusnya gak ribet.*

</div>
