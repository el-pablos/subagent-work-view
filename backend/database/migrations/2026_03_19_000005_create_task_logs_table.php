<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->string('action', 80);
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();

            $table->index(['task_id', 'timestamp'], 'idx_task_logs_task_time');
            $table->index(['agent_id', 'timestamp'], 'idx_task_logs_agent_time');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_logs');
    }
};
