import React from "react";
import Skeleton from "../common/Skeleton";

interface MessageBubbleSkeletonProps {
  className?: string;
  variant?: "normal" | "system";
}

/**
 * Skeleton component for MessageBubble
 * Shows a loading placeholder while message data is being fetched
 */
const MessageBubbleSkeleton: React.FC<MessageBubbleSkeletonProps> = ({
  className = "",
  variant = "normal",
}) => {
  // System message skeleton (centered, simpler)
  if (variant === "system") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "8px 12px",
          marginBottom: "4px",
          borderRadius: "8px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
        }}
      >
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={14} height={14} />
          <Skeleton width={200} height={13} variant="rounded" />
          <Skeleton width={50} height={11} variant="rounded" />
        </div>
      </div>
    );
  }

  // Normal message skeleton
  return (
    <div
      className={className}
      style={{
        display: "flex",
        padding: "10px 12px",
        marginBottom: "6px",
        borderRadius: "10px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Avatar skeleton */}
      <Skeleton
        variant="circular"
        width={38}
        height={38}
        style={{ flexShrink: 0 }}
      />

      {/* Message content skeleton */}
      <div style={{ marginLeft: "12px", flex: 1, minWidth: 0 }}>
        {/* Header: name, type badge, recipient */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton width={80} height={14} variant="rounded" />
          <Skeleton width={50} height={16} variant="rounded" />
          <Skeleton width={60} height={12} variant="rounded" />
        </div>

        {/* Content lines */}
        <div className="space-y-2 mb-2">
          <Skeleton width="100%" height={14} variant="rounded" />
          <Skeleton width="90%" height={14} variant="rounded" />
          <Skeleton width="60%" height={14} variant="rounded" />
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1">
          <Skeleton variant="circular" width={12} height={12} />
          <Skeleton width={60} height={11} variant="rounded" />
        </div>
      </div>
    </div>
  );
};

export default MessageBubbleSkeleton;
