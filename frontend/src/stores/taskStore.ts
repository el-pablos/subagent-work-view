import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { immer } from "zustand/middleware/immer";
import { Task, TaskStatus } from "../types";

interface TaskState {
  tasks: Record<number, Task>;
}

interface TaskActions {
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  updateTaskPartial: (id: number, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (id: number) => void;
  getTask: (id: number) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksBySession: (sessionId: number) => Task[];
  getTasksByAgent: (agentId: number) => Task[];
  clearTasks: () => void;
}

const initialState: TaskState = {
  tasks: {},
};

export const useTaskStore = create<TaskState & TaskActions>()(
  immer((set, get) => ({
    ...initialState,

    setTasks: (tasks) =>
      set((state) => {
        state.tasks = {};
        tasks.forEach((task) => {
          state.tasks[task.id] = task;
        });
      }),

    updateTask: (task) =>
      set((state) => {
        state.tasks[task.id] = task;
      }),

    updateTaskPartial: (id, updates) =>
      set((state) => {
        if (state.tasks[id]) {
          state.tasks[id] = { ...state.tasks[id], ...updates };
        }
      }),

    addTask: (task) =>
      set((state) => {
        state.tasks[task.id] = task;
      }),

    removeTask: (id) =>
      set((state) => {
        delete state.tasks[id];
      }),

    getTask: (id) => {
      const state = get();
      return state.tasks[id];
    },

    getTasksByStatus: (status) => {
      const state = get();
      return Object.values(state.tasks).filter(
        (task) => task.status === status,
      );
    },

    getTasksBySession: (sessionId) => {
      const state = get();
      return Object.values(state.tasks).filter(
        (task) => task.session_id === sessionId,
      );
    },

    getTasksByAgent: (agentId) => {
      const state = get();
      return Object.values(state.tasks).filter(
        (task) => task.assigned_agent_id === agentId,
      );
    },

    clearTasks: () =>
      set((state) => {
        state.tasks = {};
      }),
  })),
);
