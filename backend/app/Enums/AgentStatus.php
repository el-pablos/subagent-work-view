<?php

namespace App\Enums;

enum AgentStatus: string
{
    case IDLE = 'idle';
    case BUSY = 'busy';
    case COMMUNICATING = 'communicating';
    case ERROR = 'error';
    case OFFLINE = 'offline';

    public function label(): string
    {
        return match($this) {
            self::IDLE => 'Idle',
            self::BUSY => 'Busy',
            self::COMMUNICATING => 'Communicating',
            self::ERROR => 'Error',
            self::OFFLINE => 'Offline',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::IDLE => 'slate',
            self::BUSY => 'emerald',
            self::COMMUNICATING => 'sky',
            self::ERROR => 'rose',
            self::OFFLINE => 'gray',
        };
    }
}
