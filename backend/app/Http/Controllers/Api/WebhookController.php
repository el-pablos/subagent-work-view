<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenClawService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class WebhookController extends Controller
{
    public function __construct(
        private readonly OpenClawService $openClawService,
    ) {}

    public function receive(Request $request, string $source): JsonResponse
    {
        if ($source !== OpenClawService::SOURCE) {
            return response()->json([
                'message' => 'Unsupported webhook source.',
            ], 422);
        }

        $validated = $request->validate([
            'session_id' => ['required', 'string', 'max:255'],
            'event_type' => ['required', 'string', 'max:100'],
            'data' => ['required', 'array'],
            'timestamp' => ['nullable', 'date'],
        ]);

        $event = $validated['data'];
        $event['type'] = $event['type'] ?? $validated['event_type'];
        $event['timestamp'] = $event['timestamp'] ?? $validated['timestamp'] ?? now()->toIso8601String();
        $event['session_id'] = $event['session_id'] ?? $validated['session_id'];

        try {
            $result = $this->openClawService->ingestForwardedEvent($validated['session_id'], $event);

            return response()->json([
                'message' => 'OpenClaw webhook processed.',
                'data' => $result,
            ], 202);
        } catch (Throwable $exception) {
            Log::error('OpenClaw webhook processing gagal.', [
                'session_id' => $validated['session_id'],
                'event_type' => $validated['event_type'],
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'OpenClaw webhook failed.',
            ], 500);
        }
    }
}
