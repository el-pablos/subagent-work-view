<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Webhook\AgentIngestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class WebhookController extends Controller
{
    private const SUPPORTED_SOURCES = ['claude', 'openclaw', 'copilot-cli'];

    public function __construct(
        private readonly AgentIngestService $ingestService,
    ) {}

    public function receive(Request $request, string $source): JsonResponse
    {
        if (! in_array($source, self::SUPPORTED_SOURCES, true)) {
            return response()->json([
                'message' => 'Unsupported webhook source.',
                'supported' => self::SUPPORTED_SOURCES,
            ], 422);
        }

        try {
            $validated = $request->validate($this->validationRules($source));
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }

        $payload = $this->normalizePayload($source, $validated);

        try {
            $result = $this->ingestService->process($source, $payload);

            return response()->json([
                'message' => ucfirst($source) . ' webhook processed.',
                'data' => $result,
            ], 202);
        } catch (Throwable $exception) {
            Log::error("Webhook processing gagal [{$source}].", [
                'source' => $source,
                'session_id' => $payload['session_id'] ?? null,
                'event_type' => $payload['event_type'] ?? null,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => ucfirst($source) . ' webhook failed.',
            ], 500);
        }
    }

    /**
     * Validation rules per source.
     */
    private function validationRules(string $source): array
    {
        $base = [
            'session_id' => ['required', 'string', 'max:255'],
            'timestamp' => ['nullable', 'date'],
        ];

        return match ($source) {
            'claude' => array_merge($base, [
                'tool' => ['required', 'string', 'max:100'],
                'input' => ['nullable', 'array'],
                'agent_name' => ['nullable', 'string', 'max:255'],
                'agent_id' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string', 'max:50'],
            ]),
            'openclaw' => array_merge($base, [
                'event' => ['required', 'string', 'in:session,message,model_change,status_change'],
                'data' => ['required', 'array'],
            ]),
            'copilot-cli' => array_merge($base, [
                'type' => ['required', 'string', 'in:agent_spawn,task_update,message'],
                'agent' => ['nullable', 'array'],
                'agent.name' => ['nullable', 'string', 'max:255'],
                'agent.agent_type' => ['nullable', 'string', 'max:100'],
                'agent.status' => ['nullable', 'string', 'max:50'],
                'task' => ['nullable', 'array'],
                'message' => ['nullable', 'string'],
            ]),
            default => $base,
        };
    }

    /**
     * Transform validated payload into the canonical format expected by WebhookNormalizer.
     */
    private function normalizePayload(string $source, array $validated): array
    {
        return match ($source) {
            'claude' => [
                'session_id' => $validated['session_id'],
                'agent_id' => $validated['agent_id'] ?? $validated['session_id'],
                'event_type' => $this->claudeToolToEventType($validated['tool']),
                'timestamp' => $validated['timestamp'] ?? now()->toIso8601String(),
                'data' => array_merge($validated['input'] ?? [], [
                    'agent_name' => $validated['agent_name'] ?? null,
                    'tool_name' => $validated['tool'],
                    'tool_input' => isset($validated['input']) ? json_encode($validated['input'], JSON_UNESCAPED_UNICODE) : null,
                    'status' => $validated['status'] ?? null,
                ]),
            ],
            'openclaw' => [
                'session_id' => $validated['session_id'],
                'event_type' => $validated['event'],
                'timestamp' => $validated['timestamp'] ?? now()->toIso8601String(),
                'data' => $validated['data'],
            ],
            'copilot-cli' => [
                'session_id' => $validated['session_id'],
                'agent_id' => $validated['agent']['id'] ?? $validated['session_id'],
                'event_type' => $validated['type'],
                'timestamp' => $validated['timestamp'] ?? now()->toIso8601String(),
                'data' => array_merge($validated['agent'] ?? [], [
                    'task' => $validated['task'] ?? null,
                    'message_content' => $validated['message'] ?? null,
                ]),
            ],
            default => $validated,
        };
    }

    private function claudeToolToEventType(string $tool): string
    {
        return match (strtolower($tool)) {
            'task' => 'agent_spawn',
            'sendmessage', 'send_message' => 'agent_message',
            default => 'agent_action',
        };
    }
}
