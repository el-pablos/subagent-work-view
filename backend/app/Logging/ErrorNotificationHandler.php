<?php

namespace App\Logging;

use Illuminate\Support\Facades\Log;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\LogRecord;

class ErrorNotificationHandler extends AbstractProcessingHandler
{
    public function __construct(Level|int $level = Level::Error, bool $bubble = true)
    {
        parent::__construct($level, $bubble);
    }

    protected function write(LogRecord $record): void
    {
        // Log to separate error file for easier monitoring
        $errorData = [
            'timestamp' => $record->datetime->format('Y-m-d H:i:s'),
            'level' => $record->level->getName(),
            'message' => $record->message,
            'context' => $record->context,
            'extra' => $record->extra,
        ];

        // Write to dedicated error log
        file_put_contents(
            storage_path('logs/errors-' . date('Y-m-d') . '.json'),
            json_encode($errorData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n",
            FILE_APPEND | LOCK_EX
        );

        // You can add email, Slack, or other notification channels here
        // For now, we'll just ensure critical errors are logged separately
    }
}
