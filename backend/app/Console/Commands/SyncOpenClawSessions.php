<?php

namespace App\Console\Commands;

use App\Services\OpenClawService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncOpenClawSessions extends Command
{
    protected $signature = 'openclaw:sync {--path=/root/.openclaw/agents/main/sessions}';

    protected $description = 'Sync semua session OpenClaw yang sudah ada ke database';

    public function handle(OpenClawService $openClawService): int
    {
        $path = (string) $this->option('path');

        if (! is_dir($path)) {
            $message = "Directory OpenClaw tidak ditemukan: {$path}";
            $this->components->error($message);
            Log::warning($message);

            return self::FAILURE;
        }

        $files = glob(rtrim($path, '/') . '/*.jsonl') ?: [];
        sort($files);

        if ($files === []) {
            $this->components->warn('Tidak ada file session OpenClaw yang ditemukan.');

            return self::SUCCESS;
        }

        $rows = [];
        $failures = 0;
        $totalMessages = 0;

        foreach ($files as $file) {
            try {
                $result = $openClawService->syncFile($file);
                $rows[] = [
                    $result['session_id'],
                    $result['processed_events'],
                    $result['created_messages'],
                    $result['skipped_messages'],
                ];
                $totalMessages += $result['created_messages'];
            } catch (Throwable $exception) {
                $failures++;
                Log::error('Sync OpenClaw session gagal.', [
                    'file' => $file,
                    'error' => $exception->getMessage(),
                ]);
                $this->components->error("Gagal sync file: {$file}");
            }
        }

        if ($rows !== []) {
            $this->table(['session', 'processed_events', 'created_messages', 'skipped_messages'], $rows);
        }

        $this->components->info('Sync OpenClaw selesai.');
        $this->components->info("Total file: " . count($files) . ", total message baru: {$totalMessages}, gagal: {$failures}");

        return $failures > 0 ? self::FAILURE : self::SUCCESS;
    }
}
