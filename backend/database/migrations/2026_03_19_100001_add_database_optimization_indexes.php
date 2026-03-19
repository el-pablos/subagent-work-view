<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            // Index for online/offline checks and heartbeat queries
            $table->index('last_seen_at', 'idx_agents_last_seen');
        });

        Schema::table('tasks', function (Blueprint $table) {
            // Index for metrics and completed tasks queries
            $table->index('finished_at', 'idx_tasks_finished_at');

            // Composite index for status + finished_at queries (dashboard metrics)
            $table->index(['status', 'finished_at'], 'idx_tasks_status_finished');

            // Composite index for status + started_at queries
            $table->index(['status', 'started_at'], 'idx_tasks_status_started');
        });

        Schema::table('messages', function (Blueprint $table) {
            // Index message_type for filtering by type
            $table->index('message_type', 'idx_messages_type');

            // Composite index for channel + timestamp for channel-based queries
            $table->index(['channel', 'timestamp'], 'idx_messages_channel_time');
        });

        // Add full-text search index on messages.content (MySQL/MariaDB only)
        // This enables fast searching through message content
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE messages ADD FULLTEXT INDEX idx_messages_content_fulltext (content)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropIndex('idx_agents_last_seen');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_finished_at');
            $table->dropIndex('idx_tasks_status_finished');
            $table->dropIndex('idx_tasks_status_started');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_type');
            $table->dropIndex('idx_messages_channel_time');
        });

        // Drop full-text index (MySQL/MariaDB only)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE messages DROP INDEX idx_messages_content_fulltext');
        }
    }
};
