import React from "react";
import Skeleton from "../common/Skeleton";

interface AgentNodeSkeletonProps {
  size?: number;
  className?: string;
}

/**
 * Skeleton component for AgentNode
 * Shows a loading placeholder while agent data is being fetched
 */
const AgentNodeSkeleton: React.FC<AgentNodeSkeletonProps> = ({
  size = 64,
  className = "",
}) => {
  const avatarSize = size - 12; // Leave space for the ring

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Status ring skeleton */}
      <Skeleton
        variant="circular"
        width={size}
        height={size}
        className="absolute"
        style={{
          top: 0,
          left: 0,
        }}
      />

      {/* Avatar skeleton */}
      <Skeleton
        variant="circular"
        width={avatarSize}
        height={avatarSize}
        className="absolute"
        style={{
          top: (size - avatarSize) / 2,
          left: (size - avatarSize) / 2,
        }}
      />

      {/* Agent name label skeleton below */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <Skeleton width={60} height={12} variant="rounded" />
      </div>
    </div>
  );
};

export default AgentNodeSkeleton;
