<?php

namespace App\Jobs;

use App\Models\Message;
use App\Events\MessageCreated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class BatchStoreMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public const REDIS_KEY = 'messages:pending';
    public const BATCH_SIZE = 100;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'messages';

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct()
    {
        $this->onQueue('messages');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $messages = $this->fetchPendingMessages();

        if (empty($messages)) {
            return;
        }

        $insertedMessages = $this->bulkInsertMessages($messages);

        $this->broadcastMessages($insertedMessages);

        Log::info('BatchStoreMessages completed', [
            'count' => count($insertedMessages),
        ]);
    }

    /**
     * Fetch pending messages from Redis.
     */
    protected function fetchPendingMessages(): array
    {
        $messages = [];
        $count = 0;

        while ($count < self::BATCH_SIZE) {
            $data = Redis::lpop(self::REDIS_KEY);

            if ($data === null) {
                break;
            }

            $message = json_decode($data, true);

            if ($message !== null) {
                $messages[] = $message;
                $count++;
            }
        }

        return $messages;
    }

    /**
     * Bulk insert messages into the database.
     */
    protected function bulkInsertMessages(array $messages): array
    {
        $now = now();
        $insertData = [];

        foreach ($messages as $message) {
            $insertData[] = [
                'session_id' => $message['session_id'],
                'from_agent_id' => $message['from_agent_id'] ?? null,
                'to_agent_id' => $message['to_agent_id'] ?? null,
                'content' => $message['content'],
                'message_type' => $message['message_type'],
                'channel' => $message['channel'] ?? 'general',
                'timestamp' => $message['timestamp'] ?? $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $insertedMessages = [];

        DB::transaction(function () use ($insertData, &$insertedMessages) {
            // Insert and retrieve the IDs
            foreach (array_chunk($insertData, 50) as $chunk) {
                Message::insert($chunk);
            }

            // Fetch the inserted messages with relationships
            // We use the timestamps to identify recently inserted messages
            $insertedMessages = Message::with(['fromAgent', 'toAgent'])
                ->where('created_at', '>=', now()->subSeconds(5))
                ->orderBy('id', 'desc')
                ->limit(count($insertData))
                ->get()
                ->toArray();
        });

        return $insertedMessages;
    }

    /**
     * Broadcast MessageCreated events for inserted messages.
     */
    protected function broadcastMessages(array $messages): void
    {
        foreach ($messages as $messageData) {
            $message = Message::with(['fromAgent', 'toAgent'])->find($messageData['id']);

            if ($message) {
                broadcast(new MessageCreated($message));
            }
        }
    }

    /**
     * Queue a message for batch processing.
     */
    public static function queueMessage(array $data): void
    {
        $data['timestamp'] = $data['timestamp'] ?? now()->toDateTimeString();

        Redis::rpush(self::REDIS_KEY, json_encode($data));

        // Check if we should trigger batch processing
        $pendingCount = Redis::llen(self::REDIS_KEY);

        if ($pendingCount >= self::BATCH_SIZE) {
            self::dispatch();
        }
    }

    /**
     * Get the count of pending messages in Redis.
     */
    public static function pendingCount(): int
    {
        return (int) Redis::llen(self::REDIS_KEY);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('BatchStoreMessages failed: ' . $exception->getMessage(), [
            'exception' => $exception,
        ]);
    }
}
