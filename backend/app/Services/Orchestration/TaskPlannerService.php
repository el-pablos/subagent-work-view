<?php

namespace App\Services\Orchestration;

class TaskPlannerService
{
    public function planTasks(string $command): array
    {
        // Simple task planning based on command keywords
        $tasks = [];

        // Always start with analysis
        $tasks[] = [
            'title' => 'Analyze requirements',
            'description' => 'Analyze the command and extract requirements',
            'payload' => ['required_type' => 'planner'],
        ];

        // Check for specific keywords
        if (str_contains(strtolower($command), 'login') || str_contains(strtolower($command), 'auth')) {
            $tasks[] = [
                'title' => 'Design authentication flow',
                'description' => 'Design the authentication architecture',
                'payload' => ['required_type' => 'architect'],
                'dependencies' => [1],
            ];
            $tasks[] = [
                'title' => 'Implement authentication',
                'description' => 'Write authentication code',
                'payload' => ['required_type' => 'coder'],
                'dependencies' => [2],
            ];
        }

        if (str_contains(strtolower($command), 'api') || str_contains(strtolower($command), 'endpoint')) {
            $tasks[] = [
                'title' => 'Design API structure',
                'description' => 'Design API endpoints and contracts',
                'payload' => ['required_type' => 'architect'],
            ];
            $tasks[] = [
                'title' => 'Implement API endpoints',
                'description' => 'Write API controller and routes',
                'payload' => ['required_type' => 'coder'],
            ];
        }

        // Always add review and test tasks
        $tasks[] = [
            'title' => 'Code review',
            'description' => 'Review the implemented code',
            'payload' => ['required_type' => 'reviewer'],
        ];

        $tasks[] = [
            'title' => 'Write and run tests',
            'description' => 'Write unit and integration tests',
            'payload' => ['required_type' => 'tester'],
        ];

        return $tasks;
    }
}
