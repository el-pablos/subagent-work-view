import React, { useState, useMemo } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarVariant = "rounded" | "square";
export type AvatarStatus = "online" | "offline" | "busy" | "away" | "none";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  status?: AvatarStatus;
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap: Record<
  AvatarSize,
  { size: number; fontSize: number; statusSize: number }
> = {
  xs: { size: 24, fontSize: 10, statusSize: 8 },
  sm: { size: 32, fontSize: 12, statusSize: 10 },
  md: { size: 40, fontSize: 14, statusSize: 12 },
  lg: { size: 48, fontSize: 16, statusSize: 14 },
  xl: { size: 64, fontSize: 20, statusSize: 16 },
};

const statusColorMap: Record<AvatarStatus, string> = {
  online: "#22c55e",
  offline: "#94a3b8",
  busy: "#ef4444",
  away: "#f59e0b",
  none: "transparent",
};

const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): { bg: string; text: string } => {
  const colors = [
    { bg: "#dbeafe", text: "#1e40af" },
    { bg: "#dcfce7", text: "#15803d" },
    { bg: "#fef3c7", text: "#92400e" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#e0e7ff", text: "#3730a3" },
    { bg: "#f3e8ff", text: "#6b21a8" },
    { bg: "#ccfbf1", text: "#115e59" },
    { bg: "#fee2e2", text: "#991b1b" },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  variant = "rounded",
  status = "none",
  className,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = sizeMap[size];
  const initials = useMemo(() => (name ? getInitials(name) : ""), [name]);
  const initialsColor = useMemo(
    () => (name ? getColorFromName(name) : { bg: "#f1f5f9", text: "#64748b" }),
    [name],
  );

  const showImage = src && !imageError;
  const showInitials = !showImage && initials;
  const showPlaceholder = !showImage && !showInitials;

  const borderRadius = variant === "rounded" ? "50%" : "8px";

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: sizeConfig.size,
        height: sizeConfig.size,
        borderRadius,
        backgroundColor: showImage ? "transparent" : initialsColor.bg,
        color: initialsColor.text,
        fontSize: sizeConfig.fontSize,
        fontWeight: 600,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {showImage && (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {showInitials && <span>{initials}</span>}

      {showPlaceholder && (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: "60%", height: "60%", opacity: 0.6 }}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}

      {status !== "none" && (
        <span
          style={{
            position: "absolute",
            bottom: variant === "rounded" ? 0 : -2,
            right: variant === "rounded" ? 0 : -2,
            width: sizeConfig.statusSize,
            height: sizeConfig.statusSize,
            borderRadius: "50%",
            backgroundColor: statusColorMap[status],
            border: "2px solid white",
            boxSizing: "content-box",
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
