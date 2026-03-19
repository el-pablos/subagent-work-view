import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ListChecks,
  UserMinus,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import {
  useNotificationStore,
  type Notification,
  type NotificationType,
} from "../../stores/notificationStore";
import { cn } from "../../lib/utils";

const iconMap: Record<NotificationType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-cyan-400" aria-hidden="true" />,
  agent_spawn: <UserPlus className="h-5 w-5 text-cyan-400" aria-hidden="true" />,
  agent_exit: <UserMinus className="h-5 w-5 text-slate-400" aria-hidden="true" />,
  task_complete: <ListChecks className="h-5 w-5 text-emerald-400" aria-hidden="true" />,
  message: <Zap className="h-5 w-5 text-purple-400" aria-hidden="true" />,
};

const toneMap: Record<NotificationType, string> = {
  success: "border-emerald-500/25 bg-emerald-500/10",
  error: "border-red-500/25 bg-red-500/10",
  warning: "border-amber-500/25 bg-amber-500/10",
  info: "border-cyan-500/25 bg-cyan-500/10",
  agent_spawn: "border-sky-500/25 bg-sky-500/10",
  agent_exit: "border-slate-500/25 bg-slate-500/10",
  task_complete: "border-emerald-500/25 bg-emerald-500/10",
  message: "border-purple-500/25 bg-purple-500/10",
};

function useIsMobileToast() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}

export function ToastContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const isMobile = useIsMobileToast();

  const visibleToasts = useMemo(
    () => notifications.filter((notification) => !notification.read).slice(0, 5),
    [notifications],
  );

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex w-full flex-col gap-2 px-4 pb-safe",
        isMobile
          ? "inset-x-0 bottom-4"
          : "right-4 top-4 max-w-sm",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleToasts.map((notification) => (
          <Toast
            key={notification.id}
            isMobile={isMobile}
            notification={notification}
            onDismiss={() => markAsRead(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  notification: Notification;
  isMobile: boolean;
  onDismiss: () => void;
}

function Toast({ notification, isMobile, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(onDismiss, notification.duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notification.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={isMobile ? { opacity: 0, y: 32, scale: 0.98 } : { opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={isMobile ? { opacity: 0, y: 24, scale: 0.98 } : { opacity: 0, x: 40, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "glass-panel pointer-events-auto relative overflow-hidden rounded-xl border p-3 shadow-2xl backdrop-blur-xl",
        toneMap[notification.type],
        isMobile ? "w-full" : "w-full",
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{iconMap[notification.type]}</span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {notification.title}
          </p>

          {notification.message ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-300">
              {notification.message}
            </p>
          ) : null}

          {notification.action ? (
            <button
              type="button"
              onClick={() => {
                notification.action?.onClick();
                onDismiss();
              }}
              className="mt-2 inline-flex min-h-8 items-center rounded-md px-2 py-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {notification.action.label}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-md p-1 text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Tutup notifikasi"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {notification.duration && notification.duration > 0 ? (
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white/30"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
        />
      ) : null}
    </motion.div>
  );
}

export default ToastContainer;
