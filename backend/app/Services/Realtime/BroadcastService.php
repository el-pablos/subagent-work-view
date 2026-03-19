<?php

namespace App\Services\Realtime;

use App\Models\Task;
use App\Models\Agent;
use App\Models\Message;
use App\Events\TaskUpdated;
use App\Events\AgentStatusChanged;
use App\Events\MessageCreated;

class BroadcastService
{
    public function broadcastTaskUpdate(Task $task): void
    {
        event(new TaskUpdated($task));
    }

    public function broadcastAgentStatus(Agent $agent): void
    {
        event(new AgentStatusChanged($agent));
    }

    public function broadcastMessage(Message $message): void
    {
        event(new MessageCreated($message));
    }
}
