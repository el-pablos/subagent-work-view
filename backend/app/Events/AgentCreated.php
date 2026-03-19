<?php

namespace App\Events;

use App\Models\Agent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Agent $agent) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('dashboard.global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'agent.created';
    }

    public function broadcastWith(): array
    {
        return [
            'agent' => $this->agent->toArray(),
        ];
    }
}
