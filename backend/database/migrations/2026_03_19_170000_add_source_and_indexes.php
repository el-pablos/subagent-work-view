<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('agents') && ! Schema::hasColumn('agents', 'source')) {
            Schema::table('agents', function (Blueprint $table) {
                $column = $table->string('source')->default('unknown');

                if (Schema::hasColumn('agents', 'status')) {
                    $column->after('status');
                }
            });
        }

        if (Schema::hasTable('agents') && ! Schema::hasColumn('agents', 'external_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $column = $table->string('external_id')->nullable();

                if (Schema::hasColumn('agents', 'source')) {
                    $column->after('source');
                }
            });
        }

        $this->addIndexIfMissing('agents', 'status', 'idx_agents_status');
        $this->addIndexIfMissing('agents', 'source', 'idx_agents_source');
        $this->addIndexIfMissing('agents', 'external_id', 'idx_agents_external_id');
        $this->addIndexIfMissing('agents', 'session_id', 'idx_agents_session_id');

        $this->addIndexIfMissing('sessions', 'status', 'idx_sessions_status');
        $this->addIndexIfMissing('sessions', 'command_source', 'idx_sessions_command_source');

        $this->addIndexIfMissing('tasks', 'status', 'idx_tasks_status');
        $this->addIndexIfMissing('tasks', 'session_id', 'idx_tasks_session_id');
        $this->addIndexIfMissing('tasks', 'assigned_agent_id', 'idx_tasks_assigned_agent_id');

        $this->addIndexIfMissing('messages', 'session_id', 'idx_messages_session_id');
        $this->addIndexIfMissing('messages', 'from_agent_id', 'idx_messages_from_agent_id');
        $this->addIndexIfMissing('messages', 'to_agent_id', 'idx_messages_to_agent_id');

        $this->addIndexIfMissing('task_logs', 'task_id', 'idx_task_logs_task_id');
    }

    public function down(): void
    {
        $this->dropIndexIfExists('task_logs', 'task_id', 'idx_task_logs_task_id');

        $this->dropIndexIfExists('messages', 'to_agent_id', 'idx_messages_to_agent_id');
        $this->dropIndexIfExists('messages', 'from_agent_id', 'idx_messages_from_agent_id');
        $this->dropIndexIfExists('messages', 'session_id', 'idx_messages_session_id');

        $this->dropIndexIfExists('tasks', 'assigned_agent_id', 'idx_tasks_assigned_agent_id');
        $this->dropIndexIfExists('tasks', 'session_id', 'idx_tasks_session_id');
        $this->dropIndexIfExists('tasks', 'status', 'idx_tasks_status');

        $this->dropIndexIfExists('sessions', 'command_source', 'idx_sessions_command_source');
        $this->dropIndexIfExists('sessions', 'status', 'idx_sessions_status');

        $this->dropIndexIfExists('agents', 'session_id', 'idx_agents_session_id');
        $this->dropIndexIfExists('agents', 'external_id', 'idx_agents_external_id');
        $this->dropIndexIfExists('agents', 'source', 'idx_agents_source');
        $this->dropIndexIfExists('agents', 'status', 'idx_agents_status');

        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'external_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropColumn('external_id');
            });
        }

        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'source')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropColumn('source');
            });
        }
    }

    private function addIndexIfMissing(string $table, string|array $columns, string $name): void
    {
        $columns = (array) $columns;

        if (! Schema::hasTable($table) || ! $this->hasAllColumns($table, $columns)) {
            return;
        }

        if (Schema::hasIndex($table, $name) || Schema::hasIndex($table, $columns)) {
            return;
        }

        Schema::table($table, function (Blueprint $tableBlueprint) use ($columns, $name) {
            $tableBlueprint->index($columns, $name);
        });
    }

    private function dropIndexIfExists(string $table, string|array $columns, string $name): void
    {
        $columns = (array) $columns;

        if (! Schema::hasTable($table)) {
            return;
        }

        $hasNamedIndex = Schema::hasIndex($table, $name);
        $hasColumnIndex = $this->hasAllColumns($table, $columns) && Schema::hasIndex($table, $columns);

        if (! $hasNamedIndex && ! $hasColumnIndex) {
            return;
        }

        Schema::table($table, function (Blueprint $tableBlueprint) use ($columns, $name, $hasNamedIndex) {
            $tableBlueprint->dropIndex($hasNamedIndex ? $name : $columns);
        });
    }

    private function hasAllColumns(string $table, array $columns): bool
    {
        foreach ($columns as $column) {
            if (! Schema::hasColumn($table, $column)) {
                return false;
            }
        }

        return true;
    }
};
