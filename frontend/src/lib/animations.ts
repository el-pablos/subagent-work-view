import { type Variants } from "framer-motion";

// Staggered list container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

// List item fade up
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Scale in (for cards, nodes)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, type: "spring", stiffness: 200 },
  },
};

// Slide in from right (for panels)
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
};

// Slide in from bottom (for mobile panels)
export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.2 } },
};

// Pulse glow (for active agents)
export const pulseGlow: Variants = {
  idle: { boxShadow: "0 0 0 0 rgba(34, 211, 238, 0)" },
  active: {
    boxShadow: [
      "0 0 0 0 rgba(34, 211, 238, 0.4)",
      "0 0 20px 10px rgba(34, 211, 238, 0)",
      "0 0 0 0 rgba(34, 211, 238, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

// Status color transition
export const statusTransition = {
  transition: { duration: 0.5, ease: "easeInOut" },
};

// Skeleton shimmer
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};

// Spawn burst (for new agents)
export const spawnBurst: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// Micro-interaction for buttons
export const tapScale = { scale: 0.95, transition: { duration: 0.1 } };
export const hoverScale = { scale: 1.05, transition: { duration: 0.2 } };
