import React from "react";
import { motion } from "framer-motion";
import {
  // Navigation & UI
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MoreHorizontal,
  MoreVertical,
  Settings,
  Filter,
  SlidersHorizontal,

  // Actions
  Plus,
  Minus,
  Check,
  Copy,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Play,
  Pause,
  Square,
  Send,

  // Status & Feedback
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Clock,
  Timer,
  Loader2,

  // Communication
  MessageSquare,
  MessageCircle,
  Bell,
  BellOff,
  Mail,
  Inbox,

  // Users & Agents
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  Bot,

  // Data & Content
  FileText,
  Folder,
  FolderOpen,
  Database,
  Terminal,
  Code,
  Hash,

  // System & Network
  Network,
  Wifi,
  WifiOff,
  Globe,
  Server,
  Cpu,
  Zap,
  Activity,

  // Layout & Views
  LayoutGrid,
  List,
  Columns,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,

  // Misc
  Star,
  Heart,
  Bookmark,
  Tag,
  Link,
  Calendar,
  Sun,
  Moon,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// ============================================================================
// Icon Wrapper Component
// ============================================================================

export interface IconProps extends Omit<LucideProps, "ref"> {
  /** Icon size in pixels or preset sizes */
  size?: number | "xs" | "sm" | "md" | "lg" | "xl";
  /** Icon color - supports Tailwind classes or CSS colors */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Stroke width */
  strokeWidth?: number;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Resolve size to number
 */
function resolveSize(size: IconProps["size"]): number {
  if (typeof size === "number") return size;
  if (typeof size === "string" && size in sizeMap) return sizeMap[size];
  return 20; // default md
}

/**
 * Create a wrapped icon component with consistent props
 */
export function createIcon(LucideIconComponent: LucideIcon) {
  const WrappedIcon: React.FC<IconProps> = ({
    size = "md",
    color,
    className = "",
    strokeWidth = 2,
    ...props
  }) => {
    const resolvedSize = resolveSize(size);

    return (
      <LucideIconComponent
        size={resolvedSize}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    );
  };

  WrappedIcon.displayName = LucideIconComponent.displayName || "Icon";
  return WrappedIcon;
}

// ============================================================================
// Animated Icon Components
// ============================================================================

export interface AnimatedIconProps extends IconProps {
  /** Animation state - controls whether animation is active */
  animate?: boolean;
}

/**
 * Loading Spinner - Rotating loader icon
 */
export const LoadingSpinner: React.FC<AnimatedIconProps> = ({
  size = "md",
  color,
  className = "",
  animate = true,
  ...props
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      animate={animate ? { rotate: 360 } : {}}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ display: "inline-flex" }}
    >
      <Loader2
        size={resolvedSize}
        color={color}
        className={className}
        {...props}
      />
    </motion.div>
  );
};

/**
 * Pulsing Dot - Status indicator with pulse animation
 */
export interface PulsingDotProps {
  /** Dot color */
  color?: "emerald" | "amber" | "red" | "blue" | "purple" | "slate" | string;
  /** Dot size in pixels */
  size?: number | "sm" | "md" | "lg";
  /** Enable pulse animation */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const dotSizeMap: Record<string, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const dotColorMap: Record<string, { bg: string; pulse: string }> = {
  emerald: { bg: "bg-emerald-500", pulse: "bg-emerald-400" },
  amber: { bg: "bg-amber-500", pulse: "bg-amber-400" },
  red: { bg: "bg-red-500", pulse: "bg-red-400" },
  blue: { bg: "bg-blue-500", pulse: "bg-blue-400" },
  purple: { bg: "bg-purple-500", pulse: "bg-purple-400" },
  slate: { bg: "bg-slate-400", pulse: "bg-slate-300" },
};

export const PulsingDot: React.FC<PulsingDotProps> = ({
  color = "emerald",
  size = "md",
  pulse = true,
  className = "",
}) => {
  const resolvedSize = typeof size === "number" ? size : dotSizeMap[size] || 8;
  const colorClasses = dotColorMap[color] || { bg: color, pulse: color };

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`rounded-full ${typeof color === "string" && color in dotColorMap ? colorClasses.bg : ""}`}
        style={{
          width: resolvedSize,
          height: resolvedSize,
          backgroundColor: !(color in dotColorMap) ? color : undefined,
        }}
      />
      {pulse && (
        <motion.span
          className={`absolute inset-0 rounded-full ${typeof color === "string" && color in dotColorMap ? colorClasses.pulse : ""}`}
          style={{
            backgroundColor: !(color in dotColorMap) ? color : undefined,
          }}
          initial={{ opacity: 0.75, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
    </span>
  );
};

/**
 * Syncing Icon - Rotating refresh icon for sync status
 */
export const SyncingIcon: React.FC<AnimatedIconProps> = ({
  size = "md",
  color,
  className = "",
  animate = true,
  ...props
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      animate={animate ? { rotate: 360 } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ display: "inline-flex" }}
    >
      <RefreshCw
        size={resolvedSize}
        color={color}
        className={className}
        {...props}
      />
    </motion.div>
  );
};

/**
 * Bounce Icon - Bouncing notification or attention icon
 */
export const BounceIcon: React.FC<
  AnimatedIconProps & { icon?: LucideIcon }
> = ({
  size = "md",
  color,
  className = "",
  animate = true,
  icon: Icon = Bell,
  ...props
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      animate={
        animate
          ? {
              y: [0, -4, 0],
            }
          : {}
      }
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.8,
        ease: "easeInOut",
      }}
      style={{ display: "inline-flex" }}
    >
      <Icon
        size={resolvedSize}
        color={color}
        className={className}
        {...props}
      />
    </motion.div>
  );
};

