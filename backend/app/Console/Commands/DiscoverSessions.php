<?php

namespace App\Console\Commands;

use App\Services\Discovery\SessionDiscoveryService;
use Illuminate\Console\Command;

class DiscoverSessions extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sessions:discover
                            {--continuous : Run continuously in a loop}
                            {--interval=5 : Interval in seconds for continuous mode}';

    /**
     * The console command description.
     */
    protected $description = 'Discover and sync Claude Code team sessions';

    /**
     * Execute the console command.
     */
    public function handle(SessionDiscoveryService $service): int
    {
        if ($this->option('continuous')) {
            return $this->runContinuously($service);
        }

        return $this->runOnce($service);
    }

    /**
     * Run discovery once.
     */
    protected function runOnce(SessionDiscoveryService $service): int
    {
        $this->info('Discovering Claude Code sessions...');

        $stats = $service->discoverAndSync();

        $this->info("Discovery completed:");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Teams Found', $stats['teams_found']],
                ['Sessions Created', $stats['sessions_created']],
                ['Sessions Updated', $stats['sessions_updated']],
                ['Agents Created', $stats['agents_created']],
                ['Agents Updated', $stats['agents_updated']],
                ['Agents Terminated', $stats['agents_terminated']],
            ]
        );

        return self::SUCCESS;
    }

    /**
     * Run discovery continuously in a loop.
     */
    protected function runContinuously(SessionDiscoveryService $service): int
    {
        $interval = (int) $this->option('interval');
        $this->info("Running session discovery continuously (every {$interval}s)...");
        $this->info('Press Ctrl+C to stop.');

        while (true) {
            $stats = $service->discoverAndSync();

            $changes = $stats['sessions_created'] +
                       $stats['agents_created'] +
                       $stats['agents_terminated'];

            if ($changes > 0) {
                $this->line(sprintf(
                    '[%s] Discovered: %d teams, +%d sessions, +%d agents, -%d terminated',
                    now()->format('H:i:s'),
                    $stats['teams_found'],
                    $stats['sessions_created'],
                    $stats['agents_created'],
                    $stats['agents_terminated']
                ));
            }

            sleep($interval);
        }

        return self::SUCCESS;
    }
}
