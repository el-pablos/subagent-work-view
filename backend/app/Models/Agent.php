<?php

namespace App\Models;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Agent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'type',
        'status',
        'current_task',
        'avatar',
        'capacity',
        'priority',
        'capabilities',
        'last_seen_at',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'last_seen_at' => 'datetime',
        'status' => AgentStatus::class,
        'type' => AgentType::class,
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid();
            }
        });
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_agent_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'from_agent_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'to_agent_id');
    }

    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === AgentStatus::IDLE;
    }

    /**
     * Scope a query to only include idle agents.
     */
    public function scopeIdle($query)
    {
        return $query->where('status', AgentStatus::IDLE);
    }

    /**
     * Scope a query to only include busy agents.
     */
    public function scopeBusy($query)
    {
        return $query->where('status', AgentStatus::BUSY);
    }

    /**
     * Scope a query to filter agents by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
