import { useRelativeTime } from "../../hooks/useRelativeTime";

export interface RelativeTimeProps {
  timestamp: string | number | Date;
  className?: string;
}

export function RelativeTime({ timestamp, className }: RelativeTimeProps) {
  const relative = useRelativeTime(timestamp);
  const date = new Date(timestamp);
  const isValidDate = !Number.isNaN(date.getTime());

  return (
    <time
      dateTime={isValidDate ? date.toISOString() : undefined}
      className={className}
      title={isValidDate ? date.toLocaleString("id-ID") : undefined}
    >
      {relative}
    </time>
  );
}
