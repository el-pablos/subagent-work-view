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

  // Memoize counts to avoid recalculating on every render
  const taskCounts = useMemo(() => {
    const counts = {
      running: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      total: tasks.length,
    };

    tasks.forEach((task) => {
      if (task.status === "running") counts.running++;
      else if (task.status === "pending") counts.pending++;
      else if (task.status === "completed") counts.completed++;
      else if (task.status === "failed") counts.failed++;
    });

    return counts;
  }, [tasks]);

  // Memoize filtered tasks
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
  }, [tasks, activeFilter]);

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: taskCounts.total },
    { id: "running", label: "Running", count: taskCounts.running },
    { id: "pending", label: "Pending", count: taskCounts.pending },
    { id: "completed", label: "Completed", count: taskCounts.completed },
  ];

  return (
    <section
      aria-labelledby="tasks-heading"
      className={`glass-panel glow-border noise-overlay rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/75 px-3 py-2 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="mb-2 flex items-center justify-between sm:mb-3">
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Task count badges */}
            <span className="flex items-center text-[10px] sm:text-xs">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
              <span className="text-slate-300">
                {taskCounts.running} <span className="hidden sm:inline">running</span>
              </span>
            </span>
            {taskCounts.completed > 0 && (
              <span className="flex items-center text-[10px] sm:text-xs">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-sky-500 sm:h-2 sm:w-2" />
                <span className="text-slate-300">
                  {taskCounts.completed} <span className="hidden sm:inline">done</span>
                </span>
              </span>
            )}
            {taskCounts.failed > 0 && (
              <span className="flex items-center text-[10px] sm:text-xs">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-rose-500 sm:h-2 sm:w-2" />
                <span className="text-slate-300">
                  {taskCounts.failed} <span className="hidden sm:inline">failed</span>
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className="-mx-1 flex items-center space-x-1 overflow-x-auto px-1 pb-1 sm:space-x-2"
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
              className={`flex-shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-xs ${
                activeFilter === tab.id
                  ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-50"
                  : "border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
            >
              {tab.label}
              <span className="ml-1 opacity-75 sm:ml-1.5">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable task list */}
      <div
        id="tasks-panel"
        role="tabpanel"
        aria-labelledby={`tasks-tab-${activeFilter}`}
        className="space-y-2 overflow-y-auto bg-slate-950/30 p-2 sm:space-y-3 sm:p-4"
        style={{ maxHeight }}
      >
        {filteredTasks.length === 0 ? (
          <div className="py-6 text-center sm:py-8">
            <div className="mb-2 text-3xl text-slate-500 sm:text-4xl">📋</div>
            <p className="text-xs text-slate-300 sm:text-sm">
              {activeFilter === "all" ? "No tasks" : `No ${activeFilter} tasks`}
            </p>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              Tasks will appear here when they start
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        )}
      </div>

      {/* Footer with summary */}
      {tasks.length > 0 && (
        <div className="border-t border-slate-700/50 bg-slate-900/60 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total: {tasks.length} tasks</span>
            <span>
              {Math.round((taskCounts.completed / tasks.length) * 100)}% complete
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ActiveTaskPanel;
