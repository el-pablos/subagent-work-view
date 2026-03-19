<?php

namespace App\Services\Agent;

use App\Models\Agent;
use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Events\AgentStatusChanged;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class AgentRegistryService
{
    public function register(array $data): Agent
    {
        $agent = Agent::create([
            'uuid' => Str::uuid(),
            'name' => $data['name'],
            'type' => $data['type'],
            'status' => AgentStatus::IDLE,
            'avatar' => $data['avatar'] ?? null,
            'capacity' => $data['capacity'] ?? 1,
            'priority' => $data['priority'] ?? 100,
            'capabilities' => $data['capabilities'] ?? [],
            'last_seen_at' => now(),
        ]);

        return $agent;
    }

    public function updateStatus(Agent $agent, AgentStatus $status): void
    {
        $agent->update([
            'status' => $status,
            'last_seen_at' => now(),
        ]);

        event(new AgentStatusChanged($agent));
    }

    public function getAvailableAgents(?string $type = null): Collection
    {
        return Agent::query()
            ->where('status', AgentStatus::IDLE)
            ->when($type, fn($q) => $q->where('type', $type))
            ->orderBy('priority')
            ->get();
    }

    public function getAllAgents(): Collection
    {
        return Agent::orderBy('priority')->get();
    }
}
