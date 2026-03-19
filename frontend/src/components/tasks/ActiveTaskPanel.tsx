import React, { useState } from "react";
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

  // Filter tasks based on active tab
  const getFilteredTasks = (): Task[] => {
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
  };

  const filteredTasks = getFilteredTasks();
  const runningCount = tasks.filter((t) => t.status === "running").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: tasks.length },
    { id: "running", label: "Running", count: runningCount },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <div
      className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-100">Active Tasks</h2>
          <div className="flex items-center space-x-3">
            {/* Task count badges */}
            <span className="flex items-center text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
              <span className="text-gray-400">{runningCount} running</span>
            </span>
            {completedCount > 0 && (
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-500 mr-1" />
                <span className="text-gray-400">{completedCount} done</span>
              </span>
            )}
            {failedCount > 0 && (
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-1" />
                <span className="text-gray-400">{failedCount} failed</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeFilter === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable task list */}
      <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight }}>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 text-4xl mb-2">📋</div>
            <p className="text-gray-500 text-sm">
              {activeFilter === "all" ? "No tasks" : `No ${activeFilter} tasks`}
            </p>
            <p className="text-gray-600 text-xs mt-1">
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
        <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total: {tasks.length} tasks</span>
            <span>
              {Math.round((completedCount / tasks.length) * 100)}% complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTaskPanel;
