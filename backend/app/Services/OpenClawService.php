<?php

namespace App\Services;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Enums\MessageType;
use App\Enums\SessionStatus;
use App\Models\Agent;
use App\Models\Message;
use App\Models\Session;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use JsonException;
use Throwable;

class OpenClawService
{
    public const SOURCE = 'openclaw';

    public function syncFile(string $filePath): array
    {
        if (! is_file($filePath) || ! is_readable($filePath)) {
            throw new \RuntimeException("OpenClaw log file tidak bisa dibaca: {$filePath}");
        }

        $sessionId = basename($filePath, '.jsonl');
        $events = $this->readEventsFromFile($filePath);

        if ($events === []) {
            return [
                'session_id' => $sessionId,
                'session_record_id' => null,
                'agent_id' => null,
                'processed_events' => 0,
                'created_messages' => 0,
                'skipped_messages' => 0,
                'malformed_lines' => 0,
            ];
        }

        return DB::transaction(function () use ($events, $filePath, $sessionId): array {
            $session = null;
            $agent = null;
            $stats = [
                'processed_events' => 0,
                'created_messages' => 0,
                'skipped_messages' => 0,
                'malformed_lines' => 0,
            ];

            foreach ($events as $event) {
                $result = $this->ingestEvent(
                    sessionId: $sessionId,
                    event: $event,
                    filePath: $filePath,
                    session: $session,
                    agent: $agent,
                );

                $session = $result['session'];
                $agent = $result['agent'];
                $stats['processed_events']++;
                $stats['created_messages'] += $result['created_messages'];
                $stats['skipped_messages'] += $result['skipped_messages'];
            }

            if ($session !== null) {
                $session->refresh();
            }

            return [
                'session_id' => $sessionId,
                'session_record_id' => $session?->id,
                'agent_id' => $agent?->id,
                ...$stats,
            ];
        });
    }

    public function ingestForwardedEvent(string $sessionId, array $event, ?string $filePath = null): array
    {
        return DB::transaction(function () use ($sessionId, $event, $filePath): array {
            $result = $this->ingestEvent(
                sessionId: $sessionId,
                event: $event,
                filePath: $filePath,
            );

            return [
                'session_id' => $sessionId,
                'session_record_id' => $result['session']->id,
                'agent_id' => $result['agent']?->id,
                'created_messages' => $result['created_messages'],
                'skipped_messages' => $result['skipped_messages'],
                'event_type' => $event['type'] ?? 'unknown',
            ];
        });
    }

