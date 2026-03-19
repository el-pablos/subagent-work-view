import React from "react";

export type ProgressBarVariant = "default" | "striped" | "gradient";
export type ProgressBarSize = "xs" | "sm" | "md" | "lg";
export type ProgressBarColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "cyan";

interface ProgressBarProps {
  /** Progress value 0-100, ignored when indeterminate */
  progress?: number;
  /** Visual variant */
  variant?: ProgressBarVariant;
  /** Bar size */
  size?: ProgressBarSize;
  /** Color theme */
  color?: ProgressBarColor;
  /** Enable indeterminate loading animation */
  indeterminate?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: "inside" | "outside" | "top";
  /** Enable smooth animation */
  animated?: boolean;
  /** Custom class name */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

const getHeightBySize = (size: ProgressBarSize): number => {
  switch (size) {
    case "xs":
      return 4;
    case "sm":
      return 8;
    case "md":
      return 12;
    case "lg":
      return 20;
    default:
      return 12;
  }
};

const getColorStyles = (
  color: ProgressBarColor,
): { primary: string; secondary: string; gradient: string } => {
  switch (color) {
    case "blue":
      return {
        primary: "#3b82f6",
        secondary: "#60a5fa",
        gradient:
          "linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
      };
    case "green":
      return {
        primary: "#22c55e",
        secondary: "#4ade80",
        gradient:
          "linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #86efac 100%)",
      };
    case "red":
      return {
        primary: "#ef4444",
        secondary: "#f87171",
        gradient:
          "linear-gradient(90deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)",
      };
    case "yellow":
      return {
        primary: "#eab308",
        secondary: "#facc15",
        gradient:
          "linear-gradient(90deg, #eab308 0%, #facc15 50%, #fde047 100%)",
      };
    case "purple":
      return {
        primary: "#a855f7",
        secondary: "#c084fc",
        gradient:
          "linear-gradient(90deg, #a855f7 0%, #c084fc 50%, #d8b4fe 100%)",
      };
    case "cyan":
      return {
        primary: "#06b6d4",
        secondary: "#22d3ee",
        gradient:
          "linear-gradient(90deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)",
      };
    default:
      return {
        primary: "#3b82f6",
        secondary: "#60a5fa",
        gradient:
          "linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
      };
  }
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  variant = "default",
  size = "md",
  color = "blue",
  indeterminate = false,
  showLabel = false,
  labelPosition = "outside",
  animated = true,
  className = "",
  ariaLabel,
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const height = getHeightBySize(size);
  const colorStyles = getColorStyles(color);

  const getBarBackground = (): string => {
    if (variant === "gradient") {
      return colorStyles.gradient;
    }
    return colorStyles.primary;
  };

  const stripedBackground = `
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.15) 10px,
      rgba(255, 255, 255, 0.15) 20px
    )
  `;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  };

  const trackStyle: React.CSSProperties = {
    position: "relative",
    flex: 1,
    height: `${height}px`,
    backgroundColor: "#e5e7eb",
    borderRadius: `${height / 2}px`,
    overflow: "hidden",
  };

  const fillStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: indeterminate ? "30%" : `${normalizedProgress}%`,
    background: getBarBackground(),
    borderRadius: `${height / 2}px`,
    transition: animated && !indeterminate ? "width 0.5s ease-out" : "none",
    ...(variant === "striped" && {
      backgroundImage: stripedBackground,
      backgroundSize: "40px 40px",
    }),
  };

  const labelStyle: React.CSSProperties = {
    fontSize: size === "xs" || size === "sm" ? "11px" : "12px",
    fontWeight: 600,
    color: "#64748b",
    whiteSpace: "nowrap",
  };

  const insideLabelStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "10px",
    fontWeight: 600,
    color: normalizedProgress > 50 ? "#ffffff" : "#374151",
    zIndex: 1,
  };

  const renderLabel = () => {
    if (!showLabel || indeterminate) return null;

    const labelText = `${Math.round(normalizedProgress)}%`;

    if (labelPosition === "inside" && height >= 16) {
      return <span style={insideLabelStyle}>{labelText}</span>;
    }

    return <span style={labelStyle}>{labelText}</span>;
  };

  const uniqueId = React.useMemo(
    () => `progress-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  return (
    <>
      <style>
        {`
          @keyframes ${uniqueId}-indeterminate {
            0% {
              left: -30%;
            }
            100% {
              left: 100%;
            }
          }
          @keyframes ${uniqueId}-stripes {
            from {
              background-position: 40px 0;
            }
            to {
              background-position: 0 0;
            }
          }
        `}
      </style>

      {showLabel && labelPosition === "top" && !indeterminate && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span style={{ ...labelStyle, color: "#374151" }}>Progress</span>
          <span style={labelStyle}>{Math.round(normalizedProgress)}%</span>
        </div>
      )}

      <div
        className={className}
        style={containerStyle}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || "Progress"}
      >
        <div style={trackStyle}>
          {labelPosition === "inside" && renderLabel()}
          <div
            style={{
              ...fillStyle,
              ...(indeterminate && {
                animation: `${uniqueId}-indeterminate 1.5s ease-in-out infinite`,
              }),
              ...(variant === "striped" &&
                animated &&
                !indeterminate && {
                  animation: `${uniqueId}-stripes 1s linear infinite`,
                }),
            }}
          />
        </div>
        {labelPosition === "outside" && renderLabel()}
      </div>
    </>
  );
};

export default ProgressBar;
