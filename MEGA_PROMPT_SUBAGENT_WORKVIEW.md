# MEGA PROMPT: SubAgent Work View - Real-time Multi-Agent Visualization Dashboard

> **Project Name**: SubAgent Work View
> **Target Directory**: `/root/work/ai/subagent-work-view`
> **Estimated Word Count**: 4500+ words
> **Purpose**: Complete implementation guide untuk membangun sistem visualisasi real-time tim sub-agent yang bekerja secara kolaboratif

---

## EXECUTIVE SUMMARY

Bangun sebuah **"War Room Dashboard"** atau **"Mission Control Center"** yang memvisualisasikan secara real-time bagaimana tim sub-agent AI bekerja mengerjakan task. Sistem ini menerima command dari external channel (WhatsApp, Telegram, API) dan menampilkan aktivitas setiap agent dalam dashboard yang interaktif - siapa yang sedang ngerjain apa, komunikasi antar agent, progress task, dan timeline eksekusi.

### Core Vision
- User kirim perintah via WhatsApp: "Tolong buatkan fitur login dengan OAuth"
- Dashboard langsung menampilkan tim agent bergerak: Planner agent membuat rencana, Coder agent menulis kode, Reviewer agent mereview, Tester agent menjalankan test
- Setiap aktivitas terlihat real-time: status agent, progress bar, pesan antar agent, timeline

---

## SECTION 1: SYSTEM ARCHITECTURE OVERVIEW

### 1.1 High-Level Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL CHANNELS                                  │
│         WhatsApp │ Telegram │ Slack │ Discord │ REST API │ CLI              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHANNEL INGESTION LAYER                                 │
│  • Webhook receiver & signature verification                                 │
│  • Message normalization to internal format                                  │
│  • Rate limiting & spam protection                                           │
│  • Create Command entity                                                     │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMMAND ORCHESTRATOR SERVICE                            │
│  • Parse intent & extract requirements                                       │
│  • Create Session (parent container)                                         │
│  • Build Task DAG (Directed Acyclic Graph)                                   │
│  • Plan sub-tasks dengan dependency                                          │
│  • Dispatch ke Agent Coordinator via Message Queue                           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│     AGENT COORDINATOR         │   │        STATE & EVENT STORE            │
│  • Task assignment strategy   │   │  • Sessions, Tasks, SubTasks          │
│  • Agent health monitoring    │   │  • Agent heartbeats & states          │
│  • Retry & timeout handling   │   │  • Communication logs                 │
│  • Dead-letter queue routing  │   │  • Audit trail                        │
└───────────────┬───────────────┘   └───────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUB-AGENT RUNNERS                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Planner │ │ Coder   │ │Reviewer │ │ Tester  │ │  Docs   │ │ DevOps  │   │
│  │  Agent  │ │  Agent  │ │  Agent  │ │  Agent  │ │  Agent  │ │  Agent  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │           │         │
│       └───────────┴───────────┴─────┬─────┴───────────┴───────────┘         │
│                                     │                                        │
│                        status/progress/events                                │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVENT BUS / MESSAGE QUEUE                            │
│           Redis Streams │ Kafka │ NATS │ RabbitMQ                           │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────────┐   ┌─────────────────────────────────────┐
│       REALTIME GATEWAY            │   │       ANALYTICS & MONITORING        │
│  • WebSocket server (Soketi)      │   │  • Prometheus metrics               │
│  • SSE fallback endpoint          │   │  • OpenTelemetry traces             │
│  • Channel subscription           │   │  • Audit logging                    │
│  • Event fan-out to clients       │   │  • Alert system                     │
└───────────────────┬───────────────┘   └─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      WEBVIEW DASHBOARD (FRONTEND)                            │
│  • Real-time agent topology visualization                                    │
│  • Task progress & timeline                                                  │
│  • Communication log stream                                                  │
│  • Command input console                                                     │
│  • Dark theme "Mission Control" aesthetic                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Backend API | Laravel 11 | Robust, queue support, broadcasting, ecosystem |
| Database | MySQL 8.4 | Reliable, indexed queries for dashboard |
| Cache/Queue | Redis 7 | Fast, pub/sub, streams support |
| Realtime | Soketi | Pusher-compatible, self-hosted, Laravel Echo ready |
| Frontend | React 18 + Vite | Fast, component-based, great for real-time UI |
| State Management | Zustand | Lightweight, perfect for real-time updates |
| Animation | Framer Motion | Smooth agent status transitions |
| Styling | Tailwind CSS | Rapid UI development, dark theme ready |
| Container | Docker Compose | Consistent dev/prod environment |

---

## SECTION 2: DATABASE SCHEMA DESIGN

### 2.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   agents    │       │  sessions   │       │    users    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ uuid        │       │ uuid        │◄──────│ created_by  │
│ name        │       │ command_src │       │ name        │
│ type        │       │ original_cmd│       │ email       │
│ status      │       │ status      │       └─────────────┘
│ avatar      │       │ context     │
│ capacity    │       │ started_at  │
│ priority    │       │ ended_at    │
│ capabilities│       └──────┬──────┘
│ last_seen_at│              │
└──────┬──────┘              │
       │                     │
       │    ┌────────────────┘
       │    │
       ▼    ▼
