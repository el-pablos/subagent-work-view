<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Events\TaskCompleted;
use App\Events\TaskCreated;
use App\Events\TaskUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Jobs\ExecuteAgentTaskJob;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tasks = Task::query()
            ->with(['assignedAgent', 'session'])
            ->when($request->session_id, fn ($q, $id) => $q->where('session_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->agent_id, fn ($q, $id) => $q->where('assigned_agent_id', $id))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return TaskResource::collection($tasks);
    }

    public function show(Task $task): TaskResource
    {
        return new TaskResource($task->load(['assignedAgent', 'session', 'logs.agent']));
    }

    public function store(Request $request): TaskResource
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:100',
            'priority' => 'nullable|integer|min:0|max:10',
            'assigned_agent_id' => 'nullable|exists:agents,id',
        ]);

        $task = Task::create([
            'session_id' => $validated['session_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'] ?? null,
            'priority' => $validated['priority'] ?? 0,
            'assigned_agent_id' => $validated['assigned_agent_id'] ?? null,
            'status' => TaskStatus::PENDING,
            'progress' => 0,
        ]);

        $task->load('assignedAgent');

        broadcast(new TaskCreated($task));

        return new TaskResource($task);
    }

    public function update(Request $request, Task $task): TaskResource
    {
        $validated = $request->validate([
            'progress' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|string|in:pending,assigned,running,blocked,completed,failed,cancelled',
            'result' => 'sometimes|array',
        ]);

        $oldStatus = $task->status;

        $task->update($validated);
        $task->refresh();
        $task->load('assignedAgent');

        // Broadcast TaskUpdated
        broadcast(new TaskUpdated($task));

        // Broadcast TaskCompleted if status changed to completed or failed
        if ($oldStatus !== $task->status && in_array($task->status, ['completed', 'failed'])) {
            broadcast(new TaskCompleted($task));
        }

        return new TaskResource($task);
    }

    public function assign(Request $request, Task $task): TaskResource
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:agents,id',
        ]);

        $task->update([
            'assigned_agent_id' => $validated['agent_id'],
            'status' => TaskStatus::ASSIGNED,
        ]);

        $task->refresh();
        $task->load('assignedAgent');

        broadcast(new TaskUpdated($task));

        return new TaskResource($task);
    }

    public function cancel(Task $task): TaskResource
    {
        $task->update([
            'status' => TaskStatus::FAILED,
            'finished_at' => now(),
        ]);

        $task->refresh();

        broadcast(new TaskUpdated($task));

        return new TaskResource($task);
    }

    public function retry(Task $task): JsonResponse
    {
        if (! $task->canRetry()) {
            return response()->json([
                'message' => 'Task cannot be retried (max attempts reached)',
            ], 422);
        }

        $task->update([
            'status' => TaskStatus::PENDING,
            'progress' => 0,
            'result' => null,
            'assigned_agent_id' => null,
        ]);

        $task->refresh();
        $task->load('assignedAgent');

        // Broadcast TaskUpdated after retry
        broadcast(new TaskUpdated($task));

        ExecuteAgentTaskJob::dispatch($task->id)->delay(now()->addSeconds(2));

        return response()->json([
            'message' => 'Task retry scheduled',
        ]);
    }
}
