import React from "react";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  decorative?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  color = "#3b82f6",
  backgroundColor = "#e5e7eb",
  showPercentage = true,
  animated = true,
  decorative = false,
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  // Center position
  const center = size / 2;

  return (
    <div
      role={decorative ? undefined : "progressbar"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : "Task progress"}
      aria-valuenow={decorative ? undefined : Math.round(normalizedProgress)}
      aria-valuemin={decorative ? undefined : 0}
      aria-valuemax={decorative ? undefined : 100}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
        }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: animated ? "stroke-dashoffset 0.5s ease" : "none",
          }}
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: `${size * 0.25}px`,
              fontWeight: 600,
              color: "#1e293b",
            }}
          >
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
