import React from "react";
import { useRelativeTime, type UseRelativeTimeOptions } from "../../hooks/useRelativeTime";
import { cn } from "../../lib/utils";

export interface RelativeTimeProps extends UseRelativeTimeOptions {
  timestamp: Date | string | number | null | undefined;
  className?: string;
  showAbsolute?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Komponen untuk menampilkan waktu relatif dengan tooltip absolute time.
 * Auto-update setiap detik.
 */
export const RelativeTime: React.FC<RelativeTimeProps> = ({
  timestamp,
  className,
  showAbsolute = true,
  prefix = "",
  suffix = "",
  updateInterval,
  enabled,
}) => {
  const { relativeTime, absoluteTime } = useRelativeTime(timestamp, {
    updateInterval,
    enabled,
  });

  const displayText = `${prefix}${relativeTime}${suffix}`.trim();

  if (!showAbsolute) {
    return (
      <span className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
        {displayText}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400 cursor-help",
        className
      )}
      title={absoluteTime}
      aria-label={`${displayText} (${absoluteTime})`}
    >
      {displayText}
    </span>
  );
};
