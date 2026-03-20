import React, { useId } from "react";
import { RelativeTime } from "../common/RelativeTime";
import { cn } from "../../lib/utils";
import type { TaskHistoryEvent } from "../../types/task";

export interface TaskTimelineProps {
  events: TaskHistoryEvent[];
  className?: string;
  activeEventId?: string;
}

const getEventColor = (type: TaskHistoryEvent["type"]): string => {
  switch (type) {
    case "created":
      return "bg-slate-400";
    case "assigned":
      return "bg-violet-400";
    case "started":
      return "bg-emerald-400";
    case "progress":
      return "bg-cyan-400";
    case "completed":
      return "bg-sky-400";
    case "failed":
      return "bg-rose-400";
    case "status_change":
      return "bg-amber-400";
    default:
      return "bg-slate-400";
  }
};

const formatEventLabel = (event: TaskHistoryEvent): string => {
  switch (event.type) {
    case "created":
      return "Created";
    case "assigned":
      return `Assigned${event.data?.agent ? ` → ${event.data.agent.name}` : ""}`;
    case "started":
      return "Started";
    case "progress":
      return `Progress ${event.data?.progress || 0}%`;
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "status_change":
      return event.data?.status || "Status changed";
    default:
      return "Event";
  }
};

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  events,
  className = "",
  activeEventId,
}) => {
  const titleId = useId();

  if (events.length === 0) {
    return (
      <section aria-labelledby={titleId} className={cn("py-2", className)}>
        <h3 id={titleId} className="sr-only">
          Task timeline
        </h3>
        <p className="text-xs text-slate-500">No events</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={titleId} className={cn("", className)}>
      <h3 id={titleId} className="sr-only">
        Task timeline
      </h3>

      <ul className="space-y-0.5">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const isActive = activeEventId ? event.id === activeEventId : isLast;

          return (
            <li key={event.id} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  getEventColor(event.type),
                  isActive && "ring-1 ring-offset-1 ring-offset-slate-900",
                )}
                aria-hidden="true"
              />
              <span className="text-slate-300">{formatEventLabel(event)}</span>
              <span className="text-slate-600">·</span>
              <RelativeTime
                timestamp={event.timestamp}
                className="text-slate-500"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TaskTimeline;
