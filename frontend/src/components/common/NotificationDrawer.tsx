import { useEffect, useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  ListChecks,
  Trash2,
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
  success: <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />,
  info: <Info className="h-4 w-4 text-cyan-400" aria-hidden="true" />,
  agent_spawn: <UserPlus className="h-4 w-4 text-cyan-400" aria-hidden="true" />,
  agent_exit: <UserMinus className="h-4 w-4 text-slate-400" aria-hidden="true" />,
  task_complete: <ListChecks className="h-4 w-4 text-emerald-400" aria-hidden="true" />,
  message: <Zap className="h-4 w-4 text-purple-400" aria-hidden="true" />,
};

const formatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "short",
});

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <li
      className={cn(
        "rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 transition",
        notification.read ? "opacity-70" : "border-cyan-500/30 bg-slate-900/90",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{iconMap[notification.type]}</span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {notification.title}
              </p>
              {notification.message ? (
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  {notification.message}
                </p>
              ) : null}
            </div>

            {!notification.read ? (
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400"
                aria-label="Belum dibaca"
                title="Belum dibaca"
              />
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span>{formatter.format(notification.timestamp)}</span>

            {!notification.read ? (
              <button
                type="button"
                onClick={() => markAsRead(notification.id)}
                className="font-medium text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Tandai dibaca
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className="font-medium text-slate-400 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Hapus
            </button>
          </div>

          {notification.action ? (
            <button
              type="button"
              onClick={() => {
                notification.action?.onClick();
                markAsRead(notification.id);
              }}
              className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {notification.action.label}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function NotificationDrawer() {
  const drawerId = useId();
  const titleId = useId();
  const isDrawerOpen = useNotificationStore((state) => state.isDrawerOpen);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const closeDrawer = useNotificationStore((state) => state.closeDrawer);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeDrawer, isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[109] bg-slate-950/70 backdrop-blur-sm"
            aria-label="Tutup drawer notifikasi"
          />

          <motion.aside
            id="notification-drawer"
            key={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="glass-panel fixed inset-x-3 bottom-3 top-3 z-[110] flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-black/40 sm:inset-y-4 sm:right-4 sm:left-auto sm:w-full sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <h2 id={titleId} className="text-base font-semibold text-white">
                    Notifications
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} notifikasi belum dibaca`
                    : "Semua notifikasi sudah dibaca"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-800/80 px-4 py-3">
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex min-h-9 items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                disabled={unreadCount === 0}
              >
                Tandai semua dibaca
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Hapus semua
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-6 text-center">
                  <Bell className="h-10 w-10 text-slate-700" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-slate-300">
                    Belum ada notifikasi.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Toast yang masuk akan tersimpan di sini sampai dihapus.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default NotificationDrawer;
