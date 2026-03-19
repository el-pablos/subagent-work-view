<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeliverWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The queue this job should be dispatched to.
     */
    public string $queue = 'webhooks';

    public int $tries = 5;
    public int $timeout = 30;
    public array $backoff = [10, 30, 60, 120, 300];

    public function __construct(
        public string $url,
        public array $payload,
        public array $headers = []
    ) {
        $this->onQueue('webhooks');
    }

    public function handle(): void
    {
        $response = Http::withHeaders(array_merge([
            'Content-Type' => 'application/json',
            'User-Agent' => 'SubagentWorkView/1.0',
        ], $this->headers))
            ->timeout($this->timeout)
            ->post($this->url, $this->payload);

        if ($response->failed()) {
            Log::warning("Webhook delivery failed to {$this->url}: " . $response->status());
            throw new \Exception("Webhook delivery failed with status " . $response->status());
        }

        Log::info("Webhook delivered to {$this->url}");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Webhook delivery permanently failed to {$this->url}: " . $exception->getMessage());
    }
}