/**
 * Breathing Icon - Subtle scale animation for active states
 */
export const BreathingIcon: React.FC<
  AnimatedIconProps & { icon?: LucideIcon }
> = ({
  size = "md",
  color,
  className = "",
  animate = true,
  icon: Icon = Activity,
  ...props
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      animate={
        animate
          ? {
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ display: "inline-flex" }}
    >
      <Icon
        size={resolvedSize}
        color={color}
        className={className}
        {...props}
      />
    </motion.div>
  );
};

/**
 * Success Check - Animated checkmark with draw-in effect
 */
export const SuccessCheck: React.FC<Omit<AnimatedIconProps, "animate">> = ({
  size = "md",
  color = "#22c55e",
  className = "",
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{ display: "inline-flex" }}
    >
      <CheckCircle size={resolvedSize} color={color} className={className} />
    </motion.div>
  );
};

/**
 * Error X - Animated error icon with shake effect
 */
export const ErrorX: React.FC<Omit<AnimatedIconProps, "animate">> = ({
  size = "md",
  color = "#ef4444",
  className = "",
}) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: [0, -4, 4, -4, 4, 0],
      }}
      transition={{
        scale: { type: "spring", stiffness: 300, damping: 20 },
        x: { duration: 0.4, delay: 0.2 },
      }}
      style={{ display: "inline-flex" }}
    >
      <XCircle size={resolvedSize} color={color} className={className} />
    </motion.div>
  );
};

/**
 * Typing Indicator - Three bouncing dots for typing status
 */
export interface TypingIndicatorProps {
  /** Dot color */
  color?: string;
  /** Dot size */
  dotSize?: number;
  /** Gap between dots */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  color = "#64748b",
  dotSize = 6,
  gap = 4,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center ${className}`} style={{ gap }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: color,
          }}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Action Button Icon - Scale on hover/tap
 */
export const ActionIcon: React.FC<
  AnimatedIconProps & { icon: LucideIcon; onClick?: () => void }
> = ({ size = "md", color, className = "", icon: Icon, onClick, ...props }) => {
  const resolvedSize = resolveSize(size);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center justify-center p-1 rounded transition-colors ${className}`}
      style={{ color }}
    >
      <Icon size={resolvedSize} {...props} />
    </motion.button>
  );
};

// ============================================================================
// Status Indicator Component
// ============================================================================

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "loading"
  | "idle";

export interface StatusIndicatorProps {
  /** Status type */
  status: StatusType;
  /** Size of the indicator */
  size?: number | "sm" | "md" | "lg";
  /** Show label text */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { icon: LucideIcon; color: string; label: string; animate?: boolean }
> = {
  success: { icon: CheckCircle, color: "#22c55e", label: "Success" },
  warning: { icon: AlertTriangle, color: "#f59e0b", label: "Warning" },
  error: { icon: XCircle, color: "#ef4444", label: "Error" },
  info: { icon: Info, color: "#3b82f6", label: "Info" },
  loading: { icon: Loader2, color: "#6366f1", label: "Loading", animate: true },
  idle: { icon: Clock, color: "#64748b", label: "Idle" },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "md",
  showLabel = false,
  label,
  className = "",
}) => {
  const config = statusConfig[status];
  const resolvedSize = resolveSize(size);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {config.animate ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-flex" }}
        >
          <Icon size={resolvedSize} color={config.color} />
        </motion.div>
      ) : (
        <Icon size={resolvedSize} color={config.color} />
      )}
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: config.color }}>
          {label || config.label}
        </span>
      )}
    </span>
  );
};

// ============================================================================
// Wrapped Icon Exports
// ============================================================================

// Navigation & UI
export const SearchIcon = createIcon(Search);
export const MenuIcon = createIcon(Menu);
export const CloseIcon = createIcon(X);
export const ChevronDownIcon = createIcon(ChevronDown);
export const ChevronUpIcon = createIcon(ChevronUp);
export const ChevronLeftIcon = createIcon(ChevronLeft);
export const ChevronRightIcon = createIcon(ChevronRight);
export const ArrowDownIcon = createIcon(ArrowDown);
export const ArrowUpIcon = createIcon(ArrowUp);
export const ArrowLeftIcon = createIcon(ArrowLeft);
export const ArrowRightIcon = createIcon(ArrowRight);
export const ExternalLinkIcon = createIcon(ExternalLink);
export const MoreHorizontalIcon = createIcon(MoreHorizontal);
export const MoreVerticalIcon = createIcon(MoreVertical);
export const SettingsIcon = createIcon(Settings);
export const FilterIcon = createIcon(Filter);
export const SlidersIcon = createIcon(SlidersHorizontal);

