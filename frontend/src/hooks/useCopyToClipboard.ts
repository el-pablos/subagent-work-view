import { useState, useCallback } from "react";

export interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
  reset: () => void;
}

export function useCopyToClipboard(
  resetDelay: number = 2000,
): UseCopyToClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard API not available");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        // Auto reset after delay
        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);

        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        setIsCopied(false);
        return false;
      }
    },
    [resetDelay],
  );

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return { isCopied, copyToClipboard, reset };
}

export default useCopyToClipboard;
