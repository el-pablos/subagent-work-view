import { Variants } from "framer-motion";

/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent motion throughout the app
 */

// ============================================================================
// Basic Animations
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Fade in with delay
 */
export const fadeInDelayed: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.2, ease: "easeOut" },
  },
};

/**
 * Scale in animation (good for modals, cards)
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1], // easeOutCubic
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Scale in with bounce (good for notifications, success states)
 */
export const scaleInBounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// Slide Animations
// ============================================================================

/**
 * Slide in from top
 */
export const slideInFromTop: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide in from bottom
 */
export const slideInFromBottom: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide in from left
 */
export const slideInFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/**
 * Slide in from right
 */
export const slideInFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ============================================================================
// List & Stagger Animations
// ============================================================================

/**
 * Container for staggered children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Fast stagger container (for long lists)
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/**
 * List item animation (use with staggerContainer)
 */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

/**
 * List item with scale (more dramatic)
 */
export const listItemScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// Page Transitions
// ============================================================================

/**
 * Page fade transition
 */
export const pageTransitionFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

/**
 * Page slide transition
 */
export const pageTransitionSlide: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.6, 1],
    },
  },
};

/**
 * Page scale transition
 */
export const pageTransitionScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ============================================================================
// Agent-Specific Animations
// ============================================================================

/**
 * Agent spawn animation (dramatic entrance)
 */
export const agentSpawn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.6,
    },
  },
};

/**
 * Agent terminate animation (fade out with shrink)
 */
export const agentTerminate: Variants = {
  exit: {
    opacity: 0,
    scale: 0,
    rotate: 180,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

/**
 * Agent pulse animation (for active/busy state)
 */
export const agentPulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ============================================================================
// Task & Progress Animations
// ============================================================================

/**
 * Task card entrance
 */
export const taskCardEnter: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * Progress bar fill animation
 */
export const progressFill = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 0.5, ease: "easeOut" },
};

// ============================================================================
// Message & Chat Animations
// ============================================================================

/**
 * Message bubble entrance (slide from left)
 */
export const messageBubbleEnter: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Message bubble exit
 */
export const messageBubbleExit: Variants = {
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * System message (center fade)
 */
export const systemMessage: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// ============================================================================
// Panel Animations
// ============================================================================

/**
 * Panel expand animation
 */
export const panelExpand: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

/**
 * Panel slide in from side
 */
export const panelSlideIn: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// ============================================================================
// Micro-interactions
// ============================================================================

/**
 * Button hover lift
 */
export const buttonHover = {
  hover: {
    y: -2,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2 },
  },
  tap: {
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * Icon rotation on hover
 */
export const iconRotate = {
  hover: {
    rotate: 90,
    transition: { duration: 0.3 },
  },
};

/**
 * Icon spin (for loading states)
 */
export const iconSpin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Shake animation (for errors)
 */
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

/**
 * Bounce animation (for success)
 */
export const bounce: Variants = {
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// Loading States
// ============================================================================

/**
 * Loading skeleton pulse
 */
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Loading spinner rotation
 */
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Dots loading animation
 */
export const dotsLoading = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.1,
      ease: "easeInOut",
    },
  }),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a custom spring transition
 */
export const createSpring = (stiffness = 300, damping = 25) => ({
  type: "spring" as const,
  stiffness,
  damping,
});

/**
 * Create a custom ease transition
 */
export const createEase = (
  duration = 0.3,
  ease: string | number[] = "easeOut",
) => ({
  duration,
  ease,
});

/**
 * Create a stagger transition
 */
export const createStagger = (staggerChildren = 0.1, delayChildren = 0) => ({
  staggerChildren,
  delayChildren,
});
