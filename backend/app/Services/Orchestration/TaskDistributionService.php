<?php

namespace App\Services\Orchestration;

use App\Models\Agent;
use App\Models\Task;
use App\Jobs\ExecuteAgentTaskJob;
use App\Events\TaskUpdated;
use App\Events\AgentStatusChanged;
use App\Enums\AgentStatus;
use Illuminate\Support\Facades\DB;

class TaskDistributionService
{
    public function distributePendingTasks(int $sessionId): void
    {
        $pendingTasks = Task::where('session_id', $sessionId)
            ->where('status', 'pending')
            ->whereNull('assigned_agent_id')
            ->orderBy('id')
            ->get();

        foreach ($pendingTasks as $task) {
            if (!$this->areDependenciesMet($task)) {
                continue;
            }

            $this->assignTaskToAgent($task);
        }
    }

    public function areDependenciesMet(Task $task): bool
    {
        if (empty($task->dependencies)) {
            return true;
        }

        $incompleteDeps = Task::whereIn('id', $task->dependencies)
            ->where('status', '!=', 'completed')
            ->count();

        return $incompleteDeps === 0;
    }

    public function assignTaskToAgent(Task $task): void
    {
        DB::transaction(function () use ($task) {
            $agent = $this->selectBestAgent($task);

            if (!$agent) {
                return;
            }

            $task->update([
                'assigned_agent_id' => $agent->id,
                'status' => 'assigned',
            ]);

            $agent->update([
                'status' => AgentStatus::BUSY,
                'current_task' => $task->title,
            ]);

            event(new TaskUpdated($task));
            event(new AgentStatusChanged($agent));

            ExecuteAgentTaskJob::dispatch($task->id)
                ->onQueue('agent-execution');
        });
    }

    public function selectBestAgent(Task $task): ?Agent
    {
        return Agent::query()
            ->where('status', AgentStatus::IDLE)
            ->when($task->payload['required_type'] ?? null, function ($q, $type) {
                $q->where('type', $type);
            })
            ->orderBy('priority')
            ->orderBy('id')
            ->lockForUpdate()
            ->first();
    }

    public function releaseAgentsFromSession(int $sessionId): void
    {
        $agentIds = Task::where('session_id', $sessionId)
            ->whereNotNull('assigned_agent_id')
            ->pluck('assigned_agent_id')
            ->unique();

        Agent::whereIn('id', $agentIds)->update([
            'status' => AgentStatus::IDLE,
            'current_task' => null,
        ]);
    }
}
