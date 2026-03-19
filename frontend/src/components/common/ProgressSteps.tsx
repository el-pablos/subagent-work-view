import React from "react";

export type StepStatus = "completed" | "current" | "pending" | "error";

export interface Step {
  /** Unique step identifier */
  id: string | number;
  /** Step label/title */
  label: string;
  /** Optional description */
  description?: string;
  /** Step status */
  status: StepStatus;
  /** Optional icon (emoji or character) */
  icon?: string;
}

interface ProgressStepsProps {
  /** Array of steps */
  steps: Step[];
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show step numbers */
  showNumbers?: boolean;
  /** Enable animation */
  animated?: boolean;
  /** Callback when step is clicked */
  onStepClick?: (step: Step, index: number) => void;
  /** Custom class name */
  className?: string;
}

const getStatusStyles = (
  status: StepStatus,
): {
  bg: string;
  border: string;
  text: string;
  line: string;
  labelColor: string;
} => {
  switch (status) {
    case "completed":
      return {
        bg: "#22c55e",
        border: "#22c55e",
        text: "#ffffff",
        line: "#22c55e",
        labelColor: "#15803d",
      };
    case "current":
      return {
        bg: "#3b82f6",
        border: "#3b82f6",
        text: "#ffffff",
        line: "#e5e7eb",
        labelColor: "#1d4ed8",
      };
    case "error":
      return {
        bg: "#ef4444",
        border: "#ef4444",
        text: "#ffffff",
        line: "#ef4444",
        labelColor: "#dc2626",
      };
    case "pending":
    default:
      return {
        bg: "#ffffff",
        border: "#d1d5db",
        text: "#9ca3af",
        line: "#e5e7eb",
        labelColor: "#6b7280",
      };
  }
};

const getSizeStyles = (
  size: "sm" | "md" | "lg",
): {
  circle: number;
  fontSize: number;
  labelSize: number;
  descSize: number;
  lineWidth: number;
  gap: number;
} => {
  switch (size) {
    case "sm":
      return {
        circle: 24,
        fontSize: 11,
        labelSize: 12,
        descSize: 10,
        lineWidth: 2,
        gap: 8,
      };
    case "lg":
      return {
        circle: 40,
        fontSize: 16,
        labelSize: 16,
        descSize: 13,
        lineWidth: 3,
        gap: 16,
      };
    case "md":
    default:
      return {
        circle: 32,
        fontSize: 13,
        labelSize: 14,
        descSize: 11,
        lineWidth: 2,
        gap: 12,
      };
  }
};

const getStepIcon = (
  status: StepStatus,
  index: number,
  showNumbers: boolean,
  customIcon?: string,
): string => {
  if (customIcon) return customIcon;

  switch (status) {
    case "completed":
      return "✓";
    case "error":
      return "✗";
    case "current":
    case "pending":
    default:
      return showNumbers ? String(index + 1) : "○";
  }
};

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  direction = "horizontal",
  size = "md",
  showNumbers = true,
  animated = true,
  onStepClick,
  className = "",
}) => {
  const sizeStyles = getSizeStyles(size);
  const isHorizontal = direction === "horizontal";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    alignItems: isHorizontal ? "flex-start" : "stretch",
    gap: `${sizeStyles.gap}px`,
    width: "100%",
  };

  const renderConnector = (index: number, step: Step) => {
    if (index === steps.length - 1) return null;

    const nextStep = steps[index + 1];
    const isCompleted =
      step.status === "completed" && nextStep?.status !== "pending";

    const lineColor = isCompleted
      ? getStatusStyles("completed").line
      : getStatusStyles("pending").line;

    const lineStyle: React.CSSProperties = isHorizontal
      ? {
          flex: 1,
          height: `${sizeStyles.lineWidth}px`,
          minWidth: "20px",
          backgroundColor: lineColor,
          transition: animated ? "background-color 0.3s ease" : "none",
        }
      : {
          width: `${sizeStyles.lineWidth}px`,
          minHeight: "20px",
          flex: 1,
          backgroundColor: lineColor,
          marginLeft: `${sizeStyles.circle / 2 - sizeStyles.lineWidth / 2}px`,
          transition: animated ? "background-color 0.3s ease" : "none",
        };

    return <div style={lineStyle} />;
  };

  const renderStep = (step: Step, index: number) => {
    const statusStyles = getStatusStyles(step.status);
    const icon = getStepIcon(step.status, index, showNumbers, step.icon);
    const isClickable = !!onStepClick;

    const stepContainerStyle: React.CSSProperties = isHorizontal
      ? {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: index === steps.length - 1 ? "0 0 auto" : 1,
        }
      : {
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        };

    const circleStyle: React.CSSProperties = {
      width: `${sizeStyles.circle}px`,
      height: `${sizeStyles.circle}px`,
      borderRadius: "50%",
      backgroundColor: statusStyles.bg,
      border: `2px solid ${statusStyles.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: `${sizeStyles.fontSize}px`,
      fontWeight: 600,
      color: statusStyles.text,
      flexShrink: 0,
      cursor: isClickable ? "pointer" : "default",
      transition: animated
        ? "background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease"
        : "none",
      ...(step.status === "current" && {
        boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
      }),
    };

    const labelContainerStyle: React.CSSProperties = isHorizontal
      ? {
          marginTop: "8px",
          textAlign: "center",
          maxWidth: "100px",
        }
      : {
          marginLeft: "12px",
          flex: 1,
        };

    const labelStyle: React.CSSProperties = {
      fontSize: `${sizeStyles.labelSize}px`,
      fontWeight: 500,
      color: statusStyles.labelColor,
      lineHeight: 1.3,
      cursor: isClickable ? "pointer" : "default",
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: `${sizeStyles.descSize}px`,
      color: "#9ca3af",
      marginTop: "2px",
      lineHeight: 1.4,
    };

    const handleClick = () => {
      if (onStepClick) {
        onStepClick(step, index);
      }
    };

    return (
      <React.Fragment key={step.id}>
        <div style={stepContainerStyle}>
          {isHorizontal ? (
            <>
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <div
                  style={circleStyle}
                  onClick={handleClick}
                  onMouseEnter={(e) => {
                    if (isClickable && animated) {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable && animated) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                >
                  {icon}
                </div>
                {renderConnector(index, step)}
              </div>
              <div style={labelContainerStyle} onClick={handleClick}>
                <div style={labelStyle}>{step.label}</div>
                {step.description && (
                  <div style={descriptionStyle}>{step.description}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={circleStyle}
                  onClick={handleClick}
                  onMouseEnter={(e) => {
                    if (isClickable && animated) {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable && animated) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                >
                  {icon}
                </div>
                {renderConnector(index, step)}
              </div>
              <div style={labelContainerStyle} onClick={handleClick}>
                <div style={labelStyle}>{step.label}</div>
                {step.description && (
                  <div style={descriptionStyle}>{step.description}</div>
                )}
              </div>
            </>
          )}
        </div>
      </React.Fragment>
    );
  };

  return (
    <div
      className={className}
      style={containerStyle}
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
};

export default ProgressSteps;
