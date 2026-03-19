<?php

namespace App\Logging;

use Monolog\Logger;

class CustomLoggerFactory
{
    /**
     * Create a custom Monolog instance with error notification handler.
     */
    public function __invoke(array $config): Logger
    {
        $logger = new Logger('error-notifications');

        $handler = new ErrorNotificationHandler(
            level: \Monolog\Level::Error,
            bubble: true
        );

        $logger->pushHandler($handler);

        return $logger;
    }
}
