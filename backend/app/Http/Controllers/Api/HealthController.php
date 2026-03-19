<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Enums\AgentStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'services' => [],
        ];

        // Database check
        try {
            DB::connection()->getPdo();
            $health['services']['database'] = [
                'status' => 'healthy',
                'latency_ms' => $this->measureLatency(fn() => DB::select('SELECT 1')),
            ];
        } catch (\Exception $e) {
            $health['services']['database'] = [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
            $health['status'] = 'unhealthy';
        }

        // Redis check
        try {
            $latency = $this->measureLatency(fn() => Redis::ping());
            $health['services']['redis'] = [
                'status' => 'healthy',
                'latency_ms' => $latency,
            ];
        } catch (\Exception $e) {
            $health['services']['redis'] = [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
            $health['status'] = 'degraded';
        }

        // Queue check
        try {
            $queueSize = Queue::size();
            $health['services']['queue'] = [
                'status' => 'healthy',
                'pending_jobs' => $queueSize,
            ];
        } catch (\Exception $e) {
            $health['services']['queue'] = [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
            $health['status'] = 'degraded';
        }

        // Cache check
        try {
            $cacheKey = 'health_check_' . uniqid();
            Cache::put($cacheKey, true, 10);
            $cacheWorks = Cache::get($cacheKey) === true;
            Cache::forget($cacheKey);

            $health['services']['cache'] = [
                'status' => $cacheWorks ? 'healthy' : 'unhealthy',
            ];
        } catch (\Exception $e) {
            $health['services']['cache'] = [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
            $health['status'] = 'degraded';
        }

        $statusCode = match ($health['status']) {
            'healthy' => 200,
            'degraded' => 200,
            'unhealthy' => 503,
        };

        return response()->json($health, $statusCode);
    }

    public function agentHealth(): JsonResponse
    {
        $agents = Agent::select('id', 'uuid', 'name', 'status', 'last_seen_at')
            ->get()
            ->map(function ($agent) {
                $isHealthy = $agent->status !== AgentStatus::OFFLINE
                    && $agent->status !== AgentStatus::ERROR;

                $isStale = $agent->last_seen_at
                    && $agent->last_seen_at->lt(now()->subMinutes(5));

                return [
                    'id' => $agent->id,
                    'uuid' => $agent->uuid,
                    'name' => $agent->name,
                    'status' => $agent->status->value,
                    'is_healthy' => $isHealthy && !$isStale,
                    'is_stale' => $isStale,
                    'last_seen_at' => $agent->last_seen_at?->toISOString(),
                ];
            });

        $healthyCount = $agents->where('is_healthy', true)->count();
        $totalCount = $agents->count();

        return response()->json([
            'overall_status' => $healthyCount === $totalCount ? 'healthy' : 'degraded',
            'healthy_agents' => $healthyCount,
            'total_agents' => $totalCount,
            'agents' => $agents,
            'timestamp' => now()->toISOString(),
        ]);
    }

    private function measureLatency(callable $operation): float
    {
        $start = microtime(true);
        $operation();
        $end = microtime(true);

        return round(($end - $start) * 1000, 2);
    }
}
