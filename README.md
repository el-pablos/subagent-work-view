# SubAgent Work View

Real-time Multi-Agent Visualization Dashboard - "War Room" for AI Sub-Agents collaboration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.3-purple.svg)
![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

## Overview

SubAgent Work View is a mission control dashboard that visualizes how AI sub-agents work together in real-time. Watch your team of agents collaborate on tasks - who's working on what, communication between agents, progress tracking, and execution timeline.

### Core Features

- **Real-time Agent Visualization**: See all agents with live status indicators (idle, busy, communicating, error)
- **Task Management**: Track task progress, assignments, and dependencies
- **Communication Log**: Monitor inter-agent messages and handoffs
- **Command Console**: Send commands from WhatsApp, Telegram, API, or the dashboard itself
- **Timeline View**: Visualize task execution flow
- **Dark "War Room" Aesthetic**: Professional mission control interface

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL CHANNELS                            │
│        WhatsApp │ Telegram │ Slack │ REST API │ CLI             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LARAVEL BACKEND                                 │
│  • Command Orchestrator    • Task Distribution                   │
│  • Agent Coordinator       • WebSocket Broadcasting              │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  MySQL   │   │  Redis   │   │  Soketi  │
        │ Database │   │  Queue   │   │ WebSocket│
        └──────────┘   └──────────┘   └──────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                                 │
│  • Agent Topology Panel    • Active Task Panel                   │
│  • Communication Log       • Command Console                     │
│  • Task Timeline                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend API | Laravel 11 + PHP 8.3 |
| Database | MySQL 8.x |
| Cache/Queue | Redis 7 |
| WebSocket | Soketi (Pusher-compatible) |
| Frontend | React 18 + TypeScript + Vite |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Container | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/el-pablos/subagent-work-view.git
cd subagent-work-view
```

2. **Copy environment file**
```bash
cp .env.example .env
```

3. **Configure environment variables**
```env
APP_NAME=SubAgentWorkView
DB_DATABASE=subagent_workview
DB_USERNAME=subagent
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=your_root_password
REDIS_PASSWORD=your_redis_password
PUSHER_APP_ID=subagent-app
PUSHER_APP_KEY=subagent-key
PUSHER_APP_SECRET=subagent-secret
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Run migrations**
```bash
docker exec subagent-backend php artisan migrate --seed
```

6. **Access the dashboard**
- Frontend: http://localhost:5173
- API: http://localhost/api/v1
- Soketi WebSocket: ws://localhost:6001

## API Endpoints

### Sessions
- `GET /api/v1/sessions` - List all sessions
- `POST /api/v1/sessions` - Create new session
- `GET /api/v1/sessions/{id}` - Get session details
- `POST /api/v1/sessions/{id}/cancel` - Cancel session
- `GET /api/v1/sessions/{id}/timeline` - Get session timeline

### Agents
- `GET /api/v1/agents` - List all agents
- `POST /api/v1/agents/{id}/heartbeat` - Agent heartbeat
- `POST /api/v1/agents/{id}/events` - Report agent events
- `GET /api/v1/agents/overview/stats` - Get agent statistics

### Tasks
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/{id}` - Get task details
- `PUT /api/v1/tasks/{id}` - Update task
- `POST /api/v1/tasks/{id}/retry` - Retry failed task

### Dashboard
- `GET /api/v1/dashboard/overview` - Dashboard overview
- `GET /api/v1/dashboard/agents` - Agent status
- `GET /api/v1/dashboard/active-sessions` - Active sessions
- `GET /api/v1/dashboard/metrics` - Performance metrics

### Health
- `GET /api/v1/health` - System health check
- `GET /api/v1/health/agents` - Agent health status

## WebSocket Events

Subscribe to real-time updates via Laravel Echo:

```typescript
// Dashboard global channel
echo.channel('dashboard.global')
  .listen('.agent.status_changed', (e) => { /* agent status update */ })
  .listen('.task.updated', (e) => { /* task progress update */ })
  .listen('.session.created', (e) => { /* new session started */ });

// Session-specific channel
echo.channel(`session.${sessionId}`)
  .listen('.task.updated', (e) => { /* task in session updated */ })
  .listen('.message.created', (e) => { /* new agent message */ });
```

## Default Agents

The system comes with 6 pre-configured agents:

| Agent | Type | Priority | Capabilities |
|-------|------|----------|--------------|
| Planner | planner | 10 | planning, analysis, decomposition |
| Architect | architect | 20 | design, architecture, patterns |
| Coder Alpha | coder | 30 | coding, php, laravel, javascript |
| Coder Beta | coder | 30 | coding, react, typescript, frontend |
| Reviewer | reviewer | 40 | review, quality, best-practices |
| Tester | tester | 50 | testing, e2e, unit-test |

## Project Structure

```
subagent-work-view/
├── backend/                 # Laravel 11 API
│   ├── app/
│   │   ├── Enums/          # Status enums
│   │   ├── Events/         # Broadcast events
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Resources/
│   │   ├── Jobs/           # Queue jobs
│   │   ├── Models/         # Eloquent models
│   │   └── Services/       # Business logic
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── agents/     # Agent visualization
│   │   │   ├── communication/
│   │   │   ├── layout/
│   │   │   └── tasks/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/         # Zustand stores
│   │   └── types/
│   └── package.json
├── docker/
│   ├── nginx/
│   ├── php/
│   └── supervisor/
├── storage/
├── docker-compose.yml
└── README.md
```

## Development

### Backend Development
```bash
cd backend
composer install
php artisan serve
php artisan queue:work
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
# Backend
cd backend && php artisan test

# Frontend
cd frontend && npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**el-pablos** - [GitHub](https://github.com/el-pablos)

---

Built with ❤️ using Claude Code AI Assistant
