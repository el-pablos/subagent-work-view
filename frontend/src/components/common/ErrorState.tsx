import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  retryCountdown?: number;
}

export function ErrorState({
  error,
  onRetry,
  retryCountdown = 0,
}: ErrorStateProps) {
  const [countdown, setCountdown] = useState(retryCountdown);

  useEffect(() => {
    setCountdown(retryCountdown);
  }, [retryCountdown]);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && retryCountdown > 0) {
      onRetry?.();
    }
  }, [countdown, onRetry, retryCountdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="glass-panel flex flex-col items-center justify-center rounded-xl px-4 py-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10"
        aria-hidden="true"
      >
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <p className="mb-1 text-sm text-red-300">Terjadi Kesalahan</p>
      <p className="mb-4 max-w-[280px] text-xs text-slate-500">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={countdown > 0}
          className="flex min-h-[36px] items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:opacity-50"
          aria-label={
            countdown > 0 ? `Retry dalam ${countdown} detik` : "Coba lagi"
          }
        >
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5",
              countdown > 0 && "animate-spin",
            )}
          />
          {countdown > 0 ? `Retry dalam ${countdown}s` : "Coba Lagi"}
        </button>
      )}
    </motion.div>
  );
}
