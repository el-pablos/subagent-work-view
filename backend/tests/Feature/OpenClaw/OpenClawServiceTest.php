<?php

namespace Tests\Feature\OpenClaw;

use App\Enums\MessageType;
use App\Enums\SessionStatus;
use App\Models\Agent;
use App\Models\Message;
use App\Models\Session;
use App\Services\OpenClawService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * OpenClawServiceTest
 *
 * Tests the core logic of OpenClawService:
 *   - Session/Agent/Message creation from real-world JSONL event structures
 *   - Idempotency (no duplicates on re-sync)
 *   - Text extraction from content blocks
 *   - Status inference (completed vs running vs failed)
 *   - Graceful handling of malformed / missing data
 */
class OpenClawServiceTest extends TestCase
{
    use RefreshDatabase;

    private OpenClawService $service;
    private string $tmpDir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OpenClawService::class);
        $this->tmpDir  = sys_get_temp_dir() . '/openclaw_test_' . uniqid();
        mkdir($this->tmpDir, 0755, true);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        // Cleanup temp files
        array_map('unlink', glob($this->tmpDir . '/*.jsonl') ?: []);
        @rmdir($this->tmpDir);
    }

    // ──────────────────────────────────────────────────────────────
    // syncFile — happy path
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_creates_session_agent_and_messages_from_jsonl_file(): void
    {
        $sessionId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        $file = $this->writeJsonlFile($sessionId, [
            $this->sessionEvent($sessionId),
            $this->modelChangeEvent('github-copilot', 'claude-sonnet-4.5'),
            $this->userMessageEvent('Hello, help me with Laravel', '2020-01-01T10:00:00.000Z'),
            $this->assistantMessageEvent('Sure! Here is how...', '2020-01-01T10:00:05.000Z'),
        ]);

        $result = $this->service->syncFile($file);

        // Returns expected structure
        $this->assertNotNull($result['session_id']);
        $this->assertNotNull($result['session_uuid']);
        $this->assertEquals(2, $result['messages']);
        $this->assertEquals(0, $result['skipped']);

        // Session created correctly
        $session = Session::find($result['session_id']);
        $this->assertNotNull($session);
        $this->assertEquals('openclaw', $session->command_source);
        $this->assertEquals($sessionId, $session->context['openclaw_session_id']);
        $this->assertEquals('github-copilot', $session->context['provider']);
        $this->assertEquals('claude-sonnet-4.5', $session->context['model_id']);
        $this->assertStringContainsString('Hello, help me with Laravel', $session->original_command);

        // Agent created correctly
        $agent = Agent::where('name', 'openclaw:github-copilot:claude-sonnet-4.5')->first();
        $this->assertNotNull($agent);
        $this->assertEquals('planner', $agent->type->value);

        // Messages created correctly
        $messages = Message::where('session_id', $session->id)->orderBy('timestamp')->get();
        $this->assertCount(2, $messages);

        $this->assertEquals(MessageType::USER,  $messages[0]->message_type);
        $this->assertEquals(MessageType::AGENT, $messages[1]->message_type);
        $this->assertEquals('openclaw', $messages[0]->channel);
        $this->assertStringContainsString('Hello, help me with Laravel', $messages[0]->content);
        $this->assertStringContainsString('Sure! Here is how', $messages[1]->content);

        // User message: from=null, to=agent
        $this->assertNull($messages[0]->from_agent_id);
        $this->assertEquals($agent->id, $messages[0]->to_agent_id);

        // Assistant message: from=agent, to=null
        $this->assertEquals($agent->id, $messages[1]->from_agent_id);
        $this->assertNull($messages[1]->to_agent_id);
    }

    /** @test */
    public function it_sets_session_status_to_completed_when_last_event_is_old(): void
    {
        $sessionId = 'old-session-1234-5678-9012-abcdefabcdef';
        $file = $this->writeJsonlFile($sessionId, [
            $this->sessionEvent($sessionId, '2020-01-01T10:00:00.000Z'),
            $this->userMessageEvent('old message', '2020-01-01T10:00:01.000Z'),
            $this->assistantMessageEvent('old reply', '2020-01-01T10:00:02.000Z'),
        ]);

        $result = $this->service->syncFile($file);

        $session = Session::find($result['session_id']);
        $this->assertEquals(SessionStatus::COMPLETED, $session->status);
        $this->assertNotNull($session->ended_at);
    }

    /** @test */
    public function it_sets_session_status_to_failed_on_prompt_error(): void
    {
        $sessionId = 'error-session-1234-5678-9012-abcdefabcdef';
        $file = $this->writeJsonlFile($sessionId, [
            $this->sessionEvent($sessionId),
            $this->userMessageEvent('do something'),
            $this->customEvent('openclaw:prompt-error', ['sessionId' => $sessionId, 'error' => 'aborted']),
        ]);

        $result = $this->service->syncFile($file);

        $session = Session::find($result['session_id']);
        $this->assertEquals(SessionStatus::FAILED, $session->status);
    }

    // ──────────────────────────────────────────────────────────────
    // Idempotency
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function syncing_same_file_twice_does_not_duplicate_messages(): void
    {
        $sessionId = 'idempotent-session-1234-5678-9012-abcdefabcde';
        $file = $this->writeJsonlFile($sessionId, [
            $this->sessionEvent($sessionId),
            $this->userMessageEvent('msg 1', '2020-06-01T08:00:00.000Z'),
            $this->assistantMessageEvent('reply 1', '2020-06-01T08:00:01.000Z'),
        ]);

        $result1 = $this->service->syncFile($file);
        $result2 = $this->service->syncFile($file);

        // Second run creates no new messages
        $this->assertEquals(2, $result1['messages']);
        $this->assertEquals(0, $result2['messages']);
        $this->assertEquals(2, $result2['skipped']);

        // Total messages in DB still 2
        $this->assertEquals(2, Message::where('session_id', $result1['session_id'])->count());

        // Session not duplicated
        $this->assertEquals(
            1,
            Session::where('command_source', 'openclaw')
                ->where('context->openclaw_session_id', $sessionId)
                ->count()
        );
    }

    /** @test */
    public function syncing_file_with_appended_messages_only_adds_new_messages(): void
    {
        $sessionId = 'append-session-1234-5678-9012-abcdefabcdef';

        // First sync: 1 user message
        $file = $this->writeJsonlFile($sessionId, [
            $this->sessionEvent($sessionId),
            $this->userMessageEvent('first message', '2020-06-01T08:00:00.000Z'),
        ]);

        $result1 = $this->service->syncFile($file);
        $this->assertEquals(1, $result1['messages']);

        // Append assistant reply to file
        file_put_contents(
            $file,
            json_encode($this->assistantMessageEvent('first reply', '2020-06-01T08:00:01.000Z')) . "\n",
            FILE_APPEND
        );

        $result2 = $this->service->syncFile($file);

        // Only the new message is created
        $this->assertEquals(1, $result2['messages']);
        $this->assertEquals(1, $result2['skipped']);

        // Total 2 messages
        $this->assertEquals(2, Message::where('session_id', $result1['session_id'])->count());
    }

    // ──────────────────────────────────────────────────────────────
    // Text extraction
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_extracts_text_from_content_blocks(): void
    {
        $blocks = [
            ['type' => 'thinking', 'thinking' => 'internal thought'],
            ['type' => 'text', 'text' => 'Hello world'],
            ['type' => 'tool_use', 'name' => 'bash', 'input' => ['command' => 'ls']],
        ];

        $text = $this->service->extractTextContent($blocks);

        // Only text blocks are extracted; thinking + tool_use are skipped
        $this->assertEquals('Hello world', $text);
    }

    /** @test */
    public function it_handles_multiple_text_blocks(): void
    {
        $blocks = [
            ['type' => 'text', 'text' => 'Part one'],
            ['type' => 'text', 'text' => 'Part two'],
        ];

        $text = $this->service->extractTextContent($blocks);

        $this->assertEquals("Part one\n\nPart two", $text);
    }

    /** @test */
    public function it_handles_empty_content_blocks(): void
    {
        $this->assertEquals('', $this->service->extractTextContent([]));
    }

    // ──────────────────────────────────────────────────────────────
    // Error handling
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_skips_malformed_json_lines_gracefully(): void
    {
        $sessionId = 'malformed-test-1234-5678-9012-abcdefabcdef';
        $file      = $this->tmpDir . "/{$sessionId}.jsonl";

        file_put_contents($file, implode("\n", [
            json_encode($this->sessionEvent($sessionId)),
            '{broken json',           // malformed — should be skipped
            '',                        // empty line — should be skipped
            json_encode($this->userMessageEvent('valid message', '2020-01-01T00:00:00.000Z')),
        ]) . "\n");

        $result = $this->service->syncFile($file);

        // Still creates the session and the valid message
        $this->assertEquals(1, $result['messages']);
    }

    /** @test */
    public function it_throws_on_unreadable_file(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->service->syncFile('/nonexistent/path/fake.jsonl');
    }

    /** @test */
    public function it_handles_empty_file(): void
    {
        $file = $this->tmpDir . '/empty-session.jsonl';
        file_put_contents($file, '');

        $result = $this->service->syncFile($file);

        $this->assertNull($result['session_id']);
        $this->assertEquals(0, $result['messages']);
    }

    // ──────────────────────────────────────────────────────────────
    // resolveAgent
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function resolve_agent_creates_agent_with_correct_name(): void
    {
        $agent = $this->service->resolveAgent('github-copilot', 'gpt-5-mini');

        $this->assertInstanceOf(Agent::class, $agent);
        $this->assertEquals('openclaw:github-copilot:gpt-5-mini', $agent->name);
        $this->assertEquals('planner', $agent->type->value);
    }

    /** @test */
    public function resolve_agent_returns_same_agent_on_second_call(): void
    {
        $a1 = $this->service->resolveAgent('openai', 'gpt-4o');
        $a2 = $this->service->resolveAgent('openai', 'gpt-4o');

        $this->assertEquals($a1->id, $a2->id);
        $this->assertEquals(1, Agent::where('name', 'openclaw:openai:gpt-4o')->count());
    }

    // ──────────────────────────────────────────────────────────────
    // processEvent (webhook path)
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function process_event_ignores_unknown_event_types(): void
    {
        $result = $this->service->processEvent([
            'type'         => 'some_future_event',
            '_source_file' => '/tmp/fake.jsonl',
        ]);

        $this->assertEquals('ignored', $result['status']);
        $this->assertEquals('some_future_event', $result['type']);
    }

    /** @test */
    public function process_event_handles_session_event(): void
    {
        $sessionId = 'webhook-session-1234-5678-9012-abcdefabcde';
        $result = $this->service->processEvent([
            'type'         => 'session',
            'id'           => $sessionId,
            'version'      => 3,
            'cwd'          => '/root/.openclaw/workspace',
            'timestamp'    => '2020-01-01T10:00:00.000Z',
            '_source_file' => "/tmp/{$sessionId}.jsonl",
        ]);

        $this->assertEquals('ok', $result['status']);
        $this->assertEquals('session_resolved', $result['action']);
        $this->assertNotNull($result['session_id']);

        $session = Session::find($result['session_id']);
        $this->assertEquals('openclaw', $session->command_source);
        $this->assertEquals($sessionId, $session->context['openclaw_session_id']);
    }

    /** @test */
    public function process_event_handles_message_event(): void
    {
        $sessionId = 'webhook-msg-test-1234-5678-9012-abcdefabcde';

        // Create session first
        $this->service->processEvent([
            'type'         => 'session',
            'id'           => $sessionId,
            'timestamp'    => '2020-01-01T10:00:00.000Z',
            '_source_file' => "/tmp/{$sessionId}.jsonl",
        ]);

        // Now send a message
        $result = $this->service->processEvent([
            'type'         => 'message',
            'id'           => 'msg001',
            'timestamp'    => '2020-01-01T10:00:01.000Z',
            'message'      => [
                'role'      => 'user',
                'content'   => [['type' => 'text', 'text' => 'Hello from webhook']],
                'timestamp' => 1577872801000,
            ],
            '_source_file' => "/tmp/{$sessionId}.jsonl",
        ]);

        $this->assertEquals('ok', $result['status']);
        $this->assertEquals('message_created', $result['action']);

        $session = $this->service->findSessionByOpenClawId($sessionId);
        $this->assertEquals(1, Message::where('session_id', $session->id)->count());
    }

    // ──────────────────────────────────────────────────────────────
    // JSONL metadata extraction
    // ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_extracts_metadata_from_model_change_event(): void
    {
        $sessionId = 'meta-test-session-1234-5678-9012-abcdefabcde';
        $events    = [
            $this->sessionEvent($sessionId),
            $this->modelChangeEvent('anthropic', 'claude-opus-4.5'),
            [
                'type'       => 'thinking_level_change',
                'id'         => 'abc',
                'parentId'   => null,
                'timestamp'  => '2020-01-01T00:00:01.000Z',
                'thinkingLevel' => 'high',
            ],
        ];

        $file = $this->writeJsonlFile($sessionId, $events);
        $meta = $this->service->extractSessionMetadata($events, $file);

        $this->assertEquals($sessionId, $meta['openclaw_session_id']);
        $this->assertEquals('anthropic',       $meta['provider']);
        $this->assertEquals('claude-opus-4.5', $meta['model_id']);
        $this->assertEquals('high',            $meta['thinking_level']);
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers: JSONL event builders
    // ──────────────────────────────────────────────────────────────

    private function writeJsonlFile(string $sessionId, array $events): string
    {
        $file = $this->tmpDir . "/{$sessionId}.jsonl";
        $lines = array_map('json_encode', $events);
        file_put_contents($file, implode("\n", $lines) . "\n");
        return $file;
    }

    private function sessionEvent(string $sessionId, string $timestamp = '2020-01-01T00:00:00.000Z'): array
    {
        return [
            'type'      => 'session',
            'version'   => 3,
            'id'        => $sessionId,
            'timestamp' => $timestamp,
            'cwd'       => '/root/.openclaw/workspace',
        ];
    }

    private function modelChangeEvent(string $provider, string $modelId): array
    {
        return [
            'type'      => 'model_change',
            'id'        => 'model001',
            'parentId'  => null,
            'timestamp' => '2020-01-01T00:00:00.100Z',
            'provider'  => $provider,
            'modelId'   => $modelId,
        ];
    }

    private function userMessageEvent(string $text, string $timestamp = '2020-01-01T00:00:01.000Z'): array
    {
        return [
            'type'      => 'message',
            'id'        => 'user_' . uniqid(),
            'timestamp' => $timestamp,
            'message'   => [
                'role'      => 'user',
                'content'   => [['type' => 'text', 'text' => $text]],
                'timestamp' => 1577836801000,
            ],
        ];
    }

    private function assistantMessageEvent(string $text, string $timestamp = '2020-01-01T00:00:02.000Z'): array
    {
        return [
            'type'      => 'message',
            'id'        => 'asst_' . uniqid(),
            'timestamp' => $timestamp,
            'message'   => [
                'role'    => 'assistant',
                'content' => [
                    ['type' => 'thinking', 'thinking' => 'internal thought'],
                    ['type' => 'text', 'text' => $text],
                ],
            ],
        ];
    }

    private function customEvent(string $customType, array $data = []): array
    {
        return [
            'type'       => 'custom',
            'customType' => $customType,
            'id'         => 'custom_' . uniqid(),
            'timestamp'  => '2020-01-01T00:00:03.000Z',
            'data'       => $data,
        ];
    }
}
