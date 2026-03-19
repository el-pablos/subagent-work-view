<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Session;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class WebhookControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Config::set('database.default', 'sqlite');
        Config::set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        DB::reconnect('sqlite');

        Schema::dropAllTables();

        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('external_id')->nullable();
            $table->string('command_source', 50);
            $table->text('original_command');
            $table->string('status', 30)->default('queued');
            $table->json('context')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 120);
            $table->string('type', 50);
            $table->string('status', 30)->default('idle');
            $table->string('source')->default('unknown');
            $table->string('external_id')->nullable();
            $table->foreignId('session_id')->nullable();
            $table->text('current_task')->nullable();
            $table->string('avatar')->nullable();
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->unsignedSmallInteger('priority')->default(100);
            $table->json('capabilities')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id');
            $table->foreignId('from_agent_id')->nullable();
            $table->foreignId('to_agent_id')->nullable();
            $table->longText('content');
            $table->string('message_type', 30)->default('agent');
            $table->string('channel', 50)->default('general');
            $table->timestamp('timestamp')->nullable();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('session_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 30)->default('pending');
            $table->foreignId('assigned_agent_id')->nullable();
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
        });

        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id');
            $table->foreignId('agent_id')->nullable();
            $table->string('action', 80);
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('timestamp')->nullable();
            $table->timestamps();
        });
    }

    public function test_claude_spawn_webhook_creates_session_and_agent(): void
    {
        $response = $this->postJson('/api/v1/webhook/claude', [
            'agent_id' => 'claude-session-123',
            'event_type' => 'agent_spawn',
            'data' => [
                'agent_name' => 'Claude Planner',
                'agent_type' => 'subagent',
                'status' => 'active',
            ],
            'timestamp' => '2026-03-19T12:00:00Z',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('source', 'claude');

        $this->assertDatabaseHas('sessions', [
            'external_id' => 'claude-session-123',
            'command_source' => 'claude',
            'status' => 'running',
        ]);

        $this->assertDatabaseHas('agents', [
            'external_id' => 'claude-session-123',
            'source' => 'claude',
            'name' => 'Claude Planner',
            'status' => 'busy',
        ]);
    }

    public function test_duplicate_message_webhook_is_idempotent(): void
    {
        Session::create([
            'uuid' => '93f0ff4f-1010-4b60-b16f-17e7d3f1b10f',
            'external_id' => 'claude-session-321',
            'command_source' => 'claude',
            'original_command' => 'Webhook bootstrap',
            'status' => 'running',
        ]);

        Agent::create([
            'uuid' => '93f0ff4f-1010-4b60-b16f-17e7d3f1b10a',
            'name' => 'Claude Worker',
            'type' => 'coder',
            'status' => 'busy',
            'source' => 'claude',
            'external_id' => 'claude-session-321',
        ]);

        $payload = [
            'agent_id' => 'claude-session-321',
            'event_type' => 'agent_message',
            'data' => [
                'agent_name' => 'Claude Worker',
                'agent_type' => 'subagent',
                'tool_input' => 'review this patch',
            ],
            'timestamp' => '2026-03-19T12:05:00Z',
        ];

        $this->postJson('/api/v1/webhook/claude', $payload)->assertCreated();
        $this->postJson('/api/v1/webhook/claude', $payload)->assertCreated();

        $this->assertDatabaseCount('messages', 1);
        $this->assertDatabaseHas('messages', [
            'content' => 'review this patch',
            'message_type' => 'agent',
        ]);
    }

    public function test_agent_action_creates_task_and_task_log(): void
    {
        $response = $this->postJson('/api/v1/webhook/claude', [
            'agent_id' => 'claude-session-789',
            'event_type' => 'agent_action',
            'data' => [
                'agent_name' => 'Claude Tool Runner',
                'agent_type' => 'agent',
                'status' => 'active',
                'tool_name' => 'bash',
                'tool_input' => 'php artisan test',
            ],
            'timestamp' => '2026-03-19T12:15:00Z',
        ]);

        $response->assertCreated()
            ->assertJsonPath('processed.task.created', true)
            ->assertJsonPath('processed.task_log.created', true);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Bash',
            'status' => 'running',
        ]);

        $this->assertDatabaseHas('task_logs', [
            'action' => 'tool.bash',
        ]);
    }
}
