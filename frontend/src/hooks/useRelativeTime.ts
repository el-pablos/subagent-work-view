import { useEffect, useState } from "react";

export function useRelativeTime(
  timestamp: string | number | Date,
  interval = 1000,
): string {
  const [relative, setRelative] = useState(() => formatRelative(timestamp));

  useEffect(() => {
    setRelative(formatRelative(timestamp));

    const timer = window.setInterval(() => {
      setRelative(formatRelative(timestamp));
    }, interval);

    return () => window.clearInterval(timer);
  }, [timestamp, interval]);

  return relative;
}

function formatRelative(timestamp: string | number | Date): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();

  if (Number.isNaN(then)) {
    return "—";
  }

  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);

  if (seconds < 5) return "baru saja";
  if (seconds < 60) return `${seconds}d lalu`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;

  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}
