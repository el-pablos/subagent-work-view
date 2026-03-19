<?php

namespace App\Http\Controllers\Api;

use App\Events\AgentSpawned;
use App\Events\AgentStatusChanged;
use App\Events\TaskUpdated;
use App\Events\MessageCreated;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessClaudeEvent;
use App\Models\Agent;
use App\Models\Message;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class WebhookController extends Controller
{
    /**
     * Allowed event types from Claude Code.
     */
    private const ALLOWED_EVENT_TYPES = [
        'agent.spawned',
        'agent.status_changed',
        'agent.terminated',
        'task.created',
        'task.updated',
        'message.sent',
    ];

    /**
     * Handle incoming Claude Code events.
     */
    public function handleClaudeEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_id' => 'required|string|max:255',
            'event_type' => ['required', 'string', Rule::in(self::ALLOWED_EVENT_TYPES)],
            'data' => 'required|array',
            'timestamp' => 'required|date',
        ]);

        Log::info('Claude webhook received', [
            'agent_id' => $validated['agent_id'],
            'event_type' => $validated['event_type'],
        ]);

        // Dispatch job for async processing
        ProcessClaudeEvent::dispatch(
            $validated['agent_id'],
            $validated['event_type'],
            $validated['data'],
            $validated['timestamp']
        );

        return response()->json([
            'success' => true,
            'message' => 'Event received and queued for processing',
            'event_type' => $validated['event_type'],
        ], 202);
    }
}
