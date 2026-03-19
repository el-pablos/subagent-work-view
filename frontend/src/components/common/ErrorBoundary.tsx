import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  panelName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[ErrorBoundary${this.props.panelName ? ` - ${this.props.panelName}` : ""}]`,
      error,
      errorInfo,
    );
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10"
            aria-hidden="true"
          >
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-white">
            {this.props.panelName
              ? `${this.props.panelName} Error`
              : "Terjadi Kesalahan"}
          </h3>
          <p
            className="mb-4 max-w-[260px] text-xs text-slate-500"
            role="alert"
          >
            {this.state.error?.message ||
              "Komponen ini mengalami error yang tidak terduga"}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex min-h-[36px] items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
