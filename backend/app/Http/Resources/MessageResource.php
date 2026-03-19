<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'content' => $this->content,
            'message_type' => $this->message_type,
            'channel' => $this->channel,
            'from_agent' => new AgentResource($this->whenLoaded('fromAgent')),
            'to_agent' => new AgentResource($this->whenLoaded('toAgent')),
            'timestamp' => $this->timestamp?->toIso8601String(),
        ];
    }
}
