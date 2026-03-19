<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\TaskLog;
use App\Models\Agent;
use App\Events\TaskUpdated;
use App\Events\TaskCompleted;
use App\Events\AgentStatusChanged;
use App\Enums\TaskStatus;
use App\Enums\AgentStatus;
use App\Services\Orchestration\TaskDistributionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteAgentTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'agent-execution';

    public int $tries = 3;
    public int $timeout = 300;

    public function __construct(public int $taskId)
    {
        $this->onQueue('agent-execution');
    }

    public function handle(TaskDistributionService $distributor): void
    {
        $task = Task::with('assignedAgent', 'session')->find($this->taskId);

        if (!$task || !$task->assignedAgent) {
            return;
        }

        $agent = $task->assignedAgent;

        try {
            // Log task start
            TaskLog::create([
                'task_id' => $task->id,
                'agent_id' => $agent->id,
                'action' => 'started',
                'notes' => "Task execution started by {$agent->name}",
            ]);

            $task->update([
                'status' => TaskStatus::RUNNING,
                'started_at' => now(),
            ]);

            event(new TaskUpdated($task->fresh()));

            // Simulate task execution with progress updates
            for ($progress = 25; $progress <= 100; $progress += 25) {
                sleep(1); // Simulate work

                $task->update(['progress' => $progress]);
                event(new TaskUpdated($task->fresh()));
            }

            // Complete the task
            $task->update([
                'status' => TaskStatus::COMPLETED,
                'progress' => 100,
                'result' => ['success' => true, 'message' => 'Task completed successfully'],
                'finished_at' => now(),
            ]);

            TaskLog::create([
                'task_id' => $task->id,
                'agent_id' => $agent->id,
                'action' => 'completed',
                'notes' => 'Task execution completed successfully',
            ]);

            event(new TaskCompleted($task->fresh()));

            // Release agent
            $agent->update([
                'status' => AgentStatus::IDLE,
                'current_task' => null,
            ]);
            event(new AgentStatusChanged($agent->fresh()));

            // Try to distribute more tasks
            $distributor->distributePendingTasks($task->session_id);

        } catch (\Exception $e) {
            Log::error("Task {$task->id} failed: " . $e->getMessage());

            $task->update([
                'status' => TaskStatus::FAILED,
                'result' => ['error' => $e->getMessage()],
                'attempt' => $task->attempt + 1,
            ]);

            TaskLog::create([
                'task_id' => $task->id,
                'agent_id' => $agent->id,
                'action' => 'failed',
                'notes' => $e->getMessage(),
            ]);

            $agent->update([
                'status' => AgentStatus::IDLE,
                'current_task' => null,
            ]);

            event(new TaskUpdated($task->fresh()));
            event(new AgentStatusChanged($agent->fresh()));

            if ($task->canRetry()) {
                self::dispatch($task->id)->delay(now()->addSeconds(5));
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ExecuteAgentTaskJob failed permanently for task {$this->taskId}: " . $exception->getMessage());

        $task = Task::with('assignedAgent')->find($this->taskId);

        if ($task) {
            $task->update([
                'status' => TaskStatus::FAILED,
                'result' => ['error' => 'Job failed after max retries: ' . $exception->getMessage()],
            ]);

            if ($task->assignedAgent) {
                $task->assignedAgent->update([
                    'status' => AgentStatus::IDLE,
                    'current_task' => null,
                ]);
                event(new AgentStatusChanged($task->assignedAgent->fresh()));
            }

            event(new TaskUpdated($task->fresh()));
        }
    }
}
