import React from "react";
import Skeleton from "../common/Skeleton";

interface TaskCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton component for TaskCard
 * Shows a loading placeholder while task data is being fetched
 */
const TaskCardSkeleton: React.FC<TaskCardSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}
    >
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between mb-2">
        <Skeleton width="60%" height={16} variant="rounded" />
        <Skeleton width={70} height={20} variant="rounded" />
      </div>

      {/* Description */}
      <div className="mb-3 space-y-2">
        <Skeleton width="100%" height={12} variant="rounded" />
        <Skeleton width="80%" height={12} variant="rounded" />
      </div>

      {/* Assigned Agent */}
      <div className="flex items-center mb-3">
        <Skeleton variant="circular" width={24} height={24} className="mr-2" />
        <Skeleton width={80} height={12} variant="rounded" />
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <Skeleton width="100%" height={8} variant="rounded" />
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={10} variant="rounded" />
        <Skeleton width={60} height={10} variant="rounded" />
      </div>
    </div>
  );
};

export default TaskCardSkeleton;
