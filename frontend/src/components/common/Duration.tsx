import React, { useState, useEffect } from "react";

export interface DurationProps {
  startTime: Date | string | number;
  endTime?: Date | string | number | null;
  live?: boolean;
  format?: "short" | "long" | "compact";
  style?: React.CSSProperties;
  className?: string;
}

const formatDuration = (
  ms: number,
  format: "short" | "long" | "compact",
): string => {
  if (ms < 0) ms = 0;

  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  switch (format) {
    case "compact":
      // e.g., "1:23:45" or "23:45"
      if (days > 0) {
        return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;

    case "long":
      // e.g., "1 hari 2 jam 23 menit 45 detik"
      const longParts: string[] = [];
      if (days > 0) longParts.push(`${days} hari`);
      if (hours > 0) longParts.push(`${hours} jam`);
      if (minutes > 0) longParts.push(`${minutes} menit`);
      if (seconds > 0 || longParts.length === 0)
        longParts.push(`${seconds} detik`);
      return longParts.join(" ");

    case "short":
    default:
      // e.g., "1j 23m 45d"
      const shortParts: string[] = [];
      if (days > 0) shortParts.push(`${days}h`);
      if (hours > 0) shortParts.push(`${hours}j`);
      if (minutes > 0) shortParts.push(`${minutes}m`);
      if (seconds > 0 || shortParts.length === 0)
        shortParts.push(`${seconds}d`);
      return shortParts.join(" ");
  }
};

const Duration: React.FC<DurationProps> = ({
  startTime,
  endTime = null,
  live = true,
  format = "short",
  style,
  className,
}) => {
  const [duration, setDuration] = useState(() => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    return formatDuration(end - start, format);
  });

  useEffect(() => {
    const calculateDuration = () => {
      const start = new Date(startTime).getTime();
      const end = endTime ? new Date(endTime).getTime() : Date.now();
      setDuration(formatDuration(end - start, format));
    };

    // Calculate immediately
    calculateDuration();

    // Only set up interval if live counting is enabled and no end time
    if (live && !endTime) {
      const interval = setInterval(calculateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime, live, format]);

  const isLive = live && !endTime;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
      className={className}
    >
      {isLive && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
      {duration}
      {isLive && (
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      )}
    </span>
  );
};

export default Duration;
