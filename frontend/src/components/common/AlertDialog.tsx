import React from "react";
import Modal from "./Modal";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: AlertType;
  title?: string;
  message: string;
  buttonText?: string;
}

const getAlertStyles = (
  type: AlertType,
): {
  iconBg: string;
  icon: string;
  iconColor: string;
  buttonBg: string;
  buttonHoverBg: string;
  buttonActiveBg: string;
} => {
  switch (type) {
    case "success":
      return {
        iconBg: "#dcfce7",
        icon: "✓",
        iconColor: "#15803d",
        buttonBg: "#10b981",
        buttonHoverBg: "#059669",
        buttonActiveBg: "#047857",
      };
    case "error":
      return {
        iconBg: "#fee2e2",
        icon: "✗",
        iconColor: "#991b1b",
        buttonBg: "#ef4444",
        buttonHoverBg: "#dc2626",
        buttonActiveBg: "#b91c1c",
      };
    case "warning":
      return {
        iconBg: "#fef3c7",
        icon: "⚠",
        iconColor: "#92400e",
        buttonBg: "#f59e0b",
        buttonHoverBg: "#d97706",
        buttonActiveBg: "#b45309",
      };
    case "info":
      return {
        iconBg: "#dbeafe",
        icon: "ℹ",
        iconColor: "#1e40af",
        buttonBg: "#3b82f6",
        buttonHoverBg: "#2563eb",
        buttonActiveBg: "#1d4ed8",
      };
    default:
      return {
        iconBg: "#f1f5f9",
        icon: "ℹ",
        iconColor: "#475569",
        buttonBg: "#64748b",
        buttonHoverBg: "#475569",
        buttonActiveBg: "#334155",
      };
  }
};

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = "OK",
}) => {
  const styles = getAlertStyles(type);
  const defaultTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || defaultTitle}
      size="sm"
      closeOnBackdrop={true}
      closeOnEscape={true}
      showCloseButton={true}
    >
      <div>
        {/* Icon and message */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: styles.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: styles.iconColor,
                fontWeight: "bold",
              }}
            >
              {styles.icon}
            </span>
          </div>

          {/* Message */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.6",
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: styles.buttonBg,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              minWidth: "80px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonBg;
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonActiveBg;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHoverBg;
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;
