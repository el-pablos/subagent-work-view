<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = [
            [
                'name' => 'Planner',
                'type' => 'planner',
                'priority' => 10,
                'capabilities' => ['planning', 'analysis', 'decomposition'],
                'status' => 'idle',
                'capacity' => 1,
            ],
            [
                'name' => 'Architect',
                'type' => 'architect',
                'priority' => 20,
                'capabilities' => ['design', 'architecture', 'patterns'],
                'status' => 'idle',
                'capacity' => 1,
            ],
            [
                'name' => 'Coder Alpha',
                'type' => 'coder',
                'priority' => 30,
                'capabilities' => ['coding', 'php', 'laravel', 'javascript'],
                'status' => 'idle',
                'capacity' => 1,
            ],
            [
                'name' => 'Coder Beta',
                'type' => 'coder',
                'priority' => 30,
                'capabilities' => ['coding', 'react', 'typescript', 'frontend'],
                'status' => 'idle',
                'capacity' => 1,
            ],
            [
                'name' => 'Reviewer',
                'type' => 'reviewer',
                'priority' => 40,
                'capabilities' => ['review', 'quality', 'best-practices'],
                'status' => 'idle',
                'capacity' => 1,
            ],
            [
                'name' => 'Tester',
                'type' => 'tester',
                'priority' => 50,
                'capabilities' => ['testing', 'e2e', 'unit-test'],
                'status' => 'idle',
                'capacity' => 1,
            ],
        ];

        foreach ($agents as $agent) {
            Agent::create($agent);
        }
    }
}
