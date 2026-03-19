<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rate limits configured in AppServiceProvider:
| - api: 60 requests/minute (default for all API routes)
| - webhook: 1000 requests/minute (use middleware('throttle:webhook') for webhook routes)
|
*/

Route::prefix('v1')->group(function () {
    // Sessions
    Route::apiResource('sessions', SessionController::class);
    Route::post('sessions/{session}/cancel', [SessionController::class, 'cancel']);
    Route::post('sessions/{session}/pause', [SessionController::class, 'pause']);
    Route::post('sessions/{session}/resume', [SessionController::class, 'resume']);
    Route::get('sessions/{session}/timeline', [SessionController::class, 'timeline']);

    // Tasks
    Route::apiResource('tasks', TaskController::class)->only(['index', 'show', 'update']);
    Route::post('tasks/{task}/retry', [TaskController::class, 'retry']);

    // Agents
    Route::apiResource('agents', AgentController::class);
    Route::post('agents/{agent}/heartbeat', [AgentController::class, 'heartbeat']);
    Route::post('agents/{agent}/events', [AgentController::class, 'reportEvents']);
    Route::get('agents/overview/stats', [AgentController::class, 'stats']);

    // Messages
    Route::get('sessions/{session}/messages', [MessageController::class, 'index']);
    Route::post('sessions/{session}/messages', [MessageController::class, 'store']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('overview', [DashboardController::class, 'overview']);
        Route::get('agents', [DashboardController::class, 'agents']);
        Route::get('active-sessions', [DashboardController::class, 'activeSessions']);
        Route::get('metrics', [DashboardController::class, 'metrics']);
    });

    // Health
    Route::get('health', [HealthController::class, 'check']);
    Route::get('health/agents', [HealthController::class, 'agentHealth']);

    // Webhook routes (use higher rate limit)
    // Route::middleware('throttle:webhook')->prefix('webhooks')->group(function () {
    //     // Add webhook routes here
    // });
});
