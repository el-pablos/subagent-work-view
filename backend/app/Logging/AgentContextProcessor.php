<?php

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class AgentContextProcessor implements ProcessorInterface
{
    /**
     * Add agent and session context to log records.
     */
    public function __invoke(LogRecord $record): LogRecord
    {
        $context = $record['context'];

        // Add agent context if available in the record
        if (isset($context['agent'])) {
            $agent = $context['agent'];
            unset($context['agent']); // Remove the full object

            $context['agent_id'] = $agent->id ?? null;
            $context['agent_uuid'] = $agent->uuid ?? null;
            $context['agent_name'] = $agent->name ?? null;
            $context['agent_status'] = $agent->status?->value ?? null;
        }

        // Add session context if available in the record
        if (isset($context['session'])) {
            $session = $context['session'];
            unset($context['session']); // Remove the full object

            $context['session_id'] = $session->id ?? null;
            $context['session_uuid'] = $session->uuid ?? null;
            $context['session_status'] = $session->status?->value ?? null;
        }

        // Add task context if available in the record
        if (isset($context['task'])) {
            $task = $context['task'];
            unset($context['task']); // Remove the full object

            $context['task_id'] = $task->id ?? null;
            $context['task_external_id'] = $task->external_id ?? null;
            $context['task_title'] = $task->title ?? null;
            $context['task_status'] = $task->status?->value ?? null;
        }

        $record['context'] = $context;

        return $record;
    }
}
