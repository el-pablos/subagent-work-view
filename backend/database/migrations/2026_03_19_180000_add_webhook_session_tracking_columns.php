<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sessions') && ! Schema::hasColumn('sessions', 'external_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->string('external_id')->nullable()->after('uuid');
            });
        }

        if (Schema::hasTable('agents') && ! Schema::hasColumn('agents', 'session_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->foreignId('session_id')->nullable()->after('external_id')->constrained('sessions')->nullOnDelete();
            });
        }

        if (Schema::hasTable('agents') && ! Schema::hasColumn('agents', 'metadata')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->json('metadata')->nullable()->after('capabilities');
            });
        }

        if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'external_id') && ! Schema::hasIndex('sessions', 'idx_sessions_external_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->index('external_id', 'idx_sessions_external_id');
            });
        }

        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'session_id') && ! Schema::hasIndex('agents', 'idx_agents_session_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->index('session_id', 'idx_agents_session_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sessions') && Schema::hasIndex('sessions', 'idx_sessions_external_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->dropIndex('idx_sessions_external_id');
            });
        }

        if (Schema::hasTable('agents') && Schema::hasIndex('agents', 'idx_agents_session_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropIndex('idx_agents_session_id');
            });
        }

        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'session_id')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropConstrainedForeignId('session_id');
            });
        }

        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'metadata')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropColumn('metadata');
            });
        }

        if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'external_id')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->dropColumn('external_id');
            });
        }
    }
};
