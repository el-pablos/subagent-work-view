<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessIncomingCommandJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommandController extends Controller
{
    public function execute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => 'required|string|max:5000',
            'source' => 'nullable|string|in:claude,openclaw,copilot-cli,web',
            'session_id' => 'nullable|string',
            'target_agent_id' => 'nullable|integer|exists:agents,id',
        ]);

        $source = $validated['source'] ?? 'web';
        $userId = $request->user()?->id;

        ProcessIncomingCommandJob::dispatch(
            source: $source,
            command: $validated['command'],
            userId: $userId,
        );

        Log::info('Command dispatched.', [
            'source' => $source,
            'command' => $validated['command'],
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'command' => $validated['command'],
            'source' => $source,
            'status' => 'dispatched',
            'message' => 'Command diterima dan sedang diproses.',
        ]);
    }
}