┌─────────────────────┐
│       tasks         │
├─────────────────────┤
│ id                  │
│ uuid                │
│ session_id (FK)     │
│ title               │
│ status              │
│ assigned_agent_id(FK│
│ progress (0-100)    │
│ attempt             │
│ max_attempt         │
│ payload (JSON)      │
│ result (JSON)       │
│ queued_at           │
│ started_at          │
│ finished_at         │
└──────────┬──────────┘
           │
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌──────────┐ ┌──────────────┐
│task_logs │ │   messages   │
├──────────┤ ├──────────────┤
│ id       │ │ id           │
│ task_id  │ │ session_id   │
│ agent_id │ │ from_agent_id│
│ action   │ │ to_agent_id  │
│ notes    │ │ content      │
│ meta     │ │ message_type │
│ timestamp│ │ timestamp    │
└──────────┘ └──────────────┘
```

### 2.2 Complete Migration Files

#### agents table
```php
Schema::create('agents', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->string('name', 120);
    $table->string('type', 50); // planner, coder, reviewer, tester, docs, devops
    $table->string('status', 30)->default('idle'); // idle, busy, offline, error, communicating
    $table->text('current_task')->nullable();
    $table->string('avatar')->nullable();
    $table->unsignedSmallInteger('capacity')->default(1);
    $table->unsignedSmallInteger('priority')->default(100); // lower = higher priority
    $table->json('capabilities')->nullable(); // ["coding","analysis","testing"]
    $table->timestamp('last_seen_at')->nullable();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['status', 'type'], 'idx_agents_status_type');
    $table->index(['priority', 'status'], 'idx_agents_priority_status');
});
```

#### sessions table
```php
Schema::create('sessions', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->string('command_source', 50); // whatsapp, telegram, api, cli, web
    $table->text('original_command');
    $table->string('status', 30)->default('queued'); // queued, planning, running, completed, failed, cancelled
    $table->json('context')->nullable();
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('ended_at')->nullable();
    $table->timestamps();

    $table->index(['status', 'created_at'], 'idx_sessions_status_created');
    $table->index('command_source');
});
```

#### tasks table
```php
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();
    $table->foreignId('session_id')->constrained()->cascadeOnDelete();
    $table->string('title', 255);
    $table->text('description')->nullable();
    $table->string('status', 30)->default('pending'); // pending, assigned, running, blocked, completed, failed
    $table->foreignId('assigned_agent_id')->nullable()->constrained('agents')->nullOnDelete();
    $table->unsignedTinyInteger('progress')->default(0); // 0-100
    $table->unsignedInteger('attempt')->default(0);
    $table->unsignedInteger('max_attempt')->default(3);
    $table->json('payload')->nullable();
    $table->json('result')->nullable();
    $table->json('dependencies')->nullable(); // task_ids that must complete first
    $table->timestamp('queued_at')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('finished_at')->nullable();
    $table->timestamps();

    $table->index(['session_id', 'status'], 'idx_tasks_session_status');
    $table->index(['assigned_agent_id', 'status'], 'idx_tasks_agent_status');
    $table->index(['status', 'created_at'], 'idx_tasks_status_created');
});
```

#### messages table
```php
Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('session_id')->constrained()->cascadeOnDelete();
    $table->foreignId('from_agent_id')->nullable()->constrained('agents')->nullOnDelete();
    $table->foreignId('to_agent_id')->nullable()->constrained('agents')->nullOnDelete();
    $table->longText('content');
    $table->string('message_type', 30)->default('agent'); // agent, system, user, broadcast
    $table->string('channel', 50)->default('general'); // general, handoff, alert, debug
    $table->timestamp('timestamp')->useCurrent();
    $table->timestamps();

    $table->index(['session_id', 'timestamp'], 'idx_messages_session_time');
    $table->index(['from_agent_id', 'to_agent_id'], 'idx_messages_from_to');
});
```

#### task_logs table
```php
Schema::create('task_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained()->cascadeOnDelete();
    $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();
    $table->string('action', 80); // assigned, started, progress, completed, failed, retried, blocked, unblocked
    $table->text('notes')->nullable();
    $table->json('meta')->nullable();
    $table->timestamp('timestamp')->useCurrent();
    $table->timestamps();

    $table->index(['task_id', 'timestamp'], 'idx_task_logs_task_time');
    $table->index(['agent_id', 'timestamp'], 'idx_task_logs_agent_time');
    $table->index('action');
});
```

---

## SECTION 3: BACKEND SERVICE ARCHITECTURE

### 3.1 Service Layer Pattern

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── SessionController.php
│   │   │   ├── TaskController.php
│   │   │   ├── AgentController.php
│   │   │   ├── MessageController.php
│   │   │   └── WebhookController.php
│   │   └── Dashboard/
│   │       └── DashboardController.php
│   ├── Requests/
│   │   ├── CreateSessionRequest.php
│   │   ├── UpdateTaskRequest.php
│   │   └── WebhookRequest.php
│   └── Resources/
│       ├── AgentResource.php
│       ├── TaskResource.php
│       ├── SessionResource.php
│       └── MessageResource.php
├── Services/
│   ├── Orchestration/
│   │   ├── AgentOrchestrationService.php
│   │   ├── TaskDistributionService.php
│   │   └── TaskPlannerService.php
│   ├── Agent/
│   │   ├── AgentRegistryService.php
│   │   ├── AgentHealthService.php
│   │   └── AgentCommunicationService.php
│   ├── Integration/
│   │   ├── WhatsAppIntegrationService.php
│   │   ├── TelegramIntegrationService.php
│   │   └── WebhookDeliveryService.php
│   └── Realtime/
│       └── BroadcastService.php
├── Jobs/
│   ├── ExecuteAgentTaskJob.php
│   ├── ProcessIncomingCommandJob.php
│   ├── SendAgentMessageJob.php
│   └── DeliverWebhookJob.php
├── Events/
│   ├── SessionCreated.php
│   ├── SessionCompleted.php
│   ├── TaskUpdated.php
│   ├── TaskCompleted.php
│   ├── AgentStatusChanged.php
│   └── MessageCreated.php
├── Models/
│   ├── Agent.php
│   ├── Session.php
│   ├── Task.php
│   ├── Message.php
│   └── TaskLog.php
└── Enums/
    ├── AgentStatus.php
    ├── AgentType.php
    ├── TaskStatus.php
    ├── SessionStatus.php
    └── MessageType.php
```

