<?php

namespace App\Models;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'source',
        'external_id',
        'session_id',
        'current_task',
        'avatar',
        'capacity',
        'priority',
        'capabilities',
        'metadata',
        'last_seen_at',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'metadata' => 'array',
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

    public function latestTask(): HasOne
    {
        return $this->hasOne(Task::class, 'assigned_agent_id')
            ->whereIn('status', [
                TaskStatus::ASSIGNED,
                TaskStatus::RUNNING,
                TaskStatus::BLOCKED,
            ])
            ->latestOfMany('created_at');
    }

    public function sessions(): BelongsToMany
    {
        return $this->belongsToMany(Session::class, 'tasks', 'assigned_agent_id', 'session_id')
            ->whereNotNull('tasks.assigned_agent_id')
            ->distinct();
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
     * Scope a query to include frequently accessed relations.
     */
    public function scopeWithRelations(Builder $query): Builder
    {
        return $query->with([
            'latestTask.session',
            'sessions' => fn (Builder $relationQuery) => $relationQuery
                ->select('sessions.id', 'sessions.uuid', 'sessions.command_source', 'sessions.status')
                ->orderByDesc('sessions.created_at'),
        ]);
    }
}
