<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgentResource;
use App\Http\Resources\SessionResource;
use App\Models\Agent;
use App\Models\Session;
use App\Models\Task;
use App\Enums\AgentStatus;
use App\Enums\SessionStatus;
use App\Enums\TaskStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $activeSessions = Session::whereIn('status', [
            SessionStatus::QUEUED,
            SessionStatus::PLANNING,
            SessionStatus::RUNNING,
        ])->count();

        $agentStats = Agent::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $taskStats = Task::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $recentCompletedTasks = Task::where('status', TaskStatus::COMPLETED)
            ->where('finished_at', '>=', now()->subHours(24))
            ->count();

        $avgTaskDuration = Task::where('status', TaskStatus::COMPLETED)
            ->whereNotNull('started_at')
            ->whereNotNull('finished_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, started_at, finished_at)) as avg_duration')
            ->value('avg_duration');

        return response()->json([
            'active_sessions' => $activeSessions,
            'total_sessions' => Session::count(),
            'agent_stats' => $agentStats,
            'task_stats' => $taskStats,
            'recent_completed_tasks' => $recentCompletedTasks,
            'avg_task_duration_seconds' => round($avgTaskDuration ?? 0, 2),
            'agents_online' => Agent::where('status', '!=', AgentStatus::OFFLINE)->count(),
            'agents_total' => Agent::count(),
        ]);
    }

    public function agents(): JsonResponse
    {
        $agents = Agent::with(['tasks' => function ($query) {
            $query->whereIn('status', [TaskStatus::ASSIGNED, TaskStatus::RUNNING])
                ->latest()
                ->limit(1);
        }])->get();

        return response()->json([
            'data' => AgentResource::collection($agents),
        ]);
    }

    public function activeSessions(): JsonResponse
    {
        $sessions = Session::with(['tasks', 'creator'])
            ->whereIn('status', [
                SessionStatus::QUEUED,
                SessionStatus::PLANNING,
                SessionStatus::RUNNING,
            ])
            ->orderByDesc('started_at')
            ->get();

        return response()->json([
            'data' => SessionResource::collection($sessions),
        ]);
    }

    public function metrics(): JsonResponse
    {
        $now = now();
        $hourAgo = $now->copy()->subHour();
        $dayAgo = $now->copy()->subDay();

        // Tasks completed in last hour
        $tasksCompletedLastHour = Task::where('status', TaskStatus::COMPLETED)
            ->where('finished_at', '>=', $hourAgo)
            ->count();

        // Tasks completed in last 24 hours
        $tasksCompletedLastDay = Task::where('status', TaskStatus::COMPLETED)
            ->where('finished_at', '>=', $dayAgo)
            ->count();

        // Failed tasks in last 24 hours
        $failedTasksLastDay = Task::where('status', TaskStatus::FAILED)
            ->where('finished_at', '>=', $dayAgo)
            ->count();

        // Success rate
        $totalFinished = $tasksCompletedLastDay + $failedTasksLastDay;
        $successRate = $totalFinished > 0
            ? round(($tasksCompletedLastDay / $totalFinished) * 100, 2)
            : 100;

        // Agent utilization
        $busyAgents = Agent::where('status', AgentStatus::BUSY)->count();
        $totalAgents = Agent::where('status', '!=', AgentStatus::OFFLINE)->count();
        $utilization = $totalAgents > 0
            ? round(($busyAgents / $totalAgents) * 100, 2)
            : 0;

        // Average tasks per session
        $avgTasksPerSession = Session::withCount('tasks')
            ->where('created_at', '>=', $dayAgo)
            ->avg('tasks_count') ?? 0;

        // Queue depth (pending tasks)
        $pendingTasks = Task::where('status', TaskStatus::PENDING)->count();

        return response()->json([
            'tasks_completed_last_hour' => $tasksCompletedLastHour,
            'tasks_completed_last_day' => $tasksCompletedLastDay,
            'failed_tasks_last_day' => $failedTasksLastDay,
            'success_rate' => $successRate,
            'agent_utilization' => $utilization,
            'avg_tasks_per_session' => round($avgTasksPerSession, 2),
            'pending_tasks' => $pendingTasks,
            'timestamp' => $now->toISOString(),
        ]);
    }
}
