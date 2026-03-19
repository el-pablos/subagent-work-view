<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 120);
            $table->string('type', 50);
            $table->string('status', 30)->default('idle');
            $table->text('current_task')->nullable();
            $table->string('avatar')->nullable();
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->unsignedSmallInteger('priority')->default(100);
            $table->json('capabilities')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'type'], 'idx_agents_status_type');
            $table->index(['priority', 'status'], 'idx_agents_priority_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
