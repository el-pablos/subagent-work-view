<?php

namespace App\Enums;

enum AgentType: string
{
    case PLANNER = 'planner';
    case ARCHITECT = 'architect';
    case CODER = 'coder';
    case REVIEWER = 'reviewer';
    case TESTER = 'tester';
    case DOCS = 'docs';
    case DEVOPS = 'devops';

    public function label(): string
    {
        return match($this) {
            self::PLANNER => 'Planner',
            self::ARCHITECT => 'Architect',
            self::CODER => 'Coder',
            self::REVIEWER => 'Reviewer',
            self::TESTER => 'Tester',
            self::DOCS => 'Documentation',
            self::DEVOPS => 'DevOps',
        };
    }
}
