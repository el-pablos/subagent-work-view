<div align="center">

# 🎮 SubAgent Work View

### War Room Dashboard untuk Tim AI Sub-Agent

[![CI/CD](https://github.com/el-pablos/subagent-work-view/actions/workflows/ci.yml/badge.svg)](https://github.com/el-pablos/subagent-work-view/actions)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=flat-square)](package.json)

<p align="center">
  <strong>Visualisasi real-time gimana tim AI agent lo bekerja bareng ngerjain task.</strong><br>
  <em>Kayak mission control buat nonton pasukan AI lo beraksi! 🚀</em>
</p>

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">
<img src="https://img.shields.io/badge/Live-live--agents.tams.codes-blue?style=for-the-badge" alt="Live">

---

[Demo](#demo) • [Instalasi](#-instalasi-cepet) • [Arsitektur](#-arsitektur-sistem) • [API](#-api-endpoints) • [Kontributor](#-kontributor)

</div>

---

## 📖 Apa Sih Ini?

**SubAgent Work View** itu dashboard buat ngawasin tim AI sub-agent yang lagi kerja bareng. Bayangin lo punya tim developer AI virtual, terus lo bisa liat live:

- 🤖 **Siapa yang lagi ngerjain apa** - Status real-time setiap agent
- 💬 **Komunikasi antar agent** - Handoff task, diskusi, koordinasi
- 📊 **Progress task** - Bar progress, timeline, estimasi selesai
- ⚡ **Command center** - Kirim perintah langsung dari dashboard
- 🔗 **Claude Code Integration** - Hook ke Claude AI untuk real-time tracking

### Live Demo

🌐 **https://live-agents.tams.codes/**

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
| 🌙 **Dark/Light Theme** | Toggle theme dengan smooth transition |
| 🎨 **Glass Morphism UI** | Modern glassmorphism design |
| ⌨️ **Keyboard Shortcuts** | Hotkeys untuk navigasi cepat |
| 📱 **Mobile Responsive** | Fully responsive untuk semua device |
| 🔔 **Toast Notifications** | Real-time alerts dengan Sonner |
| 🎭 **Framer Animations** | Smooth animations di seluruh UI |

---

## 🏗 Arsitektur Sistem

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE CODE / EXTERNAL SOURCES                       │
│                    (Webhook Events / API Calls / CLI Hooks)                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND LAYER (Laravel 11)                        │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Webhook     │  │  Event       │  │  Queue       │  │  Broadcast   │    │
│  │  Controller  │─▶│  Dispatcher  │─▶│  Worker      │─▶│  (Soketi)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                                                     │             │
│         ▼                                                     │             │
│  ┌──────────────┐  ┌──────────────┐                          │             │
│  │  MySQL 8     │  │  Redis 7     │                          │             │
│  │  Database    │  │  Cache/Queue │                          │             │
│  └──────────────┘  └──────────────┘                          │             │
│                                                               │             │
└───────────────────────────────────────────────────────────────┼─────────────┘
                                                                │
                                  ┌─────────────────────────────┘
                                  │ WebSocket
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (React 18)                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        WAR ROOM LAYOUT                               │   │
│  │                                                                      │   │
│  │  ┌────────────────────────┐  ┌────────────────────────────────────┐ │   │
│  │  │   Agent Topology       │  │   Tasks + Communication Log        │ │   │
│  │  │   ┌──┐ ┌──┐ ┌──┐      │  │   ┌──────────────────────────────┐ │ │   │
│  │  │   │🤖│─│🤖│─│🤖│      │  │   │ Task: Build Feature X        │ │ │   │
│  │  │   └──┘ └──┘ └──┘      │  │   │ ████████████░░░░ 75%        │ │ │   │
│  │  │     \   │   /          │  │   └──────────────────────────────┘ │ │   │
│  │  │   ┌──┐ ┌──┐ ┌──┐      │  │   ┌──────────────────────────────┐ │ │   │
│  │  │   │🤖│─│🤖│─│🤖│      │  │   │ 💬 Agent A → Agent B:        │ │ │   │
│  │  │   └──┘ └──┘ └──┘      │  │   │ "Requirements siap!"         │ │ │   │
│  │  └────────────────────────┘  │   └──────────────────────────────┘ │ │   │
│  │                              └────────────────────────────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │   Timeline View          │    Command Console                │   │   │
│  │  │   ●──●──●──●──●──○       │    $ _                            │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Tech: React 18 + TypeScript + Vite + Zustand + Framer Motion + Tailwind   │
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
│ id              PK  │
│ name                │
│ email          UK   │
│ password            │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │ 1
           │
           │ creates
           ▼ *
┌─────────────────────┐         ┌─────────────────────┐
│   agent_sessions    │         │       agents        │
├─────────────────────┤         ├─────────────────────┤
│ id              PK  │         │ id              PK  │
│ uuid            UK  │         │ uuid            UK  │
│ command_source      │         │ name                │
│ original_command    │         │ type                │
│ status              │         │ status              │
│ context        JSON │         │ current_task        │
│ created_by      FK  │         │ avatar              │
│ started_at          │         │ capacity            │
│ ended_at            │         │ priority            │
│ created_at          │         │ capabilities   JSON │
│ updated_at          │         │ last_seen_at        │
└──────────┬──────────┘         │ created_at          │
           │ 1                  │ updated_at          │
           │                    │ deleted_at      ST  │
           │ has many           └──────────┬──────────┘
           ▼ *                             │ 1
┌─────────────────────┐                    │
│       tasks         │                    │ assigned to
├─────────────────────┤                    │
│ id              PK  │◄───────────────────┘ *
│ uuid            UK  │
│ session_id      FK  │         ┌─────────────────────┐
│ title               │         │     task_logs       │
│ description         │         ├─────────────────────┤
│ status              │    *    │ id              PK  │
│ assigned_agent_id FK├────────▶│ task_id         FK  │
│ progress       0-100│         │ agent_id        FK  │
│ attempt             │         │ action              │
│ max_attempt         │         │ notes               │
│ payload        JSON │         │ meta           JSON │
│ result         JSON │         │ timestamp           │
│ dependencies   JSON │         │ created_at          │
│ queued_at           │         │ updated_at          │
│ started_at          │         └─────────────────────┘
│ finished_at         │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │ 1
           │
           │ has many
           ▼ *
┌─────────────────────┐
│      messages       │
├─────────────────────┤
│ id              PK  │
│ session_id      FK  │
│ from_agent_id   FK  │
│ to_agent_id     FK  │
│ content             │
│ message_type        │
│ channel             │
│ timestamp           │
│ created_at          │
│ updated_at          │
└─────────────────────┘

Legend:
  PK   = Primary Key
  FK   = Foreign Key
  UK   = Unique Key
  ST   = Soft Delete Timestamp
  JSON = JSON Column
```

---

## 🚀 Instalasi Cepet

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 22+ (untuk development)
- PHP 8.3+ (untuk development)

### Production (Docker)

```bash
# 1. Clone repo
git clone https://github.com/el-pablos/subagent-work-view.git
cd subagent-work-view

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env sesuai kebutuhan
nano .env

# 4. Jalankan semua container
docker-compose up -d

# 5. Tunggu MySQL ready, terus jalankan migration
docker exec subagent-backend php artisan migrate --seed

# 6. Done! Akses di browser
```

### Development (Manual)

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# Frontend (terminal baru)
cd frontend
npm install
npm run dev
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

### Agents

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/agents` | List semua agents |
| POST | `/api/v1/agents` | Register agent baru |
| GET | `/api/v1/agents/{id}` | Detail agent |
| POST | `/api/v1/agents/{id}/heartbeat` | Agent heartbeat |

### Dashboard & Health

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/dashboard/overview` | Overview stats |
| GET | `/api/v1/health` | System health check |

---

## 📈 Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| 📁 Total Files | **206 files** |
| 📝 Lines of Code | **23,570+ lines** |
| 🔄 Total Commits | **72+ commits** |
| 🤖 Build Agents Used | **60 parallel agents** |
| 🔌 API Endpoints | **29 endpoints** |
| 🎨 React Components | **40+ components** |
| 🪝 Custom Hooks | **10+ hooks** |

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

**Claude Code (Anthropic)**

<br>

*Built with ❤️ using 60 parallel AI sub-agents*

</div>

---

## 📜 License

MIT License - bebas dipake, dimodif, didistribusi.

---

<div align="center">

**⭐ Star repo ini kalo bermanfaat! ⭐**

**🌐 Live Demo: https://live-agents.tams.codes/**

</div>
