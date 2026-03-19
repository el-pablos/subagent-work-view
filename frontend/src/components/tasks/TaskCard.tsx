import React, { useState, useEffect } from "react";
import type { Task, TaskStatus } from "../../types/task";
import TaskProgressBar from "./TaskProgressBar";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  className?: string;
}

const getStatusBadge = (
  status: TaskStatus,
): { bg: string; text: string; label: string } => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-sky-500/20",
        text: "text-sky-400",
        label: "Completed",
      };
    case "running":
      return {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        label: "Running",
      };
    case "failed":
      return { bg: "bg-rose-500/20", text: "text-rose-400", label: "Failed" };
    case "pending":
      return {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        label: "Pending",
      };
    default:
      return { bg: "bg-gray-500/20", text: "text-gray-400", label: "Unknown" };
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return "-";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatElapsedTime = (startedAt?: string): string => {
  if (!startedAt) return "-";
  const startTime = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsedMs = now - startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m ago`;
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  className = "",
}) => {
  const statusBadge = getStatusBadge(task.status);
  const [elapsed, setElapsed] = useState(formatElapsedTime(task.startedAt));

  // Update elapsed time every second for running tasks
  useEffect(() => {
    if (task.status !== "running" || !task.startedAt) return;

    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(task.startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [task.status, task.startedAt]);

  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer ${className}`}
      onClick={() => onClick?.(task)}
    >
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-100 truncate flex-1 mr-2">
          {task.title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assigned Agent */}
      {task.assignedAgent && (
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden mr-2">
            {task.assignedAgent.avatar ? (
              <img
                src={task.assignedAgent.avatar}
                alt={task.assignedAgent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-300">
                {task.assignedAgent.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {task.assignedAgent.name}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <TaskProgressBar
        progress={task.progress}
        status={task.status}
        showLabel={true}
        className="mb-3"
      />

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Started: {task.startedAt ? formatTimestamp(task.startedAt) : "-"}
        </span>
        <span className="text-gray-400 font-medium">{elapsed}</span>
      </div>
    </div>
  );
};

export default TaskCard;
