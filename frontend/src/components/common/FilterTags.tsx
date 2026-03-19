import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterTag {
  id: string;
  label: string;
  value: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

interface FilterTagsProps {
  tags: FilterTag[];
  onRemove: (tagId: string) => void;
  onClear?: () => void;
  className?: string;
  maxTags?: number;
}

const getTagColorStyles = (color: FilterTag["color"] = "blue") => {
  const colorMap = {
    blue: {
      bg: "bg-blue-900/50",
      text: "text-blue-300",
      border: "border-blue-700",
      hoverBg: "hover:bg-blue-900/70",
      hoverText: "hover:text-blue-200",
    },
    green: {
      bg: "bg-green-900/50",
      text: "text-green-300",
      border: "border-green-700",
      hoverBg: "hover:bg-green-900/70",
      hoverText: "hover:text-green-200",
    },
    yellow: {
      bg: "bg-yellow-900/50",
      text: "text-yellow-300",
      border: "border-yellow-700",
      hoverBg: "hover:bg-yellow-900/70",
      hoverText: "hover:text-yellow-200",
    },
    red: {
      bg: "bg-red-900/50",
      text: "text-red-300",
      border: "border-red-700",
      hoverBg: "hover:bg-red-900/70",
      hoverText: "hover:text-red-200",
    },
    purple: {
      bg: "bg-purple-900/50",
      text: "text-purple-300",
      border: "border-purple-700",
      hoverBg: "hover:bg-purple-900/70",
      hoverText: "hover:text-purple-200",
    },
    gray: {
      bg: "bg-gray-800/50",
      text: "text-gray-300",
      border: "border-gray-700",
      hoverBg: "hover:bg-gray-800/70",
      hoverText: "hover:text-gray-200",
    },
  };

  return colorMap[color];
};

const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  onRemove,
  onClear,
  className = "",
  maxTags,
}) => {
  const visibleTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenCount =
    maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Filter tags */}
      <AnimatePresence mode="popLayout">
        {visibleTags.map((tag) => {
          const colorStyles = getTagColorStyles(tag.color);

          return (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
              }}
              layout
              className={`
                flex items-center gap-1.5 px-2.5 py-1
                ${colorStyles.bg} ${colorStyles.text}
                border ${colorStyles.border}
                rounded-full
                text-xs font-medium
                transition-colors
                group
              `}
            >
              <span className="select-none">{tag.label}</span>
              <button
                onClick={() => onRemove(tag.id)}
                className={`
                  p-0.5 rounded-full
                  ${colorStyles.hoverBg} ${colorStyles.hoverText}
                  transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  hover:scale-110
                `}
                aria-label={`Remove filter ${tag.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Hidden count indicator */}
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2.5 py-1 bg-gray-800/50 text-gray-400 border border-gray-700 rounded-full text-xs font-medium"
        >
          +{hiddenCount} more
        </motion.div>
      )}

      {/* Clear all button */}
      {onClear && tags.length > 1 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClear}
          className={`
            px-2.5 py-1
            bg-gray-800/50 text-gray-400
            border border-gray-700
            rounded-full
            text-xs font-medium
            hover:bg-gray-800 hover:text-gray-300 hover:border-gray-600
            transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          aria-label="Clear all filters"
        >
          Clear all
        </motion.button>
      )}
    </div>
  );
};

export default FilterTags;
