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
}
