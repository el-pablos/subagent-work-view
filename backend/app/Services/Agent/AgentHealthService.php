<?php

namespace App\Services\Agent;

use App\Models\Agent;
use App\Enums\AgentStatus;
use App\Events\AgentStatusChanged;
use Carbon\Carbon;

class AgentHealthService
{
    private const STALE_THRESHOLD_MINUTES = 5;

    public function recordHeartbeat(Agent $agent, array $data): void
    {
        $agent->update([
            'last_seen_at' => now(),
            'status' => $data['status'] ?? $agent->status,
        ]);

        if (isset($data['current_task_id'])) {
            $agent->tasks()
                ->where('id', $data['current_task_id'])
                ->update(['progress' => $data['progress'] ?? 0]);
        }
    }

    public function checkStaleAgents(): void
    {
        $staleThreshold = Carbon::now()->subMinutes(self::STALE_THRESHOLD_MINUTES);

        $staleAgents = Agent::query()
            ->where('status', '!=', AgentStatus::OFFLINE)
            ->where('last_seen_at', '<', $staleThreshold)
            ->get();

        foreach ($staleAgents as $agent) {
            $this->markOffline($agent);
        }
    }

    public function markOffline(Agent $agent): void
    {
        $agent->update([
            'status' => AgentStatus::OFFLINE,
            'current_task' => null,
        ]);

        event(new AgentStatusChanged($agent));
    }

    public function markOnline(Agent $agent): void
    {
        $agent->update([
            'status' => AgentStatus::IDLE,
            'last_seen_at' => now(),
        ]);

        event(new AgentStatusChanged($agent));
    }
}
