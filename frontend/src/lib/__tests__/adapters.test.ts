import { describe, expect, it, vi } from 'vitest';
import type {
  Agent as APIAgent,
  Message as APIMessage,
  Task as APITask,
  TaskLog as APITaskLog,
} from '../../types';
import {
  buildAgentConnections,
  buildFallbackTaskHistory,
  mapApiAgentToUI,
  mapApiMessageToUI,
  mapApiTaskLogToUIEvent,
  mapApiTaskToUI,
} from '../adapters';

describe('adapters', () => {
  it('maps agents to the UI model using the newest assigned task', () => {
    const agent: APIAgent = {
      id: 7,
      uuid: 'agent-uuid-7',
      external_id: 'external-agent-7',
      name: 'Backend Architect',
      type: 'architect',
      status: 'offline',
      current_task: 'Fallback task',
    };

    const tasks: APITask[] = [
      {
        id: 10,
        uuid: 'task-10',
        session_id: 1,
        title: 'Task lama',
        status: 'running',
        assigned_agent_id: 7,
        progress: 15,
        updated_at: '2026-01-10T12:00:00Z',
      },
      {
        id: 11,
        uuid: 'task-11',
        session_id: 1,
        title: 'Task terbaru',
        status: 'assigned',
        assigned_agent: agent,
        progress: 65,
        updated_at: '2026-01-10T12:05:00Z',
      },
    ];

    expect(mapApiAgentToUI(agent, tasks)).toEqual({
      id: '7',
      uuid: 'external-agent-7',
      name: 'Backend Architect',
      role: 'leader',
      status: 'idle',
      avatar: undefined,
      currentTask: {
        id: '11',
        title: 'Task terbaru',
        progress: 65,
      },
    });
  });

  it('maps tasks with normalized status, fallback description, and duration', () => {
    const assignedAgent: APIAgent = {
      id: 3,
      uuid: 'agent-uuid-3',
      name: 'QA Worker',
      type: 'tester',
      status: 'busy',
    };

    const task: APITask = {
      id: 22,
      uuid: 'task-22',
      session_id: 99,
      title: 'Verifikasi regresi',
      status: 'blocked',
      assignedAgent,
      progress: 80,
      started_at: '2026-01-10T12:00:00Z',
      finished_at: '2026-01-10T12:02:05Z',
      updated_at: '2026-01-10T12:02:05Z',
    };

    expect(mapApiTaskToUI(task)).toEqual({
      id: '22',
      title: 'Verifikasi regresi',
      description: 'No description available.',
      status: 'running',
      assignedAgent: {
        id: '3',
        name: 'QA Worker',
        avatar: undefined,
      },
      progress: 80,
      createdAt: '2026-01-10T12:00:00Z',
      updatedAt: '2026-01-10T12:02:05Z',
      startedAt: '2026-01-10T12:00:00Z',
      completedAt: '2026-01-10T12:02:05Z',
      duration: 125,
    });
  });

  it('maps messages and marks handoff connections as active even when they are old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const sender: APIAgent = {
      id: 1,
      uuid: 'sender-uuid',
      name: 'Planner',
      type: 'planner',
      status: 'communicating',
    };
    const recipient: APIAgent = {
      id: 2,
      uuid: 'recipient-uuid',
      external_id: 'recipient-external',
      name: 'Coder',
      type: 'coder',
      status: 'busy',
    };

    const message: APIMessage = {
      id: 5,
      session_id: 88,
      content: 'Serahkan task ke coder',
      message_type: 'thought',
      channel: 'handoff',
      timestamp: '2026-01-10T11:40:00Z',
      fromAgent: sender,
      toAgent: recipient,
    };

    const mappedMessage = mapApiMessageToUI(message);

    expect(mappedMessage).toEqual({
      id: '5',
      sessionId: '88',
      channel: 'handoff',
      type: 'agent',
      content: 'Serahkan task ke coder',
      timestamp: '2026-01-10T11:40:00Z',
      sender: {
        id: '1',
        uuid: 'sender-uuid',
        name: 'Planner',
        type: 'planner',
        avatar: undefined,
      },
      recipient: {
        id: '2',
        uuid: 'recipient-external',
        name: 'Coder',
        type: 'coder',
        avatar: undefined,
      },
    });

    expect(buildAgentConnections([mappedMessage])).toEqual([
      {
        fromId: '1',
        toId: '2',
        active: true,
      },
    ]);
  });

  it('maps task logs and builds fallback history in chronological order', () => {
    const log: APITaskLog = {
      id: 90,
      task_id: 12,
      action: 'progress',
      timestamp: '2026-01-10T12:02:00Z',
      notes: 'Sudah 40%',
      meta: {
        progress: 40,
        status: 'running',
      },
      agent: {
        id: 4,
        uuid: 'agent-uuid-4',
        name: 'Reviewer',
        type: 'reviewer',
        status: 'busy',
      },
    };

    expect(mapApiTaskLogToUIEvent(log)).toEqual({
      id: '90',
      taskId: '12',
      type: 'progress',
      timestamp: '2026-01-10T12:02:00Z',
      data: {
        progress: 40,
        status: 'running',
        agent: {
          id: '4',
          name: 'Reviewer',
        },
        message: 'Sudah 40%',
      },
    });

    const task: APITask = {
      id: 12,
      uuid: 'task-12',
      session_id: 77,
      title: 'Review hasil',
      description: 'Cek hasil akhir',
      status: 'completed',
      progress: 100,
      assigned_agent: {
        id: 4,
        uuid: 'agent-uuid-4',
        name: 'Reviewer',
        type: 'reviewer',
        status: 'busy',
      },
      queued_at: '2026-01-10T12:00:00Z',
      started_at: '2026-01-10T12:01:00Z',
      updated_at: '2026-01-10T12:02:00Z',
      finished_at: '2026-01-10T12:03:00Z',
    };

    expect(buildFallbackTaskHistory([task])).toEqual([
      {
        id: 'task-12-created',
        taskId: '12',
        type: 'created',
        timestamp: '2026-01-10T12:00:00Z',
      },
      {
        id: 'task-12-assigned',
        taskId: '12',
        type: 'assigned',
        timestamp: '2026-01-10T12:01:00Z',
        data: {
          agent: {
            id: '4',
            name: 'Reviewer',
          },
        },
      },
      {
        id: 'task-12-started',
        taskId: '12',
        type: 'started',
        timestamp: '2026-01-10T12:01:00Z',
      },
      {
        id: 'task-12-completed',
        taskId: '12',
        type: 'completed',
        timestamp: '2026-01-10T12:03:00Z',
      },
    ]);
  });
});
