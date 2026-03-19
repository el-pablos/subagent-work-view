<?php

namespace App\Logging;

use Monolog\Formatter\LineFormatter;
use Monolog\LogRecord;

class ContextFormatter extends LineFormatter
{
    /**
     * The format of the output log message.
     */
    protected const FORMAT = "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n";

    /**
     * The format of the timestamp in the log message.
     */
    protected const DATE_FORMAT = 'Y-m-d H:i:s.u';

    public function __construct()
    {
        parent::__construct(self::FORMAT, self::DATE_FORMAT, true, true);
    }

    /**
     * Format the log record with additional context.
     */
    public function format(LogRecord $record): string
    {
        // Add global context to the record
        $record['context'] = array_merge(
            $this->getGlobalContext(),
            $record['context']
        );

        return parent::format($record);
    }

    /**
     * Get global context that should be included in all log entries.
     */
    protected function getGlobalContext(): array
    {
        $context = [];

        // Add request ID if available
        if (request()->hasHeader('X-Request-ID')) {
            $context['request_id'] = request()->header('X-Request-ID');
        }

        // Add user ID if authenticated
        if (auth()->check()) {
            $context['user_id'] = auth()->id();
        }

        // Add session ID if available
        if (request()->hasSession()) {
            $context['session_id'] = session()->getId();
        }

        // Add IP address
        $context['ip'] = request()->ip();

        // Add URL and method for HTTP requests
        if (request()->has('REQUEST_URI')) {
            $context['url'] = request()->fullUrl();
            $context['method'] = request()->method();
        }

        return $context;
    }
}
