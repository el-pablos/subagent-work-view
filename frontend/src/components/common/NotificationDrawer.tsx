import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, XCircle, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { useNotificationStore, type NotificationType } from "../../stores/notificationStore";
import { RelativeTime } from "./RelativeTime";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return { icon: CheckCircle2, color: "text-emerald-500" };
    case "error":
      return { icon: XCircle, color: "text-red-500" };
    case "warning":
      return { icon: AlertTriangle, color: "text-amber-500" };
    case "info":
      return { icon: Info, color: "text-sky-500" };
    default:
      return { icon: Bell, color: "text-slate-500" };
  }
};

const NotificationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const notifications = getRecentNotifications(50);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-slate-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-drawer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-400" />
                <h2 id="notification-drawer-title" className="text-lg font-semibold text-white">
                  Notifikasi
                </h2>
                {notifications.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-slate-300 bg-slate-800 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Tutup drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai semua dibaca
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Hapus semua
                </button>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-400">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {notifications.map((notification) => {
                    const { icon: Icon, color } = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className={`px-4 py-3 hover:bg-slate-800/30 transition-colors ${
                          notification.read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 mt-0.5 ${color}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-white">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-sky-500 rounded-full" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <RelativeTime timestamp={notification.timestamp} className="text-[10px] text-slate-500" />
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                  Tandai dibaca
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-[10px] text-red-400 hover:text-red-300 hover:underline"
                              >
                                Hapus
                              </button>
                            </div>

                            {/* Action Button */}
                            {notification.action && (
                              <button
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                                className="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationDrawer;
