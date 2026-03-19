import { useState, useCallback, useRef, useEffect } from "react";

interface ScrollShadowState {
  showTop: boolean;
  showBottom: boolean;
  showLeft: boolean;
  showRight: boolean;
}

export function useScrollShadow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shadows, setShadows] = useState<ScrollShadowState>({
    showTop: false,
    showBottom: false,
    showLeft: false,
    showRight: false,
  });

  const updateShadows = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    setShadows({
      showTop: el.scrollTop > 0,
      showBottom: el.scrollTop < el.scrollHeight - el.clientHeight - 1,
      showLeft: el.scrollLeft > 0,
      showRight: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", updateShadows, { passive: true });

    const observer = new ResizeObserver(updateShadows);
    observer.observe(el);
    updateShadows();

    return () => {
      el.removeEventListener("scroll", updateShadows);
      observer.disconnect();
    };
  }, [updateShadows]);

  return { ref, shadows };
}
