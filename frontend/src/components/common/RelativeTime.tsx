import React, { useState, useEffect } from "react";

export interface RelativeTimeProps {
  timestamp: Date | string | number;
  updateInterval?: number;
  style?: React.CSSProperties;
  className?: string;
}

const getRelativeTime = (timestamp: Date | string | number): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // Future dates
  if (diffMs < 0) {
    const futureSec = Math.abs(diffSec);
    const futureMin = Math.abs(diffMin);
    const futureHour = Math.abs(diffHour);
    const futureDay = Math.abs(diffDay);

    if (futureSec < 60) return "dalam beberapa detik";
    if (futureMin < 60) return `dalam ${futureMin} menit`;
    if (futureHour < 24) return `dalam ${futureHour} jam`;
    if (futureDay < 7) return `dalam ${futureDay} hari`;
    return `dalam ${Math.floor(futureDay / 7)} minggu`;
  }

  // Past dates
  if (diffSec < 5) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  if (diffMin === 1) return "1 menit lalu";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour === 1) return "1 jam lalu";
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffWeek === 1) return "1 minggu lalu";
  if (diffWeek < 4) return `${diffWeek} minggu lalu`;
  if (diffMonth === 1) return "1 bulan lalu";
  if (diffMonth < 12) return `${diffMonth} bulan lalu`;
  if (diffYear === 1) return "1 tahun lalu";
  return `${diffYear} tahun lalu`;
};

const RelativeTime: React.FC<RelativeTimeProps> = ({
  timestamp,
  updateInterval = 30000, // Update every 30 seconds by default
  style,
  className,
}) => {
  const [relativeTime, setRelativeTime] = useState(() =>
    getRelativeTime(timestamp),
  );

  useEffect(() => {
    // Update immediately when timestamp changes
    setRelativeTime(getRelativeTime(timestamp));

    // Set up interval for auto-update
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [timestamp, updateInterval]);

  const fullDate = new Date(timestamp).toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      title={fullDate}
      style={{
        cursor: "help",
        ...style,
      }}
      className={className}
    >
      {relativeTime}
    </time>
  );
};

export default RelativeTime;
