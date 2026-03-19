<?php

namespace App\Events;

use App\Models\Agent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentTerminated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Agent $agent) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('agents'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'agent.terminated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->agent->id,
            'uuid' => $this->agent->uuid,
            'name' => $this->agent->name,
            'type' => $this->agent->type,
            'status' => $this->agent->status,
            'terminated_at' => now()->toISOString(),
        ];
    }
}
