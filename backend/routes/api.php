<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Sessions
    Route::apiResource('sessions', SessionController::class);
    Route::get('sessions/active', [DashboardController::class, 'activeSessions']);
    Route::post('sessions/{session}/start', [SessionController::class, 'resume']);
    Route::post('sessions/{session}/cancel', [SessionController::class, 'cancel']);
    Route::post('sessions/{session}/pause', [SessionController::class, 'pause']);
    Route::post('sessions/{session}/resume', [SessionController::class, 'resume']);
    Route::get('sessions/{session}/timeline', [SessionController::class, 'timeline']);

    // Tasks
    Route::apiResource('tasks', TaskController::class)->only(['index', 'show', 'store', 'update']);
    Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);
    Route::post('tasks/{task}/cancel', [TaskController::class, 'cancel']);
    Route::post('tasks/{task}/retry', [TaskController::class, 'retry']);

    // Agents
    Route::apiResource('agents', AgentController::class);
    Route::patch('agents/{agent}/status', [AgentController::class, 'update']);
    Route::post('agents/{agent}/heartbeat', [AgentController::class, 'heartbeat']);
    Route::post('agents/{agent}/events', [AgentController::class, 'reportEvents']);
    Route::get('agents/overview/stats', [AgentController::class, 'stats']);

    // Commands
    Route::post('commands/execute', [SessionController::class, 'store']);

    // Messages
    Route::get('sessions/{session}/messages', [MessageController::class, 'index']);
    Route::post('sessions/{session}/messages', [MessageController::class, 'store']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('overview', [DashboardController::class, 'overview']);
        Route::get('stats', [DashboardController::class, 'overview']);
        Route::get('agents', [DashboardController::class, 'agents']);
        Route::get('active-sessions', [DashboardController::class, 'activeSessions']);
        Route::get('metrics', [DashboardController::class, 'metrics']);
    });

    // Webhooks for external agent sources
    Route::prefix('webhook')->group(function () {
        Route::post('{source}', [WebhookController::class, 'receive']);
    });

    // Health
    Route::get('health', [HealthController::class, 'check']);
    Route::get('health/agents', [HealthController::class, 'agentHealth']);
});
