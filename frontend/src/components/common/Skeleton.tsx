import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  className?: string;
  animation?: "pulse" | "wave" | "none";
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  variant = "rectangular",
  className = "",
  animation = "pulse",
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      backgroundColor: "#374151", // gray-700
      ...style,
    };

    switch (variant) {
      case "text":
        return {
          ...baseStyles,
          height: "1em",
          borderRadius: "4px",
          transform: "scale(1, 0.6)",
        };
      case "circular":
        return {
          ...baseStyles,
          borderRadius: "50%",
        };
      case "rounded":
        return {
          ...baseStyles,
          borderRadius: "8px",
        };
      case "rectangular":
      default:
        return {
          ...baseStyles,
          borderRadius: "4px",
        };
    }
  };

  const getAnimationClass = (): string => {
    switch (animation) {
      case "pulse":
        return "skeleton-pulse";
      case "wave":
        return "skeleton-wave";
      case "none":
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className={`${getAnimationClass()} ${className}`}
        style={getVariantStyles()}
      />
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes skeleton-wave {
          0% {
            transform: translateX(-100%);
          }
          50%, 100% {
            transform: translateX(100%);
          }
        }

        .skeleton-pulse {
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-wave {
          position: relative;
          overflow: hidden;
        }

        .skeleton-wave::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: skeleton-wave 2s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Skeleton;
