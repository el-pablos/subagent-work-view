<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JsonException;
use Throwable;

class WatchOpenClawLogs extends Command
{
    protected $signature = 'openclaw:watch {--path=/root/.openclaw/agents/main/sessions} {--interval=2}';

    protected $description = 'Watch OpenClaw session logs dan forward events ke webhook endpoint';

    private array $filePositions = [];

    private bool $shouldStop = false;

    public function handle(): int
    {
        $path = (string) $this->option('path');
        $interval = max(1, (int) $this->option('interval'));
        $webhookUrl = rtrim(config('app.url'), '/') . '/api/v1/webhook/openclaw';

        $this->trapSignals();

        $this->components->info("Watching OpenClaw logs di: {$path}");
        $this->components->info("Forwarding ke: {$webhookUrl}");
        $this->components->info("Interval polling: {$interval} detik");

        while (! $this->shouldStop) {
            $this->scanForNewEvents($path, $webhookUrl);

            if ($this->shouldStop) {
                break;
            }

            sleep($interval);
        }

        $this->components->info('OpenClaw watcher berhenti dengan aman.');

        return self::SUCCESS;
    }

    private function scanForNewEvents(string $path, string $webhookUrl): void
    {
        if (! is_dir($path)) {
            $message = "Directory OpenClaw tidak ditemukan: {$path}";
            $this->components->warn($message);
            Log::warning($message);

            return;
        }

        $files = glob(rtrim($path, '/') . '/*.jsonl') ?: [];

        foreach ($files as $file) {
            if (! is_file($file) || ! is_readable($file)) {
                Log::warning('OpenClaw watcher melewati file yang tidak bisa dibaca.', ['file' => $file]);
                continue;
            }

            clearstatcache(true, $file);
            $currentSize = filesize($file);
            $lastPosition = $this->filePositions[$file] ?? 0;

            if ($currentSize === false) {
                Log::warning('OpenClaw watcher gagal membaca ukuran file.', ['file' => $file]);
                continue;
            }

            if ($currentSize < $lastPosition) {
                $lastPosition = 0;
            }

            if ($currentSize === $lastPosition) {
                continue;
            }

            $handle = @fopen($file, 'rb');
            if ($handle === false) {
                Log::warning('OpenClaw watcher gagal membuka file.', ['file' => $file]);
                continue;
            }

            try {
                fseek($handle, $lastPosition);
                $sessionId = basename($file, '.jsonl');

                while (($line = fgets($handle)) !== false) {
                    $rawLine = trim($line);

                    if ($rawLine === '') {
                        continue;
                    }

                    try {
                        $event = json_decode($rawLine, true, 512, JSON_THROW_ON_ERROR);
                    } catch (JsonException $exception) {
                        Log::warning('OpenClaw watcher menemukan JSON invalid.', [
                            'file' => $file,
                            'offset' => ftell($handle),
                            'error' => $exception->getMessage(),
                        ]);
                        continue;
                    }

                    $this->forwardEvent($webhookUrl, $sessionId, $event);
                }

                $this->filePositions[$file] = ftell($handle);
            } finally {
                fclose($handle);
            }
        }
    }

    private function forwardEvent(string $webhookUrl, string $sessionId, array $event): void
    {
        $payload = [
            'session_id' => $sessionId,
            'event_type' => $event['type'] ?? 'unknown',
            'data' => $event,
            'timestamp' => $event['timestamp'] ?? now()->toIso8601String(),
        ];

        try {
            $response = Http::timeout(5)
                ->retry(2, 200, function (Throwable $exception) {
                    return $exception instanceof ConnectionException;
                })
                ->post($webhookUrl, $payload);

            if ($response->failed()) {
                Log::warning('OpenClaw webhook forward gagal dengan HTTP error.', [
                    'session_id' => $sessionId,
                    'event_type' => $payload['event_type'],
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return;
            }

            $this->line("  → [{$payload['event_type']}] {$sessionId}");
        } catch (Throwable $exception) {
            Log::warning('OpenClaw webhook forward gagal.', [
                'session_id' => $sessionId,
                'event_type' => $payload['event_type'],
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function trapSignals(): void
    {
        if (! function_exists('pcntl_async_signals') || ! function_exists('pcntl_signal')) {
            return;
        }

        pcntl_async_signals(true);

        pcntl_signal(SIGINT, function (): void {
            $this->shouldStop = true;
        });

        pcntl_signal(SIGTERM, function (): void {
            $this->shouldStop = true;
        });
    }
}
