<?php

namespace App\Services\Orchestration;

use App\Models\Session;
use App\Models\Task;
use App\Events\SessionCreated;
use App\Enums\SessionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgentOrchestrationService
{
    public function __construct(
        private readonly TaskPlannerService $planner,
        private readonly TaskDistributionService $distributor
    ) {}

    public function createSession(string $source, string $command, ?int $userId = null): Session
    {
        return DB::transaction(function () use ($source, $command, $userId) {
            $session = Session::create([
                'uuid' => Str::uuid(),
                'command_source' => $source,
                'original_command' => $command,
                'status' => SessionStatus::PLANNING,
                'created_by' => $userId,
                'started_at' => now(),
            ]);

            $taskPlan = $this->planner->planTasks($command);

            foreach ($taskPlan as $item) {
                Task::create([
                    'uuid' => Str::uuid(),
                    'session_id' => $session->id,
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'status' => 'pending',
                    'payload' => $item['payload'] ?? null,
                    'dependencies' => $item['dependencies'] ?? null,
                    'queued_at' => now(),
                ]);
            }

            $session->update(['status' => SessionStatus::RUNNING]);

            event(new SessionCreated($session));

            $this->distributor->distributePendingTasks($session->id);

            return $session->fresh(['tasks', 'tasks.assignedAgent']);
        });
    }

    public function cancelSession(Session $session): void
    {
        DB::transaction(function () use ($session) {
            $session->tasks()
                ->whereIn('status', ['pending', 'assigned', 'running'])
                ->update(['status' => 'cancelled']);

            $session->update([
                'status' => SessionStatus::CANCELLED,
                'ended_at' => now(),
            ]);

            $this->distributor->releaseAgentsFromSession($session->id);
        });
    }

    public function pauseSession(Session $session): void
    {
        $session->tasks()
            ->where('status', 'pending')
            ->update(['status' => 'blocked']);
    }

    public function resumeSession(Session $session): void
    {
        $session->tasks()
            ->where('status', 'blocked')
            ->update(['status' => 'pending']);

        $this->distributor->distributePendingTasks($session->id);
    }
}
