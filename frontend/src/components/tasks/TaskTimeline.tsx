import React, { useId } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { RelativeTime } from "../common/RelativeTime";
import { cn } from "../../lib/utils";
import type { TaskHistoryEvent } from "../../types/task";

export interface TaskTimelineProps {
  events: TaskHistoryEvent[];
  className?: string;
  activeEventId?: string;
  scrollAriaLabel?: string;
}

const getEventIcon = (type: TaskHistoryEvent["type"]): string => {
  switch (type) {
    case "created":
      return "●";
    case "assigned":
      return "◉";
    case "started":
      return "▶";
    case "progress":
      return "◐";
    case "completed":
      return "✓";
    case "failed":
      return "✗";
    case "status_change":
      return "↻";
    default:
      return "●";
  }
};

const getEventColor = (
  type: TaskHistoryEvent["type"],
): { bg: string; border: string; text: string } => {
  switch (type) {
    case "created":
      return {
        bg: "bg-slate-800/80",
        border: "border-slate-400",
        text: "text-slate-300",
      };
    case "assigned":
      return {
        bg: "bg-violet-950/70",
        border: "border-violet-400",
        text: "text-violet-300",
      };
    case "started":
      return {
        bg: "bg-emerald-950/70",
        border: "border-emerald-400",
        text: "text-emerald-300",
      };
    case "progress":
      return {
        bg: "bg-cyan-950/70",
        border: "border-cyan-400",
        text: "text-cyan-300",
      };
    case "completed":
      return {
        bg: "bg-sky-950/70",
        border: "border-sky-400",
        text: "text-sky-300",
      };
    case "failed":
      return {
        bg: "bg-rose-950/70",
        border: "border-rose-400",
        text: "text-rose-300",
      };
    case "status_change":
      return {
        bg: "bg-amber-950/70",
        border: "border-amber-400",
        text: "text-amber-300",
      };
    default:
      return {
        bg: "bg-slate-800/80",
        border: "border-slate-400",
        text: "text-slate-300",
      };
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatEventLabel = (event: TaskHistoryEvent): string => {
  switch (event.type) {
    case "created":
      return "Created";
    case "assigned":
      return "Assigned";
    case "started":
      return "Started";
    case "progress":
      return `${event.data?.progress || 0}%`;
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "status_change":
      return event.data?.status || "Changed";
    default:
      return "Event";
  }
};

const calculateDuration = (
  events: TaskHistoryEvent[],
  currentIndex: number,
): string | null => {
  if (currentIndex === 0) return null;

  const currentTime = new Date(events[currentIndex].timestamp).getTime();
  const previousTime = new Date(events[currentIndex - 1].timestamp).getTime();
  const diffMs = currentTime - previousTime;

  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s`;
  return `${Math.floor(diffMs / 60000)}m`;
};

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  events,
  className = "",
  activeEventId,
  scrollAriaLabel = "Task timeline events",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const titleId = useId();

  if (events.length === 0) {
    return (
      <section aria-labelledby={titleId} className={cn("py-4", className)}>
        <h3 id={titleId} className="sr-only">
          Task timeline
        </h3>
        <div className="text-center text-sm text-slate-400">
          No timeline events
        </div>
      </section>
    );
  }

  const motionContainer: {
    initial?: "hidden";
    animate?: "visible";
    variants?: Variants;
  } = shouldReduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.06,
            },
          },
        },
      };

  const itemVariants: Variants | undefined = shouldReduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, x: -20 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
        },
      };

  return (
    <section aria-labelledby={titleId} className={cn("relative", className)}>
      <h3 id={titleId} className="sr-only">
        Task timeline
      </h3>

      <div
        tabIndex={0}
        aria-label={scrollAriaLabel}
        className="overflow-x-auto pb-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <motion.ol
          className="flex min-w-max snap-x snap-mandatory items-start gap-3 px-4 sm:gap-4"
          {...motionContainer}
        >
          {events.map((event, index) => {
            const eventColor = getEventColor(event.type);
            const duration = calculateDuration(events, index);
            const isLast = index === events.length - 1;
            const isActive = activeEventId
              ? event.id === activeEventId
              : isLast;

            return (
              <motion.li
                key={event.id}
                variants={itemVariants}
                className="flex snap-start items-start"
              >
                <div className="flex min-w-[120px] max-w-[148px] flex-col items-center rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-3 text-center shadow-[0_12px_30px_-24px_rgba(34,211,238,0.4)] backdrop-blur-sm">
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-transform",
                      eventColor.bg,
                      eventColor.border,
                      eventColor.text,
                    )}
                  >
                    <span aria-hidden="true">{getEventIcon(event.type)}</span>

                    {isActive && (
                      <>
                        <motion.span
                          aria-hidden="true"
                          className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.18)]"
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  scale: [1, 1.3, 1],
                                  opacity: [0.8, 1, 0.8],
                                  boxShadow: [
                                    "0 0 0 0 rgba(103,232,249,0.35)",
                                    "0 0 0 8px rgba(103,232,249,0)",
                                    "0 0 0 0 rgba(103,232,249,0.35)",
                                  ],
                                }
                          }
                          transition={{
                            duration: shouldReduceMotion ? 0 : 1.8,
                            repeat: shouldReduceMotion ? 0 : Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <span className="sr-only">Active event</span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 space-y-1">
                    <span className={cn("text-xs font-semibold", eventColor.text)}>
                      {formatEventLabel(event)}
                    </span>
                    <RelativeTime
                      timestamp={event.timestamp}
                      className="block text-xs text-slate-300"
                    />
                    <p className="text-[11px] text-slate-500">
                      {formatTimestamp(event.timestamp)}
                    </p>

                    {event.data?.agent && (
                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[9px] font-semibold text-slate-100">
                          {event.data.agent.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-[11px] text-slate-300">
                          {event.data.agent.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div className="mx-2 mt-5 flex flex-col items-center sm:mx-3">
                    <div className="relative h-0.5 w-12 shrink-0 bg-gradient-to-r from-slate-500 to-slate-700 sm:w-16">
                      <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-l-[6px] border-y-transparent border-l-slate-500" />
                    </div>
                    {duration && (
                      <span className="mt-1 text-[10px] font-medium text-slate-400">
                        +{duration}
                      </span>
                    )}
                  </div>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </div>

      {events.length >= 2 && (
        <div className="mt-2 flex justify-between border-t border-slate-800 px-4 pt-2">
          <div className="text-xs text-slate-400">
            Start: {formatTimestamp(events[0].timestamp)}
          </div>
          <div className="text-xs text-slate-400">
            Latest: {formatTimestamp(events[events.length - 1].timestamp)}
          </div>
        </div>
      )}
    </section>
  );
};

export default TaskTimeline;
