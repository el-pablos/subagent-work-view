<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'session_id',
        'title',
        'description',
        'status',
        'assigned_agent_id',
        'progress',
        'attempt',
        'max_attempt',
        'payload',
        'result',
        'dependencies',
        'queued_at',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'result' => 'array',
        'dependencies' => 'array',
        'queued_at' => 'datetime',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'status' => TaskStatus::class,
    ];

    /**
     * Get the dependencies as an array, ensuring it's always an array.
     */
    public function getDependenciesAttribute($value): array
    {
        if (is_null($value)) {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
    }

    /**
     * Set the dependencies, ensuring proper JSON encoding.
     */
    public function setDependenciesAttribute($value): void
    {
        if (is_null($value)) {
            $this->attributes['dependencies'] = null;
            return;
        }

        if (is_string($value)) {
            // Check if it's already valid JSON
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->attributes['dependencies'] = json_encode(array_map('intval', $decoded));
                return;
            }
        }

        if (is_array($value)) {
            $this->attributes['dependencies'] = json_encode(array_map('intval', $value));
            return;
        }

        $this->attributes['dependencies'] = null;
    }

    /**
     * Check if this task has any dependencies.
     */
    public function hasDependencies(): bool
    {
        return !empty($this->dependencies);
    }

    /**
     * Add a dependency to this task.
     */
    public function addDependency(int|Task $task): self
    {
        $taskId = $task instanceof Task ? $task->id : $task;
        $dependencies = $this->dependencies;

        if (!in_array($taskId, $dependencies)) {
            $dependencies[] = $taskId;
            $this->dependencies = $dependencies;
        }

        return $this;
    }

    /**
     * Remove a dependency from this task.
     */
    public function removeDependency(int|Task $task): self
    {
        $taskId = $task instanceof Task ? $task->id : $task;
        $dependencies = array_filter($this->dependencies, fn($id) => $id !== $taskId);
        $this->dependencies = array_values($dependencies);

        return $this;
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid();
            }
        });
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'assigned_agent_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }

    /**
     * Get all tasks that this task is blocked by (dependencies).
     * Returns tasks whose IDs are in this task's dependencies array.
     */
    public function blockedBy(): HasMany
    {
        return $this->hasMany(Task::class, 'id')
            ->whereIn('id', $this->dependencies ?? []);
    }

    /**
     * Get all tasks that are blocked by this task.
     * Returns tasks that have this task's ID in their dependencies array.
     */
    public function blocks(): \Illuminate\Database\Eloquent\Builder
    {
        return Task::whereJsonContains('dependencies', $this->id);
    }

    /**
     * Check if this task is blocked (has incomplete dependencies).
     */
    public function isBlocked(): bool
    {
        if (!$this->hasDependencies()) {
            return false;
        }

        $incompleteDeps = Task::whereIn('id', $this->dependencies)
            ->where('status', '!=', TaskStatus::COMPLETED)
            ->exists();

        return $incompleteDeps;
    }

    /**
     * Check if this task is ready (no dependencies or all completed).
     */
    public function isReady(): bool
    {
        return !$this->isBlocked();
    }

    public function canRetry(): bool
    {
        return $this->attempt < $this->max_attempt;
    }

    public function isCompleted(): bool
    {
        return $this->status === TaskStatus::COMPLETED;
    }
}
