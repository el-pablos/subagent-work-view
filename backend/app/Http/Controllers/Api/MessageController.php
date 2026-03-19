<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Jobs\BatchStoreMessages;
use App\Models\Message;
use App\Models\Session;
use App\Events\MessageCreated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MessageController extends Controller
{
    public function index(Session $session): AnonymousResourceCollection
    {
        $messages = $session->messages()
            ->with(['fromAgent', 'toAgent'])
            ->orderBy('timestamp')
            ->paginate(100);

        return MessageResource::collection($messages);
    }

    public function store(Request $request, Session $session): JsonResponse
    {
        $validated = $request->validate([
            'from_agent_id' => 'nullable|exists:agents,id',
            'to_agent_id' => 'nullable|exists:agents,id',
            'content' => 'required|string|max:65535',
            'message_type' => 'required|string|in:text,command,result,error,system,thought',
            'channel' => 'nullable|string|max:100',
        ]);

        // Queue message for batch processing
        BatchStoreMessages::queueMessage([
            'session_id' => $session->id,
            'from_agent_id' => $validated['from_agent_id'] ?? null,
            'to_agent_id' => $validated['to_agent_id'] ?? null,
            'content' => $validated['content'],
            'message_type' => $validated['message_type'],
            'channel' => $validated['channel'] ?? 'general',
        ]);

        return response()->json([
            'message' => 'Message queued successfully',
            'pending_count' => BatchStoreMessages::pendingCount(),
        ], 202);
    }
}
