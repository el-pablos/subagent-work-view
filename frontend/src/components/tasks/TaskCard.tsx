import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Task, TaskStatus } from "../../types/task";
import TaskProgressBar from "./TaskProgressBar";
import { fadeInUp, tapScale } from "../../lib/animations";

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
              scale: 1.01,
            }
      }
      whileTap={shouldReduceMotion ? undefined : tapScale}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 24 }
      }
      className={`rounded-lg border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl transition-colors hover:border-cyan-400/20 ${className}`}
    >
      <button
        type="button"
        onClick={() => onClick?.(task)}
        aria-label={`${task.title}, ${statusBadge.label}, ${task.progress}% progress`}
        className="w-full rounded-lg px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {/* Single line layout: title, agent, progress, status, time */}
        <div className="flex items-center gap-2">
          {/* Title */}
          <h3 className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">
            {task.title}
          </h3>

          {/* Agent avatar */}
          {task.assignedAgent && (
            <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
              {task.assignedAgent.avatar ? (
                <img
                  src={task.assignedAgent.avatar}
                  alt={task.assignedAgent.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[8px] font-medium text-slate-200">
                  {task.assignedAgent.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Progress bar - compact 4px height */}
          <div className="w-16 shrink-0">
            <TaskProgressBar
              progress={task.progress}
              status={task.status}
              showLabel={false}
              className="h-1"
            />
          </div>

          {/* Progress percentage */}
          <span className="w-7 shrink-0 text-right text-[10px] text-slate-400">
            {task.progress}%
          </span>

          {/* Status badge */}
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${statusBadge.bg} ${statusBadge.text}`}
          >
            {statusBadge.label}
          </span>

          {/* Elapsed time */}
          <span className="w-14 shrink-0 text-right text-[10px] text-slate-400">
            {elapsed}
          </span>
        </div>
      </button>
    </motion.article>
  );
};

export default TaskCard;
