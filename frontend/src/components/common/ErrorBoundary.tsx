import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            margin: "16px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            {/* Error Icon */}
            <div
              style={{
                flexShrink: 0,
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#991b1b",
                color: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              !
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#991b1b",
                }}
              >
                Something went wrong
              </h3>
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "14px",
                  color: "#991b1b",
                  lineHeight: "1.5",
                }}
              >
                {this.state.error?.message || "An unexpected error occurred"}
              </p>

              {/* Error details (collapsible in production) */}
              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        color: "#991b1b",
                        fontWeight: 500,
                      }}
                    >
                      Error Details
                    </summary>
                    <pre
                      style={{
                        marginTop: "8px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: "#7f1d1d",
                        fontSize: "11px",
                        lineHeight: "1.4",
                      }}
                    >
                      {this.state.error?.stack}
                      {"\n\nComponent Stack:"}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

              {/* Recovery Button */}
              <button
                onClick={this.handleReset}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#991b1b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#7f1d1d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#991b1b";
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
