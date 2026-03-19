<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use App\Http\Resources\TaskLogResource;
use App\Models\Session;
use App\Services\Orchestration\AgentOrchestrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function __construct(
        private readonly AgentOrchestrationService $orchestration
    ) {}

    /**
     * Return paginated sessions with tasks count.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $sessions = Session::query()
            ->withCount('tasks')
            ->with('tasks.assignedAgent')
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->source, fn($q, $source) => $q->where('command_source', $source))
            ->when($request->search, fn($q, $search) => $q->where('original_command', 'like', "%{$search}%"))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return SessionResource::collection($sessions);
    }

    /**
     * Create new session via OrchestrationService.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => 'required|string|max:5000',
            'source' => 'sometimes|string|max:50',
            'context' => 'sometimes|array',
        ]);

        try {
            $session = $this->orchestration->createSession(
                $validated['source'] ?? 'api',
                $validated['command'],
                $request->user()?->id
            );

            if (isset($validated['context'])) {
                $session->update(['context' => $validated['context']]);
                $session->refresh();
            }

            return response()->json([
                'data' => new SessionResource($session->load(['tasks.assignedAgent'])),
                'message' => 'Session created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return session with tasks and agents.
     */
    public function show(Session $session): SessionResource
    {
        $session->load([
            'tasks.assignedAgent',
            'tasks.logs.agent',
            'messages.fromAgent',
            'messages.toAgent',
        ]);

        // Load unique agents working on this session
        $session->loadCount('tasks');

        return new SessionResource($session);
    }

    /**
     * Cancel session via OrchestrationService.
     */
    public function cancel(Session $session): JsonResponse
    {
        if (!$session->isActive()) {
            return response()->json([
                'message' => 'Session is not active and cannot be cancelled',
                'status' => $session->status,
            ], 422);
        }

        try {
            $this->orchestration->cancelSession($session);

            return response()->json([
                'data' => new SessionResource($session->fresh(['tasks.assignedAgent'])),
                'message' => 'Session cancelled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pause session execution.
     */
    public function pause(Session $session): JsonResponse
    {
        if (!$session->isActive()) {
            return response()->json([
                'message' => 'Session is not active and cannot be paused',
                'status' => $session->status,
            ], 422);
        }

        try {
            $this->orchestration->pauseSession($session);

            return response()->json([
                'data' => new SessionResource($session->fresh(['tasks.assignedAgent'])),
                'message' => 'Session paused successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to pause session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resume paused session.
     */
    public function resume(Session $session): JsonResponse
    {
        try {
            $this->orchestration->resumeSession($session);

            return response()->json([
                'data' => new SessionResource($session->fresh(['tasks.assignedAgent'])),
                'message' => 'Session resumed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to resume session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return session timeline with task logs.
     */
    public function timeline(Session $session): JsonResponse
    {
        $logs = $session->tasks()
            ->with(['logs.agent', 'logs.task:id,uuid,title'])
            ->get()
            ->flatMap(fn($task) => $task->logs)
            ->sortBy('timestamp')
            ->values();

        return response()->json([
            'data' => TaskLogResource::collection($logs),
            'meta' => [
                'session_id' => $session->id,
                'session_uuid' => $session->uuid,
                'total_events' => $logs->count(),
            ],
        ]);
    }
}
