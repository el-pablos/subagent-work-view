<?php

namespace App\Jobs;

use App\Models\Agent;
use App\Models\Session;
use App\Models\Task;
use App\Models\Message;
use App\Events\AgentStatusChanged;
use App\Events\TaskUpdated;
use App\Events\MessageCreated;
use App\Enums\AgentStatus;
use App\Enums\TaskStatus;
use App\Enums\MessageType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

class ProcessClaudeEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'claude-events';

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 30;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public array $backoff = [3, 10, 30];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $eventType,
        public array $payload,
        public ?string $sessionUuid = null
    ) {
        $this->onQueue('claude-events');
        $this->onConnection('redis-high-throughput');
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        // Prevent overlapping processing for the same session
        if ($this->sessionUuid) {
            return [
                (new WithoutOverlapping($this->sessionUuid))
                    ->releaseAfter(30)
                    ->expireAfter(60),
            ];
        }

        return [];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("Processing Claude event: {$this->eventType}", [
            'session_uuid' => $this->sessionUuid,
            'payload_keys' => array_keys($this->payload),
        ]);

        match ($this->eventType) {
            'agent.spawned' => $this->handleAgentSpawned(),
            'agent.idle' => $this->handleAgentIdle(),
            'agent.busy' => $this->handleAgentBusy(),
            'agent.terminated' => $this->handleAgentTerminated(),
            'task.created' => $this->handleTaskCreated(),
            'task.started' => $this->handleTaskStarted(),
            'task.progress' => $this->handleTaskProgress(),
            'task.completed' => $this->handleTaskCompleted(),
            'task.failed' => $this->handleTaskFailed(),
            'message.sent' => $this->handleMessageSent(),
            'session.started' => $this->handleSessionStarted(),
            'session.completed' => $this->handleSessionCompleted(),
            default => Log::warning("Unknown Claude event type: {$this->eventType}"),
        };
    }

    /**
     * Handle agent spawned event.
     */
    protected function handleAgentSpawned(): void
    {
        $session = $this->findSession();
        if (!$session) return;

        $agent = Agent::updateOrCreate(
            [
                'session_id' => $session->id,
                'external_id' => $this->payload['agent_id'] ?? null,
            ],
            [
                'name' => $this->payload['name'] ?? 'Unknown Agent',
                'role' => $this->payload['role'] ?? 'worker',
                'status' => AgentStatus::IDLE,
                'model' => $this->payload['model'] ?? 'claude-sonnet-4-20250514',
                'capabilities' => $this->payload['capabilities'] ?? [],
            ]
        );

        event(new AgentStatusChanged($agent));

        Log::info("Agent spawned: {$agent->name}", ['agent_id' => $agent->id]);
    }

    /**
     * Handle agent idle event.
     */
    protected function handleAgentIdle(): void
    {
        $agent = $this->findAgent();
        if (!$agent) return;

        $agent->update([
            'status' => AgentStatus::IDLE,
            'current_task' => null,
            'last_heartbeat' => now(),
        ]);

        event(new AgentStatusChanged($agent->fresh()));
    }

    /**
     * Handle agent busy event.
     */
    protected function handleAgentBusy(): void
    {
        $agent = $this->findAgent();
        if (!$agent) return;

        $agent->update([
            'status' => AgentStatus::WORKING,
            'current_task' => $this->payload['task'] ?? null,
            'last_heartbeat' => now(),
        ]);

        event(new AgentStatusChanged($agent->fresh()));
    }

    /**
     * Handle agent terminated event.
     */
    protected function handleAgentTerminated(): void
    {
        $agent = $this->findAgent();
        if (!$agent) return;

        $agent->update([
            'status' => AgentStatus::TERMINATED,
            'current_task' => null,
        ]);

        event(new AgentStatusChanged($agent->fresh()));

        Log::info("Agent terminated: {$agent->name}", ['agent_id' => $agent->id]);
    }

    /**
     * Handle task created event.
     */
    protected function handleTaskCreated(): void
    {
        $session = $this->findSession();
        if (!$session) return;

        $task = Task::create([
            'session_id' => $session->id,
            'external_id' => $this->payload['task_id'] ?? null,
            'title' => $this->payload['title'] ?? 'Untitled Task',
            'description' => $this->payload['description'] ?? null,
            'status' => TaskStatus::PENDING,
            'priority' => $this->payload['priority'] ?? 'normal',
            'dependencies' => $this->payload['dependencies'] ?? [],
        ]);

        event(new TaskUpdated($task));

        Log::info("Task created: {$task->title}", ['task_id' => $task->id]);
    }

    /**
     * Handle task started event.
     */
    protected function handleTaskStarted(): void
    {
        $task = $this->findTask();
        if (!$task) return;

        $task->update([
            'status' => TaskStatus::RUNNING,
            'started_at' => now(),
            'assigned_agent_id' => $this->findAgent()?->id,
        ]);

        event(new TaskUpdated($task->fresh()));
    }

    /**
     * Handle task progress event.
     */
    protected function handleTaskProgress(): void
    {
        $task = $this->findTask();
        if (!$task) return;

        $task->update([
            'progress' => $this->payload['progress'] ?? $task->progress,
            'result' => array_merge(
                $task->result ?? [],
                ['last_output' => $this->payload['output'] ?? null]
            ),
        ]);

        event(new TaskUpdated($task->fresh()));
    }

    /**
     * Handle task completed event.
     */
    protected function handleTaskCompleted(): void
    {
        $task = $this->findTask();
        if (!$task) return;

        $task->update([
            'status' => TaskStatus::COMPLETED,
            'progress' => 100,
            'result' => $this->payload['result'] ?? [],
            'finished_at' => now(),
        ]);

        event(new TaskUpdated($task->fresh()));

        Log::info("Task completed: {$task->title}", ['task_id' => $task->id]);
    }

    /**
     * Handle task failed event.
     */
    protected function handleTaskFailed(): void
    {
        $task = $this->findTask();
        if (!$task) return;

        $task->update([
            'status' => TaskStatus::FAILED,
            'result' => ['error' => $this->payload['error'] ?? 'Unknown error'],
            'finished_at' => now(),
        ]);

        event(new TaskUpdated($task->fresh()));

        Log::warning("Task failed: {$task->title}", [
            'task_id' => $task->id,
            'error' => $this->payload['error'] ?? 'Unknown',
        ]);
    }

    /**
     * Handle message sent event.
     */
    protected function handleMessageSent(): void
    {
        $session = $this->findSession();
        if (!$session) return;

        $fromAgent = null;
        $toAgent = null;

        if ($from = $this->payload['from_agent_id'] ?? null) {
            $fromAgent = Agent::where('external_id', $from)
                ->where('session_id', $session->id)
                ->first();
        }

        if ($to = $this->payload['to_agent_id'] ?? null) {
            $toAgent = Agent::where('external_id', $to)
                ->where('session_id', $session->id)
                ->first();
        }

        $message = Message::create([
            'session_id' => $session->id,
            'from_agent_id' => $fromAgent?->id,
            'to_agent_id' => $toAgent?->id,
            'content' => $this->payload['content'] ?? '',
            'message_type' => MessageType::from($this->payload['type'] ?? 'agent'),
            'channel' => $this->payload['channel'] ?? 'general',
            'timestamp' => now(),
        ]);

        event(new MessageCreated($message->fresh(['fromAgent', 'toAgent'])));
    }

    /**
     * Handle session started event.
     */
    protected function handleSessionStarted(): void
    {
        $session = $this->findSession();
        if (!$session) return;

        $session->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        Log::info("Session started: {$session->uuid}");
    }

    /**
     * Handle session completed event.
     */
    protected function handleSessionCompleted(): void
    {
        $session = $this->findSession();
        if (!$session) return;

        $session->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);

        Log::info("Session completed: {$session->uuid}");
    }

    /**
     * Find session by UUID.
     */
    protected function findSession(): ?Session
    {
        if (!$this->sessionUuid) {
            Log::warning('No session UUID provided for Claude event');
            return null;
        }

        return Session::where('uuid', $this->sessionUuid)->first();
    }

    /**
     * Find agent by external ID in payload.
     */
    protected function findAgent(): ?Agent
    {
        $session = $this->findSession();
        if (!$session) return null;

        $externalId = $this->payload['agent_id'] ?? null;
        if (!$externalId) return null;

        return Agent::where('external_id', $externalId)
            ->where('session_id', $session->id)
            ->first();
    }

    /**
     * Find task by external ID in payload.
     */
    protected function findTask(): ?Task
    {
        $session = $this->findSession();
        if (!$session) return null;

        $externalId = $this->payload['task_id'] ?? null;
        if (!$externalId) return null;

        return Task::where('external_id', $externalId)
            ->where('session_id', $session->id)
            ->first();
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessClaudeEventJob failed: {$this->eventType}", [
            'session_uuid' => $this->sessionUuid,
            'error' => $exception->getMessage(),
            'payload' => $this->payload,
        ]);
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addMinutes(5);
    }
}
