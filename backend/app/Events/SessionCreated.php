<?php

namespace App\Events;

use App\Models\Session;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Session $session) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('dashboard.global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.created';
    }

    public function broadcastWith(): array
    {
        return [
            'session' => $this->session->toArray(),
        ];
    }
}
