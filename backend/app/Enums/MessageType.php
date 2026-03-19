<?php

namespace App\Enums;

enum MessageType: string
{
    case AGENT = 'agent';
    case SYSTEM = 'system';
    case USER = 'user';
    case BROADCAST = 'broadcast';

    public function label(): string
    {
        return match($this) {
            self::AGENT => 'Agent',
            self::SYSTEM => 'System',
            self::USER => 'User',
            self::BROADCAST => 'Broadcast',
        };
    }
}
