<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('command_source', 50);
            $table->text('original_command');
            $table->string('status', 30)->default('queued');
            $table->json('context')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'idx_sessions_status_created');
            $table->index('command_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_sessions');
    }
};
