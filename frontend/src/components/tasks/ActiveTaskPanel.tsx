import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { ClipboardList } from "lucide-react";
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
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const hasOverflow = scrollHeight > clientHeight;

    setShowTopFade(hasOverflow && scrollTop > 10);
    setShowBottomFade(
      hasOverflow && scrollHeight - scrollTop - clientHeight > 10,
    );
  }, []);

  useEffect(() => {
    checkScrollPosition();
  }, [filteredTasks, checkScrollPosition]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [checkScrollPosition]);

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
      <div className="border-b border-slate-700/50 bg-slate-900/75 px-2 py-1.5 backdrop-blur-xl sm:px-3 sm:py-2">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <ClipboardList
              aria-hidden="true"
              className="h-3.5 w-3.5 text-slate-300 sm:h-4 sm:w-4"
            />
            <h2
              id="tasks-heading"
              className="text-[11px] font-semibold text-white sm:text-xs"
            >
              Active Tasks
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:gap-2 sm:text-[11px]">
            <span className="flex items-center gap-0.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {taskCounts.running}
              <span className="hidden sm:inline"> running</span>
            </span>
            {taskCounts.completed > 0 ? (
              <span className="flex items-center gap-0.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                {taskCounts.completed}
                <span className="hidden sm:inline"> done</span>
              </span>
            ) : null}
            {taskCounts.failed > 0 ? (
              <span className="flex items-center gap-0.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {taskCounts.failed}
                <span className="hidden sm:inline"> failed</span>
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="scrollbar-hide flex items-center gap-1 overflow-x-auto"
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
              className={`whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 sm:text-[11px] ${
                activeFilter === tab.id
                  ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-50"
                  : "border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* Top fade indicator */}
        {showTopFade && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-8 bg-gradient-to-b from-slate-950/80 to-transparent" />
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          id="tasks-panel"
          role="tabpanel"
          aria-labelledby={`tasks-tab-${activeFilter}`}
          className="h-full space-y-1 overflow-y-auto bg-slate-950/30 p-1.5 sm:space-y-1.5 sm:p-2"
          style={{ maxHeight }}
        >
          {filteredTasks.length === 0 ? (
            <div className="py-4 text-center sm:py-6">
              <div className="mb-1 text-2xl text-slate-500 sm:text-3xl">📋</div>
              <p className="text-xs text-slate-300">
                {activeFilter === "all"
                  ? "No tasks"
                  : `No ${activeFilter} tasks`}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
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

        {/* Bottom fade indicator */}
        {showBottomFade && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-8 bg-gradient-to-t from-slate-950/80 to-transparent" />
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="border-t border-slate-700/50 bg-slate-900/60 px-2 py-1 sm:px-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 sm:text-[11px]">
            <span>Total: {taskCounts.total} tasks</span>
            <span>
              {Math.round((taskCounts.completed / taskCounts.total) * 100)}%
              complete
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ActiveTaskPanel;
