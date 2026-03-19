import React, { useEffect, useState } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertToastProps {
  type: AlertType;
  message: string;
  title?: string;
  duration?: number; // milliseconds, 0 for persistent
  onClose?: () => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const getAlertStyles = (
  type: AlertType,
): { bg: string; color: string; border: string; icon: string } => {
  switch (type) {
    case "success":
      return {
        bg: "#dcfce7",
        color: "#15803d",
        border: "#86efac",
        icon: "✓",
      };
    case "error":
      return {
        bg: "#fee2e2",
        color: "#991b1b",
        border: "#fca5a5",
        icon: "✗",
      };
    case "warning":
      return {
        bg: "#fef3c7",
        color: "#92400e",
        border: "#fcd34d",
        icon: "⚠",
      };
    case "info":
      return {
        bg: "#dbeafe",
        color: "#1e40af",
        border: "#93c5fd",
        icon: "ℹ",
      };
    default:
      return {
        bg: "#f1f5f9",
        color: "#475569",
        border: "#cbd5e1",
        icon: "ℹ",
      };
  }
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case "top-right":
      return { top: "24px", right: "24px" };
    case "top-left":
      return { top: "24px", left: "24px" };
    case "bottom-right":
      return { bottom: "24px", right: "24px" };
    case "bottom-left":
      return { bottom: "24px", left: "24px" };
    case "top-center":
      return { top: "24px", left: "50%", transform: "translateX(-50%)" };
    case "bottom-center":
      return { bottom: "24px", left: "50%", transform: "translateX(-50%)" };
    default:
      return { top: "24px", right: "24px" };
  }
};

const AlertToast: React.FC<AlertToastProps> = ({
  type,
  message,
  title,
  duration = 5000,
  onClose,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const styles = getAlertStyles(type);
  const positionStyles = getPositionStyles(position);
  const isError = type === "error";

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        position: "fixed",
        ...positionStyles,
        zIndex: 9999,
        minWidth: "320px",
        maxWidth: "480px",
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "8px",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        padding: "16px",
        animation: isExiting
          ? "slideOut 0.3s ease-out forwards"
          : "slideIn 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: styles.color,
            color: styles.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {styles.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: styles.color,
                marginBottom: "4px",
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              fontSize: "13px",
              color: styles.color,
              lineHeight: "1.5",
            }}
          >
            {message}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Tutup notifikasi"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          style={{
            flexShrink: 0,
            width: "20px",
            height: "20px",
            padding: 0,
            border: "none",
            backgroundColor: "transparent",
            color: styles.color,
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: "1",
            opacity: 0.7,
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: styles.border,
            borderRadius: "0 0 8px 8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: styles.color,
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(${position.includes("right") ? "100%" : position.includes("left") ? "-100%" : "0"}) ${position.includes("center") ? "translateX(-50%)" : ""};
            opacity: 0;
          }
          to {
            transform: translateX(0) ${position.includes("center") ? "translateX(-50%)" : ""};
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0) ${position.includes("center") ? "translateX(-50%)" : ""};
            opacity: 1;
          }
          to {
            transform: translateX(${position.includes("right") ? "100%" : position.includes("left") ? "-100%" : "0"}) ${position.includes("center") ? "translateX(-50%)" : ""};
            opacity: 0;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast manager for multiple toasts
export interface ToastMessage {
  id: string;
  type: AlertType;
  message: string;
  title?: string;
  duration?: number;
}

interface AlertToastManagerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts?: number;
}

export const AlertToastManager: React.FC<AlertToastManagerProps> = ({
  toasts,
  onRemoveToast,
  position = "top-right",
  maxToasts = 5,
}) => {
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <>
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            marginTop: index > 0 ? "12px" : "0",
          }}
        >
          <AlertToast
            type={toast.type}
            message={toast.message}
            title={toast.title}
            duration={toast.duration}
            position={position}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </>
  );
};

export default AlertToast;
