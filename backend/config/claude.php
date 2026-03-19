<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Claude Code Teams Path
    |--------------------------------------------------------------------------
    |
    | Path to the Claude Code teams directory for session discovery.
    | Defaults to ~/.claude/teams/
    |
    */
    'teams_path' => env('CLAUDE_TEAMS_PATH', getenv('HOME') . '/.claude/teams'),
];