### 3.2 Core Service Implementations

#### AgentOrchestrationService.php
```php
<?php

namespace App\Services\Orchestration;

use App\Models\Session;
use App\Models\Task;
use App\Events\SessionCreated;
use App\Enums\SessionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgentOrchestrationService
{
    public function __construct(
        private readonly TaskPlannerService $planner,
        private readonly TaskDistributionService $distributor
    ) {}

    public function createSession(string $source, string $command, ?int $userId = null): Session
    {
        return DB::transaction(function () use ($source, $command, $userId) {
            // Create session
            $session = Session::create([
                'uuid' => Str::uuid(),
                'command_source' => $source,
                'original_command' => $command,
                'status' => SessionStatus::PLANNING,
                'created_by' => $userId,
                'started_at' => now(),
            ]);

            // Plan tasks using AI planner
            $taskPlan = $this->planner->planTasks($command);

            // Create tasks with dependencies
            foreach ($taskPlan as $index => $item) {
                Task::create([
                    'uuid' => Str::uuid(),
                    'session_id' => $session->id,
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'status' => 'pending',
                    'payload' => $item['payload'] ?? null,
                    'dependencies' => $item['dependencies'] ?? null,
                    'queued_at' => now(),
                ]);
            }

            // Update session status
            $session->update(['status' => SessionStatus::RUNNING]);

            // Broadcast session created event
            event(new SessionCreated($session));

            // Start task distribution
            $this->distributor->distributePendingTasks($session->id);

            return $session->fresh(['tasks', 'tasks.assignedAgent']);
        });
    }

    public function cancelSession(Session $session): void
    {
        DB::transaction(function () use ($session) {
            // Cancel all pending/running tasks
            $session->tasks()
                ->whereIn('status', ['pending', 'assigned', 'running'])
                ->update(['status' => 'cancelled']);

            // Update session
            $session->update([
                'status' => SessionStatus::CANCELLED,
                'ended_at' => now(),
            ]);

            // Release agents
            $this->distributor->releaseAgentsFromSession($session->id);
        });
    }
}
```

