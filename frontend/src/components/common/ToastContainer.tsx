import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { useNotificationStore, type NotificationType } from "../../stores/notificationStore";

const getToastConfig = (type: NotificationType) => {
  switch (type) {
    case "success":
      return {
        icon: CheckCircle2,
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        iconColor: "text-emerald-500",
        textColor: "text-emerald-100",
      };
    case "error":
      return {
        icon: XCircle,
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        iconColor: "text-red-500",
        textColor: "text-red-100",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        iconColor: "text-amber-500",
        textColor: "text-amber-100",
      };
    case "info":
      return {
        icon: Info,
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
        iconColor: "text-sky-500",
        textColor: "text-sky-100",
      };
    default:
      return {
        icon: Info,
        bgColor: "bg-slate-500/10",
        borderColor: "border-slate-500/30",
        iconColor: "text-slate-500",
        textColor: "text-slate-100",
      };
  }
};

const ToastContainer: React.FC = () => {
  const { getVisibleToasts, removeToast } = useNotificationStore();
  const toasts = getVisibleToasts();

  return (
    <>
      {/* Desktop: top-right */}
      <div
        className="fixed top-4 right-4 z-50 hidden sm:flex flex-col gap-3 max-w-md pointer-events-none"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = getToastConfig(toast.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className={`glass-panel ${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-lg shadow-2xl p-4 pointer-events-auto`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <h4 className={`font-semibold text-sm ${config.textColor} mb-1`}>
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-sm text-slate-300">{toast.message}</p>

                    {/* Action Button */}
                    {toast.action && (
                      <button
                        onClick={() => {
                          toast.action?.onClick();
                          removeToast(toast.id);
                        }}
                        className={`mt-2 text-xs font-medium ${config.textColor} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-${toast.type}-500 rounded`}
                      >
                        {toast.action.label}
                      </button>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 rounded"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss */}
                {toast.duration && toast.duration > 0 && (
                  <AutoDismissProgress
                    duration={toast.duration}
                    onComplete={() => removeToast(toast.id)}
                    color={config.iconColor}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mobile: bottom, full-width */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden flex-col gap-2 p-3 pointer-events-none"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = getToastConfig(toast.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className={`glass-panel ${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-lg shadow-2xl p-3 pointer-events-auto w-full`}
              >
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <h4 className={`font-semibold text-sm ${config.textColor} mb-1`}>
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-300">{toast.message}</p>

                    {/* Action Button */}
                    {toast.action && (
                      <button
                        onClick={() => {
                          toast.action?.onClick();
                          removeToast(toast.id);
                        }}
                        className={`mt-2 text-xs font-medium ${config.textColor} hover:underline focus:outline-none`}
                      >
                        {toast.action.label}
                      </button>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss */}
                {toast.duration && toast.duration > 0 && (
                  <AutoDismissProgress
                    duration={toast.duration}
                    onComplete={() => removeToast(toast.id)}
                    color={config.iconColor}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

// Progress bar component for auto-dismiss
const AutoDismissProgress: React.FC<{
  duration: number;
  onComplete: () => void;
  color: string;
}> = ({ duration, onComplete, color }) => {
  const [progress, setProgress] = React.useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="mt-3 h-1 bg-slate-800/50 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color.replace("text-", "bg-")}`}
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.05, ease: "linear" }}
      />
    </div>
  );
};

export default ToastContainer;
