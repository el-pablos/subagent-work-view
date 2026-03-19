<?php

namespace App\Services\Webhook;

use App\Enums\AgentStatus;
use App\Enums\MessageType;
use App\Enums\SessionStatus;
use App\Enums\TaskStatus;
use App\Events\AgentStatusChanged;
use App\Events\MessageCreated;
use App\Events\SessionCompleted;
use App\Events\SessionCreated;
use App\Events\TaskCompleted;
use App\Events\TaskUpdated;
use App\Models\Agent;
use App\Models\Message;
use App\Models\Session;
use App\Models\Task;
use App\Models\TaskLog;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgentIngestService
{
    public function __construct(
        private readonly WebhookNormalizer $normalizer,
    ) {}

    public function process(string $source, array $payload): array
    {
        $normalized = $this->normalizer->normalize($source, $payload);

        return DB::transaction(fn (): array => $this->processNormalized($normalized));
    }

    private function processNormalized(array $normalized): array
    {
        $processed = [
            'source' => $normalized['source'],
            'event_type' => $normalized['event_type'],
        ];

        $sessionResult = $this->upsertSession($normalized);
        $agentResult = $this->upsertAgent($normalized, $sessionResult['model']);

        if ($sessionResult['model']) {
            $processed['session'] = [
                'id' => $sessionResult['model']->id,
                'external_id' => $sessionResult['model']->external_id,
                'created' => $sessionResult['created'],
                'updated' => $sessionResult['updated'],
            ];
        }

        if ($agentResult['model']) {
            $processed['agent'] = [
                'id' => $agentResult['model']->id,
                'external_id' => $agentResult['model']->external_id,
                'created' => $agentResult['created'],
                'updated' => $agentResult['updated'],
            ];
        }

        $eventType = $normalized['event_type'];

        if (in_array($eventType, ['agent_spawn', 'session'], true)) {
            $this->broadcastSessionLifecycle($sessionResult, $normalized);
            $this->broadcastAgentStatus($agentResult);

            return $processed;
        }

        if ($eventType === 'status_change') {
            $this->broadcastAgentStatus($agentResult);
            $this->broadcastSessionLifecycle($sessionResult, $normalized);

            return $processed;
        }

        if (in_array($eventType, ['agent_message', 'message'], true)) {
            $messageResult = $this->createMessage($normalized, $sessionResult['model'], $agentResult['model']);

            if ($messageResult['model']) {
                $processed['message'] = [
                    'id' => $messageResult['model']->id,
                    'created' => $messageResult['created'],
                ];
            }

            return $processed;
        }

        if ($eventType === 'agent_action') {
            $taskResult = $this->upsertTaskActivity($normalized, $sessionResult['model'], $agentResult['model']);

            if ($taskResult['task']) {
                $processed['task'] = [
                    'id' => $taskResult['task']->id,
                    'created' => $taskResult['created'],
                    'updated' => $taskResult['updated'],
                ];
            }

            if ($taskResult['log']) {
                $processed['task_log'] = [
                    'id' => $taskResult['log']->id,
                    'created' => $taskResult['log_created'],
                ];
            }
        }

        return $processed;
    }

    private function upsertSession(array $normalized): array
    {
        $sessionData = $normalized['session'] ?? [];
        $externalId = $sessionData['external_id'] ?? null;

        if (! $externalId) {
            return ['model' => null, 'created' => false, 'updated' => false];
        }

        $session = Session::query()->firstOrNew([
            'external_id' => $externalId,
        ]);

        $created = ! $session->exists;
        $timestamp = $this->parseTimestamp($normalized['occurred_at'] ?? null);
        $status = $sessionData['status'] ?? SessionStatus::QUEUED->value;

        $session->fill([
            'uuid' => $session->uuid ?: $this->resolveUuid($externalId),
            'external_id' => $externalId,
            'command_source' => $sessionData['command_source'] ?? $normalized['source'],
            'original_command' => $this->resolveOriginalCommand(
                $session->original_command,
                $sessionData['original_command'] ?? null,
                $normalized['source'],
                $normalized['event_type'],
            ),
            'status' => $status,
            'context' => array_merge($session->context ?? [], $sessionData['context'] ?? [], [
                'last_event_type' => $normalized['event_type'],
                'last_event_at' => $timestamp?->toIso8601String(),
                'source' => $normalized['source'],
            ]),
            'started_at' => $session->started_at ?: $timestamp,
            'ended_at' => $this->shouldEndSession($status)
                ? ($session->ended_at ?: $timestamp)
                : null,
        ]);

        $updated = $session->isDirty();
        $session->save();

        return [
            'model' => $session->fresh(),
            'created' => $created,
            'updated' => $updated,
        ];
    }

    private function upsertAgent(array $normalized, ?Session $session): array
    {
        $agentData = $normalized['agent'] ?? [];
        $externalId = $agentData['external_id'] ?? null;

        if (! $externalId) {
            return ['model' => null, 'created' => false, 'updated' => false];
        }

        $agent = Agent::withTrashed()->firstOrNew([
            'external_id' => $externalId,
        ]);

        if ($agent->exists() && $agent->trashed()) {
            $agent->restore();
        }

        $created = ! $agent->exists;
        $timestamp = $this->parseTimestamp($normalized['occurred_at'] ?? null);
        $status = $agentData['status'] ?? AgentStatus::IDLE->value;

        $agent->fill([
            'uuid' => $agent->uuid ?: $this->resolveUuid($externalId),
            'source' => $normalized['source'],
            'external_id' => $externalId,
            'name' => $agentData['name'] ?? $agent->name ?? 'Webhook Agent',
            'type' => $agentData['type'],
            'status' => $status,
            'session_id' => $session?->id,
            'current_task' => $agentData['current_task'] ?? $agent->current_task,
            'capacity' => $agent->capacity ?: 1,
            'priority' => $agent->priority ?: 100,
            'capabilities' => array_values(array_unique(array_filter([
                ...($agent->capabilities ?? []),
                ...($agentData['capabilities'] ?? []),
            ]))),
            'metadata' => array_merge($agent->metadata ?? [], $agentData['metadata'] ?? [], [
                'last_event_type' => $normalized['event_type'],
            ]),
            'last_seen_at' => $timestamp ?? now(),
        ]);

        $updated = $agent->isDirty();
        $agent->save();

        return [
            'model' => $agent->fresh(),
            'created' => $created,
            'updated' => $updated,
        ];
    }

    private function createMessage(array $normalized, ?Session $session, ?Agent $agent): array
    {
        if (! $session || empty($normalized['message'])) {
            return ['model' => null, 'created' => false];
        }

        $messageData = $normalized['message'];
        $timestamp = $this->parseTimestamp($normalized['occurred_at'] ?? null) ?? now();

        $message = Message::query()->firstOrCreate([
            'session_id' => $session->id,
            'from_agent_id' => $agent?->id,
            'to_agent_id' => null,
            'content' => $messageData['content'],
            'message_type' => Arr::get($messageData, 'message_type', MessageType::SYSTEM->value),
            'channel' => Arr::get($messageData, 'channel', 'general'),
            'timestamp' => $timestamp,
        ]);

        $created = $message->wasRecentlyCreated;
        $message->load(['fromAgent', 'toAgent']);

        if ($created) {
            event(new MessageCreated($message));
        }

        return [
            'model' => $message,
            'created' => $created,
        ];
    }

    private function upsertTaskActivity(array $normalized, ?Session $session, ?Agent $agent): array
    {
        if (! $session || empty($normalized['task'])) {
            return [
                'task' => null,
                'created' => false,
                'updated' => false,
                'log' => null,
                'log_created' => false,
            ];
        }

        $taskData = $normalized['task'];
        $timestamp = $this->parseTimestamp($normalized['occurred_at'] ?? null) ?? now();
        $status = $taskData['status'] ?? TaskStatus::PENDING->value;

        $task = Task::query()
            ->where('session_id', $session->id)
            ->where('title', $taskData['title'])
            ->when($agent, fn ($query) => $query->where('assigned_agent_id', $agent->id))
            ->when(! $agent, fn ($query) => $query->whereNull('assigned_agent_id'))
            ->orderByDesc('id')
            ->first();

        if ($task && $task->status?->isTerminal() && ! in_array($status, [
            TaskStatus::COMPLETED->value,
            TaskStatus::FAILED->value,
            TaskStatus::CANCELLED->value,
        ], true)) {
            $task = null;
        }

        $created = ! $task;
        $task ??= new Task([
            'uuid' => (string) Str::uuid(),
            'session_id' => $session->id,
            'assigned_agent_id' => $agent?->id,
            'queued_at' => $timestamp,
        ]);

        $task->fill([
            'title' => $taskData['title'],
            'description' => $taskData['description'] ?? $task->description,
            'status' => $status,
            'assigned_agent_id' => $agent?->id,
            'progress' => $this->resolveTaskProgress($status, $taskData['progress'] ?? null, (int) $task->progress),
            'payload' => array_merge($task->payload ?? [], $taskData['payload'] ?? [], [
                'webhook' => [
                    'source' => $normalized['source'],
                    'event_type' => $normalized['event_type'],
                ],
            ]),
            'result' => $taskData['result'] ?? $task->result,
            'started_at' => $task->started_at ?: $timestamp,
            'finished_at' => $this->shouldFinishTask($status)
                ? ($task->finished_at ?: $timestamp)
                : null,
        ]);

        $updated = $task->isDirty();
        $task->save();

        $log = TaskLog::query()->firstOrCreate([
            'task_id' => $task->id,
            'agent_id' => $agent?->id,
            'action' => $taskData['action'] ?? 'agent_action',
            'timestamp' => $timestamp,
        ], [
            'notes' => $taskData['notes'] ?? $taskData['description'] ?? null,
            'meta' => $taskData['payload'] ?? [],
        ]);

        if ($created || $updated) {
            event(new TaskUpdated($task->fresh('assignedAgent')));

            if ($task->status === TaskStatus::COMPLETED) {
                event(new TaskCompleted($task->fresh('assignedAgent')));
            }
        }

        return [
            'task' => $task->fresh(),
            'created' => $created,
            'updated' => $updated,
            'log' => $log,
            'log_created' => $log->wasRecentlyCreated,
        ];
    }

    private function broadcastAgentStatus(array $agentResult): void
    {
        if ($agentResult['model'] && ($agentResult['created'] || $agentResult['updated'])) {
            event(new AgentStatusChanged($agentResult['model']));
        }
    }

    private function broadcastSessionLifecycle(array $sessionResult, array $normalized): void
    {
        if (! $sessionResult['model'] || ! ($sessionResult['created'] || $sessionResult['updated'])) {
            return;
        }

        if ($normalized['event_type'] === 'status_change' && $this->shouldEndSession($sessionResult['model']->status->value)) {
            event(new SessionCompleted($sessionResult['model']));

            return;
        }

        event(new SessionCreated($sessionResult['model']));
    }

    private function resolveTaskProgress(string $status, mixed $progress, int $fallback): int
    {
        if ($progress !== null) {
            return max(0, min(100, (int) $progress));
        }

        return match ($status) {
            TaskStatus::COMPLETED->value => 100,
            TaskStatus::RUNNING->value => max($fallback, 10),
            default => $fallback,
        };
    }

    private function shouldFinishTask(string $status): bool
    {
        return in_array($status, [
            TaskStatus::COMPLETED->value,
            TaskStatus::FAILED->value,
            TaskStatus::CANCELLED->value,
        ], true);
    }

    private function shouldEndSession(string $status): bool
    {
        return in_array($status, [
            SessionStatus::COMPLETED->value,
            SessionStatus::FAILED->value,
            SessionStatus::CANCELLED->value,
        ], true);
    }

    private function resolveOriginalCommand(?string $existing, ?string $incoming, string $source, string $eventType): string
    {
        return $existing ?: $incoming ?: "Webhook {$eventType} dari {$source}";
    }

    private function resolveUuid(string $externalId): string
    {
        return Str::isUuid($externalId) ? $externalId : (string) Str::uuid();
    }

    private function parseTimestamp(?string $timestamp): ?CarbonImmutable
    {
        if (! $timestamp) {
            return null;
        }

        try {
            return CarbonImmutable::parse($timestamp);
        } catch (\Throwable) {
            return null;
        }
    }
}
