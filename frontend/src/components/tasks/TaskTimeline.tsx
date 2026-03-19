import React, { useEffect, useRef, useCallback, useState } from "react";
import type { TaskHistoryEvent } from "../../types/task";
import {
  useDashboardWebSocket,
  type TaskUpdatedEvent,
} from "../../hooks/useWebSocket";

interface TaskTimelineProps {
  events: TaskHistoryEvent[];
  taskId?: string; // Optional: for realtime updates to specific task
  className?: string;
  autoScroll?: boolean; // Auto-scroll to latest event
  onEventUpdate?: (events: TaskHistoryEvent[]) => void; // Callback for realtime updates
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
        bg: "bg-gray-700",
        border: "border-gray-400",
        text: "text-gray-400",
      };
    case "assigned":
      return {
        bg: "bg-purple-900/50",
        border: "border-purple-400",
        text: "text-purple-400",
      };
    case "started":
      return {
        bg: "bg-emerald-900/50",
        border: "border-emerald-400",
        text: "text-emerald-400",
      };
    case "progress":
      return {
        bg: "bg-cyan-900/50",
        border: "border-cyan-400",
        text: "text-cyan-400",
      };
    case "completed":
      return {
        bg: "bg-sky-900/50",
        border: "border-sky-400",
        text: "text-sky-400",
      };
    case "failed":
      return {
        bg: "bg-rose-900/50",
        border: "border-rose-400",
        text: "text-rose-400",
      };
    case "status_change":
      return {
        bg: "bg-amber-900/50",
        border: "border-amber-400",
        text: "text-amber-400",
      };
    default:
      return {
        bg: "bg-gray-700",
        border: "border-gray-400",
        text: "text-gray-400",
      };
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
  taskId,
  className = "",
  autoScroll = true,
  onEventUpdate,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [localEvents, setLocalEvents] = useState<TaskHistoryEvent[]>(events);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null,
  );

  // Update local events when props change
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  // Auto-scroll to latest event
  const scrollToLatest = useCallback(() => {
    if (autoScroll && timelineRef.current) {
      const scrollContainer = timelineRef.current.querySelector(
        ".overflow-x-auto",
      ) as HTMLElement;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          left: scrollContainer.scrollWidth,
          behavior: "smooth",
        });
      }
    }
  }, [autoScroll]);

  // Subscribe to WebSocket task updates
  useDashboardWebSocket({
    onTaskUpdated: useCallback(
      (event: TaskUpdatedEvent) => {
        // Filter updates for this specific task if taskId is provided
        if (taskId && event.task.id !== taskId) return;

        // Create new timeline event from task update
        const newEvent: TaskHistoryEvent = {
          id: `event-${Date.now()}`,
          taskId: event.task.id,
          type: "progress",
          timestamp: new Date().toISOString(),
          data: {
            progress: event.task.progress,
            status: event.task.status,
            agent: event.task.assignedAgent
              ? {
                  id: event.task.assignedAgent.id,
                  name: event.task.assignedAgent.name,
                }
              : undefined,
          },
        };

        // Update local events
        setLocalEvents((prevEvents) => {
          const updatedEvents = [...prevEvents, newEvent];
          onEventUpdate?.(updatedEvents);
          return updatedEvents;
        });

        // Highlight the new event
        setHighlightedEventId(newEvent.id);
        setTimeout(() => setHighlightedEventId(null), 2000);

        // Scroll to latest
        setTimeout(scrollToLatest, 100);
      },
      [taskId, onEventUpdate, scrollToLatest],
    ),
  });

  // Auto-scroll on mount and when events change
  useEffect(() => {
    scrollToLatest();
  }, [scrollToLatest]);

  if (localEvents.length === 0) {
    return (
      <div className={`text-gray-500 text-sm text-center py-4 ${className}`}>
        No timeline events
      </div>
    );
  }

  return (
    <div ref={timelineRef} className={`relative ${className}`}>
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto pb-4 scroll-smooth">
        <div className="flex items-start min-w-max px-4">
          {localEvents.map((event, index) => {
            const eventColor = getEventColor(event.type);
            const duration = calculateDuration(localEvents, index);
            const isLast = index === localEvents.length - 1;
            const isHighlighted = event.id === highlightedEventId;
            const isRunning =
              event.type === "started" || event.type === "progress";

            return (
              <div key={event.id} className="flex items-center">
                {/* Event node */}
                <div className="flex flex-col items-center">
                  {/* Event circle */}
                  <div
                    className={`relative w-10 h-10 rounded-full ${eventColor.bg} border-2 ${eventColor.border} flex items-center justify-center ${eventColor.text} text-sm font-medium z-10 transition-all duration-300 hover:scale-110 ${
                      isHighlighted ? "scale-125 ring-4 ring-cyan-400/50" : ""
                    }`}
                  >
                    {getEventIcon(event.type)}
                    {/* Pulse animation for running tasks */}
                    {isLast && isRunning && (
                      <>
                        <div
                          className={`absolute inset-0 rounded-full ${eventColor.border} border-2 animate-ping opacity-30`}
                        />
                        <div
                          className={`absolute inset-0 rounded-full ${eventColor.bg} animate-pulse`}
                        />
                      </>
                    )}
                  </div>

                  {/* Event label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-medium ${eventColor.text} ${
                        isHighlighted ? "animate-pulse" : ""
                      }`}
                    >
                      {formatEventLabel(event)}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatTimestamp(event.timestamp)}
                    </p>
                    {/* Agent info */}
                    {event.data?.agent && (
                      <div className="flex items-center justify-center mt-1">
                        <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center mr-1">
                          <span className="text-[8px] text-gray-300">
                            {event.data.agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {event.data.agent.name}
                        </span>
                      </div>
                    )}
                    {/* Live indicator for last running event */}
                    {isLast && isRunning && (
                      <div className="flex items-center justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                        <span className="text-[10px] text-emerald-400 font-medium">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection line */}
                {!isLast && (
                  <div className="flex flex-col items-center mx-2">
                    <div className="h-0.5 w-16 bg-gradient-to-r from-gray-600 to-gray-700 relative">
                      {/* Arrow */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gray-600 border-y-[4px] border-y-transparent" />
                    </div>
                    {/* Duration label */}
                    {duration && (
                      <span className="text-[10px] text-gray-600 mt-1">
                        +{duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time markers at the bottom */}
      {localEvents.length >= 2 && (
        <div className="flex justify-between px-4 mt-2 border-t border-gray-800 pt-2">
          <div className="text-xs text-gray-600">
            Start: {formatTimestamp(localEvents[0].timestamp)}
          </div>
          <div className="text-xs text-gray-600">
            Latest:{" "}
            {formatTimestamp(localEvents[localEvents.length - 1].timestamp)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTimeline;
