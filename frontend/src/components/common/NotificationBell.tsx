import React from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../../stores/notificationStore";

const NotificationBell: React.FC = () => {
  const { getUnreadCount, toggleDrawer } = useNotificationStore();
  const unreadCount = getUnreadCount();

  return (
    <button
      onClick={toggleDrawer}
      className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />

      {/* Unread Badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 300,
            }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-900"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Pulse animation when there are unread notifications */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
