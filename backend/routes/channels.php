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

// Session channel - public for now
// Clients subscribe to receive real-time updates for a specific session
Broadcast::channel('session.{sessionId}', function () {
    return true;
});

// Dashboard global channel - public
// Used for global notifications and dashboard-wide updates
Broadcast::channel('dashboard.global', function () {
    return true;
});

// Agent channel - public for now
// Clients subscribe to receive real-time updates for a specific agent
Broadcast::channel('agent.{agentId}', function () {
    return true;
});
