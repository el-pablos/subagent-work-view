<?php

namespace App\Services\Webhook;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Enums\MessageType;
use App\Enums\SessionStatus;
use App\Enums\TaskStatus;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class WebhookNormalizer
{
    public function normalize(string $source, array $payload): array
    {
        return match ($source) {
            'claude' => $this->normalizeClaude($payload),
            'openclaw' => $this->normalizeOpenClaw($payload),
            'copilot-cli' => $this->normalizeCopilotCli($payload),
            default => $this->normalizeGeneric($payload, $source),
        };
    }

    private function normalizeClaude(array $payload): array
    {
        $data = $payload['data'] ?? [];
        $eventType = $payload['event_type'];
        $externalAgentId = $payload['agent_id'] ?? null;
        $externalSessionId = $payload['session_id'] ?? $externalAgentId;
        $toolName = Arr::get($data, 'tool_name');
        $toolInput = Arr::get($data, 'tool_input');

        return [
            'source' => 'claude',
            'event_type' => $eventType,
            'occurred_at' => $payload['timestamp'] ?? null,
            'agent' => [
                'external_id' => $externalAgentId,
                'name' => Arr::get($data, 'agent_name', 'Claude Agent'),
                'type' => $this->normalizeAgentType(Arr::get($data, 'agent_type'), Arr::get($data, 'agent_name')),
                'status' => $this->normalizeAgentStatus(Arr::get($data, 'status'))
                    ?? ($eventType === 'agent_spawn' ? AgentStatus::BUSY->value : AgentStatus::IDLE->value),
                'current_task' => $toolName ? "using {$toolName}" : null,
                'capabilities' => array_values(array_filter([
                    'claude',
                    Arr::get($data, 'agent_type'),
                    $toolName ? "tool:{$toolName}" : null,
                ])),
                'metadata' => [
                    'agent_type' => Arr::get($data, 'agent_type'),
                    'tool_name' => $toolName,
                ],
            ],
            'session' => [
                'external_id' => $externalSessionId,
                'command_source' => 'claude',
                'status' => $this->normalizeSessionStatus(Arr::get($data, 'status'), $eventType),
                'original_command' => $toolInput ?: Arr::get($data, 'agent_name', 'Claude webhook event'),
                'context' => [
                    'source' => 'claude',
                    'event_type' => $eventType,
                    'payload_data' => $data,
                ],
            ],
            'message' => $eventType === 'agent_message'
                ? [
                    'content' => $toolInput ?: Arr::get($data, 'message') ?: $this->stringifyPayload($data),
                    'message_type' => MessageType::AGENT->value,
                    'channel' => 'debug',
                ]
                : null,
            'task' => $eventType === 'agent_action'
                ? [
                    'title' => $toolName ? Str::headline($toolName) : 'Agent Action',
                    'description' => $toolInput,
                    'status' => $this->normalizeTaskStatus(Arr::get($data, 'status')),
                    'progress' => Arr::get($data, 'progress'),
                    'action' => $toolName ? "tool.{$toolName}" : 'agent_action',
                    'notes' => $toolInput,
                    'payload' => $data,
                    'result' => Arr::get($data, 'result'),
                ]
                : null,
            'raw' => $payload,
        ];
    }

    private function normalizeOpenClaw(array $payload): array
    {
        $data = $payload['data'] ?? [];
        $eventType = $payload['event_type'];
        $externalSessionId = $payload['session_id'] ?? null;
        $provider = Arr::get($data, 'provider');
        $modelId = Arr::get($data, 'model_id');
        $agentName = trim(collect([$provider, $modelId])->filter()->implode(' ')) ?: 'OpenClaw Agent';

        return [
            'source' => 'openclaw',
            'event_type' => $eventType,
            'occurred_at' => $payload['timestamp'] ?? null,
            'agent' => [
                'external_id' => $externalSessionId,
                'name' => $agentName,
                'type' => $this->normalizeAgentType(Arr::get($data, 'raw_type'), $agentName),
                'status' => $this->normalizeAgentStatus(Arr::get($data, 'status'))
                    ?? ($eventType === 'session' ? AgentStatus::BUSY->value : AgentStatus::IDLE->value),
                'current_task' => Arr::get($data, 'raw_type'),
                'capabilities' => array_values(array_filter([
                    'openclaw',
                    $provider,
                    $modelId,
                ])),
                'metadata' => [
                    'provider' => $provider,
                    'model_id' => $modelId,
                    'raw_type' => Arr::get($data, 'raw_type'),
                ],
            ],
            'session' => [
                'external_id' => $externalSessionId,
                'command_source' => 'openclaw',
                'status' => $this->normalizeSessionStatus(Arr::get($data, 'status'), $eventType),
                'original_command' => Arr::get($data, 'raw_type', 'OpenClaw webhook event'),
                'context' => [
                    'source' => 'openclaw',
                    'event_type' => $eventType,
                    'payload_data' => $data,
                ],
            ],
            'message' => $eventType === 'message'
                ? [
                    'content' => Arr::get($data, 'content') ?: $this->stringifyPayload($data),
                    'message_type' => MessageType::SYSTEM->value,
                    'channel' => 'debug',
                ]
                : null,
            'task' => null,
            'raw' => $payload,
        ];
    }

    private function normalizeCopilotCli(array $payload): array
    {
        $data = $payload['data'] ?? [];
        $eventType = $payload['event_type'];
        $externalSessionId = $payload['session_id'] ?? null;
        $externalAgentId = $payload['agent_id'] ?? $externalSessionId;
        $agentName = Arr::get($data, 'name', 'Copilot CLI Agent');
        $agentType = Arr::get($data, 'agent_type');
        $taskData = Arr::get($data, 'task');
        $messageContent = Arr::get($data, 'message_content');

        return [
            'source' => 'copilot-cli',
            'event_type' => $eventType,
            'occurred_at' => $payload['timestamp'] ?? null,
            'agent' => [
                'external_id' => $externalAgentId,
                'name' => $agentName,
                'type' => $this->normalizeAgentType($agentType, $agentName),
                'status' => $this->normalizeAgentStatus(Arr::get($data, 'status'))
                    ?? ($eventType === 'agent_spawn' ? AgentStatus::BUSY->value : AgentStatus::IDLE->value),
                'current_task' => $taskData['title'] ?? Arr::get($data, 'description'),
                'capabilities' => array_values(array_filter([
                    'copilot-cli',
                    $agentType,
                ])),
                'metadata' => [
                    'agent_type' => $agentType,
                    'model' => Arr::get($data, 'model'),
                ],
            ],
            'session' => [
                'external_id' => $externalSessionId,
                'command_source' => 'copilot-cli',
                'status' => $this->normalizeSessionStatus(Arr::get($data, 'status'), $eventType),
                'original_command' => $taskData['title'] ?? Arr::get($data, 'description', 'Copilot CLI webhook event'),
                'context' => [
                    'source' => 'copilot-cli',
                    'event_type' => $eventType,
                    'payload_data' => $data,
                ],
            ],
            'message' => $eventType === 'message' && $messageContent
                ? [
                    'content' => $messageContent,
                    'message_type' => MessageType::AGENT->value,
                    'channel' => 'copilot-cli',
                ]
                : null,
            'task' => $eventType === 'task_update' && $taskData
                ? [
                    'title' => $taskData['title'] ?? 'Copilot CLI Task',
                    'description' => $taskData['description'] ?? null,
                    'status' => $this->normalizeTaskStatus($taskData['status'] ?? null),
                    'progress' => $taskData['progress'] ?? null,
                    'action' => 'task_update',
                    'notes' => $taskData['description'] ?? null,
                    'payload' => $taskData,
                    'result' => $taskData['result'] ?? null,
                ]
                : null,
            'raw' => $payload,
        ];
    }

    private function normalizeGeneric(array $payload, string $source): array
    {
        $data = $payload['data'] ?? [];
        $externalId = $payload['session_id'] ?? $payload['agent_id'] ?? null;

        return [
            'source' => $source,
            'event_type' => $payload['event_type'],
            'occurred_at' => $payload['timestamp'] ?? null,
            'agent' => [
                'external_id' => $payload['agent_id'] ?? $externalId,
                'name' => Arr::get($data, 'agent_name', Str::headline($source) . ' Agent'),
                'type' => $this->normalizeAgentType(Arr::get($data, 'agent_type'), Arr::get($data, 'agent_name')),
                'status' => $this->normalizeAgentStatus(Arr::get($data, 'status')) ?? AgentStatus::IDLE->value,
                'current_task' => Arr::get($data, 'tool_name'),
                'capabilities' => [$source],
                'metadata' => ['source' => $source],
            ],
            'session' => [
                'external_id' => $payload['session_id'] ?? $externalId,
                'command_source' => $source,
                'status' => $this->normalizeSessionStatus(Arr::get($data, 'status'), $payload['event_type']),
                'original_command' => Arr::get($data, 'tool_input', 'Generic webhook event'),
                'context' => [
                    'source' => $source,
                    'event_type' => $payload['event_type'],
                    'payload_data' => $data,
                ],
            ],
            'message' => null,
            'task' => null,
            'raw' => $payload,
        ];
    }

    private function normalizeAgentStatus(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return match (Str::lower($status)) {
            'active', 'busy' => AgentStatus::BUSY->value,
            'terminated', 'offline' => AgentStatus::OFFLINE->value,
            'waiting_permission', 'waiting', 'idle' => AgentStatus::IDLE->value,
            'communicating' => AgentStatus::COMMUNICATING->value,
            'error', 'failed' => AgentStatus::ERROR->value,
            default => AgentStatus::IDLE->value,
        };
    }

    private function normalizeSessionStatus(?string $status, string $eventType): string
    {
        if (in_array($eventType, ['agent_spawn', 'session'], true)) {
            return SessionStatus::RUNNING->value;
        }

        return match (Str::lower((string) $status)) {
            'active', 'busy', 'running' => SessionStatus::RUNNING->value,
            'idle', 'waiting_permission', 'paused' => SessionStatus::PLANNING->value,
            'terminated', 'completed' => SessionStatus::COMPLETED->value,
            'failed', 'error' => SessionStatus::FAILED->value,
            'cancelled', 'canceled' => SessionStatus::CANCELLED->value,
            default => SessionStatus::QUEUED->value,
        };
    }

    private function normalizeTaskStatus(?string $status): string
    {
        return match (Str::lower((string) $status)) {
            'active', 'busy', 'running' => TaskStatus::RUNNING->value,
            'terminated', 'completed', 'success' => TaskStatus::COMPLETED->value,
            'failed', 'error' => TaskStatus::FAILED->value,
            'waiting_permission', 'blocked' => TaskStatus::BLOCKED->value,
            'cancelled', 'canceled' => TaskStatus::CANCELLED->value,
            default => TaskStatus::PENDING->value,
        };
    }

    private function normalizeAgentType(?string $type, ?string $name): string
    {
        $candidate = Str::lower(trim((string) $type));
        $name = Str::lower((string) $name);

        foreach (AgentType::cases() as $agentType) {
            if ($candidate === $agentType->value || Str::contains($name, $agentType->value)) {
                return $agentType->value;
            }
        }

        return match ($candidate) {
            'subagent', 'agent' => AgentType::CODER->value,
            'teammate' => AgentType::REVIEWER->value,
            default => AgentType::CODER->value,
        };
    }

    private function stringifyPayload(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';
    }
}