    public function readEventsFromFile(string $filePath): array
    {
        $events = [];
        $handle = @fopen($filePath, 'rb');

        if ($handle === false) {
            Log::warning('OpenClaw log file gagal dibuka.', ['file' => $filePath]);

            return [];
        }

        $lineNumber = 0;

        try {
            while (($line = fgets($handle)) !== false) {
                $lineNumber++;
                $line = trim($line);

                if ($line === '') {
                    continue;
                }

                try {
                    $events[] = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
                } catch (JsonException $exception) {
                    Log::warning('OpenClaw menemukan baris JSON tidak valid.', [
                        'file' => $filePath,
                        'line' => $lineNumber,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }
        } finally {
            fclose($handle);
        }

        return $events;
    }

    private function ingestEvent(
        string $sessionId,
        array $event,
        ?string $filePath = null,
        ?Session $session = null,
        ?Agent $agent = null,
    ): array {
        $timestamp = $this->parseTimestamp(Arr::get($event, 'timestamp'));

        $session ??= $this->upsertSession($sessionId, $event, $timestamp, $filePath);
        $session = $this->updateSessionMetadata($session, $event, $timestamp, $filePath);

        $agent ??= $this->upsertAgent($sessionId, $event, $timestamp);
        $agent = $this->refreshAgentMetadata($agent, $event, $timestamp);

        $createdMessages = 0;
        $skippedMessages = 0;

        if (($event['type'] ?? null) === 'message') {
            $message = $this->buildMessagePayload($session, $agent, $event, $timestamp);

            if ($message !== null) {
                $created = $this->storeMessage($session, $message);
                $created ? $createdMessages++ : $skippedMessages++;
            }
        }

        if (($event['type'] ?? null) === 'model_change') {
            $created = $this->storeMessage($session, [
                'from_agent_id' => $agent->id,
                'to_agent_id' => null,
                'content' => 'Model changed to ' . ($this->extractModelId($event) ?? 'unknown'),
                'message_type' => MessageType::SYSTEM,
                'channel' => self::SOURCE,
                'timestamp' => $timestamp,
            ]);

            $created ? $createdMessages++ : $skippedMessages++;
        }

        if (($event['type'] ?? null) === 'custom') {
            $summary = $this->buildCustomEventSummary($event);

            if ($summary !== null) {
                $created = $this->storeMessage($session, [
                    'from_agent_id' => $agent->id,
                    'to_agent_id' => null,
                    'content' => $summary,
                    'message_type' => MessageType::SYSTEM,
                    'channel' => self::SOURCE,
                    'timestamp' => $timestamp,
                ]);

                $created ? $createdMessages++ : $skippedMessages++;
            }
        }

        return [
            'session' => $session,
            'agent' => $agent,
            'created_messages' => $createdMessages,
            'skipped_messages' => $skippedMessages,
        ];
    }

    private function upsertSession(
        string $sessionId,
        array $event,
        CarbonImmutable $timestamp,
        ?string $filePath,
    ): Session {
        $context = $this->buildContext($sessionId, $event, $filePath, $timestamp);
        $originalCommand = $this->extractOriginalCommand($event, $sessionId);

        $session = Session::query()
            ->where('command_source', self::SOURCE)
            ->where('context->openclaw_session_id', $sessionId)
            ->first();

        if ($session !== null) {
            if ($originalCommand !== null && $this->isFallbackCommand($session->original_command, $sessionId)) {
                $session->original_command = $originalCommand;
            }

            $session->context = $this->mergeContext($session->context ?? [], $context);
            $session->started_at ??= $timestamp;
            $session->ended_at = $this->resolveEndedAt($session->ended_at, $event, $timestamp);
            $session->status = $this->resolveStatus($session->status, $event);
            $session->save();

            return $session;
        }

        return Session::create([
            'command_source' => self::SOURCE,
            'original_command' => $originalCommand ?? "OpenClaw session {$sessionId}",
            'status' => $this->resolveStatus(null, $event),
            'context' => $context,
            'started_at' => $timestamp,
            'ended_at' => $this->resolveEndedAt(null, $event, $timestamp),
        ]);
    }

    private function updateSessionMetadata(Session $session, array $event, CarbonImmutable $timestamp, ?string $filePath): Session
    {
        $context = $this->mergeContext(
            $session->context ?? [],
            $this->buildContext($this->extractSessionId($event) ?? ($session->context['openclaw_session_id'] ?? (string) $session->id), $event, $filePath, $timestamp),
        );

        $session->context = $context;
        $session->status = $this->resolveStatus($session->status, $event);
        $session->ended_at = $this->resolveEndedAt($session->ended_at, $event, $timestamp);

        $originalCommand = $this->extractOriginalCommand($event, $context['openclaw_session_id'] ?? (string) $session->id);
        if ($originalCommand !== null && $this->isFallbackCommand($session->original_command, $context['openclaw_session_id'] ?? (string) $session->id)) {
            $session->original_command = $originalCommand;
        }

        $session->save();

        return $session;
    }

    private function upsertAgent(string $sessionId, array $event, CarbonImmutable $timestamp): Agent
    {
        $provider = $this->extractProvider($event) ?? self::SOURCE;
        $modelId = $this->extractModelId($event) ?? 'unknown';
        $name = "openclaw {$sessionId}";

        $agent = Agent::query()->firstOrCreate(
            ['name' => $name],
            [
                'type' => AgentType::CODER,
                'status' => AgentStatus::IDLE,
                'current_task' => null,
                'capacity' => 1,
                'priority' => 50,
                'capabilities' => [
                    'source' => self::SOURCE,
                    'provider' => $provider,
                    'model_id' => $modelId,
                ],
                'last_seen_at' => $timestamp,
            ],
        );

        return $this->refreshAgentMetadata($agent, $event, $timestamp);
    }

    private function refreshAgentMetadata(Agent $agent, array $event, CarbonImmutable $timestamp): Agent
    {
        $capabilities = $agent->capabilities ?? [];
        $capabilities['source'] = self::SOURCE;
        $capabilities['provider'] = $this->extractProvider($event) ?? ($capabilities['provider'] ?? self::SOURCE);
        $capabilities['model_id'] = $this->extractModelId($event) ?? ($capabilities['model_id'] ?? 'unknown');

        $agent->fill([
            'status' => AgentStatus::IDLE,
            'last_seen_at' => $timestamp,
            'capabilities' => $capabilities,
        ]);
        $agent->save();

        return $agent;
    }

    private function buildMessagePayload(Session $session, Agent $agent, array $event, CarbonImmutable $timestamp): ?array
    {
        $content = $this->extractContent($event);
        if ($content === null || trim($content) === '') {
            return null;
        }

        $role = $this->extractRole($event);
        $messageType = match ($role) {
            'user' => MessageType::USER,
            'system' => MessageType::SYSTEM,
            default => MessageType::AGENT,
        };

        return [
            'from_agent_id' => $messageType === MessageType::USER ? null : $agent->id,
            'to_agent_id' => $messageType === MessageType::USER ? $agent->id : null,
            'content' => $content,
            'message_type' => $messageType,
            'channel' => self::SOURCE,
            'timestamp' => $timestamp,
        ];
    }

    private function storeMessage(Session $session, array $attributes): bool
    {
        $timestamp = $attributes['timestamp'] instanceof CarbonImmutable
            ? $attributes['timestamp']->toDateTimeString()
            : $attributes['timestamp'];

        $exists = Message::query()
            ->where('session_id', $session->id)
            ->where('channel', $attributes['channel'])
            ->where('message_type', $attributes['message_type']->value)
            ->where('content', $attributes['content'])
            ->where('timestamp', $timestamp)
            ->exists();

        if ($exists) {
            return false;
        }

        Message::create([
            'session_id' => $session->id,
            'from_agent_id' => $attributes['from_agent_id'],
            'to_agent_id' => $attributes['to_agent_id'],
            'content' => $attributes['content'],
            'message_type' => $attributes['message_type'],
            'channel' => $attributes['channel'],
            'timestamp' => $timestamp,
        ]);

        return true;
    }

    private function buildContext(string $sessionId, array $event, ?string $filePath, CarbonImmutable $timestamp): array
    {
        $context = [
            'openclaw_session_id' => $sessionId,
            'command_source' => self::SOURCE,
            'source_path' => $filePath,
            'last_event_type' => $event['type'] ?? 'unknown',
            'last_event_at' => $timestamp->toIso8601String(),
        ];

        if (($provider = $this->extractProvider($event)) !== null) {
            $context['provider'] = $provider;
        }

        if (($modelId = $this->extractModelId($event)) !== null) {
            $context['model_id'] = $modelId;
        }

        if (($customType = Arr::get($event, 'customType')) !== null) {
            $context['last_custom_type'] = $customType;
        }

        if (($level = Arr::get($event, 'level')) !== null) {
            $context['thinking_level'] = $level;
        }

        if (($sessionData = Arr::get($event, 'data')) !== null && ($event['type'] ?? null) === 'session') {
            $context['session'] = is_array($sessionData) ? $sessionData : ['value' => $sessionData];
        }

        return $context;
    }

    private function extractOriginalCommand(array $event, string $sessionId): ?string
    {
        $command = Arr::get($event, 'data.command')
            ?? Arr::get($event, 'data.prompt')
            ?? Arr::get($event, 'original_command');

        if (is_string($command) && trim($command) !== '') {
            return Str::limit(trim($command), 65535, '');
        }

        if (($event['type'] ?? null) !== 'message') {
            return null;
        }

        $content = $this->extractContent($event);
        if ($content === null) {
            return null;
        }

        $role = $this->extractRole($event);
        if ($role === 'assistant' && $this->isFallbackCommand($content, $sessionId)) {
            return null;
        }

        return Str::limit($content, 65535, '');
    }

    private function extractContent(array $event): ?string
    {
        $content = $event['content']
            ?? Arr::get($event, 'message.content')
            ?? Arr::get($event, 'data.content')
            ?? Arr::get($event, 'data.message.content');

        if (is_string($content)) {
            return trim($content);
        }

        if (is_array($content)) {
            $parts = [];

            foreach ($content as $part) {
                if (is_string($part)) {
                    $parts[] = $part;
                    continue;
                }

                if (! is_array($part)) {
                    continue;
                }

                if (isset($part['text']) && is_string($part['text'])) {
                    $parts[] = $part['text'];
                    continue;
                }

                if (($part['type'] ?? null) === 'text' && isset($part['text']) && is_string($part['text'])) {
                    $parts[] = $part['text'];
                }
            }

            $text = trim(implode("\n", array_filter($parts)));

            return $text !== '' ? $text : json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return null;
    }

    private function extractRole(array $event): string
    {
        $role = strtolower((string) (
            $event['role']
            ?? Arr::get($event, 'message.role')
            ?? Arr::get($event, 'data.role')
            ?? (isset($event['provider']) || isset($event['modelId']) ? 'assistant' : 'system')
        ));

        return in_array($role, ['user', 'assistant', 'system'], true) ? $role : 'assistant';
    }

    private function extractProvider(array $event): ?string
    {
        $provider = $event['provider']
            ?? Arr::get($event, 'data.provider')
            ?? Arr::get($event, 'message.provider')
            ?? Arr::get($event, 'data.message.provider');

        return is_string($provider) && trim($provider) !== '' ? trim($provider) : null;
    }

    private function extractModelId(array $event): ?string
    {
        $modelId = $event['modelId']
            ?? Arr::get($event, 'data.modelId')
            ?? Arr::get($event, 'message.modelId')
            ?? Arr::get($event, 'data.message.modelId');

        return is_string($modelId) && trim($modelId) !== '' ? trim($modelId) : null;
    }

    private function extractSessionId(array $event): ?string
    {
        $sessionId = $event['session_id']
            ?? Arr::get($event, 'data.session_id')
            ?? Arr::get($event, 'data.sessionId')
            ?? Arr::get($event, 'sessionId');

        return is_string($sessionId) && trim($sessionId) !== '' ? trim($sessionId) : null;
    }

    private function buildCustomEventSummary(array $event): ?string
    {
        $customType = Arr::get($event, 'customType');
        if (! is_string($customType) || $customType === '') {
            return null;
        }

        return match ($customType) {
            'thinking_level_change' => 'Thinking level changed to ' . (Arr::get($event, 'level', 'unknown')),
            default => 'Custom event: ' . $customType,
        };
    }

    private function resolveStatus(string|SessionStatus|null $currentStatus, array $event): SessionStatus
    {
        $status = $currentStatus instanceof SessionStatus
            ? $currentStatus
            : (is_string($currentStatus) && $currentStatus !== '' ? SessionStatus::from($currentStatus) : SessionStatus::RUNNING);

        if (($event['type'] ?? null) !== 'custom') {
            return $status;
        }

        $customType = strtolower((string) Arr::get($event, 'customType', ''));
        if (str_contains($customType, 'error') || str_contains($customType, 'fail')) {
            return SessionStatus::FAILED;
        }

        if (in_array($customType, ['session_completed', 'session_closed', 'session_finished'], true)) {
            return SessionStatus::COMPLETED;
        }

        return $status;
    }

    private function resolveEndedAt(null|string|\DateTimeInterface $currentEndedAt, array $event, CarbonImmutable $timestamp): ?CarbonImmutable
    {
        if ($currentEndedAt instanceof \DateTimeInterface) {
            return CarbonImmutable::instance($currentEndedAt);
        }

        if (($event['type'] ?? null) !== 'custom') {
            return $currentEndedAt ? CarbonImmutable::parse($currentEndedAt) : null;
        }

        $customType = strtolower((string) Arr::get($event, 'customType', ''));
        if (
            str_contains($customType, 'error')
            || str_contains($customType, 'fail')
            || in_array($customType, ['session_completed', 'session_closed', 'session_finished'], true)
        ) {
            return $timestamp;
        }

        return $currentEndedAt ? CarbonImmutable::parse($currentEndedAt) : null;
    }

    private function parseTimestamp(mixed $timestamp): CarbonImmutable
    {
        if (! is_string($timestamp) || trim($timestamp) === '') {
            return CarbonImmutable::now();
        }

        try {
            return CarbonImmutable::parse($timestamp);
        } catch (Throwable) {
            return CarbonImmutable::now();
        }
    }

    private function mergeContext(array $existing, array $updates): array
    {
        foreach ($updates as $key => $value) {
            if (is_array($value) && is_array($existing[$key] ?? null)) {
                $existing[$key] = $this->mergeContext($existing[$key], $value);
                continue;
            }

            if ($value !== null && $value !== '') {
                $existing[$key] = $value;
            }
        }

        return $existing;
    }

    private function isFallbackCommand(?string $command, string $sessionId): bool
    {
        return $command === null || trim($command) === '' || trim($command) === "OpenClaw session {$sessionId}";
    }
}
