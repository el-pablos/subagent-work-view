import { useRef, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { MessageChannel } from "./types";

interface MessageFilterProps {
  selectedChannel: MessageChannel | "all";
  onChannelChange: (channel: MessageChannel | "all") => void;
  messageCounts?: Partial<Record<MessageChannel | "all", number>>;
  ariaLabel?: string;
  className?: string;
}

const FILTER_TABS: Array<{
  value: MessageChannel | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "handoff", label: "Handoff" },
  { value: "alert", label: "Alert" },
];

/**
 * MessageFilter - Tab-based channel filter
 *
 * Features:
 * - Tab buttons for All, General, Handoff, Alert channels
 * - ARIA tab semantics with keyboard navigation
 * - Sliding underline indicator with reduced motion support
 * - Dark theme styling and optional message counts
 */
export function MessageFilter({
  selectedChannel,
  onChannelChange,
  messageCounts = {},
  ariaLabel = "Message channels",
  className = "",
}: MessageFilterProps) {
  const shouldReduceMotion = useReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveToTab = (index: number) => {
    const nextTab = FILTER_TABS[index];

    if (!nextTab) {
      return;
    }

    onChannelChange(nextTab.value);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToTab((index + 1) % FILTER_TABS.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToTab((index - 1 + FILTER_TABS.length) % FILTER_TABS.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveToTab(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      moveToTab(FILTER_TABS.length - 1);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]",
        className,
      )}
    >
      {FILTER_TABS.map((tab, index) => {
        const isActive = selectedChannel === tab.value;
        const count = messageCounts[tab.value];

        return (
          <button
            key={tab.value}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChannelChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "relative flex min-h-9 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              isActive
                ? "bg-slate-900 text-slate-50"
                : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-200",
            )}
          >
            <span className="pointer-events-none absolute inset-x-2 bottom-1 h-0.5">
              {isActive &&
                (shouldReduceMotion ? (
                  <span className="block h-full rounded-full bg-cyan-400" />
                ) : (
                  <motion.span
                    layoutId="message-filter-active-indicator"
                    className="block h-full rounded-full bg-cyan-400"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 34,
                      mass: 0.6,
                    }}
                  />
                ))}
            </span>

            <span className="relative z-10">{tab.label}</span>

            {typeof count === "number" && (
              <span
                className={cn(
                  "relative z-10 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "border-cyan-400/20 bg-cyan-400/15 text-cyan-200"
                    : "border-slate-700 bg-slate-800 text-slate-400",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default MessageFilter;
