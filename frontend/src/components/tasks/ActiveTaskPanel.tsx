import React, { useMemo, useState } from "react";
import { ListTodo } from "lucide-react";
import type { Task } from "../../types/task";
import TaskCard from "./TaskCard";

interface ActiveTaskPanelProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  className?: string;
  maxHeight?: string;
}

type FilterTab = "all" | "running" | "pending" | "completed";

const ActiveTaskPanel: React.FC<ActiveTaskPanelProps> = ({
  tasks,
  onTaskClick,
  className = "",
  maxHeight = "calc(100vh - 200px)",
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const taskCounts = useMemo(() => {
    return tasks.reduce(
      (counts, task) => {
        if (task.status === "running") {
          counts.running += 1;
        }

        if (task.status === "pending") {
          counts.pending += 1;
        }

        if (task.status === "completed") {
          counts.completed += 1;
        }

        if (task.status === "failed") {
          counts.failed += 1;
        }

        return counts;
      },
      {
        total: tasks.length,
        running: 0,
        pending: 0,
        completed: 0,
        failed: 0,
      },
    );
  }, [tasks]);

  const filteredTasks = useMemo((): Task[] => {
    switch (activeFilter) {
      case "running":
        return tasks.filter((task) => task.status === "running");
      case "pending":
        return tasks.filter((task) => task.status === "pending");
      case "completed":
        return tasks.filter((task) => task.status === "completed");
      case "all":
      default:
        return tasks;
    }
  }, [activeFilter, tasks]);

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: taskCounts.total },
    { id: "running", label: "Running", count: taskCounts.running },
    { id: "pending", label: "Pending", count: taskCounts.pending },
    { id: "completed", label: "Completed", count: taskCounts.completed },
  ];

  return (
    <section
      aria-labelledby="tasks-heading"
      className={`glass-panel noise-overlay flex h-full min-h-0 flex-col rounded-lg ${className}`}
    >
      <div className="border-b border-slate-700/50 bg-slate-900/75 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListTodo
              aria-hidden="true"
              className="h-4 w-4 text-slate-300 sm:h-5 sm:w-5"
            />
            <h2
              id="tasks-heading"
              className="text-xs font-semibold text-white sm:text-sm"
            >
              Active Tasks
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {taskCounts.running}
              <span className="hidden sm:inline"> running</span>
            </span>
            {taskCounts.completed > 0 ? (
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                {taskCounts.completed}
                <span className="hidden sm:inline"> done</span>
              </span>
            ) : null}
            {taskCounts.failed > 0 ? (
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {taskCounts.failed}
                <span className="hidden sm:inline"> failed</span>
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="scrollbar-hide flex items-center gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Task filters"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              id={`tasks-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={activeFilter === tab.id}
              aria-controls="tasks-panel"
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:text-xs ${
                activeFilter === tab.id
                  ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-50"
                  : "border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div
        id="tasks-panel"
        role="tabpanel"
        aria-labelledby={`tasks-tab-${activeFilter}`}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-950/30 p-2.5 sm:space-y-3 sm:p-4"
        style={{ maxHeight }}
      >
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center sm:py-10">
            <div className="mb-2 text-3xl text-slate-500 sm:text-4xl">📋</div>
            <p className="text-sm text-slate-300">
              {activeFilter === "all" ? "No tasks" : `No ${activeFilter} tasks`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tasks will appear here when they start
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              className="shadow-sm shadow-black/10"
            />
          ))
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="border-t border-slate-700/50 bg-slate-900/60 px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 sm:text-xs">
            <span>Total: {taskCounts.total} tasks</span>
            <span>
              {Math.round((taskCounts.completed / taskCounts.total) * 100)}% complete
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ActiveTaskPanel;
