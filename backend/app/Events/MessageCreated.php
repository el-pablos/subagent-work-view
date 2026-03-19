<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('session.' . $this->message->session_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'session_id' => $this->message->session_id,
            'content' => $this->message->content,
            'message_type' => $this->message->message_type,
            'channel' => $this->message->channel,
            'from_agent' => $this->message->fromAgent?->only(['id', 'uuid', 'name', 'avatar']),
            'to_agent' => $this->message->toAgent?->only(['id', 'uuid', 'name', 'avatar']),
            'timestamp' => $this->message->timestamp->toISOString(),
        ];
    }
}
