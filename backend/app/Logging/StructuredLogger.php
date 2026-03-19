<?php

namespace App\Logging;

use Monolog\Logger;

class StructuredLogger
{
    /**
     * Create a custom Monolog instance with structured logging.
     */
    public function __invoke(array $config): Logger
    {
        $logger = new Logger('structured');

        // Add handlers from config
        foreach ($config['handlers'] ?? [] as $handlerConfig) {
            $handler = $this->createHandler($handlerConfig);

            // Add formatter
            if (isset($handlerConfig['formatter'])) {
                $formatter = new $handlerConfig['formatter']();
                $handler->setFormatter($formatter);
            }

            // Add processors
            foreach ($handlerConfig['processors'] ?? [] as $processor) {
                $handler->pushProcessor(new $processor());
            }

            $logger->pushHandler($handler);
        }

        return $logger;
    }

    /**
     * Create a handler from config.
     */
    protected function createHandler(array $config)
    {
        $handlerClass = $config['class'];
        $arguments = $config['arguments'] ?? [];

        return new $handlerClass(...$arguments);
    }
}