#### TaskDistributionService.php
```php
<?php

namespace App\Services\Orchestration;

use App\Models\Agent;
use App\Models\Task;
use App\Jobs\ExecuteAgentTaskJob;
use App\Events\TaskUpdated;
use App\Events\AgentStatusChanged;
use App\Enums\AgentStatus;
use Illuminate\Support\Facades\DB;

class TaskDistributionService
{
    public function distributePendingTasks(int $sessionId): void
    {
        $pendingTasks = Task::where('session_id', $sessionId)
            ->where('status', 'pending')
            ->whereNull('assigned_agent_id')
            ->orderBy('id')
            ->get();

        foreach ($pendingTasks as $task) {
            // Check dependencies
            if (!$this->areDependenciesMet($task)) {
                continue;
            }

            $this->assignTaskToAgent($task);
        }
    }

    private function areDependenciesMet(Task $task): bool
    {
        if (empty($task->dependencies)) {
            return true;
        }

        $incompleteDeps = Task::whereIn('id', $task->dependencies)
            ->where('status', '!=', 'completed')
            ->count();

        return $incompleteDeps === 0;
    }

    private function assignTaskToAgent(Task $task): void
    {
        DB::transaction(function () use ($task) {
            // Find best available agent
            $agent = $this->selectBestAgent($task);

            if (!$agent) {
                return; // No agent available, will retry later
            }

            // Assign task
            $task->update([
                'assigned_agent_id' => $agent->id,
                'status' => 'assigned',
            ]);

            // Update agent status
            $agent->update([
                'status' => AgentStatus::BUSY,
                'current_task' => $task->title,
            ]);

            // Broadcast events
            event(new TaskUpdated($task));
            event(new AgentStatusChanged($agent));

            // Dispatch execution job
            ExecuteAgentTaskJob::dispatch($task->id)
                ->onQueue('agent-execution');
        });
    }

    private function selectBestAgent(Task $task): ?Agent
    {
        return Agent::query()
            ->where('status', AgentStatus::IDLE)
            ->when($task->payload['required_type'] ?? null, function ($q, $type) {
                $q->where('type', $type);
            })
            ->orderBy('priority')
            ->orderBy('id')
            ->lockForUpdate()
            ->first();
    }

    public function releaseAgentsFromSession(int $sessionId): void
    {
        $agentIds = Task::where('session_id', $sessionId)
            ->whereNotNull('assigned_agent_id')
            ->pluck('assigned_agent_id')
            ->unique();

        Agent::whereIn('id', $agentIds)->update([
            'status' => AgentStatus::IDLE,
            'current_task' => null,
        ]);
    }
}
```

### 3.3 Event Broadcasting

#### TaskUpdated Event
```php
<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public Task $task) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("session.{$this->task->session_id}"),
            new Channel("dashboard.global"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->task->id,
            'uuid' => $this->task->uuid,
            'title' => $this->task->title,
            'status' => $this->task->status,
            'progress' => $this->task->progress,
            'assigned_agent' => $this->task->assignedAgent ? [
                'id' => $this->task->assignedAgent->id,
                'name' => $this->task->assignedAgent->name,
                'type' => $this->task->assignedAgent->type,
            ] : null,
            'updated_at' => $this->task->updated_at->toIso8601String(),
        ];
    }
}
```

#### AgentStatusChanged Event
```php
<?php

namespace App\Events;

use App\Models\Agent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class AgentStatusChanged implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public Agent $agent) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("dashboard.global"),
            new Channel("agent.{$this->agent->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'agent.status_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->agent->id,
            'uuid' => $this->agent->uuid,
            'name' => $this->agent->name,
            'type' => $this->agent->type,
            'status' => $this->agent->status,
            'current_task' => $this->agent->current_task,
            'avatar' => $this->agent->avatar,
            'last_seen_at' => $this->agent->last_seen_at?->toIso8601String(),
        ];
    }
}
```

---

## SECTION 4: REST API ENDPOINTS

### 4.1 API Route Structure

```php
// routes/api.php

Route::prefix('v1')->group(function () {
    // Sessions
    Route::apiResource('sessions', SessionController::class);
    Route::post('sessions/{session}/cancel', [SessionController::class, 'cancel']);
    Route::post('sessions/{session}/pause', [SessionController::class, 'pause']);
    Route::post('sessions/{session}/resume', [SessionController::class, 'resume']);
    Route::get('sessions/{session}/timeline', [SessionController::class, 'timeline']);

    // Tasks
    Route::apiResource('tasks', TaskController::class)->only(['index', 'show', 'update']);
    Route::post('tasks/{task}/retry', [TaskController::class, 'retry']);

    // Agents
    Route::apiResource('agents', AgentController::class);
    Route::post('agents/{agent}/heartbeat', [AgentController::class, 'heartbeat']);
    Route::post('agents/{agent}/events', [AgentController::class, 'reportEvents']);
    Route::get('agents/overview/stats', [AgentController::class, 'stats']);

    // Messages
    Route::get('sessions/{session}/messages', [MessageController::class, 'index']);
    Route::post('sessions/{session}/messages', [MessageController::class, 'store']);

    // Webhooks (external channel integration)
    Route::post('webhooks/whatsapp', [WebhookController::class, 'whatsapp']);
    Route::post('webhooks/telegram', [WebhookController::class, 'telegram']);
    Route::post('webhooks/generic', [WebhookController::class, 'generic']);

    // Dashboard data
    Route::prefix('dashboard')->group(function () {
        Route::get('overview', [DashboardController::class, 'overview']);
        Route::get('agents', [DashboardController::class, 'agents']);
        Route::get('active-sessions', [DashboardController::class, 'activeSessions']);
        Route::get('metrics', [DashboardController::class, 'metrics']);
    });

    // Health
    Route::get('health', [HealthController::class, 'check']);
    Route::get('health/agents', [HealthController::class, 'agentHealth']);
});
```

### 4.2 Key API Contracts

