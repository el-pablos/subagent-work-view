import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Task, TaskStatus } from "../../types/task";
import TaskProgressBar from "./TaskProgressBar";
import { fadeInUp, hoverScale, tapScale } from "../../lib/animations";

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
  const shouldReduceMotion = useReducedMotion();
  const statusBadge = getStatusBadge(task.status);
  const [elapsed, setElapsed] = useState(formatElapsedTime(task.startedAt));

  useEffect(() => {
    if (task.status !== "running" || !task.startedAt) return;

    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(task.startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [task.status, task.startedAt]);

  return (
    <motion.article
      layout={!shouldReduceMotion}
      variants={shouldReduceMotion ? undefined : fadeInUp}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? { opacity: 1, y: 0 } : "show"}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              ...hoverScale,
              y: -4,
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.25)",
            }
      }
      whileTap={shouldReduceMotion ? undefined : tapScale}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 24 }
      }
      className={`glow-border min-h-[48px] rounded-xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl transition-colors hover:border-cyan-400/20 ${className}`}
    >
      <button
        type="button"
        onClick={() => onClick?.(task)}
        aria-label={`${task.title}, ${statusBadge.label}, ${task.progress}% progress`}
        className="min-h-[48px] w-full rounded-xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <div className="mb-2 flex items-start justify-between">
          <h3 className="mr-2 flex-1 truncate text-sm font-medium text-white">
            {task.title}
          </h3>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
          >
            {statusBadge.label}
          </span>
        </div>

        {task.description && (
          <p className="mb-3 line-clamp-2 text-xs text-slate-300">{task.description}</p>
        )}

        {task.assignedAgent && (
          <div className="mb-3 flex items-center">
            <div className="mr-2 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-slate-700">
              {task.assignedAgent.avatar ? (
                <img
                  src={task.assignedAgent.avatar}
                  alt={task.assignedAgent.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-slate-200">
                  {task.assignedAgent.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-300">{task.assignedAgent.name}</span>
          </div>
        )}

        <TaskProgressBar
          progress={task.progress}
          status={task.status}
          showLabel={true}
          className="mb-3"
        />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Started: {task.startedAt ? formatTimestamp(task.startedAt) : "-"}</span>
          <span className="font-medium text-slate-300">{elapsed}</span>
        </div>
      </button>
    </motion.article>
  );
};

export default TaskCard;
