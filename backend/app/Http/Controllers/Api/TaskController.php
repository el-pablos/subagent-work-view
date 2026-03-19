<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Jobs\ExecuteAgentTaskJob;
use App\Enums\TaskStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $tasks = Task::with('assignedAgent', 'session')
            ->when($request->session_id, fn($q, $id) => $q->where('session_id', $id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->agent_id, fn($q, $id) => $q->where('assigned_agent_id', $id))
            ->orderByDesc('created_at')
            ->paginate(50);

        return TaskResource::collection($tasks);
    }

    public function show(Task $task): TaskResource
    {
        return new TaskResource($task->load(['assignedAgent', 'session', 'logs.agent']));
    }

    public function update(Request $request, Task $task): TaskResource
    {
        $validated = $request->validate([
            'progress' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|string|in:pending,assigned,running,blocked,completed,failed,cancelled',
            'result' => 'sometimes|array',
        ]);

        $task->update($validated);

        return new TaskResource($task->fresh('assignedAgent'));
    }

    public function retry(Task $task): JsonResponse
    {
        if (!$task->canRetry()) {
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

        ExecuteAgentTaskJob::dispatch($task->id)->delay(now()->addSeconds(2));

        return response()->json([
            'message' => 'Task retry scheduled',
        ]);
    }
}