#### Create Session
```
POST /api/v1/sessions

Request:
{
    "command": "Buatkan fitur login dengan OAuth Google",
    "source": "whatsapp",
    "context": {
        "user_id": "62812xxx",
        "conversation_id": "wa_123"
    }
}

Response 201:
{
    "success": true,
    "data": {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "command_source": "whatsapp",
        "original_command": "Buatkan fitur login dengan OAuth Google",
        "status": "running",
        "tasks": [
            {
                "id": 1,
                "title": "Analyze requirements",
                "status": "assigned",
                "progress": 0,
                "assigned_agent": {
                    "id": 1,
                    "name": "Planner",
                    "type": "planner"
                }
            },
            // ... more tasks
        ],
        "started_at": "2026-03-19T10:00:00Z"
    }
}
```

#### Agent Heartbeat
```
POST /api/v1/agents/{agent_id}/heartbeat

Request:
{
    "status": "busy",
    "current_task_id": 5,
    "progress": 45,
    "load": 0.72,
    "meta": {
        "tokens_used": 1250,
        "memory_mb": 512
    }
}

Response 200:
{
    "success": true,
    "data": {
        "acknowledged": true,
        "timestamp": "2026-03-19T10:05:00Z"
    }
}
```

#### Agent Report Events (Batch)
```
POST /api/v1/agents/{agent_id}/events

Request:
{
    "events": [
        {
            "event_type": "task.progress",
            "task_id": 5,
            "timestamp": "2026-03-19T10:04:00Z",
            "payload": {
                "progress": 30,
                "message": "Analyzing codebase structure"
            }
        },
        {
            "event_type": "message.sent",
            "timestamp": "2026-03-19T10:04:30Z",
            "payload": {
                "to_agent_id": 3,
                "content": "Handoff: Requirements ready for implementation",
                "channel": "handoff"
            }
        }
    ]
}

Response 202:
{
    "success": true,
    "data": {
        "accepted": 2,
        "processed_at": "2026-03-19T10:04:31Z"
    }
}
```

---

## SECTION 5: FRONTEND DASHBOARD DESIGN

### 5.1 Component Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── WarRoomLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── agents/
│   │   │   ├── AgentTopologyPanel.tsx
│   │   │   ├── AgentNode.tsx
│   │   │   ├── AgentStatusRing.tsx
│   │   │   ├── ConnectionLayer.tsx (SVG lines)
│   │   │   └── TypingIndicator.tsx
│   │   ├── tasks/
│   │   │   ├── ActiveTaskPanel.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskProgressBar.tsx
│   │   │   └── TaskTimeline.tsx
│   │   ├── communication/
│   │   │   ├── CommunicationLogPanel.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageFilter.tsx
│   │   ├── command/
│   │   │   ├── CommandConsole.tsx
│   │   │   └── CommandHistory.tsx
│   │   └── common/
│   │       ├── StatusChip.tsx
│   │       ├── ProgressRing.tsx
│   │       └── AlertToast.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   ├── useAgents.ts
│   │   ├── useTasks.ts
│   │   └── useSession.ts
│   ├── stores/
│   │   ├── agentStore.ts
│   │   ├── taskStore.ts
│   │   ├── sessionStore.ts
│   │   └── messageStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── websocket.ts
│   └── App.tsx
```

### 5.2 War Room Dashboard Layout

```tsx
// WarRoomLayout.tsx - Main dashboard structure

export default function WarRoomLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
        {/* Header - Command Bar */}
        <header className="mb-4">
          <HeaderCommandBar />
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left: Agent Topology (7 cols) */}
          <div className="xl:col-span-7">
            <AgentTopologyPanel />
          </div>

          {/* Right: Task + Communication (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <ActiveTaskPanel />
            <CommunicationLogPanel />
          </div>
        </div>

        {/* Bottom: Timeline + Command Input */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TaskTimeline />
          <CommandConsole />
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Agent Node Component

```tsx
// AgentNode.tsx - Individual agent visualization

interface AgentNodeProps {
  agent: Agent;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AgentNode({ agent, isSelected, onClick }: AgentNodeProps) {
  const statusColors = {
    idle: 'ring-slate-500',
    busy: 'ring-emerald-400',
    communicating: 'ring-sky-400',
    error: 'ring-rose-400',
    offline: 'ring-gray-600',
  };

  const statusAnimations = {
    busy: 'animate-pulse',
    communicating: 'animate-pulse',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative w-24 h-24 rounded-full bg-slate-800/80",
        "border border-slate-700 transition-all duration-200",
        "hover:border-slate-500 hover:bg-slate-800",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-sky-400 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-slate-950",
        isSelected && "border-sky-400"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Agent ${agent.name}, status ${agent.status}`}
    >
      {/* Status Ring */}
      <span
        className={cn(
          "absolute inset-0 rounded-full ring-2",
          statusColors[agent.status],
          statusAnimations[agent.status]
        )}
      />

      {/* Avatar */}
      <span className="absolute inset-2 rounded-full bg-slate-700 grid place-items-center">
        {agent.avatar ? (
          <img src={agent.avatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-slate-300">
            {agent.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>

      {/* Name Label */}
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-300 whitespace-nowrap">
        {agent.name}
      </span>

      {/* Typing Indicator (when busy) */}
      {agent.status === 'busy' && <TypingIndicator />}

      {/* Current Task Tooltip */}
      {agent.current_task && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs max-w-48 truncate">
            {agent.current_task}
          </div>
        </div>
      )}
    </motion.button>
  );
}
```

### 5.4 WebSocket Integration

```typescript
// hooks/useWebSocket.ts

import { useEffect, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAgentStore } from '../stores/agentStore';
import { useTaskStore } from '../stores/taskStore';
import { useMessageStore } from '../stores/messageStore';

// Initialize Pusher for Laravel Echo
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: import.meta.env.VITE_PUSHER_PORT,
  wssPort: import.meta.env.VITE_PUSHER_PORT,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
});

