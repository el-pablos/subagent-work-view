<?php

namespace App\Services\Discovery;

use App\Models\Session;
use App\Models\Agent;
use App\Enums\SessionStatus;
use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Events\AgentSpawned;
use App\Events\AgentTerminated;
use App\Events\AgentStatusChanged;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SessionDiscoveryService
{
    protected string $teamsPath;

    public function __construct()
    {
        $this->teamsPath = config('claude.teams_path', getenv('HOME') . '/.claude/teams');
    }

    /**
     * Discover all active Claude Code teams and sync to database.
     */
    public function discoverAndSync(): array
    {
        $stats = [
            'teams_found' => 0,
            'sessions_created' => 0,
            'sessions_updated' => 0,
            'agents_created' => 0,
            'agents_updated' => 0,
            'agents_terminated' => 0,
        ];

        if (!File::isDirectory($this->teamsPath)) {
            Log::debug('Teams directory not found', ['path' => $this->teamsPath]);
            return $stats;
        }

        $teams = $this->scanTeams();
        $stats['teams_found'] = count($teams);

        foreach ($teams as $team) {
            $sessionStats = $this->syncTeamSession($team);
            $stats['sessions_created'] += $sessionStats['session_created'] ? 1 : 0;
            $stats['sessions_updated'] += $sessionStats['session_updated'] ? 1 : 0;
            $stats['agents_created'] += $sessionStats['agents_created'];
            $stats['agents_updated'] += $sessionStats['agents_updated'];
        }

        // Mark terminated sessions (teams that no longer exist)
        $terminatedCount = $this->markTerminatedSessions($teams);
        $stats['agents_terminated'] = $terminatedCount;

        return $stats;
    }

    /**
     * Scan teams directory for active team configurations.
     */
    public function scanTeams(): Collection
    {
        $teams = collect();

        if (!File::isDirectory($this->teamsPath)) {
            return $teams;
        }

        $directories = File::directories($this->teamsPath);

        foreach ($directories as $directory) {
            $configPath = $directory . '/config.json';

            if (File::exists($configPath)) {
                try {
                    $config = json_decode(File::get($configPath), true);

                    if (json_last_error() === JSON_ERROR_NONE && !empty($config)) {
                        $teams->push([
                            'directory' => $directory,
                            'name' => basename($directory),
                            'config' => $config,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to parse team config', [
                        'path' => $configPath,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return $teams;
    }

    /**
     * Sync a single team to the database.
     */
    protected function syncTeamSession(array $team): array
    {
        $stats = [
            'session_created' => false,
            'session_updated' => false,
            'agents_created' => 0,
            'agents_updated' => 0,
        ];

        $config = $team['config'];
        $sessionUuid = $config['leadSessionId'] ?? Str::uuid()->toString();

        // Find or create session
        $session = Session::where('uuid', $sessionUuid)->first();

        if (!$session) {
            $session = Session::create([
                'uuid' => $sessionUuid,
                'command_source' => 'claude-code',
                'original_command' => $config['description'] ?? $config['name'] ?? 'Claude Code Team Session',
                'status' => SessionStatus::RUNNING,
                'context' => [
                    'team_name' => $config['name'] ?? $team['name'],
                    'lead_agent_id' => $config['leadAgentId'] ?? null,
                    'created_at' => $config['createdAt'] ?? null,
                    'discovery_path' => $team['directory'],
                ],
                'started_at' => isset($config['createdAt'])
                    ? \Carbon\Carbon::createFromTimestampMs($config['createdAt'])
                    : now(),
            ]);
            $stats['session_created'] = true;

            Log::info('Discovered new Claude Code session', [
                'uuid' => $sessionUuid,
                'team' => $config['name'] ?? $team['name'],
            ]);
        } else {
            // Update session context if needed
            $session->update([
                'context' => array_merge($session->context ?? [], [
                    'last_discovered' => now()->toIso8601String(),
                    'member_count' => count($config['members'] ?? []),
                ]),
            ]);
            $stats['session_updated'] = true;
        }

        // Sync agents from team members
        $agentStats = $this->syncTeamAgents($session, $config['members'] ?? []);
        $stats['agents_created'] = $agentStats['created'];
        $stats['agents_updated'] = $agentStats['updated'];

        return $stats;
    }

    /**
     * Sync team member agents to database.
     */
    protected function syncTeamAgents(Session $session, array $members): array
    {
        $stats = ['created' => 0, 'updated' => 0];
        $currentAgentIds = [];

        foreach ($members as $member) {
            $agentId = $member['agentId'] ?? null;
            if (!$agentId) continue;

            $currentAgentIds[] = $agentId;

            $agent = Agent::where('external_id', $agentId)->first();
            $agentType = $this->mapAgentType($member['agentType'] ?? 'general');

            if (!$agent) {
                $agent = Agent::create([
                    'uuid' => Str::uuid(),
                    'external_id' => $agentId,
                    'name' => $member['name'] ?? 'unknown',
                    'type' => $agentType,
                    'status' => AgentStatus::IDLE,
                    'session_id' => $session->id,
                    'capabilities' => [
                        'model' => $member['model'] ?? 'unknown',
                        'color' => $member['color'] ?? null,
                        'prompt' => $member['prompt'] ?? null,
                    ],
                    'last_seen_at' => now(),
                ]);
                $stats['created']++;

                // Broadcast agent spawned event
                try {
                    event(new AgentSpawned($agent));
                } catch (\Exception $e) {
                    Log::warning('Failed to broadcast AgentSpawned', ['error' => $e->getMessage()]);
                }

                Log::info('Discovered new agent', [
                    'agent_id' => $agentId,
                    'name' => $member['name'] ?? 'unknown',
                    'session_uuid' => $session->uuid,
                ]);
            } else {
                // Update existing agent
                $wasUpdated = false;
                $updates = [];

                if ($agent->session_id !== $session->id) {
                    $updates['session_id'] = $session->id;
                    $wasUpdated = true;
                }

                // Always update last_seen_at to keep agent alive
                $updates['last_seen_at'] = now();

                // Update capabilities if they changed
                $newCapabilities = [
                    'model' => $member['model'] ?? 'unknown',
                    'color' => $member['color'] ?? null,
                    'prompt' => $member['prompt'] ?? null,
                ];

                if ($agent->capabilities !== $newCapabilities) {
                    $updates['capabilities'] = $newCapabilities;
                    $wasUpdated = true;
                }

                $agent->update($updates);

                if ($wasUpdated) {
                    $stats['updated']++;
                }
            }
        }

        return $stats;
    }

    /**
     * Map Claude Code agent type to internal AgentType enum.
     */
    protected function mapAgentType(string $type): AgentType
    {
        return match ($type) {
            'orchestrator' => AgentType::ORCHESTRATOR,
            'laravel-mysql', 'backend', 'api' => AgentType::BACKEND,
            'frontend-modern', 'frontend', 'react' => AgentType::FRONTEND,
            'devops-linux', 'devops', 'infrastructure' => AgentType::DEVOPS,
            'tester', 'qa' => AgentType::TESTER,
            default => AgentType::WORKER,
        };
    }

    /**
     * Mark sessions and agents as terminated if their team no longer exists.
     */
    protected function markTerminatedSessions(Collection $activeTeams): int
    {
        $activeSessionUuids = $activeTeams
            ->pluck('config.leadSessionId')
            ->filter()
            ->toArray();

        // Find sessions that were discovered via Claude Code but are no longer active
        $terminatedSessions = Session::where('command_source', 'claude-code')
            ->where('status', SessionStatus::RUNNING)
            ->whereNotIn('uuid', $activeSessionUuids)
            ->get();

        $terminatedCount = 0;

        foreach ($terminatedSessions as $session) {
            $session->update([
                'status' => SessionStatus::COMPLETED,
                'ended_at' => now(),
            ]);

            // Mark all agents in this session as offline
            $agents = Agent::where('session_id', $session->id)
                ->where('status', '!=', AgentStatus::OFFLINE)
                ->get();

            foreach ($agents as $agent) {
                $agent->update(['status' => AgentStatus::OFFLINE]);
                $terminatedCount++;

                try {
                    event(new AgentTerminated($agent));
                } catch (\Exception $e) {
                    Log::warning('Failed to broadcast AgentTerminated', ['error' => $e->getMessage()]);
                }
            }

            Log::info('Marked session as terminated', [
                'uuid' => $session->uuid,
                'agents_terminated' => $agents->count(),
            ]);
        }

        return $terminatedCount;
    }

    /**
     * Get the teams directory path.
     */
    public function getTeamsPath(): string
    {
        return $this->teamsPath;
    }

    /**
     * Check if a specific team is still active.
     */
    public function isTeamActive(string $teamName): bool
    {
        $configPath = $this->teamsPath . '/' . $teamName . '/config.json';
        return File::exists($configPath);
    }
}
