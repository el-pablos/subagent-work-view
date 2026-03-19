import { useState, useEffect } from "react";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint | "base";
  width: number;
}

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Custom hook for responsive design
 * Returns current breakpoint and helper booleans
 */
export function useResponsive(): ResponsiveState {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine current breakpoint
  let currentBreakpoint: Breakpoint | "base" = "base";
  if (width >= breakpoints["2xl"]) {
    currentBreakpoint = "2xl";
  } else if (width >= breakpoints.xl) {
    currentBreakpoint = "xl";
  } else if (width >= breakpoints.lg) {
    currentBreakpoint = "lg";
  } else if (width >= breakpoints.md) {
    currentBreakpoint = "md";
  } else if (width >= breakpoints.sm) {
    currentBreakpoint = "sm";
  }

  return {
    isMobile: width < breakpoints.md, // < 768px
    isTablet: width >= breakpoints.md && width < breakpoints.lg, // 768px - 1024px
    isDesktop: width >= breakpoints.lg, // >= 1024px
    currentBreakpoint,
    width,
  };
}

export default useResponsive;