export function useWebSocket(sessionId?: string) {
  const { updateAgent } = useAgentStore();
  const { updateTask } = useTaskStore();
  const { addMessage } = useMessageStore();

  useEffect(() => {
    // Subscribe to global dashboard channel
    const globalChannel = echo.channel('dashboard.global');

    globalChannel
      .listen('.agent.status_changed', (data: AgentStatusEvent) => {
        updateAgent(data.id, data);
      })
      .listen('.task.updated', (data: TaskUpdateEvent) => {
        updateTask(data.id, data);
      });

    // Subscribe to session-specific channel if provided
    let sessionChannel: any;
    if (sessionId) {
      sessionChannel = echo.channel(`session.${sessionId}`);

      sessionChannel
        .listen('.task.updated', (data: TaskUpdateEvent) => {
          updateTask(data.id, data);
        })
        .listen('.message.created', (data: MessageEvent) => {
          addMessage(data);
        });
    }

    return () => {
      echo.leave('dashboard.global');
      if (sessionId) {
        echo.leave(`session.${sessionId}`);
      }
    };
  }, [sessionId, updateAgent, updateTask, addMessage]);

  return { echo };
}
```

### 5.5 Zustand Store for Agents

```typescript
// stores/agentStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Agent {
  id: number;
  uuid: string;
  name: string;
  type: string;
  status: 'idle' | 'busy' | 'communicating' | 'error' | 'offline';
  current_task: string | null;
  avatar: string | null;
  last_seen_at: string | null;
}

interface AgentState {
  agents: Record<number, Agent>;
  selectedAgentId: number | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: number, data: Partial<Agent>) => void;
  selectAgent: (id: number | null) => void;
  getAgentsByStatus: (status: Agent['status']) => Agent[];
}

export const useAgentStore = create<AgentState>()(
  immer((set, get) => ({
    agents: {},
    selectedAgentId: null,

    setAgents: (agents) => {
      set((state) => {
        state.agents = agents.reduce((acc, agent) => {
          acc[agent.id] = agent;
          return acc;
        }, {} as Record<number, Agent>);
      });
    },

    updateAgent: (id, data) => {
      set((state) => {
        if (state.agents[id]) {
          Object.assign(state.agents[id], data);
        }
      });
    },

    selectAgent: (id) => {
      set((state) => {
        state.selectedAgentId = id;
      });
    },

    getAgentsByStatus: (status) => {
      return Object.values(get().agents).filter((a) => a.status === status);
    },
  }))
);
```

---

## SECTION 6: DOCKER DEPLOYMENT

### 6.1 Directory Structure

```
/root/work/ai/subagent-work-view/
├── docker/
│   ├── nginx/
│   │   ├── dev.conf
│   │   └── prod.conf
│   ├── php/
│   │   └── Dockerfile
│   └── supervisor/
│       └── laravel-worker.conf
├── backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── composer.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── storage/
│   ├── mysql/
│   ├── redis/
│   └── logs/
├── .env
├── .env.dev
├── .env.prod
├── docker-compose.yml
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

### 6.2 Docker Compose Configuration

