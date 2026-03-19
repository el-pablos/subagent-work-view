<?php

namespace App\Jobs;

use App\Services\Orchestration\AgentOrchestrationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessIncomingCommandJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'commands';

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public string $source,
        public string $command,
        public ?int $userId = null
    ) {
        $this->onQueue('commands');
    }

    public function handle(AgentOrchestrationService $orchestration): void
    {
        try {
            $session = $orchestration->createSession(
                $this->source,
                $this->command,
                $this->userId
            );

            Log::info("Session {$session->uuid} created from {$this->source}");
        } catch (\Exception $e) {
            Log::error("Failed to process command: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessIncomingCommandJob failed permanently: " . $exception->getMessage(), [
            'source' => $this->source,
            'command' => $this->command,
        ]);
    }
}
