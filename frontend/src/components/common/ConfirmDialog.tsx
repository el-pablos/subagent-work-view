import React from "react";
import Modal from "./Modal";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "success" | "warning";
  isLoading?: boolean;
}

const getConfirmButtonStyles = (
  variant: "primary" | "danger" | "success" | "warning",
) => {
  switch (variant) {
    case "danger":
      return {
        backgroundColor: "#ef4444",
        hoverBackgroundColor: "#dc2626",
        activeBackgroundColor: "#b91c1c",
      };
    case "success":
      return {
        backgroundColor: "#10b981",
        hoverBackgroundColor: "#059669",
        activeBackgroundColor: "#047857",
      };
    case "warning":
      return {
        backgroundColor: "#f59e0b",
        hoverBackgroundColor: "#d97706",
        activeBackgroundColor: "#b45309",
      };
    case "primary":
    default:
      return {
        backgroundColor: "#3b82f6",
        hoverBackgroundColor: "#2563eb",
        activeBackgroundColor: "#1d4ed8",
      };
  }
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}) => {
  const confirmStyles = getConfirmButtonStyles(confirmVariant);

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <div>
        {/* Message */}
        <div
          style={{
            fontSize: "14px",
            color: "#374151",
            lineHeight: "1.6",
            marginBottom: "24px",
          }}
        >
          {message}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
              }
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: confirmStyles.backgroundColor,
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor =
                  confirmStyles.hoverBackgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor =
                  confirmStyles.backgroundColor;
              }
            }}
            onMouseDown={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor =
                  confirmStyles.activeBackgroundColor;
              }
            }}
            onMouseUp={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor =
                  confirmStyles.hoverBackgroundColor;
              }
            }}
          >
            {isLoading && (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }}
              />
            )}
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Modal>
  );
};

export default ConfirmDialog;
