import React from "react";
import Avatar, { AvatarProps, AvatarSize } from "./Avatar";

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  size?: AvatarSize;
  max?: number;
  overlap?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizeOverlapMap: Record<AvatarSize, number> = {
  xs: -8,
  sm: -10,
  md: -12,
  lg: -14,
  xl: -16,
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = "md",
  max = 5,
  overlap = true,
  className,
  style,
}) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;
  const overlapOffset = overlap ? sizeOverlapMap[size] : 0;

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {displayedAvatars.map((avatar, index) => (
        <div
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : overlapOffset,
            zIndex: displayedAvatars.length - index,
            position: "relative",
            border: overlap ? "2px solid white" : "none",
            borderRadius: avatar.variant === "square" ? "8px" : "50%",
          }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: overlapOffset,
            zIndex: 0,
            position: "relative",
            border: overlap ? "2px solid white" : "none",
            borderRadius: "50%",
          }}
        >
          <Avatar
            name={`+${remainingCount}`}
            size={size}
            variant="rounded"
            style={{
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              fontWeight: 700,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
