import { useState, useEffect, useRef } from "react";

export interface UseRelativeTimeOptions {
  updateInterval?: number; // in milliseconds, default 1000
  enabled?: boolean;
}

export interface RelativeTimeResult {
  relativeTime: string;
  absoluteTime: string;
}

/**
 * Hook untuk menampilkan waktu relatif (misal: "2 menit yang lalu")
 * yang secara otomatis update setiap interval tertentu.
 */
export function useRelativeTime(
  timestamp: Date | string | number | null | undefined,
  options: UseRelativeTimeOptions = {}
): RelativeTimeResult {
  const { updateInterval = 1000, enabled = true } = options;
  const [, forceUpdate] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !timestamp) {
      return;
    }

    // Force update setiap interval
    intervalRef.current = window.setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timestamp, updateInterval, enabled]);

  if (!timestamp) {
    return {
      relativeTime: "—",
      absoluteTime: "—",
    };
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return {
      relativeTime: "—",
      absoluteTime: "—",
    };
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relativeTime: string;

  if (diffSec < 5) {
    relativeTime = "baru saja";
  } else if (diffSec < 60) {
    relativeTime = `${diffSec} detik yang lalu`;
  } else if (diffMin < 60) {
    relativeTime = `${diffMin} menit yang lalu`;
  } else if (diffHour < 24) {
    relativeTime = `${diffHour} jam yang lalu`;
  } else if (diffDay < 7) {
    relativeTime = `${diffDay} hari yang lalu`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    relativeTime = `${weeks} minggu yang lalu`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    relativeTime = `${months} bulan yang lalu`;
  } else {
    const years = Math.floor(diffDay / 365);
    relativeTime = `${years} tahun yang lalu`;
  }

  const absoluteTime = date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    relativeTime,
    absoluteTime,
  };
}
