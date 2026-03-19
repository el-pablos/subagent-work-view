<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskProgressUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Task $task) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('tasks.' . $this->task->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.progress_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->task->id,
            'uuid' => $this->task->uuid,
            'title' => $this->task->title,
            'status' => $this->task->status,
            'progress' => $this->task->progress,
            'assigned_agent' => $this->task->assignedAgent?->only(['id', 'uuid', 'name', 'avatar']),
            'attempt' => $this->task->attempt,
            'max_attempt' => $this->task->max_attempt,
            'started_at' => $this->task->started_at?->toISOString(),
            'updated_at' => $this->task->updated_at?->toISOString(),
        ];
    }
}
