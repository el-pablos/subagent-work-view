<?php

namespace App\Http\Controllers\Api;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Events\AgentCreated;
use App\Events\AgentStatusChanged;
use App\Events\MessageCreated;
use App\Events\TaskCompleted;
use App\Events\TaskUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\AgentResource;
use App\Models\Agent;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class AgentController extends Controller
{
    /**
     * Return all agents with current status.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $agents = Agent::query()
            ->withRelations()
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->has('available'), fn ($q) => $q->where('status', AgentStatus::IDLE))
            ->orderBy('priority', 'desc')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return AgentResource::collection($agents);
    }

    /**
     * Create a new agent.
     */
    public function store(Request $request): AgentResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', new Enum(AgentType::class)],
            'source' => 'sometimes|string|max:100',
            'external_id' => 'sometimes|nullable|string|max:255',
            'avatar' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1|max:100',
            'priority' => 'nullable|integer|min:0|max:100',
            'capabilities' => 'nullable|array',
            'capabilities.*' => 'string|max:100',
        ]);

        $agent = Agent::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'status' => AgentStatus::OFFLINE,
            'source' => $validated['source'] ?? 'unknown',
            'external_id' => $validated['external_id'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
            'capacity' => $validated['capacity'] ?? 1,
            'priority' => $validated['priority'] ?? 50,
            'capabilities' => $validated['capabilities'] ?? [],
        ]);

        // Broadcast events
        broadcast(new AgentCreated($agent));
        broadcast(new AgentStatusChanged($agent));

        return new AgentResource($agent);
    }

    /**
     * Return agent details with current task.
     */
    public function show(Agent $agent): AgentResource
    {
        return new AgentResource($agent->load(['tasks' => function ($query) {
            $query->whereNotIn('status', ['completed', 'failed', 'cancelled'])
                ->orderByDesc('created_at')
                ->limit(5);
        }]));
    }

    /**
     * Update agent details.
     */
    public function update(Request $request, Agent $agent): AgentResource
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', new Enum(AgentType::class)],
            'status' => ['sometimes', new Enum(AgentStatus::class)],
            'source' => 'sometimes|string|max:100',
            'external_id' => 'sometimes|nullable|string|max:255',
            'current_task' => 'sometimes|nullable|string|max:500',
            'avatar' => 'sometimes|nullable|string|max:255',
            'capacity' => 'sometimes|integer|min:1|max:100',
            'priority' => 'sometimes|integer|min:0|max:100',
            'capabilities' => 'sometimes|array',
            'capabilities.*' => 'string|max:100',
        ]);

        // Track if status or current_task changed
        $statusChanged = isset($validated['status']) && $validated['status'] !== $agent->status;
        $currentTaskChanged = isset($validated['current_task']) && $validated['current_task'] !== $agent->current_task;

        $agent->update($validated);

        // Broadcast AgentStatusChanged if relevant fields changed
        if ($statusChanged || $currentTaskChanged) {
            broadcast(new AgentStatusChanged($agent->fresh()));
        }

        return new AgentResource($agent->fresh());
    }

    /**
     * Soft delete an agent.
     */
    public function destroy(Agent $agent): JsonResponse
    {
        // Set agent to offline before deleting
        $agent->update(['status' => AgentStatus::OFFLINE]);
        $agent->delete();

        return response()->json([
            'message' => 'Agent deleted successfully',
        ]);
    }

    /**
     * Process agent heartbeat to update last_seen_at and status.
     */
    public function heartbeat(Request $request, Agent $agent): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', new Enum(AgentStatus::class)],
            'current_task' => 'sometimes|nullable|string|max:500',
            'metrics' => 'sometimes|array',
        ]);

        $oldStatus = $agent->status;
        $oldTask = $agent->current_task;

        $updateData = [
            'last_seen_at' => now(),
        ];

        $autoStatusChange = false;
        if (isset($validated['status'])) {
            $updateData['status'] = $validated['status'];
        } elseif ($agent->status === AgentStatus::OFFLINE) {
            // Auto-set to idle if coming back online
            $updateData['status'] = AgentStatus::IDLE;
            $autoStatusChange = true;
        }

        if (isset($validated['current_task'])) {
            $updateData['current_task'] = $validated['current_task'];
        }

        $agent->update($updateData);
        $agent->refresh();

        // Broadcast if status or current_task changed
        $statusChanged = $oldStatus !== $agent->status;
        $currentTaskChanged = $oldTask !== $agent->current_task;

        if ($statusChanged || $currentTaskChanged || $autoStatusChange) {
            broadcast(new AgentStatusChanged($agent));
        }

        return response()->json([
            'message' => 'Heartbeat received',
            'agent' => new AgentResource($agent),
        ]);
    }

    /**
     * Process batch events from agent.
     */
    public function reportEvents(Request $request, Agent $agent): JsonResponse
    {
        $validated = $request->validate([
            'events' => 'required|array|min:1|max:100',
            'events.*.type' => 'required|string|in:task_started,task_progress,task_completed,task_failed,message_sent,message_received,error,status_change',
            'events.*.timestamp' => 'required|date',
            'events.*.data' => 'sometimes|array',
        ]);

        $processedCount = 0;
        $errors = [];
        $broadcastEvents = []; // Track events to broadcast

        foreach ($validated['events'] as $index => $event) {
            try {
                $result = $this->processEvent($agent, $event);
                if ($result) {
                    $broadcastEvents[] = $result;
                }
                $processedCount++;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'type' => $event['type'],
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Update last_seen_at after processing events
        $agent->update(['last_seen_at' => now()]);

        // Broadcast collected events
        foreach ($broadcastEvents as $eventToBroadcast) {
            broadcast($eventToBroadcast);
        }

        return response()->json([
            'message' => 'Events processed',
            'processed' => $processedCount,
            'total' => count($validated['events']),
            'errors' => $errors,
        ]);
    }

    /**
     * Return agent statistics.
     */
    public function stats(): JsonResponse
    {
        $total = Agent::count();
        $online = Agent::where('status', '!=', AgentStatus::OFFLINE)->count();
        $busy = Agent::where('status', AgentStatus::BUSY)->count();
        $idle = Agent::where('status', AgentStatus::IDLE)->count();
        $communicating = Agent::where('status', AgentStatus::COMMUNICATING)->count();
        $error = Agent::where('status', AgentStatus::ERROR)->count();
        $offline = Agent::where('status', AgentStatus::OFFLINE)->count();

        // Get counts by type
        $byType = Agent::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Get counts by status
        $byStatus = Agent::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Get recent activity (agents seen in last 5 minutes)
        $recentlyActive = Agent::where('last_seen_at', '>=', now()->subMinutes(5))->count();

        return response()->json([
            'total' => $total,
            'online' => $online,
            'busy' => $busy,
            'idle' => $idle,
            'communicating' => $communicating,
            'error' => $error,
            'offline' => $offline,
            'recently_active' => $recentlyActive,
            'by_type' => $byType,
            'by_status' => $byStatus,
        ]);
    }

    /**
     * Process a single event from an agent.
     * Returns event object to broadcast, or null if no broadcasting needed.
     */
    protected function processEvent(Agent $agent, array $event): ?object
    {
        $type = $event['type'];
        $data = $event['data'] ?? [];
        $broadcastEvent = null;

        switch ($type) {
            case 'status_change':
                if (isset($data['status'])) {
                    $oldStatus = $agent->status;
                    $agent->update(['status' => $data['status']]);
                    if ($oldStatus !== $agent->status) {
                        $broadcastEvent = new AgentStatusChanged($agent->fresh());
                    }
                }
                break;

            case 'task_started':
                $agent->update([
                    'status' => AgentStatus::BUSY,
                    'current_task' => $data['task_description'] ?? 'Working on task',
                ]);
                $broadcastEvent = new AgentStatusChanged($agent->fresh());
                break;

            case 'task_progress':
                if (isset($data['task_id'])) {
                    $task = $agent->tasks()->find($data['task_id']);
                    if ($task && isset($data['progress'])) {
                        $task->update(['progress' => $data['progress']]);
                        $broadcastEvent = new TaskUpdated($task->fresh('assignedAgent'));
                    }
                }
                break;

            case 'task_completed':
                $agent->update([
                    'status' => AgentStatus::IDLE,
                    'current_task' => null,
                ]);
                $broadcastEvent = new AgentStatusChanged($agent->fresh());

                if (isset($data['task_id'])) {
                    $task = $agent->tasks()->find($data['task_id']);
                    if ($task) {
                        $task->update([
                            'status' => 'completed',
                            'progress' => 100,
                            'result' => $data['result'] ?? null,
                        ]);
                        // Broadcast both TaskUpdated and TaskCompleted
                        broadcast(new TaskUpdated($task->fresh('assignedAgent')));
                        broadcast(new TaskCompleted($task->fresh('assignedAgent')));
                        // Return null since we already broadcasted
                        $broadcastEvent = null;
                    }
                }
                break;

            case 'task_failed':
                $agent->update([
                    'status' => AgentStatus::IDLE,
                    'current_task' => null,
                ]);
                $broadcastEvent = new AgentStatusChanged($agent->fresh());

                if (isset($data['task_id'])) {
                    $task = $agent->tasks()->find($data['task_id']);
                    if ($task) {
                        $task->update([
                            'status' => 'failed',
                            'result' => ['error' => $data['error'] ?? 'Unknown error'],
                        ]);
                        // Broadcast both TaskUpdated and TaskCompleted (for failed status)
                        broadcast(new TaskUpdated($task->fresh('assignedAgent')));
                        broadcast(new TaskCompleted($task->fresh('assignedAgent')));
                        // Return null since we already broadcasted
                        $broadcastEvent = null;
                    }
                }
                break;

            case 'message_sent':
            case 'message_received':
                // Update agent status to communicating
                $oldStatus = $agent->status;
                $agent->update(['status' => AgentStatus::COMMUNICATING]);
                if ($oldStatus !== AgentStatus::COMMUNICATING) {
                    $broadcastEvent = new AgentStatusChanged($agent->fresh());
                }

                // If message data provided, create message and broadcast
                if (isset($data['session_id']) && isset($data['content'])) {
                    $message = Message::create([
                        'session_id' => $data['session_id'],
                        'from_agent_id' => $type === 'message_sent' ? $agent->id : ($data['from_agent_id'] ?? null),
                        'to_agent_id' => $type === 'message_received' ? $agent->id : ($data['to_agent_id'] ?? null),
                        'content' => $data['content'],
                        'message_type' => $data['message_type'] ?? 'text',
                        'channel' => $data['channel'] ?? null,
                        'timestamp' => now(),
                    ]);
                    broadcast(new MessageCreated($message->load(['fromAgent', 'toAgent'])));
                }
                break;

            case 'error':
                $agent->update([
                    'status' => AgentStatus::ERROR,
                    'current_task' => $data['error_message'] ?? 'Error occurred',
                ]);
                $broadcastEvent = new AgentStatusChanged($agent->fresh());
                break;
        }

        return $broadcastEvent;
    }
}
