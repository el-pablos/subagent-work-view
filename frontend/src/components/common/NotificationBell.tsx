import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";

export function NotificationBell() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isDrawerOpen = useNotificationStore((state) => state.isDrawerOpen);
  const toggleDrawer = useNotificationStore((state) => state.toggleDrawer);
  const controls = useAnimation();
  const previousUnreadCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      void controls.start({
        scale: [1, 1.12, 0.96, 1],
        rotate: [0, -10, 10, -6, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    }

    previousUnreadCount.current = unreadCount;
  }, [controls, unreadCount]);

  return (
    <motion.button
      type="button"
      animate={controls}
      onClick={toggleDrawer}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={
        unreadCount > 0
          ? `Buka notifikasi, ${unreadCount} belum dibaca`
          : "Buka notifikasi"
      }
      aria-controls="notification-drawer"
      aria-expanded={isDrawerOpen}
    >
      <Bell className="h-4 w-4" aria-hidden="true" />

      <AnimatePresence initial={false}>
        {unreadCount > 0 ? (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-slate-950 bg-cyan-500 px-1 text-[10px] font-semibold leading-none text-slate-950 shadow-lg shadow-cyan-500/30"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

export default NotificationBell;
