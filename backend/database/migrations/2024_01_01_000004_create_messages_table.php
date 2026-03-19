<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->foreignId('to_agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->longText('content');
            $table->string('message_type', 30)->default('agent'); // agent, system, user, broadcast
            $table->string('channel', 50)->default('general'); // general, handoff, alert, debug
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['session_id', 'timestamp'], 'idx_messages_session_time');
            $table->index(['from_agent_id', 'to_agent_id'], 'idx_messages_from_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
