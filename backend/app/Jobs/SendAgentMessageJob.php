<?php

namespace App\Jobs;

use App\Models\Message;
use App\Events\MessageCreated;
use App\Enums\MessageType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAgentMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'messages';

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public int $sessionId,
        public ?int $fromAgentId,
        public ?int $toAgentId,
        public string $content,
        public string $channel = 'general',
        public MessageType $messageType = MessageType::AGENT
    ) {
        $this->onQueue('messages');
    }

    public function handle(): void
    {
        $message = Message::create([
            'session_id' => $this->sessionId,
            'from_agent_id' => $this->fromAgentId,
            'to_agent_id' => $this->toAgentId,
            'content' => $this->content,
            'message_type' => $this->messageType,
            'channel' => $this->channel,
            'timestamp' => now(),
        ]);

        event(new MessageCreated($message->fresh(['fromAgent', 'toAgent'])));
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("SendAgentMessageJob failed permanently: " . $exception->getMessage(), [
            'session_id' => $this->sessionId,
            'from_agent_id' => $this->fromAgentId,
            'to_agent_id' => $this->toAgentId,
        ]);
    }
}
