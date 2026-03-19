/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "display-2xl": [
          "clamp(2.5rem, 2.02rem + 1.8vw, 4.5rem)",
          {
            lineHeight: "0.95",
            letterSpacing: "-0.05em",
            fontWeight: "800",
          },
        ],
        "display-xl": [
          "clamp(2rem, 1.72rem + 1.05vw, 3.25rem)",
          {
            lineHeight: "1",
            letterSpacing: "-0.04em",
            fontWeight: "700",
          },
        ],
        "heading-xl": [
          "clamp(1.5rem, 1.28rem + 0.85vw, 2.375rem)",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.035em",
            fontWeight: "700",
          },
        ],
        "heading-lg": [
          "clamp(1.25rem, 1.1rem + 0.55vw, 1.75rem)",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.028em",
            fontWeight: "600",
          },
        ],
        "heading-md": [
          "clamp(1.125rem, 1.03rem + 0.32vw, 1.375rem)",
          {
            lineHeight: "1.3",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],
        "body-lg": [
          "clamp(1rem, 0.97rem + 0.18vw, 1.125rem)",
          {
            lineHeight: "1.75",
            letterSpacing: "-0.011em",
            fontWeight: "500",
          },
        ],
        body: [
          "clamp(0.9375rem, 0.915rem + 0.12vw, 1rem)",
          {
            lineHeight: "1.65",
            letterSpacing: "-0.01em",
            fontWeight: "400",
          },
        ],
        "body-sm": [
          "clamp(0.8125rem, 0.8rem + 0.08vw, 0.875rem)",
          {
            lineHeight: "1.55",
            letterSpacing: "0",
            fontWeight: "500",
          },
        ],
        caption: [
          "clamp(0.75rem, 0.74rem + 0.06vw, 0.8125rem)",
          {
            lineHeight: "1.45",
            letterSpacing: "0.02em",
            fontWeight: "500",
          },
        ],
        micro: [
          "0.6875rem",
          {
            lineHeight: "1rem",
            letterSpacing: "0.08em",
            fontWeight: "600",
          },
        ],
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
      colors: {
        // War Room Theme Colors
        slate: {
          950: "#0a0a0f",
        },
        emerald: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        sky: {
          DEFAULT: "#0ea5e9",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        rose: {
          DEFAULT: "#f43f5e",
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        amber: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
    },
  },
  plugins: [],
};
