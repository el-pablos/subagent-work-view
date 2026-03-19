<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class OpenClawIntegrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', database_path('database.sqlite'));

        DB::purge('sqlite');
        DB::reconnect('sqlite');

        Schema::dropIfExists('messages');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('agents');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });

        Schema::create('agents', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->nullable();
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
        });

        Schema::create('sessions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->nullable();
            $table->string('command_source', 50);
            $table->text('original_command');
            $table->string('status', 30)->default('queued');
            $table->json('context')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->foreignId('to_agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->longText('content');
            $table->string('message_type', 30)->default('agent');
            $table->string('channel', 50)->default('general');
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        File::deleteDirectory(base_path('tests/Fixtures/openclaw-temp'));

        parent::tearDown();
    }

    public function test_sync_command_ingests_openclaw_session_idempotently(): void
    {
        $path = base_path('tests/Fixtures/openclaw-temp');
        File::ensureDirectoryExists($path);

        File::put($path . '/session-alpha.jsonl', implode(PHP_EOL, [
            json_encode([
                'type' => 'session',
                'timestamp' => '2026-03-17T19:00:00Z',
                'data' => [
                    'command' => 'ringkas hasil coding agent hari ini',
                    'cwd' => '/tmp/project',
                ],
            ]),
            json_encode([
                'type' => 'message',
                'timestamp' => '2026-03-17T19:00:01Z',
                'role' => 'user',
                'content' => 'ringkas hasil coding agent hari ini',
            ]),
            '{"type":"message","timestamp":"broken"',
            json_encode([
                'type' => 'message',
                'timestamp' => '2026-03-17T19:00:02Z',
                'role' => 'assistant',
                'content' => 'Siap, saya rangkum sekarang.',
                'provider' => 'github-copilot',
                'modelId' => 'claude-sonnet-4.6',
            ]),
            json_encode([
                'type' => 'model_change',
                'timestamp' => '2026-03-17T19:00:03Z',
                'modelId' => 'gpt-5.4',
            ]),
            json_encode([
                'type' => 'custom',
                'timestamp' => '2026-03-17T19:00:04Z',
                'customType' => 'thinking_level_change',
                'level' => 'high',
            ]),
        ]) . PHP_EOL);

        $this->artisan('openclaw:sync', ['--path' => $path])
            ->assertSuccessful();

        $session = Session::query()->firstOrFail();

        $this->assertSame('openclaw', $session->command_source);
        $this->assertSame('session-alpha', $session->context['openclaw_session_id']);
        $this->assertSame('high', $session->context['thinking_level']);
        $this->assertSame('gpt-5.4', $session->context['model_id']);
        $this->assertSame('ringkas hasil coding agent hari ini', $session->original_command);

        $this->assertDatabaseCount('sessions', 1);
        $this->assertDatabaseCount('agents', 1);
        $this->assertDatabaseCount('messages', 4);

        $this->artisan('openclaw:sync', ['--path' => $path])
            ->assertSuccessful();

        $this->assertDatabaseCount('sessions', 1);
        $this->assertDatabaseCount('agents', 1);
        $this->assertDatabaseCount('messages', 4);
    }

    public function test_webhook_endpoint_ingests_forwarded_openclaw_event(): void
    {
        $response = $this->postJson('/api/v1/webhook/openclaw', [
            'session_id' => 'session-beta',
            'event_type' => 'message',
            'timestamp' => '2026-03-17T20:00:00Z',
            'data' => [
                'type' => 'message',
                'timestamp' => '2026-03-17T20:00:00Z',
                'role' => 'assistant',
                'content' => 'Halo dari OpenClaw watcher.',
                'provider' => 'github-copilot',
                'modelId' => 'claude-sonnet-4.6',
            ],
        ]);

        $response->assertAccepted();

        $session = Session::query()->firstOrFail();
        $agent = Agent::query()->firstOrFail();
        $message = Message::query()->firstOrFail();

        $this->assertSame('session-beta', $session->context['openclaw_session_id']);
        $this->assertSame('openclaw session-beta', $agent->name);
        $this->assertSame('Halo dari OpenClaw watcher.', $message->content);
        $this->assertSame($agent->id, $message->from_agent_id);
    }
}
