import React, { ReactNode, Suspense, SuspenseProps } from "react";
import ErrorBoundary from "./ErrorBoundary";

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  suspenseFallback?: SuspenseProps["fallback"];
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

/**
 * AsyncBoundary combines Suspense and ErrorBoundary
 * to handle both loading states and errors in async components
 */
const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  fallback,
  suspenseFallback = <DefaultLoadingFallback />,
  onError,
  onReset,
}) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError} onReset={onReset}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

// Default loading fallback component
const DefaultLoadingFallback: React.FC = () => {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: "20px",
          height: "20px",
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span
        style={{
          fontSize: "14px",
          color: "#6b7280",
          fontWeight: 500,
        }}
      >
        Loading...
      </span>

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
    </div>
  );
};

export default AsyncBoundary;
