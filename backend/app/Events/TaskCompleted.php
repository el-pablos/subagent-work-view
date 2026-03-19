<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCompleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Task $task) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('session.' . $this->task->session_id),
            new Channel('dashboard.global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.completed';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->task->id,
            'uuid' => $this->task->uuid,
            'session_id' => $this->task->session_id,
            'title' => $this->task->title,
            'status' => 'completed',
            'result' => $this->task->result,
            'finished_at' => $this->task->finished_at?->toISOString(),
        ];
    }
}
