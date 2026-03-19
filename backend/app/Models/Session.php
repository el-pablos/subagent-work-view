<?php

namespace App\Models;

use App\Enums\SessionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'command_source',
        'original_command',
        'status',
        'context',
        'created_by',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'context' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'status' => SessionStatus::class,
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'tasks', 'session_id', 'assigned_agent_id')
            ->whereNotNull('tasks.assigned_agent_id')
            ->distinct();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [SessionStatus::QUEUED, SessionStatus::PLANNING, SessionStatus::RUNNING]);
    }

    /**
     * Scope a query to only include running sessions.
     */
    public function scopeRunning(Builder $query): Builder
    {
        return $query->where('status', SessionStatus::RUNNING);
    }

    /**
     * Scope a query to only include completed sessions.
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', SessionStatus::COMPLETED);
    }

    /**
     * Scope a query to filter sessions by command source.
     */
    public function scopeBySource(Builder $query, string $source): Builder
    {
        return $query->where('command_source', $source);
    }
}