// Actions
export const PlusIcon = createIcon(Plus);
export const MinusIcon = createIcon(Minus);
export const CheckIcon = createIcon(Check);
export const CopyIcon = createIcon(Copy);
export const TrashIcon = createIcon(Trash2);
export const EditIcon = createIcon(Edit);
export const SaveIcon = createIcon(Save);
export const DownloadIcon = createIcon(Download);
export const UploadIcon = createIcon(Upload);
export const RefreshIcon = createIcon(RefreshCw);
export const UndoIcon = createIcon(RotateCcw);
export const PlayIcon = createIcon(Play);
export const PauseIcon = createIcon(Pause);
export const StopIcon = createIcon(Square);
export const SendIcon = createIcon(Send);

// Status & Feedback
export const AlertCircleIcon = createIcon(AlertCircle);
export const AlertTriangleIcon = createIcon(AlertTriangle);
export const CheckCircleIcon = createIcon(CheckCircle);
export const XCircleIcon = createIcon(XCircle);
export const InfoIcon = createIcon(Info);
export const HelpIcon = createIcon(HelpCircle);
export const ClockIcon = createIcon(Clock);
export const TimerIcon = createIcon(Timer);
export const LoaderIcon = createIcon(Loader2);

// Communication
export const MessageSquareIcon = createIcon(MessageSquare);
export const MessageCircleIcon = createIcon(MessageCircle);
export const BellIcon = createIcon(Bell);
export const BellOffIcon = createIcon(BellOff);
export const MailIcon = createIcon(Mail);
export const InboxIcon = createIcon(Inbox);

// Users & Agents
export const UserIcon = createIcon(User);
export const UsersIcon = createIcon(Users);
export const UserPlusIcon = createIcon(UserPlus);
export const UserMinusIcon = createIcon(UserMinus);
export const UserCheckIcon = createIcon(UserCheck);
export const BotIcon = createIcon(Bot);

// Data & Content
export const FileTextIcon = createIcon(FileText);
export const FolderIcon = createIcon(Folder);
export const FolderOpenIcon = createIcon(FolderOpen);
export const DatabaseIcon = createIcon(Database);
export const TerminalIcon = createIcon(Terminal);
export const CodeIcon = createIcon(Code);
export const HashIcon = createIcon(Hash);

// System & Network
export const NetworkIcon = createIcon(Network);
export const WifiIcon = createIcon(Wifi);
export const WifiOffIcon = createIcon(WifiOff);
export const GlobeIcon = createIcon(Globe);
export const ServerIcon = createIcon(Server);
export const CpuIcon = createIcon(Cpu);
export const ZapIcon = createIcon(Zap);
export const ActivityIcon = createIcon(Activity);

// Layout & Views
export const GridIcon = createIcon(LayoutGrid);
export const ListIcon = createIcon(List);
export const ColumnsIcon = createIcon(Columns);
export const EyeIcon = createIcon(Eye);
export const EyeOffIcon = createIcon(EyeOff);
export const MaximizeIcon = createIcon(Maximize2);
export const MinimizeIcon = createIcon(Minimize2);

// Misc
export const StarIcon = createIcon(Star);
export const HeartIcon = createIcon(Heart);
export const BookmarkIcon = createIcon(Bookmark);
export const TagIcon = createIcon(Tag);
export const LinkIcon = createIcon(Link);
export const CalendarIcon = createIcon(Calendar);
export const SunIcon = createIcon(Sun);
export const MoonIcon = createIcon(Moon);

// ============================================================================
// Re-export base Lucide icons for advanced use cases
// ============================================================================

export {
  // Navigation & UI
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MoreHorizontal,
  MoreVertical,
  Settings,
  Filter,
  SlidersHorizontal,

  // Actions
  Plus,
  Minus,
  Check,
  Copy,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Play,
  Pause,
  Square,
  Send,

  // Status & Feedback
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Clock,
  Timer,
  Loader2,

  // Communication
  MessageSquare,
  MessageCircle,
  Bell,
  BellOff,
  Mail,
  Inbox,

  // Users & Agents
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  Bot,

  // Data & Content
  FileText,
  Folder,
  FolderOpen,
  Database,
  Terminal,
  Code,
  Hash,

  // System & Network
  Network,
  Wifi,
  WifiOff,
  Globe,
  Server,
  Cpu,
  Zap,
  Activity,

  // Layout & Views
  LayoutGrid,
  List,
  Columns,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,

  // Misc
  Star,
  Heart,
  Bookmark,
  Tag,
  Link,
  Calendar,
  Sun,
  Moon,
};

// Export types
export type { LucideIcon, LucideProps };