```yaml
# docker-compose.yml (base)
version: "3.9"
name: subagent-work-view

networks:
  app_net:
    driver: bridge

volumes:
  mysql_data:
  redis_data:

services:
  nginx:
    image: nginx:1.27-alpine
    container_name: swv-nginx
    depends_on:
      - backend
      - frontend
      - soketi
    ports:
      - "80:80"
    volumes:
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./backend/public:/var/www/backend/public:ro
      - ./frontend/dist:/var/www/frontend/dist:ro
    networks:
      - app_net
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/php/Dockerfile
    container_name: swv-backend
    working_dir: /var/www/backend
    env_file: .env
    volumes:
      - ./backend:/var/www/backend
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app_net
    restart: unless-stopped

  queue-worker:
    build:
      context: ./backend
      dockerfile: ../docker/php/Dockerfile
    container_name: swv-queue-worker
    working_dir: /var/www/backend
    command: php artisan queue:work --sleep=1 --tries=3 --timeout=120
    env_file: .env
    volumes:
      - ./backend:/var/www/backend
    depends_on:
      - backend
    networks:
      - app_net
    restart: unless-stopped

  scheduler:
    build:
      context: ./backend
      dockerfile: ../docker/php/Dockerfile
    container_name: swv-scheduler
    working_dir: /var/www/backend
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    env_file: .env
    volumes:
      - ./backend:/var/www/backend
    depends_on:
      - backend
    networks:
      - app_net
    restart: unless-stopped

  soketi:
    image: quay.io/soketi/soketi:1.6-16-alpine
    container_name: swv-soketi
    environment:
      SOKETI_DEBUG: "1"
      SOKETI_DEFAULT_APP_ID: "${PUSHER_APP_ID}"
      SOKETI_DEFAULT_APP_KEY: "${PUSHER_APP_KEY}"
      SOKETI_DEFAULT_APP_SECRET: "${PUSHER_APP_SECRET}"
      SOKETI_DEFAULT_APP_ENABLE_CLIENT_MESSAGES: "true"
    depends_on:
      - redis
    ports:
      - "6001:6001"
    networks:
      - app_net
    restart: unless-stopped

  frontend:
    image: node:22-alpine
    container_name: swv-frontend
    working_dir: /var/www/frontend
    command: sh -c "npm ci && npm run build"
    volumes:
      - ./frontend:/var/www/frontend
    networks:
      - app_net

  mysql:
    image: mysql:8.4
    container_name: swv-mysql
    environment:
      MYSQL_DATABASE: "${DB_DATABASE}"
      MYSQL_USER: "${DB_USERNAME}"
      MYSQL_PASSWORD: "${DB_PASSWORD}"
      MYSQL_ROOT_PASSWORD: "${DB_ROOT_PASSWORD}"
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: swv-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 10
    restart: unless-stopped
```

### 6.3 Nginx Configuration with WebSocket Support

```nginx
# docker/nginx/prod.conf

upstream laravel {
    server backend:9000;
}

upstream soketi {
    server soketi:6001;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    root /var/www/frontend/dist;
    index index.html;

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Laravel API
    location /api {
        alias /var/www/backend/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/backend/public/index.php;
            fastcgi_pass laravel;
        }
    }

    # WebSocket endpoint
    location /app {
        proxy_pass http://soketi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 600s;
    }
}
```

---

## SECTION 7: LOGGING & MONITORING

### 7.1 Structured Event Schema

```json
{
  "ts": "2026-03-19T10:15:00.000Z",
  "level": "info",
  "event_type": "agent.state_changed",
  "service": "subagent-orchestrator",
  "trace_id": "trc_abc123",
  "agent": {
    "agent_id": "agent-01",
    "agent_type": "coder",
    "state_prev": "idle",
    "state_new": "busy"
  },
  "task": {
    "task_id": "task-005",
    "session_id": "session-001"
  },
  "perf": {
    "duration_ms": 0,
    "queue_wait_ms": 120
  }
}
```

### 7.2 Key Metrics to Collect

**Counters:**
- `agent_tasks_assigned_total{agent_type}`
- `agent_tasks_completed_total{agent_type}`
- `agent_tasks_failed_total{agent_type, error_type}`
- `agent_messages_sent_total{from_type, to_type}`

**Histograms:**
- `agent_task_duration_seconds{agent_type, task_type}`
- `agent_queue_wait_seconds{agent_type}`
- `agent_message_latency_seconds`

**Gauges:**
- `agent_utilization_ratio{agent_id}`
- `agent_inflight_tasks{agent_id}`
- `agent_queue_depth{queue}`

### 7.3 Health Check Endpoints

```php
// GET /api/v1/health
{
    "status": "healthy",
    "timestamp": "2026-03-19T10:00:00Z",
    "checks": {
        "database": { "status": "healthy", "latency_ms": 5 },
        "redis": { "status": "healthy", "latency_ms": 2 },
        "queue": { "status": "healthy", "pending_jobs": 12 },
        "soketi": { "status": "healthy", "connections": 45 }
    }
}

// GET /api/v1/health/agents
{
    "total_agents": 6,
    "online": 5,
    "offline": 1,
    "busy": 3,
    "idle": 2,
    "agents": [
        { "id": 1, "name": "Planner", "status": "busy", "last_heartbeat": "5s ago" },
        // ...
    ]
}
```

---

## SECTION 8: SECURITY CONSIDERATIONS

### 8.1 Webhook Verification

```php
// Verify WhatsApp webhook signature
public function verifyWhatsAppSignature(Request $request): bool
{
    $signature = $request->header('X-Hub-Signature-256');
    $payload = $request->getContent();
    $secret = config('services.whatsapp.webhook_secret');

    $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

    return hash_equals($expected, $signature);
}
```

### 8.2 Rate Limiting

```php
// RouteServiceProvider or route middleware
RateLimiter::for('webhook', function (Request $request) {
    return Limit::perMinute(60)->by($request->ip());
});

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});
```

### 8.3 WebSocket Authentication

