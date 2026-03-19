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

    /**
     * Scope a query to only include online agents.
     * Online = agents that have sent heartbeat in last 30 seconds
     */
    public function scopeWhereOnline($query)
    {
        return $query->where('last_seen_at', '>=', now()->subSeconds(30))
                     ->where('status', '!=', AgentStatus::OFFLINE);
    }

    /**
     * Scope a query to only include offline agents.
     * Offline = no heartbeat in last 30 seconds OR status is OFFLINE
     */
    public function scopeWhereOffline($query)
    {
        return $query->where(function ($q) {
            $q->where('last_seen_at', '<', now()->subSeconds(30))
              ->orWhereNull('last_seen_at')
              ->orWhere('status', AgentStatus::OFFLINE);
        });
    }

    /**
     * Accessor to check if agent is currently online.
     * Online = heartbeat received within last 30 seconds
     */
    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }

        return $this->last_seen_at->greaterThan(now()->subSeconds(30))
            && $this->status !== AgentStatus::OFFLINE;
    }
}
