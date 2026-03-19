<?php

namespace App\Models;

use App\Enums\MessageType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'from_agent_id',
        'to_agent_id',
        'content',
        'message_type',
        'channel',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'message_type' => MessageType::class,
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function fromAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'from_agent_id');
    }

    public function toAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'to_agent_id');
    }

    /**
     * Scope to search messages using full-text search.
     * Uses MySQL MATCH AGAINST for better performance on large datasets.
     */
    public function scopeSearch($query, string $searchTerm)
    {
        if (empty($searchTerm)) {
            return $query;
        }

        // Use full-text search if available (MySQL/MariaDB)
        if (config('database.default') === 'mysql') {
            return $query->whereRaw(
                'MATCH(content) AGAINST(? IN BOOLEAN MODE)',
                [$searchTerm]
            );
        }

        // Fallback to LIKE for other databases
        return $query->where('content', 'like', "%{$searchTerm}%");
    }

    /**
     * Scope to filter by message type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('message_type', $type);
    }

    /**
     * Scope to filter by channel.
     */
    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope to get messages between two agents.
     */
    public function scopeBetweenAgents($query, int $agent1Id, int $agent2Id)
    {
        return $query->where(function ($q) use ($agent1Id, $agent2Id) {
            $q->where(function ($subQ) use ($agent1Id, $agent2Id) {
                $subQ->where('from_agent_id', $agent1Id)
                    ->where('to_agent_id', $agent2Id);
            })->orWhere(function ($subQ) use ($agent1Id, $agent2Id) {
                $subQ->where('from_agent_id', $agent2Id)
                    ->where('to_agent_id', $agent1Id);
            });
        });
    }
}
