<?php

namespace App\Events;

use App\Models\Agent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Agent $agent) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('dashboard.global'),
            new Channel('agent.' . $this->agent->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'agent.status_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->agent->id,
            'uuid' => $this->agent->uuid,
            'name' => $this->agent->name,
            'type' => $this->agent->type,
            'status' => $this->agent->status,
            'current_task' => $this->agent->current_task,
            'avatar' => $this->agent->avatar,
            'last_seen_at' => $this->agent->last_seen_at?->toISOString(),
        ];
    }
}