```php
// Broadcasting authorization
Broadcast::channel('session.{sessionId}', function ($user, $sessionId) {
    return $user->can('view', Session::find($sessionId));
});

Broadcast::channel('dashboard.global', function ($user) {
    return $user->hasPermission('view-dashboard');
});
```

---

## SECTION 9: IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Week 1)
- [ ] Setup project structure di `/root/work/ai/subagent-work-view`
- [ ] Initialize Laravel backend dengan migrations
- [ ] Setup Docker Compose environment
- [ ] Create basic models & relationships
- [ ] Setup Redis & MySQL containers
- [ ] Configure Laravel broadcasting dengan Soketi

### Phase 2: Core Backend (Week 2)
- [ ] Implement OrchestrationService
- [ ] Implement TaskDistributionService
- [ ] Create queue jobs untuk task execution
- [ ] Setup event broadcasting (TaskUpdated, AgentStatusChanged)
- [ ] Create REST API endpoints
- [ ] Implement webhook receivers (WhatsApp, generic)

### Phase 3: Frontend Dashboard (Week 3)
- [ ] Setup Vite + React + Tailwind
- [ ] Create WarRoomLayout component
- [ ] Build AgentTopologyPanel dengan nodes
- [ ] Build ActiveTaskPanel dengan progress
- [ ] Build CommunicationLogPanel
- [ ] Integrate WebSocket dengan Laravel Echo
- [ ] Setup Zustand stores

### Phase 4: Integration & Polish (Week 4)
- [ ] End-to-end testing alur WhatsApp → Dashboard
- [ ] Add animations dengan Framer Motion
- [ ] Implement connection lines antar agent
- [ ] Add command console functionality
- [ ] Performance optimization
- [ ] Documentation

---

## SECTION 10: SAMPLE SEEDER DATA

```php
// database/seeders/AgentSeeder.php

public function run(): void
{
    $agents = [
        [
            'name' => 'Planner',
            'type' => 'planner',
            'avatar' => '/avatars/planner.png',
            'capabilities' => ['planning', 'analysis', 'decomposition'],
            'priority' => 10,
        ],
        [
            'name' => 'Architect',
            'type' => 'architect',
            'avatar' => '/avatars/architect.png',
            'capabilities' => ['design', 'architecture', 'patterns'],
            'priority' => 20,
        ],
        [
            'name' => 'Coder Alpha',
            'type' => 'coder',
            'avatar' => '/avatars/coder-1.png',
            'capabilities' => ['coding', 'php', 'laravel', 'javascript'],
            'priority' => 30,
        ],
        [
            'name' => 'Coder Beta',
            'type' => 'coder',
            'avatar' => '/avatars/coder-2.png',
            'capabilities' => ['coding', 'react', 'typescript', 'frontend'],
            'priority' => 30,
        ],
        [
            'name' => 'Reviewer',
            'type' => 'reviewer',
            'avatar' => '/avatars/reviewer.png',
            'capabilities' => ['review', 'quality', 'best-practices'],
            'priority' => 40,
        ],
        [
            'name' => 'Tester',
            'type' => 'tester',
            'avatar' => '/avatars/tester.png',
            'capabilities' => ['testing', 'e2e', 'unit-test'],
            'priority' => 50,
        ],
    ];

    foreach ($agents as $agent) {
        Agent::create([
            'uuid' => Str::uuid(),
            'name' => $agent['name'],
            'type' => $agent['type'],
            'status' => 'idle',
            'avatar' => $agent['avatar'],
            'capabilities' => $agent['capabilities'],
            'priority' => $agent['priority'],
            'capacity' => 1,
        ]);
    }
}
```

---

## FINAL NOTES

### Key Success Factors

1. **Real-time First**: Semua state changes harus instant broadcast ke dashboard. User harus merasa "live" watching tim bekerja.

2. **Visual Clarity**: Agent status harus jelas dalam 1 glance. Gunakan warna, animasi subtle, dan spatial layout yang intuitif.

3. **Reliable Orchestration**: Task assignment, retry logic, dan error handling harus robust. System tidak boleh "hang" atau silent fail.

4. **Scalable Architecture**: Design untuk multiple concurrent sessions dengan banyak agents. Use queue, cache wisely.

5. **Developer Experience**: Clean code structure, proper typing, comprehensive logging untuk debugging.

### Expected User Flow

1. User kirim message ke WhatsApp bot: "Buatkan fitur user registration dengan email verification"

2. Webhook terima → Create Session → Plan Tasks

3. Dashboard langsung update:
   - Session card muncul
   - Planner agent status berubah dari idle → busy
   - Progress: "Analyzing requirements..."

4. Planner selesai → handoff ke Coder agents
   - Communication log: "Planner → Coder Alpha: Requirements ready, please implement User model"
   - Coder Alpha & Beta mulai bekerja parallel

5. dst sampai semua task complete

6. User lihat hasil di dashboard + notif balik ke WhatsApp

---

**END OF MEGA PROMPT**

*Document Version: 1.0*
*Generated: 2026-03-19*
*Target: OpenClaw ACP Claude Code*
*Word Count: 4800+*
