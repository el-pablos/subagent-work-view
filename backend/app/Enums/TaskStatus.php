<?php

namespace App\Enums;

enum TaskStatus: string
{
    case PENDING = 'pending';
    case ASSIGNED = 'assigned';
    case RUNNING = 'running';
    case BLOCKED = 'blocked';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::ASSIGNED => 'Assigned',
            self::RUNNING => 'Running',
            self::BLOCKED => 'Blocked',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::COMPLETED, self::FAILED, self::CANCELLED]);
    }
}
