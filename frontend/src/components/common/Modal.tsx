import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const getSizeStyles = (size: "sm" | "md" | "lg" | "xl" | "full") => {
  switch (size) {
    case "sm":
      return { maxWidth: "400px" };
    case "md":
      return { maxWidth: "500px" };
    case "lg":
      return { maxWidth: "700px" };
    case "xl":
      return { maxWidth: "900px" };
    case "full":
      return {
        maxWidth: "calc(100vw - 48px)",
        maxHeight: "calc(100vh - 48px)",
      };
    default:
      return { maxWidth: "500px" };
  }
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  // Focus trap
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab" || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Add/remove event listeners
  useEffect(() => {
    if (!isOpen) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleFocusTrap);

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the modal
    setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleFocusTrap);
      document.body.style.overflow = originalOverflow;

      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  const sizeStyles = getSizeStyles(size);

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          opacity: isAnimating ? 1 : 0,
          transition: "opacity 0.2s ease-out",
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          ...sizeStyles,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          outline: "none",
          transform: isAnimating ? "scale(1)" : "scale(0.95)",
          opacity: isAnimating ? 1 : 0,
          transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  marginLeft: "auto",
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  border: "none",
                  backgroundColor: "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: "20px",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#111827";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: "20px",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
