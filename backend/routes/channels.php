<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channels (no auth needed for dashboard monitoring)
Broadcast::channel('dashboard', function () {
    return true; // Public channel
});

// Backward-compatible alias for existing broadcastOn() usage.
Broadcast::channel('dashboard.global', function () {
    return true; // Public channel
});

Broadcast::channel('session.{sessionId}', function ($user, $sessionId) {
    return true; // Public for now
});

Broadcast::channel('agent.{agentId}', function ($user, $agentId) {
    return true; // Public for now
});
