<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskLogResource extends JsonResource
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
            'task_id' => $this->task_id,
            'action' => $this->action,
            'notes' => $this->notes,
            'meta' => $this->meta,
            'agent' => new AgentResource($this->whenLoaded('agent')),
            'timestamp' => $this->timestamp?->toIso8601String(),
        ];
    }
}
