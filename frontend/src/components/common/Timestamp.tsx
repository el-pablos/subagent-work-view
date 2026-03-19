import React, { useState } from "react";

export interface TimestampProps {
  timestamp: Date | string | number;
  format?: "date" | "time" | "datetime" | "full";
  locale?: string;
  showTooltip?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const formatTimestamp = (
  timestamp: Date | string | number,
  format: "date" | "time" | "datetime" | "full",
  locale: string,
): string => {
  const date = new Date(timestamp);

  switch (format) {
    case "date":
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    case "time":
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    case "full":
      return date.toLocaleString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    case "datetime":
    default:
      return date.toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }
};

const getFullDate = (timestamp: Date | string | number, locale: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

const Timestamp: React.FC<TimestampProps> = ({
  timestamp,
  format = "datetime",
  locale = "id-ID",
  showTooltip = true,
  style,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formattedTime = formatTimestamp(timestamp, format, locale);
  const fullDate = getFullDate(timestamp, locale);

  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      title={showTooltip ? fullDate : undefined}
      style={{
        position: "relative",
        cursor: showTooltip ? "help" : "default",
        ...style,
      }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {formattedTime}
      {showTooltip && isHovered && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 10px",
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            fontSize: "12px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            pointerEvents: "none",
          }}
        >
          {fullDate}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor: "#1e293b transparent transparent transparent",
            }}
          />
        </span>
      )}
    </time>
  );
};

export default Timestamp;
