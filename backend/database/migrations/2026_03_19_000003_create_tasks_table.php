<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('session_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('pending');
            $table->foreignId('assigned_agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->unsignedInteger('attempt')->default(0);
            $table->unsignedInteger('max_attempt')->default(3);
            $table->json('payload')->nullable();
            $table->json('result')->nullable();
            $table->json('dependencies')->nullable();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'status'], 'idx_tasks_session_status');
            $table->index(['assigned_agent_id', 'status'], 'idx_tasks_agent_status');
            $table->index(['status', 'created_at'], 'idx_tasks_status_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
