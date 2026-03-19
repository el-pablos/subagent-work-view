<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommandController extends Controller
{
    public function execute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => 'required|string',
            'session_id' => 'nullable|string',
            'target_agent_id' => 'nullable|integer',
        ]);

        return response()->json([
            'success' => true,
            'command' => $validated['command'],
            'status' => 'queued',
            'message' => 'Command diterima dan sedang diproses',
        ]);
    }
}
